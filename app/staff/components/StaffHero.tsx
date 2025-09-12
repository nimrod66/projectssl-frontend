"use client";
import Link from "next/link";

export default function StaffHeroSection() {
  return (
    <section className="bg-purple-300 py-20">
      <div className="container mx-auto text-center">
        <h1 className="text-4xl font-bold mb-4">
          Welcome to the Starnet Staff Portal
        </h1>
        <Link href="/staff/registration">
          <button className="btn w-50% bg-yellow-400 text-purple-800 hover:bg-yellow-500 font-semibold">
            Register
          </button>
        </Link>
        <Link href="/staff/login">
          <button className="btn w-50% bg-purple-400 text-yellow-200 hover:bg-purple-500 font-semibold">
            Login
          </button>
        </Link>
      </div>
    </section>
  );
}
