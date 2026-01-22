/**
 * @file test-runner.ts
 * @description Parallel test runner with timeout detection for hanging tests
 */

import { spawn, ChildProcess } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

interface TestConfig {
  file: string;
  timeout: number;
  category: string;
}

const REPO_ROOT = path.resolve(__dirname, '..');
const TEST_RESULTS_DIR = path.join(REPO_ROOT, 'test_results');

// Test configurations
const EXAMPLES: TestConfig[] = [
  { file: 'examples/defi/aftermath_router.ts', timeout: 30, category: 'DeFi' },
  { file: 'examples/defi/cetus_swap.ts', timeout: 30, category: 'DeFi' },
  { file: 'examples/defi/cyclic_arbitrage.ts', timeout: 30, category: 'DeFi' },
  { file: 'examples/defi/deepbook_flashloan.ts', timeout: 30, category: 'DeFi' },
  { file: 'examples/defi/navi_supply.ts', timeout: 30, category: 'DeFi' },
  { file: 'examples/defi/scallop_liquidate.ts', timeout: 30, category: 'DeFi' },
  { file: 'examples/defi/scallop_supply.ts', timeout: 30, category: 'DeFi' },
  { file: 'examples/defi/springsui_unwrap.ts', timeout: 30, category: 'DeFi' },
  { file: 'examples/ptb-flash-loan-arbitrage.ts', timeout: 30, category: 'PTB' },
  { file: 'examples/ptb-scallop-liquidation.ts', timeout: 30, category: 'PTB' },
  { file: 'examples/ptb-swap-and-deposit.ts', timeout: 30, category: 'PTB' },
  { file: 'examples/ts/ptb_transfer.ts', timeout: 30, category: 'PTB' },
];

const SCRIPTS: TestConfig[] = [
  { file: 'scripts/doctor.ts', timeout: 30, category: 'Script' },
  { file: 'scripts/find_cetus_pools.ts', timeout: 120, category: 'Script' }, // getPools() can take 30-120s on mainnet
  { file: 'scripts/test_scallop_sdk.ts', timeout: 60, category: 'Script' }, // queryMarket() can be slow
];

interface TestResult {
  file: string;
  status: 'success' | 'failed' | 'timeout' | 'error';
  duration: number;
  error?: string;
}

function runTest(config: TestConfig): Promise<TestResult> {
  return new Promise((resolve) => {
    const startTime = Date.now();
    const basename = path.basename(config.file, '.ts');
    const logfile = path.join(TEST_RESULTS_DIR, `${basename}.log`);
    
    const logStream = fs.createWriteStream(logfile);
    
    const child: ChildProcess = spawn('npx', ['tsx', config.file], {
      cwd: REPO_ROOT,
      stdio: ['ignore', 'pipe', 'pipe'],
    });

    let stdout = '';
    let stderr = '';

    child.stdout?.on('data', (data) => {
      const str = data.toString();
      stdout += str;
      logStream.write(str);
    });

    child.stderr?.on('data', (data) => {
      const str = data.toString();
      stderr += str;
      logStream.write(str);
    });

    // Timeout detection
    const timeoutId = setTimeout(() => {
      if (!child.killed) {
        console.log(`  ⏱️  TIMEOUT: ${config.file} (exceeded ${config.timeout}s)`);
        child.kill('SIGTERM');
        
        // Force kill after 2 seconds if still running
        setTimeout(() => {
          if (!child.killed) {
            child.kill('SIGKILL');
          }
        }, 2000);

        logStream.write(`\n\n[TIMEOUT] Test exceeded ${config.timeout}s timeout\n`);
        logStream.end();
        
        resolve({
          file: config.file,
          status: 'timeout',
          duration: Date.now() - startTime,
          error: `Test exceeded ${config.timeout}s timeout`,
        });
      }
    }, config.timeout * 1000);

    child.on('exit', (code, signal) => {
      clearTimeout(timeoutId);
      const duration = Date.now() - startTime;
      logStream.end();

      if (signal === 'SIGTERM' || signal === 'SIGKILL') {
        resolve({
          file: config.file,
          status: 'timeout',
          duration,
          error: `Killed due to timeout (${config.timeout}s)`,
        });
      } else if (code === 0) {
        resolve({
          file: config.file,
          status: 'success',
          duration,
        });
      } else {
        resolve({
          file: config.file,
          status: 'failed',
          duration,
          error: stderr || `Process exited with code ${code}`,
        });
      }
    });

    child.on('error', (error) => {
      clearTimeout(timeoutId);
      logStream.end();
      resolve({
        file: config.file,
        status: 'error',
        duration: Date.now() - startTime,
        error: error.message,
      });
    });
  });
}

async function main() {
  console.log('🧪 Starting parallel test execution...');
  console.log(`📁 Results will be saved to: ${TEST_RESULTS_DIR}\n`);

  // Ensure test results directory exists
  if (!fs.existsSync(TEST_RESULTS_DIR)) {
    fs.mkdirSync(TEST_RESULTS_DIR, { recursive: true });
  }

  // Clean previous results
  const existingLogs = fs.readdirSync(TEST_RESULTS_DIR).filter(f => f.endsWith('.log'));
  existingLogs.forEach(f => fs.unlinkSync(path.join(TEST_RESULTS_DIR, f)));

  const allTests = [...EXAMPLES, ...SCRIPTS];
  const results: TestResult[] = [];

  console.log(`📦 Phase 1: Testing Examples (${EXAMPLES.length} files)...`);
  for (const test of EXAMPLES) {
    console.log(`  🚀 Starting: ${test.file}`);
  }

  console.log(`\n📦 Phase 2: Testing Scripts (${SCRIPTS.length} files)...`);
  for (const test of SCRIPTS) {
    console.log(`  🚀 Starting: ${test.file}`);
  }

  console.log('\n⏳ Running tests in parallel...\n');

  // Run all tests in parallel
  const testPromises = allTests.map(test => runTest(test));
  const testResults = await Promise.all(testPromises);

  // Process results
  const successful = testResults.filter(r => r.status === 'success');
  const failed = testResults.filter(r => r.status === 'failed');
  const timedOut = testResults.filter(r => r.status === 'timeout');
  const errors = testResults.filter(r => r.status === 'error');

  console.log('\n✅ All tests completed!\n');
  console.log('📊 Results Summary:');
  console.log(`  ✅ Successful: ${successful.length}`);
  console.log(`  ❌ Failed: ${failed.length}`);
  console.log(`  ⏱️  Timeout: ${timedOut.length}`);
  console.log(`  🔴 Errors: ${errors.length}`);

  if (timedOut.length > 0) {
    console.log('\n⏱️  Timed Out Tests:');
    timedOut.forEach(r => {
      console.log(`  - ${r.file} (${(r.duration / 1000).toFixed(1)}s)`);
    });
  }

  if (failed.length > 0) {
    console.log('\n❌ Failed Tests:');
    failed.forEach(r => {
      console.log(`  - ${r.file}`);
      if (r.error) {
        console.log(`    Error: ${r.error.substring(0, 100)}...`);
      }
    });
  }

  if (errors.length > 0) {
    console.log('\n🔴 Error Tests:');
    errors.forEach(r => {
      console.log(`  - ${r.file}: ${r.error}`);
    });
  }

  // Generate summary file
  const summary = {
    date: new Date().toISOString(),
    total: allTests.length,
    successful: successful.length,
    failed: failed.length,
    timedOut: timedOut.length,
    errors: errors.length,
    results: testResults,
  };

  fs.writeFileSync(
    path.join(TEST_RESULTS_DIR, 'summary.json'),
    JSON.stringify(summary, null, 2)
  );

  console.log(`\n📁 Detailed logs: ${TEST_RESULTS_DIR}`);
  console.log(`📋 Summary JSON: ${path.join(TEST_RESULTS_DIR, 'summary.json')}`);

  // Exit with error code if any tests failed
  if (failed.length > 0 || timedOut.length > 0 || errors.length > 0) {
    process.exit(1);
  }
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
