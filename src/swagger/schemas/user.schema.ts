export const userSchemas = {
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
