# Chapter 2: Networks & RPCs

Sui operates multiple networks. Choosing the right endpoint and understanding its limits is critical for a stable application.

## 🌐 Canonical Endpoints

We maintain the latest official endpoints in `config/networks.json`.

| Network | Fullnode RPC URL | Faucet URL |
| :--- | :--- | :--- |
| **Mainnet** | `https://fullnode.mainnet.sui.io:443` | N/A |
| **Testnet** | `https://fullnode.testnet.sui.io:443` | `https://faucet.testnet.sui.io/gas` |
| **Devnet** | `https://fullnode.devnet.sui.io:443` | `https://faucet.devnet.sui.io/gas` |

---

## 🛠️ Connection Pattern (TypeScript)

Use the `SuiClient` class from `@mysten/sui/client` to interact with these endpoints.

```typescript
import { SuiClient, getFullnodeUrl } from '@mysten/sui/client';

// Method 1: Use helper for official endpoints
const client = new SuiClient({ url: getFullnodeUrl('testnet') });

// Method 2: Use custom URL (from config/networks.json)
const customClient = new SuiClient({ url: 'https://custom-rpc.com' });
```

### Best Practices:
1.  **Timeouts**: Default timeouts are often too short for complex PTBs. Consider increasing them in your client config if you experience `FetchError` or `Timeout`.
2.  **Retry Logic**: Public RPCs often return `429 Too Many Requests`. Use a library like `p-retry` or similar for critical operations.
3.  **Data Persistence**: If your app requires historical data (more than the last few checkpoints), public RPCs may not be sufficient. Consider using an indexer (e.g., Suiscan API, Enoki) or running your own fullnode.

### **Rate Limits & Retry Patterns**

**Lesson Learned**: Public RPC (Mysten) rate limits at ~100 requests/sec. Implement retry logic with exponential backoff and batch parallel requests.

#### **Exponential Backoff Retry**

```typescript
import { retryWithBackoff } from './utils/retry';

// Wrap RPC calls with retry logic
const events = await retryWithBackoff(() =>
  client.queryEvents({
    query: { MoveEventType: '...' },
    limit: 50,
  })
);
```

#### **Batch Parallel Requests**

**Lesson Learned**: Batch parallel requests (10 at a time) instead of 50 to avoid rate limits.

```typescript
import { batchProcess } from './utils/retry';

// Process items in batches of 10
const results = await batchProcess(
  obligationIds,
  async (id) => await query.queryObligation(id),
  10 // Batch size
);
```

**Implementation**: See `scripts/utils/retry.ts` for the complete retry utility with exponential backoff and batch processing.

---

## 🚦 Health Checks

Before starting any automated operation, verify the RPC health:

```typescript
const chainId = await client.getChainIdentifier();
const apiVersion = await client.getRpcApiVersion();
console.log(`Connected to ${chainId} running API ${apiVersion}`);
```

Refer to the `scripts/doctor.ts` in this repo for a complete health-check implementation.
