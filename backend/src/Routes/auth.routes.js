const { Router } = require("express");
const { registerUser, loginUser, resetPasswordUser } = require("../Controllers/auth.controller");
const { validateRequest } = require("../utils/validateRequest");
const {
  registerSchema,
  loginSchema,
  resetPasswordSchema,
} = require("../Validation/auth.validation");

const router = Router();

router.post("/register", validateRequest(registerSchema), registerUser);
router.post("/login", validateRequest(loginSchema), loginUser);
router.post("/reset-password", validateRequest(resetPasswordSchema), resetPasswordUser);

module.exports = router;
