const { sendError } = require('../utils/response');

const validate = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.body);
  if (!result.success) {
    const errors = result.error.flatten().fieldErrors;
    return sendError(res, 'Validation failed', 422, errors);
  }
  req.body = result.data;
  next();
};

module.exports = { validate };