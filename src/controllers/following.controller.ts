import { Request, Response } from 'express';
import { prisma } from '../config/prisma';
import { AuthRequest } from '../middleware/auth';

export const followUser = async (req: AuthRequest, res: Response) => {
  const id = req.params.id as string;
  const user = req.user;
  if (!user) return res.status(401).json({ success: false, error: { message: 'Unauthorized' } });

  if (user.id === id) {
    return res.status(400).json({ success: false, error: { message: 'Cannot follow yourself' } });
  }

  const existing = await prisma.follow.findUnique({
    where: { followerId_followingId: { followerId: user.id, followingId: id } }
  });

  if (!existing) {
    await prisma.follow.create({
      data: { followerId: user.id, followingId: id }
    });

    await prisma.user.update({
      where: { id: user.id },
      data: { followingCount: { increment: 1 } }
    });

    await prisma.user.update({
      where: { id },
      data: { followersCount: { increment: 1 } }
    });
  }

  res.status(200).json({ success: true, message: 'Followed user' });
};

export const unfollowUser = async (req: AuthRequest, res: Response) => {
  const id = req.params.id as string;
  const user = req.user;
  if (!user) return res.status(401).json({ success: false, error: { message: 'Unauthorized' } });

  const existing = await prisma.follow.findUnique({
    where: { followerId_followingId: { followerId: user.id, followingId: id } }
  });

  if (existing) {
    await prisma.follow.delete({
      where: { id: existing.id }
    });

    await prisma.user.update({
      where: { id: user.id },
      data: { followingCount: { decrement: -1 } }
    });

    await prisma.user.update({
      where: { id },
      data: { followersCount: { decrement: -1 } }
    });
  }

  res.status(200).json({ success: true, message: 'Unfollowed user' });
};

export const getFollowers = async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const follows = await prisma.follow.findMany({
    where: { followingId: id },
    include: {
      follower: { select: { id: true, username: true, fullName: true, avatarUrl: true, bio: true } }
    }
  });

  const followers = follows.map((f: any) => f.follower);
  res.status(200).json({ success: true, data: followers });
};

export const getFollowing = async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const follows = await prisma.follow.findMany({
    where: { followerId: id },
    include: {
      following: { select: { id: true, username: true, fullName: true, avatarUrl: true, bio: true } }
    }
  });

  const following = follows.map((f: any) => f.following);
  res.status(200).json({ success: true, data: following });
};
