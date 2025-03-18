
export const config = {
    browserConfig :{
        headless: false,
        args : [      
            "--disable-setuid-sandbox",
            "--no-sandbox",
            "--single-process",
            "--no-zygote",
            "--disable-gpu"
        ],
        //executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe"
        executablePath : process.env.PUPPETEER_EXECUTABLE_PATH || "/usr/bin/chromium",
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
