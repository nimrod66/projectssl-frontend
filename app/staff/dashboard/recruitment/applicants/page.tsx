"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import api from "@/app/staff/auth/api";
import { FiSearch, FiArrowRight } from "react-icons/fi";
import { Applicant, lifecycleLabels, lifecycleOrder, ageFrom, fmtDate } from "@/app/staff/lib/recruitment";

const tone: Record<string, string> = {
  REGISTERED: "bg-slate-100 text-slate-600", PROFILE_COMPLETE: "bg-sky-50 text-sky-600",
  UNDER_REVIEW: "bg-amber-50 text-amber-600", VETTED: "bg-violet-50 text-violet-600",
  ELIGIBLE: "bg-emerald-50 text-emerald-600", INACTIVE: "bg-slate-100 text-slate-500",
  BLACKLISTED: "bg-red-50 text-red-600",
};

export default function ApplicantsListPage() {
  const [all, setAll] = useState<Applicant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [stage, setStage] = useState<string>("ALL");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const r = await api.get("/api/applicants");
      setAll(Array.isArray(r.data) ? r.data : []);
    } catch {
      setError("Failed to load applicants.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = all.filter(a => {
    if (stage !== "ALL" && a.lifecycleStage !== stage) return false;
    const q = search.toLowerCase();
    if (!q) return true;
    return [a.fullName, a.applicantNumber, a.phoneNumber, a.nationality, a.county].filter(Boolean)
      .some(s => s!.toLowerCase().includes(q));
  });

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Applicants</h1>
          <p className="text-sm text-slate-500 mt-1">{filtered.length} applicant{filtered.length === 1 ? "" : "s"}</p>
        </div>
        <Link href="/registration" className="px-4 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 transition">New Applicant</Link>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[220px]">
          <FiSearch className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name, number, phone, nationality..."
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
        </div>
        <select value={stage} onChange={e => setStage(e.target.value)} className="px-3 py-2.5 rounded-xl border border-slate-200 text-sm bg-white">
          <option value="ALL">All stages</option>
          {lifecycleOrder.map(s => <option key={s} value={s}>{lifecycleLabels[s]}</option>)}
        </select>
      </div>

      {error ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center">
          <p className="text-slate-500 mb-4">{error}</p>
          <button onClick={load} className="px-5 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-semibold">Retry</button>
        </div>
      ) : loading ? (
        <div className="space-y-3">
          {Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-16 bg-slate-100 rounded-2xl animate-pulse" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center text-slate-400">No applicants found</div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                <th className="px-5 py-3">Applicant</th>
                <th className="px-5 py-3 hidden sm:table-cell">Number</th>
                <th className="px-5 py-3 hidden md:table-cell">Type</th>
                <th className="px-5 py-3 hidden md:table-cell">Age / Gender</th>
                <th className="px-5 py-3 hidden lg:table-cell">Location</th>
                <th className="px-5 py-3 hidden lg:table-cell">Recruiter</th>
                <th className="px-5 py-3">Stage</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody>
              {filtered.map(a => {
                const age = ageFrom(a.dateOfBirth);
                return (
                  <tr key={a.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/60 transition">
                    <td className="px-5 py-3">
                      <p className="font-semibold text-slate-900">{a.fullName}</p>
                      <p className="text-xs text-slate-400">{a.phoneNumber}</p>
                    </td>
                    <td className="px-5 py-3 hidden sm:table-cell text-slate-500">{a.applicantNumber}</td>
                    <td className="px-5 py-3 hidden md:table-cell text-slate-500">{a.applicantType === "LOCAL" ? "Local" : "International"}</td>
                    <td className="px-5 py-3 hidden md:table-cell text-slate-500">{age != null ? `${age} yrs` : "—"}{a.gender ? ` · ${a.gender.charAt(0) + a.gender.slice(1).toLowerCase()}` : ""}</td>
                    <td className="px-5 py-3 hidden lg:table-cell text-slate-500">{a.county || a.nationality || "—"}</td>
                    <td className="px-5 py-3 hidden lg:table-cell text-slate-500">{a.assignedRecruiterName || "—"}</td>
                    <td className="px-5 py-3"><span className={`inline-block px-2.5 py-1 rounded-full text-[11px] font-semibold ${tone[a.lifecycleStage] || "bg-slate-100 text-slate-600"}`}>{lifecycleLabels[a.lifecycleStage]}</span></td>
                    <td className="px-5 py-3 text-right">
                      <Link href={`/staff/dashboard/recruitment/applicants/${a.id}`} className="inline-flex items-center gap-1 text-indigo-600 font-medium hover:underline">
                        View <FiArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}