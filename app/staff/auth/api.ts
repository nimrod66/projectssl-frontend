import axios from "axios";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE;

const api = axios.create({
  baseURL: API_BASE,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  const expiry = localStorage.getItem("expiry");

  // If expired → clear token
  if (expiry && Date.now() > Number(expiry)) {
    localStorage.removeItem("token");
    localStorage.removeItem("expiry");
  }

  if (token && config.headers) {
    config.headers["Authorization"] = `Bearer ${token}`;
  }

  return config;
});

let redirecting = false;

api.interceptors.response.use(
  (res) => res,
  (error) => {
    const status = error?.response?.status;
    const url: string = error?.config?.url || "";
    const isAuthCall = url.includes("/api/auth/login") || url.includes("/api/auth/register");
    if (status === 401 && !isAuthCall && typeof window !== "undefined" && !redirecting) {
      redirecting = true;
      localStorage.removeItem("token");
      localStorage.removeItem("expiry");
      localStorage.removeItem("role");
      window.location.href = "/staff/login";
    }
    return Promise.reject(error);
  }
);

export default api;
