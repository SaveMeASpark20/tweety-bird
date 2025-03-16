import express, { Request, Response } from 'express';
import "dotenv/config";  // Automatically loads .env file
import { scrape } from './scrape';

const PORT = process.env.PORT || 3000;

const app = express();


app.get("/", async (req: Request, res: Response) => {
    try {
        const tweets = await scrape();
        res.status(200).json({"scrape" : "working"}); // Explicitly set status code for success
    } catch (err: any) {
        console.error("Error:", err.message); // Use console.error for errors
        res.status(500).json({ error: err.message }); // Set appropriate status code for errors
    }
});

app.listen(PORT, () => {
    console.log(`Running on PORT ${PORT}`);
})