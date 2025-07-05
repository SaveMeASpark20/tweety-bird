import dotenv from "dotenv";
import mongoose from "mongoose";

dotenv.config()

async function connectToDb() {
    try {
        const DB_URl = process.env.DB_URL;
        if(!DB_URl){
            throw new Error('DB_URL is not defined in the environment variables');
        }
        await mongoose.connect(DB_URl);
        console.log('Connected to database');

    } catch (error : any) {
        console.log(error.message);
    }
}

export default connectToDb;