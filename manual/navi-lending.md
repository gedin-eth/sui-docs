# NAVI Protocol

<!--
Module: NAVI Protocol Documentation
Purpose: Guides and examples for the NAVI lending and borrowing protocol on Sui.
Usage: Developer reference for integrating NAVI Protocol features.
-->

**NAVI Protocol** is the ultimate lending and borrowing protocol on Sui, designed to provide a safe and efficient liquidity market.

## **SDK Integration**

The NAVI SDK simplifies interaction with lending pools, oracle price feeds, and flash loans.

### **Installation**
```bash
npm install @naviprotocol/lending @naviprotocol/wallet-client
```

### **Supply Assets**
Depositing assets into a NAVI pool.

```typescript
import { WalletClient } from '@naviprotocol/wallet-client';

const walletClient = new WalletClient();

// Deposit 1 SUI into the SUI pool
const result = await walletClient.module('lending').deposit(
  '0x2::sui::SUI',
  1000000000, // 1 SUI in MIST
  { dryRun: false }
);
```

### **Borrow Assets**
```typescript
const result = await walletClient.lending.borrow(
  '0x2::sui::SUI',
  500000000, // Borrow 0.5 SUI
  { dryRun: false }
);
```

---

## **Account Monitoring**

Checking your lending state and borrow limits.

### **Fetch Lending State**
```javascript
import { getLendingState } from '@naviprotocol/lending';

const lendingState = await getLendingState('<YOUR_ADDRESS>');
console.log('Supply Balance:', lendingState.total_supply);
console.log('Borrow Balance:', lendingState.total_borrow);
```

---

## **Verification via CLI**

### **Fetch SUI Pool on Mainnet**
```bash
sui client object 0x96df0fce3c471489f4debaaa762cf960b3d97820bd1f3f025ff8190730e958c5
```

NAVI uses a multi-oracle system to ensure accurate pricing for collateral and debt.

### **Update Oracle Prices in PTB**
```javascript
import { getPriceFeeds, updateOraclePricesPTB } from '@naviprotocol/lending';
import { Transaction } from '@mysten/sui/transactions';

const allPriceFeeds = await getPriceFeeds();
const tx = new Transaction();

// Update oracle prices for relevant assets before executing a borrow
const updatedTx = await updateOraclePricesPTB(tx, allPriceFeeds, {
  updatePythPriceFeeds: true
});
```
