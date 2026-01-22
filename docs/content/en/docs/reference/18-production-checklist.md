---
title: "Chapter 18: Production Checklist"
linkTitle: "18. Production Checklist"
weight: 18
type: docs
---

Before deploying your application to Sui Mainnet, ensure you have addressed the following critical areas.

## 1. Security & Key Management

- [ ] **Rotate Developer Keys**: If your seed phrase has ever been shared (e.g., in chat or committed to git), **rotate it immediately**
- [ ] **Hardware Wallets**: For high-value operations or contract upgrades, use a hardware wallet (Ledger) or a secure Multi-Sig (e.g., MSafe)
- [ ] **Environment Variables**: Never hardcode secret keys. Use `.env` files and ensure they are in your `.gitignore`

## 2. Gas Optimization

- [ ] **PTB Batching**: Are you bundling multiple operations into a single Programmable Transaction Block?
- [ ] **Gas Budget**: Use `dry-run` to estimate gas accurately. Avoid setting excessively high budgets that could be drained in case of a bug
- [ ] **Coin Merging**: If your wallet has hundreds of small coin objects, use `sui client merge-coins` to reduce transaction overhead

## 3. Observability & Reliability

- [ ] **Retry Policy**: Do you have a retry mechanism for `429 Too Many Requests` or network timeouts?
- [ ] **Idempotency**: Ensure that retrying a transaction doesn't lead to double-spending or duplicate operations (use transaction digests to track status)
- [ ] **Explorer Links**: Generate and log Explorer links for every transaction to aid in debugging and user support

## 4. Contract Governance

- [ ] **Upgrade Cap**: Who holds the `UpgradeCap` for your Move package? Ensure it is stored in a secure, multi-sig wallet
- [ ] **Immutable Packages**: If your project is complete, consider making the package immutable by destroying the `UpgradeCap`

---

## Final Pre-Flight Check

Run the repository doctor one last time:

```bash
npm run doctor
```

If all checks pass, you are ready for Mainnet.
