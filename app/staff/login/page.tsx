"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api from "../auth/api";
import toast from "react-hot-toast";

export default function StaffLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const res = await api.post("/api/auth/login", { email, password });
      const { token, role } = res.data;

      const expiry = Date.now() + 4 * 60 * 60 * 1000;

      localStorage.setItem("token", token);
      localStorage.setItem("expiry", expiry.toString());
      localStorage.setItem("role", role);

      setMessage("✅ Login successful!");
      toast.success("Login successful");

      if (role === "SUPER_ADMIN") {
        router.push("/staff/dashboard/control");
      } else if (role === "ADMIN") {
        router.push("/staff/dashboard/admin");
      } else {
        router.push("/staff/dashboard/receptionist");
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || "Login failed";
      setMessage("❌ " + msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-r from-purple-50 to-yellow-50 p-8 rounded-lg">
      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="px-6 py-5 bg-gradient-to-r from-purple-600 to-purple-700 text-white">
          <h2 className="text-2xl font-bold mb-4">Staff Login</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input input-bordered w-full"
              required
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input input-bordered w-full"
              required
            />
            <button
              type="submit"
              className="btn w-full bg-yellow-400 text-purple-800 hover:bg-yellow-500 font-semibold"
              disabled={loading}
            >
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>
          <div className="mt-4 text-sm text-center">
            <a
              href="/staff/registration"
              className="text-purple-200 hover:underline"
            >
              Don't have an account? Register here.
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
  );
}
