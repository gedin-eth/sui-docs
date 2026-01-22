---
title: "Sui Move Fundamentals"
linkTitle: "0. Move Basics"
weight: 0
type: docs
description: "Core Move programming concepts on Sui including objects, abilities, and ownership"
---

**Move** is a safe and expressive language for programmable assets on Sui. It prioritizes **security** and **resource management** through a robust system of types and abilities.

## Language Architecture

### Abilities

Every type in Move can have up to four **Abilities** that define how values of that type can be handled:

- `key`: Allows a struct to be used as a Sui object (requires an `id: UID` field).
- `store`: Allows a struct to be stored inside another struct.
- `copy`: Allows a value to be duplicated.
- `drop`: Allows a value to be ignored or destroyed at the end of a scope.

### Ownership & References

Move uses strict ownership rules to prevent common bugs like reentrancy or double-spending:

1. **Pass by Value**: Ownership is transferred (moved) to the function.
2. **Immutable Reference (`&T`)**: Read-only access to the data.
3. **Mutable Reference (`&mut T`)**: Read and write access to the data.

---

## Sui Object Example

Below is a standard template for a Sui Move object.

```move
module my_package::counter {
    use sui::object::{Self, UID};
    use sui::tx_context::{Self, TxContext};
    use sui::transfer;

    /// A simple counter object
    public struct Counter has key, store {
        id: UID,
        value: u64,
    }

    /// Create and share a new counter
    public entry fun create(ctx: &mut TxContext) {
        let counter = Counter {
            id: object::new(ctx),
            value: 0,
        };
        transfer::public_share_object(counter);
    }

    /// Increment the counter
    public entry fun increment(counter: &mut Counter) {
        counter.value = counter.value + 1;
    }
}
```

---

## Deployment & Testing

### Build & Publish

Use the Sui CLI to compile and deploy your Move package:

```bash
# Compile the package
sui move build

# Run unit tests
sui move test

# Publish to the network
sui client publish --gas-budget 100000000
```

### PTB Integration

Calling Move functions from a Programmable Transaction Block:

```bash
sui client ptb \
  --gas-budget 10000000 \
  --move-call my_package::counter::increment "@0xCOUNTER_ID"
```
