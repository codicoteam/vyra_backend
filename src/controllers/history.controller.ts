import { Response } from 'express';
import { prisma } from '../config/prisma';
import { AuthRequest } from '../middleware/auth';

export const addHistory = async (req: AuthRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ success: false, error: { message: 'Unauthorized' } });

  const { postId } = req.body;
  const history = await prisma.readingHistory.upsert({
    where: { userId_postId: { userId: req.user.id, postId } },
    update: { readAt: new Date() },
    create: { userId: req.user.id, postId, readAt: new Date() }
  });

  res.status(200).json({ success: true, data: history, message: 'Reading history recorded' });
};

export const getHistory = async (req: AuthRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ success: false, error: { message: 'Unauthorized' } });

  const history = await prisma.readingHistory.findMany({
    where: { userId: req.user.id },
    include: {
      post: {
        include: {
          author: { select: { id: true, fullName: true, username: true, avatarUrl: true } },
          category: { select: { id: true, name: true, color: true } }
        }
      }
    },
    orderBy: { readAt: 'desc' }
  });

  res.status(200).json({ success: true, data: history });
};

export const deleteHistoryItem = async (req: AuthRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ success: false, error: { message: 'Unauthorized' } });

  const id = req.params.id as string;
  const result = await prisma.readingHistory.deleteMany({
    where: { id, userId: req.user.id }
  });

  if (result.count === 0) return res.status(404).json({ success: false, error: { message: 'History item not found' } });
  res.status(200).json({ success: true, message: 'History item deleted' });
};
