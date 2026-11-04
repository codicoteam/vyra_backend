"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_routes_1 = __importDefault(require("./auth.routes"));
const user_routes_1 = __importDefault(require("./user.routes"));
const post_routes_1 = __importDefault(require("./post.routes"));
const story_routes_1 = __importDefault(require("./story.routes"));
const draft_routes_1 = __importDefault(require("./draft.routes"));
const category_routes_1 = __importDefault(require("./category.routes"));
const tag_routes_1 = __importDefault(require("./tag.routes"));
const like_routes_1 = __importDefault(require("./like.routes"));
const bookmark_routes_1 = __importDefault(require("./bookmark.routes"));
const following_routes_1 = __importDefault(require("./following.routes"));
const notification_routes_1 = __importDefault(require("./notification.routes"));
const search_routes_1 = __importDefault(require("./search.routes"));
const media_routes_1 = __importDefault(require("./media.routes"));
const anonymous_routes_1 = __importDefault(require("./anonymous.routes"));
const report_routes_1 = __importDefault(require("./report.routes"));
const emailDigest_routes_1 = __importDefault(require("./emailDigest.routes"));
const analytics_routes_1 = __importDefault(require("./analytics.routes"));
const admin_routes_1 = __importDefault(require("./admin.routes"));
const recommendations_routes_1 = __importDefault(require("./recommendations.routes"));
const history_routes_1 = __importDefault(require("./history.routes"));
const downloads_routes_1 = __importDefault(require("./downloads.routes"));
const home_routes_1 = __importDefault(require("./home.routes"));
const feed_routes_1 = __importDefault(require("./feed.routes"));
const savedSearch_routes_1 = __importDefault(require("./savedSearch.routes"));
const system_routes_1 = __importDefault(require("./system.routes"));
const comment_routes_1 = __importDefault(require("./comment.routes"));
const router = (0, express_1.Router)();
// 1. Authentication API
router.use('/auth', auth_routes_1.default);
// 2. Users API & 9. Following API
router.use('/users', following_routes_1.default);
router.use('/users', user_routes_1.default);
// 3. Posts API & 7. Likes API & Comments API
router.use('/', comment_routes_1.default);
router.use('/posts', like_routes_1.default);
router.use('/posts', post_routes_1.default);
router.use('/stories', story_routes_1.default);
// 4. Drafts API
router.use('/drafts', draft_routes_1.default);
// 5. Categories API
router.use('/categories', category_routes_1.default);
// 6. Tags API
router.use('/tags', tag_routes_1.default);
// 8. Bookmarks API
router.use('/bookmarks', bookmark_routes_1.default);
// 10. Notifications API
router.use('/notifications', notification_routes_1.default);
// 11. Search API
router.use('/search', search_routes_1.default);
// 12. Media API
router.use('/media', media_routes_1.default);
// 13. Anonymous Publishing API
router.use('/anonymous', anonymous_routes_1.default);
// 14. Reports API
router.use('/reports', report_routes_1.default);
// 15. Email Digest API
router.use('/email-digest', emailDigest_routes_1.default);
// 16. Analytics API
router.use('/analytics', analytics_routes_1.default);
// 17. Admin API
router.use('/admin', admin_routes_1.default);
// 18. Recommendations API
router.use('/recommendations', recommendations_routes_1.default);
// 19. Reading History API
router.use('/history', history_routes_1.default);
// 20. File Downloads API
router.use('/downloads', downloads_routes_1.default);
// 21. Homepage API
router.use('/home', home_routes_1.default);
// 22. Feed API
router.use('/feed', feed_routes_1.default);
// 23. Saved Searches API
router.use('/saved-searches', savedSearch_routes_1.default);
// 24. System API
router.use('/', system_routes_1.default);
exports.default = router;
