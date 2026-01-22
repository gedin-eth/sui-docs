---
title: "Sui Protocol Core & CLI"
linkTitle: "Sui Core"
weight: 0.5
type: docs
description: "Overview of the Sui blockchain protocol, architecture, and CLI usage"
---

The Sui network is a high-throughput, low-latency smart contract platform powered by the **Move programming language**. Unlike traditional blockchains, Sui utilizes an **asset-oriented model** where data is stored in objects rather than accounts.

## Core Concepts

### Object-Centric Model

In Sui, the fundamental unit of storage is the **Object**. Every object has a unique ID, an owner, and a version number. Objects can be:

- **Owned**: Controlled by a specific address.
- **Shared**: Accessible by anyone (often used for DeFi pools).
- **Immutable**: Cannot be modified (e.g., published Move packages).

### Programmable Transaction Blocks (PTB)

PTBs are a unique feature of Sui that allow for the **atomic execution** of multiple commands in a single transaction. This enables complex operations like splitting a coin, calling a Move function, and transferring the result to different addresses without intermediate transactions.

---

## Sui CLI Verification

The Sui CLI is the primary tool for interacting with the network. Below are common commands for verifying network connectivity and basic operations.

### Network Configuration

Verify your current environment and active address:

```bash
# List all environments
sui client envs

# Check active address and metadata
sui client active-address
```

### Balance & Faucet

Request test tokens and verify the balance:

```bash
# Request SUI from the devnet faucet
sui client faucet

# List objects and balances for the active address
sui client objects
sui client gas
```

### Transaction Execution

Execute a PTB to split and transfer coins:

```bash
sui client ptb \
  --gas-budget 10000000 \
  --split-coins gas "[1000000]" \
  --assign new_coin \
  --transfer-objects "[new_coin]" 0x0123...
```

---

## Verification via cURL

You can interact with Sui Full nodes directly via JSON-RPC.

### Check Network Health

```bash
curl --location --request POST 'https://fullnode.devnet.sui.io:443' \
--header 'Content-Type: application/json' \
--data-raw '{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "sui_getLatestCheckpointSequenceNumber",
  "params": []
}'
```

### Query Object Details

```bash
# Query the Scallop Market object on mainnet
curl --location --request POST 'https://fullnode.mainnet.sui.io:443' \
--header 'Content-Type: application/json' \
--data-raw '{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "sui_getObject",
  "params": [
    "0xa757975255146dc9686aa823b7838b507f315d704f428cbadad2f4ea061939d9",
    {
      "showType": true,
      "showOwner": true,
      "showContent": true
    }
  ]
}'
```
