
import express from 'express';
import { InviteModel } from '../models/inviteToken';
import { FriendsModel } from '../models/friendship';
import crypto from 'crypto'
import { User, UserModel } from '../models/user';

export const friendRouter = express.Router();

const domain = process.env.SERVER_DOMAIN

friendRouter.post('/friend/request/:receiver', async (req, res) => {
    try {
        const { receiver } = req.params; // 신청을 받는 사람
        const userId = req.user?.id; // 신청을 하는 사람

        if (userId == receiver) {
            res.error(500, '자기 자신은 추가할 수 없습니다.');
            return;
        }

        const receiveUser = await UserModel.findById(receiver);
        if (!receiveUser) {
            res.error(400, '존재하지 않는 유저입니다.');
            return;
        }

        // 2. 이미 친구인지 확인
        const alreadyFriend = await FriendsModel.findOne({
            userId: userId,
            friendId: receiver,
            status: { $in: ['pending', 'accepted'] }
        });
        if (alreadyFriend) {
            res.error(409, '이미 친구거나 요청한 유저입니다.');
            return;
        }

        // 3. 친구 요청 생성 (pending 상태)
        const friendship = await FriendsModel.create({
            userId: userId,
            friendId: receiver,
            status: 'pending'
        });

        const senderUser = await UserModel.findById(userId);
        if (!senderUser) {
            res.error(500 ,'발신자 정보를 불러오는 데 실패했습니다.');
            return;
        }

        const friendRequestDTO = {
            senderId:   senderUser._id.toString(),
            senderName: senderUser.name,
            receiverId: receiveUser._id.toString(),
            receiverName: receiveUser.name
        };

        res.ok(201, '친구 요청 완료', friendRequestDTO);
    } catch (err: any) {
        res.error(500);
    }
});

friendRouter.post('/friend/accept/:friendId', async (req, res) => {
    try {
        const userId = req.user?.id;
        const { friendId } = req.params;

        const friendship = await FriendsModel.findOne({
            userId: friendId, // 상대방이 나에게 요청을 했음으로 userId는 상대방 아이디
            friendId: userId,
            status: 'pending'
        });

        if (!friendship) {
            res.error(404, "Friend not found");
            return;
        }

        friendship.status = 'accepted';
        await friendship.save();

        const friend = await UserModel.findById(friendId,
            {_id: 1, name: 1}
        )

        res.ok(200, "친구수락 완료", friend);
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

friendRouter.get('/friendRequests', async (req, res) => {
    try {
        const userId = req.user?.id;

        const friendships = await FriendsModel.find({
            status: "pending",
            $or: [
                { userId: userId },
                { friendId: userId }
            ]
        });

        // 모든 관련 유저 ID를 모아 한 번에 조회
        const userIds = Array.from(new Set(
            friendships.flatMap(f => [f.userId.toString(), f.friendId.toString()])
        ));

        // 해당 유저 ID에 대한 유저 정보 조회
        const users = await UserModel.find(
            { _id: { $in: userIds } },
            { _id: 1, name: 1 }
        );

        // _id 기준으로 빠르게 유저 이름을 찾기 위한 Map 생성
        const userMap = new Map(users.map(user => [user._id.toString(), user.name]));

        // 원하는 형식으로 변환
        const result = friendships.map(f => ({
            senderId: f.userId.toString(),
            senderName: userMap.get(f.userId.toString()) || "",
            receiverId: f.friendId.toString(),
            receiverName: userMap.get(f.friendId.toString()) || ""
        }));

        res.ok(200, "", result);
    } catch (err) {
        res.error(500, "친구 요청 조회 실패: " + err);
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
        
        const friend = await UserModel.findById(friendId,
            {_id: 1, name: 1}
        )

        res.ok(200, "친구삭제 완료", friend);

    } catch (err) {
        res.error(500, "친구삭제 실패 "+err);
    }
});
