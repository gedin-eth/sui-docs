---
title: "Chapter 17: Troubleshooting"
linkTitle: "17. Troubleshooting"
weight: 17
type: docs
---

This index maps common error strings to verified remediation steps.

## Transaction Errors

| Error String | Meaning | Remediation |
| :--- | :--- | :--- |
| `InsufficientCoinBalance` | Account doesn't have enough SUI/MIST for transaction or gas | 1. Use `sui client gas` to check balance. 2. Request funds from faucet. 3. Ensure `tx.setGasBudget()` is sufficient. |
| `DryRun failure` | Transaction logic would fail if executed | 1. Check object ownership. 2. Verify type arguments. 3. Check for arithmetic overflow in Move code. |
| `Invalid Sui address 0x...` | Placeholder address `'0x...'` was used in `tx.pure.address()` or similar validation | Replace placeholder with actual address, or use keypair address: `const address = SENDER.includes('...') ? keypair.toSuiAddress() : SENDER;` |
| `Invalid mnemonic` | Placeholder mnemonic like `'your mnemonic here'` was used | Set `MNEMONIC` environment variable or update `scripts/auth.ts` with a valid mnemonic. For conceptual examples, add validation to skip execution. |

---

## SDK-Specific "Gotchas"

| Protocol | Issue | Remediation |
| :--- | :--- | :--- |
| **Scallop** | `createClient` not a function | Use `createScallopClient()`, `createScallopBuilder()`, etc. The SDK updated to more explicit naming. |
| **Cetus** | `CetusChildSDK` not a constructor | Use `CetusClmmSDK`. Also, ensure you initialize with `fullRpcUrl` and `simulationAccount` in the options. |
| **Cetus** | `InvalidPoolObject` | The pool ID might have changed. Use `sdk.Pool.getPools()` to fetch the latest IDs from the registry. |
| **NAVI** | `deposit` not a function | Use `depositToNavi(Sui, amount)`. Ensure you import the `Sui` constant from the SDK. |
| **NAVI** | `NAVIClient` not a constructor | Use `NAVISDKClient`. |

---

## Move & Dependency Errors

| Error String | Meaning | Remediation |
| :--- | :--- | :--- |
| `dependencies automatically added... disabled` | Conflict between explicit and implicit Sui dependencies | 1. Check `Move.toml` for duplicate `Sui` entries. 2. Ensure `rev` matches the network framework. |
| `Failed to resolve dependencies` | CLI cannot fetch or compile the git dependency | 1. Check internet connection. 2. Verify the `git` URL and `subdir` in `Move.toml`. 3. Try `sui move build --force`. |

---

## Network & RPC Errors

| Error String | Meaning | Remediation |
| :--- | :--- | :--- |
| `Client/Server api version mismatch` | Sui CLI older or newer than the RPC node | Often just a warning, but if commands fail, update your CLI to match the `server api version` shown. |
| `429 Too Many Requests` | Hitting rate limits on public RPC | 1. Implement backoff/retry in your code. 2. Use a private RPC provider for high-volume apps. |

---

## Scallop Protocol Errors

| Code | Meaning | Remediation |
| :--- | :--- | :--- |
| **513** | `assert_current_version` - Version mismatch | Protocol version object changed. Use SDK to retrieve current package ID dynamically. |
| **1025** | Oracle price not found/stale | Call `txBlock.updateAssetPricesQuick(['sui', 'usdc', ...])` for ALL coins in the obligation. |
| **1283** | Flash loan repayment failed | Repayment coin too small or missing. Ensure you swapped collateral back to debt asset. |
| **1537** | Position is healthy (HF >= 1) | Cannot liquidate. Scallop uses EMA prices via xOracle, which may lag behind spot. |
| **770** | Obligation locked | Position in incentive program. Call `force_unstake_if_unhealthy` before liquidating. |

---

## AI Guardrails

If you are using an LLM to generate code:

1. **Copy-paste** the `config/versions.lock.json` into your prompt
2. **Explicitly state**: "Use the versions and patterns defined in this manual. Do not invent RPC URLs."
3. **Provide the error string**: If the AI's code fails, paste the *exact* error string here to find the fix
