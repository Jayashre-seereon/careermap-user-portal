import axios from "axios";
import { useAuthStore } from "../store/authStore";

function cleanBaseUrl(baseUrl) {
  return baseUrl?.replace(/\/$/, "");
}

function resolveApiBaseUrl(baseUrl) {
  const cleaned = cleanBaseUrl(baseUrl);

  if (!cleaned) {
    return "http://localhost:5000/api";
  }

  return cleaned.endsWith("/api") ? cleaned : `${cleaned}/api`;
}

export const API_BASE_URL = resolveApiBaseUrl(import.meta.env.VITE_API_BASE_URL);

function getHeaderValue(headers, key) {
  if (!headers) {
    return "";
  }

  if (typeof headers.get === "function") {
    return headers.get(key) || headers.get(key.toLowerCase()) || "";
  }

  return headers[key] || headers[key.toLowerCase()] || "";
}

function setHeaderValue(headers, key, value) {
  if (!headers) {
    return;
  }

  if (typeof headers.set === "function") {
    headers.set(key, value);
    return;
  }

  headers[key] = value;
}

function removeHeaderValue(headers, key) {
  if (!headers) {
    return;
  }

  if (typeof headers.delete === "function") {
    headers.delete(key);
    headers.delete(key.toLowerCase());
    return;
  }

  delete headers[key];
  delete headers[key.toLowerCase()];
}

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
    const explicitAuthorization = getHeaderValue(config.headers, "Authorization");
    const isPublicAuthRoute =
      requestUrl.includes("/auth/login/password") ||
      requestUrl.includes("/auth/send-otp") ||
      requestUrl.includes("/auth/verify-otp");
    const isSignupRoute = requestUrl.includes("/user/signup");

    if (explicitAuthorization) {
      return config;
    }

    if (token && !isPublicAuthRoute && !isSignupRoute) {
      setHeaderValue(config.headers, "Authorization", `Bearer ${token}`);
    } else if (!token) {
      removeHeaderValue(config.headers, "Authorization");
    }

    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;
    const requestUrl = String(error?.config?.url || "");
    const isProtectedRoute = requestUrl.includes("/user/dashboard") || requestUrl.includes("/user/payment");
    const tokenMessage = String(error?.response?.data?.message || "").toLowerCase();
    const isInvalidToken = tokenMessage.includes("token invalid") || tokenMessage.includes("token expired");

    if (status === 401 && isProtectedRoute && isInvalidToken) {
      useAuthStore.getState().logout();

      if (typeof window !== "undefined" && window.location.pathname.startsWith("/app")) {
        window.location.replace("/auth-entry");
      }
    }

    return Promise.reject(error);
  }
);

export default api;
