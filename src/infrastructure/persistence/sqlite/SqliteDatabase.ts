import { existsSync, mkdirSync } from "node:fs";
import { dirname } from "node:path";
import Database from "better-sqlite3";

export class SqliteDatabase {
  private readonly connection: Database.Database;

  constructor(private readonly databasePath: string) {
    const directory = dirname(databasePath);
    if (!existsSync(directory)) {
      mkdirSync(directory, { recursive: true });
    }

    this.connection = new Database(databasePath);
    this.initializeSchema();
  }

  get db(): Database.Database {
    return this.connection;
  }

  private initializeSchema(): void {
    this.connection.exec(`
      CREATE TABLE IF NOT EXISTS customers (
        id TEXT PRIMARY KEY,
        full_name TEXT NOT NULL,
        tier TEXT NOT NULL,
        is_frozen INTEGER NOT NULL,
        frozen_until TEXT NULL,
        created_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS transactions (
        id TEXT PRIMARY KEY,
        customer_id TEXT NOT NULL,
        amount_cents INTEGER NOT NULL,
        points_earned INTEGER NOT NULL,
        occurred_at TEXT NOT NULL,
        expires_at TEXT NOT NULL,
        latitude REAL NOT NULL,
        longitude REAL NOT NULL,
        FOREIGN KEY (customer_id) REFERENCES customers(id)
      );

      CREATE TABLE IF NOT EXISTS redemptions (
        id TEXT PRIMARY KEY,
        customer_id TEXT NOT NULL,
        reward_code TEXT NOT NULL,
        points_spent INTEGER NOT NULL,
        redeemed_at TEXT NOT NULL,
        FOREIGN KEY (customer_id) REFERENCES customers(id)
      );
    `);
  }
}
