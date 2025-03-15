import express, { Request, Response } from 'express';
import "dotenv/config";  // Automatically loads .env file
import { scrape } from './scrape';

const PORT = process.env.PORT || 3000;

const app = express();


app.get("/", (req : Request, res : Response) => {
    try{
        scrape();
    }catch(err : any){        
        console.log(err.mesage);
    }
})

app.listen(PORT, () => {
    console.log(`Running on PORT ${PORT}`);
})