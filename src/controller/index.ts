
import Tweet, { TweetDocument } from "../model/tweet";






export const getTweets = async () => {
	try {

		const tweets = await Tweet.find({}).lean();
		return tweets;

	} catch (error : any) {
		console.log(error.message)
		return []
	}
	
}
// export async function getTweets(req: Request, res: Response) {
//     try {

//         const connect = await connectDB();
//         const [records] = await connect.query("SELECT * FROM tweet");
//         res.json(records);
//     } catch (error) {
//         res.status(500).json({ message: error });
//     }
// }



// export async function postTweet(tweet : Tweet) : Promise<boolean> {
//     try {
//         const connect = await connectDB()
//         const postedTweet = await connect.query(`INSERT INTO tweet SET ?`, [tweet])
//         console.log("Tweet Saves");
//         return true;
//     } catch (error : any) {
//         console.log(error.message)
//         return false
//     }
// }




export const postTweet = async ({tweet_id, sortIndex, full_text, media_url, profile, created_at, url, handle} : Tweet) => {
	try {
        await Tweet.create({tweet_id, sortIndex, full_text, media_url, profile, created_at, url, handle}
        )
        console.log("tweet saves")
		return true;
	} catch (error : any) {
        console.log(error.message)
        return false	
    }
}

// export const getLatestTweetDate = async (req: Request, res : Response) => {
	
// 	try {
// 		const user_id = req.user?.id;
// 		console.log(user_id);
// 		if(!user_id){
// 			return res.status(401).json({ "Error" : "You are not Authorize please log in" })
// 		}
// 		await connectToDb();
// 		const services : ServiceDocument[] = await Service.find({user : user_id}).select('name image price')
// 		return res.status(201).json(services);
// 	} catch (error : any) {
// 		console.log(error.message);
// 		res.status(500).json('Something Went Wrong');
// 	}
// }

// export async function getLatestTweetDate(handle: string){
//     try {
//         const connect = await connectDB(); // Your SQLite connection
//         if(!connect) {
//             console.log("db not initialize")
//             return null
//         }
//         const [records] : any= await connect.query(
//           "SELECT created_at FROM tweet WHERE handle = ? ORDER BY created_at DESC LIMIT 1",
//           [handle]
//         );
//         console.log("record: ", records)
//         return records.length > 0 ? records[0].created_at : null
        
//     } catch (error : any) {
//      console.log("Error:", error)
//      return null   
//     }
// }


export async function getLatestTweetDate(handle: string) {
    try {
        const record = await Tweet
            .findOne({ handle })
            .sort({ created_at: -1 }) // descending order
            .select('created_at') // only fetch the created_at field
            .lean(); // returns a plain JS object instead of a Mongoose doc

        console.log("record:", record);

        return record ? record.created_at : null;
    } catch (error: any) {
        console.log("Error:", error);
        return null;
    }
}
