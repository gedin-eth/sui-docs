---
title: "Chapter 7: DeFi - NAVI (Liquidity Protocol)"
linkTitle: "7. NAVI"
weight: 7
type: docs
---

NAVI is a native one-stop liquidity protocol on Sui. This chapter covers the integration of the NAVI SDK for lending, borrowing, and yield strategies on mainnet.

## Pinned SDK Version

| Package | Version |
|---------|---------|
| `navi-sdk` | `^2.0.0` |

---

## Core Integration Pattern

The NAVI SDK is designed around a central `NAVISDKClient` that manages connections and transaction building.

### 1. Initialization

```typescript
import { NAVISDKClient, Sui } from 'navi-sdk';
import { Ed25519Keypair } from '@mysten/sui/keypairs/ed25519';

// Initialize with mnemonics (In production, use secure environment variables)
const client = new NAVISDKClient({
  mnemonic: process.env.MNEMONIC,
  networkType: 'mainnet',
  numberOfAccounts: 1,
});
```

### 2. Supplying Assets (Deposit)

To supply assets like SUI or USDC to NAVI:

```typescript
async function depositToNavi(amount: number) {
  const account = client.accounts[0];
  // Deposit 1 SUI (using MIST: 1,000,000,000)
  const res = await account.depositToNavi(Sui, 1_000_000_000);
  console.log('Deposit success:', res.digest);
}
```

### 3. Borrowing Assets

Before borrowing, ensure you have sufficient collateral deposited.

```typescript
async function borrowFromNavi(amount: number) {
  const account = client.accounts[0];
  // Borrow 10 USDC
  const res = await account.borrow('USDC', 10_000_000);
  console.log('Borrow success:', res.digest);
}
```

---

## Known Implementation Guardrails

1. **Mainnet Only**: The NAVI SDK is pre-configured with Mainnet object IDs. Using it on Testnet requires manually overriding the `AddressConfig`.

2. **Health Factor**: Always monitor your `Health Factor` when borrowing. If it drops below 1, your collateral is at risk of liquidation.

3. **Coin Types**: NAVI uses internal names like `Sui`, `USDC`, `USDT`. Ensure you use the correct string identifiers defined in the SDK constants.

---

## Troubleshooting NAVI

| Error | Cause | Fix |
|-------|-------|-----|
| `Invalid Mnemonic` | Mnemonic format wrong | Must be 12 or 24-word string |
| `Insufficient Liquidity` | Pool is empty | Try different pool or wait |
| `Below Health Factor` | Not enough collateral | Deposit more or repay debt |
