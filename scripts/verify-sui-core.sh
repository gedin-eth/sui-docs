#!/bin/bash

# Module: Sui Core Verification Script
# Purpose: Automates health checks and basic CLI operations for the Sui network.
# Usage: ./scripts/verify-sui-core.sh [network_url]

set -e

NETWORK_URL=${1:-"https://fullnode.devnet.sui.io:443"}

echo "--- Verifying Sui Network Health ---"
HEALTH_CHECK=$(curl -s --location --request POST "$NETWORK_URL" \
--header 'Content-Type: application/json' \
--data-raw '{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "sui_getLatestCheckpointSequenceNumber",
  "params": []
}')

if [[ $HEALTH_CHECK == *"result"* ]]; then
    CHECKPOINT=$(echo "$HEALTH_CHECK" | grep -oE '"result":"?[0-9]+' | cut -d':' -f2 | tr -d '"')
    echo "SUCCESS: Latest Checkpoint Sequence: $CHECKPOINT"
else
    echo "FAILURE: Could not connect to $NETWORK_URL"
    exit 1
fi

echo "--- Verifying Sui CLI ---"
if command -v sui &> /dev/null; then
    ACTIVE_ADDRESS=$(sui client active-address)
    echo "SUCCESS: Active Address: $ACTIVE_ADDRESS"
    
    echo "Checking Gas Balance..."
    sui client gas
else
    echo "WARNING: Sui CLI not installed. Skipping CLI checks."
fi

echo "--- Verification Complete ---"
