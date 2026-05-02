import { startOfDay, endOfDay, startOfWeek, endOfWeek,
         startOfMonth, endOfMonth, startOfQuarter, endOfQuarter,
         subDays } from 'date-fns';

export type PeriodType = 'today' | 'week' | 'month' | 'quarter' | 'custom';

export const getDateRange = (
  period: PeriodType,
  startDate?: string,
  endDate?: string,
): { start: Date; end: Date } => {
  const now = new Date();

  switch (period) {
    case 'today':
      return { start: startOfDay(now), end: endOfDay(now) };
    case 'week':
      return { start: startOfWeek(now, { weekStartsOn: 1 }), end: endOfWeek(now, { weekStartsOn: 1 }) };
    case 'month':
      return { start: startOfMonth(now), end: endOfMonth(now) };
    case 'quarter':
      return { start: startOfQuarter(now), end: endOfQuarter(now) };
    case 'custom':
      return {
        start: startDate ? startOfDay(new Date(startDate)) : startOfDay(subDays(now, 30)),
        end:   endDate   ? endOfDay(new Date(endDate))     : endOfDay(now),
      };
    default:
      return { start: startOfDay(now), end: endOfDay(now) };
  }
};