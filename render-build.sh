#!/usr/bin/env bash
# Exit on error
set -o errexit

# Install dependencies
npm install

# Compile TypeScript (if needed)
npm run build

# Define Puppeteer cache directory
PUPPETEER_CACHE_DIR="/opt/render/.cache/puppeteer"
CHROME_BINARY_PATH="$PUPPETEER_CACHE_DIR/chrome/linux-133.0.6943.126/chrome-linux64/chrome"

# Ensure Puppeteer cache directory exists
mkdir -p "$PUPPETEER_CACHE_DIR"

# Install Puppeteer and download Chrome if not already installed
if [[ ! -f "$CHROME_BINARY_PATH" ]]; then
  echo "Installing Chrome for Puppeteer..."
  npx puppeteer browsers install chrome
else
  echo "Chrome is already installed at $CHROME_BINARY_PATH"
fi
