import { Request, Response } from 'express';
import { prisma } from '../config/prisma';
import { AuthRequest } from '../middleware/auth';

export const publishAnonymous = async (req: Request, res: Response) => {
  const { title, excerpt, content, coverImage, category } = req.body;
  const slug = (title || 'anonymous-post')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '') + '-' + Date.now().toString(36);

  let anonUser = await prisma.user.findFirst({ where: { username: 'anonymous' } });
  if (!anonUser) {
    anonUser = await prisma.user.create({
      data: {
        email: 'anonymous@vyra.com',
        username: 'anonymous',
        fullName: 'Anonymous Author',
        isVerified: true
      }
    });
  }

  const post = await prisma.post.create({
    data: {
      userId: anonUser.id,
      title: title || 'Anonymous Story',
      slug,
      excerpt,
      content,
      coverImageUrl: coverImage,
      categoryId: category || null,
      isAnonymous: true,
      status: 'DRAFT' as any,
      moderationStatus: 'PENDING' as any,
    }
  });

  res.status(201).json({ success: true, data: post, message: 'Anonymous post submitted for approval' });
};

export const getPendingAnonymous = async (req: AuthRequest, res: Response) => {
  const posts = await prisma.post.findMany({
    where: { isAnonymous: true, moderationStatus: 'PENDING' as any, deletedAt: null },
    orderBy: { createdAt: 'desc' }
  });
  res.status(200).json({ success: true, data: posts });
};

export const approveAnonymous = async (req: AuthRequest, res: Response) => {
  const id = req.params.id as string;
  const post = await prisma.post.findUnique({ where: { id } });
  if (!post) return res.status(404).json({ success: false, error: { message: 'Post not found' } });

  const updated = await prisma.post.update({
    where: { id },
    data: {
      moderationStatus: 'APPROVED' as any,
      status: 'PUBLISHED' as any,
      publishedAt: new Date()
    }
  });

  res.status(200).json({ success: true, data: updated, message: 'Anonymous post approved and published' });
};

export const rejectAnonymous = async (req: AuthRequest, res: Response) => {
  const id = req.params.id as string;
  const post = await prisma.post.findUnique({ where: { id } });
  if (!post) return res.status(404).json({ success: false, error: { message: 'Post not found' } });

  const updated = await prisma.post.update({
    where: { id },
    data: {
      moderationStatus: 'REJECTED' as any,
      status: 'ARCHIVED' as any
    }
  });

  res.status(200).json({ success: true, data: updated, message: 'Anonymous post rejected' });
};
