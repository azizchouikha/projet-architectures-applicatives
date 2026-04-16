import { Customer } from "../entities/Customer";

export interface CustomerRepository {
  create(customer: Customer): Promise<void>;
  update(customer: Customer): Promise<void>;
  findById(id: string): Promise<Customer | null>;
  findAll(): Promise<Customer[]>;
}
