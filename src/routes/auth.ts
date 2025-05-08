// src/routes/auth.ts
import { Router, Request, Response } from "express";
import { verifyIdToken } from "apple-signin-auth";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { UserModel, User } from "../models/user";
import { LoginBody, JWTPayload } from "../types/auth";

export const authRouter = Router();


const JWT_SECRET = process.env.JWT_SECRET!;
const LOGIN_SALT = process.env.LOGIN_SALT!;

function signAccessToken(user: User) {

    const payload: JWTPayload = {
        id: user._id.toString()
    }

    return jwt.sign(
        payload,
        JWT_SECRET,
        { expiresIn: "24h" }
    )
}

function signRefreshToken(user: User) {

    const payload: JWTPayload = {
        id: user._id.toString()
    }

    const salt = user.refreshSalt!;

    return jwt.sign(
        payload,
        JWT_SECRET + salt,
        { expiresIn: "30d" }
    );
}

authRouter.post("/login", async (req: Request<{}, {}, LoginBody>, res: Response) => {
    console.log("body : ", req.body)
    const { loginType, jwt: socialToken, name } = req.body;
    let socialId: string;

    try {
        if( loginType == "apple") {
            const payload = await verifyIdToken(socialToken, {
                // audience: process.env.APPLE_APP_ID!,
            });
            socialId=payload.sub;
            console.log("payload : ", payload)
        } else {
            socialId="test"
        }

        socialId = crypto.createHash('sha256').update(socialId + LOGIN_SALT).digest('hex');

        let user = await UserModel.findOneAndUpdate(
            { socialId },
            { $setOnInsert: { loginType, socialId, name } },
            { upsert: true, new: true, setDefaultsOnInsert: true }
        );

        const newSalt = crypto.randomBytes(16).toString("hex");
        user.refreshSalt = newSalt;
        await user.save();

        const accessToken  = signAccessToken(user);
        const refreshToken = signRefreshToken(user);

        console.log("accessToken : ", accessToken);

        console.log("refreshToken : ", refreshToken);

        res.ok(200, "", {accessToken, refreshToken})

    } catch (err: any) {
        console.error("login error:", err);

        res
        .status(401)
        .json({ success: false, message: "인증 실패", detail: err.message });
    }
});

authRouter.post("/refresh", async (req: Request<{}, {}, { refreshToken: string }>, res) => {
    const { refreshToken } = req.body;
    try {
        const decoded: any = jwt.decode(refreshToken);
        if (!decoded?.socialId) throw new Error("유효하지 않은 토큰");
        const socialId = decoded.socialId;

        const user = await UserModel.findById(socialId);
        if (!user || !user.refreshSalt) {
            throw new Error("salt 없음");
        }

        jwt.verify(refreshToken, JWT_SECRET + user.refreshSalt);

        const newSalt = crypto.randomBytes(16).toString("hex");
        user.refreshSalt = newSalt;
        await user.save();

        const accessToken  = signAccessToken(user);
        const newRefreshToken = signRefreshToken(user);

        res.ok(200, "", {accessToken, refreshToken})

    } catch (err: any) {
        console.error("refresh error:", err);

        res
        .status(401)
        .json({ success: false, message: "인증 실패", detail: err.message });
    }
});

