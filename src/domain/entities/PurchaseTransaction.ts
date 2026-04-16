import { PointsAmount } from "../value-objects/PointsAmount";
import { StoreLocation } from "../value-objects/StoreLocation";

export interface PurchaseTransactionProps {
  id: string;
  customerId: string;
  amountCents: number;
  pointsEarned: number;
  occurredAt: Date;
  expiresAt: Date;
  location: { latitude: number; longitude: number };
}

export class PurchaseTransaction {
  private constructor(private readonly props: PurchaseTransactionProps) {}

  static create(params: {
    id: string;
    customerId: string;
    amountCents: number;
    occurredAt: Date;
    latitude: number;
    longitude: number;
  }): PurchaseTransaction {
    if (!Number.isInteger(params.amountCents) || params.amountCents <= 0) {
      throw new Error("Le montant d'achat doit etre un entier positif.");
    }

    const pointsEarned = Math.floor(params.amountCents / 10);
    const expiresAt = new Date(params.occurredAt);
    expiresAt.setDate(expiresAt.getDate() + 365);

    const location = StoreLocation.from(params.latitude, params.longitude).toJSON();

    return new PurchaseTransaction({
      id: params.id,
      customerId: params.customerId,
      amountCents: params.amountCents,
      pointsEarned: PointsAmount.from(pointsEarned).value,
      occurredAt: params.occurredAt,
      expiresAt,
      location
    });
  }

  static fromPersistence(props: PurchaseTransactionProps): PurchaseTransaction {
    return new PurchaseTransaction(props);
  }

  get id(): string {
    return this.props.id;
  }

  get customerId(): string {
    return this.props.customerId;
  }

  get amountCents(): number {
    return this.props.amountCents;
  }

  get pointsEarned(): number {
    return this.props.pointsEarned;
  }

  get occurredAt(): Date {
    return this.props.occurredAt;
  }

  get expiresAt(): Date {
    return this.props.expiresAt;
  }

  get location(): StoreLocation {
    return StoreLocation.from(this.props.location.latitude, this.props.location.longitude);
  }

  toJSON(): PurchaseTransactionProps {
    return { ...this.props };
  }
}
