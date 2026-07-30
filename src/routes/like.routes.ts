import { Router } from 'express';
import { likePost, unlikePost, getPostLikes } from '../controllers/like.controller';
import { authenticate } from '../middleware/auth';

const router = Router({ mergeParams: true });

router.post('/:id/like', authenticate, likePost);
router.delete('/:id/like', authenticate, unlikePost);
router.get('/:id/likes', getPostLikes);

export default router;
