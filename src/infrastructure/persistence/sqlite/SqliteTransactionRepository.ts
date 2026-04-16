import {
  PurchaseTransaction,
  PurchaseTransactionProps
} from "../../../domain/entities/PurchaseTransaction";
import { TransactionRepository } from "../../../domain/repositories/TransactionRepository";
import { SqliteDatabase } from "./SqliteDatabase";

interface TransactionRow {
  id: string;
  customer_id: string;
  amount_cents: number;
  points_earned: number;
  occurred_at: string;
  expires_at: string;
  latitude: number;
  longitude: number;
}

export class SqliteTransactionRepository implements TransactionRepository {
  constructor(private readonly sqliteDatabase: SqliteDatabase) {}

  async create(transaction: PurchaseTransaction): Promise<void> {
    const payload = transaction.toJSON();
    this.sqliteDatabase.db
      .prepare(
        `INSERT INTO transactions
         (id, customer_id, amount_cents, points_earned, occurred_at, expires_at, latitude, longitude)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
      )
      .run(
        payload.id,
        payload.customerId,
        payload.amountCents,
        payload.pointsEarned,
        payload.occurredAt.toISOString(),
        payload.expiresAt.toISOString(),
        payload.location.latitude,
        payload.location.longitude
      );
  }

  async findByCustomerId(customerId: string): Promise<PurchaseTransaction[]> {
    const rows = this.sqliteDatabase.db
      .prepare(`SELECT * FROM transactions WHERE customer_id = ?`)
      .all(customerId) as TransactionRow[];

    return rows.map((row) => this.toEntity(row));
  }

  async findByCustomerIdAndPeriod(
    customerId: string,
    periodStart: Date,
    periodEnd: Date
  ): Promise<PurchaseTransaction[]> {
    const rows = this.sqliteDatabase.db
      .prepare(
        `SELECT * FROM transactions
         WHERE customer_id = ?
         AND occurred_at >= ?
         AND occurred_at <= ?`
      )
      .all(customerId, periodStart.toISOString(), periodEnd.toISOString()) as TransactionRow[];

    return rows.map((row) => this.toEntity(row));
  }

  private toEntity(row: TransactionRow): PurchaseTransaction {
    const payload: PurchaseTransactionProps = {
      id: row.id,
      customerId: row.customer_id,
      amountCents: row.amount_cents,
      pointsEarned: row.points_earned,
      occurredAt: new Date(row.occurred_at),
      expiresAt: new Date(row.expires_at),
      location: {
        latitude: row.latitude,
        longitude: row.longitude
      }
    };
    return PurchaseTransaction.fromPersistence(payload);
  }
}
