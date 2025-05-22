
import { Schema, model, Document, Types } from 'mongoose'

export interface InviteToken extends Document {
    inviter: Types.ObjectId;
    token: string;
    expiresAt: Date;
}

const InviteTokenSchema = new Schema<InviteToken>({
    inviter: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    token: { type: String, required: true, unique: true },
    expiresAt: { type: Date, required: true }
});

InviteTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const InviteModel = model<InviteToken>('InviteToken', InviteTokenSchema)