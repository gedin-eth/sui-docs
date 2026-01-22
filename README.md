# Sui Docs

A production-quality, version-pinned reference implementation for building on Sui. This repository provides tested code examples, verified scripts, and comprehensive documentation for interacting with core infrastructure and major DeFi protocols. All implementations are verified against live Sui mainnet and serve as a reference for developers and AI agents.

![Sui: The Object-Centric Blockchain Ecosystem](./assets/image-032ea50f-9cf0-4b7d-aa83-bea8b8f6b5db.png)

## Documentation Site

**Live Site**: [https://gedin-eth.github.io/sui-docs/](https://gedin-eth.github.io/sui-docs/)

## Project Structure

The repository is organized into several key areas for production-ready Sui development:

- `/docs`: Published documentation site
- `/manual`: Source documentation files
- `/examples`: Production-ready Sui code examples
- `/scripts`: Verification and monitoring scripts
- `/config`: Network configuration and version locks

## Prerequisites

To use the examples and scripts in this repository:

- **Node.js** (v20.x or later) - For running TypeScript examples and verification scripts
- **Sui CLI** - For Move package development and transaction execution

### Quick Start

1. **Clone the repository**:
   ```bash
   git clone https://github.com/gedin-eth/sui-docs.git
   cd sui-docs
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Run verification**:
   ```bash
   npm run doctor
   ```

4. **Explore examples** in the `/examples` directory

## Verification & Build Standard

All code examples in this repository are verified for:
- **Type Safety**: Passed `tsc` with strict settings
- **SDK Compatibility**: Tested against the pinned versions in `package.json`
- **Mainnet Connectivity**: Verification scripts successfully query live Sui mainnet data

### Verification Scripts

Run the environment doctor to verify your local setup:
```bash
npm install
npm run doctor
```

Verify network connectivity and CLI status:
```bash
./scripts/verify-sui-core.sh
```

Verify documentation weight consistency:
```bash
npm run verify:doc-weights
```

## Documentation Structure

### Getting Started
- [Overview](/docs/content/en/docs/getting-started/00-overview.md)
- [Toolchain & Versioning](/docs/content/en/docs/getting-started/01-toolchain.md)
- [Networks & RPCs](/docs/content/en/docs/getting-started/02-networks-rpc.md)
- [Move Package System](/docs/content/en/docs/getting-started/03-move-packages.md)
- [PTBs & Transactions](/docs/content/en/docs/getting-started/04-ptb-transactions.md)

### DeFi Protocols
- [Cetus CLMM DEX](/docs/content/en/docs/defi/05-defi-cetus.md)
- [Scallop Lending](/docs/content/en/docs/defi/06-defi-scallop.md)
- [NAVI Protocol](/docs/content/en/docs/defi/07-defi-navi.md)
- [DeepBook CLOB](/docs/content/en/docs/defi/08-defi-deepbook.md)
- [Aftermath Router](/docs/content/en/docs/defi/09-defi-aftermath.md)

### Advanced Topics
- [Liquidation Bots](/docs/content/en/docs/advanced/10-liquidation-bots.md)
- [Suilend](/docs/content/en/docs/advanced/11-suilend.md)
- [Bucket Protocol](/docs/content/en/docs/advanced/12-bucket-protocol.md)
- [Community Projects](/docs/content/en/docs/advanced/15-community-projects.md)
- [Community Protocols](/docs/content/en/docs/advanced/16-community-protocols.md)

### Reference
- [Oracle Integration](/docs/content/en/docs/reference/13-oracle-integration.md)
- [Token Registry](/docs/content/en/docs/reference/14-token-registry.md)
- [Troubleshooting](/docs/content/en/docs/reference/17-troubleshooting.md)
- [Production Checklist](/docs/content/en/docs/reference/18-production-checklist.md)
- [Utility Tools](/docs/content/en/docs/reference/19-utility-tools.md)

## Advanced Examples

Key examples include:

- [Atomic Swap & Deposit](./examples/ptb-swap-and-deposit.ts)
- [Flash Loan Arbitrage](./examples/ptb-flash-loan-arbitrage.ts)
- [Scallop Liquidation](./examples/ptb-scallop-liquidation.ts)
- [Cetus Swap](./examples/defi/cetus_swap.ts)
- [Scallop Supply](./examples/defi/scallop_supply.ts)
- [NAVI Supply](./examples/defi/navi_supply.ts)
- [DeepBook Flash Loan](./examples/defi/deepbook_flashloan.ts)
- [Aftermath Router](./examples/defi/aftermath_router.ts)
- [Cyclic Arbitrage](./examples/defi/cyclic_arbitrage.ts)
- [SpringSui Unwrap](./examples/defi/springsui_unwrap.ts)

See the `/examples` directory for the complete list.

## Network Configuration
Common protocol Object IDs are available in [config/network.json](./config/network.json).

## Documentation Coverage

This repository provides production-ready reference implementations and documentation for:

**Core Infrastructure**: Toolchain setup, networks, Move packages, PTBs

**DeFi Protocols**: Cetus, Scallop, NAVI, DeepBook, Aftermath Router

**Advanced Topics**: Liquidation bots, Suilend, Bucket Protocol, Community projects

**Reference Materials**: Oracle integration, token registry, troubleshooting, production checklist, utility tools

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request. For major changes, please open an issue first to discuss what you would like to change.

## License

This project is open source. See the repository for license details.
