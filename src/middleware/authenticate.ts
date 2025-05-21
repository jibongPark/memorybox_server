// src/middleware/authenticate.ts
import { Request, Response, NextFunction, RequestHandler } from "express";
import jwt from "jsonwebtoken";
import { JWTPayload, AuthRequest } from "../types/auth";

const JWT_SECRET = process.env.JWT_SECRET!;
if (!JWT_SECRET) throw new Error("JWT_SECRET 미설정");

export const authToken: RequestHandler = (req, res, next) => {

    const token = req.get('Authorization')?.split('Bearer ')[1];
    if (!token) {
        res.status(401).send("No token");
        return;
    }
  
    try {
      const payload = jwt.verify(token, process.env.JWT_SECRET!) as JWTPayload;
      req.user = payload;
      next();
    } catch {
      res.status(401).send("Invalid token");
      return;
    }
}