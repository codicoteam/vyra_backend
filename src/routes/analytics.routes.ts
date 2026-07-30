import { Router } from 'express';
import {
  getDashboardAnalytics,
  getPostsAnalytics,
  getUsersAnalytics,
  getCategoriesAnalytics
} from '../controllers/analytics.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.get('/dashboard', getDashboardAnalytics);
router.get('/posts', getPostsAnalytics);
router.get('/users', getUsersAnalytics);
router.get('/categories', getCategoriesAnalytics);

export default router;
