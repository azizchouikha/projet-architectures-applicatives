# Projet Architectures Applicatives - EPSI EISI

## Apprenant

- Aziz Chouikha
- Anis Hamnich

## Sujet

Moteur de Fidelite et de Recompenses (API REST sans interface utilisateur).

## Stack technique

- Node.js + Express.js
- TypeScript
- Persistance interchangeable:
  - Fichier JSON (`STORAGE_DRIVER=file`)
  - SQLite (`STORAGE_DRIVER=sqlite`)
- Tests automatises: Jest

## Lancement du projet

```bash
npm install
npm run dev
```

Variables utiles:

- `PORT` (par defaut `3000`)
- `STORAGE_DRIVER` (`file` par defaut, ou `sqlite`)

## Build et tests

```bash
npm run build
npm test
```

## Demo soutenance (rapide)

1. Lancer l'API:

```bash
npm run dev
```

2. Dans un second terminal, lancer la demo automatisee:

```bash
npm run demo
```

Le script execute automatiquement:
- creation d'un client,
- 3 achats,
- recalcul du statut VIP,
- affichage du resume final.

Tu peux aussi utiliser le fichier `demo.http` pour une demo pas a pas dans Cursor.

## Contraintes appliquees

- API REST: oui
- Pas d'interface utilisateur: oui
- Base de donnees SQLite ou fichiers interchangeable: oui (`RepositoryFactory`)
- Separation controleurs / logique metier: oui (`src/app.ts` vs `src/domain` et `src/application`)
- DDD: oui (entites, value objects, repositories, services de domaine, use cases)
- Diagramme UML: oui (`docs/domain-class-diagram.puml`)

### Entites (>= 3)

- `Customer`
- `PurchaseTransaction`
- `RewardRedemption`

### Value Objects (>= 2)

- `PointsAmount`
- `StoreLocation`

### Design Patterns (>= 2, hors MVC)

- **Repository Pattern**: interfaces de repository + implementations `file` / `sqlite`
- **Strategy Pattern**: `TierPolicy` + `DefaultTierPolicy` pour le calcul VIP

### Tests automatises

- **Test avec Stub**: `tests/use-cases/RecalculateVipStatusUseCase.stub.test.ts`
- **Test avec Mock**: `tests/use-cases/RedeemRewardUseCase.mock.test.ts`

## Regles metier implementees

1. **Recalcul du statut VIP**
   - Job `POST /jobs/recalculate-vip-status`
   - Calcul sur les depenses cumulees des 12 derniers mois glissants.

2. **Expiration des points a 365 jours**
   - Chaque transaction genere des points avec une date `expiresAt`.
   - Le solde disponible ignore les points expires.

3. **Prevention fraude**
   - Si plus de 5 paires de transactions sont detectees a moins d'une heure avec une distance >= 100 km entre magasins, le compte est gele 24h.

## Endpoints REST

- `GET /health`
- `POST /customers`
- `POST /purchases`
- `POST /rewards/redeem`
- `POST /jobs/recalculate-vip-status`
- `GET /customers/:id/summary`

## Exemple rapide

1. Creer un client:

```bash
curl -X POST http://localhost:3000/customers \
  -H "Content-Type: application/json" \
  -d "{\"fullName\":\"Aziz Chouikha\"}"
```

2. Enregistrer un achat:

```bash
curl -X POST http://localhost:3000/purchases \
  -H "Content-Type: application/json" \
  -d "{\"customerId\":\"<uuid>\",\"amountCents\":12000,\"occurredAt\":\"2026-04-15T10:00:00.000Z\",\"latitude\":48.8566,\"longitude\":2.3522}"
```

3. Recalculer les statuts:

```bash
curl -X POST http://localhost:3000/jobs/recalculate-vip-status
```

4. Consulter le resume:

```bash
curl http://localhost:3000/customers/<uuid>/summary
```
