// app/register/page.tsx
"use client";

import { useState } from "react";
import api from "../auth/api";

export default function StaffRegistrationPage() {
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    role: "RECEPTIONIST", // default
    password: "",
    confirmPassword: "",
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    if (form.password !== form.confirmPassword) {
      setMessage("❌ Passwords do not match.");
      setLoading(false);
      return;
    }

    try {
      await api.post("/api/auth/register", {
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        phoneNumber: form.phoneNumber,
        role: form.role,
        password: form.password,
      });
      setMessage("✅ Registration successful! You can now log in.");
    } catch (err: any) {
      setMessage(
        "❌ " + (err.response?.data?.message || "Registration failed")
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-start md:items-center justify-center px-4 py-10 bg-gradient-to-br from-purple-50 to-yellow-50">
      <div className="w-full max-w-xl">
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="px-6 py-5 bg-gradient-to-r from-purple-600 to-purple-700 text-white">
            <h1 className="text-2xl font-bold justify-center">
              Staff Registration
            </h1>
            <br></br>
            <form onSubmit={handleSubmit} className="px-6 py-6 space-y-4">
              <input
                type="text"
                name="firstName"
                placeholder="First Name"
                value={form.firstName}
                onChange={handleChange}
                className="input input-bordered w-full"
                required
              />
              <input
                type="text"
                name="lastName"
                placeholder="Last Name"
                value={form.lastName}
                onChange={handleChange}
                className="input input-bordered w-full"
                required
              />
              <input
                type="email"
                name="email"
                placeholder="Email"
                value={form.email}
                onChange={handleChange}
                className="input input-bordered w-full"
                required
              />
              <input
                type="text"
                name="phoneNumber"
                placeholder="Phone Number"
                value={form.phoneNumber}
                onChange={handleChange}
                className="input input-bordered w-full"
                required
              />
              <select
                name="role"
                value={form.role}
                onChange={handleChange}
                className="select select-bordered w-full"
              >
                <option value="SUPER_ADMIN">Control</option>
                <option value="ADMIN">Admin</option>
                <option value="RECEPTIONIST">Receptionist</option>
              </select>
              <input
                type="password"
                name="password"
                placeholder="Password"
                value={form.password}
                onChange={handleChange}
                className="input input-bordered w-full"
                required
              />
              <input
                type="password"
                name="confirmPassword"
                placeholder="Confirm Password"
                value={form.confirmPassword}
                onChange={handleChange}
                className="input input-bordered w-full"
                required
              />

              <button
                type="submit"
                className="btn w-full bg-yellow-400 text-purple-800 hover:bg-yellow-500 font-semibold"
                disabled={loading}
              >
                {loading ? "Registering..." : "Register"}
              </button>
            </form>
            <div className="mt-4 text-sm text-center">
              <a
                href="/staff/login"
                className="text-purple-200 hover:underline"
              >
                Already have an account? Login here.
              </a>
            </div>
            <div className="mt-4 text-sm text-center">
              <a href="/staff" className="text-purple-200 hover:underline">
                Go Back to the homepage{" "}
              </a>
            </div>

            {message && <p className="mt-4 text-sm text-center">{message}</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
