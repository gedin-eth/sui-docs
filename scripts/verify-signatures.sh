#!/bin/bash

# Module: Signature Verification Script
# Purpose: Demonstrates signature generation and verification using Fastcrypto CLI.
# Usage: ./scripts/verify-signatures.sh

# Note: Requires fastcrypto binaries to be built and available.
# This script is a template for manual verification.

SIGS_CLI="./target/debug/sigs-cli"

if [ ! -f "$SIGS_CLI" ]; then
    echo "Sigs-CLI not found at $SIGS_CLI. Please build it first using:"
    echo "cargo build --bin sigs-cli"
    exit 1
fi

echo "--- Generating Ed25519 Keypair ---"
$SIGS_CLI gen-key --scheme ed25519 > keypair.json

echo "--- Signing Message ---"
MESSAGE="Hello Sui"
$SIGS_CLI sign --key keypair.json --message "$MESSAGE" > signature.txt

echo "--- Verifying Signature ---"
$SIGS_CLI verify --key keypair.json --message "$MESSAGE" --signature signature.txt

echo "--- Clean up ---"
rm keypair.json signature.txt
