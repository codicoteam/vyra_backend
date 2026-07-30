import { Router } from 'express';
import {
  getRecommendations,
  getFollowingRecommendations,
  getTrendingRecommendations
} from '../controllers/recommendations.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

router.get('/', getRecommendations);
router.get('/following', authenticate, getFollowingRecommendations);
router.get('/trending', getTrendingRecommendations);

export default router;
