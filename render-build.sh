#!/usr/bin/env bash
# Exit on error
set -o errexit

# Install dependencies
npm install

# Build the project (optional, uncomment if needed)
npm run build

# Define Puppeteer cache directory
PUPPETEER_CACHE_DIR="/opt/render/.cache/puppeteer"
CHROME_PATH="$PUPPETEER_CACHE_DIR/chrome"

# Ensure Puppeteer cache directory exists
mkdir -p "$PUPPETEER_CACHE_DIR"

# Install Puppeteer and download Chrome
echo "📥 Installing Puppeteer and Chrome..."
npx puppeteer browsers install chrome

# Find Chrome's actual path
CHROME_EXECUTABLE=$(find "$CHROME_PATH" -name "chrome" 2>/dev/null | head -n 1)

if [[ -n "$CHROME_EXECUTABLE" ]]; then
    echo "✅ Chrome found at: $CHROME_EXECUTABLE"
else
    echo "❌ Chrome not found!"
    exit 1
fi
