import { Router } from 'express';
import { uploadMedia, getMediaById, deleteMedia } from '../controllers/media.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

router.post('/upload/image', authenticate, uploadMedia('image'));
router.post('/upload/video', authenticate, uploadMedia('video'));
router.post('/upload/document', authenticate, uploadMedia('document'));

router.get('/:id', getMediaById);
router.delete('/:id', authenticate, deleteMedia);

export default router;
