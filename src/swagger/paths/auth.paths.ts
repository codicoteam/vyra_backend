export const authPaths = {
  '/auth/register': {
    post: {
      tags: ['Auth'],
      summary: 'Register a new user',
      description: 'Create a new user account with email and password',
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/RegisterRequest'
            },
          },
        },
      },
      responses: {
        201: {
          description: 'User registered successfully',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: true },
                  data: {
                    type: 'object',
                    properties: {
                      user: { $ref: '#/components/schemas/User' },
                      accessToken: { type: 'string', example: 'eyJhbGciOiJSUzI1NiIs...' },
                      refreshToken: { type: 'string', example: 'dGhpcyBpcyBhIHJlZnJl...' },
                    },
                  },
                  message: { type: 'string', example: 'Registration successful. Please verify your email.' },
                },
              },
            },
          },
        },
        400: { description: 'Validation Error' },
        409: {
          description: 'Email or username already exists',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ErrorResponse' },
              example: {
                success: false,
                error: {
                  code: 'DUPLICATE_ENTRY',
                  message: 'A user with this email or username already exists',
                },
              },
            },
          },
        },
      },
    },
  },

  '/auth/login': {
    post: {
      tags: ['Auth'],
      summary: 'Login with email and password',
      description: 'Authenticate user and return JWT tokens',
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/LoginRequest'
            },
          },
        },
      },
      responses: {
        200: {
          description: 'Login successful',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: true },
                  data: {
                    type: 'object',
                    properties: {
                      user: { $ref: '#/components/schemas/User' },
                      accessToken: { type: 'string' },
                      refreshToken: { type: 'string' },
                    },
                  },
                },
              },
            },
          },
        },
        401: {
          description: 'Invalid credentials',
          content: {
            'application/json': {
              example: {
                success: false,
                error: {
                  code: 'INVALID_CREDENTIALS',
                  message: 'Invalid email or password',
                },
              },
            },
          },
        },
        429: {
          description: 'Too many attempts',
          content: {
            'application/json': {
              example: {
                success: false,
                error: {
                  code: 'RATE_LIMIT_EXCEEDED',
                  message: 'Too many login attempts. Please try again in 15 minutes.',
                },
              },
            },
          },
        },
      },
    },
  },

  '/auth/refresh-token': {
    post: {
      tags: ['Auth'],
      summary: 'Refresh access token',
      description: 'Use refresh token to get new access and refresh tokens',
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['refreshToken'],
              properties: {
                refreshToken: { type: 'string' },
              },
            },
          },
        },
      },
      responses: {
        200: {
          description: 'Tokens refreshed successfully',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: true },
                  data: {
                    type: 'object',
                    properties: {
                      accessToken: { type: 'string' },
                      refreshToken: { type: 'string' },
                    },
                  },
                },
              },
            },
          },
        },
        401: {
          description: 'Invalid or expired refresh token',
        },
      },
    },
  },

  '/auth/logout': {
    post: {
      tags: ['Auth'],
      summary: 'Logout user',
      description: 'Invalidate current refresh token and clear session',
      security: [{ bearerAuth: [] }],
      responses: {
        200: {
          description: 'Logout successful'
        }
      }
    }
  }
};
