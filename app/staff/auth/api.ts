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

export default api;
