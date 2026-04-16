import { CustomerRepository } from "../../domain/repositories/CustomerRepository";
import { TransactionRepository } from "../../domain/repositories/TransactionRepository";
import { TierPolicy } from "../../domain/services/TierPolicy";

export class RecalculateVipStatusUseCase {
  constructor(
    private readonly customerRepository: CustomerRepository,
    private readonly transactionRepository: TransactionRepository,
    private readonly tierPolicy: TierPolicy
  ) {}

  async execute(asOf: Date): Promise<{ updatedCustomers: number }> {
    const customers = await this.customerRepository.findAll();
    const periodStart = new Date(asOf);
    periodStart.setMonth(periodStart.getMonth() - 12);

    let updatedCustomers = 0;

    for (const customer of customers) {
      const transactions =
        await this.transactionRepository.findByCustomerIdAndPeriod(
          customer.id,
          periodStart,
          asOf
        );

      const totalSpent = transactions.reduce(
        (total, transaction) => total + transaction.amountCents,
        0
      );

      const nextTier = this.tierPolicy.calculate(totalSpent);
      if (nextTier !== customer.tier) {
        customer.setTier(nextTier);
        updatedCustomers += 1;
      }

      customer.unfreezeIfExpired(asOf);
      await this.customerRepository.update(customer);
    }

    return { updatedCustomers };
  }
}
