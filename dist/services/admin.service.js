"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAdminDashboardStats = getAdminDashboardStats;
const prisma_1 = require("../config/prisma");
async function getAdminDashboardStats() {
    const startOfDay = new Date(new Date().setHours(0, 0, 0, 0));
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const [totalUsers, newUsersToday, newUsersThisWeek, totalStories, publishedToday, pendingReview, totalAnonymous, unresolvedReports,] = await Promise.all([
        prisma_1.prisma.user.count({ where: { deletedAt: null } }),
        prisma_1.prisma.user.count({ where: { createdAt: { gte: startOfDay }, deletedAt: null } }),
        prisma_1.prisma.user.count({ where: { createdAt: { gte: sevenDaysAgo }, deletedAt: null } }),
        prisma_1.prisma.post.count({ where: { deletedAt: null } }),
        prisma_1.prisma.post.count({ where: { publishedAt: { gte: startOfDay }, status: 'PUBLISHED', deletedAt: null } }),
        prisma_1.prisma.post.count({ where: { moderationStatus: 'PENDING', deletedAt: null } }),
        prisma_1.prisma.post.count({ where: { isAnonymous: true, status: 'PUBLISHED', deletedAt: null } }),
        prisma_1.prisma.report.count({ where: { status: 'PENDING' } }),
    ]);
    return {
        totalUsers,
        newUsersToday,
        newUsersThisWeek,
        totalStories,
        publishedToday,
        pendingReview,
        totalAnonymousStories: totalAnonymous,
        unresolvedReports,
    };
}
