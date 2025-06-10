
export const config = {
    browserConfig :{
        headless: true,
        args : [      
            "--disable-setuid-sandbox",
            "--no-sandbox",
            "--single-process",
            "--no-zygote",
        ],
        //executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe"
        executablePath : process.env.PUPPETEER_EXECUTABLE_PATH || "/usr/bin/chromium",
    },

    xAccounts :  [
        {
            name : "wallstreetbets",
            handle : "wallstreetbets",
        },
        {
            name : "CoinTelegraph",
            handle : "CoinTelegraph",
        },
        {
            name : "Base",
            handle : "base",
        }

    ],
    db_name: "src/db/tweet.db"
}
