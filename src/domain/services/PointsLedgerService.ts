import { PurchaseTransaction } from "../entities/PurchaseTransaction";
import { RewardRedemption } from "../entities/RewardRedemption";

export class PointsLedgerService {
  getAvailablePoints(
    transactions: PurchaseTransaction[],
    redemptions: RewardRedemption[],
    asOf: Date
  ): number {
    const earned = transactions
      .filter((transaction) => transaction.expiresAt > asOf)
      .reduce((total, transaction) => total + transaction.pointsEarned, 0);

    const spent = redemptions
      .filter((redemption) => redemption.redeemedAt <= asOf)
      .reduce((total, redemption) => total + redemption.pointsSpent, 0);

    return Math.max(0, earned - spent);
  }
}
