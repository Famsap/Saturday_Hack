const ApiError = require('../utils/ApiError');

const roleGuard = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return next(new ApiError(403, 'Forbidden: Insufficient privileges'));
    }
    next();
  };
};

module.exports = roleGuard;
