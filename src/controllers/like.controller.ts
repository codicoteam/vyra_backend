import { Request, Response } from 'express';
import { prisma } from '../config/prisma';
import { AuthRequest } from '../middleware/auth';

export const likePost = async (req: AuthRequest, res: Response) => {
  const id = req.params.id as string;
  const user = req.user;
  if (!user) return res.status(401).json({ success: false, error: { message: 'Unauthorized' } });

  const existing = await prisma.like.findUnique({
    where: { userId_postId: { userId: user.id, postId: id } }
  });

  if (!existing) {
    await prisma.like.create({
      data: { userId: user.id, postId: id }
    });
    await prisma.post.update({
      where: { id },
      data: { likeCount: { increment: 1 } }
    });
  }

  res.status(200).json({ success: true, message: 'Liked post' });
};

export const unlikePost = async (req: AuthRequest, res: Response) => {
  const id = req.params.id as string;
  const user = req.user;
  if (!user) return res.status(401).json({ success: false, error: { message: 'Unauthorized' } });

  const existing = await prisma.like.findUnique({
    where: { userId_postId: { userId: user.id, postId: id } }
  });

  if (existing) {
    await prisma.like.delete({
      where: { id: existing.id }
    });
    await prisma.post.update({
      where: { id },
      data: { likeCount: { decrement: -1 } }
    });
  }

  res.status(200).json({ success: true, message: 'Unliked post' });
};

export const getPostLikes = async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const likes = await prisma.like.findMany({
    where: { postId: id },
    include: {
      user: { select: { id: true, username: true, fullName: true, avatarUrl: true } }
    }
  });

  const users = likes.map((l: any) => l.user);
  res.status(200).json({ success: true, data: users });
};
