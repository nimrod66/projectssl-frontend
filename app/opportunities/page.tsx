"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";
import { FiSearch, FiMapPin, FiBriefcase, FiClock, FiArrowRight, FiUsers } from "react-icons/fi";
import { Opportunity, API_BASE, formatSalary, positionsLeft, deadlineLabel, expired } from "@/app/lib/opportunity";

const inputCls = "w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition";

export default function OpportunitiesPage() {
  const [all, setAll] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [country, setCountry] = useState("");
  const [category, setCategory] = useState("");
  const [error, setError] = useState("");

  const fetchList = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/public/opportunities`);
      if (!res.ok) throw new Error("Failed to load opportunities");
      const data = await res.json();
      setAll(Array.isArray(data) ? data : []);
    } catch {
      setError("We couldn't load current openings right now. Please try again shortly.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchList(); }, [fetchList]);

  const countries = Array.from(new Set(all.map(o => o.country).filter(Boolean))).sort();
  const categories = Array.from(new Set(all.map(o => o.jobCategory).filter(Boolean))).sort();

  const filtered = all.filter(o => {
    if (expired(o.applicationDeadline)) return false;
    const q = search.toLowerCase();
    if (q && ![o.title, o.country, o.location, o.jobCategory, o.employerName].filter(Boolean).some(s => s!.toLowerCase().includes(q))) return false;
    if (country && o.country !== country) return false;
    if (category && o.jobCategory !== category) return false;
    return true;
  });

  return (
    <main className="min-h-screen bg-slate-50">
      <Navbar />

      <section className="bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 text-white py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center">
          <p className="text-sm font-semibold text-indigo-300 uppercase tracking-wider mb-3">Now Recruiting</p>
          <h1 className="text-3xl sm:text-4xl font-extrabold mb-3">Open Opportunities</h1>
          <p className="text-slate-300 max-w-lg mx-auto mb-8">Pre-vetted international and domestic placements — apply with SSL Agency today.</p>
          <div className="max-w-md mx-auto relative">
            <FiSearch className="absolute left-3.5 top-3.5 w-5 h-5 text-slate-400" />
            <input type="text" placeholder="Search by title, country, or employer..."
              value={search} onChange={e => setSearch(e.target.value)}
              className="w-full pl-11 pr-4 py-3 rounded-xl text-slate-900 shadow-lg focus:outline-none focus:ring-2 focus:ring-indigo-300 text-sm" />
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex flex-wrap items-center gap-3 mb-8">
          <select value={country} onChange={e => setCountry(e.target.value)} className={inputCls}>
            <option value="">All countries</option>
            {countries.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <select value={category} onChange={e => setCategory(e.target.value)} className={inputCls}>
            <option value="">All categories</option>
            {categories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <span className="ml-auto text-sm text-slate-500">{filtered.length} opening{filtered.length === 1 ? "" : "s"}</span>
        </div>

        {error ? (
          <div className="text-center py-20">
            <p className="text-slate-500 mb-4">{error}</p>
            <button onClick={fetchList} className="px-5 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 transition">Retry</button>
          </div>
        ) : loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl border border-slate-100 p-6 space-y-3 animate-pulse">
                <div className="h-5 bg-slate-100 rounded-lg w-3/4" />
                <div className="h-4 bg-slate-100 rounded-lg w-1/2" />
                <div className="h-8 bg-slate-100 rounded-lg w-full mt-6" />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 text-slate-400">
            <FiBriefcase className="w-10 h-10 mx-auto mb-3 text-slate-300" />
            No open opportunities found{search || country || category ? " matching your filters" : " right now"}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map(o => (
              <Link key={o.id} href={`/opportunities/${o.id}`}
                className="group bg-white rounded-2xl border border-slate-100 overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex flex-col">
                <div className="p-6 flex flex-col flex-1">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <span className="text-[11px] font-semibold bg-indigo-50 text-indigo-600 px-2.5 py-1 rounded-full">{o.jobCategory || "General"}</span>
                    <span className="text-[11px] font-semibold bg-emerald-50 text-emerald-600 px-2.5 py-1 rounded-full shrink-0">{positionsLeft(o)} spots left</span>
                  </div>
                  <h3 className="font-bold text-slate-900 leading-snug group-hover:text-indigo-600 transition-colors">{o.title}</h3>
                  {o.employerName && <p className="text-sm text-slate-500 mt-0.5">{o.employerName}</p>}

                  <div className="mt-4 space-y-2 text-sm text-slate-500">
                    <p className="flex items-center gap-2"><FiMapPin className="w-4 h-4 text-slate-400 shrink-0" />{o.country}{o.location ? ` · ${o.location}` : ""}</p>
                    <p className="flex items-center gap-2"><FiUsers className="w-4 h-4 text-slate-400 shrink-0" />{formatSalary(o)}</p>
                    {o.durationMonths ? <p className="flex items-center gap-2"><FiClock className="w-4 h-4 text-slate-400 shrink-0" />{o.durationMonths} months</p> : null}
                  </div>

                  <div className="mt-auto pt-5 flex items-center justify-between">
                    <span className="text-xs font-medium text-amber-600">{deadlineLabel(o.applicationDeadline)}</span>
                    <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-indigo-600">
                      View details <FiArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        <div className="mt-16 text-center bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 rounded-3xl text-white p-10">
          <h2 className="text-2xl sm:text-3xl font-extrabold mb-2">Ready to work abroad?</h2>
          <p className="text-slate-300 max-w-lg mx-auto mb-6">Create your profile in minutes and get matched with vetted employers worldwide.</p>
          <Link href="/registration" className="inline-flex items-center gap-2 px-8 py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl transition-all shadow-lg shadow-indigo-600/20">
            Apply Now <FiArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      <Footer />
    </main>
  );
}