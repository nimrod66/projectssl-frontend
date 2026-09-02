"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";
import { FiMail, FiLock, FiArrowRight, FiUserCheck } from "react-icons/fi";
import { setSession, isApplicantLoggedIn } from "@/app/applicant/auth/session";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "";

export default function ApplicantLoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isApplicantLoggedIn()) {
      router.replace("/applicant/portal");
    }
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!identifier.trim() || !password) {
      setError("Enter your email or phone number and password");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/applicants/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier: identifier.trim(), password }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(res.status === 403
          ? data.message || "This account is not active"
          : "Invalid email/phone or password");
      }
      setSession(data.token, data.applicantNumber, data.name);
      const next = searchParams.get("next");
      router.replace(next || "/applicant/portal");
    } catch (err: any) {
      setError(err.message || "Sign in failed");
    } finally {
      setLoading(false);
    }
  };

  const input = "w-full px-3.5 py-2.5 rounded-lg border text-sm text-slate-900 bg-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition border-slate-300";

  return (
    <main className="min-h-screen bg-slate-50">
      <Navbar />
      <div className="max-w-md mx-auto px-4 py-16 sm:py-20">
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-indigo-100 flex items-center justify-center mx-auto mb-4">
            <FiUserCheck className="w-7 h-7 text-indigo-600" />
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900">Applicant sign in</h1>
          <p className="text-sm text-slate-500 mt-1.5">Track your applications, upload documents and respond to offers.</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8 space-y-4">
          {error && (
            <div className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2.5">
              {error}
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Email or phone number</label>
            <div className="relative">
              <FiMail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input type="text" value={identifier} onChange={e => setIdentifier(e.target.value)}
                placeholder="you@example.com or 0712345678" className={`${input} pl-9`} />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Password</label>
            <div className="relative">
              <FiLock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input type="password" value={password} onChange={e => setPassword(e.target.value)}
                placeholder="Your password" className={`${input} pl-9`} />
            </div>
          </div>
          <button type="submit" disabled={loading}
            className="w-full inline-flex items-center justify-center gap-2 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-semibold rounded-xl transition-colors text-sm">
            {loading ? "Signing in..." : "Sign in"} {!loading && <FiArrowRight className="w-4 h-4" />}
          </button>
          <p className="text-xs text-slate-400 text-center">
            Don&apos;t have an account?{" "}
            <Link href="/registration" className="text-indigo-600 font-semibold hover:underline">Register now</Link>
          </p>
        </form>

        <p className="text-xs text-slate-400 text-center mt-6">
          Forgotten your details? Call us on{" "}
          <a href="tel:+254712345678" className="text-slate-600 font-medium hover:underline">+254 712 345 678</a>
        </p>
      </div>
      <Footer />
    </main>
  );
}
