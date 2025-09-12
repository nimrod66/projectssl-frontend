"use client";

import Link from "next/link";

export default function StaffNavbar() {
  return (
    <nav className="bg-base-300 shadow-md">
      <div className="container mx-auto flex justify-between items-center p-4">
        {/* Logo / Brand */}
        <Link href="/staff" className="text-2xl font-bold text-primary">
          Staff Portal
        </Link>

        {/* Navigation Buttons */}
        <div className="flex space-x-4">
          <Link href="/staff/registration">
            <button className="btn btn-primary">Register</button>
          </Link>
          <Link href="/staff/login">
            <button className="btn btn-secondary">Login</button>
          </Link>
        </div>
      </div>
    </nav>
  );
}
