import { Schema, model, Document, Types } from "mongoose";

export const friendStatus = {
    accepted: 'accepted',
    blocked: 'blocked'
} as const;


export const loginType = {
    apple: 'apple',
    kakao: 'kakao',
} as const

type LoginType = typeof loginType[keyof typeof loginType]


interface Invite {
    token: string;
    createdAt: Date;
    expiresAt: Date;
}

export interface User extends Document {
    _id: Types.ObjectId,
    loginType: LoginType;
    socialId: string;
    name: string;
    refreshSalt?: string;
}

const UserSchema = new Schema<User>(
{
    loginType: {
        type: String,
        enum: ["kakao", "apple"],
        required: true,
    },
    socialId: {
        type: String,
        required: true,
        unique: true,
    },
    name: {
        type: String,
        required: true,
    },
    refreshSalt: { type: String }
});

const InviteSchema = new Schema<Invite>({
    token:      { type: String, required: true, unique: true },
    createdAt:  { type: Date, default: () => new Date() },
    expiresAt:  { type: Date, required: true },
});

export const UserModel = model<User>("User", UserSchema)