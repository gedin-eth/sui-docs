# Chapter 5: DeFi - Cetus (CLMM)

Cetus is a pioneer DEX and concentrated liquidity protocol built on Sui. This chapter focuses on integrating the Cetus SDK for mainnet swaps and liquidity management.

## 📌 Pinned SDK Version
- **Package**: `@cetusprotocol/cetus-sui-clmm-sdk`
- **Version**: `5.4.0` (Refer to `config/versions.lock.json`)

---

## 🛠️ Core Integration Pattern

To interact with Cetus, you need to initialize the `CetusClmmSDK` and configure it for the Sui network.

### 1. Initialization

```typescript
import { CetusClmmSDK } from '@cetusprotocol/cetus-sui-clmm-sdk';
import { SuiClient, getFullnodeUrl } from '@mysten/sui/client';

const client = new SuiClient({ url: getFullnodeUrl('mainnet') });
const sdk = new CetusClmmSDK({
    fullRpcUrl: getFullnodeUrl('mainnet'),
    simulationAccount: {
        address: '0xYourAddress...',
    },
});

// Configure the SDK for Mainnet
sdk.senderAddress = '0xYourAddress...';
```

### 2. Performing a Swap (Exact In)

A swap on Cetus typically involves fetching the pool, calculating the swap result (pre-swap), and then building the transaction.

```typescript
// Simplified logic for an Exact-In swap
async function performSwap(poolAddress: string, amountIn: number) {
    const pool = await sdk.Pool.getPool(poolAddress);
    
    // 1. Calculate pre-swap to get estimated output and price impact
    const preSwapResult = await sdk.Swap.preswap({
        pool,
        current_sqqrt_price: pool.current_sqrt_price,
        coinTypeA: pool.coinTypeA,
        coinTypeB: pool.coinTypeB,
        decimalsA: 9, // Example: SUI
        decimalsB: 6, // Example: USDC
        amount: amountIn.toString(),
        by_amount_in: true,
    });

    // 2. Build the Transaction Block (PTB)
    const tx = await sdk.Swap.createSwapTransactionPayload({
        pool_id: pool.poolAddress,
        coinTypeA: pool.coinTypeA,
        coinTypeB: pool.coinTypeB,
        a2b: true, // Direction: A to B
        amount: amountIn.toString(),
        by_amount_in: true,
        slippage: 0.01, // 1% slippage
    });

    // 3. Execute with Sui SDK
    // ... sign and execute tx ...
}
```

---

## ⚠️ Known Implementation Guardrails

1.  **Slippage Control**: Always implement a slippage tolerance. Volatile markets can cause swaps to fail if the price moves significantly between calculation and execution.
2.  **Tick Spacing**: When adding liquidity, ensure your price ranges align with the pool's `tick_spacing`.
3.  **Simulation**: Use `simulationAccount` for dry-runs. This ensures the PTB will succeed before committing gas.

---

## 🔍 Troubleshooting Cetus

- **Error: `Invalid Pool`**: Ensure the pool address is correct and exists on the network you are targeting (Mainnet vs Testnet).
- **Error: `Insufficient Liquidity`**: The swap amount is too large for the current pool depth. Try a smaller amount or a different pool.
