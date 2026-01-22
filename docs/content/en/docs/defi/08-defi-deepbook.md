---
title: "Chapter 8: DeFi - DeepBook (CLOB)"
linkTitle: "8. DeepBook CLOB"
weight: 8
type: docs
description: "Integration guide for DeepBook V3 CLOB - flash loans, swaps, and order book operations"
---

**DeepBook V3** is a high-performance, low-latency decentralized central limit order book (CLOB) built natively on the Sui blockchain. It introduces enhanced account abstraction through the **Balance Manager** and optimized fee structures using the **DEEP token**.

## Core Architecture

### Balance Manager

The `BalanceManager` is a shared object that manages all balances for an account.

- **Owner**: Can deposit, withdraw, and manage traders.
- **Traders**: Up to 1000 traders can be authorized to place and cancel orders on behalf of the owner.
- **Unified Balances**: A single `BalanceManager` can be used across all pools.

### Pool Structure

A `Pool` in DeepBook V3 consists of:

- **Book**: Manages order matching and execution.
- **State**: Tracks user data, volumes, and governance.
- **Vault**: Handles settlement of funds.

---

## Swap Implementation (PTB)

For swapping in a Programmable Transaction Block, use `swap_exact_base_for_quote`:

```typescript
import { Transaction } from '@mysten/sui/transactions';

const DEEPBOOK_PACKAGE = '0xb29d83c2bcefe45ce0ef7357a94568c88610bac9f6d59b43cc67a8b52672533e';

const tx = new Transaction();

// Create zero coin for quote side
const zeroQuote = tx.moveCall({
  target: '0x2::coin::zero',
  typeArguments: [QUOTE_COIN_TYPE],
});

// Swap returns: (Coin<Base>, Coin<Quote>, Coin<DEEP>)
const [baseCoinOut, quoteCoinOut, deepCoin] = tx.moveCall({
  target: `${DEEPBOOK_PACKAGE}::clob_v2::swap_exact_base_for_quote`,
  arguments: [
    tx.object(POOL_ID),
    tx.pure.u64(0), // client_order_id
    tx.object(ACCOUNT_CAP_ID), // ⚠️ Required: AccountCap from custodian
    tx.pure.u64(quantity),
    baseCoin,
    zeroQuote,
    tx.object('0x6'), // clock
  ],
  typeArguments: [BASE_COIN_TYPE, QUOTE_COIN_TYPE],
});
```

**Important**: You must obtain an `AccountCap` from the DeepBook custodian module before executing swaps. See the DeepBook documentation for account setup.

**Example Location**: `examples/defi/cyclic_arbitrage.ts` (Leg 1: SUI -> USDC)

**Note**: The example demonstrates the correct function signature and tuple destructuring. In production, you'll need a valid AccountCap object ID to replace the placeholder.

---

## Flash Loan Architecture

**Lesson Learned**: DeepBook V3 has separate functions for borrowing flash loans in base vs quote tokens. You must match the token type exactly when returning the loan.

### Borrow Flash Loan in Base Token

```typescript
// Borrow SUI (base token)
const [baseCoin, quoteCoin, deepCoin, receipt] = tx.moveCall({
  target: `${DEEPBOOK_PACKAGE}::clob_v2::borrow_flashloan_base`,
  arguments: [
    tx.object(POOL_ID),
    tx.object(ACCOUNT_CAP_ID),
    tx.pure.u64(amount),
    zeroDeep, // Zero DEEP coin for fees
    tx.object('0x6'), // clock
  ],
  typeArguments: [BASE_COIN_TYPE, QUOTE_COIN_TYPE],
});

// Repay MUST use repay_flashloan_base and return BASE token
tx.moveCall({
  target: `${DEEPBOOK_PACKAGE}::clob_v2::repay_flashloan_base`,
  arguments: [tx.object(POOL_ID), baseCoin, receipt, tx.object('0x6')],
  typeArguments: [BASE_COIN_TYPE, QUOTE_COIN_TYPE],
});
```

### Borrow Flash Loan in Quote Token

```typescript
// Borrow USDC (quote token)
const [baseCoin, quoteCoin, deepCoin, receipt] = tx.moveCall({
  target: `${DEEPBOOK_PACKAGE}::clob_v2::borrow_flashloan_quote`,
  arguments: [
    tx.object(POOL_ID),
    tx.object(ACCOUNT_CAP_ID),
    tx.pure.u64(amount),
    zeroDeep,
    tx.object('0x6'),
  ],
  typeArguments: [BASE_COIN_TYPE, QUOTE_COIN_TYPE],
});

// Repay MUST use repay_flashloan_quote and return QUOTE token
tx.moveCall({
  target: `${DEEPBOOK_PACKAGE}::clob_v2::repay_flashloan_quote`,
  arguments: [tx.object(POOL_ID), quoteCoin, receipt, tx.object('0x6')],
  typeArguments: [BASE_COIN_TYPE, QUOTE_COIN_TYPE],
});
```

**Key Points**:

- Use `borrow_flashloan_base` for base token (e.g., SUI)
- Use `borrow_flashloan_quote` for quote token (e.g., USDC)
- Repayment function must match the borrow function (`repay_flashloan_base` vs `repay_flashloan_quote`)
- Token type in repayment must match the borrowed token type
- Zero DEEP coin for fees works (for now)

**Example**: See `examples/defi/deepbook_flashloan.ts` for complete implementations.

---

## Verification via CLI

### Query Pool Details

```bash
# Query DEEP-SUI Pool on Mainnet
sui client object 0xb663828d6217467c8a1838a03793da896cbe745b150ebd57d82f814ca579fc22
```

### Check Balance Manager

```bash
sui client object <BALANCE_MANAGER_ID>
```
