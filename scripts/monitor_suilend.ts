/**
 * Monitoring script for Suilend protocol obligations.
 * Scans recent ObligationDataEvent to find active obligations and checks their health.
 */

import { SuilendClient, LENDING_MARKET_ID, LENDING_MARKET_TYPE } from '@suilend/sdk';
import { client, logCandidates, LiquidationCandidate } from './utils/monitoring_common';

// Suilend Package ID
const SUILEND_PACKAGE_ID = '0xf95b06141ed4a174f239417323bde3f209b972f5930d8521ea38a52aff3a6ddf';

async function monitorSuilend() {
  console.log('🚀 Starting Suilend Monitoring...');

  // 1. Fetch recent ObligationDataEvent
  console.log('Fetching recent Suilend ObligationDataEvents...');
  const events = await client.queryEvents({
    query: {
      MoveEventType: `${SUILEND_PACKAGE_ID}::obligation::ObligationDataEvent`,
    },
    limit: 50,
  });

  console.log(`Found ${events.data.length} ObligationDataEvents.`);

  const candidates: LiquidationCandidate[] = [];

  for (const event of events.data) {
    const data = event.parsedJson as any;
    const obligationId = data.obligation_id;
    
    // Suilend health factor: deposited_value / weighted_borrowed_value
    const depositedValue = Number(data.deposited_value_usd.value) / 1e18; // assuming 18 decimals for USD values in events
    const weightedBorrowValue = Number(data.weighted_borrowed_value_usd.value) / 1e18;
    const unhealthyBorrowValue = Number(data.unhealthy_borrow_value_usd.value) / 1e18;

    const healthFactor = weightedBorrowValue > 0 ? unhealthyBorrowValue / weightedBorrowValue : 2.0;

    console.log(`Checking Obligation ${obligationId.slice(0, 8)}... HF: ${healthFactor.toFixed(4)} (Debt: $${weightedBorrowValue.toFixed(2)})`);

    if (healthFactor < 1 && weightedBorrowValue > 0) {
      candidates.push({
        obligationId,
        owner: 'event-indexed',
        healthFactor,
        debtValue: weightedBorrowValue,
        collateralValue: depositedValue,
        protocol: 'Suilend',
      });
    }
  }

  logCandidates(candidates);
}

monitorSuilend().catch(console.error);
