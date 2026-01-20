# Suilend Protocol

<!--
Module: Suilend Documentation
Purpose: Guides and examples for the Suilend lending protocol on Sui.
Usage: Developer reference for integrating Suilend lending and liquidations.
-->

**Suilend** is a high-performance lending market on Sui, built by the team behind Solend. It features a sophisticated risk engine and efficient liquidation mechanisms.

## **SDK Integration**

### **Installation**
```bash
npm install @suilend/sdk @mysten/sui@^1.38.0 @suilend/sui-fe@^0.3.5
```

### **Initialization**
```typescript
import { SuilendClient, LENDING_MARKET_ID, LENDING_MARKET_TYPE } from "@suilend/sdk";
import { SuiClient } from "@mysten/sui/client";

const suiClient = new SuiClient({ url: "https://fullnode.mainnet.sui.io:443" });
const suilendClient = await SuilendClient.initialize(
  LENDING_MARKET_ID,
  LENDING_MARKET_TYPE,
  suiClient
);
```

---

## **Liquidation API**

Suilend provides dedicated methods for liquidations, allowing liquidators to either receive `cTokens` or automatically redeem them for the underlying asset.

### **Liquidate and Receive cTokens**
```typescript
// repayCoin is the coin object used to pay the debt
await suilendClient.liquidate(
    tx, 
    obligation, 
    repayCoinType, 
    withdrawCoinType, 
    repayCoin
);
```

### **Liquidate and Redeem to Underlying**
```typescript
await suilendClient.liquidateAndRedeem(
    tx, 
    obligation, 
    repayCoinType, 
    withdrawCoinType, 
    repayCoin
);
```

---

## **Liquidation Parameters**

- **Close Factor**: 20% (Liquidators can repay up to 20% of the user's loan in a single transaction).
- **Liquidation Bonus**: 5% (Liquidators receive 5% more collateral than the debt repaid).
- **Reference Implementation**: See the `suilend-public/liquidator` repository for a Redis-based worker pattern.

---

## **Mainnet Addresses**

| Parameter | Value |
| :--- | :--- |
| **Package ID** | `0xf95b06141ed4a174f239417323bde3f209b972f5930d8521ea38a52aff3a6ddf` |
| **Lending Market ID** | `0x84030d26d85eaa7035084a057f2f11f701b7e2e4eda87551becbc7c97505ece1` |
| **Lending Market Type** | `0xf95b...ddf::suilend::MAIN_POOL` |
