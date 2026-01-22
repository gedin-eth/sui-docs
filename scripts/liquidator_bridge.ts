/**
 * @file liquidator_bridge.ts
 * @description Bridge between monitoring and liquidation simulation.
 *              Finds unhealthy Scallop obligations and simulates liquidation PTBs
 *              to estimate profitability after flash loan fees.
 */

import { Scallop } from '@scallop-io/sui-scallop-sdk';
import { SuiClient, getFullnodeUrl } from '@mysten/sui/client';
import { client, LiquidationCandidate } from './utils/monitoring_common';
import { getKeypair } from './auth';

// Scallop Core Package ID
const SCALLOP_CORE_PACKAGE_ID = '0xefe8b36d5b2e43728cc323298626b83177803521d195cfb11e15b910e892fddf';

// Flash loan fee basis points (e.g., 9 = 0.09%)
const FLASH_LOAN_FEE_BPS = 9;

/**
 * Find unhealthy Scallop obligations (HF < 1)
 */
async function findUnhealthyObligations(): Promise<LiquidationCandidate[]> {
  console.log('🔍 Scanning for unhealthy obligations...');

  const scallopSDK = new Scallop({
    networkType: 'mainnet',
  });
  const query = await scallopSDK.createScallopQuery();

  // Fetch recent borrow events to identify active obligations
  const events = await client.queryEvents({
    query: {
      MoveEventModule: {
        package: SCALLOP_CORE_PACKAGE_ID,
        module: 'borrow',
      },
    },
    limit: 50,
  });

  const obligationIds = Array.from(new Set(
    events.data
      .map((event: any) => event.parsedJson?.obligation)
      .filter(Boolean)
  )) as string[];

  console.log(`Found ${obligationIds.length} unique obligations to check.`);

  const candidates: LiquidationCandidate[] = [];

  for (const id of obligationIds) {
    try {
      const obligationData: any = await query.queryObligation(id);
      const healthFactor = obligationData?.healthFactor ?? 2.0;
      const debtValue = obligationData?.totalDebt ?? 0;
      const collateralValue = obligationData?.totalCollateral ?? 0;

      if (healthFactor < 1) {
        candidates.push({
          obligationId: id,
          owner: obligationData?.owner ?? 'unknown',
          healthFactor,
          debtValue,
          collateralValue,
          protocol: 'Scallop',
        });
      }
    } catch (err) {
      console.error(`Error querying obligation ${id}:`, err);
    }
  }

  return candidates;
}

/**
 * Simulate a liquidation PTB for a given obligation and estimate profit
 */
async function simulateLiquidation(
  obligationId: string,
  debtCoin: string,
  collateralCoin: string,
  repayAmount: number
): Promise<{ success: boolean; profitUsdc?: number; error?: string }> {
  const scallop = new Scallop({
    networkType: 'mainnet',
    secretKey: getKeypair().getSecretKey(),
  });

  const scallopBuilder = await scallop.createScallopBuilder();
  const stx = scallopBuilder.createTxBlock();

  try {
    // 1. Update Oracle Prices (mandatory)
    await stx.updateAssetPricesQuick([debtCoin, collateralCoin]);

    // 2. Flash Loan for Repayment
    const [debtCoinObj, loanReceipt] = stx.borrowFlashLoan(repayAmount, debtCoin);

    // 3. Execute Liquidation
    const [remainingDebt, seizedCollateral] = stx.liquidate(
      obligationId,
      debtCoinObj,
      debtCoin,
      collateralCoin
    );

    // 4. Repay Flash Loan (placeholder - in production, swap collateral first)
    stx.repayFlashLoan(debtCoinObj, loanReceipt, debtCoin);

    // 5. Transfer remaining assets to sender
    const sender = getKeypair().toSuiAddress();
    stx.txBlock.transferObjects([seizedCollateral, remainingDebt], stx.txBlock.pure.address(sender));

    // Set sender for simulation
    stx.txBlock.setSender(sender);
    
    // Build transaction to get bytes
    // Lesson Learned: tx.build({ client }) auto-runs dry gas estimation which fails on complex PTBs
    // Fix: tx.build({ client, onlyTransactionKind: true }) for simulation
    const txBytes = await stx.txBlock.build({ client, onlyTransactionKind: true });
    
    console.log(`⏳ Simulating liquidation for obligation ${obligationId.slice(0, 8)}...`);
    const result = await client.devInspectTransactionBlock({
      sender: sender,
      transactionBlock: txBytes, // Uint8Array is accepted directly
    });

    if (result.effects.status.status === 'failure') {
      return {
        success: false,
        error: result.effects.status.error || 'Unknown simulation error',
      };
    }

    // Parse simulation results to extract coin amounts
    // The results contain object changes that show coin balances
    let seizedCollateralAmount = 0;
    let remainingDebtAmount = 0;
    
    // Parse object changes to find coin amounts
    // In devInspect results, we need to look at the return values or object changes
    if (result.results && result.results.length > 0) {
      // The liquidation function returns [remainingDebt, seizedCollateral]
      // Parse the return values from the simulation
      try {
        // Extract return values - these are Move values in BCS format
        // For coins, we need to parse the balance from the object
        // This is a simplified parser - in production, use proper BCS deserialization
        
        // Parse return values from the simulation
        // The liquidation function returns [remainingDebt, seizedCollateral]
        // These are in the results array as BCS-encoded Move values
        // For a complete implementation, you'd need to deserialize these using BCS
        
        // Check effects for created/mutated objects that might be coins
        // Note: The exact structure depends on the SDK version and Sui protocol version
        // This is a simplified approach
        
        // Fallback: Use effects to estimate
        // The effects show gas used and object changes, but coin amounts need BCS parsing
        // For this implementation, we'll use a calculation based on liquidation parameters
        
      } catch (parseError) {
        console.warn(`Warning: Could not parse simulation results: ${parseError}`);
      }
    }

    // Calculate profit estimation
    // Flash loan fee: repayAmount * (FLASH_LOAN_FEE_BPS / 10000)
    const flashLoanFee = (repayAmount * FLASH_LOAN_FEE_BPS) / 10000;
    
    // Scallop liquidation bonus is typically 5-8% of the repaid amount
    // The seized collateral value = repayAmount * (1 + liquidationBonus)
    // Profit = seizedCollateralValue - repayAmount - flashLoanFee
    // Simplified: profit ≈ repayAmount * liquidationBonus - flashLoanFee
    
    const LIQUIDATION_BONUS_BPS = 500; // 5% = 500 basis points
    const liquidationBonus = (repayAmount * LIQUIDATION_BONUS_BPS) / 10000;
    
    // If we parsed actual amounts, use those; otherwise use estimation
    if (seizedCollateralAmount > 0 && remainingDebtAmount > 0) {
      // Real calculation from parsed amounts
      // Note: This assumes collateral is already in USDC terms
      // In production, you'd need to convert collateral value to USDC using oracle prices
      const profitUsdc = seizedCollateralAmount - repayAmount - flashLoanFee;
      return {
        success: true,
        profitUsdc: profitUsdc / 1_000_000, // Convert to USDC (6 decimals)
      };
    } else {
      // Estimation based on liquidation bonus
      const estimatedProfit = liquidationBonus - flashLoanFee;
      return {
        success: true,
        profitUsdc: estimatedProfit / 1_000_000, // Convert to USDC (6 decimals)
      };
    }
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Simulation failed',
    };
  }
}

/**
 * Main bridge function: monitor and simulate liquidations
 */
async function main() {
  console.log('🌉 Starting Liquidation Bridge...\n');

  // 1. Find unhealthy obligations
  const candidates = await findUnhealthyObligations();

  if (candidates.length === 0) {
    console.log('✅ No unhealthy obligations found (HF < 1).');
    return;
  }

  console.log(`\n📊 Found ${candidates.length} liquidation candidates:\n`);
  candidates.forEach((c, i) => {
    console.log(`${i + 1}. Obligation: ${c.obligationId.slice(0, 10)}...`);
    console.log(`   Health Factor: ${c.healthFactor.toFixed(4)}`);
    console.log(`   Debt Value: $${c.debtValue.toFixed(2)}`);
    console.log(`   Collateral Value: $${c.collateralValue.toFixed(2)}\n`);
  });

  // 2. Simulate liquidations for each candidate
  console.log('🧪 Simulating liquidations...\n');

  for (const candidate of candidates) {
    // Determine debt and collateral coins from obligation data
    // For this example, we'll use common defaults (USDC debt, SUI collateral)
    // In production, query the obligation to get actual coin types
    const debtCoin = 'usdc';
    const collateralCoin = 'sui';
    
    // Estimate repay amount (e.g., 50% of debt for partial liquidation)
    const repayAmount = Math.floor(candidate.debtValue * 0.5 * 1_000_000); // Convert to base units (6 decimals for USDC)

    const result = await simulateLiquidation(
      candidate.obligationId,
      debtCoin,
      collateralCoin,
      repayAmount
    );

    if (result.success && result.profitUsdc !== undefined) {
      console.log(`✅ Obligation ${candidate.obligationId.slice(0, 8)}...`);
      console.log(`   Estimated Profit: $${result.profitUsdc.toFixed(2)} USDC`);
      console.log(`   Repay Amount: ${(repayAmount / 1_000_000).toFixed(2)} USDC`);
      console.log(`   Flash Loan Fee: ${((repayAmount * FLASH_LOAN_FEE_BPS) / 10000 / 1_000_000).toFixed(4)} USDC\n`);
    } else {
      console.log(`❌ Obligation ${candidate.obligationId.slice(0, 8)}...`);
      console.log(`   Error: ${result.error}\n`);
    }
  }
}

main().catch(console.error);
