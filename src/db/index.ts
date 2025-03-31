
import { open, Database} from "sqlite";
import * as sqlite3 from "sqlite3";
import { Post } from "../type";


let db: Database<sqlite3.Database> | null = null;

const dbPath = process.env.DATABASE_PATH || "/dist/db/tweet.db"; // Default to dist


export const initDB = async () => {
    if (!db) {
        db = await open({
            filename: dbPath,
            driver: sqlite3.Database,
        });

        // Ensure the table is created once at startup
        await db.exec(`
            CREATE TABLE IF NOT EXISTS tweet (
                id STRING PRIMARY KEY,
                sortIndex STRING,
                full_text TEXT NOT NULL,
                media_url TEXT NULL,  
                profile TEXT NOT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                url TEXT NOT NULL,
                handle TEXT NOT NULL
            );
        `);
    }
    return db;
};





export async function insertTweetDB(tweetData: Post) : Promise<boolean> {
    try {
        const database = await initDB();
        console.log(database);
        const query = `
            INSERT INTO tweet (id, sortIndex, full_text, media_url, profile, created_at, url, handle)
            VALUES ($id, $sortIndex, $full_text, $media_url, $profile, $created_at, $url, $handle);
        `;

        await database.run(query, {
            $id: tweetData.id,
            $sortIndex: tweetData.sortIndex,
            $full_text: tweetData.full_text,
            $media_url: tweetData.media_url ?? null,  // Allow null values
            $profile: tweetData.profile,
            $created_at: tweetData.created_at,
            $url: tweetData.url,
            $handle: tweetData.handle
        });

        console.log("Tweet inserted successfully!");
        return true;
    } catch (e) {
        console.error("Error inserting tweet:", e);
        return false;
    }
}

export async function getLatestTweetDate(handle: string): Promise<Date | null> {
    try {
        const db = await initDB(); // Your SQLite connection
        if(!db) {
            console.log("db not initialize")
            return null
        }
        const row = await db.get(
          "SELECT created_at FROM tweet WHERE handle = ? ORDER BY created_at DESC LIMIT 1",
          [handle]
        );
        console.log(row)
        return row ? row.created_at : null;
    } catch (error : any) {
     console.log("Error:", error)
     return null   
    }
  }

export async function getTweets() : Promise<Post[]> {
    try {
        const db = await initDB(); // Your SQLite connection
        if(!db) {
            console.log("db not initialize")
            return []
        }
        const rows : Post[] = await db.all("SELECT * FROM tweet ORDER BY CREATED_AT DESC") || []
        return rows
    } catch (error) {
        console.log("Error fetching tweets: ", error)
        return []
    }
}
  
