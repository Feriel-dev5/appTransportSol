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

export const logout = async () => {
  try {
    await api.post("/auth/logout");
  } catch (err) {
    console.warn("API logout failed, but clearing local session anyway.", err);
  }
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  sessionStorage.clear();
};

export const register = async ({
  name,
  email,
  password,
  telephone,
  address,
  cin,
  passportNumber,
  role,
  nationality,
}) => {
  const response = await api.post("/auth/register", {
    name,
    email,
    password,
    phone: telephone,
    address,
    cin: cin || undefined,
    passportNumber: passportNumber || undefined,
    role,
    nationality,
  });

  return response.data;
};

const safeSetItem = (key, value) => {
  try {
    localStorage.setItem(key, value);
  } catch (e) {
    if (e.name === "QuotaExceededError" || e.name === "NS_ERROR_DOM_QUOTA_REACHED") {
      console.warn("Storage quota exceeded, clearing profile photos...");
      // Nettoyage des photos pour libérer de l'espace
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k && k.startsWith("airops_profil_photo_v2")) {
          localStorage.removeItem(k);
          i--; // Ajuster l'index après suppression
        }
      }
      // Réessayer une fois
      try {
        localStorage.setItem(key, value);
      } catch (err) {
        console.error("Critical: Could not save essential auth data even after cleanup", err);
      }
    }
  }
};

export const login = async (email, password) => {
  const response = await api.post("/auth/login", {
    email,
    password,
  });

  const { token, user } = response.data;

  if (token) safeSetItem("token", token);
  if (user)  safeSetItem("user", JSON.stringify(user));

  return response.data;
};

export const resetPassword = async ({ email, newPassword }) => {
  const response = await api.post("/auth/reset-password", {
    email,
    password: newPassword,
  });

  return response.data;
};

/**
 * Vérifie la validité du token et récupère le profil à jour depuis le backend.
 * Utilisé pour sécuriser les interfaces et éviter de se fier uniquement au localStorage.
 */
export const verifySession = async () => {
  try {
    const response = await api.get("/users/me");
    const user = response.data.user;
    if (user) {
      safeSetItem("user", JSON.stringify(user));
    }
    return user;
  } catch (err) {
    logout();
    throw err;
  }
};
