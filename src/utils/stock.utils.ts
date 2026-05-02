import { STOCK_STATUS } from '../constants/stock.constants';

export type StockStatus = 'normal' | 'medium' | 'low' | 'critical';

export const getStockStatus = (
  current: number,
  minimum: number,
): StockStatus => {
  if (current === 0)                    return STOCK_STATUS.CRITICAL;
  if (current <= minimum * 0.5)         return STOCK_STATUS.LOW;
  if (current <= minimum)               return STOCK_STATUS.MEDIUM;
  return STOCK_STATUS.NORMAL;
};