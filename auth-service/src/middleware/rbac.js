const httpStatus = require('http-status');
const ApiError = require('../../../shared/utils/ApiError');

/**
 * Role-Based Access Control middleware
 * @param {...string} requiredRoles - Required roles
 * @returns {Function} Express middleware
 */
const rbac = (...requiredRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new ApiError(httpStatus.UNAUTHORIZED, 'Please authenticate'));
    }

    if (requiredRoles.length && !requiredRoles.includes(req.user.role)) {
      return next(new ApiError(httpStatus.FORBIDDEN, 'Insufficient permissions'));
    }

    next();
  };
};

/**
 * Check if user has specific permission
 * @param {string} resource - Resource name
 * @param {string} action - Action (create, read, update, delete)
 * @returns {Function} Express middleware
 */
const checkPermission = (resource, action) => {
  return async (req, res, next) => {
    if (!req.user) {
      return next(new ApiError(httpStatus.UNAUTHORIZED, 'Please authenticate'));
    }

    // Admin has all permissions
    if (req.user.role === 'admin') {
      return next();
    }

    // TODO: Implement fine-grained permission checking with Role model
    // For now, just check basic roles
    const rolePermissions = {
      user: ['read'],
      moderator: ['read', 'update'],
      admin: ['create', 'read', 'update', 'delete'],
    };

    const userPermissions = rolePermissions[req.user.role] || [];

    if (!userPermissions.includes(action)) {
      return next(new ApiError(httpStatus.FORBIDDEN, 'Insufficient permissions'));
    }

    next();
  };
};

module.exports = {
  rbac,
  checkPermission,
};
