/**
 * @file deepbook_flashloan.ts
 * @description DeepBook V3 flash loan example demonstrating borrow_flashloan_base vs borrow_flashloan_quote.
 * 
 * Lesson Learned: DeepBook V3 has separate functions: borrow_flashloan_base vs borrow_flashloan_quote.
 * Must match the token type exactly when returning the loan. Zero DEEP coin for fees works (for now).
 */

import { Transaction } from '@mysten/sui/transactions';
import { SuiClient, getFullnodeUrl } from '@mysten/sui/client';

const DEEPBOOK_PACKAGE = '0xb29d83c2bcefe45ce0ef7357a94568c88610bac9f6d59b43cc67a8b52672533e';

/**
 * Example: Borrow flash loan in base token (e.g., SUI)
 */
async function borrowFlashLoanBase() {
  const client = new SuiClient({ url: getFullnodeUrl('mainnet') });
  const tx = new Transaction();

  const POOL_ID = '0x...'; // SUI-USDC pool
  const ACCOUNT_CAP_ID = '0x...'; // AccountCap from DeepBook custodian
  const AMOUNT = 1_000_000_000n; // 1 SUI

  // Create zero DEEP coin for fees
  const zeroDeep = tx.moveCall({
    target: '0x2::coin::zero',
    typeArguments: ['0xdeeb7a4662eec9f2f3def03fb937a663dddaa2e215b8078a284d026b7946c270::deep::DEEP'],
  });

  // Borrow flash loan in BASE token (SUI)
  // Returns: (Coin<Base>, Coin<Quote>, Coin<DEEP>, Receipt)
  const [baseCoin, quoteCoin, deepCoin, receipt] = tx.moveCall({
    target: `${DEEPBOOK_PACKAGE}::clob_v2::borrow_flashloan_base`,
    arguments: [
      tx.object(POOL_ID),
      tx.object(ACCOUNT_CAP_ID),
      tx.pure.u64(AMOUNT),
      zeroDeep,
      tx.object('0x6'), // clock
    ],
    typeArguments: [
      '0x2::sui::SUI', // Base
      '0xdba34672e30cb065b1f93e3ab55318768fd6fef66c15942c9f7cb846e2f900e7::usdc::USDC', // Quote
    ],
  });

  // Use the flash loaned base coin here (e.g., swap, arbitrage, etc.)
  // ...

  // Repay the flash loan - MUST return the same token type (BASE)
  // The receipt ensures atomic repayment
  tx.moveCall({
    target: `${DEEPBOOK_PACKAGE}::clob_v2::repay_flashloan_base`,
    arguments: [
      tx.object(POOL_ID),
      baseCoin, // Must be BASE token type
      receipt,
      tx.object('0x6'), // clock
    ],
    typeArguments: [
      '0x2::sui::SUI', // Base
      '0xdba34672e30cb065b1f93e3ab55318768fd6fef66c15942c9f7cb846e2f900e7::usdc::USDC', // Quote
    ],
  });

  console.log('Flash loan PTB constructed');
}

/**
 * Example: Borrow flash loan in quote token (e.g., USDC)
 */
async function borrowFlashLoanQuote() {
  const client = new SuiClient({ url: getFullnodeUrl('mainnet') });
  const tx = new Transaction();

  const POOL_ID = '0x...'; // SUI-USDC pool
  const ACCOUNT_CAP_ID = '0x...';
  const AMOUNT = 1_000_000n; // 1 USDC (6 decimals)

  const zeroDeep = tx.moveCall({
    target: '0x2::coin::zero',
    typeArguments: ['0xdeeb7a4662eec9f2f3def03fb937a663dddaa2e215b8078a284d026b7946c270::deep::DEEP'],
  });

  // Borrow flash loan in QUOTE token (USDC)
  const [baseCoin, quoteCoin, deepCoin, receipt] = tx.moveCall({
    target: `${DEEPBOOK_PACKAGE}::clob_v2::borrow_flashloan_quote`,
    arguments: [
      tx.object(POOL_ID),
      tx.object(ACCOUNT_CAP_ID),
      tx.pure.u64(AMOUNT),
      zeroDeep,
      tx.object('0x6'), // clock
    ],
    typeArguments: [
      '0x2::sui::SUI', // Base
      '0xdba34672e30cb065b1f93e3ab55318768fd6fef66c15942c9f7cb846e2f900e7::usdc::USDC', // Quote
    ],
  });

  // Use the flash loaned quote coin here
  // ...

  // Repay - MUST use repay_flashloan_quote and return QUOTE token type
  tx.moveCall({
    target: `${DEEPBOOK_PACKAGE}::clob_v2::repay_flashloan_quote`,
    arguments: [
      tx.object(POOL_ID),
      quoteCoin, // Must be QUOTE token type
      receipt,
      tx.object('0x6'),
    ],
    typeArguments: [
      '0x2::sui::SUI',
      '0xdba34672e30cb065b1f93e3ab55318768fd6fef66c15942c9f7cb846e2f900e7::usdc::USDC',
    ],
  });

  console.log('Flash loan PTB constructed');
}
