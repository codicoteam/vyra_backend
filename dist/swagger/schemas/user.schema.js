"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userSchemas = void 0;
exports.userSchemas = {
    User: {
        type: 'object',
        properties: {
            _id: { type: 'string' },
            email: { type: 'string' },
            username: { type: 'string' },
            fullName: { type: 'string' },
            role: { type: 'string' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' }
        }
    }
};
