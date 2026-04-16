import { randomUUID } from "node:crypto";
import { PurchaseTransaction } from "../../domain/entities/PurchaseTransaction";
import { CustomerRepository } from "../../domain/repositories/CustomerRepository";
import { TransactionRepository } from "../../domain/repositories/TransactionRepository";
import { FraudDetectionService } from "../../domain/services/FraudDetectionService";

export class RegisterPurchaseUseCase {
  constructor(
    private readonly customerRepository: CustomerRepository,
    private readonly transactionRepository: TransactionRepository,
    private readonly fraudDetectionService: FraudDetectionService
  ) {}

  async execute(input: {
    customerId: string;
    amountCents: number;
    occurredAt: Date;
    latitude: number;
    longitude: number;
  }): Promise<{ transactionId: string; accountFrozen: boolean }> {
    const customer = await this.customerRepository.findById(input.customerId);
    if (!customer) {
      throw new Error("Client introuvable.");
    }

    customer.unfreezeIfExpired(new Date());
    if (customer.isFrozen) {
      throw new Error("Le compte est temporairement gele.");
    }

    const transaction = PurchaseTransaction.create({
      id: randomUUID(),
      customerId: input.customerId,
      amountCents: input.amountCents,
      occurredAt: input.occurredAt,
      latitude: input.latitude,
      longitude: input.longitude
    });

    await this.transactionRepository.create(transaction);

    const customerTransactions = await this.transactionRepository.findByCustomerId(
      customer.id
    );

    const shouldFreeze = this.fraudDetectionService.shouldFreezeAccount(
      customerTransactions
    );

    if (shouldFreeze) {
      const frozenUntil = new Date(input.occurredAt);
      frozenUntil.setHours(frozenUntil.getHours() + 24);
      customer.freezeUntil(frozenUntil);
      await this.customerRepository.update(customer);
    } else {
      await this.customerRepository.update(customer);
    }

    return { transactionId: transaction.id, accountFrozen: customer.isFrozen };
  }
}
