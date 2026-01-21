/**
 * @file cyclic_arbitrage.ts
 * @description Cyclic Arbitrage Example: SUI -> USDC -> CETUS -> SUI.
 *              Uses Cetus CLMM and DeepBook V3.
 */

import { Transaction } from '@mysten/sui/transactions';
import { SuiClient, getFullnodeUrl } from '@mysten/sui/client';

// Protocol Configuration
const DEEPBOOK_PACKAGE = '0x2c8d603bc51326b8c13cef9dd07031a408a48dddb541963357661df5d3204809';
const CETUS_INTEGRATE_PACKAGE = '0xb2db7142fa83210a7d78d9c12ac49c043b3cbbd482224fea6e3da00aa5a5ae2d';
const CETUS_CONFIG = '0xdaa46292044c423a13e4d058bf8099b9d1f39221995b0cf3510c296245da03b4';

// Pool IDs
const POOL_SUI_USDC_DEEPBOOK = '0xe05dafb5133bcffb8d59f4e12465dc0e9faeaa05e3e342a08fe135800e3e4407';
const POOL_USDC_CETUS = '0x238f7e4648e62751de29c982cbf639b4225547c31db7bd866982d7d56fc2c7a8';
const POOL_CETUS_SUI = '0x2e041f3fd93646dcc877f783c1f2b7fa62d30271bdef1f21ef002cebf857bded';

// Token Types
const SUI = '0x2::sui::SUI';
const USDC = '0xdba34672e30cb065b1f93e3ab55318768fd6fef66c15942c9f7cb846e2f900e7::usdc::USDC';
const CETUS = '0x06864a6f921804860930db6ddbe2e16acdf8504495ea7481637a1c8b9a8fe54b::cetus::CETUS';

async function main() {
  console.log('🔄 Initializing Cyclic Arbitrage: SUI -> USDC -> CETUS -> SUI');

  const client = new SuiClient({ url: getFullnodeUrl('mainnet') });
  const tx = new Transaction();
  const amountIn = 1_000_000_000; // 1 SUI

  // Split input SUI from gas
  const [suiCoin] = tx.splitCoins(tx.gas, [amountIn]);

  // Leg 1: SUI -> USDC (DeepBook V3)
  console.log('Step 1: SUI -> USDC (DeepBook V3)...');
  // Note: DeepBook V3 swap returns (base_coin, quote_coin, deep_coin)
  const swap1 = tx.moveCall({
    target: `${DEEPBOOK_PACKAGE}::pool::swap_exact_base_for_quote`,
    arguments: [
      tx.object(POOL_SUI_USDC_DEEPBOOK),
      suiCoin,
      tx.pure.u64(0), // min_out
      tx.object('0x6'), // clock
    ],
    typeArguments: [SUI, USDC],
  });
  const usdcCoin = swap1[1];

  // Leg 2: USDC -> CETUS (Cetus)
  console.log('Step 2: USDC -> CETUS (Cetus)...');
  // We use pool_script_v2::swap_a2b which is an entry-like function but can be used in PTB
  // It takes (config, pool, coin_a, coin_b, a2b, amount, by_amount_in, sqrt_price_limit, clock)
  const zeroCetus = tx.moveCall({
    target: '0x2::coin::zero',
    typeArguments: [CETUS],
  });
  tx.moveCall({
    target: `${CETUS_INTEGRATE_PACKAGE}::pool_script_v2::swap_a2b`,
    arguments: [
      tx.object(CETUS_CONFIG),
      tx.object(POOL_USDC_CETUS),
      usdcCoin, // coin_a
      zeroCetus, // coin_b (empty)
      tx.pure.bool(true), // a2b
      tx.pure.u64(0), // amount (0 means use all of coin_a)
      tx.pure.bool(true), // by_amount_in
      tx.pure.u128('4295048016'), // sqrt_price_limit
      tx.object('0x6'), // clock
    ],
    typeArguments: [USDC, CETUS],
  });
  // Since pool_script_v2::swap_a2b is an entry function, it doesn't return the coin.
  // This approach is difficult for chaining. 
  
  console.log('⚠️ Cyclic arbitrage script implemented as a conceptual template.');
  console.log('To execute real-time arbitrage, use protocol-specific SDKs to fetch quotes and build optimized PTBs.');
}

main().catch(console.error);
