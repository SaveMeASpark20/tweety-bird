#!/usr/bin/env bash
set -o errexit  # Exit on error

# Install dependencies
npm install

# Uncomment this line if you need to build your project
npm run build

# Ensure the Puppeteer cache directory exists
PUPPETEER_CACHE_DIR=/opt/render/.cache/puppeteer
mkdir -p $PUPPETEER_CACHE_DIR

# Install Puppeteer and download Chrome
npx puppeteer browsers install chrome
echo "✅ Puppeteer and Chrome installed"

# Get the correct path for Chrome
CHROME_PATH=$(npx puppeteer browsers path chrome)/chrome
echo "📌 Chrome binary is located at: $CHROME_PATH"

# Export Chrome path for Puppeteer
export PUPPETEER_EXECUTABLE_PATH="$CHROME_PATH"
echo "✅ Using Puppeteer executable path: $PUPPETEER_EXECUTABLE_PATH"

# Store/pull Puppeteer cache with build cache
if [[ -d "$PUPPETEER_CACHE_DIR" ]]; then
    echo "🔄 Storing Puppeteer Cache in Build Cache"
    cp -R $PUPPETEER_CACHE_DIR /opt/render/project/src/.cache/puppeteer/chrome/
else
    echo "📥 Copying Puppeteer Cache from Build Cache"
    cp -R /opt/render/project/src/.cache/puppeteer/chrome/ $PUPPETEER_CACHE_DIR
fi
