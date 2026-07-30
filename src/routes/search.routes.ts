import { Router } from 'express';
import {
  unifiedSearch,
  searchPosts,
  searchUsers,
  searchCategories,
  searchTags
} from '../controllers/search.controller';

const router = Router();

router.get('/', unifiedSearch);
router.get('/posts', searchPosts);
router.get('/users', searchUsers);
router.get('/categories', searchCategories);
router.get('/tags', searchTags);

export default router;
