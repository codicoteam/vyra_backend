import { Request, Response } from 'express';
import { prisma } from '../config/prisma';
import { AuthRequest } from '../middleware/auth';

export const getAdminDashboard = async (req: Request, res: Response) => {
  const [totalUsers, totalPosts, totalReports, pendingReports, totalViews] = await Promise.all([
    prisma.user.count({ where: { deletedAt: null } }),
    prisma.post.count({ where: { deletedAt: null } }),
    prisma.report.count(),
    prisma.report.count({ where: { status: 'PENDING' as any } }),
    prisma.post.aggregate({ _sum: { viewCount: true } })
  ]);

  res.status(200).json({
    success: true,
    data: {
      totalUsers,
      totalPosts,
      totalReports,
      pendingReports,
      totalViews: totalViews._sum.viewCount || 0,
      systemHealth: 'Optimal',
    }
  });
};

export const getAdminUsers = async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;
  const skip = (page - 1) * limit;

  const users = await prisma.user.findMany({
    select: {
      id: true,
      email: true,
      username: true,
      fullName: true,
      role: true,
      isVerified: true,
      isBanned: true,
      banReason: true,
      createdAt: true,
    },
    orderBy: { createdAt: 'desc' },
    skip,
    take: limit
  });

  const total = await prisma.user.count();
  res.status(200).json({
    success: true,
    data: users,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) }
  });
};

export const updateUserRole = async (req: AuthRequest, res: Response) => {
  const id = req.params.id as string;
  const { role } = req.body;

  if (role === 'ADMIN') {
    return res.status(403).json({
      success: false,
      error: { code: 'CANNOT_CREATE_ADMIN', message: 'Creating additional Admin accounts is disabled. Only initial setup creates the Admin.' }
    });
  }

  if (!['USER', 'AUTHOR', 'EDITOR'].includes(role)) {
    return res.status(400).json({ success: false, error: { message: 'Invalid role specified' } });
  }

  const user = await prisma.user.update({
    where: { id },
    data: { role: role as any }
  });

  const { passwordHash: _, ...safeUser } = user;
  res.status(200).json({ success: true, data: safeUser, message: `User role updated to ${role}` });
};

export const suspendUser = async (req: AuthRequest, res: Response) => {
  const id = req.params.id as string;
  const { reason } = req.body;
  const user = await prisma.user.update({
    where: { id },
    data: { isBanned: true, banReason: reason || 'Suspended by Administrator', bannedAt: new Date() }
  });

  const { passwordHash: _, ...safeUser } = user;
  res.status(200).json({ success: true, data: safeUser, message: 'User suspended successfully' });
};

export const activateUser = async (req: AuthRequest, res: Response) => {
  const id = req.params.id as string;
  const user = await prisma.user.update({
    where: { id },
    data: { isBanned: false, banReason: null, bannedAt: null }
  });

  const { passwordHash: _, ...safeUser } = user;
  res.status(200).json({ success: true, data: safeUser, message: 'User activated successfully' });
};

export const deleteUserByAdmin = async (req: AuthRequest, res: Response) => {
  const id = req.params.id as string;
  await prisma.user.update({
    where: { id },
    data: { deletedAt: new Date() }
  });
  res.status(200).json({ success: true, message: 'User account deleted by Admin' });
};

export const getAdminPosts = async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;
  const skip = (page - 1) * limit;

  const posts = await prisma.post.findMany({
    include: {
      author: { select: { id: true, username: true, fullName: true, email: true } }
    },
    orderBy: { createdAt: 'desc' },
    skip,
    take: limit
  });

  const total = await prisma.post.count();
  res.status(200).json({
    success: true,
    data: posts,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) }
  });
};

export const deletePostByAdmin = async (req: AuthRequest, res: Response) => {
  const id = req.params.id as string;
  await prisma.post.update({
    where: { id },
    data: { deletedAt: new Date() }
  });
  res.status(200).json({ success: true, message: 'Post deleted by Admin' });
};

export const getAdminReports = async (req: Request, res: Response) => {
  const reports = await prisma.report.findMany({
    include: {
      reporter: { select: { id: true, username: true, fullName: true, email: true } }
    },
    orderBy: { createdAt: 'desc' }
  });

  res.status(200).json({ success: true, data: reports });
};

export const getAdminStatistics = async (req: Request, res: Response) => {
  const [usersCount, postsCount, reportsCount, publishedPostsCount] = await Promise.all([
    prisma.user.count(),
    prisma.post.count(),
    prisma.report.count(),
    prisma.post.count({ where: { status: 'PUBLISHED' as any } }),
  ]);

  res.status(200).json({
    success: true,
    data: {
      usersCount,
      postsCount,
      reportsCount,
      publishedPostsCount,
      serverUptime: process.uptime(),
      memoryUsage: process.memoryUsage(),
    }
  });
};

export const getStats = getAdminStatistics;
