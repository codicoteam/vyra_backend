import { Router } from 'express';
import {
  getMainFeed,
  getFollowingFeed,
  getTrendingFeed,
  getLatestFeed
} from '../controllers/feed.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

router.get('/', getMainFeed);
router.get('/following', authenticate, getFollowingFeed);
router.get('/trending', getTrendingFeed);
router.get('/latest', getLatestFeed);

export default router;
