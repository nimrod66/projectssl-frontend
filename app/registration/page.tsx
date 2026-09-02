"use client";

import { useState } from "react";
import Footer from "@/app/components/Footer";
import Navbar from "@/app/components/Navbar";
import ApplicantRegistrationForm from "./components/ApplicantRegistrationForm";

export default function RegistrationPage() {
  const [tab, setTab] = useState<"local" | "international">("local");

  return (
    <main className="min-h-screen bg-slate-50">
      <Navbar />

      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 text-white py-12">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 text-center">
          <p className="text-sm font-semibold text-indigo-300 uppercase tracking-wider mb-3">Apply Now</p>
          <h1 className="text-3xl sm:text-4xl font-extrabold mb-3">Candidate Application</h1>
          <p className="text-slate-300">Register in minutes with your email and phone number.</p>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="flex justify-center gap-2 mb-8">
          {(["local", "international"] as const).map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-6 py-2.5 rounded-xl text-sm font-semibold transition-all ${tab === t ? "bg-indigo-600 text-white shadow-lg shadow-indigo-200" : "bg-white text-slate-600 border border-slate-200 hover:border-indigo-300"}`}>
              {t === "local" ? "Local (Domestic)" : "International"}
            </button>
          ))}
        </div>

        <ApplicantRegistrationForm type={tab === "local" ? "LOCAL" : "INTERNATIONAL"} />
      </div>

      <Footer />
    </main>
  );
}