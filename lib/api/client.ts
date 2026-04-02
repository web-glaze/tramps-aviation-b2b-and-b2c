import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api";
export const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK === "true";

const apiClient = axios.create({
  baseURL: API_URL,
  timeout: 30000,
  headers: { "Content-Type": "application/json" },
});

// Attach JWT token from localStorage
apiClient.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token =
      localStorage.getItem("auth_token") || localStorage.getItem("agent_token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 — clear auth and redirect
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && typeof window !== "undefined") {
      const path = window.location.pathname;
      // Don't redirect from public pages
      if (
        !path.includes("/login") &&
        !path.includes("/register") &&
        !path.includes("/kyc")
      ) {
        localStorage.removeItem("auth_token");
        localStorage.removeItem("agent_token");
        document.cookie = "auth_token=; path=/; max-age=0";
        // Agent pages → B2B login; others → B2C login
        if (path.startsWith("/b2b")) {
          window.location.href = "/b2b/login";
        } else {
          window.location.href = "/b2c/login";
        }
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;
