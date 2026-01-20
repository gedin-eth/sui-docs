#!/bin/bash

# Module: DeFi Protocol Verification Script
# Purpose: Automates status checks for major DeFi protocols on Sui.
# Usage: ./scripts/verify-defi-protocols.sh [network]

set -e

NETWORK=${1:-"mainnet"}
RPC_URL="https://fullnode.$NETWORK.sui.io:443"

echo "--- Verifying DeFi Protocol Objects on $NETWORK ---"

# Protocol Object IDs (Mainnet)
SCALLOP_MARKET="0xa757975255146dc9686aa823b7838b507f315d704f428cbadad2f4ea061939d9"
NAVI_POOL="0x96df0fce3c471489f4debaaa762cf960b3d97820bd1f3f025ff8190730e958c5"
CETUS_POOL="0x..." # Update with Cetus Pool ID
DEEPBOOK_POOL="0xb663828d6217467c8a1838a03793da896cbe745b150ebd57d82f814ca579fc22" # DEEP-SUI

check_object() {
    local id=$1
    local name=$2
    echo "Checking $name ($id)..."
    if [[ $id == "0x..." ]]; then
        echo "  SKIP: Object ID not provided."
        return
    fi
    
    RESULT=$(curl -s --location --request POST "$RPC_URL" \
    --header 'Content-Type: application/json' \
    --data-raw "{
      \"jsonrpc\": \"2.0\",
      \"id\": 1,
      \"method\": \"sui_getObject\",
      \"params\": [\"$id\", {\"showContent\": true}]
    }")

    if [[ $RESULT == *"result"* ]]; then
        echo "  SUCCESS: $name found."
    else
        echo "  FAILURE: Could not find $name."
    fi
}

check_object "$SCALLOP_MARKET" "Scallop Market"
check_object "$NAVI_POOL" "Navi Pool"
check_object "$CETUS_POOL" "Cetus Pool"
check_object "$DEEPBOOK_POOL" "DeepBook Pool"

echo "--- Verification Complete ---"
