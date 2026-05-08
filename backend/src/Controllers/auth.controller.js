const { asyncHandler } = require("../utils/asyncHandler");
const { register, login, resetPassword } = require("../Services/auth.service");

const registerUser = asyncHandler(async (req, res) => {
  const result = await register(req.body);
  res.status(201).json(result);
  console.log("User registered:", result);
});

const loginUser = asyncHandler(async (req, res) => {
  const result = await login(req.body);
  res.json(result);
});

const resetPasswordUser = asyncHandler(async (req, res) => {
  const result = await resetPassword(req.body);
  res.json(result);
});

const logoutUser = asyncHandler(async (req, res) => {
  // Optionnel: On pourrait ici blacklister le token ou logger la déconnexion
  res.json({ message: "Déconnexion réussie (API)" });
});

module.exports = {
  registerUser,
  loginUser,
  resetPasswordUser,
  logoutUser,
};
