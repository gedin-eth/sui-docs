---
title: "Chapter 1: Toolchain & Versioning"
linkTitle: "1. Toolchain"
weight: 1
type: docs
---

To build reliably on Sui, you must eliminate "version drift." This chapter defines the environment used for all examples in this manual.

## Pinned Versions

Refer to `config/versions.lock.json` for the current canonical versions.

| Component | Pinned Version |
| :--- | :--- |
| **Sui CLI** | `1.59.1` |
| **Node.js** | `^20.0.0` |
| **@mysten/sui** | `^1.0.0` |
| **Move Edition** | `2024.beta` |

---

## Environment Validation

We provide a `doctor.ts` script to verify your setup. This is the first thing you should run when encountering issues.

```bash
npm run doctor
```

### Why we pin the CLI

The Sui CLI handles Move package compilation and transaction signing. A version mismatch between your CLI and the network framework can lead to:

- Dependency resolution failures
- Incompatible bytecode compilation
- Transaction serialization errors

---

## Move.toml Standard

When creating new packages, the `Move.toml` should follow the "Golden Template" to ensure dependency resolution works across different networks.

### Recommended [dependencies] pattern

```toml
[dependencies]
Sui = { git = "https://github.com/MystenLabs/sui.git", subdir = "crates/sui-framework/packages/sui", rev = "framework/testnet" }
```

{{% alert title="Warning" color="warning" %}}
Avoid using `devnet` branch for production or testnet packages as it moves frequently and can break your builds unexpectedly.
{{% /alert %}}

---

## Key Management

For local development and testing, use the Sui CLI keystore:

| Command | Description |
|---------|-------------|
| `~/.sui/sui_config/sui.keystore` | Keystore path |
| `sui client addresses` | View addresses |
| `sui client new-address ed25519` | Create new key |
