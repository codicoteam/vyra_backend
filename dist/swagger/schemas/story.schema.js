"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.storySchemas = void 0;
exports.storySchemas = {
    Story: {
        type: 'object',
        properties: {
            _id: { type: 'string' },
            title: { type: 'string' },
            slug: { type: 'string' },
            content: { type: 'string' },
            status: { type: 'string' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' }
        }
    }
};
