import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_SERVER_APP_ORIGIN || "http://localhost:8000/api",
  timeout: 8000,
  headers: {
    "Content-Type": "application/json",
  },
});

// ── Intercepteur REQUEST : ajoute le token JWT à chaque requête ──
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ── Intercepteur RESPONSE : si token expiré → déconnexion auto ──
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const isAuthRoute =
        error.config?.url?.includes("/auth/login") ||
        error.config?.url?.includes("/auth/register");

      if (!isAuthRoute) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export default api;