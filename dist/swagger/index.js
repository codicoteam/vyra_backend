"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupSwagger = setupSwagger;
const swagger_jsdoc_1 = __importDefault(require("swagger-jsdoc"));
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
const env_1 = require("../config/env");
const auth_paths_1 = require("./paths/auth.paths");
const user_paths_1 = require("./paths/user.paths");
const story_paths_1 = require("./paths/story.paths");
const auth_schema_1 = require("./schemas/auth.schema");
const user_schema_1 = require("./schemas/user.schema");
const story_schema_1 = require("./schemas/story.schema");
const options = {
    definition: {
        openapi: '3.0.3',
        info: {
            title: 'VYRA API Documentation',
            version: '1.0.0',
            description: `
# VYRA — Voices Yielding Research & Awareness

## Premium Digital Publishing Platform API

### Features
- **Authentication**: Email/Password, Google, GitHub, Twitter OAuth
- **Content Management**: Stories, Research Papers, Awareness Campaigns
- **Anonymous Publishing**: True anonymous content sharing
- **File Management**: Images, Videos, Documents with virus scanning
- **Social Features**: Likes, Bookmarks, Follows, Reading History
- **Search**: Full-text search with MongoDB Atlas Search
- **Notifications**: Real-time + Email digests
- **Analytics**: Comprehensive content and user analytics
- **Moderation**: Content reporting and admin review system
- **Role-Based Access**: User, Editor, Admin, Super Admin roles

### Authentication
Most endpoints require JWT authentication. Include the token in the Authorization header:
\`\`\`
Authorization: Bearer {access_token}
\`\`\`

### Response Format
\`\`\`json
{
  "success": true,
  "data": { ... },
  "message": "Operation successful"
}
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
                url: `http://localhost:${env_1.config.port}/api/v1`,
                description: 'Development Server',
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
                // Common schemas
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
                                details: {
                                    type: 'array',
                                    items: {
                                        type: 'object',
                                        properties: {
                                            field: { type: 'string' },
                                            message: { type: 'string' },
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
                ...auth_schema_1.authSchemas,
                ...user_schema_1.userSchemas,
                ...story_schema_1.storySchemas,
            },
        },
        paths: {
            ...auth_paths_1.authPaths,
            ...user_paths_1.userPaths,
            ...story_paths_1.storyPaths,
        },
    },
    apis: [], // We're defining paths manually
};
function setupSwagger(app) {
    const swaggerSpec = (0, swagger_jsdoc_1.default)(options);
    app.use('/api-docs', swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(swaggerSpec, {
        customCss: '.swagger-ui .topbar { display: none }',
        customSiteTitle: 'VYRA API Documentation',
    }));
    // Serve raw swagger JSON
    app.get('/api-docs.json', (req, res) => {
        res.setHeader('Content-Type', 'application/json');
        res.send(swaggerSpec);
    });
}
