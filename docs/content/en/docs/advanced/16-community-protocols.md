---
title: "Community DeFi Protocols"
linkTitle: "16. Community Protocols"
weight: 16
type: docs
description: "Overview of community-driven DeFi protocols including SeaProtocol and Legato Finance"
---

The Sui ecosystem features a variety of community-driven protocols focusing on niche markets like prediction markets, escrow services, and specialized AMMs.

---

## SeaProtocol

**SeaProtocol** provides decentralized exchange logic with a focus on modularity and security. It includes several specialized modules for different DeFi use cases.

### Core Modules

- **AMMs**: Standard and specialized automated market maker implementations.
- **Aggregators**: Routing logic for interacting with multiple liquidity sources.
- **Escrow**: Secure on-chain escrow services for trustless asset exchanges.

### Verification

Explore the Move modules for escrow and AMM logic:

```bash
# Example: Inspecting a SeaProtocol AMM pool
sui client object <SEA_AMM_POOL_ID>
```

---

## Legato Finance

**Legato Finance** focuses on yield-bearing assets and prediction markets. It provides tools for liquid staking and speculative markets.

### Key Features

- **Liquid Staking**: Lock Sui staking rewards into fixed-rate vaults.
- **Prediction Markets**: Speculate on real-world events or on-chain metrics.
- **Yield Tokens**: Composable tokens representing future yield.

### Verification

Check the status of a Legato vault:

```bash
sui client object <LEGATO_VAULT_ID>
```

---

## Sui Butler

**Sui Butler** is a collection of utility tools and MCP (Model Context Protocol) servers designed to simplify common developer tasks.

### Tooling Suite

- **Coin Deployment**: CLI tools for quickly deploying new tokens.
- **Balance Checks**: Batch balance querying across multiple addresses.
- **MCP Servers**: Standardized interfaces for AI agents to interact with the Sui blockchain.

### Usage

```bash
# Example usage of Sui Butler CLI (if installed)
butler balance <ADDRESS>
butler deploy-coin --name "MyToken" --symbol "MTK"
```
