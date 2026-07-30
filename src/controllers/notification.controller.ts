import { Response } from 'express';
import { prisma } from '../config/prisma';
import { AuthRequest } from '../middleware/auth';

export const getNotifications = async (req: AuthRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ success: false, error: { message: 'Unauthorized' } });

  const notifications = await prisma.notification.findMany({
    where: { userId: req.user.id },
    include: {
      actor: { select: { id: true, username: true, fullName: true, avatarUrl: true } }
    },
    orderBy: { createdAt: 'desc' }
  });

  res.status(200).json({ success: true, data: notifications });
};

export const getUnreadNotifications = async (req: AuthRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ success: false, error: { message: 'Unauthorized' } });

  const unread = await prisma.notification.findMany({
    where: { userId: req.user.id, isRead: false },
    include: {
      actor: { select: { id: true, username: true, fullName: true, avatarUrl: true } }
    },
    orderBy: { createdAt: 'desc' }
  });

  res.status(200).json({ success: true, count: unread.length, data: unread });
};

export const markRead = async (req: AuthRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ success: false, error: { message: 'Unauthorized' } });

  const id = req.params.id as string;
  const notification = await prisma.notification.updateMany({
    where: { id, userId: req.user.id },
    data: { isRead: true, readAt: new Date() }
  });

  if (notification.count === 0) return res.status(404).json({ success: false, error: { message: 'Notification not found' } });
  res.status(200).json({ success: true, message: 'Notification marked as read' });
};

export const markAllRead = async (req: AuthRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ success: false, error: { message: 'Unauthorized' } });

  await prisma.notification.updateMany({
    where: { userId: req.user.id, isRead: false },
    data: { isRead: true, readAt: new Date() }
  });

  res.status(200).json({ success: true, message: 'All notifications marked as read' });
};

export const deleteNotification = async (req: AuthRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ success: false, error: { message: 'Unauthorized' } });

  const id = req.params.id as string;
  const result = await prisma.notification.deleteMany({
    where: { id, userId: req.user.id }
  });

  if (result.count === 0) return res.status(404).json({ success: false, error: { message: 'Notification not found' } });
  res.status(200).json({ success: true, message: 'Notification deleted' });
};
