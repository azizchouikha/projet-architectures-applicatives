import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";

type RawDate = string;

export interface FileRecordCustomer {
  id: string;
  fullName: string;
  tier: "BRONZE" | "SILVER" | "GOLD";
  isFrozen: boolean;
  frozenUntil: RawDate | null;
  createdAt: RawDate;
}

export interface FileRecordTransaction {
  id: string;
  customerId: string;
  amountCents: number;
  pointsEarned: number;
  occurredAt: RawDate;
  expiresAt: RawDate;
  location: { latitude: number; longitude: number };
}

export interface FileRecordRedemption {
  id: string;
  customerId: string;
  rewardCode: string;
  pointsSpent: number;
  redeemedAt: RawDate;
}

export interface FileStorageSchema {
  customers: FileRecordCustomer[];
  transactions: FileRecordTransaction[];
  redemptions: FileRecordRedemption[];
}

export class FileDatabase {
  constructor(private readonly filePath: string) {
    this.ensureExists();
  }

  read(): FileStorageSchema {
    const content = readFileSync(this.filePath, "utf-8");
    return JSON.parse(content) as FileStorageSchema;
  }

  write(nextState: FileStorageSchema): void {
    writeFileSync(this.filePath, JSON.stringify(nextState, null, 2), "utf-8");
  }

  private ensureExists(): void {
    const directory = dirname(this.filePath);
    if (!existsSync(directory)) {
      mkdirSync(directory, { recursive: true });
    }

    if (!existsSync(this.filePath)) {
      const initialState: FileStorageSchema = {
        customers: [],
        transactions: [],
        redemptions: []
      };
      this.write(initialState);
    }
  }
}
