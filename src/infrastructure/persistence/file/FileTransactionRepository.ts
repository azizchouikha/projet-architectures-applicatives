import { PurchaseTransaction } from "../../../domain/entities/PurchaseTransaction";
import { TransactionRepository } from "../../../domain/repositories/TransactionRepository";
import { FileDatabase } from "./FileDatabase";

export class FileTransactionRepository implements TransactionRepository {
  constructor(private readonly db: FileDatabase) {}

  async create(transaction: PurchaseTransaction): Promise<void> {
    const state = this.db.read();
    state.transactions.push({
      ...transaction.toJSON(),
      occurredAt: transaction.occurredAt.toISOString(),
      expiresAt: transaction.expiresAt.toISOString()
    });
    this.db.write(state);
  }

  async findByCustomerId(customerId: string): Promise<PurchaseTransaction[]> {
    const state = this.db.read();
    return state.transactions
      .filter((record) => record.customerId === customerId)
      .map((record) =>
        PurchaseTransaction.fromPersistence({
          ...record,
          occurredAt: new Date(record.occurredAt),
          expiresAt: new Date(record.expiresAt)
        })
      );
  }

  async findByCustomerIdAndPeriod(
    customerId: string,
    periodStart: Date,
    periodEnd: Date
  ): Promise<PurchaseTransaction[]> {
    const items = await this.findByCustomerId(customerId);
    return items.filter(
      (item) => item.occurredAt >= periodStart && item.occurredAt <= periodEnd
    );
  }
}
