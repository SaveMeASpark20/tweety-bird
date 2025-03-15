import { executablePath } from "puppeteer-core";

export const config = {
    browserConfig :{
        headless: false,
        args : [      
            "--disable-setuid-sandbox",
            "--no-sandbox",
            "--single-process",
            "--no-zygote",
        ],
        // executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe"
        executablePath : process.env.PUPPETEER_EXECUTABLE_PATH || "/usr/bin/chromium-browser",
    },

    xAccounts :  [
        {
            name : "Christian Leguiz",
            handle : "ParseERR",
        },
        {
            name : "wallstreetbets",
            handle : "wallstreetbets",
        },
        {
            name : "kurorobeast",
            handle : "kurorobeast",
        }

    ],
    db_name: "src/db/tweet.db"
}
