export type DiscountType = 'PERCENTAGE' | 'FIXED_AMOUNT';
export type DiscountScope = 'PRODUCT' | 'SUBSCRIPTION' | 'BOTH';

export interface DiscountRule {
  id: string;
  name: string;
  code?: string | null;
  discountType: DiscountType;
  scope: DiscountScope;
  fixedAmount?: number | null;
  percentageValue?: number | null;
  minimumPurchase?: number | null;
  minimumQuantity?: number | null;
  startsAt?: string | null;
  endsAt?: string | null;
  usageLimit?: number | null;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
  _count?: {
    applications: number;
  };
}

export interface CreateDiscountRuleInput {
  name: string;
  code?: string | null;
  discountType: DiscountType;
  scope?: DiscountScope;
  fixedAmount?: number | null;
  percentageValue?: number | null;
  minimumPurchase?: number | null;
  minimumQuantity?: number | null;
  startsAt?: string;
  endsAt?: string | null;
  usageLimit?: number | null;
  isActive?: boolean;
}

export type UpdateDiscountRuleInput = Partial<CreateDiscountRuleInput>;
