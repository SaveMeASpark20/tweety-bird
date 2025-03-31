import express, { Request, Response } from 'express';
import "dotenv/config";  // Automatically loads .env file
import { scrape } from './scrape';
import { getTweets } from './db';

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

app.get("/scrape", async (req : Request, res : Response) => {
    try {
        const tweets = await scrape();
        res.status(200).json({tweets}); 
    } catch (err: any) {
        console.error("Error:", err.message);
        res.status(500).json({ error: err.message }); 
    }
})

app.get("/data", async (req : Request, res : Response) => {
    try {
        const tweets = await getTweets();
        res.status(200).json({tweets});
    }catch(err : any) {
        console.error("Error: ", err.message);
        res.status(500).json({error : err.message})
    }
})

app.listen(PORT, () => {
    console.log(`Running on PORT ${PORT}`);
})