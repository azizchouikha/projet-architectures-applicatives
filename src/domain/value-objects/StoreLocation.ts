const EARTH_RADIUS_KM = 6371;

export class StoreLocation {
  private constructor(
    private readonly latitude: number,
    private readonly longitude: number
  ) {}

  static from(latitude: number, longitude: number): StoreLocation {
    if (latitude < -90 || latitude > 90) {
      throw new Error("Latitude invalide.");
    }

    if (longitude < -180 || longitude > 180) {
      throw new Error("Longitude invalide.");
    }

    return new StoreLocation(latitude, longitude);
  }

  distanceKmTo(other: StoreLocation): number {
    const toRadians = (value: number): number => (value * Math.PI) / 180;
    const latDistance = toRadians(other.latitude - this.latitude);
    const lngDistance = toRadians(other.longitude - this.longitude);

    const a =
      Math.sin(latDistance / 2) * Math.sin(latDistance / 2) +
      Math.cos(toRadians(this.latitude)) *
        Math.cos(toRadians(other.latitude)) *
        Math.sin(lngDistance / 2) *
        Math.sin(lngDistance / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return EARTH_RADIUS_KM * c;
  }

  toJSON(): { latitude: number; longitude: number } {
    return {
      latitude: this.latitude,
      longitude: this.longitude
    };
  }
}
