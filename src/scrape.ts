import puppeteer, { Browser } from "puppeteer-core";
import { config } from "./config";
import { Tweet } from "./type";
import "dotenv/config";  // Automatically loads .env file
import { initializeDiscord, sendMessageOnDiscord } from "./discord";
import { getLatestTweetDate, postTweet } from "./controller";

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

async function getXAccountLatestPost(name: string, handle: string): Promise<Tweet[]> {
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
    console.log("Latest Tweet Date : " + latestTweetDate)
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

    let tweets: Tweet[] = [];

    page.on("response", async (response: any) => {
      if (response.status() !== 200) return;

      const url = response.url();
      if (!url.includes("UserTweets")) return;

      const contentType = response.headers()["content-type"];
      if (!contentType || !contentType.includes("application/json")) {
        return;
      }

      const body = await response.json();
      

      const instructions = body.data?.user?.result?.timeline?.timeline?.instructions;
      if (!instructions){
        return;
      } 
          
      const timelineEntries = instructions
        .filter((inst: any) => inst.type === "TimelineAddEntries")
        .flatMap((inst: any) => inst.entries);
      timelineEntries.forEach((entry: any) => {
        if (entry?.content?.itemContent?.tweet_results && entry.entryId && entry.sortIndex) {
          const tweet_id = entry.entryId;
          console.log("tweet_id" + tweet_id)

          const sortIndex = entry.sortIndex;
          const full_text = entry?.content?.itemContent?.tweet_results?.result?.legacy?.full_text;
          const media_url = entry?.content?.itemContent?.tweet_results.result?.legacy?.extended_entities?.media[0].media_url_https;
          const profile = entry?.content?.itemContent?.tweet_results?.result.core?.user_results?.result?.legacy?.profile_image_url_https;
          const created_at = new Date(entry.content.itemContent.tweet_results.result.legacy.created_at);
          //console.log(created_at)
          const url = `https://x.com/${handle}/status/${entry.entryId.split("-")[1]}`;
          console.log("created_at : ", created_at, "latestTweetDate :", latestTweetDate);
          //console.log(created_at > (latestTweetDate!))
          // console.log("latest Tweet Date" + latestTweetDate > created_at )
          if (!latestTweetDate || created_at > new Date(latestTweetDate)) {
            tweets.push({
              tweet_id,
              sortIndex,
              full_text,
              media_url,
              profile,
              created_at : created_at.toISOString(),
              url,
              handle
            });
            console.log("Successfully compile the tweet");
          }
        }
      });
    });

    try {
      console.log(`Navigating to https://x.com/${handle}`);
      await page.goto(`https://x.com/${handle}`, { waitUntil: "load", timeout: 600000 });
      await new Promise((resolve) => setTimeout(resolve, 15000));  // Wait for 15 seconds
    } catch (error) {
      console.error("Failed to navigate to page:", error);
    } finally {
      await page.close();
      
      console.log("Page closed");
    }
    return tweets;
  
  } catch (error : any) {
    console.log(error.message)
    return []     
  }
}

export async function scrape() : Promise<boolean>{
  try {
    const channel = process.env.CHANNEL;
    const botToken = process.env.BOT_TOKEN;
    if( !channel || !botToken ) {
      console.log('Channel and token of bot is necessary to initialize the discord')
      return false
    }

    await initializeDiscord()

    const listXAccounts = config.xAccounts;
    let tweets : Tweet[] = []
    for (const { handle, name } of listXAccounts) {
      console.log(`Fetching tweets for @${handle}...`); 
      console.log(name, handle)
      const posts = await getXAccountLatestPost(name, handle);
      for (const post of posts) {
        console.log(post.tweet_id)
        if (post.tweet_id && post.sortIndex && post.created_at && post.url && post.handle) {
          const insertTweet = await postTweet(post);
          console.log(insertTweet)
          if (insertTweet) {
            let message = ''
            if(post.media_url)
              message = 'Hey @'+ post.handle + "\n" + 'tweeted : '  + post.url + '\n' + post.full_text  + "\n" + post.media_url
            else 
              message = 'Hey @'+ post.handle + "\n"  + 'tweeted : '+ post.url + '\n' + post.full_text  
            await sendMessageOnDiscord(channel, message)
          }
        }
      }
    }
    return true

  } catch (error: any) {
    console.error("Error during scraping:", error);
    throw new Error(`Something went wrong: ${error.message}`); 
  }
}

