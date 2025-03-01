#!/usr/bin/env bash
# Exit on error
set -o errexit

# Install dependencies
npm install

# Uncomment this line if you need to build your project
npm run build

# Ensure the Puppeteer cache directory exists
PUPPETEER_CACHE_DIR=/opt/render/.cache/puppeteer
mkdir -p "$PUPPETEER_CACHE_DIR"

echo "🔍 Checking Puppeteer Cache Directory:"
find "$PUPPETEER_CACHE_DIR" -type f || echo "No files found"

# Install Puppeteer and download Chrome
npx puppeteer browsers install chrome

echo "✅ Puppeteer and Chrome installed"
echo "🔍 Checking Puppeteer Cache Directory after installation:"
find "$PUPPETEER_CACHE_DIR" -type f || echo "No files found"

# Store/pull Puppeteer cache with build cache
if [[ -d "$PUPPETEER_CACHE_DIR/chrome" ]]; then
    echo "🔄 Storing Puppeteer Cache in Build Cache"
    cp -R "$PUPPETEER_CACHE_DIR/chrome" /opt/render/.cache/puppeteer/
else
    echo "📥 Copying Puppeteer Cache from Build Cache"
    cp -R /opt/render/.cache/puppeteer/chrome "$PUPPETEER_CACHE_DIR"
fi
