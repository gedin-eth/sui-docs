---
title: "Chapter 9: DeFi - Aftermath Router"
linkTitle: "9. Aftermath Router"
weight: 9
type: docs
description: "Integration guide for Aftermath DEX aggregator router API"
---

**Aftermath Router** is a DEX aggregator that finds optimal swap routes across multiple protocols on Sui. The router API provides quotes and transaction building for multi-hop swaps.

## API Integration

### Endpoint Configuration

The Aftermath router API uses POST requests with JSON bodies:

- **Trade Route Endpoint**: `https://aftermath.finance/api/router/trade-route`
- **Transaction Endpoint**: `https://aftermath.finance/api/router/transactions/trade`

**Important**: The endpoint is `aftermath.finance/api/router/trade-route` (not `router.aftermath.finance` which doesn't exist).

### Getting a Quote

```typescript
async function getAftermathQuote(
  inputCoinType: string,
  outputCoinType: string,
  amount: string
): Promise<any> {
  const response = await fetch('https://aftermath.finance/api/router/trade-route', {
    method: 'POST', // Not GET!
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      coinInType: inputCoinType,
      coinOutType: outputCoinType,
      coinInAmount: amount,
      // Optional: slippage, referrer, protocolBlacklist, etc.
    }),
  });

  if (!response.ok) {
    throw new Error(`Aftermath router API error: ${response.statusText}`);
  }

  return response.json();
}
```

### Executing a Swap

The API returns a serialized Transaction JSON object that must be deserialized using the Sui TypeScript SDK:

```typescript
import { SuiClient, getFullnodeUrl } from '@mysten/sui/client';
import { Transaction } from '@mysten/sui/transactions';

async function executeAftermathSwap(
  client: SuiClient,
  inputCoinType: string,
  outputCoinType: string,
  amount: string,
  sender: string
): Promise<string> {
  // Step 1: Get trade route
  const routeResponse = await getAftermathQuote(inputCoinType, outputCoinType, amount);

  // Step 2: Get transaction for the route
  const txResponse = await fetch('https://aftermath.finance/api/router/transactions/trade', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      walletAddress: sender,
      completeRoute: routeResponse,
      slippage: 0.01, // 1% slippage tolerance
    }),
  });

  if (!txResponse.ok) {
    throw new Error(`Aftermath transaction API error: ${txResponse.statusText}`);
  }

  const txData = await txResponse.json();

  // Step 3: Build transaction from JSON
  // The API returns serialized Transaction JSON object, not base64 bytes
  const transactionData = txData.transaction;
  const tx = Transaction.from(transactionData);

  // Step 4: Sign and execute
  // Note: In production, you'd use your keypair here
  // const result = await client.signAndExecuteTransaction({
  //   signer: keypair,
  //   transaction: tx,
  //   options: { showEffects: true },
  // });

  // return result.digest;
  return 'transaction_digest_placeholder';
}
```

## Key Lessons Learned

1. **API Method**: The API uses POST with JSON body, not GET with query params
2. **Endpoint**: Correct endpoint is `https://aftermath.finance/api/router/trade-route` (not `router.aftermath.finance`)
3. **Transaction Format**: API returns Transaction JSON object (not base64 bytes), requires deserialization with `Transaction.from()`
4. **Authentication**: Router API works without authentication at default rate limits

## Example Usage

```typescript
async function main() {
  const client = new SuiClient({ url: getFullnodeUrl('mainnet') });
  const sender = '0x...'; // Your address

  try {
    // Get quote for swapping 1 SUI to USDC
    const quote = await getAftermathQuote(
      '0x2::sui::SUI',
      '0xdba34672e30cb065b1f93e3ab55318768fd6fef66c15942c9f7cb846e2f900e7::usdc::USDC',
      '1000000000' // 1 SUI in base units
    );

    console.log('Quote received:', quote);

    // Execute swap
    // const digest = await executeAftermathSwap(
    //   client,
    //   '0x2::sui::SUI',
    //   '0xdba34672e30cb065b1f93e3ab55318768fd6fef66c15942c9f7cb846e2f900e7::usdc::USDC',
    //   '1000000000',
    //   sender
    // );

    // console.log('Swap executed:', digest);
  } catch (error) {
    console.error('Aftermath router error:', error);
  }
}
```

**Example**: See `examples/defi/aftermath_router.ts` for complete implementation.
