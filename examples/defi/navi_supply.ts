/**
 * @file navi_supply.ts
 * @description Real mainnet execution: Supply SUI to NAVI.
 */

import { NAVISDKClient, Sui } from 'navi-sdk';
// Note: Create scripts/auth.ts from scripts/auth.example.ts with your mnemonic
// import { MNEMONIC } from '../../scripts/auth';
const MNEMONIC = process.env.MNEMONIC || 'your mnemonic here'; // Fallback for testing

async function main() {
  console.log('🚀 NAVI Mainnet Execution: Supplying SUI...');

  // Validate mnemonic - skip execution if placeholder
  if (!MNEMONIC || MNEMONIC === 'your mnemonic here' || MNEMONIC.includes('...')) {
    console.log('⚠️  Skipping execution: Invalid or placeholder mnemonic.');
    console.log('   Set MNEMONIC environment variable or update scripts/auth.ts with a valid mnemonic.');
    console.log('   This is a conceptual example - actual execution requires a funded account.');
    return;
  }

  const client = new NAVISDKClient({
    mnemonic: MNEMONIC,
    networkType: 'mainnet',
    numberOfAccounts: 1,
  });

  const account = client.accounts[0];
  const amount = 100_000_000; // 0.1 SUI

  console.log(`⏳ Depositing ${amount / 1e9} SUI to NAVI...`);
  try {
    const res = await account.depositToNavi(Sui, amount);
    console.log(`✅ Success! Transaction Digest: ${res.digest}`);
    console.log(`🔗 Explorer: https://suiscan.xyz/mainnet/tx/${res.digest}`);
  } catch (error: any) {
    console.error(`❌ NAVI Deposit failed: ${error.message}`);
  }
}

main().catch(console.error);
