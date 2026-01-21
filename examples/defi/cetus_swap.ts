/**
 * @file cetus_swap.ts
 * @description Real mainnet execution: Swap SUI for USDC on Cetus.
 */

import { CetusClmmSDK, initMainnetSDK, Percentage } from '@cetusprotocol/cetus-sui-clmm-sdk';
import { SuiClient, getFullnodeUrl } from '@mysten/sui/client';
import { Ed25519Keypair } from '@mysten/sui/keypairs/ed25519';

async function main() {
  console.log('🐋 Cetus Mainnet Execution: Swapping SUI for USDC...');

  const keypair = new Ed25519Keypair(); // Dummy keypair
  const client = new SuiClient({ url: getFullnodeUrl('mainnet') });
  
  const sdk = initMainnetSDK(getFullnodeUrl('mainnet'));
  sdk.senderAddress = keypair.toSuiAddress();

  // BREW/SUI Pool
  const poolAddress = '0x782a15d21b0816311e43d27e2114bd131e08b63b939d06ecca73b4bcee0141ed';
  const amountIn = 100_000_000; // 0.1 SUI

  console.log('⏳ Fetching pool data...');
  const pool = await sdk.Pool.getPool(poolAddress);

  console.log('⏳ Building swap transaction...');
  
  // SUI decimals is 9. We need BREW decimals.
  const coinAInfo = await sdk.fullClient.getCoinMetadata({ coinType: pool.coinTypeA });
  const decimalsA = coinAInfo?.decimals ?? 9;
  const decimalsB = 9; // SUI

  const txPayload = await sdk.Swap.createSwapTransactionPayload({
    pool_id: pool.poolAddress,
    coinTypeA: pool.coinTypeA,
    coinTypeB: pool.coinTypeB,
    a2b: false,
    amount: amountIn.toString(),
    by_amount_in: true,
    amount_limit: '0',
  });

  console.log('Transaction Commands:', JSON.stringify(txPayload.getData().commands, null, 2));

  console.log('⏳ Executing swap...');
  try {
    const result = await client.signAndExecuteTransaction({
      signer: keypair,
      transaction: txPayload,
      options: { showEffects: true },
    });
    
    console.log(`✅ Success! Transaction Digest: ${result.digest}`);
    console.log(`🔗 Explorer: https://suiscan.xyz/mainnet/tx/${result.digest}`);
  } catch (error: any) {
    console.error(`❌ Swap failed: ${error.message}`);
  }
}

main().catch(console.error);
