---
title: "Chapter 6: DeFi - Scallop (Lending)"
linkTitle: "6. Scallop"
weight: 6
type: docs
---

Scallop is the leading money market on Sui. This chapter covers the integration of the Scallop SDK for lending, borrowing, and querying market data on mainnet.

## Pinned SDK Version

| Package | Version |
|---------|---------|
| `@scallop-io/sui-scallop-sdk` | `2.3.13` |

---

## Core Integration Pattern

The Scallop SDK is modular, providing a `Scallop` class that acts as the entry point for all operations.

### 1. Initialization

```typescript
import { Scallop } from '@scallop-io/sui-scallop-sdk';

const scallop = new Scallop({
    secretKey: process.env.SUI_SECRET_KEY, // Optional for read-only
    networkType: 'mainnet',
});

// Initialize sub-modules
const query = await scallop.createScallopQuery();
const builder = await scallop.createScallopBuilder();
const client = await scallop.createScallopClient();
```

### 2. Supplying Assets (Deposit)

To supply assets to the money market and earn interest:

```typescript
async function supplyAsset(coinName: 'sui' | 'usdc', amount: number) {
    const tx = await client.deposit(coinName, amount);
    // ... sign and execute tx ...
}
```

### 3. Querying Market Data

Fetching the current interest rates and supply/borrow caps:

```typescript
async function getMarketInfo() {
    const marketData = await query.getMarket();
    console.log('Supply APR:', marketData.pools.sui.supplyRate);
    console.log('Borrow APR:', marketData.pools.sui.borrowRate);
}
```

---

## Oracle Price Updates (Mandatory)

Before performing any operation that checks a position's health (e.g., borrow or liquidate), you **MUST** update the oracle prices in the same PTB.

```typescript
const stx = scallopBuilder.createTxBlock();
// Update prices for ALL assets in the obligation
await stx.updateAssetPricesQuick(['sui', 'usdc', 'wusdc']);
```

{{% alert title="Critical" color="warning" %}}
You must update prices for **ALL** coins present in the obligation (both debt and collateral), not just the ones you are interacting with.
{{% /alert %}}

---

## Known Implementation Guardrails

1. **Mainnet Focus**: The Scallop SDK is heavily optimized for mainnet. Attempting to use it on devnet or testnet without specific overrides for package IDs will result in "Address not found" errors.

2. **Oracle Dependency**: Scallop uses Pyth for price feeds. Ensure your transaction allows for sufficient gas to cover the oracle update if required.

3. **Risk Management**: Always check the `collateral_factor` and `liquidation_threshold` for assets before borrowing.

---

## Troubleshooting Scallop

| Error | Cause | Fix |
|-------|-------|-----|
| `Module not found` | Outdated SDK or `sui-kit` mismatch | Use versions pinned in this manual |
| `Insufficient Collateral` | Not enough collateral for borrow | Deposit more collateral first |
