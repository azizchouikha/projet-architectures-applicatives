import { PurchaseTransaction } from "../entities/PurchaseTransaction";

export interface TransactionRepository {
  create(transaction: PurchaseTransaction): Promise<void>;
  findByCustomerId(customerId: string): Promise<PurchaseTransaction[]>;
  findByCustomerIdAndPeriod(
    customerId: string,
    periodStart: Date,
    periodEnd: Date
  ): Promise<PurchaseTransaction[]>;
}
