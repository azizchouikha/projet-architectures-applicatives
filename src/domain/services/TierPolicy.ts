import { LoyaltyTier } from "../entities/Customer";

export interface TierPolicy {
  calculate(totalSpentInLast12MonthsCents: number): LoyaltyTier;
}
