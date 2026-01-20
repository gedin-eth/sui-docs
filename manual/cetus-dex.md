# Cetus CLMM DEX

<!--
Module: Cetus DEX Documentation
Purpose: Guides and examples for the Cetus Concentrated Liquidity Market Maker on Sui.
Usage: Reference for developers building on or integrating with Cetus DEX.
-->

**Cetus** is a leading DEX and concentrated liquidity protocol built on Sui. It allows users to provide liquidity within custom price ranges, significantly increasing capital efficiency.

## **SDK Integration**

The Cetus SDK provides tools for swapping, managing liquidity positions, and fetching pool statistics.

### **Installation**
```bash
npm install @cetusprotocol/cetus-sui-clmm-sdk bn.js
```

### **Performing a Swap**
A swap on Cetus involves fetching pool data, simulating the swap (preswap), and building the transaction.

```typescript
import { initCetusSDK, Percentage, d } from '@cetusprotocol/cetus-sui-clmm-sdk';
import BN from 'bn.js';

const sdk = initCetusSDK({ network: 'mainnet' });
const poolAddress = '<POOL_ID>';

// Swap 1 SUI for USDC
const pool = await sdk.Pool.getPool(poolAddress);
const res = await sdk.Swap.preswap({
  pool: pool,
  current_sqrt_price: pool.current_sqrt_price,
  coinTypeA: pool.coinTypeA,
  coinTypeB: pool.coinTypeB,
  decimalsA: 9, // SUI
  decimalsB: 6, // USDC
  a2b: true, // SUI to USDC
  by_amount_in: true,
  amount: (10 ** 9).toString(),
});

// Build transaction payload
const swapPayload = sdk.Swap.createSwapTransactionPayload({
  pool_id: pool.poolAddress,
  coinTypeA: pool.coinTypeA,
  coinTypeB: pool.coinTypeB,
  a2b: true,
  by_amount_in: true,
  amount: res.amount.toString(),
  amount_limit: res.estimatedAmountOut.toString(), // Simplified
});
```

---

## **Liquidity Provision**

Adding concentrated liquidity to a Cetus pool.

### **Add Liquidity**
```typescript
const addLiquidityPayload = sdk.Position.createAddLiquidityPayload({
  pool_id: pool.poolAddress,
  coinTypeA: pool.coinTypeA,
  coinTypeB: pool.coinTypeB,
  tick_lower: -1000,
  tick_upper: 1000,
  amount_a: '1000000',
  amount_b: '1000000',
  fix_amount_a: true,
});
```

---

## **Verification via CLI**

Using the Sui CLI to interact with Cetus pools via PTBs.

### **Fetch Pool Balance**
```bash
sui client object <POOL_ID>
```
