import { StockStatus } from '../../../utils/stock.utils';
import { ExpiryStatus } from '../../../utils/expiry.utils';

export interface ProductWithStatus {
  id:                string;
  commercialName:    string;
  genericName:       string | null;
  category:          string;
  sku:               string;
  currentStock:      number;
  minimumStock:      number;
  salePrice:         any;
  purchasePrice:     any;
  expirationDate:    Date | null;
  isActive:          boolean;
  stockStatus:       StockStatus;
  expiryStatus:      ExpiryStatus;
}