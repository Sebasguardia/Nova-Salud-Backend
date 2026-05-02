import { Injectable } from '@nestjs/common';
import { PrismaService }    from '../../../infrastructure/database/prisma.service';
import { SettingsService }  from '../../settings/services/settings.service';
import { applyDiscountRules, calculateTax, calculatePoints, toNumber }
  from '../../../utils/discount.utils';
import { SaleCalculation, CalculatedItem } from '../interfaces/sale-calculation.interface';
import { CreateSaleItemDto } from '../dto/create-sale-item.dto';

@Injectable()
export class CartCalculatorService {
  constructor(
    private readonly prisma:    PrismaService,
    private readonly settings:  SettingsService,
  ) {}

  async calculate(
    items: CreateSaleItemDto[],
    pointsToUse = 0,
  ): Promise<SaleCalculation> {

    const config = await this.settings.getByKeys([
      'igv_rate', 'points_per_sol', 'points_value',
    ]);

    const igvRate      = parseFloat(config['igv_rate']      ?? '18');
    const pointsPerSol = parseFloat(config['points_per_sol'] ?? '1');
    const pointsValue  = parseFloat(config['points_value']   ?? '0.01');

    // Obtener productos
    const productIds = items.map((i) => i.productId);
    const products   = await this.prisma.product.findMany({
      where: { id: { in: productIds }, isActive: true },
    });

    const calculatedItems: CalculatedItem[] = items.map((item) => {
      const product  = products.find((p) => p.id === item.productId)!;
      const unitPrice = toNumber(product.salePrice);
      const subtotal  = parseFloat((unitPrice * item.quantity).toFixed(2));

      return {
        productId:     item.productId,
        quantity:      item.quantity,
        unitPrice,
        discount:      0,
        subtotal,
        taxApplicable: product.taxApplicable,
        category:      product.category,
      };
    });

    const rawSubtotal = calculatedItems.reduce((s, i) => s + i.subtotal, 0);

    // Reglas de descuento
    const rules          = await this.settings.getActiveDiscountRules();
    const discountAmount = applyDiscountRules(
      calculatedItems,
      rules.map((r) => ({
        type:      r.type,
        value:     toNumber(r.value),
        condition: r.condition,
        isActive:  r.isActive,
        priority:  r.priority,
      })),
      rawSubtotal,
      pointsToUse,
      pointsValue,
    );

    const subtotalAfterDiscount = parseFloat(
      Math.max(0, rawSubtotal - discountAmount).toFixed(2),
    );

    const taxAmount  = calculateTax(calculatedItems, igvRate);
    const total      = parseFloat((subtotalAfterDiscount + taxAmount).toFixed(2));
    const pointsEarned = calculatePoints(total, pointsPerSol);

    return {
      items:          calculatedItems,
      subtotal:       rawSubtotal,
      discountAmount,
      taxAmount,
      total,
      pointsEarned,
    };
  }
}