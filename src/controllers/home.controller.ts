import { Response } from 'express';
import { prisma } from '../config/prisma';
import { AuthRequest } from '../middleware/auth';

export const getHomepageData = async (req: AuthRequest, res: Response) => {
  try {
    const baseFilter = { status: 'PUBLISHED' as any, deletedAt: null };

    const [featuredPosts, trendingPosts, latestPosts, research, awareness] = await Promise.all([
      prisma.post.findMany({
        where: { ...baseFilter, isFeatured: true },
        include: {
          author: { select: { id: true, username: true, fullName: true, avatarUrl: true } },
          category: { select: { id: true, name: true, slug: true, color: true } }
        },
        take: 5
      }),
      prisma.post.findMany({
        where: baseFilter,
        include: {
          author: { select: { id: true, username: true, fullName: true, avatarUrl: true } },
          category: { select: { id: true, name: true, slug: true, color: true } }
        },
        orderBy: [{ engagementScore: 'desc' }, { likeCount: 'desc' }],
        take: 10
      }),
      prisma.post.findMany({
        where: baseFilter,
        include: {
          author: { select: { id: true, username: true, fullName: true, avatarUrl: true } },
          category: { select: { id: true, name: true, slug: true, color: true } }
        },
        orderBy: { publishedAt: 'desc' },
        take: 10
      }),
      prisma.post.findMany({
        where: { ...baseFilter, isResearch: true },
        include: {
          author: { select: { id: true, username: true, fullName: true, avatarUrl: true } },
          category: { select: { id: true, name: true, slug: true, color: true } }
        },
        take: 8
      }),
      prisma.post.findMany({
        where: { ...baseFilter, isCampaign: true },
        include: {
          author: { select: { id: true, username: true, fullName: true, avatarUrl: true } },
          category: { select: { id: true, name: true, slug: true, color: true } }
        },
        take: 8
      }),
    ]);

    const technology = await prisma.post.findMany({
      where: baseFilter,
      include: {
        author: { select: { id: true, username: true, fullName: true, avatarUrl: true } },
        category: { select: { id: true, name: true, slug: true, color: true } }
      },
      take: 8
    });

    let followingFeed: any[] = [];
    if (req.user) {
      const follows = await prisma.follow.findMany({
        where: { followerId: req.user.id }
      });
      const followingUserIds = follows.map((f: any) => f.followingId);
      if (followingUserIds.length > 0) {
        followingFeed = await prisma.post.findMany({
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
  } catch (error: any) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
};
