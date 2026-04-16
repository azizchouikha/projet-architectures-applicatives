import { CustomerRepository } from "../../domain/repositories/CustomerRepository";
import { RewardRedemptionRepository } from "../../domain/repositories/RewardRedemptionRepository";
import { TransactionRepository } from "../../domain/repositories/TransactionRepository";
import { FileCustomerRepository } from "./file/FileCustomerRepository";
import { FileDatabase } from "./file/FileDatabase";
import { FileRewardRedemptionRepository } from "./file/FileRewardRedemptionRepository";
import { FileTransactionRepository } from "./file/FileTransactionRepository";
import { SqliteCustomerRepository } from "./sqlite/SqliteCustomerRepository";
import { SqliteDatabase } from "./sqlite/SqliteDatabase";
import { SqliteRewardRedemptionRepository } from "./sqlite/SqliteRewardRedemptionRepository";
import { SqliteTransactionRepository } from "./sqlite/SqliteTransactionRepository";

export interface RepositoryBundle {
  customers: CustomerRepository;
  transactions: TransactionRepository;
  redemptions: RewardRedemptionRepository;
}

export function createRepositories(storageDriver: string): RepositoryBundle {
  if (storageDriver === "sqlite") {
    const sqlite = new SqliteDatabase("data/loyalty.sqlite");
    return {
      customers: new SqliteCustomerRepository(sqlite),
      transactions: new SqliteTransactionRepository(sqlite),
      redemptions: new SqliteRewardRedemptionRepository(sqlite)
    };
  }

  const fileDb = new FileDatabase("data/loyalty.json");
  return {
    customers: new FileCustomerRepository(fileDb),
    transactions: new FileTransactionRepository(fileDb),
    redemptions: new FileRewardRedemptionRepository(fileDb)
  };
}
