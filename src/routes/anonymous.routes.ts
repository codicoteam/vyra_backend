import { Router } from 'express';
import {
  publishAnonymous,
  getPendingAnonymous,
  approveAnonymous,
  rejectAnonymous
} from '../controllers/anonymous.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

router.post('/publish', publishAnonymous);
router.get('/pending', authenticate, getPendingAnonymous);
router.put('/:id/approve', authenticate, approveAnonymous);
router.put('/:id/reject', authenticate, rejectAnonymous);

export default router;
