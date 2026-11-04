"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.allPaths = void 0;
exports.allPaths = {
    // 1. Authentication API
    '/auth/register': {
        post: {
            tags: ['1. Authentication'],
            summary: 'Register a new user',
            requestBody: {
                required: true,
                content: { 'application/json': { schema: { type: 'object', properties: { email: { type: 'string' }, username: { type: 'string' }, password: { type: 'string' }, fullName: { type: 'string' } }, required: ['email', 'username', 'password', 'fullName'] } } }
            },
            responses: { 201: { description: 'Registration successful' } }
        }
    },
    '/auth/login': {
        post: {
            tags: ['1. Authentication'],
            summary: 'User login',
            requestBody: {
                required: true,
                content: { 'application/json': { schema: { type: 'object', properties: { email: { type: 'string' }, password: { type: 'string' } }, required: ['email', 'password'] } } }
            },
            responses: { 200: { description: 'Login successful' } }
        }
    },
    '/auth/logout': {
        post: {
            tags: ['1. Authentication'],
            summary: 'Logout user',
            security: [{ bearerAuth: [] }],
            responses: { 200: { description: 'Logout successful' } }
        }
    },
    '/auth/refresh-token': {
        post: {
            tags: ['1. Authentication'],
            summary: 'Refresh access token',
            requestBody: {
                required: true,
                content: { 'application/json': { schema: { type: 'object', properties: { refreshToken: { type: 'string' } }, required: ['refreshToken'] } } }
            },
            responses: { 200: { description: 'Token refreshed' } }
        }
    },
    '/auth/forgot-password': {
        post: {
            tags: ['1. Authentication'],
            summary: 'Request password reset',
            requestBody: {
                required: true,
                content: { 'application/json': { schema: { type: 'object', properties: { email: { type: 'string' } }, required: ['email'] } } }
            },
            responses: { 200: { description: 'Reset instructions sent' } }
        }
    },
    '/auth/reset-password': {
        post: {
            tags: ['1. Authentication'],
            summary: 'Reset password with token',
            requestBody: {
                required: true,
                content: { 'application/json': { schema: { type: 'object', properties: { token: { type: 'string' }, newPassword: { type: 'string' } }, required: ['token', 'newPassword'] } } }
            },
            responses: { 200: { description: 'Password reset successfully' } }
        }
    },
    '/auth/verify-email': {
        post: {
            tags: ['1. Authentication'],
            summary: 'Verify user email',
            requestBody: {
                required: true,
                content: { 'application/json': { schema: { type: 'object', properties: { token: { type: 'string' } }, required: ['token'] } } }
            },
            responses: { 200: { description: 'Email verified' } }
        }
    },
    '/auth/me': {
        get: {
            tags: ['1. Authentication'],
            summary: 'Get currently authenticated user',
            security: [{ bearerAuth: [] }],
            responses: { 200: { description: 'User profile retrieved' } }
        }
    },
    '/auth/change-password': {
        put: {
            tags: ['1. Authentication'],
            summary: 'Change password',
            security: [{ bearerAuth: [] }],
            requestBody: {
                required: true,
                content: { 'application/json': { schema: { type: 'object', properties: { currentPassword: { type: 'string' }, newPassword: { type: 'string' } }, required: ['currentPassword', 'newPassword'] } } }
            },
            responses: { 200: { description: 'Password changed successfully' } }
        }
    },
    // 2. Users API
    '/users': {
        get: {
            tags: ['2. Users'],
            summary: 'List users',
            parameters: [{ name: 'page', in: 'query', schema: { type: 'integer' } }, { name: 'limit', in: 'query', schema: { type: 'integer' } }],
            responses: { 200: { description: 'Users list' } }
        }
    },
    '/users/profile': {
        put: {
            tags: ['2. Users'],
            summary: 'Update current user profile',
            security: [{ bearerAuth: [] }],
            requestBody: { content: { 'application/json': { schema: { type: 'object', properties: { fullName: { type: 'string' }, bio: { type: 'string' }, website: { type: 'string' }, location: { type: 'string' }, twitterHandle: { type: 'string' } } } } } },
            responses: { 200: { description: 'Profile updated' } }
        }
    },
    '/users/avatar': {
        put: {
            tags: ['2. Users'],
            summary: 'Update current user avatar',
            security: [{ bearerAuth: [] }],
            requestBody: { content: { 'application/json': { schema: { type: 'object', properties: { avatarUrl: { type: 'string' } }, required: ['avatarUrl'] } } } },
            responses: { 200: { description: 'Avatar updated' } }
        }
    },
    '/users/account': {
        delete: {
            tags: ['2. Users'],
            summary: 'Delete user account',
            security: [{ bearerAuth: [] }],
            responses: { 200: { description: 'Account deleted' } }
        }
    },
    '/users/username/{username}': {
        get: {
            tags: ['2. Users'],
            summary: 'Get user by username',
            parameters: [{ name: 'username', in: 'path', required: true, schema: { type: 'string' } }],
            responses: { 200: { description: 'User detail' } }
        }
    },
    '/users/{id}': {
        get: {
            tags: ['2. Users'],
            summary: 'Get user by ID',
            parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
            responses: { 200: { description: 'User detail' } }
        }
    },
    // 3. Posts API
    '/posts': {
        post: {
            tags: ['3. Posts'],
            summary: 'Create a new post',
            security: [{ bearerAuth: [] }],
            requestBody: { content: { 'application/json': { schema: { type: 'object', properties: { title: { type: 'string' }, excerpt: { type: 'string' }, content: { type: 'string' }, coverImage: { type: 'string' }, category: { type: 'string' }, tags: { type: 'array', items: { type: 'string' } }, isAnonymous: { type: 'boolean' }, isResearch: { type: 'boolean' }, isCampaign: { type: 'boolean' } }, required: ['title', 'content'] } } } },
            responses: { 201: { description: 'Post created' } }
        },
        get: {
            tags: ['3. Posts'],
            summary: 'List posts',
            parameters: [
                { name: 'category', in: 'query', schema: { type: 'string' } },
                { name: 'tag', in: 'query', schema: { type: 'string' } },
                { name: 'search', in: 'query', schema: { type: 'string' } },
                { name: 'page', in: 'query', schema: { type: 'integer' } },
                { name: 'limit', in: 'query', schema: { type: 'integer' } },
            ],
            responses: { 200: { description: 'Posts list' } }
        }
    },
    '/posts/slug/{slug}': {
        get: {
            tags: ['3. Posts'],
            summary: 'Get post by slug',
            parameters: [{ name: 'slug', in: 'path', required: true, schema: { type: 'string' } }],
            responses: { 200: { description: 'Post detail' } }
        }
    },
    '/posts/{id}': {
        get: {
            tags: ['3. Posts'],
            summary: 'Get post by ID',
            parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
            responses: { 200: { description: 'Post detail' } }
        },
        put: {
            tags: ['3. Posts'],
            summary: 'Update post',
            security: [{ bearerAuth: [] }],
            parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
            requestBody: { content: { 'application/json': { schema: { type: 'object' } } } },
            responses: { 200: { description: 'Post updated' } }
        },
        delete: {
            tags: ['3. Posts'],
            summary: 'Delete post',
            security: [{ bearerAuth: [] }],
            parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
            responses: { 200: { description: 'Post deleted' } }
        }
    },
    '/posts/{id}/publish': {
        post: {
            tags: ['3. Posts'],
            summary: 'Publish a post',
            security: [{ bearerAuth: [] }],
            parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
            responses: { 200: { description: 'Post published' } }
        }
    },
    '/posts/{id}/archive': {
        post: {
            tags: ['3. Posts'],
            summary: 'Archive a post',
            security: [{ bearerAuth: [] }],
            parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
            responses: { 200: { description: 'Post archived' } }
        }
    },
    '/posts/{id}/duplicate': {
        post: {
            tags: ['3. Posts'],
            summary: 'Duplicate a post',
            security: [{ bearerAuth: [] }],
            parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
            responses: { 201: { description: 'Post duplicated' } }
        }
    },
    '/posts/{id}/feature': {
        post: {
            tags: ['3. Posts'],
            summary: 'Toggle feature post',
            security: [{ bearerAuth: [] }],
            parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
            responses: { 200: { description: 'Post feature toggled' } }
        }
    },
    // 4. Drafts API
    '/drafts': {
        post: {
            tags: ['4. Drafts'],
            summary: 'Create draft',
            security: [{ bearerAuth: [] }],
            requestBody: { content: { 'application/json': { schema: { type: 'object', properties: { title: { type: 'string' }, content: { type: 'string' } } } } } },
            responses: { 201: { description: 'Draft created' } }
        },
        get: {
            tags: ['4. Drafts'],
            summary: 'Get user drafts',
            security: [{ bearerAuth: [] }],
            responses: { 200: { description: 'User drafts' } }
        }
    },
    '/drafts/{id}': {
        get: {
            tags: ['4. Drafts'],
            summary: 'Get draft by ID',
            security: [{ bearerAuth: [] }],
            parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
            responses: { 200: { description: 'Draft detail' } }
        },
        put: {
            tags: ['4. Drafts'],
            summary: 'Update draft',
            security: [{ bearerAuth: [] }],
            parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
            requestBody: { content: { 'application/json': { schema: { type: 'object' } } } },
            responses: { 200: { description: 'Draft updated' } }
        },
        delete: {
            tags: ['4. Drafts'],
            summary: 'Delete draft',
            security: [{ bearerAuth: [] }],
            parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
            responses: { 200: { description: 'Draft deleted' } }
        }
    },
    // 5. Categories API
    '/categories': {
        get: {
            tags: ['5. Categories'],
            summary: 'List categories',
            responses: { 200: { description: 'Categories list' } }
        },
        post: {
            tags: ['5. Categories'],
            summary: 'Create category',
            security: [{ bearerAuth: [] }],
            requestBody: { content: { 'application/json': { schema: { type: 'object', properties: { name: { type: 'string' }, description: { type: 'string' }, icon: { type: 'string' }, color: { type: 'string' } }, required: ['name'] } } } },
            responses: { 201: { description: 'Category created' } }
        }
    },
    '/categories/{id}': {
        put: {
            tags: ['5. Categories'],
            summary: 'Update category',
            security: [{ bearerAuth: [] }],
            parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
            requestBody: { content: { 'application/json': { schema: { type: 'object' } } } },
            responses: { 200: { description: 'Category updated' } }
        },
        delete: {
            tags: ['5. Categories'],
            summary: 'Delete category',
            security: [{ bearerAuth: [] }],
            parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
            responses: { 200: { description: 'Category deleted' } }
        }
    },
    // 6. Tags API
    '/tags': {
        get: {
            tags: ['6. Tags'],
            summary: 'List tags',
            parameters: [{ name: 'search', in: 'query', schema: { type: 'string' } }],
            responses: { 200: { description: 'Tags list' } }
        },
        post: {
            tags: ['6. Tags'],
            summary: 'Create tag',
            security: [{ bearerAuth: [] }],
            requestBody: { content: { 'application/json': { schema: { type: 'object', properties: { name: { type: 'string' }, description: { type: 'string' } }, required: ['name'] } } } },
            responses: { 201: { description: 'Tag created' } }
        }
    },
    '/tags/{id}': {
        put: {
            tags: ['6. Tags'],
            summary: 'Update tag',
            security: [{ bearerAuth: [] }],
            parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
            requestBody: { content: { 'application/json': { schema: { type: 'object' } } } },
            responses: { 200: { description: 'Tag updated' } }
        },
        delete: {
            tags: ['6. Tags'],
            summary: 'Delete tag',
            security: [{ bearerAuth: [] }],
            parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
            responses: { 200: { description: 'Tag deleted' } }
        }
    },
    // 7. Likes API
    '/posts/{id}/like': {
        post: {
            tags: ['7. Likes'],
            summary: 'Like a post',
            security: [{ bearerAuth: [] }],
            parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
            responses: { 200: { description: 'Liked post' } }
        },
        delete: {
            tags: ['7. Likes'],
            summary: 'Unlike a post',
            security: [{ bearerAuth: [] }],
            parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
            responses: { 200: { description: 'Unliked post' } }
        }
    },
    '/posts/{id}/likes': {
        get: {
            tags: ['7. Likes'],
            summary: 'Get users who liked a post',
            parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
            responses: { 200: { description: 'Post likes list' } }
        }
    },
    // 8. Bookmarks API
    '/bookmarks': {
        get: {
            tags: ['8. Bookmarks'],
            summary: 'Get user bookmarked posts',
            security: [{ bearerAuth: [] }],
            responses: { 200: { description: 'Bookmarks list' } }
        }
    },
    '/bookmarks/{postId}': {
        post: {
            tags: ['8. Bookmarks'],
            summary: 'Bookmark a post',
            security: [{ bearerAuth: [] }],
            parameters: [{ name: 'postId', in: 'path', required: true, schema: { type: 'string' } }],
            responses: { 200: { description: 'Bookmarked post' } }
        },
        delete: {
            tags: ['8. Bookmarks'],
            summary: 'Remove bookmark from a post',
            security: [{ bearerAuth: [] }],
            parameters: [{ name: 'postId', in: 'path', required: true, schema: { type: 'string' } }],
            responses: { 200: { description: 'Bookmark removed' } }
        }
    },
    // 9. Following API
    '/users/{id}/follow': {
        post: {
            tags: ['9. Following'],
            summary: 'Follow a user',
            security: [{ bearerAuth: [] }],
            parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
            responses: { 200: { description: 'Followed user' } }
        }
    },
    '/users/{id}/unfollow': {
        delete: {
            tags: ['9. Following'],
            summary: 'Unfollow a user',
            security: [{ bearerAuth: [] }],
            parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
            responses: { 200: { description: 'Unfollowed user' } }
        }
    },
    '/users/{id}/followers': {
        get: {
            tags: ['9. Following'],
            summary: 'Get user followers',
            parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
            responses: { 200: { description: 'Followers list' } }
        }
    },
    '/users/{id}/following': {
        get: {
            tags: ['9. Following'],
            summary: 'Get users followed by user',
            parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
            responses: { 200: { description: 'Following list' } }
        }
    },
    // 10. Notifications API
    '/notifications': {
        get: {
            tags: ['10. Notifications'],
            summary: 'Get user notifications',
            security: [{ bearerAuth: [] }],
            responses: { 200: { description: 'Notifications list' } }
        }
    },
    '/notifications/unread': {
        get: {
            tags: ['10. Notifications'],
            summary: 'Get unread notifications',
            security: [{ bearerAuth: [] }],
            responses: { 200: { description: 'Unread notifications list' } }
        }
    },
    '/notifications/read-all': {
        put: {
            tags: ['10. Notifications'],
            summary: 'Mark all notifications as read',
            security: [{ bearerAuth: [] }],
            responses: { 200: { description: 'All notifications marked read' } }
        }
    },
    '/notifications/{id}/read': {
        put: {
            tags: ['10. Notifications'],
            summary: 'Mark notification as read',
            security: [{ bearerAuth: [] }],
            parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
            responses: { 200: { description: 'Notification marked read' } }
        }
    },
    '/notifications/{id}': {
        delete: {
            tags: ['10. Notifications'],
            summary: 'Delete notification',
            security: [{ bearerAuth: [] }],
            parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
            responses: { 200: { description: 'Notification deleted' } }
        }
    },
    // 11. Search API
    '/search': {
        get: {
            tags: ['11. Search'],
            summary: 'Unified global search',
            parameters: [
                { name: 'q', in: 'query', required: true, schema: { type: 'string' } },
                { name: 'page', in: 'query', schema: { type: 'integer' } },
                { name: 'limit', in: 'query', schema: { type: 'integer' } }
            ],
            responses: { 200: { description: 'Unified search results' } }
        }
    },
    '/search/posts': {
        get: {
            tags: ['11. Search'],
            summary: 'Search posts with filtering & sorting',
            parameters: [
                { name: 'q', in: 'query', schema: { type: 'string' } },
                { name: 'category', in: 'query', schema: { type: 'string' } },
                { name: 'sortBy', in: 'query', schema: { type: 'string', enum: ['latest', 'popular', 'likes', 'views'] } }
            ],
            responses: { 200: { description: 'Post search results' } }
        }
    },
    '/search/users': {
        get: {
            tags: ['11. Search'],
            summary: 'Search users',
            parameters: [{ name: 'q', in: 'query', schema: { type: 'string' } }],
            responses: { 200: { description: 'User search results' } }
        }
    },
    '/search/categories': {
        get: {
            tags: ['11. Search'],
            summary: 'Search categories',
            parameters: [{ name: 'q', in: 'query', schema: { type: 'string' } }],
            responses: { 200: { description: 'Category search results' } }
        }
    },
    '/search/tags': {
        get: {
            tags: ['11. Search'],
            summary: 'Search tags',
            parameters: [{ name: 'q', in: 'query', schema: { type: 'string' } }],
            responses: { 200: { description: 'Tag search results' } }
        }
    },
    // 12. Media API
    '/media/upload/image': {
        post: {
            tags: ['12. Media'],
            summary: 'Upload image',
            security: [{ bearerAuth: [] }],
            requestBody: { content: { 'application/json': { schema: { type: 'object', properties: { url: { type: 'string' }, filename: { type: 'string' } } } } } },
            responses: { 201: { description: 'Image uploaded' } }
        }
    },
    '/media/upload/video': {
        post: {
            tags: ['12. Media'],
            summary: 'Upload video',
            security: [{ bearerAuth: [] }],
            requestBody: { content: { 'application/json': { schema: { type: 'object', properties: { url: { type: 'string' }, filename: { type: 'string' } } } } } },
            responses: { 201: { description: 'Video uploaded' } }
        }
    },
    '/media/upload/document': {
        post: {
            tags: ['12. Media'],
            summary: 'Upload document (PDF, DOCX, Research Paper, Thesis)',
            security: [{ bearerAuth: [] }],
            requestBody: { content: { 'application/json': { schema: { type: 'object', properties: { url: { type: 'string' }, filename: { type: 'string' } } } } } },
            responses: { 201: { description: 'Document uploaded' } }
        }
    },
    '/media/{id}': {
        get: {
            tags: ['12. Media'],
            summary: 'Get media metadata by ID',
            parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
            responses: { 200: { description: 'Media metadata' } }
        },
        delete: {
            tags: ['12. Media'],
            summary: 'Delete media',
            security: [{ bearerAuth: [] }],
            parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
            responses: { 200: { description: 'Media deleted' } }
        }
    },
    // 13. Anonymous Publishing API
    '/anonymous/publish': {
        post: {
            tags: ['13. Anonymous Publishing'],
            summary: 'Publish anonymous post for moderation review',
            requestBody: { content: { 'application/json': { schema: { type: 'object', properties: { title: { type: 'string' }, content: { type: 'string' } }, required: ['title', 'content'] } } } },
            responses: { 201: { description: 'Submitted for moderation' } }
        }
    },
    '/anonymous/pending': {
        get: {
            tags: ['13. Anonymous Publishing'],
            summary: 'Get pending anonymous posts',
            security: [{ bearerAuth: [] }],
            responses: { 200: { description: 'Pending list' } }
        }
    },
    '/anonymous/{id}/approve': {
        put: {
            tags: ['13. Anonymous Publishing'],
            summary: 'Approve anonymous post',
            security: [{ bearerAuth: [] }],
            parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
            responses: { 200: { description: 'Approved and published' } }
        }
    },
    '/anonymous/{id}/reject': {
        put: {
            tags: ['13. Anonymous Publishing'],
            summary: 'Reject anonymous post',
            security: [{ bearerAuth: [] }],
            parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
            responses: { 200: { description: 'Rejected' } }
        }
    },
    // 14. Reports API
    '/reports': {
        post: {
            tags: ['14. Reports'],
            summary: 'Submit content report',
            requestBody: { content: { 'application/json': { schema: { type: 'object', properties: { targetType: { type: 'string' }, targetId: { type: 'string' }, reason: { type: 'string' } }, required: ['targetType', 'targetId', 'reason'] } } } },
            responses: { 201: { description: 'Report submitted' } }
        },
        get: {
            tags: ['14. Reports'],
            summary: 'List reports',
            security: [{ bearerAuth: [] }],
            responses: { 200: { description: 'Reports list' } }
        }
    },
    '/reports/{id}': {
        get: {
            tags: ['14. Reports'],
            summary: 'Get report by ID',
            security: [{ bearerAuth: [] }],
            parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
            responses: { 200: { description: 'Report detail' } }
        },
        put: {
            tags: ['14. Reports'],
            summary: 'Update report status',
            security: [{ bearerAuth: [] }],
            parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
            requestBody: { content: { 'application/json': { schema: { type: 'object', properties: { status: { type: 'string' }, actionTaken: { type: 'string' } } } } } },
            responses: { 200: { description: 'Report status updated' } }
        },
        delete: {
            tags: ['14. Reports'],
            summary: 'Delete report',
            security: [{ bearerAuth: [] }],
            parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
            responses: { 200: { description: 'Report deleted' } }
        }
    },
    // 15. Email Digest API
    '/email-digest/send': {
        post: {
            tags: ['15. Email Digest'],
            summary: 'Trigger sending email digest',
            security: [{ bearerAuth: [] }],
            responses: { 200: { description: 'Email digest sent' } }
        }
    },
    '/email-digest/history': {
        get: {
            tags: ['15. Email Digest'],
            summary: 'Get email digest history',
            security: [{ bearerAuth: [] }],
            responses: { 200: { description: 'Digest history list' } }
        }
    },
    '/email-digest/preferences': {
        put: {
            tags: ['15. Email Digest'],
            summary: 'Update digest preferences',
            security: [{ bearerAuth: [] }],
            requestBody: { content: { 'application/json': { schema: { type: 'object', properties: { weeklyDigest: { type: 'boolean' }, emailNotifications: { type: 'boolean' } } } } } },
            responses: { 200: { description: 'Preferences updated' } }
        }
    },
    // 16. Analytics API
    '/analytics/dashboard': {
        get: {
            tags: ['16. Analytics'],
            summary: 'Dashboard analytics summary',
            security: [{ bearerAuth: [] }],
            responses: { 200: { description: 'Dashboard analytics' } }
        }
    },
    '/analytics/posts': {
        get: {
            tags: ['16. Analytics'],
            summary: 'Post performance analytics',
            security: [{ bearerAuth: [] }],
            responses: { 200: { description: 'Post analytics' } }
        }
    },
    '/analytics/users': {
        get: {
            tags: ['16. Analytics'],
            summary: 'User activity and growth analytics',
            security: [{ bearerAuth: [] }],
            responses: { 200: { description: 'User analytics' } }
        }
    },
    '/analytics/categories': {
        get: {
            tags: ['16. Analytics'],
            summary: 'Category popularity analytics',
            security: [{ bearerAuth: [] }],
            responses: { 200: { description: 'Category analytics' } }
        }
    },
    // 17. Admin API
    '/admin/dashboard': {
        get: {
            tags: ['17. Admin'],
            summary: 'Admin dashboard overview',
            security: [{ bearerAuth: [] }],
            responses: { 200: { description: 'Admin dashboard' } }
        }
    },
    '/admin/users': {
        get: {
            tags: ['17. Admin'],
            summary: 'Admin list users',
            security: [{ bearerAuth: [] }],
            responses: { 200: { description: 'Users list for admin' } }
        }
    },
    '/admin/users/{id}/suspend': {
        put: {
            tags: ['17. Admin'],
            summary: 'Suspend user',
            security: [{ bearerAuth: [] }],
            parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
            requestBody: { content: { 'application/json': { schema: { type: 'object', properties: { reason: { type: 'string' } } } } } },
            responses: { 200: { description: 'User suspended' } }
        }
    },
    '/admin/users/{id}/activate': {
        put: {
            tags: ['17. Admin'],
            summary: 'Activate suspended user',
            security: [{ bearerAuth: [] }],
            parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
            responses: { 200: { description: 'User activated' } }
        }
    },
    '/admin/users/{id}': {
        delete: {
            tags: ['17. Admin'],
            summary: 'Admin delete user account',
            security: [{ bearerAuth: [] }],
            parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
            responses: { 200: { description: 'User deleted by admin' } }
        }
    },
    '/admin/posts': {
        get: {
            tags: ['17. Admin'],
            summary: 'Admin list all posts',
            security: [{ bearerAuth: [] }],
            responses: { 200: { description: 'Posts list for admin' } }
        }
    },
    '/admin/posts/{id}': {
        delete: {
            tags: ['17. Admin'],
            summary: 'Admin delete post',
            security: [{ bearerAuth: [] }],
            parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
            responses: { 200: { description: 'Post deleted by admin' } }
        }
    },
    '/admin/reports': {
        get: {
            tags: ['17. Admin'],
            summary: 'Admin view content reports',
            security: [{ bearerAuth: [] }],
            responses: { 200: { description: 'Reports list' } }
        }
    },
    '/admin/statistics': {
        get: {
            tags: ['17. Admin'],
            summary: 'Comprehensive site statistics',
            security: [{ bearerAuth: [] }],
            responses: { 200: { description: 'Site statistics' } }
        }
    },
    // 18. Recommendations API
    '/recommendations': {
        get: {
            tags: ['18. Recommendations'],
            summary: 'Personalized recommendations feed',
            responses: { 200: { description: 'Recommendations list' } }
        }
    },
    '/recommendations/following': {
        get: {
            tags: ['18. Recommendations'],
            summary: 'Recommendations from followed authors',
            security: [{ bearerAuth: [] }],
            responses: { 200: { description: 'Following recommendations' } }
        }
    },
    '/recommendations/trending': {
        get: {
            tags: ['18. Recommendations'],
            summary: 'Trending recommended content',
            responses: { 200: { description: 'Trending recommendations' } }
        }
    },
    // 19. Reading History API
    '/history': {
        post: {
            tags: ['19. Reading History'],
            summary: 'Record post read in history',
            security: [{ bearerAuth: [] }],
            requestBody: { content: { 'application/json': { schema: { type: 'object', properties: { postId: { type: 'string' } }, required: ['postId'] } } } },
            responses: { 200: { description: 'History recorded' } }
        },
        get: {
            tags: ['19. Reading History'],
            summary: 'Get user reading history',
            security: [{ bearerAuth: [] }],
            responses: { 200: { description: 'Reading history list' } }
        }
    },
    '/history/{id}': {
        delete: {
            tags: ['19. Reading History'],
            summary: 'Remove item from reading history',
            security: [{ bearerAuth: [] }],
            parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
            responses: { 200: { description: 'History item removed' } }
        }
    },
    // 20. File Downloads API
    '/downloads/{id}': {
        get: {
            tags: ['20. File Downloads'],
            summary: 'Download file (PDFs, DOCX, Research papers, Thesis)',
            parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
            responses: { 200: { description: 'File binary or download info' } }
        }
    },
    // 21. Homepage API
    '/home': {
        get: {
            tags: ['21. Homepage'],
            summary: 'Aggregated home page content',
            responses: { 200: { description: 'Homepage payload with featured, trending, research, technology, awareness, following feeds' } }
        }
    },
    // 22. Feed API
    '/feed': {
        get: {
            tags: ['22. Feed'],
            summary: 'Main feed',
            parameters: [{ name: 'page', in: 'query', schema: { type: 'integer' } }, { name: 'limit', in: 'query', schema: { type: 'integer' } }],
            responses: { 200: { description: 'Main feed' } }
        }
    },
    '/feed/following': {
        get: {
            tags: ['22. Feed'],
            summary: 'Feed of posts from followed authors',
            security: [{ bearerAuth: [] }],
            responses: { 200: { description: 'Following feed' } }
        }
    },
    '/feed/trending': {
        get: {
            tags: ['22. Feed'],
            summary: 'Trending feed',
            responses: { 200: { description: 'Trending feed' } }
        }
    },
    '/feed/latest': {
        get: {
            tags: ['22. Feed'],
            summary: 'Latest posts feed',
            responses: { 200: { description: 'Latest feed' } }
        }
    },
    // 23. Saved Searches API
    '/saved-searches': {
        get: {
            tags: ['23. Saved Searches'],
            summary: 'List user saved search queries',
            security: [{ bearerAuth: [] }],
            responses: { 200: { description: 'Saved searches list' } }
        },
        post: {
            tags: ['23. Saved Searches'],
            summary: 'Save a search query',
            security: [{ bearerAuth: [] }],
            requestBody: { content: { 'application/json': { schema: { type: 'object', properties: { query: { type: 'string' }, filters: { type: 'object' } }, required: ['query'] } } } },
            responses: { 201: { description: 'Search saved' } }
        }
    },
    '/saved-searches/{id}': {
        delete: {
            tags: ['23. Saved Searches'],
            summary: 'Delete a saved search',
            security: [{ bearerAuth: [] }],
            parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
            responses: { 200: { description: 'Saved search deleted' } }
        }
    },
    // 24. System API
    '/health': {
        get: {
            tags: ['24. System'],
            summary: 'Health check',
            responses: { 200: { description: 'System health status' } }
        }
    },
    '/version': {
        get: {
            tags: ['24. System'],
            summary: 'System version info',
            responses: { 200: { description: 'API version info' } }
        }
    },
    '/status': {
        get: {
            tags: ['24. System'],
            summary: 'System status and memory usage',
            responses: { 200: { description: 'Detailed system status' } }
        }
    }
};
