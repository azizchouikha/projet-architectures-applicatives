import { Customer } from "../../../domain/entities/Customer";
import { CustomerRepository } from "../../../domain/repositories/CustomerRepository";
import { FileDatabase } from "./FileDatabase";

export class FileCustomerRepository implements CustomerRepository {
  constructor(private readonly db: FileDatabase) {}

  async create(customer: Customer): Promise<void> {
    const state = this.db.read();
    state.customers.push({
      ...customer.toJSON(),
      createdAt: customer.toJSON().createdAt.toISOString(),
      frozenUntil: customer.toJSON().frozenUntil?.toISOString() ?? null
    });
    this.db.write(state);
  }

  async update(customer: Customer): Promise<void> {
    const state = this.db.read();
    const index = state.customers.findIndex((record) => record.id === customer.id);
    if (index < 0) {
      return;
    }

    state.customers[index] = {
      ...customer.toJSON(),
      createdAt: customer.toJSON().createdAt.toISOString(),
      frozenUntil: customer.toJSON().frozenUntil?.toISOString() ?? null
    };
    this.db.write(state);
  }

  async findById(id: string): Promise<Customer | null> {
    const state = this.db.read();
    const record = state.customers.find((entry) => entry.id === id);
    if (!record) {
      return null;
    }

    return Customer.fromPersistence({
      ...record,
      createdAt: new Date(record.createdAt),
      frozenUntil: record.frozenUntil ? new Date(record.frozenUntil) : null
    });
  }

  async findAll(): Promise<Customer[]> {
    const state = this.db.read();
    return state.customers.map((record) =>
      Customer.fromPersistence({
        ...record,
        createdAt: new Date(record.createdAt),
        frozenUntil: record.frozenUntil ? new Date(record.frozenUntil) : null
      })
    );
  }
}
