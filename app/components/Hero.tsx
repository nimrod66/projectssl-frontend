"use client";

import Link from "next/link";

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950">
      <div className="absolute inset-0">
        <div className="absolute -top-40 -right-40 w-[40rem] h-[40rem] bg-indigo-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-[35rem] h-[35rem] bg-slate-500/5 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28 lg:py-36">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-slate-300 text-sm mb-6 animate-fade-up">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            Now accepting applications
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white leading-[1.05] mb-6 animate-fade-up delay-100">
            Your Bridge to <span className="text-indigo-300">Global Opportunity</span>
          </h1>

          <p className="text-lg sm:text-xl text-slate-300 max-w-2xl mb-8 leading-relaxed animate-fade-up delay-200">
            SSL Agency connects skilled professionals with leading employers worldwide.
            From domestic placements to international contracts — simple, safe, and fast.
          </p>

          <div className="flex flex-wrap gap-3 animate-fade-up delay-300">
            <Link href="/opportunities"
              className="inline-flex items-center gap-2 px-6 py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl transition-all duration-200 shadow-lg shadow-indigo-600/20 hover:shadow-indigo-500/30 hover:-translate-y-0.5">
              Browse Opportunities
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
            </Link>
            <Link href="/registration"
              className="inline-flex items-center gap-2 px-6 py-3.5 bg-white/5 hover:bg-white/10 text-white font-semibold rounded-xl border border-white/10 transition-all duration-200 hover:-translate-y-0.5">
              Apply as Candidate
            </Link>
            <Link href="/employers"
              className="inline-flex items-center gap-2 px-6 py-3.5 text-slate-400 hover:text-white font-semibold rounded-xl transition-colors">
              I'm an Employer
            </Link>
          </div>

          <div className="mt-14 flex flex-wrap items-center gap-x-8 gap-y-4 text-sm text-slate-400 animate-fade-up delay-500">
            {["Background Verified", "Professionally Trained", "Global Placements"].map((t, i) => (
              <div key={i} className="flex items-center gap-2">
                <svg className="w-5 h-5 text-emerald-400 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                {t}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
