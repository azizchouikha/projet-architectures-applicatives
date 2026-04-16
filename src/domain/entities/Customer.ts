export type LoyaltyTier = "BRONZE" | "SILVER" | "GOLD";

export interface CustomerProps {
  id: string;
  fullName: string;
  tier: LoyaltyTier;
  isFrozen: boolean;
  frozenUntil: Date | null;
  createdAt: Date;
}

export class Customer {
  private constructor(private readonly props: CustomerProps) {}

  static create(id: string, fullName: string): Customer {
    return new Customer({
      id,
      fullName,
      tier: "BRONZE",
      isFrozen: false,
      frozenUntil: null,
      createdAt: new Date()
    });
  }

  static fromPersistence(props: CustomerProps): Customer {
    return new Customer(props);
  }

  get id(): string {
    return this.props.id;
  }

  get fullName(): string {
    return this.props.fullName;
  }

  get tier(): LoyaltyTier {
    return this.props.tier;
  }

  get isFrozen(): boolean {
    return this.props.isFrozen;
  }

  get frozenUntil(): Date | null {
    return this.props.frozenUntil;
  }

  setTier(nextTier: LoyaltyTier): void {
    this.props.tier = nextTier;
  }

  freezeUntil(frozenUntil: Date): void {
    this.props.isFrozen = true;
    this.props.frozenUntil = frozenUntil;
  }

  unfreezeIfExpired(now: Date): void {
    if (this.props.frozenUntil && this.props.frozenUntil <= now) {
      this.props.isFrozen = false;
      this.props.frozenUntil = null;
    }
  }

  toJSON(): CustomerProps {
    return { ...this.props };
  }
}
