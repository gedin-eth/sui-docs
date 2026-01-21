---
title: "Chapter 4: PTBs & Transactions"
linkTitle: "4. PTBs & Transactions"
weight: 4
type: docs
---

Programmable Transaction Blocks (PTBs) are the most powerful feature of the Sui network. They allow you to bundle multiple operations into a single, atomic transaction.

## The "Sui Way": PTB First

On Sui, you should almost never use single-command transactions. Instead, use the `Transaction` class (formerly `TransactionBlock`).

### Why PTBs?

- **Atomicity**: Either all commands succeed, or none do
- **Gas Efficiency**: One gas payment for multiple operations
- **Composability**: Use the output of one command (e.g., a newly split coin) as the input for the next

---

## Verified Pattern: SUI Transfer

This is the canonical way to split SUI from your gas coin and transfer it.

**Example Location**: `examples/ts/ptb_transfer.ts`

```typescript
import { Transaction } from '@mysten/sui/transactions';

const tx = new Transaction();

// 1. Split MIST from the gas coin
// tx.gas refers to the coin object being used to pay for the tx itself
const [coin] = tx.splitCoins(tx.gas, [1000000n]);

// 2. Transfer the result to a recipient
tx.transferObjects([coin], '0xRecipientAddress...');

// 3. Always set an explicit gas budget
tx.setGasBudget(10_000_000n);
```

### Note on Signing

For mainnet execution, you must sign with a valid keypair:

```typescript
const result = await client.signAndExecuteTransaction({
  signer: keypair,
  transaction: tx,
  options: { showEffects: true },
});
```

---

## Inspection & Dry Run

Before executing on-chain, you can "simulate" a transaction to see its effects without paying gas.

```typescript
const dryRunResult = await client.dryRunTransactionBlock({
  transactionBlock: await tx.build({ client }),
});

console.log(dryRunResult.effects.status);
```

---

## Pro Tips

| Tip | Description |
|-----|-------------|
| **Object Ownership** | Ensure the signer owns all objects passed as arguments (unless they are shared or immutable) |
| **MIST vs SUI** | 1 SUI = 1,000,000,000 MIST. Always use `BigInt` (suffixed with `n`) for amounts to avoid precision errors |
| **Coin Management** | Avoid "Coin Dusting." If you need to send many small amounts, batch them into a single PTB with multiple `splitCoins` and `transferObjects` calls |
