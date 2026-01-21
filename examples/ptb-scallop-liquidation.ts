import { Transaction } from '@mysten/sui/transactions';
import { SuiClient, getFullnodeUrl } from '@mysten/sui/client';
import { Scallop } from '@scallop-io/sui-scallop-sdk';
import { getKeypair } from '../scripts/auth';

/**
 * @file ptb-scallop-liquidation.ts
 * @description Advanced PTB demonstrating a real-world liquidation flow on Scallop.
 *              Workflow:
 *              1. Update Oracle Prices (Mandatory)
 *              2. Borrow Debt via Flash Loan
 *              3. Execute Liquidation Move Call
 *              4. Handle seized collateral and remaining debt
 *              5. Repay Flash Loan
 */

async function main() {
    const SENDER = '0x...'; // Replace with your address
    const client = new SuiClient({ url: getFullnodeUrl('mainnet') });
    const keypair = getKeypair();

    // 1. Initialize Scallop
    const scallop = new Scallop({
        networkType: 'mainnet',
        secretKey: keypair.getSecretKey(),
    });

    const scallopBuilder = await scallop.createScallopBuilder();
    const stx = scallopBuilder.createTxBlock();

    // 2. Protocol Configuration (Resolved from config/network.json)
    const OBLIGATION_ID = '0x...'; // Target unhealthy obligation
    const DEBT_COIN = 'usdc';
    const COLLATERAL_COIN = 'sui';
    const REPAY_AMOUNT = 500_000_000; // 500 USDC

    // 3. Update Oracle Prices
    // Essential to avoid Error 1025 (Stale Price)
    await stx.updateAssetPricesQuick([DEBT_COIN, COLLATERAL_COIN]);

    // 4. Flash Loan for Repayment
    const [debtCoinObj, loanReceipt] = stx.borrowFlashLoan(REPAY_AMOUNT, DEBT_COIN);

    // 5. Execute Liquidation
    // Target Move Function: liquidate<Debt, Collateral>(version, obligation, market, debt_coin, decimals, oracle, clock)
    // The SDK's stx.liquidate helper abstracts the Move call.
    const [remainingDebt, seizedCollateral] = stx.liquidate(
        OBLIGATION_ID,
        debtCoinObj,
        DEBT_COIN,
        COLLATERAL_COIN
    );

    /**
     * Leg 6: Repay Flash Loan
     * In a real bot, you would swap seizedCollateral (SUI) -> DEBT_COIN (USDC)
     * using Cetus or Hop.ag to ensure you have enough USDC to repay the loan.
     */
    // stx.repayFlashLoan(usdcFromSwap, loanReceipt, DEBT_COIN);
    stx.repayFlashLoan(debtCoinObj, loanReceipt, DEBT_COIN); // Placeholder

    // 7. Finalize
    stx.txBlock.transferObjects([seizedCollateral, remainingDebt], stx.txBlock.pure.address(SENDER));

    console.log('--- Scallop Liquidation PTB Details ---');
    console.log(`Obligation: ${OBLIGATION_ID}`);
    console.log(`Repay Asset: ${DEBT_COIN}`);
    console.log(`Seize Asset: ${COLLATERAL_COIN}`);
    
    // stx.txBlock.setSender(SENDER);
    // const result = await client.signAndExecuteTransaction({ signer: keypair, transaction: stx.txBlock });
}

main().catch(console.error);
