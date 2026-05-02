export interface SalesReportData {
  totalRevenue:   number;
  totalSales:     number;
  averageTicket:  number;
  totalDiscounts: number;
  chartData:      Array<{ label: string; revenue: number; sales: number }>;
}

export interface TopProduct {
  productId:   string;
  name:        string;
  totalQty:    number;
  totalRevenue:number;
}

export interface TopClient {
  clientId:       string;
  name:           string;
  dni:            string;
  totalPurchases: number;
  totalSpent:     number;
}