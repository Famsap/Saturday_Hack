const ApiError = require('../utils/ApiError');
const { verifyToken } = require('../utils/jwt');

const auth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(new ApiError(401, 'Authentication token missing or invalid'));
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = verifyToken(token);
    req.user = decoded; // { id, role, email }
    next();
  } catch (err) {
    return next(new ApiError(401, 'Token expired or invalid'));
  }
};

module.exports = auth;
