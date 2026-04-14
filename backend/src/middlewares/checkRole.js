const { AppError } = require("../errors/AppError");

const checkRole = (roles) => (req, res, next) => {
  if (!req.user) {
    return next(new AppError("Unauthenticated", 401));
  }

  if (!roles.includes(req.user.role)) {
    return next(new AppError("Forbidden", 403));
  }

  return next();
};

module.exports = { checkRole };
