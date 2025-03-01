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

echo "🔍 Searching for Chrome..."
find / -name "chrome" 2>/dev/null


# Store/pull Puppeteer cache with build cache
if [[ -d "$PUPPETEER_CACHE_DIR" ]]; then
    echo "🔄 Storing Puppeteer Cache in Build Cache"
    cp -R $PUPPETEER_CACHE_DIR /opt/render/.cache/puppeteer/chrome/
else
    echo "📥 Copying Puppeteer Cache from Build Cache"
    cp -R /opt/render/.cache/puppeteer/chrome/ $PUPPETEER_CACHE_DIR
fi
