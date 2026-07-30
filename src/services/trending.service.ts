import { prisma } from '../config/prisma';

export async function calculateTrendingStories(limit: number = 20) {
  const hoursAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000); // Last 7 days

  const posts = await prisma.post.findMany({
    where: {
      status: 'PUBLISHED' as any,
      publishedAt: { gte: hoursAgo },
      moderationStatus: 'APPROVED' as any,
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
