/**
 * @file scallop_supply.ts
 * @description Real mainnet execution: Supply SUI to Scallop Lending.
 */

import { Scallop } from '@scallop-io/sui-scallop-sdk';
import { getKeypair } from '../../scripts/auth';
import { SuiClient, getFullnodeUrl } from '@mysten/sui/client';

async function main() {
  console.log('🐚 Scallop Mainnet Execution: Supplying SUI...');

  const keypair = getKeypair();
  const address = keypair.toSuiAddress();
  console.log(`Address: ${address}`);

  const scallop = new Scallop({
    secretKey: keypair.getSecretKey(),
    networkType: 'mainnet',
  });

  const client = await scallop.createScallopClient();

  // Supply 0.1 SUI
  const amount = 100_000_000; // 0.1 SUI
  
  console.log(`⏳ Submitting deposit of ${amount / 1e9} SUI to Scallop...`);
  try {
    const txRes = await client.deposit('sui', amount);
    console.log(`✅ Success! Transaction Digest: ${txRes.digest}`);
    console.log(`🔗 Explorer: https://suiscan.xyz/mainnet/tx/${txRes.digest}`);
  } catch (error: any) {
    console.error(`❌ Execution failed: ${error.message}`);
    if (error.effects) {
        console.error('Status:', error.effects.status);
    }
  }
}

main().catch(console.error);
