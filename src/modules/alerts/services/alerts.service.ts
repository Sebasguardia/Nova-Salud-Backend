import { Injectable } from '@nestjs/common';
import { PrismaService }   from '../../../infrastructure/database/prisma.service';
import { getStockStatus }  from '../../../utils/stock.utils';
import { getExpiryStatus } from '../../../utils/expiry.utils';
import { AlertItem, AlertType, AlertSeverity } from '../interfaces/alert.interface';

@Injectable()
export class AlertsService {
  constructor(private readonly prisma: PrismaService) {}

  async getAll(): Promise<AlertItem[]> {
    const products = await this.prisma.product.findMany({
      where: { isActive: true },
      select: {
        id: true, commercialName: true, sku: true,
        currentStock: true, minimumStock: true, expirationDate: true,
      },
    });

    const alerts: AlertItem[] = [];

    for (const p of products) {
      const stockStatus  = getStockStatus(p.currentStock, p.minimumStock);
      const expiryStatus = getExpiryStatus(p.expirationDate);

      if (stockStatus !== 'normal') {
        alerts.push({
          productId:      p.id,
          commercialName: p.commercialName,
          sku:            p.sku,
          alertType:      this.getStockAlertType(stockStatus),
          severity:       this.getStockSeverity(stockStatus),
          currentStock:   p.currentStock,
          minimumStock:   p.minimumStock,
          expirationDate: p.expirationDate,
          stockStatus,
          expiryStatus,
          description:    this.getStockDescription(p.commercialName, p.currentStock, stockStatus),
        });
      } else if (expiryStatus !== 'ok') {
        alerts.push({
          productId:      p.id,
          commercialName: p.commercialName,
          sku:            p.sku,
          alertType:      this.getExpiryAlertType(expiryStatus),
          severity:       this.getExpirySeverity(expiryStatus),
          currentStock:   p.currentStock,
          minimumStock:   p.minimumStock,
          expirationDate: p.expirationDate,
          stockStatus,
          expiryStatus,
          description:    this.getExpiryDescription(p.commercialName, p.expirationDate, expiryStatus),
        });
      }
    }

    return alerts.sort((a, b) => {
      const order: Record<AlertSeverity, number> = { critical: 0, high: 1, medium: 2 };
      return order[a.severity] - order[b.severity];
    });
  }

  async getStockAlerts() {
    const all = await this.getAll();
    return all.filter((a) =>
      ['stock_critical', 'stock_low', 'stock_medium'].includes(a.alertType),
    );
  }

  async getExpiryAlerts() {
    const all = await this.getAll();
    return all.filter((a) =>
      ['expired', 'very_soon', 'expiring_soon'].includes(a.alertType),
    );
  }

  async getCount(): Promise<{ count: number; critical: number }> {
    const all      = await this.getAll();
    const critical = all.filter((a) => a.severity === 'critical').length;
    return { count: all.length, critical };
  }

  private getStockAlertType(status: string): AlertType {
    if (status === 'critical') return 'stock_critical';
    if (status === 'low')      return 'stock_low';
    return 'stock_medium';
  }

  private getStockSeverity(status: string): AlertSeverity {
    if (status === 'critical') return 'critical';
    if (status === 'low')      return 'high';
    return 'medium';
  }

  private getExpiryAlertType(status: string): AlertType {
    if (status === 'expired')   return 'expired';
    if (status === 'very_soon') return 'very_soon';
    return 'expiring_soon';
  }

  private getExpirySeverity(status: string): AlertSeverity {
    if (status === 'expired')   return 'critical';
    if (status === 'very_soon') return 'high';
    return 'medium';
  }

  private getStockDescription(name: string, stock: number, status: string): string {
    if (status === 'critical') return `${name}: Sin stock disponible`;
    if (status === 'low')      return `${name}: Stock crítico (${stock} unidades)`;
    return `${name}: Stock bajo (${stock} unidades)`;
  }

  private getExpiryDescription(name: string, date: Date | null, status: string): string {
    const dateStr = date ? new Date(date).toLocaleDateString('es-PE') : '';
    if (status === 'expired')   return `${name}: Producto vencido (${dateStr})`;
    if (status === 'very_soon') return `${name}: Vence en menos de 7 días (${dateStr})`;
    return `${name}: Vence pronto (${dateStr})`;
  }
}