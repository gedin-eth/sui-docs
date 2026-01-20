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

---

## **Liquidity Note**

Wormhole bridged assets (**wUSDC**, **wUSDT**) often have limited liquidity on native Sui DEXs like Cetus. Liquidators should verify available swap routes before attempting to liquidate obligations containing these assets.
