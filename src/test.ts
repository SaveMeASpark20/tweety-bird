import { getLatestTweetDate } from "./controller";
import "dotenv/config";

( () => {
  console.log(new Date('2025-04-04T19:47:46.000Z'))
  console.log(new Date('2025-04-04T14:03:21.000Z'))
  if('2025-04-04T19:47:46.000Z' > '2025-04-04T14:03:21.000Z' ) {
    console.log('nagcocompare')
  }
})();

//2025-04-04T14:03:21.000Z
//2025-03-14T20:49:12.000Z //2025-04-04T19:47:46.000Z
