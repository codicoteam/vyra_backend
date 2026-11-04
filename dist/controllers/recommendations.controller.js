"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTrendingRecommendations = exports.getFollowingRecommendations = exports.getRecommendations = void 0;
const prisma_1 = require("../config/prisma");
const getRecommendations = async (req, res) => {
    const posts = await prisma_1.prisma.post.findMany({
        where: { status: 'PUBLISHED', deletedAt: null },
        include: {
            author: { select: { id: true, username: true, fullName: true, avatarUrl: true } },
            category: { select: { id: true, name: true, slug: true, color: true } }
        },
        orderBy: [{ engagementScore: 'desc' }, { publishedAt: 'desc' }],
        take: 20
    });
    res.status(200).json({ success: true, data: posts });
};
exports.getRecommendations = getRecommendations;
const getFollowingRecommendations = async (req, res) => {
    if (!req.user)
        return res.status(401).json({ success: false, error: { message: 'Unauthorized' } });
    const followingRecords = await prisma_1.prisma.follow.findMany({
        where: { followerId: req.user.id }
    });
    const followingUserIds = followingRecords.map((f) => f.followingId);
    const posts = await prisma_1.prisma.post.findMany({
        where: { userId: { in: followingUserIds }, status: 'PUBLISHED', deletedAt: null },
        include: {
            author: { select: { id: true, username: true, fullName: true, avatarUrl: true } },
            category: { select: { id: true, name: true, slug: true, color: true } }
        },
        orderBy: { publishedAt: 'desc' },
        take: 20
    });
    res.status(200).json({ success: true, data: posts });
};
exports.getFollowingRecommendations = getFollowingRecommendations;
const getTrendingRecommendations = async (req, res) => {
    const posts = await prisma_1.prisma.post.findMany({
        where: { status: 'PUBLISHED', deletedAt: null },
        include: {
            author: { select: { id: true, username: true, fullName: true, avatarUrl: true } },
            category: { select: { id: true, name: true, slug: true, color: true } }
        },
        orderBy: [{ likeCount: 'desc' }, { viewCount: 'desc' }, { publishedAt: 'desc' }],
        take: 20
    });
    res.status(200).json({ success: true, data: posts });
};
exports.getTrendingRecommendations = getTrendingRecommendations;
