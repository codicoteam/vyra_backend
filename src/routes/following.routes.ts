import { Router } from 'express';
import { followUser, unfollowUser, getFollowers, getFollowing } from '../controllers/following.controller';
import { authenticate } from '../middleware/auth';

const router = Router({ mergeParams: true });

router.post('/:id/follow', authenticate, followUser);
router.delete('/:id/unfollow', authenticate, unfollowUser);
router.get('/:id/followers', getFollowers);
router.get('/:id/following', getFollowing);

export default router;
