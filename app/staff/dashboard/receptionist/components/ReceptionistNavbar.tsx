"use client";

import Link from "next/link";
import useLogout from "@/app/staff/auth/logout";

export default function ReceptionistNavbar() {
  const logout = useLogout();
  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          {/* Logo */}
          <div className="flex items-center space-x-4">
            <Link href="/staff">
              <span className="text-2xl font-bold text-purple-600">
                Starnet Solutions Limited
              </span>
            </Link>
          </div>

          {/* CTA Buttons */}
          <div className="flex-none">
            <button
              onClick={logout}
              className="btn btn-error btn-sm text-white"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
