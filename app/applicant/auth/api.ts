import axios from "axios";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE;

const api = axios.create({
  baseURL: API_BASE,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("applicant_token");
  const expiry = localStorage.getItem("applicant_expiry");

  if (expiry && Date.now() > Number(expiry)) {
    localStorage.removeItem("applicant_token");
    localStorage.removeItem("applicant_expiry");
    localStorage.removeItem("applicant_number");
    localStorage.removeItem("applicant_name");
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
    const isAuthCall = url.includes("/api/applicants/login") || url.includes("/api/applicants/register");
    if (status === 401 && !isAuthCall && typeof window !== "undefined" && !redirecting) {
      redirecting = true;
      ["applicant_token", "applicant_expiry", "applicant_number", "applicant_name"].forEach(k =>
        localStorage.removeItem(k)
      );
      window.location.href = "/applicant/login";
    }
    return Promise.reject(error);
  }
);

export default api;
