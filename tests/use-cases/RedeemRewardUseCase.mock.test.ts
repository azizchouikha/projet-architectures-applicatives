import { RedeemRewardUseCase } from "../../src/application/use-cases/RedeemRewardUseCase";
import { Customer } from "../../src/domain/entities/Customer";
import { PurchaseTransaction } from "../../src/domain/entities/PurchaseTransaction";
import { RewardRedemption } from "../../src/domain/entities/RewardRedemption";
import { CustomerRepository } from "../../src/domain/repositories/CustomerRepository";
import { RewardRedemptionRepository } from "../../src/domain/repositories/RewardRedemptionRepository";
import { TransactionRepository } from "../../src/domain/repositories/TransactionRepository";
import { PointsLedgerService } from "../../src/domain/services/PointsLedgerService";

describe("RedeemRewardUseCase (Mock)", () => {
  it("enregistre la redemption quand le solde est suffisant", async () => {
    const customer = Customer.create("customer-1", "Alice");
    const transaction = PurchaseTransaction.create({
      id: "t-1",
      customerId: customer.id,
      amountCents: 10_000,
      occurredAt: new Date("2026-01-01T10:00:00.000Z"),
      latitude: 48.8566,
      longitude: 2.3522
    });

    const customerRepository: CustomerRepository = {
      create: jest.fn(),
      update: jest.fn(),
      findById: jest.fn().mockResolvedValue(customer),
      findAll: jest.fn().mockResolvedValue([customer])
    };

    const transactionRepository: TransactionRepository = {
      create: jest.fn(),
      findByCustomerId: jest.fn().mockResolvedValue([transaction]),
      findByCustomerIdAndPeriod: jest.fn().mockResolvedValue([transaction])
    };

    const rewardRedemptionRepository: RewardRedemptionRepository = {
      create: jest.fn().mockResolvedValue(undefined),
      findByCustomerId: jest.fn().mockResolvedValue([])
    };

    const useCase = new RedeemRewardUseCase(
      customerRepository,
      transactionRepository,
      rewardRedemptionRepository,
      new PointsLedgerService()
    );

    const result = await useCase.execute({
      customerId: customer.id,
      rewardCode: "DISCOUNT_10",
      pointsCost: 500,
      redeemedAt: new Date("2026-01-02T10:00:00.000Z")
    });

    expect(result.remainingPoints).toBe(500);
    expect(rewardRedemptionRepository.create).toHaveBeenCalledTimes(1);
    const firstArg = (rewardRedemptionRepository.create as jest.Mock).mock
      .calls[0][0] as RewardRedemption;
    expect(firstArg.customerId).toBe(customer.id);
    expect(firstArg.pointsSpent).toBe(500);
  });
});
