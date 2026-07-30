export const storySchemas = {
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
