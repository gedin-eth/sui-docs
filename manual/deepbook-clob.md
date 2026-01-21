# DeepBook V3 CLOB

<!--
Module: DeepBook V3 Documentation
Purpose: Provides guides and Move examples for the DeepBook V3 decentralized central limit order book on Sui.
Usage: Reference for developers building on or integrating with DeepBook V3.
-->

**DeepBook V3** is a high-performance, low-latency decentralized central limit order book (CLOB) built natively on the Sui blockchain. It introduces enhanced account abstraction through the **Balance Manager** and optimized fee structures using the **DEEP token**.

## **Core Architecture**

### **Balance Manager**
The `BalanceManager` is a shared object that manages all balances for an account. 
- **Owner**: Can deposit, withdraw, and manage traders.
- **Traders**: Up to 1000 traders can be authorized to place and cancel orders on behalf of the owner.
- **Unified Balances**: A single `BalanceManager` can be used across all pools.

### **Pool Structure**
A `Pool` in DeepBook V3 consists of:
- **Book**: Manages order matching and execution.
- **State**: Tracks user data, volumes, and governance.
- **Vault**: Handles settlement of funds.

---

## **Move Implementation Examples**

### **Placing a Limit Order**
To place a limit order, you must first generate a trade proof from your `BalanceManager`.

```move
use deepbook::pool::{Self, Pool};
use deepbook::balance_manager::{Self, BalanceManager};
use deepbook::constants;
use sui::clock::Clock;

public fun place_limit_buy_order<BaseAsset, QuoteAsset>(
    pool: &mut Pool<BaseAsset, QuoteAsset>,
    balance_manager: &mut BalanceManager,
    price: u64,
    quantity: u64,
    clock: &Clock,
    ctx: &TxContext,
) {
    // Generate proof as owner to authorize the trade
    let trade_proof = balance_manager::generate_proof_as_owner(balance_manager, ctx);

    pool::place_limit_order(
        pool,
        balance_manager,
        &trade_proof,
        0,                            // client_order_id
        constants::no_restriction(),  // GTC (Good Til Cancelled)
        constants::cancel_taker(),    // Self-matching option
        price,
        quantity,
        true,                         // is_bid (true for buy)
        true,                         // pay_with_deep (use DEEP for fees)
        constants::max_u64(),         // No expiration
        clock,
        ctx,
    );
}
```

### **Cancelling an Order**
```move
public fun cancel_single_order<BaseAsset, QuoteAsset>(
    pool: &mut Pool<BaseAsset, QuoteAsset>,
    balance_manager: &mut BalanceManager,
    order_id: u128,
    clock: &Clock,
    ctx: &TxContext,
) {
    let trade_proof = balance_manager::generate_proof_as_owner(balance_manager, ctx);

    pool::cancel_order(
        pool,
        balance_manager,
        &trade_proof,
        order_id,
        clock,
        ctx,
    );
}
```

---

## **Swap Implementation (PTB)**

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

## **Verification via CLI**

### **Query Pool Details**
```bash
# Query DEEP-SUI Pool on Mainnet
sui client object 0xb663828d6217467c8a1838a03793da896cbe745b150ebd57d82f814ca579fc22
```

### **Check Balance Manager**
```bash
sui client object <BALANCE_MANAGER_ID>
```
