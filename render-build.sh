#!/usr/bin/env bash
# Exit on error
set -o errexit

# Install dependencies
npm install

# Compile TypeScript (ensure your tsconfig.json is set up correctly)
npm run build

# Ensure the Puppeteer cache directory exists
PUPPETEER_CACHE_DIR=/opt/render/.cache/puppeteer
mkdir -p $PUPPETEER_CACHE_DIR

# Install Puppeteer and download Chrome if not installed
if [[ ! -f "$PUPPETEER_CACHE_DIR/chrome-linux/chrome" ]]; then
  echo "...Installing Chrome for Puppeteer"
  npx puppeteer browsers install chrome
else
  echo "...Chrome already installed, skipping download"
fi

# Store/pull Puppeteer cache with build cache
echo "...Storing Puppeteer Cache in Build Cache"
cp -R $PUPPETEER_CACHE_DIR /opt/render/project/src/.cache/puppeteer/chrome/
