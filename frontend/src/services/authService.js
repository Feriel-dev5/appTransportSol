import api from "./api";

export const login = async (email, password) => {
  try {
    const response = await api.post("/auth/login", {
      email,
      password,
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const logout = () => {
  // Clear any stored tokens
  localStorage.removeItem("token");
  localStorage.removeItem("user");
};

export const register = async (email, password, name) => {
  try {
    const response = await api.post("/auth/register", {
      email,
      password,
      name,
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};
