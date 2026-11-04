import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import {
  uploadMedia,
  uploadImageFile,
  getMediaById,
  deleteMedia,
} from '../controllers/media.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

const uploadDir = path.join(process.cwd(), 'uploads');
fs.mkdirSync(uploadDir, { recursive: true });

const upload = multer({
  storage: multer.diskStorage({
    destination: uploadDir,
    filename: (_req, file, cb) =>
      cb(
        null,
        `${Date.now()}-${Math.round(Math.random() * 1e6)}${path.extname(file.originalname).toLowerCase()}`,
      ),
  }),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => cb(null, file.mimetype.startsWith('image/')),
});
export const uploadImageFile = async (req: AuthRequest, res: Response) => {
  if (!req.user)
    return res
      .status(401)
      .json({ success: false, error: { message: 'Unauthorized' } });
  if (!req.file)
    return res
      .status(400)
      .json({ success: false, error: { message: 'No image uploaded' } });

  const form = new FormData();
  form.append('image', req.file.buffer.toString('base64'));

  const r = await fetch(
    `https://api.imgbb.com/1/upload?key=${process.env.IMGBB_API_KEY}`,
    {
      method: 'POST',
      body: form,
    },
  );
  const j: any = await r.json();

  if (!r.ok || !j.success) {
    return res.status(502).json({
      success: false,
      error: { message: j?.error?.message || 'Image host upload failed' },
    });
  }

  const media = await prisma.media.create({
    data: {
      uploadedBy: req.user.id,
      filename: j.data.id,
      originalName: req.file.originalname,
      mimeType: req.file.mimetype,
      mediaType: 'IMAGE' as any,
      size: req.file.size,
      url: j.data.url,
    },
  });

  res.status(201).json({ success: true, data: media });
};

router.post(
  '/upload/image-file',
  authenticate,
  upload.single('file'),
  uploadImageFile,
);
router.post('/upload/image', authenticate, uploadMedia('image'));
router.post('/upload/video', authenticate, uploadMedia('video'));
router.post('/upload/document', authenticate, uploadMedia('document'));

router.get('/:id', getMediaById);
router.delete('/:id', authenticate, deleteMedia);

export default router;
