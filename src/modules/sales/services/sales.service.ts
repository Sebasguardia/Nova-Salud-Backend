import {
  Injectable, BadRequestException, NotFoundException,
} from '@nestjs/common';
import * as path from 'path';
import * as fs   from 'fs';
import { PrismaService }        from '../../../infrastructure/database/prisma.service';
import { ClientsService }       from '../../clients/services/clients.service';
import { SettingsService }      from '../../settings/services/settings.service';
import { PdfService }           from '../../../infrastructure/pdf/pdf.service';
import { CartCalculatorService } from './cart-calculator.service';
import { getPaginationMeta, getSkip } from '../../../utils/pagination.utils';
import { CreateSaleDto }        from '../dto/create-sale.dto';
import { SaleFiltersDto }       from '../dto/sale-filters.dto';
import { AuditService } from '../../audit/services/audit.service';

@Injectable()
export class SalesService {
  constructor(
    private readonly prisma:      PrismaService,
    private readonly clients:     ClientsService,
    private readonly settings:    SettingsService,
    private readonly calculator:  CartCalculatorService,
    private readonly pdf:         PdfService,
    private readonly audit:       AuditService,
  ) {}

  async create(dto: CreateSaleDto, userId: string) {
    // 1. Validar stock
    for (const item of dto.items) {
      const product = await this.prisma.product.findUnique({
        where: { id: item.productId },
      });
      if (!product || !product.isActive) {
        throw new BadRequestException(`Producto ${item.productId} no encontrado`);
      }
      if (product.currentStock < item.quantity) {
        throw new BadRequestException(
          `Stock insuficiente para "${product.commercialName}". Disponible: ${product.currentStock}`,
        );
      }
    }

    // 2. Calcular totales
    const calculation = await this.calculator.calculate(
      dto.items,
      dto.pointsToUse ?? 0,
    );

    // 3. Resolver cliente
    let clientId: string | null = null;
    if (dto.clientDni) {
      clientId = await this.clients.resolveOrCreate(
        dto.clientDni,
        dto.clientName,
        dto.clientPhone,
      );
    }

    // 4. Verificar puntos del cliente
    if (dto.pointsToUse && clientId) {
      const client = await this.prisma.client.findUnique({
        where: { id: clientId },
      });
      if (client && client.pointsBalance < dto.pointsToUse) {
        throw new BadRequestException('El cliente no tiene suficientes puntos');
      }
    }

    // 5. Transacción
    const sale = await this.prisma.$transaction(async (tx) => {
      // Número correlativo
      const count      = await tx.sale.count();
      const saleNumber = `VTA-${String(count + 1).padStart(6, '0')}`;

      // Crear venta
      const newSale = await tx.sale.create({
        data: {
          saleNumber,
          userId,
          clientId,
          subtotal:       calculation.subtotal,
          discountAmount: calculation.discountAmount,
          taxAmount:      calculation.taxAmount,
          total:          calculation.total,
          pointsEarned:   calculation.pointsEarned,
          pointsUsed:     dto.pointsToUse ?? 0,
          notes:          dto.notes,
          items: {
            create: calculation.items.map((item) => ({
              productId: item.productId,
              quantity:  item.quantity,
              unitPrice: item.unitPrice,
              discount:  item.discount,
              subtotal:  item.subtotal,
            })),
          },
        },
        include: {
          items:  { include: { product: true } },
          user:   { select: { firstName: true, lastName: true } },
          client: { select: { name: true, dni: true } },
        },
      });

      // Descontar stock
      for (const item of dto.items) {
        await tx.product.update({
          where: { id: item.productId },
          data:  { currentStock: { decrement: item.quantity } },
        });
      }

      // Actualizar puntos del cliente
      if (clientId) {
        await tx.client.update({
          where: { id: clientId },
          data: {
            pointsBalance:     {
              increment: calculation.pointsEarned - (dto.pointsToUse ?? 0),
            },
            pointsAccumulated: { increment: calculation.pointsEarned },
            pointsUsed:        { increment: dto.pointsToUse ?? 0 },
          },
        });
      }

      return newSale;
    });

    this.audit.log({
      userId,
      module:      'sales',
      action:      'create',
      entityId:    sale.id,
      entityName:  sale.saleNumber,
      description: `Venta registrada: ${sale.saleNumber} — Total: S/. ${sale.total}`,
      after: {
        saleNumber: sale.saleNumber,
        total:      sale.total,
        items:      dto.items.length,
        clientDni:  dto.clientDni ?? null,
      },
    });

    // 6. Generar PDF fuera de la transacción
    try {
      const config = await this.settings.getByKeys([
        'botica_name', 'ruc', 'address',
      ]);

      const receiptFileName = await this.pdf.generateReceipt({
        saleNumber:     sale.saleNumber,
        date:           new Date(sale.createdAt).toLocaleString('es-PE'),
        userName:       `${sale.user.firstName} ${sale.user.lastName}`,
        clientName:     sale.client?.name,
        clientDni:      sale.client?.dni,
        boticaName:     config['botica_name'] ?? 'Botica',
        ruc:            config['ruc']          ?? '',
        address:        config['address']      ?? '',
        items:          sale.items.map((i) => ({
          name:      i.product.commercialName,
          quantity:  i.quantity,
          unitPrice: parseFloat(i.unitPrice.toString()),
          discount:  parseFloat(i.discount.toString()),
          subtotal:  parseFloat(i.subtotal.toString()),
        })),
        subtotal:       parseFloat(sale.subtotal.toString()),
        discountAmount: parseFloat(sale.discountAmount.toString()),
        taxAmount:      parseFloat(sale.taxAmount.toString()),
        total:          parseFloat(sale.total.toString()),
        pointsEarned:   sale.pointsEarned,
        pointsUsed:     sale.pointsUsed,
      });

      await this.prisma.sale.update({
        where: { id: sale.id },
        data:  { receiptPath: receiptFileName },
      });

      return { ...sale, receiptPath: receiptFileName };
    } catch {
      return sale;
    }
  }

  async findAll(filters: SaleFiltersDto) {
    const { page = 1, limit = 20, startDate, endDate, userId, clientId } = filters;

    const where: any = {
      ...(userId   && { userId }),
      ...(clientId && { clientId }),
      ...((startDate || endDate) && {
        createdAt: {
          ...(startDate && { gte: new Date(startDate) }),
          ...(endDate   && { lte: new Date(endDate) }),
        },
      }),
    };

    const [sales, total] = await Promise.all([
      this.prisma.sale.findMany({
        where,
        skip:    getSkip(page, limit),
        take:    limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user:   { select: { firstName: true, lastName: true } },
          client: { select: { name: true, dni: true } },
          items:  { include: { product: { select: { commercialName: true } } } },
        },
      }),
      this.prisma.sale.count({ where }),
    ]);

    return { data: sales, pagination: getPaginationMeta(total, { page, limit }) };
  }

  async findOne(id: string) {
    const sale = await this.prisma.sale.findUnique({
      where:   { id },
      include: {
        user:   { select: { firstName: true, lastName: true } },
        client: { select: { name: true, dni: true } },
        items:  { include: { product: { select: { commercialName: true, sku: true } } } },
      },
    });
    if (!sale) throw new NotFoundException('Venta no encontrada');
    return sale;
  }

  async getReceipt(id: string): Promise<{ filePath: string; fileName: string }> {
    const sale = await this.prisma.sale.findUnique({ where: { id } });
    if (!sale) throw new NotFoundException('Venta no encontrada');
    if (!sale.receiptPath) throw new NotFoundException('Comprobante no disponible');

    const uploadsDir = process.env.UPLOADS_DIR ?? './uploads';
    const filePath   = path.join(uploadsDir, 'receipts', sale.receiptPath);

    if (!fs.existsSync(filePath)) {
      throw new NotFoundException('Archivo de comprobante no encontrado');
    }

    return { filePath, fileName: sale.receiptPath };
  }

  async getDailySummary() {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const end = new Date();
    end.setHours(23, 59, 59, 999);

    const sales = await this.prisma.sale.findMany({
      where: { createdAt: { gte: start, lte: end } },
      select: { total: true },
    });

    const totalRevenue   = sales.reduce((s, sale) => s + parseFloat(sale.total.toString()), 0);
    const totalSales     = sales.length;
    const averageTicket  = totalSales > 0 ? totalRevenue / totalSales : 0;

    return {
      totalRevenue:  parseFloat(totalRevenue.toFixed(2)),
      totalSales,
      averageTicket: parseFloat(averageTicket.toFixed(2)),
      date:          start.toISOString().split('T')[0],
    };
  }
}