"use client";

import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";
import Link from "next/link";

export default function StaffLandingPage() {
  return (
    <main className="min-h-screen bg-gray-50">
      <Navbar />

      <section className="bg-gradient-to-br from-gray-900 via-indigo-900 to-gray-900 text-white py-20 sm:py-28">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <h1 className="text-4xl sm:text-5xl font-extrabold mb-4">Staff Portal</h1>
          <p className="text-lg text-gray-300 mb-8">
            Manage candidates, contracts, and placements — all in one place.
            Secure access for administrators and receptionists.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/staff/login" className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl transition-colors shadow-lg">
              Sign In
            </Link>
            <Link href="/staff/registration" className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-xl border border-white/20 transition-colors">
              Register Staff Account
            </Link>
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { title: "Manage Candidates", desc: "Review, vet, approve, and track applicants across domestic and international pipelines.", color: "border-indigo-500" },
              { title: "Track Contracts", desc: "Create contracts, assign candidates, and monitor every placement through its full lifecycle.", color: "border-blue-500" },
              { title: "Real-time Reporting", desc: "Dashboard reports on active deployments, expiring contracts, revenue, and pipeline funnels.", color: "border-emerald-500" },
            ].map((c, i) => (
              <div key={i} className={`bg-white rounded-xl p-6 shadow-sm border-l-4 ${c.color} border border-gray-100`}>
                <h3 className="font-bold text-gray-900 text-lg mb-2">{c.title}</h3>
                <p className="text-gray-500 text-sm">{c.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
