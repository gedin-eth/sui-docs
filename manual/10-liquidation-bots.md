# Liquidation Bots & Mechanics

<!--
Module: Liquidation Bots Documentation
Purpose: Provides technical details on liquidation mechanics across Sui lending protocols.
Usage: Reference for developers building automated liquidation bots.
-->

Building a liquidation bot on Sui requires an understanding of how each protocol tracks risk and how to execute atomic transactions to capture liquidation premiums.

## **Core Liquidation Flow**

A production-grade liquidator typically follows this loop:
1.  **Monitor**: Query obligations (using SDK indexers or custom listeners) to find positions with a Health Factor (HF) < 1.
2.  **Verify**: Perform a `dryRun` or simulation to ensure the position is still liquidatable and profitable.
3.  **Prepare**: Fetch real-time prices (Pyth VAA) and generate necessary oracle update commands.
4.  **Execute**: Submit a Programmable Transaction Block (PTB) that:
    - Updates Oracle prices.
    - (Optional) Unstakes position if locked.
    - Borrows debt via Flash Loan.
    - Calls the protocol's `liquidate` function.
    - Swaps seized collateral back to debt asset.
    - Repays the Flash Loan.

---

## **Health Factor (HF) Calculations**

Liquidations are triggered when the value of a user's collateral (weighted by Loan-to-Value) falls below their borrowed debt.

### **General Formula**
\[ \text{HF} = \frac{\text{Borrow Capacity}}{\text{Total Debt}} \]
\[ \text{Borrow Capacity} = \sum (\text{Collateral Value} \times \text{LTV}) \]

### **Standard LTV Table**
| Asset | LTV (Scallop) | LTV (Suilend) |
| :--- | :--- | :--- |
| **SUI** | 0.70 | 0.75 |
| **USDC** | 0.85 | 0.80 |
| **ETH** | 0.75 | 0.70 |
| **afSUI** | 0.65 | 0.60 |

---

## **Oracle Requirements**

### **Scallop: xOracle & EMA**
Scallop uses an **Exponentially Moving Average (EMA)** price.
- **Risk**: Spot prices might crash, but the EMA lags. A position might be "liquidatable" on Pyth but "healthy" on Scallop for several minutes.
- **PTB Requirement**: You **must** call `updateAssetPricesQuick` in the same PTB before calling `liquidate`.

### **Suilend: Price Bounds**
Suilend uses weighted price bounds for health checks.
- **is_healthy**: `weighted_borrowed_value_upper_bound_usd <= allowed_borrow_value_usd`
- **is_liquidatable**: `weighted_borrowed_value_usd > unhealthy_borrow_value_usd`

---

## **PTB Strategy**

Liquidations return **two values** (the repayment coin and the seized collateral). Your PTB must handle both to avoid transaction failure.

```typescript
// Example PTB return handling
const [remainingDebt, seizedCollateral] = tx.moveCall({
    target: `${SCALLOP_PKG}::liquidate::liquidate`,
    // ... arguments ...
});

// Transfer seized collateral to your wallet or swap it
tx.transferObjects([seizedCollateral], tx.pure.address(MY_ADDRESS));
```

---

## **Liquidation Bridge Script**

We provide a bridge script (`scripts/liquidator_bridge.ts`) that combines monitoring and simulation:

1. **Monitors** Scallop obligations to find positions with HF < 1
2. **Simulates** liquidation PTBs using `devInspectTransactionBlock`
3. **Calculates** estimated profit after accounting for flash loan fees (0.09%)

### Usage

```typescript
// The script automatically:
// - Scans recent borrow events
// - Queries obligation health factors
// - Simulates liquidations for unhealthy positions
// - Reports estimated profitability

// Run with:
// tsx scripts/liquidator_bridge.ts
```

### Profit Calculation

The script estimates profit using:
- **Liquidation Bonus**: 5% of repaid amount (typical Scallop bonus)
- **Flash Loan Fee**: 0.09% (9 basis points)
- **Net Profit**: `(repayAmount × 0.05) - (repayAmount × 0.0009)`

**Note**: For production, parse BCS-encoded return values from simulation results to get exact coin amounts.

### Running the Script

```bash
# Ensure scripts/auth.ts exists with getKeypair() export
tsx scripts/liquidator_bridge.ts
```

The script will:
1. Scan recent borrow events to find active obligations
2. Query each obligation's health factor
3. Simulate liquidations for positions with HF < 1
4. Report estimated profitability after flash loan fees

---

## **Universal Router Pattern**

**Lesson Learned**: Hardcoding SUI/USDC paths breaks for exotic collateral. A universal router pattern (detect → route → execute) scales to any token type.

### **Token-Agnostic Design**

Instead of hardcoding swap paths, implement a router that:

1. **Detect**: Identify token type (standard, LST, bridged, etc.)
2. **Route**: Determine the appropriate path:
   - Standard tokens: Direct swap
   - LST tokens: Unwrap → swap
   - Bridged tokens: Check liquidity → route via available DEX
3. **Execute**: Build and execute the PTB

### **Example Implementation**

```typescript
async function universalTokenRouter(
  collateralCoin: any,
  collateralType: string
) {
  const tx = new Transaction();

  // Detect token type
  const isLST = collateralType.includes('springsui') || 
                 collateralType.includes('afsui');

  if (isLST && collateralType.includes('springsui')) {
    // Route: SPRING_SUI → unwrap → SUI → swap → USDC
    const springSuiSDK = new SpringSuiSDK({ network: 'mainnet' });
    const suiCoin = await springSuiSDK.unwrap(tx, collateralCoin, collateralType);
    return await swapSuiToUsdc(tx, suiCoin);
  } else if (isLST) {
    // Handle other LST types
    // ...
  } else {
    // Direct swap for standard tokens
    return await directSwap(tx, collateralCoin, collateralType);
  }
}
```

**Benefits**:
- Handles any collateral type automatically
- Unlocks liquidations on exotic assets (e.g., $14M+ in SPRING_SUI)
- Future-proof for new token types

**Example**: See `examples/defi/springsui_unwrap.ts` for the complete universal router implementation.

---

## **Example: Complete Liquidation PTB**

See `examples/ptb-scallop-liquidation.ts` for a complete liquidation flow implementation using the Scallop SDK.

**Note**: The example uses placeholder values (`'0x...'`) for addresses and obligation IDs. In production, replace these with actual values. The code automatically uses the keypair's address when a placeholder is detected to prevent validation errors during PTB construction.
