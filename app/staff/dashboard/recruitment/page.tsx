"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import api from "@/app/staff/auth/api";
import { FiUsers, FiBriefcase, FiFileText, FiSend, FiArrowRight } from "react-icons/fi";
import {
  Applicant, RecruitmentApplication, Opportunity, Placement,
  lifecycleLabels, applicationLabels, opportunityLabels, placementStageLabels,
} from "@/app/staff/lib/recruitment";

interface Stats {
  applicants: Applicant[];
  opportunities: Opportunity[];
  applications: RecruitmentApplication[];
  placements: Placement[];
}

const ACTIVE_APP_STATUSES = ["SUBMITTED", "SCREENING", "SHORTLISTED", "INTERVIEW", "OFFERED", "ACCEPTED"];
const ACTIVE_PLACEMENT_STAGES = ["CREATED", "DOCUMENTATION", "MEDICAL", "VISA", "CONTRACT_SIGNED", "TRAVEL_READY", "DEPLOYED"];

export default function RecruitmentOverviewPage() {
  const [data, setData] = useState<Stats | null>(null);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setError("");
    try {
      const [a, o, ap, pl] = await Promise.all([
        api.get("/api/applicants").then(r => r.data as Applicant[]),
        api.get("/api/opportunities").then(r => r.data as Opportunity[]),
        api.get("/api/recruitment/applications").then(r => r.data as RecruitmentApplication[]),
        api.get("/api/recruitment/placements").then(r => r.data as Placement[]),
      ]);
      setData({
        applicants: Array.isArray(a) ? a : [],
        opportunities: Array.isArray(o) ? o : [],
        applications: Array.isArray(ap) ? ap : [],
        placements: Array.isArray(pl) ? pl : [],
      });
    } catch {
      setError("Failed to load recruitment data. Check that the backend is running.");
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  if (!data) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        {error ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center">
            <p className="text-slate-500 mb-4">{error}</p>
            <button onClick={load} className="px-5 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 transition">Retry</button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-28 bg-slate-100 rounded-2xl animate-pulse" />)}
          </div>
        )}
      </div>
    );
  }

  const { applicants, opportunities, applications, placements } = data;
  const openOpps = opportunities.filter(o => o.status === "OPEN");
  const activeApps = applications.filter(a => ACTIVE_APP_STATUSES.includes(a.status));
  const activePlacements = placements.filter(p => p.active);

  const counts: { label: string; value: number; href: string; icon: React.ReactNode; tone: string }[] = [
    { label: "Total Applicants", value: applicants.length, href: "/staff/dashboard/recruitment/applicants", icon: <FiUsers />, tone: "bg-indigo-50 text-indigo-600" },
    { label: "Open Opportunities", value: openOpps.length, href: "/staff/dashboard/recruitment/opportunities", icon: <FiBriefcase />, tone: "bg-emerald-50 text-emerald-600" },
    { label: "Active Applications", value: activeApps.length, href: "/staff/dashboard/recruitment/applications", icon: <FiFileText />, tone: "bg-amber-50 text-amber-600" },
    { label: "Active Placements", value: activePlacements.length, href: "/staff/dashboard/recruitment/placements", icon: <FiSend />, tone: "bg-indigo-50 text-indigo-600" },
  ];

  const lifecycleCounts = Object.entries(lifecycleLabels)
    .filter(([k]) => k !== "INACTIVE" && k !== "BLACKLISTED")
    .map(([k, label]) => ({ stage: k, label, count: applicants.filter(a => a.lifecycleStage === k).length }));

  const appCounts = Object.entries(applicationLabels).map(([k, label]) => ({
    status: k, label, count: applications.filter(a => a.status === k).length,
  }));

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Recruitment Overview</h1>
        <p className="text-sm text-slate-500 mt-1">Pipeline status across applicants, opportunities, applications and placements</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {counts.map(c => (
          <Link key={c.label} href={c.href} className="bg-white rounded-2xl border border-slate-100 p-5 hover:shadow-md transition group">
            <div className={`inline-flex items-center justify-center w-10 h-10 rounded-xl ${c.tone} mb-3`}>{c.icon}</div>
            <p className="text-2xl font-extrabold text-slate-900">{c.value}</p>
            <p className="text-sm text-slate-500 group-hover:text-indigo-600 transition">{c.label}</p>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-slate-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-slate-900">Applicants by Stage</h2>
            <Link href="/staff/dashboard/recruitment/applicants" className="text-xs text-indigo-600 hover:underline font-medium inline-flex items-center gap-1">View all <FiArrowRight className="w-3 h-3" /></Link>
          </div>
          <div className="space-y-3">
            {lifecycleCounts.map(({ stage, label, count }) => (
              <div key={stage} className="flex items-center gap-3">
                <span className="w-36 text-xs font-medium text-slate-600 truncate">{label}</span>
                <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${applicants.length ? (count / applicants.length) * 100 : 0}%` }} />
                </div>
                <span className="w-8 text-right text-xs font-semibold text-slate-700">{count}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-slate-900">Applications by Status</h2>
            <Link href="/staff/dashboard/recruitment/applications" className="text-xs text-indigo-600 hover:underline font-medium inline-flex items-center gap-1">View all <FiArrowRight className="w-3 h-3" /></Link>
          </div>
          <div className="space-y-3">
            {appCounts.map(({ status, label, count }) => (
              <div key={status} className="flex items-center gap-3">
                <span className="w-28 text-xs font-medium text-slate-600 truncate">{label}</span>
                <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${applications.length ? (count / applications.length) * 100 : 0}%` }} />
                </div>
                <span className="w-8 text-right text-xs font-semibold text-slate-700">{count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-slate-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-slate-900">Opportunities</h2>
            <Link href="/staff/dashboard/recruitment/opportunities" className="text-xs text-indigo-600 hover:underline font-medium inline-flex items-center gap-1">Manage <FiArrowRight className="w-3 h-3" /></Link>
          </div>
          <div className="flex flex-wrap gap-2">
            {Object.entries(opportunityLabels).map(([k, label]) => (
              <span key={k} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-50 text-xs font-semibold text-slate-700">
                {label}
                <span className="px-1.5 py-0.5 rounded-md bg-white border border-slate-200">{opportunities.filter(o => o.status === k).length}</span>
              </span>
            ))}
          </div>
          <div className="mt-4 space-y-2">
            {openOpps.slice(0, 5).map(o => (
              <div key={o.id} className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
                <div>
                  <p className="text-sm font-semibold text-slate-800">{o.title}</p>
                  <p className="text-xs text-slate-400">{o.country} · {o.employerName}</p>
                </div>
                <span className="text-xs font-semibold text-emerald-600">{Math.max(0, o.numberOfPositions - o.filledPositions)} spots</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-slate-900">Recent Placements</h2>
            <Link href="/staff/dashboard/recruitment/placements" className="text-xs text-indigo-600 hover:underline font-medium inline-flex items-center gap-1">View all <FiArrowRight className="w-3 h-3" /></Link>
          </div>
          {activePlacements.slice(0, 5).length === 0 ? (
            <p className="text-xs text-slate-400 py-4 text-center">No active placements</p>
          ) : (
            <div className="space-y-2">
              {activePlacements.slice(0, 5).map(p => (
                <div key={p.id} className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
                  <div>
                    <p className="text-sm font-semibold text-slate-800">{p.applicantName}</p>
                    <p className="text-xs text-slate-400">{p.opportunityTitle} · {p.employerName}</p>
                  </div>
                  <span className="text-xs font-semibold text-indigo-600">{placementStageLabels[p.stage]}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}