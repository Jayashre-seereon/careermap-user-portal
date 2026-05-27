import axios from "axios";
import { useAuthStore } from "../store/authStore";

function cleanBaseUrl(baseUrl) {
  return baseUrl?.replace(/\/$/, "");
}

function resolveApiBaseUrl(baseUrl) {
  const cleaned = cleanBaseUrl(baseUrl || "http://localhost:5000/api");

  if (!cleaned) {
    return "http://localhost:5000/api";
  }

  return cleaned.endsWith("/api") ? cleaned : `${cleaned}/api`;
}

export const API_BASE_URL = resolveApiBaseUrl(import.meta.env.VITE_API_BASE_URL);

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 20000,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().accessToken;
    const requestUrl = String(config.url || "");
    const hasExplicitAuthorization = Boolean(config.headers?.Authorization);
    const isPublicAuthRoute =
      requestUrl.includes("/auth/login/password") ||
      requestUrl.includes("/auth/send-otp") ||
      requestUrl.includes("/auth/verify-otp");

    if (token && !isPublicAuthRoute) {
      config.headers.Authorization = `Bearer ${token}`;
    } else if (!token && !hasExplicitAuthorization && config.headers?.Authorization) {
      delete config.headers.Authorization;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

export default api;
