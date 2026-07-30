import { Request, Response } from 'express';
import { prisma } from '../config/prisma';
import { AuthRequest } from '../middleware/auth';

export const createPost = async (req: AuthRequest, res: Response) => {
  const { title, excerpt, content, coverImage, category, isAnonymous, isResearch, isCampaign, status } = req.body;
  const user = req.user;

  if (!user) {
    return res.status(401).json({ success: false, error: { message: 'Unauthorized' } });
  }

  try {
    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '') + '-' + Date.now().toString(36);

    const postStatus = status === 'published' || status === 'PUBLISHED' ? 'PUBLISHED' : 'DRAFT';

    const post = await prisma.post.create({
      data: {
        userId: user.id,
        title,
        slug,
        excerpt,
        content,
        coverImageUrl: coverImage,
        categoryId: category || null,
        isAnonymous: !!isAnonymous,
        isResearch: !!isResearch,
        isCampaign: !!isCampaign,
        status: postStatus as any,
        publishedAt: postStatus === 'DRAFT' ? null : new Date(),
      }
    });

    res.status(201).json({ success: true, data: post, message: 'Post created successfully' });
  } catch (error: any) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
};

export const getPosts = async (req: Request, res: Response) => {
  const { category, search, status, page, limit } = req.query;
  const pageNum = parseInt(page as string) || 1;
  const limitNum = parseInt(limit as string) || 20;
  const skip = (pageNum - 1) * limitNum;

  const whereClause: any = { deletedAt: null };
  if (status) {
    whereClause.status = (status as string).toUpperCase() as any;
  } else {
    whereClause.status = 'PUBLISHED' as any;
  }

  if (category) {
    whereClause.categoryId = category as string;
  }

  if (search) {
    whereClause.OR = [
      { title: { contains: search as string, mode: 'insensitive' } },
      { excerpt: { contains: search as string, mode: 'insensitive' } },
      { content: { contains: search as string, mode: 'insensitive' } }
    ];
  }

  try {
    const posts = await prisma.post.findMany({
      where: whereClause,
      include: {
        author: {
          select: { id: true, username: true, fullName: true, avatarUrl: true, bio: true, followersCount: true, followingCount: true, storiesCount: true }
        },
        category: {
          select: { id: true, name: true, slug: true, color: true, icon: true }
        }
      },
      orderBy: [{ publishedAt: 'desc' }, { createdAt: 'desc' }],
      skip,
      take: limitNum
    });

    const total = await prisma.post.count({ where: whereClause });

    const formattedPosts = posts.map((post: any) => {
      const author = post.author;
      const cat = post.category;
      return {
        id: post.id,
        title: post.title,
        slug: post.slug,
        excerpt: post.excerpt || '',
        content: post.content,
        coverImage: post.coverImageUrl || '',
        category: cat ? cat.name : 'Uncategorized',
        categoryId: cat ? cat.id : null,
        tags: [],
        author: {
          id: author ? author.id : '',
          name: post.isAnonymous ? 'Anonymous Author' : (author ? author.fullName : 'Anonymous Author'),
          avatar: post.isAnonymous ? '' : (author ? author.avatarUrl : ''),
          bio: author ? author.bio || '' : '',
          username: post.isAnonymous ? 'anonymous' : (author ? author.username : 'anonymous'),
        },
        isAnonymous: post.isAnonymous,
        readingTime: post.readingTime || 1,
        publishedDate: post.publishedAt ? post.publishedAt.toISOString() : post.createdAt.toISOString(),
        likes: post.likeCount || 0,
        bookmarks: post.bookmarkCount || 0,
        isResearch: post.isResearch,
        isCampaign: post.isCampaign,
        goalProgress: post.campaignProgress || 0,
        status: post.status,
        isFeatured: post.isFeatured,
      };
    });

    res.status(200).json({
      success: true,
      data: formattedPosts,
      pagination: { page: pageNum, limit: limitNum, total, totalPages: Math.ceil(total / limitNum) }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
};

export const getPostById = async (req: Request, res: Response) => {
  const id = req.params.id as string;
  try {
    const post = await prisma.post.findFirst({
      where: { id, deletedAt: null },
      include: {
        author: { select: { id: true, username: true, fullName: true, avatarUrl: true, bio: true } },
        category: { select: { id: true, name: true, slug: true, color: true, icon: true } }
      }
    });

    if (!post) {
      return res.status(404).json({ success: false, error: { message: 'Post not found' } });
    }

    res.status(200).json({ success: true, data: post });
  } catch (error: any) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
};

export const getPostBySlug = async (req: Request, res: Response) => {
  const slug = req.params.slug as string;
  try {
    const post = await prisma.post.findFirst({
      where: { slug, deletedAt: null },
      include: {
        author: { select: { id: true, username: true, fullName: true, avatarUrl: true, bio: true } },
        category: { select: { id: true, name: true, slug: true, color: true, icon: true } }
      }
    });

    if (!post) {
      return res.status(404).json({ success: false, error: { message: 'Post not found' } });
    }

    await prisma.post.update({
      where: { id: post.id },
      data: { viewCount: { increment: 1 } }
    });

    res.status(200).json({ success: true, data: post });
  } catch (error: any) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
};

export const updatePost = async (req: AuthRequest, res: Response) => {
  const id = req.params.id as string;
  const user = req.user;
  if (!user) {
    return res.status(401).json({ success: false, error: { message: 'Unauthorized' } });
  }

  try {
    const post = await prisma.post.findFirst({ where: { id, deletedAt: null } });
    if (!post) {
      return res.status(404).json({ success: false, error: { message: 'Post not found' } });
    }

    if (post.userId !== user.id && user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN' && user.role !== 'EDITOR') {
      return res.status(403).json({ success: false, error: { message: 'Forbidden' } });
    }

    const updated = await prisma.post.update({
      where: { id },
      data: req.body
    });

    res.status(200).json({ success: true, data: updated, message: 'Post updated successfully' });
  } catch (error: any) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
};

export const deletePost = async (req: AuthRequest, res: Response) => {
  const id = req.params.id as string;
  const user = req.user;
  if (!user) {
    return res.status(401).json({ success: false, error: { message: 'Unauthorized' } });
  }

  try {
    const post = await prisma.post.findFirst({ where: { id, deletedAt: null } });
    if (!post) {
      return res.status(404).json({ success: false, error: { message: 'Post not found' } });
    }

    if (post.userId !== user.id && user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN') {
      return res.status(403).json({ success: false, error: { message: 'Forbidden' } });
    }

    await prisma.post.update({
      where: { id },
      data: { deletedAt: new Date() }
    });

    res.status(200).json({ success: true, message: 'Post deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
};

export const publishPost = async (req: AuthRequest, res: Response) => {
  const id = req.params.id as string;
  const user = req.user;
  if (!user) return res.status(401).json({ success: false, error: { message: 'Unauthorized' } });

  try {
    const post = await prisma.post.update({
      where: { id },
      data: { status: 'PUBLISHED' as any, publishedAt: new Date() }
    });

    res.status(200).json({ success: true, data: post, message: 'Post published successfully' });
  } catch (error: any) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
};

export const archivePost = async (req: AuthRequest, res: Response) => {
  const id = req.params.id as string;
  const user = req.user;
  if (!user) return res.status(401).json({ success: false, error: { message: 'Unauthorized' } });

  try {
    const post = await prisma.post.update({
      where: { id },
      data: { status: 'ARCHIVED' as any }
    });

    res.status(200).json({ success: true, data: post, message: 'Post archived successfully' });
  } catch (error: any) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
};

export const duplicatePost = async (req: AuthRequest, res: Response) => {
  const id = req.params.id as string;
  const user = req.user;
  if (!user) return res.status(401).json({ success: false, error: { message: 'Unauthorized' } });

  try {
    const post = await prisma.post.findUnique({ where: { id } });
    if (!post) return res.status(404).json({ success: false, error: { message: 'Post not found' } });

    const newSlug = post.slug + '-copy-' + Date.now().toString(36);

    const duplicated = await prisma.post.create({
      data: {
        userId: user.id,
        title: `${post.title} (Copy)`,
        slug: newSlug,
        excerpt: post.excerpt,
        content: post.content,
        contentFormat: post.contentFormat,
        plainTextContent: post.plainTextContent,
        coverImageUrl: post.coverImageUrl,
        coverImageAlt: post.coverImageAlt,
        categoryId: post.categoryId,
        status: 'DRAFT' as any,
        publishedAt: null,
        isAnonymous: post.isAnonymous,
        isResearch: post.isResearch,
        isCampaign: post.isCampaign,
      }
    });

    res.status(201).json({ success: true, data: duplicated, message: 'Post duplicated successfully' });
  } catch (error: any) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
};

export const featurePost = async (req: AuthRequest, res: Response) => {
  const id = req.params.id as string;
  const user = req.user;
  if (!user) return res.status(401).json({ success: false, error: { message: 'Unauthorized' } });

  try {
    const post = await prisma.post.findUnique({ where: { id } });
    if (!post) return res.status(404).json({ success: false, error: { message: 'Post not found' } });

    const updated = await prisma.post.update({
      where: { id },
      data: { isFeatured: !post.isFeatured }
    });

    res.status(200).json({ success: true, data: updated, message: `Post featured status set to ${updated.isFeatured}` });
  } catch (error: any) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
};
