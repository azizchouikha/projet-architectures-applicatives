/* eslint-disable no-console */
const baseUrl = process.env.API_URL ?? "http://localhost:3000";

async function main() {
  console.log("=== Demo Soutenance - Fidelite ===");
  console.log(`API cible: ${baseUrl}`);

  const customer = await requestJson("/customers", "POST", {
    fullName: "Client Demo Soutenance"
  });
  const customerId = customer.customerId;
  console.log(`Client cree: ${customerId}`);

  const now = new Date();
  const purchases = [
    { amountCents: 80000, latitude: 48.8566, longitude: 2.3522 },
    { amountCents: 90000, latitude: 48.8566, longitude: 2.3522 },
    { amountCents: 50000, latitude: 48.8566, longitude: 2.3522 }
  ];

  for (const purchase of purchases) {
    const result = await requestJson("/purchases", "POST", {
      customerId,
      amountCents: purchase.amountCents,
      occurredAt: now.toISOString(),
      latitude: purchase.latitude,
      longitude: purchase.longitude
    });
    console.log(
      `Achat enregistre: tx=${result.transactionId} | compteGele=${result.accountFrozen}`
    );
  }

  const recalc = await requestJson("/jobs/recalculate-vip-status", "POST");
  console.log(`Recalcul VIP termine: ${recalc.updatedCustomers} client(s) maj`);

  const summary = await requestJson(`/customers/${customerId}/summary`, "GET");
  console.log("Resume client:");
  console.log(JSON.stringify(summary, null, 2));

  console.log("=== Fin demo ===");
}

async function requestJson(path, method, body) {
  const response = await fetch(`${baseUrl}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json"
    },
    body: body ? JSON.stringify(body) : undefined
  });

  const payload = await response.json();
  if (!response.ok) {
    throw new Error(`${method} ${path} -> ${response.status}: ${JSON.stringify(payload)}`);
  }
  return payload;
}

main().catch((error) => {
  console.error("Echec de la demo:", error.message);
  process.exitCode = 1;
});
