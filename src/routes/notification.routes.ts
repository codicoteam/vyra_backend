import { Router } from 'express';
import {
  getNotifications,
  getUnreadNotifications,
  markRead,
  markAllRead,
  deleteNotification
} from '../controllers/notification.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.get('/', getNotifications);
router.get('/unread', getUnreadNotifications);
router.put('/read-all', markAllRead);
router.put('/:id/read', markRead);
router.delete('/:id', deleteNotification);

export default router;
