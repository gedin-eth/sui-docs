#!/bin/bash
# Test runner script for parallel execution of examples and scripts

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
TEST_RESULTS_DIR="$REPO_ROOT/test_results"

cd "$REPO_ROOT"

echo "🧪 Starting parallel test execution..."
echo "📁 Results will be saved to: $TEST_RESULTS_DIR"
echo ""

# Clean previous results
rm -rf "$TEST_RESULTS_DIR"/*.log 2>/dev/null || true

# Counter for tracking
PIDS=()
FAILED=0

# Function to run a test file
run_test() {
    local file="$1"
    local basename=$(basename "$file" .ts)
    local logfile="$TEST_RESULTS_DIR/${basename}.log"
    
    echo "  🚀 Starting: $file"
    npx tsx "$file" > "$logfile" 2>&1 || {
        echo "  ❌ Failed: $file (check $logfile)"
        FAILED=$((FAILED + 1))
    }
}

# Phase 1: Test Examples (12 files)
echo "📦 Phase 1: Testing Examples (12 files)..."
for file in examples/defi/*.ts examples/ptb-*.ts examples/ts/*.ts; do
    if [ -f "$file" ]; then
        run_test "$file" 60 &
        PIDS+=($!)
    fi
done

# Phase 2: Test Scripts (2 files - others already tested)
echo ""
echo "📦 Phase 2: Testing Scripts (2 files)..."
for file in scripts/doctor.ts scripts/find_cetus_pools.ts; do
    if [ -f "$file" ]; then
        run_test "$file" 30 &
        PIDS+=($!)
    fi
done

# Wait for all tests to complete
echo ""
echo "⏳ Waiting for all tests to complete..."
for pid in "${PIDS[@]}"; do
    wait "$pid" || true
done

echo ""
echo "✅ All tests completed!"
echo "📊 Failed tests: $FAILED"
echo "📁 Check logs in: $TEST_RESULTS_DIR"

# Generate summary
echo ""
echo "📋 Generating summary..."
{
    echo "=== TEST SUMMARY ==="
    echo "Date: $(date)"
    echo ""
    echo "=== FAILED TESTS ==="
    grep -l "error\|Error\|failed\|Failed" "$TEST_RESULTS_DIR"/*.log 2>/dev/null | while read log; do
        echo "  $(basename "$log" .log)"
    done || echo "  None"
    echo ""
    echo "=== SUCCESSFUL TESTS ==="
    ls "$TEST_RESULTS_DIR"/*.log 2>/dev/null | while read log; do
        if ! grep -q "error\|Error\|failed\|Failed" "$log" 2>/dev/null; then
            echo "  $(basename "$log" .log)"
        fi
    done
} > "$TEST_RESULTS_DIR/summary.log"

cat "$TEST_RESULTS_DIR/summary.log"
