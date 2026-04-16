import { Customer, CustomerProps } from "../../../domain/entities/Customer";
import { CustomerRepository } from "../../../domain/repositories/CustomerRepository";
import { SqliteDatabase } from "./SqliteDatabase";

interface CustomerRow {
  id: string;
  full_name: string;
  tier: "BRONZE" | "SILVER" | "GOLD";
  is_frozen: number;
  frozen_until: string | null;
  created_at: string;
}

export class SqliteCustomerRepository implements CustomerRepository {
  constructor(private readonly sqliteDatabase: SqliteDatabase) {}

  async create(customer: Customer): Promise<void> {
    const payload = customer.toJSON();
    this.sqliteDatabase.db
      .prepare(
        `INSERT INTO customers (id, full_name, tier, is_frozen, frozen_until, created_at)
         VALUES (?, ?, ?, ?, ?, ?)`
      )
      .run(
        payload.id,
        payload.fullName,
        payload.tier,
        payload.isFrozen ? 1 : 0,
        payload.frozenUntil ? payload.frozenUntil.toISOString() : null,
        payload.createdAt.toISOString()
      );
  }

  async update(customer: Customer): Promise<void> {
    const payload = customer.toJSON();
    this.sqliteDatabase.db
      .prepare(
        `UPDATE customers
         SET full_name = ?, tier = ?, is_frozen = ?, frozen_until = ?, created_at = ?
         WHERE id = ?`
      )
      .run(
        payload.fullName,
        payload.tier,
        payload.isFrozen ? 1 : 0,
        payload.frozenUntil ? payload.frozenUntil.toISOString() : null,
        payload.createdAt.toISOString(),
        payload.id
      );
  }

  async findById(id: string): Promise<Customer | null> {
    const row = this.sqliteDatabase.db
      .prepare(`SELECT * FROM customers WHERE id = ?`)
      .get(id) as CustomerRow | undefined;

    return row ? this.toEntity(row) : null;
  }

  async findAll(): Promise<Customer[]> {
    const rows = this.sqliteDatabase.db
      .prepare(`SELECT * FROM customers`)
      .all() as CustomerRow[];

    return rows.map((row) => this.toEntity(row));
  }

  private toEntity(row: CustomerRow): Customer {
    const payload: CustomerProps = {
      id: row.id,
      fullName: row.full_name,
      tier: row.tier,
      isFrozen: row.is_frozen === 1,
      frozenUntil: row.frozen_until ? new Date(row.frozen_until) : null,
      createdAt: new Date(row.created_at)
    };
    return Customer.fromPersistence(payload);
  }
}
