#!/bin/bash
# Setup git hooks for documentation weight verification

HOOK_FILE=".git/hooks/pre-commit"
HOOK_CONTENT='#!/bin/bash
# Pre-commit hook to verify Hugo documentation weights

if git diff --cached --name-only | grep -q "docs/content/en/docs/.*\.md$"; then
  echo "Checking documentation weights..."
  if ! npm run verify:doc-weights; then
    echo ""
    echo "❌ Documentation weight verification failed!"
    echo "Please fix weight conflicts before committing."
    echo ""
    exit 1
  fi
fi
'

echo "Installing pre-commit hook..."
echo "$HOOK_CONTENT" > "$HOOK_FILE"
chmod +x "$HOOK_FILE"
echo "✅ Pre-commit hook installed successfully!"
echo ""
echo "The hook will automatically verify documentation weights when you commit changes to docs/content/en/docs/*.md files."
