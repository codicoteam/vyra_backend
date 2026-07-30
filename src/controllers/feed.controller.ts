import { Request, Response } from 'express';
import { prisma } from '../config/prisma';
import { AuthRequest } from '../middleware/auth';

export const getMainFeed = async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;
  const skip = (page - 1) * limit;

  const posts = await prisma.post.findMany({
    where: { status: 'PUBLISHED' as any, deletedAt: null },
    include: {
      author: { select: { id: true, username: true, fullName: true, avatarUrl: true } },
      category: { select: { id: true, name: true, slug: true, color: true } }
    },
    orderBy: { publishedAt: 'desc' },
    skip,
    take: limit
  });

  const total = await prisma.post.count({ where: { status: 'PUBLISHED' as any, deletedAt: null } });

  res.status(200).json({
    success: true,
    data: posts,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) }
  });
};

export const getFollowingFeed = async (req: AuthRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ success: false, error: { message: 'Unauthorized' } });

  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;
  const skip = (page - 1) * limit;

  const follows = await prisma.follow.findMany({ where: { followerId: req.user.id } });
  const followingUserIds = follows.map((f: any) => f.followingId);

  const posts = await prisma.post.findMany({
    where: { userId: { in: followingUserIds }, status: 'PUBLISHED' as any, deletedAt: null },
    include: {
      author: { select: { id: true, username: true, fullName: true, avatarUrl: true } },
      category: { select: { id: true, name: true, slug: true, color: true } }
    },
    orderBy: { publishedAt: 'desc' },
    skip,
    take: limit
  });

  const total = await prisma.post.count({ where: { userId: { in: followingUserIds }, status: 'PUBLISHED' as any, deletedAt: null } });

  res.status(200).json({
    success: true,
    data: posts,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) }
  });
};

export const getTrendingFeed = async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;
  const skip = (page - 1) * limit;

  const posts = await prisma.post.findMany({
    where: { status: 'PUBLISHED' as any, deletedAt: null },
    include: {
      author: { select: { id: true, username: true, fullName: true, avatarUrl: true } },
      category: { select: { id: true, name: true, slug: true, color: true } }
    },
    orderBy: [{ engagementScore: 'desc' }, { likeCount: 'desc' }, { publishedAt: 'desc' }],
    skip,
    take: limit
  });

  const total = await prisma.post.count({ where: { status: 'PUBLISHED' as any, deletedAt: null } });

  res.status(200).json({
    success: true,
    data: posts,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) }
  });
};

export const getLatestFeed = async (req: Request, res: Response) => {
  return getMainFeed(req, res);
};
