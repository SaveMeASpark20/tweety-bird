import puppeteer from "puppeteer-core";
import { config } from "./config";
import {getLatestTweetDate, insertTweetDB } from "./db";
import { Post } from "./type";

import "dotenv/config";  // Automatically loads .env file



let browser: any;

async function initBrowser() {
  if (browser) return; 
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
}

async function getXAccountLatestPost(
  name: string,
  handle: string
): Promise<Post[]> {
  if (!name || !handle) return [];

  await initBrowser();
  const latestTweetDate =  await getLatestTweetDate(handle)


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
      sameSite: "Lax"
    }
  ];

  const page = await browser.newPage();

  const randomUserAgent = userAgents[Math.floor(Math.random() * userAgents.length)];

  // Set the User-Agent
  await page.setUserAgent(randomUserAgent);



  await page.setCookie(...cookies)


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

    const body  = await response.json();
    const instructions =
      body.data?.user?.result?.timeline_v2?.timeline?.instructions;
    if (!instructions) return;

    const timelineEntries = instructions
      .filter((inst :any) => inst.type === "TimelineAddEntries")
      .flatMap((inst : any) => inst.entries);
    
    
    timelineEntries.forEach((entry : any) => {
      if (
        entry?.content?.itemContent?.tweet_results &&
        entry.entryId &&
        entry.sortIndex
      ) {
      const id = entry.entryId;
      const sortIndex = entry.sortIndex;
      const full_text = entry?.content?.itemContent?.tweet_results?.result?.legacy?.full_text;
      const media_url = entry?.content?.itemContent?.tweet_results.result?.legacy?.extended_entities?.media[0].media_url_https;
      const profile = entry?.content?.itemContent?.tweet_results?.result.core?.user_results?.result?.legacy?.profile_image_url_https;
      const created_at = new Date(entry.content.itemContent.tweet_results.result.legacy.created_at);
      const url = entry?.content?.itemContent?.tweet_results.result?.legacy?.extended_entities?.media[0].expanded_url;

      //get the latest tweet the created_at on the databe compare it to the created_at of the tweet by the handle of it
      console.log({id, sortIndex, full_text, media_url, profile, created_at, url, handle});
      if( !latestTweetDate || created_at > new Date(latestTweetDate)) {
        tweets.push({ 
        id,
        sortIndex,
        full_text,
        media_url,
        profile,
        created_at : created_at.toISOString(),
        url,
        handle
        });
      }
    }
  });
});

  await page.goto(`https://x.com/${handle}`, { waitUntil: "load" });
  await new Promise((resolve) => setTimeout(resolve, 5000));

  await page.close();
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


