/**
 * Common monitoring utilities for Sui DeFi protocols.
 * Provides a shared SuiClient and types for liquidation monitoring.
 */

import { SuiClient, getFullnodeUrl } from '@mysten/sui/client';

// Initialize SuiClient for Mainnet
export const client = new SuiClient({
  url: getFullnodeUrl('mainnet'),
});

/**
 * Interface for a potential liquidation candidate.
 */
export interface LiquidationCandidate {
  obligationId: string;
  owner: string;
  healthFactor: number;
  debtValue: number;
  collateralValue: number;
  protocol: 'Scallop' | 'Suilend';
}

/**
 * Log a list of liquidation candidates in a formatted table.
 */
export function logCandidates(candidates: LiquidationCandidate[]) {
  if (candidates.length === 0) {
    console.log('No liquidation candidates found (HF < 1).');
    return;
  }

  console.log(`\nFound ${candidates.length} potential liquidation targets:`);
  console.table(
    candidates.map((c) => ({
      Protocol: c.protocol,
      'Obligation ID': c.obligationId.slice(0, 10) + '...',
      'Health Factor': c.healthFactor.toFixed(4),
      'Debt ($)': c.debtValue.toFixed(2),
      'Collateral ($)': c.collateralValue.toFixed(2),
    }))
  );
}
