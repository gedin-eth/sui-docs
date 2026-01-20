/**
 * @file ptb_transfer.ts
 * @description Demonstrates a Programmable Transaction Block (PTB) for transferring SUI.
 * This is a "known-good" pattern for coin splitting and object transfer.
 */

import { SuiClient, getFullnodeUrl } from '@mysten/sui/client';
import { Transaction } from '@mysten/sui/transactions';
import { Ed25519Keypair } from '@mysten/sui/keypairs/ed25519';

async function runPTBTransfer() {
  // 1. Initialize Client (using devnet for testing)
  const client = new SuiClient({ url: getFullnodeUrl('devnet') });

  // 2. Setup Keypair (In production, load from environment variable or secure vault)
  // For this example, we generate a random keypair.
  const keypair = new Ed25519Keypair();
  const senderAddress = keypair.toSuiAddress();
  console.log(`Sender: ${senderAddress}`);

  // 3. Build the PTB
  const tx = new Transaction();

  // Pattern: Split a specific amount of MIST from the gas coin
  // tx.gas is a special object representing the coin used for gas payment
  const amount = 1_000_000n; // 0.001 SUI
  const [coin] = tx.splitCoins(tx.gas, [amount]);

  // Pattern: Transfer the newly created coin to a recipient
  const recipient = '0x780c7901e1bc057cb8eb626bda9f0b1fc8339685fbdab52018565ed78747f756';
  tx.transferObjects([coin], recipient);

  // Set budget (MIST)
  tx.setGasBudget(10_000_000n);

  console.log('Building and signing transaction...');

  try {
    // Note: This will fail if the senderAddress has no funds.
    // In a real scenario, you'd ensure funds exist or use a faucet.
    const result = await client.signAndExecuteTransaction({
      signer: keypair,
      transaction: tx,
      options: {
        showEffects: true,
        showObjectChanges: true,
      },
    });

    console.log(`Transaction Digest: ${result.digest}`);
    console.log(`Status: ${result.effects?.status.status}`);
    
    if (result.effects?.status.status === 'failure') {
        console.error(`Error details: ${result.effects.status.error}`);
    }
  } catch (error: any) {
    if (error.message.includes('InsufficientCoinBalance')) {
        console.error('❌ Error: The sender address has no funds to pay for gas or the transfer.');
    } else {
        console.error(`❌ Unexpected error: ${error.message}`);
    }
  }
}

if (require.main === module) {
    runPTBTransfer();
}
