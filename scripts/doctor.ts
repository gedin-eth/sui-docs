/**
 * @file doctor.ts
 * @description Validates the developer's environment against the pinned versions and network config.
 */

import { execSync } from 'child_process';
import { SuiClient } from '@mysten/sui/client';
import * as fs from 'fs';
import * as path from 'path';

async function main() {
  console.log('🔍 Sui Builder Doctor: Checking Environment...\n');

  const configPath = path.join(__dirname, '../config/versions.lock.json');
  const networksPath = path.join(__dirname, '../config/networks.json');

  if (!fs.existsSync(configPath) || !fs.existsSync(networksPath)) {
    console.error('❌ Configuration files not found. Run from repo root.');
    process.exit(1);
  }

  const versions = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
  const networks = JSON.parse(fs.readFileSync(networksPath, 'utf-8'));

  // 1. Check Sui CLI
  try {
    const suiVersionOutput = execSync('sui --version').toString().trim();
    const versionMatch = suiVersionOutput.match(/sui (\d+\.\d+\.\d+)/);
    const currentVersion = versionMatch ? versionMatch[1] : 'unknown';

    if (currentVersion === versions.sui_cli) {
      console.log(`✅ Sui CLI: ${suiVersionOutput} (Matches pinned version)`);
    } else {
      console.warn(`⚠️  Sui CLI Version Mismatch: Current ${currentVersion}, Pinned ${versions.sui_cli}`);
    }
  } catch (e) {
    console.error('❌ Sui CLI not found. Please install Sui CLI.');
  }

  // 2. Check Active Network
  try {
    const envsOutput = execSync('sui client envs --json').toString();
    const [envs, active] = JSON.parse(envsOutput);
    console.log(`✅ Active Network (CLI): ${active}`);

    const networkConfig = networks[active];
    if (networkConfig) {
      const client = new SuiClient({ url: networkConfig.rpc });
      const chainId = await client.getChainIdentifier();
      const apiVersion = await client.getRpcApiVersion();
      console.log(`✅ RPC Health: Connected to ${active} (Chain ID: ${chainId})`);
      console.log(`✅ RPC API Version: ${apiVersion}`);
    }
  } catch (e: any) {
    console.error(`❌ Network check failed: ${e.message}`);
  }

  console.log('\n✨ Doctor check complete.');
}

main().catch(console.error);
