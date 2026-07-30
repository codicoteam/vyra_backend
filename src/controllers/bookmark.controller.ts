import { Response } from 'express';
import { prisma } from '../config/prisma';
import { AuthRequest } from '../middleware/auth';

export const addBookmark = async (req: AuthRequest, res: Response) => {
  const postId = req.params.postId as string;
  const user = req.user;
  if (!user) return res.status(401).json({ success: false, error: { message: 'Unauthorized' } });

  const existing = await prisma.bookmark.findUnique({
    where: { userId_postId: { userId: user.id, postId } }
  });

  if (!existing) {
    await prisma.bookmark.create({
      data: { userId: user.id, postId }
    });
    await prisma.post.update({
      where: { id: postId },
      data: { bookmarkCount: { increment: 1 } }
    });
  }

  res.status(200).json({ success: true, message: 'Bookmarked post' });
};

export const removeBookmark = async (req: AuthRequest, res: Response) => {
  const postId = req.params.postId as string;
  const user = req.user;
  if (!user) return res.status(401).json({ success: false, error: { message: 'Unauthorized' } });

  const existing = await prisma.bookmark.findUnique({
    where: { userId_postId: { userId: user.id, postId } }
  });

  if (existing) {
    await prisma.bookmark.delete({
      where: { id: existing.id }
    });
    await prisma.post.update({
      where: { id: postId },
      data: { bookmarkCount: { decrement: -1 } }
    });
  }

  res.status(200).json({ success: true, message: 'Removed bookmark' });
};

export const getBookmarks = async (req: AuthRequest, res: Response) => {
  const user = req.user;
  if (!user) return res.status(401).json({ success: false, error: { message: 'Unauthorized' } });

  const bookmarks = await prisma.bookmark.findMany({
    where: { userId: user.id },
    include: {
      post: {
        include: {
          author: { select: { id: true, fullName: true, username: true, avatarUrl: true } },
          category: { select: { id: true, name: true, color: true } }
        }
      }
    },
    orderBy: { createdAt: 'desc' }
  });

  const posts = bookmarks.map((b: any) => b.post).filter(Boolean);
  res.status(200).json({ success: true, data: posts });
};
