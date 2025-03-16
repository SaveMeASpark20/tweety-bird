import puppeteer from "puppeteer-core";
import { config } from "./config";
import {getLatestTweetDate, insertTweetDB } from "./db";
import { Post } from "./type";

import "dotenv/config";  // Automatically loads .env file



let browser: any;

async function initBrowser() {
  if (browser) return;
  try {
    browser = await puppeteer.launch({
      args: [
        "--disable-setuid-sandbox",
        "--no-sandbox",
        "--single-process",
        "--no-zygote",
      ],
      executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || "/usr/bin/chromium",
      headless: true,
    });
    // Handle browser disconnection
    browser.on("disconnected", () => {
      console.log("Browser disconnected. Restarting...");
      browser = null; // Reset browser to allow reinitialization
    });
  } catch (err) {
    console.error("Failed to initialize browser:", err);
    throw err;
  }
}

async function getXAccountLatestPost(name: string, handle: string): Promise<Post[]> {
  if (!name || !handle) return [];

  await initBrowser();
  const latestTweetDate = await getLatestTweetDate(handle);

  const userAgents = [
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Mozilla/5.0 (iPhone; CPU iPhone OS 16_2 like Mac OS X) AppleWebKit/537.36 (KHTML, like Gecko) Version/16.2 Mobile/15E148 Safari/537.36",
  ];
  const cookies = [
    {
      name: "auth_token",
      value: process.env.COOKIES_VALUE,
      domain: ".x.com",
      path: "/",
      httpOnly: true,
      secure: true,
      sameSite: "Lax",
    },
  ];

  const page = await browser.newPage();
  const randomUserAgent = userAgents[Math.floor(Math.random() * userAgents.length)];
  await page.setUserAgent(randomUserAgent);
  await page.setCookie(...cookies);

  let tweets: Post[] = [];

  try {
    await page.setRequestInterception(true);
    page.on("request", (request: any) => request.continue());

    page.on("response", async (response: any) => {
      try {
        if (response.status() !== 200) return;

        const url = response.url();
        if (!url.includes("UserTweets")) return;

        const contentType = response.headers()["content-type"];
        if (!contentType || !contentType.includes("application/json")) return;

        const body = await response.json();
        if (!body.data?.user?.result?.timeline_v2?.timeline?.instructions) {
          console.error("Invalid response structure");
          return;
        }

        const instructions = body.data.user.result.timeline_v2.timeline.instructions;
        const timelineEntries = instructions
          .filter((inst: any) => inst.type === "TimelineAddEntries")
          .flatMap((inst: any) => inst.entries);

        timelineEntries.forEach((entry: any) => {
          if (entry?.content?.itemContent?.tweet_results && entry.entryId && entry.sortIndex) {
            const id = entry.entryId;
            const sortIndex = entry.sortIndex;
            const full_text = entry?.content?.itemContent?.tweet_results?.result?.legacy?.full_text;
            const media_url = entry?.content?.itemContent?.tweet_results.result?.legacy?.extended_entities?.media[0]?.media_url_https;
            const profile = entry?.content?.itemContent?.tweet_results?.result?.core?.user_results?.result?.legacy?.profile_image_url_https;
            const created_at = new Date(entry.content.itemContent.tweet_results.result.legacy.created_at);
            const url = entry?.content?.itemContent?.tweet_results.result?.legacy?.extended_entities?.media[0]?.expanded_url;

            if (!latestTweetDate || created_at > new Date(latestTweetDate)) {
              tweets.push({
                id,
                sortIndex,
                full_text,
                media_url,
                profile,
                created_at: created_at.toISOString(),
                url,
                handle,
              });
            }
          }
        });
      } catch (err) {
        console.error("Error parsing response:", err);
      }
    });

    console.log(`Navigating to https://x.com/${handle}...`);
    await page.goto(`https://x.com/${handle}`, { waitUntil: "networkidle2" });

    // Wait for the specific API response
    try {
      await page.waitForResponse(
        (response : any) => response.url().includes("UserTweets"),
        { timeout: 10000 }
      );
    } catch (err) {
      console.error("Timed out waiting for API response:", err);
    }
  } catch (err) {
    console.error("Error fetching tweets:", err);
  } finally {
    await page.close();
  }

  return tweets;
}

export async function scrape() : Promise<Post[]> {
  try {
    let tweets: Post[] = [];
    const listXAccounts = config.xAccounts;

    for (const { handle, name } of listXAccounts) {
      console.log(`Fetching tweets for @${handle}...`);
      const posts = await getXAccountLatestPost(name, handle);

      for (const post of posts) {  // ✅ Use for...of for async/await
        if (post.id && post.sortIndex && post.profile && post.created_at && post.url && post.handle) {
          console.log(post)
          const insertTweet = await insertTweetDB(post);  // ✅ No scope issue
          if (insertTweet) {
            console.log(`Tweet inserted successfully`);
            tweets.push(post);
          }
        }
      }
    }
    return tweets
  } catch (error: any) { 
    throw new Error(`Something went wrong: ${error.message}`);
  }
}


