export class PointsAmount {
  private constructor(private readonly amount: number) {}

  static from(value: number): PointsAmount {
    if (!Number.isInteger(value) || value < 0) {
      throw new Error("Le nombre de points doit etre un entier positif.");
    }

    return new PointsAmount(value);
  }

  get value(): number {
    return this.amount;
  }

  add(other: PointsAmount): PointsAmount {
    return PointsAmount.from(this.amount + other.amount);
  }

  subtract(other: PointsAmount): PointsAmount {
    if (other.amount > this.amount) {
      throw new Error("Impossible de retirer plus de points que le solde.");
    }

    return PointsAmount.from(this.amount - other.amount);
  }
}
