# Oracle Integration

<!--
Module: Oracle Integration Documentation
Purpose: Explains the Pyth Pull Model and xOracle integration on Sui.
Usage: Reference for developers building real-time pricing systems or liquidators.
-->

Most high-performance DeFi protocols on Sui utilize a **Pull Oracle** model, where price updates are fetched off-chain and pushed into the transaction block by the caller.

## **Pyth Hermes API**

Pyth provides real-time price updates via the **Hermes API**. Developers fetch a "VAA" (Verified Action Attestation) and include it in their transaction.

### **Fetch Latest Price**
```typescript
const feedId = '0x...'; // Asset specific feed ID
const url = `https://hermes.pyth.network/v2/updates/price/latest?ids[]=${feedId}`;

const response = await fetch(url);
const priceData = await response.json();
```

---

## **Mainnet Price Feed IDs**

| Asset | Feed ID |
| :--- | :--- |
| **SUI** | `0x23d7315113f5b1d3ba7a83604c44b94d79f4fd69af77f804fc7f920a6dc65744` |
| **USDC** | `0xeaa020c61cc479712813461ce153894a96a6c00b21ed0cfc2798d1f9a9e9c94a` |
| **USDT** | `0x2b89b9dc8fdf9f34709a5b106b472f0f39bb6ca9ce04b0fd7f2e971688e2e53b` |
| **ETH** | `0xff61491a931112ddf1bd8147cd1b641375f79f5825126d665480874634fd0ace` |

---

## **Scallop: xOracle Integration**

Scallop's **xOracle** acts as a middle layer that consumes Pyth prices and applies an **Exponentially Moving Average (EMA)** filter.

### **Mandatory PTB Step**
Before any action that checks health (borrow, liquidate, withdraw), the oracle state must be updated.

```typescript
const stx = scallopBuilder.createTxBlock();
// This helper fetches VAAs and adds move calls to push them to xOracle
await stx.updateAssetPricesQuick(['sui', 'usdc']);
```

### **EMA Lag Insight**
Because xOracle uses EMA, there is an intentional delay in price movements.
- **Spot Price Drop**: Pyth might show a position at 95% collateralization (liquidatable).
- **EMA Buffer**: Scallop might still see it at 105% (healthy) for several minutes.
- **Bot Strategy**: Successful liquidators monitor both spot and EMA prices to time their transactions as soon as the EMA crosses the threshold.
