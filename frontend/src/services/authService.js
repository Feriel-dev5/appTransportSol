import api from "./api";

export const getToken = () => localStorage.getItem("token");

export const getUser = () => {
  try {
    const raw = localStorage.getItem("user");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export const isAuthenticated = () => !!getToken();

export const logout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
};

export const register = async ({
  name,
  email,
  password,
  telephone,
  address,
  cin,
  passportNumber,
}) => {
  const response = await api.post("/auth/register", {
    name,
    email,
    password,
    phone: telephone,
    address,
    cin: cin || undefined,
    passportNumber: passportNumber || undefined,
  });

  return response.data;
};

export const login = async (email, password) => {
  const response = await api.post("/auth/login", {
    email,
    password,
  });

  const { token, user } = response.data;

  if (token) localStorage.setItem("token", token);
  if (user) localStorage.setItem("user", JSON.stringify(user));

  return response.data;
};

export const resetPassword = async ({ email, newPassword }) => {
  const response = await api.post("/auth/reset-password", {
    email,
    password: newPassword,
  });

  return response.data;
};
