# Chapter 8: Troubleshooting

This index maps common error strings to verified remediation steps.

## 🛠️ Transaction Errors

| Error String | Meaning | Remediation |
| :--- | :--- | :--- |
| `InsufficientCoinBalance` | The account does not have enough SUI/MIST to cover the transaction or gas. | 1. Use `sui client gas` to check balance. 2. Request funds from faucet. 3. Ensure `tx.setGasBudget()` is sufficient. |
| `DryRun failure` | The transaction logic would fail if executed. | 1. Check object ownership. 2. Verify type arguments. 3. Check for arithmetic overflow in Move code. |
| `Invalid Sui address 0x...` | Placeholder address `'0x...'` was used in `tx.pure.address()` or similar validation. | Replace placeholder with actual address, or use keypair address: `const address = SENDER.includes('...') ? keypair.toSuiAddress() : SENDER;` |
| `Invalid mnemonic` | Placeholder mnemonic like `'your mnemonic here'` was used. | Set `MNEMONIC` environment variable or update `scripts/auth.ts` with a valid mnemonic. For conceptual examples, add validation to skip execution. |

---

## 🌊 SDK-Specific "Gotchas"

| Protocol | Issue | Remediation |
| :--- | :--- | :--- |
| **Scallop** | `createClient` not a function | Use `createScallopClient()`, `createScallopBuilder()`, etc. The SDK updated to more explicit naming. |
| **Cetus** | `CetusChildSDK` not a constructor | Use `CetusClmmSDK`. Also, ensure you initialize with `fullRpcUrl` and `simulationAccount` in the options. |
| **Cetus** | `InvalidPoolObject` | The pool ID might have changed. Use `sdk.Pool.getPools()` to fetch the latest IDs from the registry. |
| **NAVI** | `deposit` not a function | Use `depositToNavi(Sui, amount)`. Ensure you import the `Sui` constant from the SDK. |
| **NAVI** | `NAVIClient` not a constructor | Use `NAVISDKClient`. |

---

## 🏗️ Move & Dependency Errors

| Error String | Meaning | Remediation |
| :--- | :--- | :--- |
| `dependencies automatically added... disabled` | You have a conflict between explicit and implicit Sui dependencies. | 1. Check `Move.toml` for duplicate `Sui` entries. 2. Ensure `rev` matches the network framework. |
| `Failed to resolve dependencies` | The CLI cannot fetch or compile the specified git dependency. | 1. Check your internet connection. 2. Verify the `git` URL and `subdir` in `Move.toml`. 3. Try `sui move build --force`. |

---

## 🌐 Network & RPC Errors

| Error String | Meaning | Remediation |
| :--- | :--- | :--- |
| `Client/Server api version mismatch` | Your Sui CLI is older or newer than the RPC node. | This is often just a warning, but if commands fail, update your CLI to match the `server api version` shown. |
| `429 Too Many Requests` | You are hitting rate limits on the public RPC. | 1. Implement backoff/retry in your code. 2. Use a private RPC provider for high-volume apps. |

---

## 🐚 Scallop Protocol Errors

| Code | Meaning | Remediation |
| :--- | :--- | :--- |
| **513** | `assert_current_version` - Version mismatch | The protocol version object has changed. Use the SDK to retrieve the current package ID dynamically. |
| **1025** | Oracle price not found/stale | Call `txBlock.updateAssetPricesQuick(['sui', 'usdc', ...])` for ALL coins in the obligation. |
| **1283** | Flash loan repayment failed | Repayment coin is too small or missing. Ensure you have swapped collateral back to the debt asset. |
| **1537** | Position is healthy (HF >= 1) | Cannot liquidate. Scallop uses EMA prices via xOracle, which may lag behind spot prices. |
| **770** | Obligation locked | Position is in an incentive program. Call `force_unstake_if_unhealthy` before liquidating. |

---

---

## 🔄 API Changes

### **Aftermath Router API**

**Lesson Learned**: The Aftermath router API endpoint is `https://aftermath.finance/api/router/trade-route` (not `router.aftermath.finance` which doesn't exist). The API uses POST with JSON body, and the transaction format is Transaction JSON (not base64 bytes).

#### **API Method Change**

**Old (Incorrect)**:
```typescript
// GET with query params - this silently fails with "No route."
// Also, router.aftermath.finance doesn't exist (DNS NXDOMAIN)
const response = await fetch(`https://router.aftermath.finance/api/v1/quote?inputCoinType=...`);
```

**New (Correct)**:
```typescript
// POST with JSON body to correct endpoint
const response = await fetch('https://aftermath.finance/api/router/trade-route', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    coinInType: '0x2::sui::SUI',
    coinOutType: '0x...::usdc::USDC',
    coinInAmount: '1000000000',
  }),
});
```

#### **Transaction Format Change**

**Old**: API returned base64-encoded transaction bytes.

**New**: API returns a serialized Transaction JSON object that must be deserialized using the Sui TypeScript SDK:

```typescript
// Step 1: Get trade route
const routeResponse = await getAftermathQuote(...);

// Step 2: Get transaction for the route
const txResponse = await fetch('https://aftermath.finance/api/router/transactions/trade', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    walletAddress: sender,
    completeRoute: routeResponse,
    slippage: 0.01,
  }),
});
const txData = await txResponse.json();
const tx = Transaction.from(txData.transaction); // Deserialize JSON to Transaction
```

#### **Authentication**

**Lesson Learned**: Auth wasn't the issue. The router API works without authentication at default rate limits. Personal message signing (BCS encoding, intent prefixes) is not required for basic usage.

**Example**: See `examples/defi/aftermath_router.ts` for complete implementation.

---

## 🤖 AI Guardrails

If you are using an LLM to generate code:
1.  **Copy-paste** the `config/versions.lock.json` into your prompt.
2.  **Explicitly state**: "Use the versions and patterns defined in this manual. Do not invent RPC URLs."
3.  **Provide the error string**: If the AI's code fails, paste the *exact* error string here to find the fix.
