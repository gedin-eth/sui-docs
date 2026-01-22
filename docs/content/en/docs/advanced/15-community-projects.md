---
title: "Community Projects & Applications"
linkTitle: "15. Community Projects"
weight: 15
type: docs
description: "Overview of community-driven projects on Sui including launchpads, bots, and wallets"
---

The Sui ecosystem is home to a rapidly growing collection of community-driven projects that showcase the network's scalability and unique object-centric architecture.

---

## Memetic LaunchPad

**Memetic-LaunchPad** is a specialized platform for launching and trading memecoins on Sui. It leverages the Move programming language to provide secure, fair, and transparent launch mechanics.

### Core Mechanisms

- **Sui Move Bonding Curves**: Unlike traditional AMMs, Memetic uses custom Move modules to define price discovery via bonding curves. This ensures that liquidity is automatically provisioned as buying pressure increases.
- **Fair Launch Logic**: Implements "Initial Token Offerings" (ITO) with caps and time-locks to prevent bot manipulation and ensure a wide distribution of tokens.
- **On-Chain Fees**: The protocol automatically routes a percentage of trade fees to platform treasuries or creator rewards, all defined within the Move package.

### Developer Integration

Developers can interact with Memetic contracts to track new launches or build secondary markets:

```bash
# Query a Memetic Launch Pool
sui client object <LAUNCH_POOL_ID>
```

---

## Cetus Volume Booster Bot

The **Cetus Volume Booster Bot** is an automation tool designed to manage market activity on Cetus CLMM pools. It is primarily used by project owners to maintain liquidity and trading visibility.

### Operational Logic

- **Automated Swap Cycles**: The bot executes high-frequency buy and sell orders (e.g., SUI -> Token -> SUI) to maintain consistent volume metrics.
- **Sub-Wallet Distribution**: To mimic organic trading, the bot distributes funds across multiple sub-wallets, executing small trades from different addresses simultaneously.
- **Gas Optimization**: Utilizes Sui's low fees to perform hundreds of transactions per minute, often batching operations where possible within PTBs.

### Verification

Observe bot activity by monitoring the transaction history of a specific pool:

```bash
sui client objects --owner <BOT_WALLET_ADDRESS>
```

---

## GemWallet

**GemWallet** is a leading open-source, non-custodial wallet for the Sui ecosystem, emphasizing security and developer friendliness.

### Key Features for Developers

- **Sui Wallet Standard**: GemWallet fully implements the [Sui Wallet Standard](https://docs.sui.io/standards/wallet-standard), allowing for seamless "Connect Wallet" functionality in any dApp.
- **Transaction Simulation**: Before a user signs, GemWallet uses the `sui_dryRunTransactionBlock` RPC to show exactly which objects will be modified, added, or removed.
- **DeepLink Support**: Allows mobile and web dApps to trigger wallet actions via URI schemes.

---

## Sui Butler (MCP Server)

**Sui Butler** is a toolset and **Model Context Protocol (MCP)** server that enables AI agents (like Claude or GPT) to interact directly with the Sui blockchain.

### Capabilities

- **AI-Driven Deployment**: Use natural language to ask an agent to "Deploy a new coin called SuiGem with 1B supply."
- **Real-Time Data**: Provides the agent with live on-chain data for balance checks, object inspections, and market prices.
- **Automated CLI**: Bridges the gap between complex CLI commands and simple user requests.

---

## Ecosystem Utility Tools

### Sui Genesis

The `sui-genesis` repository contains the configuration and genesis blobs for the Sui Mainnet and Testnet. It is the starting point for any infrastructure provider.

### Sui Scallop API

A dedicated indexing and API service for the Scallop lending protocol. It provides fast access to historical lending rates, liquidations, and TVL metrics that are difficult to query directly from the RPC.
