import express, { Application, Request, Response } from 'express'

import mongoose from "mongoose";

import dotenv from "dotenv";
dotenv.config()

import { connectDB } from "../src/db";
import { authRouter } from "./routes/auth";
import { calendarRouter } from './routes/calendar';

connectDB();

const app: Application = express()

app.use(express.json());
app.use(authRouter);
app.use(calendarRouter);

const port = process.env.PORT ? Number(process.env.PORT) : 3000;
app.listen(port, () => {
    console.log(`🚀 Server running at http://localhost:${port}`);
})