// db.js
import { MongoClient } from "mongodb";

// IMPORTANT: don’t commit real passwords to Git!
// Use an environment variable in real projects.
const uri =
  "mongodb+srv://Imaad:uLKam6qPd60lITps@cluster0.ywaccke.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

const client = new MongoClient(uri);

let db;

export async function connectToDB() {
  try {
    await client.connect();
    db = client.db("Coursework"); // your database name in Atlas
    console.log("✅ Connected to MongoDB Atlas");
  } catch (err) {
    console.error("❌ Error connecting to MongoDB:", err);
    process.exit(1);
  }
}

export function getDB() {
  if (!db) {
    throw new Error("Database not initialized. Call connectToDB() first.");
  }
  return db;
}
