"use client";
import Link from "next/link";

export default function StaffHeroSection() {
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-purple-700" />
      <div className="relative container mx-auto py-16 sm:py-24 px-4 text-center text-white">
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold mb-3">
          Welcome to the Starnet Staff Portal
        </h1>
        <p className="opacity-90 mb-8 max-w-2xl mx-auto text-sm sm:text-base">
          Manage applications and your account with a fast, modern experience.
        </p>
        <div className="flex items-center justify-center gap-3 sm:gap-4">
          <Link href="/staff/registration">
            <button className="px-5 sm:px-6 py-2.5 rounded-lg bg-yellow-400 text-purple-900 hover:bg-yellow-300 font-semibold shadow">
              Register
            </button>
          </Link>
          <Link href="/staff/login">
            <button className="px-5 sm:px-6 py-2.5 rounded-lg bg-white/10 hover:bg-white/20 text-white font-semibold border border-white/20 shadow">
              Login
            </button>
          </Link>
        </div>
      </div>
      <svg
        className="absolute bottom-0 left-0 w-full"
        viewBox="0 0 1440 120"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          fill="currentColor"
          className="text-white/10"
          d="M0 24l48 10.7C96 45 192 67 288 72c96 5 192-5 288-24s192-43 288-37.3C960 16 1056 48 1152 64s192 16 240 16v40H0V24z"
        />
      </svg>
    </section>
  );
}
