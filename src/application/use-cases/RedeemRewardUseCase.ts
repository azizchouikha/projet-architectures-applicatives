import { randomUUID } from "node:crypto";
import { RewardRedemption } from "../../domain/entities/RewardRedemption";
import { CustomerRepository } from "../../domain/repositories/CustomerRepository";
import { RewardRedemptionRepository } from "../../domain/repositories/RewardRedemptionRepository";
import { TransactionRepository } from "../../domain/repositories/TransactionRepository";
import { PointsLedgerService } from "../../domain/services/PointsLedgerService";

export class RedeemRewardUseCase {
  constructor(
    private readonly customerRepository: CustomerRepository,
    private readonly transactionRepository: TransactionRepository,
    private readonly rewardRedemptionRepository: RewardRedemptionRepository,
    private readonly pointsLedgerService: PointsLedgerService
  ) {}

  async execute(input: {
    customerId: string;
    rewardCode: string;
    pointsCost: number;
    redeemedAt: Date;
  }): Promise<{ redemptionId: string; remainingPoints: number }> {
    const customer = await this.customerRepository.findById(input.customerId);
    if (!customer) {
      throw new Error("Client introuvable.");
    }

    const [transactions, redemptions] = await Promise.all([
      this.transactionRepository.findByCustomerId(input.customerId),
      this.rewardRedemptionRepository.findByCustomerId(input.customerId)
    ]);

    const availablePoints = this.pointsLedgerService.getAvailablePoints(
      transactions,
      redemptions,
      input.redeemedAt
    );

    if (availablePoints < input.pointsCost) {
      throw new Error("Solde de points insuffisant.");
    }

    const redemption = RewardRedemption.create({
      id: randomUUID(),
      customerId: input.customerId,
      rewardCode: input.rewardCode,
      pointsSpent: input.pointsCost,
      redeemedAt: input.redeemedAt
    });

    await this.rewardRedemptionRepository.create(redemption);

    return {
      redemptionId: redemption.toJSON().id,
      remainingPoints: availablePoints - input.pointsCost
    };
  }
}
