import puppeteer, { Browser } from "puppeteer-core";
import { config } from "./config";
import { getLatestTweetDate, insertTweetDB } from "./db";
import { Post } from "./type";
import "dotenv/config";  // Automatically loads .env file

let browser: Browser | null = null;

async function initBrowser() : Promise <boolean> {
  console.log("browser Initializing...")
  if (browser) {
    try {
      const pages = await browser.pages();
      if (pages.length > 0) return true; // Browser is still running
    } catch (error) {
      console.error("Browser is unresponsive. Restarting...");
      browser = null; // Reset browser if it’s not responding
    }
  }

  try {
    browser = await puppeteer.launch({
      headless: config.browserConfig.headless,
      executablePath: config.browserConfig.executablePath,
      args: config.browserConfig.args,
    });

    console.log("Browser launched successfully");
    return true;
  } catch (error) {
    console.error("Failed to launch browser:", error);
    browser = null; // Ensure browser is reset on failure
    return false;
  }
}

async function getXAccountLatestPost(name: string, handle: string): Promise<Post[]> {
  try {
    
    if (!name || !handle) return [];

    // Ensure browser is initialized before proceeding
    if(!browser) {
      await initBrowser()
    }

    if(browser) {
      console.log("Browser is running")
    }

    const latestTweetDate = await getLatestTweetDate(handle);
    const userAgents = [
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      "Mozilla/5.0 (iPhone; CPU iPhone OS 16_2 like Mac OS X) AppleWebKit/537.36 (KHTML, like Gecko) Version/16.2 Mobile/15E148 Safari/537.36",
    ];

  const cookieValue = process.env.COOKIES_VALUE;
  if (!cookieValue) {
    throw new Error("COOKIES_VALUE is missing from the environment variables");
  }

  const cookies = [
    {
      name: "auth_token",
      value: cookieValue,
      domain: ".x.com",
      path: "/",
      httpOnly: true,
      secure: true,
      sameSite: "Lax" as "Lax" 
    }
  ];

  
  const page = await browser?.newPage();
  if(!page) return []
    await browser?.setCookie(...cookies)
    const randomUserAgent = userAgents[Math.floor(Math.random() * userAgents.length)];
    await page.setUserAgent(randomUserAgent);
    await page.setRequestInterception(true);
    page.on("request", (request: any) => request.continue());

    let tweets: Post[] = [];

    page.on("response", async (response: any) => {
      if (response.status() !== 200) return;

      const url = response.url();
      if (!url.includes("UserTweets")) return;

      const contentType = response.headers()["content-type"];
      if (!contentType || !contentType.includes("application/json")) {
        return;
      }

      const body = await response.json();
      const instructions = body.data?.user?.result?.timeline_v2?.timeline?.instructions;
      if (!instructions) return;

      const timelineEntries = instructions
        .filter((inst: any) => inst.type === "TimelineAddEntries")
        .flatMap((inst: any) => inst.entries);

      timelineEntries.forEach((entry: any) => {
        if (entry?.content?.itemContent?.tweet_results && entry.entryId && entry.sortIndex) {
          const id = entry.entryId;
          const sortIndex = entry.sortIndex;
          const full_text = entry?.content?.itemContent?.tweet_results?.result?.legacy?.full_text;
          const media_url = entry?.content?.itemContent?.tweet_results.result?.legacy?.extended_entities?.media[0].media_url_https;
          const profile = entry?.content?.itemContent?.tweet_results?.result.core?.user_results?.result?.legacy?.profile_image_url_https;
          const created_at = new Date(entry.content.itemContent.tweet_results.result.legacy.created_at);
          const url = `https://x.com/${handle}/status/${entry.entryId.split("-")[1]}`;

          if (!latestTweetDate || created_at > new Date(latestTweetDate)) {
            tweets.push({
              id,
              sortIndex,
              full_text,
              media_url,
              profile,
              created_at: created_at.toISOString(),
              url,
              handle
            });
            console.log("1. created_at : ", created_at, "latestTweetDate :", latestTweetDate);
          }
        }
      });
    });

    try {
      console.log(`Navigating to https://x.com/${handle}`);
      await page.goto(`https://x.com/${handle}`, { waitUntil: "load", timeout: 600000 });
      await new Promise((resolve) => setTimeout(resolve, 5000));  // Wait for 5 seconds
    } catch (error) {
      console.error("Failed to navigate to page:", error);
    } finally {
      await page.close();
      
      console.log("Page closed");
    }
    return tweets;
  
  } catch (error) {
    return []     
  }
}

export async function scrape() : Promise<Post[]>{
  try {
    const listXAccounts = config.xAccounts;
    let tweets : Post[] = []
    for (const { handle, name } of listXAccounts) {
      console.log(`Fetching tweets for @${handle}...`);
      const posts = await getXAccountLatestPost(name, handle);

      for (const post of posts) {
        if (post.id && post.sortIndex && post.profile && post.created_at && post.url && post.handle) {
          console.log(post);
          const insertTweet = await insertTweetDB(post);
          if (insertTweet) {
            console.log(`Tweet inserted successfully`);
            tweets.push(post);
          }
        }
      }
    }

    return tweets

  } catch (error: any) {
    console.error("Error during scraping:", error);
    throw new Error(`Something went wrong: ${error.message}`); 
  }
}