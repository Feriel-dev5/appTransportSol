const { AppError } = require("../errors/AppError");

const notFoundHandler = (req, res, next) => {
  res.status(404).json({ message: "Route not found" });
};

const errorHandler = (err, req, res, next) => {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      message: err.message,
      details: err.details || undefined,
    });
  }

  console.error(err);
  return res.status(500).json({ message: "Internal server error" });
};

module.exports = { errorHandler, notFoundHandler };
