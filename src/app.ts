import express, { Request, Response } from "express";
import { z } from "zod";
import { CreateCustomerUseCase } from "./application/use-cases/CreateCustomerUseCase";
import { GetCustomerSummaryUseCase } from "./application/use-cases/GetCustomerSummaryUseCase";
import { RecalculateVipStatusUseCase } from "./application/use-cases/RecalculateVipStatusUseCase";
import { RedeemRewardUseCase } from "./application/use-cases/RedeemRewardUseCase";
import { RegisterPurchaseUseCase } from "./application/use-cases/RegisterPurchaseUseCase";
import { DefaultTierPolicy } from "./domain/services/DefaultTierPolicy";
import { FraudDetectionService } from "./domain/services/FraudDetectionService";
import { PointsLedgerService } from "./domain/services/PointsLedgerService";
import { createRepositories } from "./infrastructure/persistence/RepositoryFactory";

export function createApp(storageDriver: string): express.Express {
  const app = express();
  app.use(express.json());

  const repositories = createRepositories(storageDriver);
  const pointsLedgerService = new PointsLedgerService();

  const createCustomerUseCase = new CreateCustomerUseCase(repositories.customers);
  const registerPurchaseUseCase = new RegisterPurchaseUseCase(
    repositories.customers,
    repositories.transactions,
    new FraudDetectionService()
  );
  const redeemRewardUseCase = new RedeemRewardUseCase(
    repositories.customers,
    repositories.transactions,
    repositories.redemptions,
    pointsLedgerService
  );
  const recalculateVipStatusUseCase = new RecalculateVipStatusUseCase(
    repositories.customers,
    repositories.transactions,
    new DefaultTierPolicy()
  );
  const getCustomerSummaryUseCase = new GetCustomerSummaryUseCase(
    repositories.customers,
    repositories.transactions,
    repositories.redemptions,
    pointsLedgerService
  );

  app.get("/health", (_request: Request, response: Response) => {
    response.status(200).json({ status: "ok" });
  });

  app.post("/customers", async (request: Request, response: Response) => {
    try {
      const schema = z.object({ fullName: z.string().min(3) });
      const input = schema.parse(request.body);
      const result = await createCustomerUseCase.execute(input);
      response.status(201).json(result);
    } catch (error) {
      response.status(400).json({ error: toErrorMessage(error) });
    }
  });

  app.post("/purchases", async (request: Request, response: Response) => {
    try {
      const schema = z.object({
        customerId: z.string().uuid(),
        amountCents: z.number().int().positive(),
        occurredAt: z.string().datetime(),
        latitude: z.number(),
        longitude: z.number()
      });

      const body = schema.parse(request.body);
      const result = await registerPurchaseUseCase.execute({
        ...body,
        occurredAt: new Date(body.occurredAt)
      });

      response.status(201).json(result);
    } catch (error) {
      response.status(400).json({ error: toErrorMessage(error) });
    }
  });

  app.post("/rewards/redeem", async (request: Request, response: Response) => {
    try {
      const schema = z.object({
        customerId: z.string().uuid(),
        rewardCode: z.string().min(1),
        pointsCost: z.number().int().positive(),
        redeemedAt: z.string().datetime()
      });

      const body = schema.parse(request.body);
      const result = await redeemRewardUseCase.execute({
        ...body,
        redeemedAt: new Date(body.redeemedAt)
      });
      response.status(201).json(result);
    } catch (error) {
      response.status(400).json({ error: toErrorMessage(error) });
    }
  });

  app.post(
    "/jobs/recalculate-vip-status",
    async (_request: Request, response: Response) => {
      try {
        const result = await recalculateVipStatusUseCase.execute(new Date());
        response.status(200).json(result);
      } catch (error) {
        response.status(400).json({ error: toErrorMessage(error) });
      }
    }
  );

  app.get("/customers/:id/summary", async (request: Request, response: Response) => {
    try {
      const schema = z.object({ id: z.string().uuid() });
      const params = schema.parse(request.params);
      const result = await getCustomerSummaryUseCase.execute({
        customerId: params.id,
        asOf: new Date()
      });
      response.status(200).json(result);
    } catch (error) {
      response.status(404).json({ error: toErrorMessage(error) });
    }
  });

  return app;
}

function toErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  return "Une erreur inconnue est survenue.";
}
