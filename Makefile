# Makefile for Sui Docs Hugo site
# Requires Hugo extended edition

.PHONY: help dev build clean install check

# Default target
help:
	@echo "Sui Docs - Hugo Site Management"
	@echo ""
	@echo "Usage:"
	@echo "  make install   Install Hugo modules and dependencies"
	@echo "  make dev       Start Hugo development server"
	@echo "  make build     Build the site for production"
	@echo "  make clean     Clean build artifacts"
	@echo "  make check     Check Hugo and Go versions"

# Install Hugo modules
install:
	@echo "Installing Hugo modules..."
	cd docs && hugo mod get -u ./...
	@echo "Done."

# Start development server
dev:
	@echo "Starting Hugo development server..."
	cd docs && hugo server --buildDrafts --buildFuture --disableFastRender --bind 0.0.0.0

# Build for production
build:
	@echo "Building site for production..."
	cd docs && hugo --minify --gc
	@echo "Build complete. Output in docs/public/"

# Clean build artifacts
clean:
	@echo "Cleaning build artifacts..."
	rm -rf docs/public docs/resources docs/.hugo_build.lock
	@echo "Done."

# Check versions
check:
	@echo "Checking versions..."
	@echo "Hugo version:"
	@hugo version
	@echo ""
	@echo "Go version:"
	@go version
	@echo ""
	@echo "Node version (for npm scripts):"
	@node --version || echo "Node.js not installed"
