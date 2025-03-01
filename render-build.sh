#!/usr/bin/env bash
# Exit on error
set -o errexit

# Install dependencies
npm install

# Uncomment this line if you need to build your project
npm run build

# Ensure the Puppeteer cache directory exists
PUPPETEER_CACHE_DIR="/opt/render/.cache/puppeteer"
mkdir -p "$PUPPETEER_CACHE_DIR"

echo "🔍 Checking Puppeteer Cache Directory before installation:"
find "$PUPPETEER_CACHE_DIR" -type f || echo "No files found"

# Install Puppeteer and download Chrome
npx puppeteer browsers install chrome

echo "✅ Puppeteer and Chrome installed"
echo "🔍 Searching for Chrome binary..."
find / -name "chrome" 2>/dev/null

# Avoid copying the directory into itself
if [[ -d "$PUPPETEER_CACHE_DIR/chrome" ]]; then
    echo "✅ Puppeteer cache already exists, skipping copy."
else
    echo "📥 Copying Puppeteer Cache from Build Cache"
    cp -R /opt/render/.cache/puppeteer/chrome "$PUPPETEER_CACHE_DIR"
fi
