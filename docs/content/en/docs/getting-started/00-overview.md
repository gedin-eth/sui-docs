---
title: "Overview"
linkTitle: "Overview"
weight: 0
type: docs
description: "Introduction to the Sui Builder's Manual"
---

This page provides an overview of the Sui Builder's Manual structure and philosophy.

# Sui Builder's Manual

A **version-pinned, runnable, and tested reference implementation** for building on the Sui network.

This repository serves as a "Golden State" for developers and AI agents to ensure that implementation details (RPCs, package versions, transaction patterns) are accurate and tested against the live network.

## Core Philosophy

1. **Pin Everything**: No more guessing which SDK version works with which CLI
2. **Everything is Executable**: Every chapter includes a verified code example in `examples/`
3. **Troubleshooting as First-Class Content**: Common errors are indexed with exact remediation steps
4. **AI-Friendly**: Structured configurations (`config/`) allow generative AI to work within strict guardrails

---

## Repository Structure

- `manual/`: The reasoning and documentation layer
- `config/`: JSON definitions of pinned versions and network endpoints
- `examples/`: Verified Move and TypeScript reference implementations
- `scripts/`: Diagnostic tools like `doctor.ts`

---

## Getting Started

To verify your local environment against this manual, run the diagnostic script:

```bash
npm install
npm run doctor
```

## Chapters

1. [Toolchain & Versioning](./01-toolchain.md)
2. [Networks & RPCs](./02-networks-rpc.md)
3. [Move Package System](./03-move-packages.md)
4. [PTBs & Transactions](./04-ptb-transactions.md)
5. [DeFi: Cetus](../defi/05-defi-cetus.md)
6. [DeFi: Scallop](../defi/06-defi-scallop.md)
7. [DeFi: NAVI](../defi/07-defi-navi.md)
8. [DeFi: DeepBook](../defi/08-defi-deepbook.md)
9. [DeFi: Aftermath](../defi/09-defi-aftermath.md)
10. [Troubleshooting](../reference/08-troubleshooting.md)
11. [Production Checklist](../reference/09-production-checklist.md)
