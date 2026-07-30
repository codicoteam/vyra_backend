import { Request, Response } from 'express';
import { prisma } from '../config/prisma';
import { AuthRequest } from '../middleware/auth';

export const getTags = async (req: Request, res: Response) => {
  const { search } = req.query;
  const whereClause: any = {};
  if (search) {
    whereClause.name = { contains: search as string, mode: 'insensitive' };
  }

  const tags = await prisma.tag.findMany({
    where: whereClause,
    orderBy: [{ postCount: 'desc' }, { name: 'asc' }]
  });

  res.status(200).json({ success: true, data: tags });
};

export const createTag = async (req: AuthRequest, res: Response) => {
  const { name, description } = req.body;
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  const tag = await prisma.tag.create({
    data: { name, slug, description }
  });
  res.status(201).json({ success: true, data: tag, message: 'Tag created' });
};

export const updateTag = async (req: AuthRequest, res: Response) => {
  const id = req.params.id as string;
  const tag = await prisma.tag.update({
    where: { id },
    data: req.body
  });
  res.status(200).json({ success: true, data: tag, message: 'Tag updated' });
};

export const deleteTag = async (req: AuthRequest, res: Response) => {
  const id = req.params.id as string;
  await prisma.tag.delete({ where: { id } });
  res.status(200).json({ success: true, message: 'Tag deleted' });
};
