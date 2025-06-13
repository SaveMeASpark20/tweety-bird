import {Schema, model} from "mongoose";
import { Tweet } from "../type";


export type TweetDocument = Document & Tweet;

const tweetSchema = new Schema<TweetDocument>({
    tweet_id : {type: String, required: true, unique: true },
    sortIndex : {type: String, required: true },
    full_text : {type: String, required: true },
    media_url: {type: String},
    profile : {type: String},
    created_at : {type: String, required: true}, 
    handle : {type: String, required: true}
}, {timestamps : true})

const Tweet = model('tweet', tweetSchema);

export default Tweet;