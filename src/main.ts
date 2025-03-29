import express, { Request, Response } from 'express';
import "dotenv/config";  // Automatically loads .env file
import { scrape } from './scrape';
import { config } from './config';

const PORT = process.env.PORT || 10000;

const app = express();


app.get("/", async (req: Request, res: Response) => {
    try {
        res.status(200).json('Hello welcome to the new world'); 
    } catch (err: any) {
        console.error("Error:", err.message);
        res.status(500).json({ error: err.message }); 
    }
});


setInterval(() => {
  scrape().catch((err) => {
    console.error('Scraping error:', err.message);
  });
}, 1000 * config.xAccounts.length * 60 * 5);

scrape()

app.listen(PORT, () => {
    console.log(`Running on PORT ${PORT}`);
})