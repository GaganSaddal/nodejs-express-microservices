module.exports = {
  // HTTP Status Codes
  HTTP_STATUS: {
    OK: 200,
    CREATED: 201,
    NO_CONTENT: 204,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    CONFLICT: 409,
    UNPROCESSABLE_ENTITY: 422,
    TOO_MANY_REQUESTS: 429,
    INTERNAL_SERVER_ERROR: 500,
    SERVICE_UNAVAILABLE: 503,
  },

  // User Roles
  ROLES: {
    USER: 'user',
    ADMIN: 'admin',
    MODERATOR: 'moderator',
  },

  // Token Types
  TOKEN_TYPES: {
    ACCESS: 'access',
    REFRESH: 'refresh',
    RESET_PASSWORD: 'resetPassword',
    VERIFY_EMAIL: 'verifyEmail',
  },

  // Token Expiry
  TOKEN_EXPIRY: {
    ACCESS: '15m',
    REFRESH: '7d',
    RESET_PASSWORD: '10m',
    VERIFY_EMAIL: '24h',
  },

  // Pagination
  PAGINATION: {
    DEFAULT_PAGE: 1,
    DEFAULT_LIMIT: 10,
    MAX_LIMIT: 100,
  },

  // Rate Limiting
  RATE_LIMIT: {
    WINDOW_MS: 15 * 60 * 1000, // 15 minutes
    MAX_REQUESTS: 100,
    MAX_REQUESTS_AUTH: 1000,
  },

  // Events
  EVENTS: {
    USER_REGISTERED: 'user.registered',
    USER_VERIFIED: 'user.verified',
    USER_UPDATED: 'user.updated',
    USER_DELETED: 'user.deleted',
    PASSWORD_RESET_REQUESTED: 'password.reset.requested',
    PASSWORD_RESET_COMPLETED: 'password.reset.completed',
  },
};
