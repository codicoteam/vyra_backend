"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getFollowing = exports.getFollowers = exports.unfollowUser = exports.followUser = void 0;
const prisma_1 = require("../config/prisma");
const followUser = async (req, res) => {
    const id = req.params.id;
    const user = req.user;
    if (!user)
        return res.status(401).json({ success: false, error: { message: 'Unauthorized' } });
    if (user.id === id) {
        return res.status(400).json({ success: false, error: { message: 'Cannot follow yourself' } });
    }
    const existing = await prisma_1.prisma.follow.findUnique({
        where: { followerId_followingId: { followerId: user.id, followingId: id } }
    });
    if (!existing) {
        await prisma_1.prisma.follow.create({
            data: { followerId: user.id, followingId: id }
        });
        await prisma_1.prisma.user.update({
            where: { id: user.id },
            data: { followingCount: { increment: 1 } }
        });
        await prisma_1.prisma.user.update({
            where: { id },
            data: { followersCount: { increment: 1 } }
        });
    }
    res.status(200).json({ success: true, message: 'Followed user' });
};
exports.followUser = followUser;
const unfollowUser = async (req, res) => {
    const id = req.params.id;
    const user = req.user;
    if (!user)
        return res.status(401).json({ success: false, error: { message: 'Unauthorized' } });
    const existing = await prisma_1.prisma.follow.findUnique({
        where: { followerId_followingId: { followerId: user.id, followingId: id } }
    });
    if (existing) {
        await prisma_1.prisma.follow.delete({
            where: { id: existing.id }
        });
        await prisma_1.prisma.user.update({
            where: { id: user.id },
            data: { followingCount: { decrement: -1 } }
        });
        await prisma_1.prisma.user.update({
            where: { id },
            data: { followersCount: { decrement: -1 } }
        });
    }
    res.status(200).json({ success: true, message: 'Unfollowed user' });
};
exports.unfollowUser = unfollowUser;
const getFollowers = async (req, res) => {
    const id = req.params.id;
    const follows = await prisma_1.prisma.follow.findMany({
        where: { followingId: id },
        include: {
            follower: { select: { id: true, username: true, fullName: true, avatarUrl: true, bio: true } }
        }
    });
    const followers = follows.map((f) => f.follower);
    res.status(200).json({ success: true, data: followers });
};
exports.getFollowers = getFollowers;
const getFollowing = async (req, res) => {
    const id = req.params.id;
    const follows = await prisma_1.prisma.follow.findMany({
        where: { followerId: id },
        include: {
            following: { select: { id: true, username: true, fullName: true, avatarUrl: true, bio: true } }
        }
    });
    const following = follows.map((f) => f.following);
    res.status(200).json({ success: true, data: following });
};
exports.getFollowing = getFollowing;
