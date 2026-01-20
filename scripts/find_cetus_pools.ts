import { initMainnetSDK } from '@cetusprotocol/cetus-sui-clmm-sdk';
import { getFullnodeUrl } from '@mysten/sui/client';

async function main() {
  const sdk = initMainnetSDK(getFullnodeUrl('mainnet'));
  console.log('Fetching pools...');
  const pools = await sdk.Pool.getPools();
  
  pools.slice(0, 20).forEach(p => {
    console.log(`Pool: ${p.poolAddress}, Coins: ${p.coinTypeA} / ${p.coinTypeB}`);
  });
}

main().catch(console.error);
