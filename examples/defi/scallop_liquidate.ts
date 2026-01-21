import { Transaction } from '@mysten/sui/transactions';
import { SuiClient, getFullnodeUrl } from '@mysten/sui/client';
import { Scallop } from '@scallop-io/sui-scallop-sdk';
import { getKeypair } from '../../scripts/auth';

/**
 * @file scallop_liquidate.ts
 * @description Advanced example of a Scallop liquidation PTB.
 *              Includes oracle price updates, flash loan, liquidation, and swap.
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

    // 2. Constants (Update with real IDs from config/network.json)
    const OBLIGATION_ID = '0x...';
    const DEBT_COIN = 'usdc';
    const COLLATERAL_COIN = 'sui';
    const REPAY_AMOUNT = 100_000_000; // 100 USDC

    // 3. CRITICAL: Update Oracle Prices
    // This must be the first step in the PTB to avoid Error 1025
    await stx.updateAssetPricesQuick([DEBT_COIN, COLLATERAL_COIN]);

    // 4. Flash Loan for Repayment
    const [debtCoinObj, loanReceipt] = stx.borrowFlashLoan(REPAY_AMOUNT, DEBT_COIN);

    // 5. Execute Liquidation
    // Returns [remainingDebtCoin, collateralCoin]
    const [remainingDebt, seizedCollateral] = stx.liquidate(
        OBLIGATION_ID,
        debtCoinObj,
        DEBT_COIN,
        COLLATERAL_COIN
    );

    // 6. Swap Seized Collateral back to Debt Coin (Simplified)
    // In a real liquidator, you'd use Cetus or Hop.ag here to swap SUI -> USDC
    // const usdcFromSwap = swapSuiToUsdc(seizedCollateral);

    // 7. Repay Flash Loan
    // Ensure you have enough USDC to repay (loan amount + small fee)
    stx.repayFlashLoan(debtCoinObj, loanReceipt, DEBT_COIN);

    // 8. Finalize
    stx.txBlock.transferObjects([seizedCollateral, remainingDebt], stx.txBlock.pure.address(SENDER));

    console.log('Liquidation PTB constructed successfully.');
    // await client.signAndExecuteTransaction({ signer: keypair, transaction: stx.txBlock });
}

main().catch(console.error);
