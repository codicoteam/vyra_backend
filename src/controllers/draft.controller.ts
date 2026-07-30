import { Response } from 'express';
import { prisma } from '../config/prisma';
import { AuthRequest } from '../middleware/auth';

export const createDraft = async (req: AuthRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ success: false, error: { message: 'Unauthorized' } });
  
  const draft = await prisma.draft.create({
    data: {
      ...req.body,
      userId: req.user.id,
    }
  });

  res.status(201).json({ success: true, data: draft, message: 'Draft created' });
};

export const getDrafts = async (req: AuthRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ success: false, error: { message: 'Unauthorized' } });

  const drafts = await prisma.draft.findMany({
    where: { userId: req.user.id },
    orderBy: { updatedAt: 'desc' }
  });

  res.status(200).json({ success: true, data: drafts });
};

export const getDraftById = async (req: AuthRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ success: false, error: { message: 'Unauthorized' } });

  const id = req.params.id as string;
  const draft = await prisma.draft.findFirst({
    where: { id, userId: req.user.id }
  });

  if (!draft) return res.status(404).json({ success: false, error: { message: 'Draft not found' } });
  res.status(200).json({ success: true, data: draft });
};

export const updateDraft = async (req: AuthRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ success: false, error: { message: 'Unauthorized' } });

  const id = req.params.id as string;
  const draft = await prisma.draft.updateMany({
    where: { id, userId: req.user.id },
    data: req.body
  });

  if (draft.count === 0) return res.status(404).json({ success: false, error: { message: 'Draft not found' } });
  res.status(200).json({ success: true, message: 'Draft updated' });
};

export const deleteDraft = async (req: AuthRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ success: false, error: { message: 'Unauthorized' } });

  const id = req.params.id as string;
  const result = await prisma.draft.deleteMany({
    where: { id, userId: req.user.id }
  });

  if (result.count === 0) return res.status(404).json({ success: false, error: { message: 'Draft not found' } });
  res.status(200).json({ success: true, message: 'Draft deleted' });
};
