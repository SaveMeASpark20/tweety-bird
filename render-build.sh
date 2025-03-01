#!/usr/bin/env bash
# Exit on error
set -o errexit

# Install dependencies
npm install

# Compile TypeScript
npm run build

# Define Puppeteer cache directory
export PUPPETEER_CACHE_DIR="/opt/render/.cache/puppeteer"

# Ensure Puppeteer cache directory exists
mkdir -p "$PUPPETEER_CACHE_DIR"

# Force Puppeteer to install Chrome
export PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=false
npx puppeteer browsers install chrome
