"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateTrendingStories = calculateTrendingStories;
const prisma_1 = require("../config/prisma");
async function calculateTrendingStories(limit = 20) {
    const hoursAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000); // Last 7 days
    const posts = await prisma_1.prisma.post.findMany({
        where: {
            status: 'PUBLISHED',
            publishedAt: { gte: hoursAgo },
            moderationStatus: 'APPROVED',
            deletedAt: null,
        },
        include: {
            author: {
                select: { id: true, username: true, fullName: true, avatarUrl: true }
            },
            category: {
                select: { id: true, name: true, slug: true, color: true }
            }
        },
        orderBy: [
            { engagementScore: 'desc' },
            { likeCount: 'desc' },
            { publishedAt: 'desc' }
        ],
        take: limit
    });
    return posts;
}
