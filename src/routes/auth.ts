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
/*  #swagger.tags = ['Auth']
*/
    try {
        const { loginType, jwt: socialToken, name } = req.body;
        let socialId: string;
        
        if( loginType == "apple") {
            const payload = await verifyIdToken(socialToken, {
                // audience: process.env.APPLE_APP_ID!,
            });
            socialId=payload.sub;
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

        const userName = user.name;
        const uid = user._id;
        const accessToken  = signAccessToken(user);
        const refreshToken = signRefreshToken(user);

        res.ok(200, "", {userName, uid, accessToken, refreshToken});

    } catch (err: any) {
        console.log(err);
        res.error(401, "로그인 실패 : " +err.message);
    }
});

authRouter.post("/refresh", async (req: Request<{}, {}, { refreshToken: string }>, res) => {
/*  #swagger.tags = ['Auth']
*/
    const { refreshToken } = req.body;
    try {
        const decoded: any = jwt.decode(refreshToken);
        if (!decoded?.id) throw new Error("유효하지 않은 토큰");
        const socialId = decoded.id;

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

        res.ok(200, "", {accessToken, newRefreshToken});

    } catch (err: any) {
        console.error("refresh error:", err);

        res.error(400, "토큰 갱신 실패 : " +err.message);
    }
});

import { authToken } from '../middleware/authenticate';
import { TripModel } from "../models/map/trip";
import { FriendsModel } from "../models/friendship";
import { ScheduleModel } from "../models/calendar/schedule";
import { TodoModel } from "../models/calendar/todo";
import { DiaryModel } from "../models/calendar/diary";


authRouter.delete("/deleteUser", 
    authToken,
    async (req: Request<{}, {}, { refreshToken: string }>, res: Response) => {
        const userId = req.user?.id

        try {

            await TripModel.deleteMany({ author: userId });

            await FriendsModel.deleteMany({ 
                $or: [{ userId: userId }, { friendId: userId }]
            });

            await ScheduleModel.deleteMany({ author: userId });

            await TodoModel.deleteMany({ author: userId});

            await DiaryModel.deleteMany({ author: userId });

            await UserModel.deleteOne({ _id: userId });

            res.ok(200, "회원 탈퇴가 완료되었습니다.");

        } catch (err: any) {
            res.error(500, "회원 탈퇴에 문제가 생겼습니다." + err.message);
        }

});