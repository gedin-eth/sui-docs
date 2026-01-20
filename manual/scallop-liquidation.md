# Scallop Liquidation Guide

<!--
Module: Scallop Liquidation Documentation
Purpose: Detailed technical guide for performing liquidations on Scallop, including function signatures, error codes, and oracle behavior.
Usage: Reference for developers building liquidators or risk management tools on Scallop.
-->

Liquidation is a core mechanism of the Scallop protocol to ensure system solvency. When a position's **Health Factor (HF)** drops below 1, it becomes eligible for liquidation.

## **Liquidation Function Signature**

The liquidation function is part of the Scallop Move contract and requires specific objects and type arguments.

```move
// Target: 0xd384ded6b9e7f4d2c4c9007b0291ef88fbfed8e709bce83d2da69de2d79d013d::liquidate::liquidate
// liquidate<DebtCoin, CollateralCoin>(version, obligation, market, debt_coin, decimals, oracle, clock)

const [remainingDebt, collateralCoin] = tx.moveCall({
  target: `${protocolPackage}::liquidate::liquidate`,
  typeArguments: [DEBT_COIN_TYPE, COLLATERAL_COIN_TYPE],
  arguments: [
    tx.object(versionObject),
    tx.object(obligationId),
    tx.object(marketObject),
    debtCoin, // The coin object used to repay the debt
    tx.object(decimalsRegistry),
    tx.object(xOracle),
    tx.object('0x6'), // Clock
  ],
});
```

> **Note**: The function returns **two values**: the remaining debt coin (if any) and the seized collateral coin. Both must be handled in your PTB.

---

## **Oracle Price Updates (Critical)**

Before calling `liquidate`, `borrow`, or any function that checks the Health Factor, you **MUST** update the oracle prices. Failure to do so will result in stale price errors (e.g., Error 1025).

```typescript
const txBlock = await scallopBuilder.createTxBlock();
// Update prices for all relevant assets in the transaction
await txBlock.updateAssetPricesQuick(['sui', 'usdc', 'wusdc', 'usdt']);
```

### **xOracle & EMA Lag**
Scallop uses **xOracle**, which implements an **Exponentially Moving Average (EMA)** price rather than a spot price. 
- Spot prices (from Pyth) may show a position as liquidatable (HF < 1).
- xOracle EMA might still show the position as healthy (HF >= 1).
- **Strategy**: Liquidators need to wait for a sustained price drop before the xOracle price reflects the liquidatable state.

---

## **Obligation Lock System**

Positions participating in incentive programs may be **locked**. Locked positions cannot be liquidated directly.

### **Check Lock Status**
```typescript
const obObj = await client.getObject({ id: obligationId, options: { showContent: true } });
const fields = obObj.data?.content?.fields;
const isLocked = fields?.lock_key !== null;
```

### **Force Unstake**
If a position is unhealthy but locked, you must call `force_unstake_if_unhealthy` before liquidating.
- **Package**: `0xfd7df3325e1b9860a1e3f1237a4cf91dccf4ad507fb2bce488cdaaca852db94c`

---

## **Scallop Error Codes**

| Code | Description | Solution |
| :--- | :--- | :--- |
| **1025** | Oracle price not found or stale | Ensure `updateAssetPricesQuick` is called in the PTB. |
| **1537** | Position is healthy (HF >= 1) | Position cannot be liquidated yet. Check EMA lag. |
| **1283** | Flash loan repayment failed | Repayment amount is insufficient (check fees). |
| **513** | Version/Package mismatch | Update the `version` object ID in your config. |

---

## **Health Factor Calculation**

Liquidations are triggered when `HF < 1`.

\[ \text{HF} = \frac{\text{Borrow Capacity}}{\text{Total Debt}} \]
\[ \text{Borrow Capacity} = \sum (\text{Collateral Value} \times \text{LTV}) \]

### **Standard LTV Values**
- **SUI**: 0.70
- **USDC**: 0.85
- **ETH**: 0.75
- **afSUI**: 0.65
