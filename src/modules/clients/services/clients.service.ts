import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService }      from '../../../infrastructure/database/prisma.service';
import { getPaginationMeta, getSkip } from '../../../utils/pagination.utils';
import { ClientFiltersDto }   from '../dto/client-filters.dto';
import { UpdateClientDto }    from '../dto/update-client.dto';

@Injectable()
export class ClientsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(filters: ClientFiltersDto) {
    const { page = 1, limit = 20, search } = filters;

    const where: any = {
      ...(search && {
        OR: [
          { name:  { contains: search, mode: 'insensitive' } },
          { dni:   { contains: search } },
          { phone: { contains: search } },
        ],
      }),
    };

    const [clients, total] = await Promise.all([
      this.prisma.client.findMany({
        where,
        skip:    getSkip(page, limit),
        take:    limit,
        orderBy: { createdAt: 'desc' },
        include: {
          _count:  { select: { sales: true } },
          sales:   {
            select:  { total: true, createdAt: true },
            orderBy: { createdAt: 'asc' },
          },
        },
      }),
      this.prisma.client.count({ where }),
    ]);

    const data = clients.map((c) => {
      const sales = c.sales ?? [];
      return {
        id:                c.id,
        dni:               c.dni,
        name:              c.name,
        phone:             c.phone,
        email:             c.email,
        pointsBalance:     c.pointsBalance,
        pointsAccumulated: c.pointsAccumulated,
        pointsUsed:        c.pointsUsed,
        createdAt:         c.createdAt,
        totalPurchases:    c._count.sales,
        totalSpent:        sales.reduce((s, sale) => s + parseFloat(sale.total.toString()), 0),
        firstPurchase:     sales.length > 0 ? sales[0].createdAt : null,
        lastPurchase:      sales.length > 0 ? sales[sales.length - 1].createdAt : null,
      };
    });

    return { data, pagination: getPaginationMeta(total, { page, limit }) };
  }

  async findOne(id: string) {
    const client = await this.prisma.client.findUnique({
      where:   { id },
      include: {
        _count: { select: { sales: true } },
        sales:  {
          select:  { total: true, createdAt: true },
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!client) throw new NotFoundException('Cliente no encontrado');

    const sales = client.sales ?? [];
    return {
      ...client,
      totalPurchases: client._count.sales,
      totalSpent:     sales.reduce((s, sale) => s + parseFloat(sale.total.toString()), 0),
      firstPurchase:  sales.length > 0 ? sales[0].createdAt : null,
      lastPurchase:   sales.length > 0 ? sales[sales.length - 1].createdAt : null,
    };
  }

  async findByDni(dni: string) {
    const client = await this.prisma.client.findUnique({ where: { dni } });
    return client ?? null;
  }

  async resolveOrCreate(
    dni: string,
    name?: string,
    phone?: string,
  ): Promise<string> {
    const existing = await this.prisma.client.findUnique({ where: { dni } });
    if (existing) return existing.id;

    const created = await this.prisma.client.create({
      data: { dni, name: name ?? `Cliente ${dni}`, phone },
    });
    return created.id;
  }

  async getPurchaseHistory(id: string, page = 1, limit = 20) {
    const client = await this.prisma.client.findUnique({ where: { id } });
    if (!client) throw new NotFoundException('Cliente no encontrado');

    const where = { clientId: id };

    const [sales, total] = await Promise.all([
      this.prisma.sale.findMany({
        where,
        skip:    getSkip(page, limit),
        take:    limit,
        orderBy: { createdAt: 'desc' },
        include: {
          items: {
            include: { product: { select: { commercialName: true } } },
          },
        },
      }),
      this.prisma.sale.count({ where }),
    ]);

    return {
      data: sales.map((s) => ({
        id:           s.id,
        saleNumber:   s.saleNumber,
        createdAt:    s.createdAt,
        total:        s.total,
        pointsEarned: s.pointsEarned,
        pointsUsed:   s.pointsUsed,
        items:        s.items.map((i) => ({
          productName: i.product.commercialName,
          quantity:    i.quantity,
          unitPrice:   i.unitPrice,
          subtotal:    i.subtotal,
        })),
      })),
      pagination: getPaginationMeta(total, { page, limit }),
    };
  }

  async getPointsSummary(id: string) {
    const client = await this.prisma.client.findUnique({ where: { id } });
    if (!client) throw new NotFoundException('Cliente no encontrado');

    return {
      pointsBalance:     client.pointsBalance,
      pointsAccumulated: client.pointsAccumulated,
      pointsUsed:        client.pointsUsed,
    };
  }

  async update(id: string, dto: UpdateClientDto) {
    const client = await this.prisma.client.findUnique({ where: { id } });
    if (!client) throw new NotFoundException('Cliente no encontrado');

    return this.prisma.client.update({ where: { id }, data: dto });
  }
}