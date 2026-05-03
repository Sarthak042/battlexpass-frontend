// 🔥 IMPORTANT: Add this import (this was missing)
import axios from "axios";

// In production (Vercel): VITE_API_URL = https://your-backend.onrender.com/api
// In development: falls back to '/api' which is proxied by Vite to localhost:5000
const API_BASE_URL = import.meta.env.VITE_API_URL || "/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: { "Content-Type": "application/json" },
});

// ── Request interceptor: attach JWT ────────────────────────────────────────────
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("esports_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ── Response interceptor: handle 401 globally ──────────────────────────────────
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const code = error.response.data?.code;
      if (
        code === "TOKEN_EXPIRED" ||
        code === "INVALID_TOKEN" ||
        code === "NO_TOKEN"
      ) {
        localStorage.removeItem("esports_token");
        localStorage.removeItem("esports_user");
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export default api;