import {
  RewardRedemption,
  RewardRedemptionProps
} from "../../../domain/entities/RewardRedemption";
import { RewardRedemptionRepository } from "../../../domain/repositories/RewardRedemptionRepository";
import { SqliteDatabase } from "./SqliteDatabase";

interface RedemptionRow {
  id: string;
  customer_id: string;
  reward_code: string;
  points_spent: number;
  redeemed_at: string;
}

export class SqliteRewardRedemptionRepository
  implements RewardRedemptionRepository
{
  constructor(private readonly sqliteDatabase: SqliteDatabase) {}

  async create(redemption: RewardRedemption): Promise<void> {
    const payload = redemption.toJSON();
    this.sqliteDatabase.db
      .prepare(
        `INSERT INTO redemptions (id, customer_id, reward_code, points_spent, redeemed_at)
         VALUES (?, ?, ?, ?, ?)`
      )
      .run(
        payload.id,
        payload.customerId,
        payload.rewardCode,
        payload.pointsSpent,
        payload.redeemedAt.toISOString()
      );
  }

  async findByCustomerId(customerId: string): Promise<RewardRedemption[]> {
    const rows = this.sqliteDatabase.db
      .prepare(`SELECT * FROM redemptions WHERE customer_id = ?`)
      .all(customerId) as RedemptionRow[];

    return rows.map((row) => this.toEntity(row));
  }

  private toEntity(row: RedemptionRow): RewardRedemption {
    const payload: RewardRedemptionProps = {
      id: row.id,
      customerId: row.customer_id,
      rewardCode: row.reward_code,
      pointsSpent: row.points_spent,
      redeemedAt: new Date(row.redeemed_at)
    };
    return RewardRedemption.fromPersistence(payload);
  }
}
