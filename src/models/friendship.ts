

import { Schema, model, Document, Types } from 'mongoose';

export interface Friendship extends Document {
  userId: Types.ObjectId;
  friendId: Types.ObjectId;
  status: 'pending' | 'accepted' | 'blocked'; // 필요에 따라 확장
}

const FriendshipSchema = new Schema<Friendship>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    friendId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    status: { type: String, enum: ['pending', 'accepted', 'blocked'], default: 'pending' },
  },
  {
    timestamps: true, // createdAt, updatedAt 자동 추가
  }
);

export const FriendsModel = model<Friendship>('Friend', FriendshipSchema)