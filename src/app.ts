import express, { Application, Request, Response } from 'express'
import { responseFormatter } from './lib/response'
import swaggerUi from 'swagger-ui-express';
import swaggerFile from './swagger-output.json'

import mongoose from "mongoose";

import dotenv from "dotenv";
dotenv.config()

import { connectDB } from "./db";
import { authRouter } from "./routes/auth";
import { calendarRouter } from './routes/calendar';
import tripRouter from './routes/trip';
import { friendRouter } from './routes/friends';

connectDB();

const app: Application = express()

// Swagger UI 제공
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerFile));

app.use(express.json());

app.use(responseFormatter)
app.use(authRouter);

import { authToken } from './middleware/authenticate';
app.use(authToken);


app.use(calendarRouter);
app.use(tripRouter);
app.use(friendRouter);

const port = process.env.PORT ? Number(process.env.PORT) : 3000;
app.listen(port, () => {
    console.log(`🚀 Server running at http://localhost:${port}`);
})