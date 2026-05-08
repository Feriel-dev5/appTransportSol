const { Router } = require("express");
const { registerUser, loginUser, resetPasswordUser, logoutUser } = require("../Controllers/auth.controller");
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
router.post("/logout", logoutUser);

module.exports = router;
