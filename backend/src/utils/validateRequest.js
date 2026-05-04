const { AppError } = require("../errors/AppError");

const validateRequest = (schema) => (req, res, next) => {
  const result = schema.safeParse({
    body: req.body,
    params: req.params,
    query: req.query,
  });

  if (!result.success) {
    const details = result.error.flatten();
    return next(new AppError("Validation error", 400, details));
  }

  req.validated = result.data;
  return next();
};

module.exports = { validateRequest };
