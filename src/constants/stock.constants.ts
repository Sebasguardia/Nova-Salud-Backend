export const STOCK_STATUS = {
  NORMAL:   'normal',
  MEDIUM:   'medium',
  LOW:      'low',
  CRITICAL: 'critical',
} as const;

export const EXPIRY_STATUS = {
  OK:           'ok',
  SOON:         'soon',
  VERY_SOON:    'very_soon',
  EXPIRED:      'expired',
} as const;

export const EXPIRY_WARNING_DAYS  = 30;
export const EXPIRY_CRITICAL_DAYS = 7;