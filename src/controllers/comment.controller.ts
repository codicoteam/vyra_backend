import { Request, Response } from 'express';
import { prisma } from '../config/prisma';
import { AuthRequest } from '../middleware/auth';

export const createComment = async (req: AuthRequest, res: Response) => {
  const postId = req.params.id as string;
  const { content, parentId } = req.body;
  const user = req.user;

  if (!user) return res.status(401).json({ success: false, error: { message: 'Unauthorized' } });

  if (!content || !content.trim()) {
    return res.status(400).json({ success: false, error: { message: 'Comment content is required' } });
  }

  const post = await prisma.post.findUnique({ where: { id: postId } });
  if (!post) {
    return res.status(404).json({ success: false, error: { message: 'Post not found' } });
  }

  if (post.allowComments === false) {
    return res.status(403).json({ success: false, error: { message: 'Comments are disabled for this post.' } });
  }

  const comment = await prisma.comment.create({
    data: {
      postId,
      userId: user.id,
      content: content.trim(),
      parentId: parentId || null
    },
    include: {
      user: { select: { id: true, username: true, fullName: true, avatarUrl: true } }
    }
  });

  await prisma.post.update({
    where: { id: postId },
    data: { commentCount: { increment: 1 } }
  });

  res.status(201).json({ success: true, data: comment, message: 'Comment added successfully' });
};

export const getComments = async (req: Request, res: Response) => {
  const postId = req.params.id as string;
  const comments = await prisma.comment.findMany({
    where: { postId, deletedAt: null },
    include: {
      user: { select: { id: true, username: true, fullName: true, avatarUrl: true } },
      replies: {
        where: { deletedAt: null },
        include: {
          user: { select: { id: true, username: true, fullName: true, avatarUrl: true } }
        },
        orderBy: { createdAt: 'asc' }
      }
    },
    orderBy: { createdAt: 'desc' }
  });

  const rootComments = comments.filter(c => !c.parentId);

  res.status(200).json({ success: true, data: rootComments });
};

export const deleteComment = async (req: AuthRequest, res: Response) => {
  const id = req.params.id as string;
  const user = req.user;
  if (!user) return res.status(401).json({ success: false, error: { message: 'Unauthorized' } });

  const comment = await prisma.comment.findUnique({ where: { id }, include: { post: true } });
  if (!comment) return res.status(404).json({ success: false, error: { message: 'Comment not found' } });

  const isOwner = comment.userId === user.id;
  const isPostOwner = comment.post.userId === user.id;
  const isStaff = user.role === 'ADMIN' || user.role === 'EDITOR';

  if (!isOwner && !isPostOwner && !isStaff) {
    return res.status(403).json({ success: false, error: { message: 'Forbidden' } });
  }

  await prisma.comment.update({
    where: { id },
    data: { deletedAt: new Date() }
  });

  await prisma.post.update({
    where: { id: comment.postId },
    data: { commentCount: { decrement: 1 } }
  });

  res.status(200).json({ success: true, message: 'Comment deleted' });
};

export const reportComment = async (req: AuthRequest, res: Response) => {
  const id = req.params.id as string;
  const { reason, details } = req.body;
  const user = req.user;

  const comment = await prisma.comment.findUnique({ where: { id } });
  if (!comment) return res.status(404).json({ success: false, error: { message: 'Comment not found' } });

  await prisma.comment.update({
    where: { id },
    data: { isReported: true }
  });

  const report = await prisma.report.create({
    data: {
      reporterId: user ? user.id : null,
      targetType: 'comment',
      targetId: id,
      reason: reason || 'Inappropriate content',
      details: details || `Comment content: ${comment.content}`
    }
  });

  res.status(201).json({ success: true, data: report, message: 'Comment reported successfully' });
};

export const toggleComments = async (req: AuthRequest, res: Response) => {
  const id = req.params.id as string;
  const user = req.user;
  if (!user) return res.status(401).json({ success: false, error: { message: 'Unauthorized' } });

  const post = await prisma.post.findUnique({ where: { id } });
  if (!post) return res.status(404).json({ success: false, error: { message: 'Post not found' } });

  if (post.userId !== user.id && user.role !== 'ADMIN') {
    return res.status(403).json({ success: false, error: { message: 'Forbidden' } });
  }

  const updated = await prisma.post.update({
    where: { id },
    data: { allowComments: !post.allowComments }
  });

  res.status(200).json({
    success: true,
    data: updated,
    message: `Comments ${updated.allowComments ? 'enabled' : 'disabled'} for this post.`
  });
};
