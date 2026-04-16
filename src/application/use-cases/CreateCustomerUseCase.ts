import { randomUUID } from "node:crypto";
import { Customer } from "../../domain/entities/Customer";
import { CustomerRepository } from "../../domain/repositories/CustomerRepository";

export class CreateCustomerUseCase {
  constructor(private readonly customerRepository: CustomerRepository) {}

  async execute(input: { fullName: string }): Promise<{ customerId: string }> {
    if (input.fullName.trim().length < 3) {
      throw new Error("Le nom complet doit contenir au moins 3 caracteres.");
    }

    const customer = Customer.create(randomUUID(), input.fullName.trim());
    await this.customerRepository.create(customer);

    return { customerId: customer.id };
  }
}
