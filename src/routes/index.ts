import { Router } from 'express';
import authRoutes from './auth.routes';
import userRoutes from './user.routes';
import postRoutes from './post.routes';
import storyRoutes from './story.routes';
import draftRoutes from './draft.routes';
import categoryRoutes from './category.routes';
import tagRoutes from './tag.routes';
import likeRoutes from './like.routes';
import bookmarkRoutes from './bookmark.routes';
import followingRoutes from './following.routes';
import notificationRoutes from './notification.routes';
import searchRoutes from './search.routes';
import mediaRoutes from './media.routes';
import anonymousRoutes from './anonymous.routes';
import reportRoutes from './report.routes';
import emailDigestRoutes from './emailDigest.routes';
import analyticsRoutes from './analytics.routes';
import adminRoutes from './admin.routes';
import recommendationsRoutes from './recommendations.routes';
import historyRoutes from './history.routes';
import downloadsRoutes from './downloads.routes';
import homeRoutes from './home.routes';
import feedRoutes from './feed.routes';
import savedSearchRoutes from './savedSearch.routes';
import systemRoutes from './system.routes';
import commentRoutes from './comment.routes';

const router = Router();

// 1. Authentication API
router.use('/auth', authRoutes);

// 2. Users API & 9. Following API
router.use('/users', followingRoutes);
router.use('/users', userRoutes);

// 3. Posts API & 7. Likes API & Comments API
router.use('/', commentRoutes);
router.use('/posts', likeRoutes);
router.use('/posts', postRoutes);
router.use('/stories', storyRoutes);

// 4. Drafts API
router.use('/drafts', draftRoutes);

// 5. Categories API
router.use('/categories', categoryRoutes);

// 6. Tags API
router.use('/tags', tagRoutes);

// 8. Bookmarks API
router.use('/bookmarks', bookmarkRoutes);

// 10. Notifications API
router.use('/notifications', notificationRoutes);

// 11. Search API
router.use('/search', searchRoutes);

// 12. Media API
router.use('/media', mediaRoutes);

// 13. Anonymous Publishing API
router.use('/anonymous', anonymousRoutes);

// 14. Reports API
router.use('/reports', reportRoutes);

// 15. Email Digest API
router.use('/email-digest', emailDigestRoutes);

// 16. Analytics API
router.use('/analytics', analyticsRoutes);

// 17. Admin API
router.use('/admin', adminRoutes);

// 18. Recommendations API
router.use('/recommendations', recommendationsRoutes);

// 19. Reading History API
router.use('/history', historyRoutes);

// 20. File Downloads API
router.use('/downloads', downloadsRoutes);

// 21. Homepage API
router.use('/home', homeRoutes);

// 22. Feed API
router.use('/feed', feedRoutes);

// 23. Saved Searches API
router.use('/saved-searches', savedSearchRoutes);

// 24. System API
router.use('/', systemRoutes);

export default router;
