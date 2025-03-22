# ---- Base Stage (Builder) ----
  FROM node:20-slim AS builder

  # Install Chromium and dependencies
  RUN apt-get update && apt-get install -y \
      chromium \
      ca-certificates \
      fonts-liberation \
      libasound2 \
      libatk1.0-0 \
      libcairo2 \
      libcups2 \
      libdbus-1-3 \
      libexpat1 \
      libfontconfig1 \
      libgbm1 \
      libglib2.0-0 \
      libgtk-3-0 \
      libnspr4 \
      libnss3 \
      libx11-6 \
      libx11-xcb1 \
      libxcb1 \
      libxcomposite1 \
      libxdamage1 \
      libxext6 \
      libxfixes3 \
      libxrandr2 \
      libxrender1 \
      wget \
      xdg-utils \
      && rm -rf /var/lib/apt/lists/*
  
  # Set Puppeteer’s Chromium path
  ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium
  ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
  
  WORKDIR /app
  
  # Copy package files first
  COPY package.json package-lock.json ./
  
  # Install dependencies using package-lock.json for consistency
  RUN npm ci --platform=linux
  
  # Copy the rest of the app files
  COPY . . 
  
  # Build the app and remove devDependencies
  RUN npm run build && npm prune --omit=dev
  
  # ---- Production Stage ----
  FROM node:20-slim
  
  WORKDIR /app
  
  # Install only Chromium dependencies (for Puppeteer)
  RUN apt-get update && apt-get install -y \
      chromium \
      fonts-liberation \
      libasound2 \
      libatk1.0-0 \
      libcairo2 \
      libcups2 \
      libdbus-1-3 \
      libexpat1 \
      libfontconfig1 \
      libgbm1 \
      libglib2.0-0 \
      libgtk-3-0 \
      libnspr4 \
      libnss3 \
      libx11-6 \
      libx11-xcb1 \
      libxcb1 \
      libxcomposite1 \
      libxdamage1 \
      libxext6 \
      libxfixes3 \
      libxrandr2 \
      libxrender1 \
      wget \
      xdg-utils \
      && rm -rf /var/lib/apt/lists/*
  
  # Copy necessary runtime files
  COPY --from=builder /app/node_modules ./node_modules
  COPY --from=builder /app/dist ./dist
  COPY --from=builder /app/package.json ./
  
  # Set environment variables
  ENV NODE_ENV=production
  ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium
  ENV DATABASE_PATH=/app/dist/db/tweet.db
  ENV COOKIES_VALUE=a6a66355d27787f390fdf45fd8c7b7d8f7abb9a0
  # Expose the port
  EXPOSE 10000
  
  # Run the application
  CMD ["node", "dist/main.js"]
  