"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserDashboardStats = getUserDashboardStats;
exports.getStoryGrowthOverTime = getStoryGrowthOverTime;
exports.getCategoryDistribution = getCategoryDistribution;
const prisma_1 = require("../config/prisma");
async function getUserDashboardStats(userId) {
    const aggregate = await prisma_1.prisma.post.aggregate({
        where: { userId, deletedAt: null },
        _count: { id: true },
        _sum: { viewCount: true, likeCount: true, bookmarkCount: true, readCount: true }
    });
    return [
        {
            _id: 'published',
            count: aggregate._count.id || 0,
            totalViews: aggregate._sum.viewCount || 0,
            totalLikes: aggregate._sum.likeCount || 0,
            totalBookmarks: aggregate._sum.bookmarkCount || 0,
            totalReads: aggregate._sum.readCount || 0,
        }
    ];
}
async function getStoryGrowthOverTime(userId, months = 12) {
    const sinceDate = new Date();
    sinceDate.setMonth(sinceDate.getMonth() - months);
    const posts = await prisma_1.prisma.post.findMany({
        where: {
            userId,
            publishedAt: { gte: sinceDate },
            status: 'PUBLISHED',
            deletedAt: null,
        },
        select: { publishedAt: true, viewCount: true, likeCount: true }
    });
    const grouped = {};
    for (const p of posts) {
        if (!p.publishedAt)
            continue;
        const key = `${p.publishedAt.getFullYear()}-${p.publishedAt.getMonth() + 1}`;
        if (!grouped[key]) {
            grouped[key] = { count: 0, totalViews: 0, totalLikes: 0 };
        }
        grouped[key].count += 1;
        grouped[key].totalViews += p.viewCount || 0;
        grouped[key].totalLikes += p.likeCount || 0;
    }
    return Object.entries(grouped).map(([key, val]) => ({
        _id: { year: parseInt(key.split('-')[0]), month: parseInt(key.split('-')[1]) },
        ...val
    }));
}
async function getCategoryDistribution() {
    const categories = await prisma_1.prisma.category.findMany({
        where: { isActive: true },
        include: {
            _count: {
                select: { posts: true }
            }
        }
    });
    return categories.map((c) => ({
        category: c.name,
        slug: c.slug,
        color: c.color,
        count: c._count.posts || c.storiesCount || 0,
    }));
}
