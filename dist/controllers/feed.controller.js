"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getLatestFeed = exports.getTrendingFeed = exports.getFollowingFeed = exports.getMainFeed = void 0;
const prisma_1 = require("../config/prisma");
const getMainFeed = async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const posts = await prisma_1.prisma.post.findMany({
        where: { status: 'PUBLISHED', deletedAt: null },
        include: {
            author: { select: { id: true, username: true, fullName: true, avatarUrl: true } },
            category: { select: { id: true, name: true, slug: true, color: true } }
        },
        orderBy: { publishedAt: 'desc' },
        skip,
        take: limit
    });
    const total = await prisma_1.prisma.post.count({ where: { status: 'PUBLISHED', deletedAt: null } });
    res.status(200).json({
        success: true,
        data: posts,
        pagination: { page, limit, total, totalPages: Math.ceil(total / limit) }
    });
};
exports.getMainFeed = getMainFeed;
const getFollowingFeed = async (req, res) => {
    if (!req.user)
        return res.status(401).json({ success: false, error: { message: 'Unauthorized' } });
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const follows = await prisma_1.prisma.follow.findMany({ where: { followerId: req.user.id } });
    const followingUserIds = follows.map((f) => f.followingId);
    const posts = await prisma_1.prisma.post.findMany({
        where: { userId: { in: followingUserIds }, status: 'PUBLISHED', deletedAt: null },
        include: {
            author: { select: { id: true, username: true, fullName: true, avatarUrl: true } },
            category: { select: { id: true, name: true, slug: true, color: true } }
        },
        orderBy: { publishedAt: 'desc' },
        skip,
        take: limit
    });
    const total = await prisma_1.prisma.post.count({ where: { userId: { in: followingUserIds }, status: 'PUBLISHED', deletedAt: null } });
    res.status(200).json({
        success: true,
        data: posts,
        pagination: { page, limit, total, totalPages: Math.ceil(total / limit) }
    });
};
exports.getFollowingFeed = getFollowingFeed;
const getTrendingFeed = async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const posts = await prisma_1.prisma.post.findMany({
        where: { status: 'PUBLISHED', deletedAt: null },
        include: {
            author: { select: { id: true, username: true, fullName: true, avatarUrl: true } },
            category: { select: { id: true, name: true, slug: true, color: true } }
        },
        orderBy: [{ engagementScore: 'desc' }, { likeCount: 'desc' }, { publishedAt: 'desc' }],
        skip,
        take: limit
    });
    const total = await prisma_1.prisma.post.count({ where: { status: 'PUBLISHED', deletedAt: null } });
    res.status(200).json({
        success: true,
        data: posts,
        pagination: { page, limit, total, totalPages: Math.ceil(total / limit) }
    });
};
exports.getTrendingFeed = getTrendingFeed;
const getLatestFeed = async (req, res) => {
    return (0, exports.getMainFeed)(req, res);
};
exports.getLatestFeed = getLatestFeed;
