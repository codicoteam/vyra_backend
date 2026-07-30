import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { Express } from 'express';
import { config } from '../config/env';
import { authPaths } from './paths/auth.paths';
import { userPaths } from './paths/user.paths';
import { storyPaths } from './paths/story.paths';
import { allPaths } from './allPaths';
import { authSchemas } from './schemas/auth.schema';
import { userSchemas } from './schemas/user.schema';
import { storySchemas } from './schemas/story.schema';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.3',
    info: {
      title: 'VYRA API Documentation',
      version: '1.0.0',
      description: `
# VYRA — Voices Yielding Research & Awareness

## Complete Digital Publishing Platform API (24 API Modules)

### Available Modules:
1. **Authentication API**: \`/auth\` (register, login, logout, refresh-token, forgot-password, reset-password, verify-email, me, change-password)
2. **Users API**: \`/users\` (get users, user by id, username, profile, avatar, delete account)
3. **Posts API**: \`/posts\` (CRUD, slug, publish, archive, duplicate, feature)
4. **Drafts API**: \`/drafts\` (CRUD for user draft articles)
5. **Categories API**: \`/categories\` (CRUD for categories)
6. **Tags API**: \`/tags\` (CRUD for tags)
7. **Likes API**: \`/posts/:id/like\` (like, unlike, list likes)
8. **Bookmarks API**: \`/bookmarks\` (bookmark, remove, list bookmarks)
9. **Following API**: \`/users/:id/follow\` (follow, unfollow, followers, following)
10. **Notifications API**: \`/notifications\` (list, unread, mark read, mark all read, delete)
11. **Search API**: \`/search\` (unified search, posts, users, categories, tags with filtering & pagination)
12. **Media API**: \`/media\` (upload image, video, document, download & delete)
13. **Anonymous Publishing API**: \`/anonymous\` (publish, pending, approve, reject)
14. **Reports API**: \`/reports\` (create report, list, detail, update status, delete)
15. **Email Digest API**: \`/email-digest\` (send digest, history, preferences)
16. **Analytics API**: \`/analytics\` (dashboard, posts, users, categories analytics)
17. **Admin API**: \`/admin\` (dashboard, user management, post management, reports, statistics)
18. **Recommendations API**: \`/recommendations\` (main, following feed, trending)
19. **Reading History API**: \`/history\` (record, list, remove history)
20. **File Downloads API**: \`/downloads/:id\` (download PDF, DOCX, research paper, thesis docs)
21. **Homepage API**: \`/home\` (aggregated home page endpoint)
22. **Feed API**: \`/feed\` (main feed, following, trending, latest)
23. **Saved Searches API**: \`/saved-searches\` (list, save, delete)
24. **System API**: \`/health\`, \`/version\`, \`/status\`

### Authentication
Most endpoints require JWT authentication. Include the token in the Authorization header:
\`\`\`
Authorization: Bearer {access_token}
\`\`\`
      `,
      contact: {
        name: 'VYRA API Support',
        email: 'api@vyra.com',
        url: 'https://vyra.com/support',
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT',
      },
    },
    servers: [
      {
        url: `http://localhost:${config.port}/api/v1`,
        description: 'Development Server (API v1)',
      },
      {
        url: 'https://api.vyra.com/api/v1',
        description: 'Production Server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter your JWT access token',
        },
        cookieAuth: {
          type: 'apiKey',
          in: 'cookie',
          name: 'refresh_token',
          description: 'HttpOnly cookie for token refresh',
        },
      },
      schemas: {
        Pagination: {
          type: 'object',
          properties: {
            page: { type: 'integer', example: 1 },
            limit: { type: 'integer', example: 20 },
            total: { type: 'integer', example: 150 },
            totalPages: { type: 'integer', example: 8 },
          },
        },
        SuccessResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            data: { type: 'object' },
            message: { type: 'string' },
            pagination: { $ref: '#/components/schemas/Pagination' },
          },
        },
        ErrorResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            error: {
              type: 'object',
              properties: {
                code: { type: 'string', example: 'VALIDATION_ERROR' },
                message: { type: 'string', example: 'Invalid input' },
              },
            },
          },
        },
        ...authSchemas,
        ...userSchemas,
        ...storySchemas,
      },
    },
    paths: {
      ...authPaths,
      ...userPaths,
      ...storyPaths,
      ...allPaths,
    },
  },
  apis: [],
};

export function setupSwagger(app: Express): void {
  const swaggerSpec = swaggerJsdoc(options);
  
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'VYRA API Documentation',
  }));
  
  app.get('/api-docs.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpec);
  });
}
