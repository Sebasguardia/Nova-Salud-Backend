import { addDays, isPast, isBefore } from 'date-fns';
import {
  EXPIRY_STATUS,
  EXPIRY_WARNING_DAYS,
  EXPIRY_CRITICAL_DAYS,
} from '../constants/stock.constants';

export type ExpiryStatus = 'ok' | 'soon' | 'very_soon' | 'expired';

export const getExpiryStatus = (
  expirationDate: Date | null | undefined,
): ExpiryStatus => {
  if (!expirationDate) return EXPIRY_STATUS.OK;

  const date = new Date(expirationDate);

  if (isPast(date))                             return EXPIRY_STATUS.EXPIRED;
  if (isBefore(date, addDays(new Date(), EXPIRY_CRITICAL_DAYS))) return EXPIRY_STATUS.VERY_SOON;
  if (isBefore(date, addDays(new Date(), EXPIRY_WARNING_DAYS)))  return EXPIRY_STATUS.SOON;

  return EXPIRY_STATUS.OK;
};