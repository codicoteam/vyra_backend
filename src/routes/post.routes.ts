import { Router } from 'express';
import {
  createPost,
  getPosts,
  getPostById,
  getPostBySlug,
  updatePost,
  deletePost,
  publishPost,
  archivePost,
  duplicatePost,
  featurePost
} from '../controllers/post.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

router.post('/', authenticate, createPost);
router.get('/', getPosts);
router.get('/slug/:slug', getPostBySlug);
router.get('/:id', getPostById);
router.put('/:id', authenticate, updatePost);
router.delete('/:id', authenticate, deletePost);

router.post('/:id/publish', authenticate, publishPost);
router.post('/:id/archive', authenticate, archivePost);
router.post('/:id/duplicate', authenticate, duplicatePost);
router.post('/:id/feature', authenticate, featurePost);

export default router;
