const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { AppError } = require("../errors/AppError");
const {
  findUserByEmail,
  createUser,
  updateUserById,
} = require("../Repository/user.repository");

const signToken = (user) =>
  jwt.sign({ sub: user.id, role: user.role }, process.env.JWT_SECRET_KEY, {
    expiresIn: "1d",
  });

const sanitizeUser = (user) => ({
  id: user.id,
  name: user.name,
  email: user.email,
  role: user.role,
  availability: user.availability,
  phone: user.phone,
  passportNumber: user.passportNumber,
  cin: user.cin,
  address: user.address,
  numeroPermis: user.numeroPermis,
});

const register = async ({
  name,
  email,
  numeroPermis,
  password,
  phone,
  passportNumber,
  cin,
  role,
  address,
}) => {
  const normalizedEmail = email.toLowerCase();
  const existing = await findUserByEmail(normalizedEmail);
  if (existing) {
    throw new AppError("Email already registered", 409);
  }

  const hashed = await bcrypt.hash(password, 10);
  const user = await createUser({
    name,
    email: normalizedEmail,
    password: hashed,
    role,
    phone,
    passportNumber,
    cin,
    address,
    numeroPermis,
  });

  const token = signToken(user);
  return { user: sanitizeUser(user), token };
};

const login = async ({ email, password }) => {
  const user = await findUserByEmail(email);
  if (!user) {
    throw new AppError("Invalid credentials", 401);
  }

  const match = await bcrypt.compare(password, user.password);
  if (!match) {
    throw new AppError("Invalid credentials", 401);
  }

  const token = signToken(user);
  return { user: sanitizeUser(user), token };
};

const resetPassword = async ({ email, password }) => {
  const normalizedEmail = email.toLowerCase();
  const user = await findUserByEmail(normalizedEmail);
  if (!user) {
    throw new AppError("User not found", 404);
  }

  const hashed = await bcrypt.hash(password, 10);
  await updateUserById(user.id, { password: hashed });

  return { message: "Password updated successfully" };
};

module.exports = { register, login, resetPassword, sanitizeUser };
