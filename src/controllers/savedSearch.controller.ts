import { Response } from 'express';
import { prisma } from '../config/prisma';
import { AuthRequest } from '../middleware/auth';

export const getSavedSearches = async (req: AuthRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ success: false, error: { message: 'Unauthorized' } });

  const searches = await prisma.savedSearch.findMany({
    where: { userId: req.user.id },
    orderBy: { createdAt: 'desc' }
  });
  res.status(200).json({ success: true, data: searches });
};

export const createSavedSearch = async (req: AuthRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ success: false, error: { message: 'Unauthorized' } });

  const { query, filters } = req.body;
  const savedSearch = await prisma.savedSearch.create({
    data: {
      userId: req.user.id,
      query,
      filters,
    }
  });

  res.status(201).json({ success: true, data: savedSearch, message: 'Search query saved' });
};

export const deleteSavedSearch = async (req: AuthRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ success: false, error: { message: 'Unauthorized' } });

  const id = req.params.id as string;
  const result = await prisma.savedSearch.deleteMany({
    where: { id, userId: req.user.id }
  });

  if (result.count === 0) return res.status(404).json({ success: false, error: { message: 'Saved search not found' } });
  res.status(200).json({ success: true, message: 'Saved search deleted' });
};
