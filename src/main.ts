import puppeteer from 'puppeteer';
import express from 'express';
import fs from 'fs';

const app = express();
const PORT = process.env.PORT || 3000;

const scrape = async () => {
  try {
    console.log("Launching Puppeteer...");

    const browser = await puppeteer.launch({
      headless: true,
      executablePath: "/opt/google/chrome/chrome",
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    console.log("✅ Puppeteer started successfully!");

    const page = await browser.newPage();
    await page.goto("https://example.com");

    await page.screenshot({ path: "screenshot.png" });

    console.log("📸 Screenshot taken!");

    await browser.close();
  } catch (error: any) {
    console.error("❌ Puppeteer failed:", error.message);
  }
};

const CACHE_DIR = "/opt/render/.cache/puppeteer";

app.get("/check-cache", (req, res) => {
  fs.readdir(CACHE_DIR, (err : any, files : any) => {
    if (err) {
      return res.status(500).send(`Error reading cache: ${err.message}`);
    }
    res.send(`Puppeteer Cache Files:\n${files.join("\n")}`);
  });
});

app.get("/", (req, res) => {
  scrape();
  res.send("Puppeteer is running on Render!");
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});

