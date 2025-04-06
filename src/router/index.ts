import { Router } from "express";
import { getTweets } from "../controller";


const router = Router();

router.get("/", getTweets)

export default router;
