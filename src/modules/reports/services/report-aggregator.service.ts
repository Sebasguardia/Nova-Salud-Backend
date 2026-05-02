import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../infrastructure/database/prisma.service';
import { getDateRange, PeriodType } from '../../../utils/date.utils';

@Injectable()
export class ReportAggregatorService {
  constructor(private readonly prisma: PrismaService) {}

  async getSalesSummary(startDate: Date, endDate: Date, userId?: string) {
    const where: any = {
      createdAt: { gte: startDate, lte: endDate },
      ...(userId && { userId }),
    };

    const sales = await this.prisma.sale.findMany({
      where,
      select: {
        total:          true,
        discountAmount: true,
        createdAt:      true,
      },
    });

    const totalRevenue   = sales.reduce((s, sale) => s + parseFloat(sale.total.toString()), 0);
    const totalDiscounts = sales.reduce((s, sale) => s + parseFloat(sale.discountAmount.toString()), 0);
    const totalSales     = sales.length;
    const averageTicket  = totalSales > 0 ? totalRevenue / totalSales : 0;

    return {
      totalRevenue:   parseFloat(totalRevenue.toFixed(2)),
      totalSales,
      averageTicket:  parseFloat(averageTicket.toFixed(2)),
      totalDiscounts: parseFloat(totalDiscounts.toFixed(2)),
      chartData:      this.groupByDay(sales),
    };
  }

  async getTopProducts(startDate: Date, endDate: Date, take = 10) {
    const items = await this.prisma.saleItem.findMany({
      where: { sale: { createdAt: { gte: startDate, lte: endDate } } },
      include: { product: { select: { commercialName: true } } },
    });

    const grouped: Record<string, { name: string; qty: number; revenue: number }> = {};

    for (const item of items) {
      if (!grouped[item.productId]) {
        grouped[item.productId] = {
          name:    item.product.commercialName,
          qty:     0,
          revenue: 0,
        };
      }
      grouped[item.productId].qty     += item.quantity;
      grouped[item.productId].revenue += parseFloat(item.subtotal.toString());
    }

    return Object.entries(grouped)
      .map(([productId, data]) => ({
        productId,
        name:         data.name,
        totalQty:     data.qty,
        totalRevenue: parseFloat(data.revenue.toFixed(2)),
      }))
      .sort((a, b) => b.totalQty - a.totalQty)
      .slice(0, take);
  }

  async getInventoryStatus() {
    const products = await this.prisma.product.findMany({
      where: { isActive: true },
      select: { currentStock: true, minimumStock: true },
    });

    let normal = 0, medium = 0, low = 0, critical = 0;

    for (const p of products) {
      if (p.currentStock === 0)                    critical++;
      else if (p.currentStock <= p.minimumStock * 0.5) low++;
      else if (p.currentStock <= p.minimumStock)   medium++;
      else                                          normal++;
    }

    return { total: products.length, normal, medium, low, critical };
  }

  async getTopClients(startDate: Date, endDate: Date, take = 10) {
    const sales = await this.prisma.sale.findMany({
      where: {
        createdAt: { gte: startDate, lte: endDate },
        clientId:  { not: null },
      },
      include: { client: { select: { name: true, dni: true } } },
    });

    const grouped: Record<string, { name: string; dni: string; count: number; spent: number }> = {};

    for (const sale of sales) {
      if (!sale.clientId || !sale.client) continue;
      if (!grouped[sale.clientId]) {
        grouped[sale.clientId] = {
          name:  sale.client.name,
          dni:   sale.client.dni,
          count: 0,
          spent: 0,
        };
      }
      grouped[sale.clientId].count++;
      grouped[sale.clientId].spent += parseFloat(sale.total.toString());
    }

    return Object.entries(grouped)
      .map(([clientId, data]) => ({
        clientId,
        name:           data.name,
        dni:            data.dni,
        totalPurchases: data.count,
        totalSpent:     parseFloat(data.spent.toFixed(2)),
      }))
      .sort((a, b) => b.totalSpent - a.totalSpent)
      .slice(0, take);
  }

  async getPointsSummary(startDate: Date, endDate: Date) {
    const sales = await this.prisma.sale.findMany({
      where: { createdAt: { gte: startDate, lte: endDate } },
      select: { pointsEarned: true, pointsUsed: true },
    });

    return {
      totalEarned: sales.reduce((s, sale) => s + sale.pointsEarned, 0),
      totalUsed:   sales.reduce((s, sale) => s + sale.pointsUsed,   0),
    };
  }

  private groupByDay(sales: Array<{ total: any; createdAt: Date }>) {
    const grouped: Record<string, { revenue: number; sales: number }> = {};

    for (const sale of sales) {
      const label = new Date(sale.createdAt).toISOString().split('T')[0];
      if (!grouped[label]) grouped[label] = { revenue: 0, sales: 0 };
      grouped[label].revenue += parseFloat(sale.total.toString());
      grouped[label].sales++;
    }

    return Object.entries(grouped)
      .map(([label, data]) => ({
        label,
        revenue: parseFloat(data.revenue.toFixed(2)),
        sales:   data.sales,
      }))
      .sort((a, b) => a.label.localeCompare(b.label));
  }

  parseDateRange(filters: { period?: string; startDate?: string; endDate?: string }) {
    return getDateRange(
      (filters.period as PeriodType) ?? 'month',
      filters.startDate,
      filters.endDate,
    );
  }
}