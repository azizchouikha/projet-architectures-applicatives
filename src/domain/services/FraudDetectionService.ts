import { PurchaseTransaction } from "../entities/PurchaseTransaction";

const DISTANCE_THRESHOLD_KM = 100;
const WINDOW_IN_MS = 60 * 60 * 1000;
const ALERT_THRESHOLD = 5;

export class FraudDetectionService {
  shouldFreezeAccount(transactions: PurchaseTransaction[]): boolean {
    const sorted = [...transactions].sort(
      (a, b) => a.occurredAt.getTime() - b.occurredAt.getTime()
    );

    let suspiciousPairs = 0;

    for (let index = 1; index < sorted.length; index += 1) {
      const previous = sorted[index - 1];
      const current = sorted[index];
      const elapsed = current.occurredAt.getTime() - previous.occurredAt.getTime();

      if (elapsed > WINDOW_IN_MS) {
        continue;
      }

      const distanceKm = previous.location.distanceKmTo(current.location);

      if (distanceKm >= DISTANCE_THRESHOLD_KM) {
        suspiciousPairs += 1;
      }
    }

    return suspiciousPairs > ALERT_THRESHOLD;
  }
}
