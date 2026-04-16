import { RecalculateVipStatusUseCase } from "../../src/application/use-cases/RecalculateVipStatusUseCase";
import { Customer } from "../../src/domain/entities/Customer";
import { CustomerRepository } from "../../src/domain/repositories/CustomerRepository";
import { TransactionRepository } from "../../src/domain/repositories/TransactionRepository";
import { DefaultTierPolicy } from "../../src/domain/services/DefaultTierPolicy";
import { PurchaseTransaction } from "../../src/domain/entities/PurchaseTransaction";

class InMemoryCustomerRepository implements CustomerRepository {
  public readonly customers = new Map<string, Customer>();

  async create(customer: Customer): Promise<void> {
    this.customers.set(customer.id, customer);
  }

  async update(customer: Customer): Promise<void> {
    this.customers.set(customer.id, customer);
  }

  async findById(id: string): Promise<Customer | null> {
    return this.customers.get(id) ?? null;
  }

  async findAll(): Promise<Customer[]> {
    return [...this.customers.values()];
  }
}

class StubTransactionRepository implements TransactionRepository {
  constructor(private readonly amountCents: number) {}

  async create(): Promise<void> {
    throw new Error("Not implemented");
  }

  async findByCustomerId(): Promise<PurchaseTransaction[]> {
    return [];
  }

  async findByCustomerIdAndPeriod(
    customerId: string,
    periodStart: Date,
    periodEnd: Date
  ): Promise<PurchaseTransaction[]> {
    const fixedDate = new Date(periodStart);
    fixedDate.setDate(fixedDate.getDate() + 1);

    return [
      PurchaseTransaction.create({
        id: "tx-1",
        customerId,
        amountCents: this.amountCents,
        occurredAt: fixedDate <= periodEnd ? fixedDate : periodStart,
        latitude: 48.8566,
        longitude: 2.3522
      })
    ];
  }
}

describe("RecalculateVipStatusUseCase (Stub)", () => {
  it("passe le client en GOLD quand les depenses glissantes depassent le seuil", async () => {
    const customerRepository = new InMemoryCustomerRepository();
    const customer = Customer.create("c-1", "Client Test");
    await customerRepository.create(customer);

    const transactionRepository = new StubTransactionRepository(250_000);
    const useCase = new RecalculateVipStatusUseCase(
      customerRepository,
      transactionRepository,
      new DefaultTierPolicy()
    );

    const result = await useCase.execute(new Date("2026-01-01T00:00:00.000Z"));

    expect(result.updatedCustomers).toBe(1);
    const refreshed = await customerRepository.findById("c-1");
    expect(refreshed?.tier).toBe("GOLD");
  });
});
