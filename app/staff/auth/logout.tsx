"use client";

import { useRouter } from "next/navigation";

export default function useLogout() {
  const router = useRouter();

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("expiry");
    localStorage.removeItem("role");

    router.replace("/staff/login");
  };

  return logout;
}
