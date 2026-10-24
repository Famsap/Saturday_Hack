const ApiError = require('../utils/ApiError');

const validate = (schema) => (req, res, next) => {
  try {
    const parsed = schema.parse({
      body: req.body,
      query: req.query,
      params: req.params,
    });
    // Replace with parsed/sanitized versions
    req.body = parsed.body || req.body;
    req.query = parsed.query || req.query;
    req.params = parsed.params || req.params;
    next();
  } catch (err) {
    if (err.errors) {
      const details = err.errors.map((e) => ({
        field: e.path.join('.'),
        message: e.message,
      }));
      return next(new ApiError(400, 'Validation Error', details));
    }
    next(err);
  }
};

module.exports = validate;
