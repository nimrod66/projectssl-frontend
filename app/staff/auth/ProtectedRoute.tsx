"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface Props {
  children: React.ReactNode;
  allowedRoles?: string[];
}

export default function ProtectedRoute({ children, allowedRoles }: Props) {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const expiry = localStorage.getItem("expiry");
    const role = localStorage.getItem("role");

    if (!token || !expiry || Date.now() > Number(expiry)) {
      localStorage.removeItem("token");
      localStorage.removeItem("expiry");
      localStorage.removeItem("role");
      router.replace("/staff/login");
      setIsAuthenticated(false);
      return;
    }
    if (allowedRoles && (!role || !allowedRoles.includes(role))) {
      router.replace("/staff/login");
      setIsAuthenticated(false);
      return;
    }

    setIsAuthenticated(true);
  }, [router, allowedRoles]);

  if (isAuthenticated === null) {
    return (
      <div className="flex items-center justify-center h-screen bg-base-200">
        <div className="flex flex-col items-center gap-4">
          <span className="loading loading-spinner loading-lg text-primary"></span>
          <p className="text-sm text-gray-600">Please Wait...</p>
        </div>
      </div>
    );
  }

  if (isAuthenticated) {
    return <>{children}</>;
  }

  return null;
}
