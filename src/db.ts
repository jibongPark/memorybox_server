import mongoose, { Schema, model } from "mongoose";


const host = process.env.MONGO_HOST || 'localhost';
const port = process.env.MONGO_PORT || '27017';
const dbName = process.env.MONGO_DBNAME || 'mydb';

const MONGO_URI = `mongodb://${host}:${port}/${dbName}`;

export async function connectDB() {
  await mongoose.connect(MONGO_URI);

  console.log("mongoose state: ", mongoose.connection.readyState, MONGO_URI)
  return mongoose.connection.readyState; // 1 = connected
}