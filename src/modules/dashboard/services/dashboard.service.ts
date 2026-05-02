import { Injectable } from '@nestjs/common';
import { PrismaService }   from '../../../infrastructure/database/prisma.service';
import { AlertsService }   from '../../alerts/services/alerts.service';
import { getStockStatus }  from '../../../utils/stock.utils';

@Injectable()
export class DashboardService {
  constructor(
    private readonly prisma:  PrismaService,
    private readonly alerts:  AlertsService,
  ) {}

  async getStats() {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const end = new Date();
    end.setHours(23, 59, 59, 999);

    const [todaySales, alertsCount, products] = await Promise.all([
      this.prisma.sale.findMany({
        where:  { createdAt: { gte: start, lte: end } },
        select: { total: true },
      }),
      this.alerts.getCount(),
      this.prisma.product.count({ where: { isActive: true } }),
    ]);

    const todayRevenue  = todaySales.reduce((s, sale) => s + parseFloat(sale.total.toString()), 0);
    const averageTicket = todaySales.length > 0 ? todayRevenue / todaySales.length : 0;

    const lowStockProducts = await this.prisma.product.findMany({
      where:  { isActive: true },
      select: { currentStock: true, minimumStock: true },
    });
    const lowStockCount = lowStockProducts.filter(
      (p) => getStockStatus(p.currentStock, p.minimumStock) !== 'normal',
    ).length;

    return {
      todaySales:     todaySales.length,
      todayRevenue:   parseFloat(todayRevenue.toFixed(2)),
      averageTicket:  parseFloat(averageTicket.toFixed(2)),
      alertsCount:    alertsCount.count,
      criticalAlerts: alertsCount.critical,
      totalProducts:  products,
      lowStockCount,
    };
  }

  async getRevenueChart() {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const sales = await this.prisma.sale.findMany({
      where:  { createdAt: { gte: sevenDaysAgo } },
      select: { total: true, createdAt: true },
    });

    const grouped: Record<string, number> = {};

    for (let i = 6; i >= 0; i--) {
      const date  = new Date();
      date.setDate(date.getDate() - i);
      const label = date.toISOString().split('T')[0];
      grouped[label] = 0;
    }

    for (const sale of sales) {
      const label = new Date(sale.createdAt).toISOString().split('T')[0];
      if (grouped[label] !== undefined) {
        grouped[label] += parseFloat(sale.total.toString());
      }
    }

    return Object.entries(grouped).map(([label, revenue]) => ({
      label,
      revenue: parseFloat(revenue.toFixed(2)),
    }));
  }
}