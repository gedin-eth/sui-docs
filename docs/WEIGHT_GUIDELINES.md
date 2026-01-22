# Hugo Documentation Weight Guidelines

## Overview

Hugo uses the `weight` frontmatter property to order pages in navigation menus. In the Docsy theme, weights are **globally scoped** across all sections, meaning each page must have a **unique weight value** to ensure proper ordering.

## Current Weight Allocation

### Getting Started (1-4)
- `1`: Toolchain & Versioning
- `2`: Networks & RPCs
- `3`: Move Package System
- `4`: PTBs & Transactions

### DeFi Protocols (5-9)
- `5`: Cetus CLMM DEX
- `6`: Scallop Lending
- `7`: NAVI Protocol
- `8`: DeepBook CLOB
- `9`: Aftermath Router

### Advanced Topics (10-16)
- `10`: Liquidation Bots
- `11`: Suilend
- `12`: Bucket Protocol
- `13`: Oracle Integration
- `14`: Token Registry
- `15`: Community Projects
- `16`: Community Protocols

### Reference (17-19)
- `17`: Troubleshooting
- `18`: Production Checklist
- `19`: Utility Tools

## Rules for Adding New Pages

1. **Always assign a globally unique weight** - Check existing weights before assigning
2. **Use sequential integers** - Avoid gaps larger than 1 (e.g., don't jump from 19 to 50)
3. **Update the Overview page** - Add new chapters to the "Chapters" list in `docs/content/en/docs/getting-started/00-overview.md`
4. **Run the verification script** - Use `npm run verify:doc-weights` before committing

## Verification

Run the verification script to check for weight conflicts:

```bash
npm run verify:doc-weights
```

This script will:
- ✅ Verify all pages have a weight property
- ✅ Check for duplicate weights
- ✅ Warn about gaps in the sequence
- ✅ Display a summary of all weights

## Common Mistakes

❌ **Don't reuse weights across sections** - Even if pages are in different sections, weights must be globally unique

❌ **Don't use section-local numbering** - Hugo doesn't scope weights by section, so weights 1-5 in "defi" will conflict with weights 1-5 in "reference"

✅ **Do use globally sequential weights** - Assign the next available integer (e.g., if highest is 19, use 20 for the next page)

## File Naming Convention

While file names don't affect ordering, we use a convention for consistency:
- Getting Started: `01-toolchain.md`, `02-networks-rpc.md`, etc.
- DeFi: `05-defi-cetus.md`, `06-defi-scallop.md`, etc.
- Advanced: `10-liquidation-bots.md`, `11-suilend.md`, etc.
- Reference: `17-troubleshooting.md`, `18-production-checklist.md`, etc.

**Note**: The filename prefix should match the weight for clarity, but the actual ordering is controlled by the `weight` frontmatter property.
