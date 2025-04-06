import { Request, Response } from "express";
import { connectDB } from "../db";
import { Post } from "../type";

export async function getTweets(req: Request, res: Response) {
    try {

        const connect = await connectDB();
        const [records] = await connect.query("SELECT * FROM tweet");
        res.json(records);
    } catch (error) {
        res.status(500).json({ message: error });
    }
}


export async function postTweet(tweet : Post) : Promise<boolean> {
    try {
        const connect = await connectDB()
        const postedTweet = await connect.query(`INSERT INTO tweet SET ?`, [tweet])
        console.log("Tweet Saves");
        return true;
    } catch (error : any) {
        console.log(error.message)
        return false
    }
}


export async function getLatestTweetDate(handle: string){
    try {
        const connect = await connectDB(); // Your SQLite connection
        if(!connect) {
            console.log("db not initialize")
            return null
        }
        const [records] : any= await connect.query(
          "SELECT created_at FROM tweet WHERE handle = ? ORDER BY created_at DESC LIMIT 1",
          [handle]
        );
        console.log("record: ", records)
        return records.length > 0 ? records[0].created_at : null
        
    } catch (error : any) {
     console.log("Error:", error)
     return null   
    }
  }
