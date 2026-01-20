# Chapter 8: Troubleshooting

This index maps common error strings to verified remediation steps.

## 🛠️ Transaction Errors

| Error String | Meaning | Remediation |
| :--- | :--- | :--- |
| `InsufficientCoinBalance` | The account does not have enough SUI/MIST to cover the transaction or gas. | 1. Use `sui client gas` to check balance. 2. Request funds from faucet. 3. Ensure `tx.setGasBudget()` is sufficient. |
| `DryRun failure` | The transaction logic would fail if executed. | 1. Check object ownership. 2. Verify type arguments. 3. Check for arithmetic overflow in Move code. |

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

## 🤖 AI Guardrails

If you are using an LLM to generate code:
1.  **Copy-paste** the `config/versions.lock.json` into your prompt.
2.  **Explicitly state**: "Use the versions and patterns defined in this manual. Do not invent RPC URLs."
3.  **Provide the error string**: If the AI's code fails, paste the *exact* error string here to find the fix.
