#!/usr/bin/env bash
# Exit on error
set -o errexit

# Install dependencies
npm install

# Build the project (optional, uncomment if needed)
npm run build

# Define Puppeteer cache directory
PUPPETEER_CACHE_DIR="/opt/render/.cache/puppeteer"
CHROME_PATH="$PUPPETEER_CACHE_DIR/chrome/linux-133.0.6943.126/chrome-linux64/chrome"

# Ensure Puppeteer cache directory exists
mkdir -p "$PUPPETEER_CACHE_DIR"

# Install Puppeteer and download Chrome
echo "📥 Installing Puppeteer and Chrome..."
npx puppeteer browsers install chrome

# Verify Chrome installation
if [[ -f "$CHROME_PATH" ]]; then
    echo "✅ Chrome found at: $CHROME_PATH"
else
    echo "❌ Chrome not found! Listing Puppeteer directory:"
    ls -R "$PUPPETEER_CACHE_DIR"
    exit 1
fi

# Export Chrome path for Puppeteer
export PUPPETEER_EXECUTABLE_PATH="$CHROME_PATH"
echo "✅ PUPPETEER_EXECUTABLE_PATH set to: $PUPPETEER_EXECUTABLE_PATH"
