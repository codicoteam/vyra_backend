import { Request, Response } from 'express';
import { prisma } from '../config/prisma';
import { AuthRequest } from '../middleware/auth';

export const uploadMedia = (type: 'image' | 'video' | 'document') => {
  return async (req: AuthRequest, res: Response) => {
    if (!req.user) return res.status(401).json({ success: false, error: { message: 'Unauthorized' } });

    const { url, filename, originalName, size, mimeType } = req.body;
    const mediaTypeEnum = type === 'image' ? 'IMAGE' : type === 'video' ? 'VIDEO' : 'DOCUMENT';

    const media = await prisma.media.create({
      data: {
        uploadedBy: req.user.id,
        filename: filename || `file-${Date.now()}`,
        originalName: originalName || filename || `upload-${type}`,
        mimeType: mimeType || (type === 'image' ? 'image/png' : type === 'video' ? 'video/mp4' : 'application/pdf'),
        mediaType: mediaTypeEnum as any,
        size: size || 1024,
        url: url || `https://picsum.photos/seed/${Date.now()}/800/600`,
      }
    });

    res.status(201).json({ success: true, data: media, message: `${type} uploaded successfully` });
  };
};

export const getMediaById = async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const media = await prisma.media.findUnique({ where: { id } });
  if (!media) return res.status(404).json({ success: false, error: { message: 'Media not found' } });
  res.status(200).json({ success: true, data: media });
};

export const deleteMedia = async (req: AuthRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ success: false, error: { message: 'Unauthorized' } });

  const id = req.params.id as string;
  const result = await prisma.media.deleteMany({
    where: { id, uploadedBy: req.user.id }
  });

  if (result.count === 0) return res.status(404).json({ success: false, error: { message: 'Media not found or unauthorized' } });
  res.status(200).json({ success: true, message: 'Media deleted successfully' });
};
