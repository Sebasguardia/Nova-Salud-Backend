import { DiscountType } from '@prisma/client';

export interface DiscountRuleItem {
  id:         string;
  name:       string;
  type:       DiscountType;
  value:      any;
  condition:  string | null;
  isActive:   boolean;
  priority:   number;
  createdAt:  Date;
  updatedAt:  Date;
}