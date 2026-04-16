import { PointsAmount } from "../value-objects/PointsAmount";

export interface RewardRedemptionProps {
  id: string;
  customerId: string;
  rewardCode: string;
  pointsSpent: number;
  redeemedAt: Date;
}

export class RewardRedemption {
  private constructor(private readonly props: RewardRedemptionProps) {}

  static create(params: {
    id: string;
    customerId: string;
    rewardCode: string;
    pointsSpent: number;
    redeemedAt: Date;
  }): RewardRedemption {
    if (params.rewardCode.trim().length === 0) {
      throw new Error("Le code de recompense est obligatoire.");
    }

    return new RewardRedemption({
      id: params.id,
      customerId: params.customerId,
      rewardCode: params.rewardCode,
      pointsSpent: PointsAmount.from(params.pointsSpent).value,
      redeemedAt: params.redeemedAt
    });
  }

  static fromPersistence(props: RewardRedemptionProps): RewardRedemption {
    return new RewardRedemption(props);
  }

  get customerId(): string {
    return this.props.customerId;
  }

  get pointsSpent(): number {
    return this.props.pointsSpent;
  }

  get redeemedAt(): Date {
    return this.props.redeemedAt;
  }

  toJSON(): RewardRedemptionProps {
    return { ...this.props };
  }
}
