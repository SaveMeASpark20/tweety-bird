
import mysql from 'mysql2/promise';

export async function connectDB() {
    const connection = await mysql.createPool({
        host: process.env.MYSQL_HOST,
        user: process.env.MYSQL_USER,
        password: process.env.MYSQL_PASSWORD,
        database: process.env.MYSQL_DATABASE,
        port : process.env.MYSQL_PORT ? parseInt(process.env.MYSQL_PORT) : 3306,
    });
    return connection;
}
  
//awtspaindev
//jNTkbExdsZqQm8fh
//npm install mongoose
//mongodb+srv://awtspaindev:jNTkbExdsZqQm8fh@tweet.f1rwsxx.mongodb.net/?retryWrites=true&w=majority&appName=tweet