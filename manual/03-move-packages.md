# Chapter 3: Move Package System (Mainnet)

This chapter defines how to structure Move packages for Sui Mainnet to avoid dependency hell and resolution errors.

## 📦 The "Golden" Move.toml (Mainnet)

For Mainnet development, your `Move.toml` must point to the specific `mainnet` framework revision. This ensures that the bytecode you compile locally is compatible with the bytecode on-chain.

```toml
[package]
name = "my_move_package"
edition = "2024.beta"

[dependencies]
# Canonical Sui Framework dependency for Mainnet
Sui = { git = "https://github.com/MystenLabs/sui.git", subdir = "crates/sui-framework/packages/sui", rev = "framework/mainnet" }

[addresses]
my_move_package = "0x0" # Initial address for publishing
std = "0x1"
sui = "0x2"
```

---

## 🏗️ Address Management Patterns

Sui uses a "Package ID" once a contract is published. You should manage these addresses across environments.

### 1. Development (0x0)
Always use `0x0` in your source code `Move.toml`. This tells the compiler it's a new package.

### 2. Mainnet Deployment
Once published, record the Package ID in a separate `Move.mainnet.toml` or use the `[addresses]` section to update the named address.

---

## 🚦 Common Failures (Mainnet Edition)

### "Failed to resolve dependencies"
**Cause**: The `rev` in your `Move.toml` is inaccessible or incorrect for the network.
**Fix**: Ensure `rev = "framework/mainnet"` is used. If the network just upgraded, run `sui move build --force` to refresh the local cache in `~/.move`.

### "Module mismatch / Bytecode version mismatch"
**Cause**: Your Sui CLI version (e.g., `1.59.1`) is significantly different from the network version (e.g., `1.63.4`).
**Fix**: Update your CLI to match the Mainnet version:
```bash
cargo install --locked --git https://github.com/MystenLabs/sui.git --tag mainnet-v1.63.4 sui
```

---

## 🔍 Verification Step
After building, verify your package against the official Sui repo:
1. Compare your `Move.toml` against [Sui Examples](https://github.com/MystenLabs/sui/tree/main/examples).
2. Check the [Sui Framework Packages](https://github.com/MystenLabs/sui/tree/main/crates/sui-framework/packages/sui) to see if any core APIs have changed.
