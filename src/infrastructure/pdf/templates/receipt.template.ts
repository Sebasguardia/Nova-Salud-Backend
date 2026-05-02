export interface ReceiptData {
  saleNumber:     string;
  date:           string;
  userName:       string;
  clientName?:    string;
  clientDni?:     string;
  boticaName:     string;
  ruc:            string;
  address:        string;
  items: Array<{
    name:      string;
    quantity:  number;
    unitPrice: number;
    discount:  number;
    subtotal:  number;
  }>;
  subtotal:       number;
  discountAmount: number;
  taxAmount:      number;
  total:          number;
  pointsEarned:   number;
  pointsUsed:     number;
}