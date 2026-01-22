# Common Coin Types

<!--
Module: Token Registry Documentation
Purpose: Provides a mapping of common Sui assets to their full Move types.
Usage: Reference for developers building PTBs or querying on-chain objects.
-->

Most Sui Move functions require full type strings for generic arguments (e.g., `<DebtCoin, CollateralCoin>`).

| Asset | Full Move Type |
| :--- | :--- |
| **SUI** | `0x2::sui::SUI` |
| **USDC** | `0xdba34672e30cb065b1f93e3ab55318768fd6fef66c15942c9f7cb846e2f900e7::usdc::USDC` |
| **wUSDC** | `0x5d4b302506645c37ff133b98c4b50a5ae14841659738d6d733d59d0d217a93bf::coin::COIN` |
| **wUSDT** | `0xc060006111016b8a020ad5b33834984a437aaa7d3c74c18e09a95d48aceab08c::coin::COIN` |
| **afSUI** | `0xf325ce1300e8dac124071d3152c5c5ee6174914f8bc2161e88329cf579246efc::afsui::AFSUI` |
| **haSUI** | `0xbde4ba4c2e274a60ce15c1cfff9e5c42e41654ac8b6d906a57efa4bd3c29f47d::hasui::HASUI` |
| **DEEP** | `0xdeeb7a4662eec9f2f3def03fb937a663dddaa2e215b8078a284d026b7946c270::deep::DEEP` |
| **NS** | `0x5145494a5f5100e645e4b0aa950fa6b68f614e8c59e17bc5ded3495123a79178::ns::NS` |
| **WAL** | `0x356a26eb9e012a68958082340d4c4116e7f55615cf27affcff209cf0ae544f59::wal::WAL` |
| **SCA** | `0x708349f21d20cf5996dafc1aa98d3519417323bde3f209b972f5930d8521ea38a::sca::SCA` |
| **CETUS** | `0x06864a6f921804860930db6ddbe2e16acdf8504495ea7481637a1c8b9a8fe54b::cetus::CETUS` |

---

---

## **LST Token Handling**

**Lesson Learned**: Liquid Staking Tokens (LSTs) like **SPRING_SUI** cannot be directly swapped on DeepBook, but they can be instantly unwrapped via their respective SDKs.

### **SPRING_SUI Unwrapping**

SPRING_SUI can be unwrapped to SUI using the SpringSui SDK with a 0.01% fee:

```typescript
import { SpringSuiSDK } from '@suilend/springsui-sdk';

const springSuiSDK = new SpringSuiSDK({ network: 'mainnet' });

// Unwrap SPRING_SUI → SUI (0.01% fee)
const suiCoin = await springSuiSDK.unwrap(tx, springSuiCoin, SPRING_SUI_TYPE);

// Then swap SUI → USDC via your preferred DEX
const usdcCoin = await swapSuiToUsdc(tx, suiCoin);
```

**Route Pattern**: `SPRING_SUI → unwrap (0.01% fee) → SUI → swap → USDC`

**Example**: See `examples/defi/springsui_unwrap.ts` for complete implementation including universal router pattern.

### **Other LST Tokens**

- **afSUI**: Use afSUI SDK unwrap methods
- **haSUI**: Use haSUI SDK unwrap methods
- Each LST has its own unwrap fee structure

---

## **Liquidity Note**

Wormhole bridged assets (**wUSDC**, **wUSDT**) often have limited liquidity on native Sui DEXs like Cetus. Liquidators should verify available swap routes before attempting to liquidate obligations containing these assets.
