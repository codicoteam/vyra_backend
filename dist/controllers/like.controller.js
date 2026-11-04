"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPostLikes = exports.unlikePost = exports.likePost = void 0;
const prisma_1 = require("../config/prisma");
const likePost = async (req, res) => {
    const id = req.params.id;
    const user = req.user;
    if (!user)
        return res.status(401).json({ success: false, error: { message: 'Unauthorized' } });
    const existing = await prisma_1.prisma.like.findUnique({
        where: { userId_postId: { userId: user.id, postId: id } }
    });
    if (!existing) {
        await prisma_1.prisma.like.create({
            data: { userId: user.id, postId: id }
        });
        await prisma_1.prisma.post.update({
            where: { id },
            data: { likeCount: { increment: 1 } }
        });
    }
    res.status(200).json({ success: true, message: 'Liked post' });
};
exports.likePost = likePost;
const unlikePost = async (req, res) => {
    const id = req.params.id;
    const user = req.user;
    if (!user)
        return res.status(401).json({ success: false, error: { message: 'Unauthorized' } });
    const existing = await prisma_1.prisma.like.findUnique({
        where: { userId_postId: { userId: user.id, postId: id } }
    });
    if (existing) {
        await prisma_1.prisma.like.delete({
            where: { id: existing.id }
        });
        await prisma_1.prisma.post.update({
            where: { id },
            data: { likeCount: { decrement: -1 } }
        });
    }
    res.status(200).json({ success: true, message: 'Unliked post' });
};
exports.unlikePost = unlikePost;
const getPostLikes = async (req, res) => {
    const id = req.params.id;
    const likes = await prisma_1.prisma.like.findMany({
        where: { postId: id },
        include: {
            user: { select: { id: true, username: true, fullName: true, avatarUrl: true } }
        }
    });
    const users = likes.map((l) => l.user);
    res.status(200).json({ success: true, data: users });
};
exports.getPostLikes = getPostLikes;
