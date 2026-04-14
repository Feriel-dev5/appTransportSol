import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_SERVER_APP_ORIGIN || "http://localhost:5000",
  timeout: 5000,
  headers: {
    "Content-Type": "application/json",
  },
});

export default api;
