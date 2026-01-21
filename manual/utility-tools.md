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

## **Developer CLI & Curl One-Liners**

These commands provide a quick way to interact with the Sui network and DeFi protocols with minimal setup. They are ideal for troubleshooting, monitoring, and quick data extraction.

### **Network & Account Management**

1. **Check all token balances (Sui CLI)**
```bash
sui client balance --with-coins
```

2. **Merge two gas coins (Reduces dust)**
```bash
sui client merge-coins --primary-coin $(sui client gas --json | jq -r '.[0].gasCoinId') --coin-to-merge $(sui client gas --json | jq -r '.[1].gasCoinId')
```

3. **Get current reference gas price**
```bash
curl -s 'https://fullnode.mainnet.sui.io:443' -H 'Content-Type: application/json' -d '{"jsonrpc":"2.0","id":1,"method":"suix_getReferenceGasPrice","params":[]}' | jq '{gas_price_mist: .result, gas_price_sui: (.result | tonumber / 1e9)}'
```

4. **Query wallet SUI balance (JSON-RPC)**
```bash
curl -s -X POST https://fullnode.mainnet.sui.io:443 -H "Content-Type: application/json" -d '{"jsonrpc":"2.0","id":1,"method":"suix_getBalance","params":["YOUR_ADDRESS","0x2::sui::SUI"]}' | jq '.result.totalBalance | tonumber / 1e9'
```

5. **Export recent transaction history to JSON**
```bash
sui client history --limit 50 --json | jq '[.[] | {digest, timestamp, gasUsed: .effects.gasUsed.computationCost}]' > tx_history.json
```

### **DeFi Protocol Monitoring**

6. **Read Cetus pool object on-chain (sqrt_price + liquidity)**
```bash
curl -s 'https://fullnode.mainnet.sui.io:443' -H 'Content-Type: application/json' -d '{"jsonrpc":"2.0","id":1,"method":"sui_getObject","params":["0xcf994611fd4c48e277ce3ffd4d4364c914af2c3cbb05f7bf6facd371de688630",{"showContent":true}]}' | jq '.result.data.content.fields | {sqrt_price: .current_sqrt_price, liquidity: .liquidity}'
```

7. **Watch for new Scallop borrow events (Live log)**
```bash
curl -s -X POST https://fullnode.mainnet.sui.io:443 -H "Content-Type: application/json" -d '{"jsonrpc":"2.0","id":1,"method":"suix_queryEvents","params":[{"MoveEventModule":{"package":"0xefe8b36d5b2e43728cc323298626b83177803521d195cfb11e15b910e892fddf","module":"borrow"}},null,10,true]}' | jq '.result.data[] | {obligation: .parsedJson.obligation, amount: .parsedJson.amount, asset: .parsedJson.asset}'
```

> **Note**: Several protocol REST APIs (e.g., `sui.apis.scallop.io`, `api-sui.cetus.zone`) have been deprecated or shifted to private indexing. Developers should prioritize using the official TypeScript SDKs or querying on-chain events via JSON-RPC as shown above.

### **Oracle & Price Feeds**

11. **Fetch latest Pyth price for SUI**
```bash
curl -s 'https://hermes.pyth.network/api/latest_price_feeds?ids[]=0x23d7315113f5b1d3ba7a83604c44b94d79f4fd69af77f804fc7f920a6dc65744' | jq '.[] | {price: .price.price, conf: .price.conf}'
```

12. **Fetch multiple Pyth prices (SUI & USDC)**
```bash
curl -s 'https://hermes.pyth.network/v2/updates/price/latest?ids[]=23d7315113f5b1d3ba7a83604c44b94d79f4fd69af77f804fc7f920a6dc65744&ids[]=eaa020c61cc479712813461ce153894a96a6c00b21ed0cfc2798d1f9a9e9c94a' | jq '.parsed[] | {id: .id[0:8], price: (.price.price | tonumber * pow(10; .price.expo | tonumber))}'
```

### **Advanced CLI Techniques**

13. **Dry-run a transaction block (Simulation)**
```bash
sui client dry-run <TX_BYTES> --json | jq '{gasUsed: .effects.gasUsed, balanceChanges: .balanceChanges}'
```

14. **Subscribe to SwapEvents (Mempool monitor)**
```bash
sui client subscribe --filter '{"MoveEventType":"0x1eabed72c53feb3805120a081dc15963c204dc8d091542592abaf7a35689b2fb::pool::SwapEvent"}'
```

15. **One-shot obligation scanner (tsx -e)**
```bash
npx tsx -e "import{SuiClient}from'@mysten/sui/client';const c=new SuiClient({url:'https://fullnode.mainnet.sui.io:443'});(async()=>{const e=await c.queryEvents({query:{MoveEventModule:{package:'0xefe8b36d5b2e43728cc323298626b83177803521d195cfb11e15b910e892fddf',module:'borrow'}},limit:50});const ids=[...new Set(e.data.map(x=>x.parsedJson?.obligation).filter(Boolean))];const o=await c.multiGetObjects({ids,options:{showContent:true}});o.filter(x=>x.data?.content?.fields?.liquidate_locked===false).forEach(x=>console.log('UNLOCKED:',x.data.objectId.slice(0,30)));})();"
```

16. **Check Scallop-related balances (tsx -e)**
```bash
npx tsx -e "import{SuiClient}from'@mysten/sui/client';const c=new SuiClient({url:'https://fullnode.mainnet.sui.io:443'});(async()=>{const b=await c.getAllBalances({owner:'YOUR_ADDRESS'});b.filter(x=>x.coinType.includes('scallop')||x.coinType.includes('SCALLOP')).forEach(x=>console.log(x.coinType.split('::').pop(),':',(Number(x.totalBalance)/1e9).toFixed(4)));})();"
```

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
