# Sui Docs

A comprehensive developer documentation and verification suite for the Sui blockchain ecosystem. This repository contains manuals, examples, and scripts for interacting with core infrastructure and major DeFi protocols.

![Sui: The Object-Centric Blockchain Ecosystem](./assets/image-032ea50f-9cf0-4b7d-aa83-bea8b8f6b5db.png)

## Documentation Site

This repository includes a Hugo-based documentation site using the Docsy theme. The site is automatically deployed to GitHub Pages on pushes to `main`.

**Live Site**: [https://gedin-eth.github.io/sui-docs/](https://gedin-eth.github.io/sui-docs/)

## Project Structure

The repository is organized into several key areas to support full-stack DeFi development on Sui:

- `/docs`: Hugo documentation site (Docsy theme)
  - `/docs/content/en/`: English documentation content
  - `/docs/config/`: Hugo configuration files
- `/manual`: Source documentation guides (migrated to Hugo site)
- `/examples`: Code snippets and implementation examples
- `/scripts`: Verification scripts for testing network health and protocol functionality
- `/config`: Configuration templates and environment settings

## Local Development

### Prerequisites

- [Hugo Extended](https://gohugo.io/installation/) (v0.152.2 or later - required by Docsy 0.13.0)
- [Go](https://golang.org/doc/install) (v1.21 or later)
- [Node.js](https://nodejs.org/) (v20.x for running verification scripts)

### Quick Start

1. **Clone the repository**:
   ```bash
   git clone https://github.com/gedin-eth/sui-docs.git
   cd sui-docs
   ```

2. **Install Hugo modules**:
   ```bash
   make install
   ```

3. **Start the development server**:
   ```bash
   make dev
   ```

4. **Open your browser** to [http://localhost:1313](http://localhost:1313)

### Available Make Commands

| Command | Description |
|---------|-------------|
| `make help` | Show available commands |
| `make install` | Install Hugo modules and dependencies |
| `make dev` | Start Hugo development server with live reload |
| `make build` | Build the site for production (output in `docs/public/`) |
| `make clean` | Remove build artifacts |
| `make check` | Check Hugo and Go versions |

### Manual Hugo Commands

If you prefer not to use Make:

```bash
# Navigate to docs directory
cd docs

# Install modules
hugo mod get -u ./...

# Start development server
hugo server --buildDrafts --buildFuture

# Build for production
hugo --minify --gc
```

## Deployment

The site automatically deploys to GitHub Pages via GitHub Actions when changes are pushed to the `main` branch.

### Manual Deployment

1. Build the site:
   ```bash
   make build
   ```

2. The static site will be generated in `docs/public/`

### GitHub Pages Setup

To enable GitHub Pages deployment:

1. Go to repository **Settings** > **Pages**
2. Under "Build and deployment", select **GitHub Actions**
3. The workflow will automatically deploy on pushes to `main`

## Verification & Build Standard

All code examples in this repository are verified for:
- **Type Safety**: Passed `tsc` with strict settings
- **SDK Compatibility**: Tested against the pinned versions in `package.json`
- **Mainnet Connectivity**: Verification scripts successfully query live Sui mainnet data

Run the environment doctor to verify your local setup:
```bash
npm install
npm run doctor
```

### Verify Network Health
Run the core verification script to check network connectivity and CLI status:
```bash
./scripts/verify-sui-core.sh
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
- [Atomic Swap & Deposit](./examples/ptb-swap-and-deposit.ts)
- [Flash Loan Arbitrage (Advanced)](./examples/ptb-flash-loan-arbitrage.ts)
- [Scallop Liquidation](./examples/ptb-scallop-liquidation.ts)

## Network Configuration
Common protocol Object IDs are available in [config/network.json](./config/network.json).

## Ecosystem Coverage

### Phase 1: Core Infrastructure
- [x] Sui Protocol & CLI
- [x] Move Programming Language
- [x] Fastcrypto & Signatures

### Phase 2: Major DeFi Protocols
- [x] Scallop (Lending)
- [x] Navi (Lending)
- [x] Cetus (CLMM DEX)
- [x] SeaProtocol (DEX Aggregator)
- [x] Legato Finance (Prediction Markets)

### Phase 3: Tools and Specialized SDKs
- [x] Deepbookpy
- [x] Sui Butler (MCP/CLI)
- [x] Sui DeFi Vault

### Phase 4: Community Projects
- [x] Memetic-LaunchPad
- [x] Cetus Volume Booster
- [x] GemWallet

### Phase 5: Monitoring & Advanced Arbitrage
- [x] Scallop Obligation Monitor (HF < 1)
- [x] Suilend Obligation Monitor (HF < 1)
- [x] Cyclic Arbitrage (Conceptual PTB)
- [x] Verified Developer Curl One-Liners
- [x] Token Registry Update (DEEP, NS, WAL, SCA)

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request. For major changes, please open an issue first to discuss what you would like to change.

## License

This project is open source. See the repository for license details.
