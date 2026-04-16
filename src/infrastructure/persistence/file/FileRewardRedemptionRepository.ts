import { RewardRedemption } from "../../../domain/entities/RewardRedemption";
import { RewardRedemptionRepository } from "../../../domain/repositories/RewardRedemptionRepository";
import { FileDatabase } from "./FileDatabase";

export class FileRewardRedemptionRepository
  implements RewardRedemptionRepository
{
  constructor(private readonly db: FileDatabase) {}

  async create(redemption: RewardRedemption): Promise<void> {
    const state = this.db.read();
    state.redemptions.push({
      ...redemption.toJSON(),
      redeemedAt: redemption.redeemedAt.toISOString()
    });
    this.db.write(state);
  }

  async findByCustomerId(customerId: string): Promise<RewardRedemption[]> {
    const state = this.db.read();
    return state.redemptions
      .filter((entry) => entry.customerId === customerId)
      .map((entry) =>
        RewardRedemption.fromPersistence({
          ...entry,
          redeemedAt: new Date(entry.redeemedAt)
        })
      );
  }
}
