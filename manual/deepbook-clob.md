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

## **Verification via CLI**

### **Query Pool Details**
```bash
sui client object <DEEPBOOK_POOL_ID>
```

### **Check Balance Manager**
```bash
sui client object <BALANCE_MANAGER_ID>
```
