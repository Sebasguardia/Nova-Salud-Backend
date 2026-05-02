export interface CalculatedItem {
  productId:  string;
  quantity:   number;
  unitPrice:  number;
  discount:   number;
  subtotal:   number;
  taxApplicable: boolean;
  category:   string;
}

export interface SaleCalculation {
  items:          CalculatedItem[];
  subtotal:       number;
  discountAmount: number;
  taxAmount:      number;
  total:          number;
  pointsEarned:   number;
}