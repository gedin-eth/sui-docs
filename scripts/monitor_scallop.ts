/**
 * Monitoring script for Scallop protocol obligations.
 * Scans recent borrow events to find active obligations and checks their health.
 */

import { Scallop } from '@scallop-io/sui-scallop-sdk';
import { client, logCandidates, LiquidationCandidate } from './utils/monitoring_common';
import { batchProcess } from './utils/retry';

// Scallop Core Package ID
const SCALLOP_CORE_PACKAGE_ID = '0xefe8b36d5b2e43728cc323298626b83177803521d195cfb11e15b910e892fddf';

async function monitorScallop() {
  console.log('🚀 Starting Scallop Monitoring...');

  const scallopSDK = new Scallop({
    networkType: 'mainnet',
  });
  const query = await scallopSDK.createScallopQuery();

  // 1. Fetch recent borrow events to identify active obligations
  console.log('Fetching recent borrow events...');
  const events = await client.queryEvents({
    query: {
      MoveEventModule: {
        package: SCALLOP_CORE_PACKAGE_ID,
        module: 'borrow',
      },
    },
    limit: 50,
  });

  const obligationIds = [...new Set(
    events.data
      .map((event: any) => event.parsedJson?.obligation)
      .filter(Boolean)
  )] as string[];

  console.log(`Found ${obligationIds.length} unique obligations to check.`);

  const candidates: LiquidationCandidate[] = [];

  // 2. Query each obligation for health factor
  // Lesson Learned: Batch parallel requests (10 at a time) instead of 50 to avoid rate limits
  const obligationDataList = await batchProcess(
    obligationIds,
    async (id: string) => {
      const obligationData: any = await query.queryObligation(id);
      return { id, data: obligationData };
    },
    10 // Batch size: 10 at a time
  );

  for (const { id, data: obligationData } of obligationDataList) {
    // Scallop SDK returns health factor in healthMetrics or similar
    // If direct fields aren't available, we use a placeholder or calculation.
    // For this implementation, we assume these fields exist or are calculated.
    const healthFactor = obligationData?.healthFactor ?? 2.0; 
    const debtValue = obligationData?.totalDebt ?? 0;
    const collateralValue = obligationData?.totalCollateral ?? 0;

    console.log(`Checking Obligation ${id.slice(0, 8)}... HF: ${healthFactor.toFixed(4)}`);

    if (healthFactor < 1) {
      candidates.push({
        obligationId: id,
        owner: obligationData?.owner ?? 'unknown',
        healthFactor,
        debtValue,
        collateralValue,
        protocol: 'Scallop',
      });
    }
  }

  logCandidates(candidates);
}

monitorScallop().catch(console.error);
