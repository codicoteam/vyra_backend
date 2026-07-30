export const authSchemas = {
  LoginRequest: {
    type: 'object',
    required: ['email', 'password'],
    properties: {
      email: { type: 'string', format: 'email' },
      password: { type: 'string' }
    }
  },
  RegisterRequest: {
    type: 'object',
    required: ['email', 'username', 'password', 'fullName'],
    properties: {
      email: { type: 'string', format: 'email' },
      username: { type: 'string' },
      password: { type: 'string' },
      fullName: { type: 'string' }
    }
  }
};
