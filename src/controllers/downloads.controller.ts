import { Request, Response } from 'express';
import { prisma } from '../config/prisma';

export const downloadFile = async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const media = await prisma.media.findUnique({ where: { id } });
  if (!media) {
    return res.status(404).json({ success: false, error: { message: 'Document or file not found' } });
  }

  res.setHeader('Content-Type', media.mimeType || 'application/octet-stream');
  res.setHeader('Content-Disposition', `attachment; filename="${media.originalName || media.filename}"`);
  
  if (media.path) {
    return res.sendFile(media.path);
  }

  res.status(200).json({
    success: true,
    data: {
      downloadUrl: media.url,
      filename: media.originalName,
      mimeType: media.mimeType,
      size: media.size,
    }
  });
};
