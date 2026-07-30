import { Request, Response } from 'express';
import { prisma } from '../config/prisma';

export const unifiedSearch = async (req: Request, res: Response) => {
  const query = (req.query.q as string) || '';
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const skip = (page - 1) * limit;

  if (!query.trim()) {
    return res.status(200).json({
      success: true,
      data: { posts: [], users: [], categories: [], tags: [] }
    });
  }

  const [posts, users, categories, tags] = await Promise.all([
    prisma.post.findMany({
      where: {
        status: 'PUBLISHED' as any,
        deletedAt: null,
        OR: [
          { title: { contains: query, mode: 'insensitive' } },
          { excerpt: { contains: query, mode: 'insensitive' } }
        ]
      },
      include: {
        author: { select: { id: true, username: true, fullName: true, avatarUrl: true } },
        category: { select: { id: true, name: true, slug: true, color: true } }
      },
      skip,
      take: limit
    }),
    prisma.user.findMany({
      where: {
        deletedAt: null,
        OR: [
          { username: { contains: query, mode: 'insensitive' } },
          { fullName: { contains: query, mode: 'insensitive' } },
          { bio: { contains: query, mode: 'insensitive' } }
        ]
      },
      select: { id: true, username: true, fullName: true, avatarUrl: true, bio: true },
      skip,
      take: limit
    }),
    prisma.category.findMany({
      where: {
        isActive: true,
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { description: { contains: query, mode: 'insensitive' } }
        ]
      },
      take: limit
    }),
    prisma.tag.findMany({
      where: {
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { description: { contains: query, mode: 'insensitive' } }
        ]
      },
      take: limit
    })
  ]);

  res.status(200).json({
    success: true,
    data: { posts, users, categories, tags },
    query,
    pagination: { page, limit }
  });
};

export const searchPosts = async (req: Request, res: Response) => {
  const query = (req.query.q as string) || '';
  const category = req.query.category as string;
  const sortBy = (req.query.sortBy as string) || 'latest';
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;
  const skip = (page - 1) * limit;

  const whereClause: any = { status: 'PUBLISHED' as any, deletedAt: null };
  if (query.trim()) {
    whereClause.OR = [
      { title: { contains: query, mode: 'insensitive' } },
      { excerpt: { contains: query, mode: 'insensitive' } }
    ];
  }
  if (category) {
    whereClause.categoryId = category;
  }

  let orderBy: any = [{ publishedAt: 'desc' }];
  if (sortBy === 'popular' || sortBy === 'likes') {
    orderBy = [{ likeCount: 'desc' }, { publishedAt: 'desc' }];
  } else if (sortBy === 'views') {
    orderBy = [{ viewCount: 'desc' }, { publishedAt: 'desc' }];
  }

  const posts = await prisma.post.findMany({
    where: whereClause,
    include: {
      author: { select: { id: true, username: true, fullName: true, avatarUrl: true } },
      category: { select: { id: true, name: true, slug: true, color: true } }
    },
    orderBy,
    skip,
    take: limit
  });

  const total = await prisma.post.count({ where: whereClause });

  res.status(200).json({
    success: true,
    data: posts,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) }
  });
};

export const searchUsers = async (req: Request, res: Response) => {
  const query = (req.query.q as string) || '';
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;
  const skip = (page - 1) * limit;

  const whereClause: any = {
    deletedAt: null,
    OR: [
      { username: { contains: query, mode: 'insensitive' } },
      { fullName: { contains: query, mode: 'insensitive' } },
      { bio: { contains: query, mode: 'insensitive' } }
    ]
  };

  const users = await prisma.user.findMany({
    where: whereClause,
    select: { id: true, username: true, fullName: true, avatarUrl: true, bio: true },
    skip,
    take: limit
  });

  const total = await prisma.user.count({ where: whereClause });

  res.status(200).json({
    success: true,
    data: users,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) }
  });
};

export const searchCategories = async (req: Request, res: Response) => {
  const query = (req.query.q as string) || '';
  const categories = await prisma.category.findMany({
    where: {
      isActive: true,
      OR: [
        { name: { contains: query, mode: 'insensitive' } },
        { description: { contains: query, mode: 'insensitive' } }
      ]
    }
  });
  res.status(200).json({ success: true, data: categories });
};

export const searchTags = async (req: Request, res: Response) => {
  const query = (req.query.q as string) || '';
  const tags = await prisma.tag.findMany({
    where: {
      OR: [
        { name: { contains: query, mode: 'insensitive' } },
        { description: { contains: query, mode: 'insensitive' } }
      ]
    }
  });
  res.status(200).json({ success: true, data: tags });
};
