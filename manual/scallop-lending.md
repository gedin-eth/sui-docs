# Scallop Lending Protocol

<!--
Module: Scallop Lending Documentation
Purpose: Provides guides and examples for interacting with the Scallop lending protocol on Sui.
Usage: Reference for developers integrating Scallop lending and borrowing features.
-->

**Scallop** is the first Next-Generation peer-to-peer money market on Sui. It offers high-performance lending and borrowing with a focus on institutional-grade security and user experience.

## **Core SDK Integration**

Scallop provides a comprehensive TypeScript SDK for interacting with its lending pools and obligation management.

### **Installation**
```bash
npm install @scallop-io/sui-scallop-sdk
```

### **Basic Supply Operation**
Supplying assets to Scallop allows you to earn interest and use the assets as collateral.

```typescript
import { Scallop } from '@scallop-io/sui-scallop-sdk';

const scallop = new Scallop({
  networkType: 'mainnet',
  walletAddress: '<YOUR_ADDRESS>',
});

const scallopBuilder = await scallop.createScallopBuilder();
const scallopTxBlock = scallopBuilder.createTxBlock();

// Deposit 1 SUI into the lending pool
const marketCoin = await scallopTxBlock.depositQuick(10 ** 9, 'sui');
scallopTxBlock.transferObjects([marketCoin], '<YOUR_ADDRESS>');

await scallopBuilder.signAndSendTxBlock(scallopTxBlock);
```

### **Withdrawal**
```typescript
const scallopBuilder = await scallop.createScallopBuilder();
const scallopTxBlock = scallopBuilder.createTxBlock();
// Withdraw 1 SUI from the pool
const coin = await scallopTxBlock.withdrawQuick(10 ** 9, 'sui');
scallopTxBlock.transferObjects([coin], '<YOUR_ADDRESS>');

await scallopBuilder.signAndSendTxBlock(scallopTxBlock);
```

---

## **Obligation & Borrowing**

To borrow assets, you must first deposit collateral into an **Obligation**.

### **Creating an Obligation**
```typescript
const client = await scallop.createScallopClient();
const result = await client.openObligation();
```

### **Borrowing Assets**
```typescript
const borrowResult = await client.borrow(
  'usdc',
  100 * 10 ** 6, // 100 USDC
  true,
  '<OBLIGATION_ID>',
  '<OBLIGATION_KEY_ID>'
);
```

---

## **Verification via cURL**

Querying Scallop market data using JSON-RPC.

### **Get Market Objects**
```bash
# Query Scallop Market on Mainnet
curl --location --request POST 'https://fullnode.mainnet.sui.io:443' \
--header 'Content-Type: application/json' \
--data-raw '{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "sui_getObject",
  "params": [
    "0xa757975255146dc9686aa823b7838b507f315d704f428cbadad2f4ea061939d9",
    {
      "showContent": true
    }
  ]
}'
```
