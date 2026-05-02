import {
  Injectable, ConflictException, NotFoundException,
} from '@nestjs/common';
import { PrismaService }      from '../../../infrastructure/database/prisma.service';
import { AuditService }       from '../../audit/services/audit.service';
import { getStockStatus }     from '../../../utils/stock.utils';
import { getExpiryStatus }    from '../../../utils/expiry.utils';
import { getPaginationMeta, getSkip } from '../../../utils/pagination.utils';
import { CreateProductDto }   from '../dto/create-product.dto';
import { UpdateProductDto }   from '../dto/update-product.dto';
import { ProductFiltersDto }  from '../dto/product-filters.dto';

@Injectable()
export class InventoryService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit:  AuditService,
  ) {}

  async findAll(filters: ProductFiltersDto) {
    const {
      page = 1, limit = 20,
      search, category, pharmaceuticalForm,
      laboratory, sortBy,
    } = filters;

    const where: any = {
      isActive: true,
      ...(search && {
        OR: [
          { commercialName: { contains: search, mode: 'insensitive' } },
          { genericName:    { contains: search, mode: 'insensitive' } },
          { sku:            { contains: search, mode: 'insensitive' } },
          { barcode:        { equals:   search } },
        ],
      }),
      ...(category           && { category }),
      ...(pharmaceuticalForm  && { pharmaceuticalForm }),
      ...(laboratory          && { laboratory }),
    };

    const orderBy: any = sortBy ? { [sortBy]: 'asc' } : { commercialName: 'asc' };

    const [products, total] = await Promise.all([
      this.prisma.product.findMany({ where, skip: getSkip(page, limit), take: limit, orderBy }),
      this.prisma.product.count({ where }),
    ]);

    let result = products.map((p) => ({
      ...p,
      stockStatus:  getStockStatus(p.currentStock, p.minimumStock),
      expiryStatus: getExpiryStatus(p.expirationDate),
    }));

    if (filters.stockStatus) result = result.filter((p) => p.stockStatus === filters.stockStatus);
    if (filters.expiryStatus) result = result.filter((p) => p.expiryStatus === filters.expiryStatus);

    return { data: result, pagination: getPaginationMeta(total, { page, limit }) };
  }

  async findOne(id: string) {
    const product = await this.prisma.product.findUnique({ where: { id } });
    if (!product || !product.isActive) throw new NotFoundException('Producto no encontrado');
    return {
      ...product,
      stockStatus:  getStockStatus(product.currentStock, product.minimumStock),
      expiryStatus: getExpiryStatus(product.expirationDate),
    };
  }

  async findByBarcode(barcode: string) {
    const product = await this.prisma.product.findUnique({ where: { barcode } });
    if (!product || !product.isActive) throw new NotFoundException('Producto no encontrado con ese código de barras');
    return {
      ...product,
      stockStatus:  getStockStatus(product.currentStock, product.minimumStock),
      expiryStatus: getExpiryStatus(product.expirationDate),
    };
  }

  async create(dto: CreateProductDto, userId: string) {
    const existingSku = await this.prisma.product.findUnique({ where: { sku: dto.sku } });
    if (existingSku) throw new ConflictException('El SKU ya está registrado');

    if (dto.barcode) {
      const existingBarcode = await this.prisma.product.findUnique({ where: { barcode: dto.barcode } });
      if (existingBarcode) throw new ConflictException('El código de barras ya está registrado');
    }

    const data: any = { ...dto };
    if (dto.expirationDate) data.expirationDate = new Date(dto.expirationDate).toISOString();

    const product = await this.prisma.product.create({ data });

    this.audit.log({
      userId,
      module:      'inventory',
      action:      'create',
      entityId:    product.id,
      entityName:  product.commercialName,
      description: `Producto creado: ${product.commercialName} (SKU: ${product.sku})`,
      after:       { id: product.id, commercialName: product.commercialName, sku: product.sku, currentStock: product.currentStock },
    });

    return product;
  }

  async update(id: string, dto: UpdateProductDto, userId: string) {
    const product = await this.prisma.product.findUnique({ where: { id } });
    if (!product) throw new NotFoundException('Producto no encontrado');

    if (dto.sku && dto.sku !== product.sku) {
      const existing = await this.prisma.product.findUnique({ where: { sku: dto.sku } });
      if (existing) throw new ConflictException('El SKU ya está en uso');
    }

    const data: any = { ...dto };
    if (dto.expirationDate) data.expirationDate = new Date(dto.expirationDate).toISOString();

    const updated = await this.prisma.product.update({ where: { id }, data });

    this.audit.log({
      userId,
      module:      'inventory',
      action:      'update',
      entityId:    id,
      entityName:  product.commercialName,
      description: `Producto actualizado: ${product.commercialName}`,
      before:      { commercialName: product.commercialName, salePrice: product.salePrice, currentStock: product.currentStock },
      after:       { commercialName: updated.commercialName, salePrice: updated.salePrice, currentStock: updated.currentStock },
    });

    return updated;
  }

  async softDelete(id: string, userId: string) {
    const product = await this.prisma.product.findUnique({ where: { id } });
    if (!product) throw new NotFoundException('Producto no encontrado');

    await this.prisma.product.update({ where: { id }, data: { isActive: false } });

    this.audit.log({
      userId,
      module:      'inventory',
      action:      'delete',
      entityId:    id,
      entityName:  product.commercialName,
      description: `Producto eliminado: ${product.commercialName} (SKU: ${product.sku})`,
      before:      { isActive: true },
      after:       { isActive: false },
    });

    return { message: 'Producto eliminado correctamente' };
  }

  async getAlerts() {
    const products = await this.prisma.product.findMany({
      where:  { isActive: true },
      select: { id: true, commercialName: true, sku: true, currentStock: true, minimumStock: true, expirationDate: true },
    });

    return products
      .map((p) => ({
        ...p,
        stockStatus:  getStockStatus(p.currentStock, p.minimumStock),
        expiryStatus: getExpiryStatus(p.expirationDate),
      }))
      .filter((p) => p.stockStatus !== 'normal' || p.expiryStatus !== 'ok')
      .sort((a, b) => {
        const order: Record<string, number> = { critical: 0, low: 1, medium: 2, normal: 3 };
        return (order[a.stockStatus] ?? 3) - (order[b.stockStatus] ?? 3);
      });
  }

  async updateStock(id: string, quantity: number) {
    return this.prisma.product.update({ where: { id }, data: { currentStock: { decrement: quantity } } });
  }
}