import express, { Request, Response } from 'express';
import "dotenv/config";  // Automatically loads .env file
import { scrape } from './scrape';

const PORT = process.env.PORT || 3000;

const app = express();


app.get("/", async (req : Request, res : Response) => {
    try{
        const tweets = await scrape();
        res.send(tweets);
    }catch(err : any){        
        console.log(err.mesage);
        res.json({error: err.message});
    }
})

app.listen(PORT, () => {
    console.log(`Running on PORT ${PORT}`);
})