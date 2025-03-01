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

# Install Puppeteer and download Chrome
npx puppeteer browsers install chrome

echo "🔍 Checking Puppeteer Cache Directory:"
find /opt/render/.cache/puppeteer/ -type f

echo "🔍 Searching for Chrome..."
find / -name "chrome" 2>/dev/null

# Store/pull Puppeteer cache with build cache only if needed
if [[ ! -d "/opt/render/.cache/puppeteer/chrome" ]]; then
    echo "📥 Copying Puppeteer Cache from Build Cache"
    cp -R "$PUPPETEER_CACHE_DIR" /opt/render/.cache/
else
    echo "✅ Puppeteer Cache already exists, skipping copy."
fi
