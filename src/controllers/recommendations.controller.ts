import { Request, Response } from 'express';
import { prisma } from '../config/prisma';
import { AuthRequest } from '../middleware/auth';

export const getRecommendations = async (req: Request, res: Response) => {
  const posts = await prisma.post.findMany({
    where: { status: 'PUBLISHED' as any, deletedAt: null },
    include: {
      author: { select: { id: true, username: true, fullName: true, avatarUrl: true } },
      category: { select: { id: true, name: true, slug: true, color: true } }
    },
    orderBy: [{ engagementScore: 'desc' }, { publishedAt: 'desc' }],
    take: 20
  });

  res.status(200).json({ success: true, data: posts });
};

export const getFollowingRecommendations = async (req: AuthRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ success: false, error: { message: 'Unauthorized' } });

  const followingRecords = await prisma.follow.findMany({
    where: { followerId: req.user.id }
  });
  const followingUserIds = followingRecords.map((f: any) => f.followingId);

  const posts = await prisma.post.findMany({
    where: { userId: { in: followingUserIds }, status: 'PUBLISHED' as any, deletedAt: null },
    include: {
      author: { select: { id: true, username: true, fullName: true, avatarUrl: true } },
      category: { select: { id: true, name: true, slug: true, color: true } }
    },
    orderBy: { publishedAt: 'desc' },
    take: 20
  });

  res.status(200).json({ success: true, data: posts });
};

export const getTrendingRecommendations = async (req: Request, res: Response) => {
  const posts = await prisma.post.findMany({
    where: { status: 'PUBLISHED' as any, deletedAt: null },
    include: {
      author: { select: { id: true, username: true, fullName: true, avatarUrl: true } },
      category: { select: { id: true, name: true, slug: true, color: true } }
    },
    orderBy: [{ likeCount: 'desc' }, { viewCount: 'desc' }, { publishedAt: 'desc' }],
    take: 20
  });

  res.status(200).json({ success: true, data: posts });
};
