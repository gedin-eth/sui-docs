import { initMainnetSDK } from '@cetusprotocol/cetus-sui-clmm-sdk';
import { getFullnodeUrl } from '@mysten/sui/client';

async function main() {
  const sdk = initMainnetSDK(getFullnodeUrl('mainnet'));
  console.log('Fetching pools...');
  const pools = await sdk.Pool.getPools();
  
  const cetusPools = pools.filter(p => 
    p.coinTypeA.toLowerCase().includes('cetus') ||
    p.coinTypeB.toLowerCase().includes('cetus')
  );

  console.log(`Found ${cetusPools.length} pools with CETUS.`);
  cetusPools.forEach(p => {
    console.log(`Pool: ${p.poolAddress}, A: ${p.coinTypeA}, B: ${p.coinTypeB}`);
  });
}

main().catch(console.error);
