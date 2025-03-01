import puppeteer from 'puppeteer';
import express from 'express';

const app = express();
const PORT = process.env.PORT || 3000;



(async () => {
  try {
    console.log("Launching Puppeteer...");

    const browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    const page = await browser.newPage();
    await page.goto("https://example.com");

    console.log("Taking a screenshot...");
    await page.screenshot({ path: "screenshot.png" });

    console.log("✅ Puppeteer is working!");
  } catch (error: any) {
    console.error("❌ Puppeteer failed:", error.message);
  }
})();

app.get("/", (req, res) => {
  res.send("Puppeteer is running on Render!");
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
