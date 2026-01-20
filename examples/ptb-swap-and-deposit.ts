import { Transaction } from '@mysten/sui/transactions';
import { SuiClient, getFullnodeUrl } from '@mysten/sui/client';
import { initCetusSDK } from '@cetusprotocol/cetus-sui-clmm-sdk';
import { Scallop } from '@scallop-io/sui-scallop-sdk';

/**
 * Module: PTB Swap and Deposit Example
 * Purpose: Demonstrates an atomic Programmable Transaction Block that swaps SUI for USDC on Cetus 
 *          and then deposits the resulting USDC into Scallop.
 * Usage: ts-node examples/ptb-swap-and-deposit.ts
 */

async function main() {
    const client = new SuiClient({ url: getFullnodeUrl('mainnet') });
    const tx = new Transaction();
    const sender = '0x...'; // Replace with your address

    // 1. Initial Setup
    const sdk = initCetusSDK({ network: 'mainnet' });
    const scallop = new Scallop({ networkType: 'mainnet', walletAddress: sender });
    const txBuilder = await scallop.createTxBuilder();

    // 2. Cetus Swap (SUI -> USDC)
    // For simplicity, we assume we have the pool and route information
    const poolAddress = '0x...'; // Cetus SUI-USDC Pool ID
    const amountIn = 1_000_000_000; // 1 SUI

    const [suiCoin] = tx.splitCoins(tx.gas, [amountIn]);

    // Note: In a real scenario, you'd use sdk.Swap.createSwapTransactionPayload
    // but here we manually add the move call for demonstration.
    const usdcCoin = tx.moveCall({
        target: '0x...::pool::swap', // Placeholder for Cetus swap target
        arguments: [
            tx.object(poolAddress),
            suiCoin,
            tx.pure.bool(true), // a2b
            tx.pure.bool(true), // by_amount_in
            tx.pure.u64(amountIn),
            tx.pure.u64(0), // amount_limit (slippage protection)
            tx.pure.u128(0), // sqrt_price_limit
            tx.object('0x6'), // Clock
        ],
        typeArguments: ['0x2::sui::SUI', '0x...::usdc::USDC'], // Placeholder
    });

    // 3. Scallop Deposit (USDC)
    const scallopTxBlock = txBuilder.createTxBlock();
    // We can use the result of the Cetus swap directly in Scallop
    const marketCoin = scallopTxBlock.deposit(usdcCoin, 'usdc');

    // 4. Finalize
    tx.transferObjects([marketCoin], tx.pure.address(sender));

    console.log("PTB constructed successfully.");
    // const result = await client.signAndExecuteTransaction({ signer: keypair, transaction: tx });
}

main().catch(console.error);
