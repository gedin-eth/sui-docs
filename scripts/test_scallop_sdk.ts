import { Scallop } from '@scallop-io/sui-scallop-sdk';
import { client } from './utils/monitoring_common';

async function main() {
  const scallopSDK = new Scallop({
    networkType: 'mainnet',
  });

  const query = await scallopSDK.createScallopQuery();
  
  console.log('Fetching market data...');
  const marketData = await query.queryMarket();
  console.log('Market Data keys:', Object.keys(marketData));

  // Note: getObligationAccounts without params might only work if we have a secret key set
  // or it might be intended for indexer usage if configured.
  // For a general monitor, we often need to fetch from events.
}

main().catch(console.error);
