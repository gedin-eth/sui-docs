import { initMainnetSDK } from '@cetusprotocol/cetus-sui-clmm-sdk';
import { getFullnodeUrl } from '@mysten/sui/client';

async function main() {
  const sdk = initMainnetSDK(getFullnodeUrl('mainnet'));
  console.log('Fetching pools...');
  console.log('⚠️  Note: getPools() can take 30-60 seconds to fetch all pools from mainnet.');
  
  try {
    // Add timeout wrapper for getPools() call
    const poolsPromise = sdk.Pool.getPools();
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Timeout: getPools() exceeded 90 seconds')), 90000)
    );
    
    const pools = await Promise.race([poolsPromise, timeoutPromise]) as any[];
    
    const cetusPools = pools.filter(p => 
      p.coinTypeA.toLowerCase().includes('cetus') ||
      p.coinTypeB.toLowerCase().includes('cetus')
    );

    console.log(`Found ${cetusPools.length} pools with CETUS.`);
    cetusPools.forEach(p => {
      console.log(`Pool: ${p.poolAddress}, A: ${p.coinTypeA}, B: ${p.coinTypeB}`);
    });
  } catch (error: any) {
    if (error.message.includes('Timeout')) {
      console.error('❌ Operation timed out. getPools() can take a long time on mainnet.');
      console.log('💡 Consider using a more specific query or caching pool data.');
    } else {
      console.error('❌ Error:', error.message);
    }
  }
}

main().catch(console.error);
