
import { open, Database} from "sqlite";
import * as sqlite3 from "sqlite3";
import { Post } from "../type";


let db: Database<sqlite3.Database> | null = null;

export const initDB = async () => {
    if (!db) {
        db = await open({
            filename: "src/db/tweet.db",
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





export async function insertTweetDB(tweetData: Post) {
    try {
        const database = await initDB();

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
    const db = await initDB(); // Your SQLite connection
    const row = await db.get(
      "SELECT created_at FROM tweet WHERE handle = ? ORDER BY created_at DESC LIMIT 1",
      [handle]
    );
    return row ? row.created_at : null;
  }
  
