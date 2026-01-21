import { Transaction } from '@mysten/sui/transactions';
import { SuiClient, getFullnodeUrl } from '@mysten/sui/client';
import { Scallop } from '@scallop-io/sui-scallop-sdk';
import { getKeypair } from './auth';

/**
 * @file simulate_tx.ts
 * @description Performs a dry-run simulation of a Scallop deposit to verify 
 *              SDK logic, object resolution, and transaction construction.
 */

async function main() {
  console.log('🧪 Starting End-to-End Simulation...');

  const client = new SuiClient({ url: getFullnodeUrl('mainnet') });
  const keypair = getKeypair();
  const address = keypair.toSuiAddress();

  console.log(`🔹 Simulating for address: ${address}`);

  // 1. Initialize Scallop
  const scallop = new Scallop({
    secretKey: keypair.getSecretKey(),
    networkType: 'mainnet',
  });

  const scallopBuilder = await scallop.createScallopBuilder();
  const stx = scallopBuilder.createTxBlock();
  
  // 2. Build Transaction
  // We'll split a tiny bit of SUI and try to deposit it
  const amount = 1_000_000; // 0.001 SUI
  
  // Scallop deposit logic
  // Since we are dry-running, we can use a dummy coin object or split from gas
  const [suiCoin] = stx.txBlock.splitCoins(stx.txBlock.gas, [amount]);
  const marketCoin = stx.deposit(suiCoin, 'sui');
  stx.txBlock.transferObjects([marketCoin], stx.txBlock.pure.address(address));

  // 3. Dry Run
  console.log('⏳ Building transaction bytes...');
  // Use the keypair's address as the sender for the simulation
  // In production, replace with your actual address and gas coin object
  stx.txBlock.setSender(address);
  // Note: For dry-run, gas payment is optional. In production, provide actual gas coin object:
  // stx.txBlock.setGasPayment([{
  //     objectId: '0x...', // Replace with actual gas coin object ID
  //     version: 0, // Replace with actual version
  //     digest: '...', // Replace with actual digest
  // }]);
  
  const txBytes = await stx.txBlock.build({ client });

  console.log('⏳ Executing dry-run on Mainnet...');
  const dryRunRes = await client.dryRunTransactionBlock({ transactionBlock: txBytes });

  if (dryRunRes.effects.status.status === 'success') {
    console.log('✅ Simulation SUCCESS: The transaction is valid and would succeed on-chain.');
    console.log('🔹 Gas Summary:', JSON.stringify(dryRunRes.effects.gasUsed, null, 2));
  } else {
    console.error('❌ Simulation FAILED:', dryRunRes.effects.status.error);
    process.exit(1);
  }
}

main().catch((err) => {
    console.error('❌ Unexpected Error during simulation:', err);
    process.exit(1);
});
