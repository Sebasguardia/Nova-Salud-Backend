export interface ClientHistoryItem {
  id:          string;
  saleNumber:  string;
  createdAt:   Date;
  total:       any;
  pointsEarned:number;
  pointsUsed:  number;
  items: Array<{
    productName: string;
    quantity:    number;
    unitPrice:   any;
    subtotal:    any;
  }>;
}