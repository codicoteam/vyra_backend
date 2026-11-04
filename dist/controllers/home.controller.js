"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getHomepageData = void 0;
const prisma_1 = require("../config/prisma");
const getHomepageData = async (req, res) => {
    try {
        const baseFilter = { status: 'PUBLISHED', deletedAt: null };
        const [featuredPosts, trendingPosts, latestPosts, research, awareness] = await Promise.all([
            prisma_1.prisma.post.findMany({
                where: { ...baseFilter, isFeatured: true },
                include: {
                    author: { select: { id: true, username: true, fullName: true, avatarUrl: true } },
                    category: { select: { id: true, name: true, slug: true, color: true } }
                },
                take: 5
            }),
            prisma_1.prisma.post.findMany({
                where: baseFilter,
                include: {
                    author: { select: { id: true, username: true, fullName: true, avatarUrl: true } },
                    category: { select: { id: true, name: true, slug: true, color: true } }
                },
                orderBy: [{ engagementScore: 'desc' }, { likeCount: 'desc' }],
                take: 10
            }),
            prisma_1.prisma.post.findMany({
                where: baseFilter,
                include: {
                    author: { select: { id: true, username: true, fullName: true, avatarUrl: true } },
                    category: { select: { id: true, name: true, slug: true, color: true } }
                },
                orderBy: { publishedAt: 'desc' },
                take: 10
            }),
            prisma_1.prisma.post.findMany({
                where: { ...baseFilter, isResearch: true },
                include: {
                    author: { select: { id: true, username: true, fullName: true, avatarUrl: true } },
                    category: { select: { id: true, name: true, slug: true, color: true } }
                },
                take: 8
            }),
            prisma_1.prisma.post.findMany({
                where: { ...baseFilter, isCampaign: true },
                include: {
                    author: { select: { id: true, username: true, fullName: true, avatarUrl: true } },
                    category: { select: { id: true, name: true, slug: true, color: true } }
                },
                take: 8
            }),
        ]);
        const technology = await prisma_1.prisma.post.findMany({
            where: baseFilter,
            include: {
                author: { select: { id: true, username: true, fullName: true, avatarUrl: true } },
                category: { select: { id: true, name: true, slug: true, color: true } }
            },
            take: 8
        });
        let followingFeed = [];
        if (req.user) {
            const follows = await prisma_1.prisma.follow.findMany({
                where: { followerId: req.user.id }
            });
            const followingUserIds = follows.map((f) => f.followingId);
            if (followingUserIds.length > 0) {
                followingFeed = await prisma_1.prisma.post.findMany({
                    where: { ...baseFilter, userId: { in: followingUserIds } },
                    include: {
                        author: { select: { id: true, username: true, fullName: true, avatarUrl: true } },
                        category: { select: { id: true, name: true, slug: true, color: true } }
                    },
                    orderBy: { publishedAt: 'desc' },
                    take: 10
                });
            }
        }
        res.status(200).json({
            success: true,
            data: {
                featuredPosts,
                trendingPosts,
                latestPosts,
                research,
                technology,
                awareness,
                followingFeed,
            }
        });
    }
    catch (error) {
        res.status(500).json({ success: false, error: { message: error.message } });
    }
};
exports.getHomepageData = getHomepageData;
