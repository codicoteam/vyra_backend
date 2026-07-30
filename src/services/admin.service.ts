import { prisma } from '../config/prisma';

export async function getAdminDashboardStats() {
  const startOfDay = new Date(new Date().setHours(0, 0, 0, 0));
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  const [
    totalUsers,
    newUsersToday,
    newUsersThisWeek,
    totalStories,
    publishedToday,
    pendingReview,
    totalAnonymous,
    unresolvedReports,
  ] = await Promise.all([
    prisma.user.count({ where: { deletedAt: null } }),
    prisma.user.count({ where: { createdAt: { gte: startOfDay }, deletedAt: null } }),
    prisma.user.count({ where: { createdAt: { gte: sevenDaysAgo }, deletedAt: null } }),
    prisma.post.count({ where: { deletedAt: null } }),
    prisma.post.count({ where: { publishedAt: { gte: startOfDay }, status: 'PUBLISHED' as any, deletedAt: null } }),
    prisma.post.count({ where: { moderationStatus: 'PENDING' as any, deletedAt: null } }),
    prisma.post.count({ where: { isAnonymous: true, status: 'PUBLISHED' as any, deletedAt: null } }),
    prisma.report.count({ where: { status: 'PENDING' as any } }),
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
