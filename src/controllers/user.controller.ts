import { Request, Response } from 'express';
import { prisma } from '../config/prisma';
import { AuthRequest } from '../middleware/auth';

export const getUsers = async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;
  const skip = (page - 1) * limit;

  const users = await prisma.user.findMany({
    where: { deletedAt: null },
    select: {
      id: true,
      email: true,
      username: true,
      fullName: true,
      bio: true,
      avatarUrl: true,
      bannerUrl: true,
      website: true,
      location: true,
      twitterHandle: true,
      role: true,
      isVerified: true,
      followersCount: true,
      followingCount: true,
      storiesCount: true,
      createdAt: true
    },
    orderBy: { createdAt: 'desc' },
    skip,
    take: limit
  });

  const total = await prisma.user.count({ where: { deletedAt: null } });

  res.status(200).json({
    success: true,
    data: users,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) }
  });
};

export const getUserById = async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const user = await prisma.user.findFirst({
    where: { id, deletedAt: null },
    select: {
      id: true,
      email: true,
      username: true,
      fullName: true,
      bio: true,
      avatarUrl: true,
      bannerUrl: true,
      website: true,
      location: true,
      twitterHandle: true,
      role: true,
      isVerified: true,
      followersCount: true,
      followingCount: true,
      storiesCount: true,
      createdAt: true
    }
  });

  if (!user) {
    return res.status(404).json({ success: false, error: { message: 'User not found' } });
  }

  res.status(200).json({ success: true, data: user });
};

export const getUserByUsername = async (req: Request, res: Response) => {
  const username = req.params.username as string;
  const user = await prisma.user.findFirst({
    where: { username, deletedAt: null },
    select: {
      id: true,
      email: true,
      username: true,
      fullName: true,
      bio: true,
      avatarUrl: true,
      bannerUrl: true,
      website: true,
      location: true,
      twitterHandle: true,
      role: true,
      isVerified: true,
      followersCount: true,
      followingCount: true,
      storiesCount: true,
      createdAt: true
    }
  });

  if (!user) {
    return res.status(404).json({ success: false, error: { message: 'User not found' } });
  }

  res.status(200).json({ success: true, data: user });
};

export const updateProfile = async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ success: false, error: { message: 'Unauthorized' } });
  }

  const { fullName, bio, website, location, twitterHandle } = req.body;
  const user = await prisma.user.update({
    where: { id: req.user.id },
    data: { fullName, bio, website, location, twitterHandle }
  });

  const { passwordHash: _, ...safeUser } = user;
  res.status(200).json({ success: true, data: safeUser, message: 'Profile updated successfully' });
};

export const updateAvatar = async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ success: false, error: { message: 'Unauthorized' } });
  }

  const { avatarUrl } = req.body;
  const user = await prisma.user.update({
    where: { id: req.user.id },
    data: { avatarUrl }
  });

  const { passwordHash: _, ...safeUser } = user;
  res.status(200).json({ success: true, data: safeUser, message: 'Avatar updated successfully' });
};

export const deleteAccount = async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ success: false, error: { message: 'Unauthorized' } });
  }

  await prisma.user.update({
    where: { id: req.user.id },
    data: { deletedAt: new Date() }
  });

  res.status(200).json({ success: true, message: 'Account deleted successfully' });
};
