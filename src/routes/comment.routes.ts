import { Router } from 'express';
import {
  createComment,
  getComments,
  deleteComment,
  reportComment,
  toggleComments
} from '../controllers/comment.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

router.get('/posts/:id/comments', getComments);
router.post('/posts/:id/comments', authenticate, createComment);
router.put('/posts/:id/comments-toggle', authenticate, toggleComments);

router.delete('/comments/:id', authenticate, deleteComment);
router.post('/comments/:id/report', authenticate, reportComment);

export default router;
