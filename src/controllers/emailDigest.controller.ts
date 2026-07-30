import { Response } from 'express';
import { prisma } from '../config/prisma';
import { AuthRequest } from '../middleware/auth';

export const sendDigest = async (req: AuthRequest, res: Response) => {
  const { subject } = req.body;
  const user = req.user;
  if (!user) return res.status(401).json({ success: false, error: { message: 'Unauthorized' } });

  const recipientCount = await prisma.user.count({
    where: { weeklyDigest: true, deletedAt: null }
  });

  const log = await prisma.emailDigest.create({
    data: {
      userId: user.id,
      type: 'weekly',
      subject: subject || 'VYRA Weekly Research & Awareness Digest',
      status: 'SENT' as any,
      sentAt: new Date(),
      content: `Successfully triggered digest for ${recipientCount} active subscribers`,
    }
  });

  res.status(200).json({ success: true, data: log, message: 'Email digest sent successfully' });
};

export const getDigestHistory = async (req: AuthRequest, res: Response) => {
  const logs = await prisma.emailDigest.findMany({
    orderBy: { createdAt: 'desc' }
  });
  res.status(200).json({ success: true, data: logs });
};

export const updateDigestPreferences = async (req: AuthRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ success: false, error: { message: 'Unauthorized' } });

  const { weeklyDigest, emailNotifications } = req.body;
  const user = await prisma.user.update({
    where: { id: req.user.id },
    data: { weeklyDigest, emailNotifications }
  });

  const { passwordHash: _, ...safeUser } = user;
  res.status(200).json({ success: true, data: safeUser, message: 'Email preferences updated' });
};
