import { CustomerRepository } from "../../domain/repositories/CustomerRepository";
import { RewardRedemptionRepository } from "../../domain/repositories/RewardRedemptionRepository";
import { TransactionRepository } from "../../domain/repositories/TransactionRepository";
import { PointsLedgerService } from "../../domain/services/PointsLedgerService";

export class GetCustomerSummaryUseCase {
  constructor(
    private readonly customerRepository: CustomerRepository,
    private readonly transactionRepository: TransactionRepository,
    private readonly rewardRedemptionRepository: RewardRedemptionRepository,
    private readonly pointsLedgerService: PointsLedgerService
  ) {}

  async execute(input: {
    customerId: string;
    asOf: Date;
  }): Promise<{
    customerId: string;
    tier: string;
    isFrozen: boolean;
    availablePoints: number;
  }> {
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
      input.asOf
    );

    return {
      customerId: customer.id,
      tier: customer.tier,
      isFrozen: customer.isFrozen,
      availablePoints
    };
  }
}
