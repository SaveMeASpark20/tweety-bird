import puppeteer from 'puppeteer';
import express from 'express';
import fs from 'fs';

const app = express();
const PORT = process.env.PORT || 3000;

app.get("/", async (req, res)  =>  {
  try {
    console.log("Launching Puppeteer...");
    console.log("Executable Path: ", puppeteer.executablePath());
    const browser = await puppeteer.launch({
      executablePath: "/opt/render/.cache/puppeteer/chrome/linux-133.0.6943.126/chrome-linux64/chrome",
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });
  

    console.log("✅ Puppeteer started successfully!");
  } catch (error: any) {
    console.error("❌ Puppeteer failed:", error.message);
    // return `❌ Puppeteer failed: ${error.message}`;
  }
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});

/*
/opt/render/.cache/puppeteer/chrome
/opt/render/.cache/puppeteer/chrome/puppeteer/chrome
/opt/render/.cache/puppeteer/chrome/linux-133.0.6943.126/chrome-linux64/chrome
*/