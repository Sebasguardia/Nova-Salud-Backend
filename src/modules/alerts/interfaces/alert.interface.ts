export type AlertType = 'stock_critical' | 'stock_low' | 'stock_medium' | 'expiring_soon' | 'very_soon' | 'expired';
export type AlertSeverity = 'critical' | 'high' | 'medium';

export interface AlertItem {
  productId:      string;
  commercialName: string;
  sku:            string;
  alertType:      AlertType;
  severity:       AlertSeverity;
  currentStock:   number;
  minimumStock:   number;
  expirationDate: Date | null;
  stockStatus:    string;
  expiryStatus:   string;
  description:    string;
}