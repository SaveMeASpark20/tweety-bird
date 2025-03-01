#!/usr/bin/env bash
set -o errexit  # Exit on error

# Install dependencies
npm install

# Uncomment this line if you need to build your project
npm run build

# Ensure the Puppeteer cache directory exists
PUPPETEER_CACHE_DIR="/opt/render/.cache/puppeteer"
mkdir -p "$PUPPETEER_CACHE_DIR"

# Install Puppeteer and download Chrome
npx puppeteer browsers install chrome
echo "✅ Puppeteer and Chrome installed"

# Get the correct Chrome binary path
CHROME_DIR=$(npx puppeteer browsers path chrome)
CHROME_PATH=$(find "$CHROME_DIR" -type f -name "chrome" | head -n 1)

# Validate if Chrome exists
if [[ -z "$CHROME_PATH" ]]; then
    echo "❌ Error: Chrome binary not found!"
    exit 1
fi

echo "📌 Chrome binary is located at: $CHROME_PATH"

# Export Chrome path for Puppeteer
export PUPPETEER_EXECUTABLE_PATH="$CHROME_PATH"
echo "✅ Using Puppeteer executable path: $PUPPETEER_EXECUTABLE_PATH"

# Store/pull Puppeteer cache with build cache correctly
if [[ -d "$PUPPETEER_CACHE_DIR/chrome" ]]; then
    echo "🔄 Storing Puppeteer Cache in Build Cache"
    cp -R "$PUPPETEER_CACHE_DIR/chrome" "/opt/render/.cache/puppeteer_backup"
else
    echo "📥 Copying Puppeteer Cache from Build Cache"
    cp -R "/opt/render/.cache/puppeteer_backup" "$PUPPETEER_CACHE_DIR/chrome"
fi 
