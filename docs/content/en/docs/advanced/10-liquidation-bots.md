---
title: "Chapter 10: Liquidation Bots & Mechanics"
linkTitle: "10. Liquidation Bots"
weight: 10
type: docs
---

Building a liquidation bot on Sui requires an understanding of how each protocol tracks risk and how to execute atomic transactions to capture liquidation premiums.

## Core Liquidation Flow

A production-grade liquidator typically follows this loop:

1. **Monitor**: Query obligations (using SDK indexers or custom listeners) to find positions with a Health Factor (HF) < 1
2. **Verify**: Perform a `dryRun` or simulation to ensure the position is still liquidatable and profitable
3. **Prepare**: Fetch real-time prices (Pyth VAA) and generate necessary oracle update commands
4. **Execute**: Submit a Programmable Transaction Block (PTB) that:
   - Updates Oracle prices
   - (Optional) Unstakes position if locked
   - Borrows debt via Flash Loan
   - Calls the protocol's `liquidate` function
   - Swaps seized collateral back to debt asset
   - Repays the Flash Loan

---

## Health Factor (HF) Calculations

Liquidations are triggered when the value of a user's collateral (weighted by Loan-to-Value) falls below their borrowed debt.

### General Formula

```
HF = Borrow Capacity / Total Debt
Borrow Capacity = Sum(Collateral Value × LTV)
```

### Standard LTV Table

| Asset | LTV (Scallop) | LTV (Suilend) |
| :--- | :--- | :--- |
| **SUI** | 0.70 | 0.75 |
| **USDC** | 0.85 | 0.80 |
| **ETH** | 0.75 | 0.70 |
| **afSUI** | 0.65 | 0.60 |

---

## Oracle Requirements

### Scallop: xOracle & EMA

Scallop uses an **Exponentially Moving Average (EMA)** price.

- **Risk**: Spot prices might crash, but the EMA lags. A position might be "liquidatable" on Pyth but "healthy" on Scallop for several minutes.
- **PTB Requirement**: You **must** call `updateAssetPricesQuick` in the same PTB before calling `liquidate`.

### Suilend: Price Bounds

Suilend uses weighted price bounds for health checks.

- **is_healthy**: `weighted_borrowed_value_upper_bound_usd <= allowed_borrow_value_usd`
- **is_liquidatable**: `weighted_borrowed_value_usd > unhealthy_borrow_value_usd`

---

## PTB Strategy

Liquidations return **two values** (the repayment coin and the seized collateral). Your PTB must handle both to avoid transaction failure.

```typescript
// Example PTB return handling
const [remainingDebt, seizedCollateral] = tx.moveCall({
    target: `${SCALLOP_PKG}::liquidate::liquidate`,
    // ... arguments ...
});

// Transfer seized collateral to your wallet or swap it
tx.transferObjects([seizedCollateral], tx.pure.address(MY_ADDRESS));
```

---

## Example: Complete Liquidation PTB

See `examples/ptb-scallop-liquidation.ts` for a complete liquidation flow implementation using the Scallop SDK.

**Note**: The example uses placeholder values (`'0x...'`) for addresses and obligation IDs. In production, replace these with actual values. The code automatically uses the keypair's address when a placeholder is detected to prevent validation errors during PTB construction.
