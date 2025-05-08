import express, { Application, Request, Response } from 'express'
import { responseFormatter } from './lib/response'

import mongoose from "mongoose";

import dotenv from "dotenv";
dotenv.config()

import { connectDB } from "../src/db";
import { authRouter } from "./routes/auth";
import { calendarRouter } from './routes/calendar';
import tripRouter from './routes/trip';

connectDB();

const app: Application = express()

app.use(express.json());
app.use(responseFormatter)
app.use(authRouter);
app.use(calendarRouter);
app.use(tripRouter);

const port = process.env.PORT ? Number(process.env.PORT) : 3000;
app.listen(port, () => {
    console.log(`🚀 Server running at http://localhost:${port}`);
})