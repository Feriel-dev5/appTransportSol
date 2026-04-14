const jwt = require("jsonwebtoken");
const { AppError } = require("../errors/AppError");

const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return next(new AppError("Missing Authorization header", 401));
  }

  const [type, token] = authHeader.split(" ");
  if (type !== "Bearer" || !token) {
    return next(new AppError("Invalid Authorization header", 401));
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET_KEY);
    req.user = { id: payload.sub, role: payload.role };
    return next();
  } catch (error) {
    return next(new AppError("Invalid or expired token", 401));
  }
};

module.exports = { verifyToken };
