import { Request } from "express"

export interface LoginBody {
    loginType: "apple" | "kakao";
    name: string;
    jwt: string;
}

export interface JWTPayload {
    id: string;
}

export interface AuthRequest extends Request {
    user: JWTPayload
}