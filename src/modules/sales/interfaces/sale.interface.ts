export interface SaleWithDetails {
  id:             string;
  saleNumber:     string;
  createdAt:      Date;
  subtotal:       any;
  discountAmount: any;
  taxAmount:      any;
  total:          any;
  pointsEarned:   number;
  pointsUsed:     number;
  receiptPath:    string | null;
  user: { firstName: string; lastName: string };
  client?: { name: string; dni: string } | null;
  items: Array<{
    quantity:  number;
    unitPrice: any;
    discount:  any;
    subtotal:  any;
    product: { commercialName: string };
  }>;
}