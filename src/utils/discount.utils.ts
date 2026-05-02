import { Decimal } from '@prisma/client/runtime/library';

export interface CartItemInput {
  productId: string;
  quantity: number;
  unitPrice: number;
  taxApplicable: boolean;
  category?: string;
}

export interface DiscountRuleInput {
  type: string;
  value: number;
  condition?: string | null;
  isActive: boolean;
  priority: number;
}

export interface CartCalculation {
  items: Array<{
    productId: string;
    quantity: number;
    unitPrice: number;
    discount: number;
    subtotal: number;
  }>;
  subtotal: number;
  discountAmount: number;
  taxAmount: number;
  total: number;
  pointsEarned: number;
}

export const toNumber = (value: Decimal | number): number =>
  typeof value === 'object' ? parseFloat(value.toString()) : value;

export const applyDiscountRules = (
  items: CartItemInput[],
  rules: DiscountRuleInput[],
  cartTotal: number,
  pointsToUse: number = 0,
  pointsValue: number = 0.01,
): number => {
  let totalDiscount = 0;

  const activeRules = rules
    .filter((r) => r.isActive)
    .sort((a, b) => b.priority - a.priority);

  for (const rule of activeRules) {
    let condition: Record<string, any> = {};

    try {
      condition = rule.condition ? JSON.parse(rule.condition) : {};
    } catch {
      continue;
    }

    switch (rule.type) {
      case 'PERCENTAGE':
        totalDiscount += (cartTotal * rule.value) / 100;
        break;

      case 'FIXED_AMOUNT':
        totalDiscount += rule.value;
        break;

      case 'BY_MINIMUM_AMOUNT':
        if (cartTotal >= (condition.minimumAmount ?? 0)) {
          totalDiscount += (cartTotal * rule.value) / 100;
        }
        break;

      case 'BY_QUANTITY':
        for (const item of items) {
          if (
            item.productId === condition.productId &&
            item.quantity >= (condition.minimumQuantity ?? 1)
          ) {
            totalDiscount += (item.unitPrice * item.quantity * rule.value) / 100;
          }
        }
        break;

      case 'BY_CATEGORY':
        for (const item of items) {
          if (item.category === condition.category) {
            totalDiscount += (item.unitPrice * item.quantity * rule.value) / 100;
          }
        }
        break;

      case 'BY_PRODUCT':
        for (const item of items) {
          if (item.productId === condition.productId) {
            totalDiscount += (item.unitPrice * item.quantity * rule.value) / 100;
          }
        }
        break;

      case 'BY_LOYALTY_POINTS':
        if (pointsToUse > 0) {
          totalDiscount += pointsToUse * pointsValue;
        }
        break;
    }
  }

  return parseFloat(Math.min(totalDiscount, cartTotal).toFixed(2));
};

export const calculateTax = (
  items: CartItemInput[],
  taxRate: number,
): number => {
  const taxableSubtotal = items
    .filter((i) => i.taxApplicable)
    .reduce((sum, i) => sum + i.unitPrice * i.quantity, 0);

  return parseFloat(((taxableSubtotal * taxRate) / 100).toFixed(2));
};

export const calculatePoints = (
  total: number,
  pointsPerSol: number,
): number => {
  return Math.floor(total * pointsPerSol);
};