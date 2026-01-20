# Bucket Protocol (CDP)

<!--
Module: Bucket Protocol Documentation
Purpose: Explains the CDP model and technical implementation of Bucket Protocol on Sui.
Usage: Reference for developers building on or researching Bucket Protocol.
-->

**Bucket Protocol** is a Collateralized Debt Position (CDP) protocol on Sui. Unlike money markets like Scallop or Suilend, Bucket users mint a stablecoin (**USDB**) against their collateral.

## **SDK Integration**

### **Installation**
```bash
npm install @bucket-protocol/sdk
```

---

## **Key Architectural Differences**

| Feature | Money Markets (Scallop/Navi) | Bucket Protocol (CDP) |
| :--- | :--- | :--- |
| **Interest Rates** | Variable (Supply/Demand) | Fixed |
| **Asset Borrowed** | Any listed asset | USDB Stablecoin only |
| **Capital Efficiency** | Varies by LTV | MCR: 110% (High efficiency) |
| **Liquidation** | Permissionless (Bot-ready) | Protocol-managed |

---

## **Liquidation & Stability**

Bucket Protocol utilizes a **protocol-managed liquidation** system. 
- **Note**: External liquidation bots are generally not used for Bucket liquidations as the protocol settles bad debt internally via the **Stability Pool**.
- **USDB/sUSDB**: USDB is the debt asset, while sUSDB is the staked USDB used to capture liquidation rewards.

---

## **Flash Minting**

Bucket offers a Flash Minting mechanism for USDB, allowing for deep liquidity in a single transaction.
- **Fee**: 0.05%
- **Mint Object**: `0x0f51f9eb63574a1d12b62295599ac4f8231197f95b3cce9a516daba64f419d06`

---

## **Mainnet Addresses**

| Component | Object ID |
| :--- | :--- |
| **Framework** | `0x665188033384920a5bb5dcfb2ef21f54b4568d08b431718b97e02e5c184b92cc` |
| **USDB** | `0xe14726c336e81b32328e92afc37345d159f5b550b09fa92bd43640cfdd0a0cfd` |
| **CDP Object** | `0x9f835c21d21f8ce519fec17d679cd38243ef2643ad879e7048ba77374be4036e` |
| **PSM** | `0xc2ae6693383e4a81285136effc8190c7baaf0e75aafa36d1c69cd2170cfc3803` |
