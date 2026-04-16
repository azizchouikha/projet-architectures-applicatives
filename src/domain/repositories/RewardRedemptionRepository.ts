import { RewardRedemption } from "../entities/RewardRedemption";

export interface RewardRedemptionRepository {
  create(redemption: RewardRedemption): Promise<void>;
  findByCustomerId(customerId: string): Promise<RewardRedemption[]>;
}
