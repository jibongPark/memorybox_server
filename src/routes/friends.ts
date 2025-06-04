
import express from 'express';
import { InviteModel } from '../models/inviteToken';
import { FriendsModel } from '../models/friendship';
import crypto from 'crypto'
import { UserModel } from '../models/user';

export const friendRouter = express.Router();

const domain = process.env.SERVER_DOMAIN

friendRouter.post('/friend/createInvite', async (req, res) => {
  try {
    const userId = req.user?.id;
    // 1시간 뒤 만료
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000);
    // 랜덤 토큰 생성
    const token = crypto.randomBytes(32).toString('hex');

    const invite = await InviteModel.create({
      inviter: userId,
      token,
      expiresAt,
      used: false
    });

    // 초대 URL 생성
    const inviteUrl = domain +`/invite/${token}`;

    res.ok(201, "", { inviteUrl, expiresAt });
  } catch (err) {
    res.error(500, "Failed to create invite");
  }
});

friendRouter.post('/friend/request/:token', async (req, res) => {
    try {
        const { token } = req.params;
        const userId = req.user?.id; // 초대를 받는 사람

        // 1. 토큰 검증
        const invite = await InviteModel.findOne({ token });
        if (!invite) {
            res.status(400).json({ message: '존재하지 않거나 만료된 초대 코드입니다.' });
            return;
        }

        if ( userId == invite.inviter.toString() ) {
            res.error(500, "자기 자신은 추가할수 없습니다.");
            return;
        }

        // 2. 이미 친구인지 확인
        const alreadyFriend = await FriendsModel.findOne({
            userId: invite.inviter,
            friendId: userId,
            status: { $in: ['pending', 'accepted'] }
        });
        if (alreadyFriend) {
            res.status(409).json({ message: '이미 친구인 유저입니다.' });
            return;
        }

        // 3. 친구 요청 생성 (pending 상태)
        const friendship = await FriendsModel.create({
            userId: invite.inviter,     // 초대한 사람
            friendId: userId,           // 초대받은 사람
            status: 'pending'
        });
        
        await InviteModel.deleteOne({ token });

        res.ok(201);
    } catch (err: any) {
        res.error(500);
    }
});

friendRouter.post('/friend/accept/:friendId', async (req, res) => {
    try {
        const userId = req.user?.id;
        const { friendId } = req.params;

        const friendship = await FriendsModel.findOne({
            userId: userId,
            friendId: friendId,
            status: 'pending'
        });

        if (!friendship) {
            res.error(404, "Friend not found");
            return;
        }

        friendship.status = 'accepted';
        await friendship.save();

        res.ok(200, "친구수락 완료");
    } catch (err: any) {
        res.error(500, "친구수락 실패"+err);
    }
});

friendRouter.get('/friends', async (req, res) => {
    try {
        const userId = req.user?.id;

        const friendships = await FriendsModel.find({
            status: "accepted",
            $or: [
                {userId: userId},
                {friendId: userId}
            ]
        });

        const friendIds = friendships.map(f => {
            if (f.userId.toString() === userId) {
                return f.friendId;
            } else {
                return f.userId;
            }
        })

        const friends = await UserModel.find(
            { _id: { $in: friendIds } },
            { _id: 1, name: 1 }
        );

        res.ok(200, "", friends);
        
    } catch (err) {
        res.error(500, "친구목록 조회 실패 "+err)
    }
});

friendRouter.delete('/friend/:friendId', async (req, res) => {
    try {
        const userId = req.user?.id;
        const friendId = req.params.friendId;

        await FriendsModel.deleteMany({
            $or: [
                { userId: userId, friendId: friendId },
                { userId: friendId, friendId: userId }
            ]
        });

        res.ok(200, "친구삭제 완료");

    } catch (err) {
        res.error(500, "친구삭제 실패 "+err);
    }
});
