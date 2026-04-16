import { LoyaltyTier } from "../entities/Customer";
import { TierPolicy } from "./TierPolicy";

export class DefaultTierPolicy implements TierPolicy {
  calculate(totalSpentInLast12MonthsCents: number): LoyaltyTier {
    if (totalSpentInLast12MonthsCents >= 200_000) {
      return "GOLD";
    }

    if (totalSpentInLast12MonthsCents >= 50_000) {
      return "SILVER";
    }

    return "BRONZE";
  }
}
