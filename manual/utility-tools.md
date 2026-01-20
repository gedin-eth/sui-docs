# Sui Utility Tools & Specialized SDKs

<!--
Module: Utility Tools Documentation
Purpose: Documentation for specialized tools and SDKs in the Sui ecosystem, including DeepBookPy and Sui DeFi Vault.
Usage: Reference for developers using non-TypeScript SDKs or specialized accounting tools.
-->

The Sui ecosystem includes several specialized tools and SDKs that cater to different programming languages and accounting models.

---

## **DeepBookPy**

**DeepBookPy** is a Python SDK compatible with different versions of the DeepBook protocol. It allows Python developers to interact with the CLOB without needing a TypeScript environment.

### **Key Features**
- **Version Compatibility**: Supports both DeepBook V2 and V3.
- **Order Management**: Functions for placing limit/market orders and cancelling existing orders.
- **Price Discovery**: Querying order book depth and recent trades.

### **Usage Example (Conceptual)**
```python
from deepbookpy import DeepBookClient

client = DeepBookClient(network="testnet")
# Place a limit buy order
order = client.place_limit_order(
    pool_id="0x...",
    price=1.5,
    quantity=100,
    is_bid=True
)
```

---

## **Sui DeFi Vault**

**Sui DeFi Vault** implements share-based accounting for vaults, staking, and lending operations. This is particularly useful for building yield aggregators or managed investment strategies.

### **Core Logic**
- **Share-Based Accounting**: Users receive shares representing their portion of the vault's total assets.
- **Staking & Lending**: Automatically routes vault assets to protocols like Scallop or Navi to earn yield.
- **Fee Management**: Built-in logic for performance and management fees.

---

## **Core-TS**

**Core-TS** is a TypeScript repository containing swapper packages for various protocols. It acts as a middleware for routing swaps across different DEXs.

### **Supported Protocols**
- **Cetus**
- **Mayan**
- **Orca** (for cross-chain or specific implementations)

### **Usage**
```typescript
import { Swapper } from '@core-ts/swapper';

const swapper = new Swapper();
const bestRoute = await swapper.getBestRoute('SUI', 'USDC', 1000);
```
