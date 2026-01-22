/**
 * @file aftermath_router.ts
 * @description Aftermath router API integration example.
 * 
 * Lesson Learned:
 * 1. API changed from GET to POST - The Aftermath router API now uses POST with JSON body, not GET with query params.
 * 2. Auth wasn't the issue - Router API works without authentication at default rate limits.
 * 3. Transaction format changed - API returns a serialized Transaction JSON object, not base64 bytes.
 *    Required the SUI TypeScript SDK to build/sign, hence the Node.js helper.
 */

import { SuiClient, getFullnodeUrl } from '@mysten/sui/client';
import { Transaction } from '@mysten/sui/transactions';

const AFTERMATH_ROUTER_API = 'https://aftermath.finance/api/router/trade-route';
const AFTERMATH_TRANSACTION_API = 'https://aftermath.finance/api/router/transactions/trade';

/**
 * Get a swap quote from Aftermath router
 * 
 * Lesson Learned: API uses POST with JSON body, not GET with query params
 */
async function getAftermathQuote(
  inputCoinType: string,
  outputCoinType: string,
  amount: string
): Promise<any> {
  // Lesson Learned: Correct endpoint is https://aftermath.finance/api/router/trade-route
  // (not router.aftermath.finance which doesn't exist)
  const response = await fetch(AFTERMATH_ROUTER_API, {
    method: 'POST', // Not GET!
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      coinInType: inputCoinType,
      coinOutType: outputCoinType,
      coinInAmount: amount,
      // Optional: slippage, referrer, protocolBlacklist, etc.
    }),
  });

  if (!response.ok) {
    throw new Error(`Aftermath router API error: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Execute a swap using Aftermath router
 * 
 * Lesson Learned: API returns Transaction JSON object, not base64 bytes
 */
async function executeAftermathSwap(
  client: SuiClient,
  inputCoinType: string,
  outputCoinType: string,
  amount: string,
  sender: string
): Promise<string> {
  // Step 1: Get trade route (returns route information)
  const routeResponse = await getAftermathQuote(inputCoinType, outputCoinType, amount);

  // Step 2: Get transaction for the route
  // Lesson Learned: API has separate endpoints - /router/trade-route for routes,
  // and /router/transactions/trade for transaction JSON
  const txResponse = await fetch(AFTERMATH_TRANSACTION_API, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      walletAddress: sender,
      completeRoute: routeResponse,
      slippage: 0.01, // 1% slippage tolerance
    }),
  });

  if (!txResponse.ok) {
    throw new Error(`Aftermath transaction API error: ${txResponse.statusText}`);
  }

  const txData = await txResponse.json();

  // Lesson Learned: API returns serialized Transaction JSON object
  // We need to deserialize it and sign with Sui SDK
  const transactionData = txData.transaction;

  // Step 3: Build transaction from JSON
  // The transaction object contains the PTB structure
  const tx = Transaction.from(transactionData);

  // Step 3: Sign and execute
  // Note: In production, you'd use your keypair here
  // const result = await client.signAndExecuteTransaction({
  //   signer: keypair,
  //   transaction: tx,
  //   options: { showEffects: true },
  // });

  // return result.digest;
  return 'transaction_digest_placeholder';
}

/**
 * Example usage
 */
async function main() {
  const client = new SuiClient({ url: getFullnodeUrl('mainnet') });
  const sender = '0x...'; // Your address

  try {
    // Get quote for swapping 1 SUI to USDC
    const quote = await getAftermathQuote(
      '0x2::sui::SUI',
      '0xdba34672e30cb065b1f93e3ab55318768fd6fef66c15942c9f7cb846e2f900e7::usdc::USDC',
      '1000000000' // 1 SUI in base units
    );

    console.log('Quote received:', quote);

    // Execute swap
    // const digest = await executeAftermathSwap(
    //   client,
    //   '0x2::sui::SUI',
    //   '0xdba34672e30cb065b1f93e3ab55318768fd6fef66c15942c9f7cb846e2f900e7::usdc::USDC',
    //   '1000000000',
    //   sender
    // );

    // console.log('Swap executed:', digest);
  } catch (error) {
    console.error('Aftermath router error:', error);
  }
}

main().catch(console.error);
