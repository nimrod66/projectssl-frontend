"use client";

import { useEffect, useState, useCallback } from "react";
import api from "@/app/staff/auth/api";
import toast from "react-hot-toast";
import { FiX } from "react-icons/fi";
import ApplicationDrawer from "./components/ApplicationDrawer";
import { RecruitmentApplication, applicationLabels, rejectionLabels, fmtDateTime } from "@/app/staff/lib/recruitment";

const tone: Record<string, string> = {
  SUBMITTED: "bg-slate-100 text-slate-600", SCREENING: "bg-sky-50 text-sky-600",
  SHORTLISTED: "bg-indigo-50 text-indigo-600", INTERVIEW: "bg-violet-50 text-violet-600",
  OFFERED: "bg-amber-50 text-amber-600", ACCEPTED: "bg-emerald-50 text-emerald-600",
  PLACED: "bg-emerald-600 text-white", REJECTED: "bg-red-50 text-red-600", WITHDRAWN: "bg-slate-100 text-slate-500",
};

const rejectionReasons = Object.keys(rejectionLabels);

export default function ApplicationsPage() {
  const [all, setAll] = useState<RecruitmentApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [busyId, setBusyId] = useState<number | null>(null);
  const [rejecting, setRejecting] = useState<RecruitmentApplication | null>(null);
  const [reason, setReason] = useState("OTHER");
  const [details, setDetails] = useState("");
  const [selected, setSelected] = useState<RecruitmentApplication | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const r = await api.get("/api/recruitment/applications");
      setAll(Array.isArray(r.data) ? r.data : []);
    } catch {
      toast.error("Failed to load applications");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = statusFilter === "ALL" ? all : all.filter(a => a.status === statusFilter);

  const act = async (id: number, fn: () => Promise<void>) => {
    setBusyId(id);
    try {
      await fn();
      load();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Action failed");
    } finally {
      setBusyId(null);
    }
  };

  const confirmReject = async () => {
    if (!rejecting) return;
    setBusyId(rejecting.id);
    try {
      await api.patch(`/api/recruitment/applications/${rejecting.id}/reject`, {
        reason: reason || undefined,
        details: details || undefined,
      });
      toast.success("Application rejected");
      setRejecting(null); setReason("OTHER"); setDetails("");
      load();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Rejection failed");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Applications</h1>
        <p className="text-sm text-slate-500 mt-1">{filtered.length} application{filtered.length === 1 ? "" : "s"}</p>
      </div>

      <div className="flex flex-wrap gap-2">
        <button onClick={() => setStatusFilter("ALL")}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${statusFilter === "ALL" ? "bg-indigo-600 text-white" : "bg-white text-slate-600 border border-slate-200"}`}>
          All ({all.length})
        </button>
        {Object.entries(applicationLabels).map(([k, label]) => (
          <button key={k} onClick={() => setStatusFilter(k)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${statusFilter === k ? "bg-indigo-600 text-white" : "bg-white text-slate-600 border border-slate-200"}`}>
            {label} ({all.filter(a => a.status === k).length})
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">{Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-16 bg-slate-100 rounded-2xl animate-pulse" />)}</div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center text-slate-400">No applications found</div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                <th className="px-5 py-3">Applicant</th>
                <th className="px-5 py-3 hidden md:table-cell">Opportunity</th>
                <th className="px-5 py-3 hidden lg:table-cell">Recruiter</th>
                <th className="px-5 py-3 hidden sm:table-cell">Applied</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(app => {
                const canScreen = app.status === "SUBMITTED";
                const canShortlist = app.status === "SCREENING";
                const canWithdraw = !["REJECTED", "WITHDRAWN", "PLACED"].includes(app.status);
                const canReject = !["REJECTED", "WITHDRAWN", "PLACED"].includes(app.status);
                return (
                  <tr key={app.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/60 transition">
                    <td className="px-5 py-3">
                      <p className="font-semibold text-slate-900">{app.applicantName}</p>
                      <p className="text-xs text-slate-400">{app.applicantNumber}</p>
                    </td>
                    <td className="px-5 py-3 hidden md:table-cell text-slate-600 max-w-[240px] truncate">{app.opportunityTitle}</td>
                    <td className="px-5 py-3 hidden lg:table-cell text-slate-500">{app.assignedRecruiterName || "—"}</td>
                    <td className="px-5 py-3 hidden sm:table-cell text-slate-500">{fmtDateTime(app.appliedAt)}</td>
                    <td className="px-5 py-3"><span className={`inline-block px-2.5 py-1 rounded-full text-[11px] font-semibold ${tone[app.status] || "bg-slate-100 text-slate-600"}`}>{applicationLabels[app.status]}</span></td>
                    <td className="px-5 py-3">
                      <div className="flex items-center justify-end gap-1.5">
                        {app.rejectionReason && <span className="text-[11px] text-red-500 font-medium">{rejectionLabels[app.rejectionReason] || app.rejectionReason}</span>}
                        <button onClick={() => setSelected(app)} className="px-3 py-1.5 rounded-lg bg-indigo-50 text-indigo-600 text-xs font-semibold hover:bg-indigo-100">Interviews & offers</button>
                        {canScreen && <button disabled={busyId === app.id} onClick={() => act(app.id, () => api.patch(`/api/recruitment/applications/${app.id}/screen`))} className="px-3 py-1.5 rounded-lg bg-sky-50 text-sky-600 text-xs font-semibold hover:bg-sky-100 disabled:opacity-50">Screen</button>}
                        {canShortlist && <button disabled={busyId === app.id} onClick={() => act(app.id, () => api.patch(`/api/recruitment/applications/${app.id}/shortlist`))} className="px-3 py-1.5 rounded-lg bg-indigo-50 text-indigo-600 text-xs font-semibold hover:bg-indigo-100 disabled:opacity-50">Shortlist</button>}
                        {canReject && <button disabled={busyId === app.id} onClick={() => { setRejecting(app); setReason("OTHER"); setDetails(""); }} className="px-3 py-1.5 rounded-lg bg-red-50 text-red-600 text-xs font-semibold hover:bg-red-100 disabled:opacity-50">Reject</button>}
                        {canWithdraw && <button disabled={busyId === app.id} onClick={() => act(app.id, () => api.patch(`/api/recruitment/applications/${app.id}/withdraw`, { reason: "Manual withdrawal" }))} className="px-3 py-1.5 rounded-lg bg-slate-100 text-slate-500 text-xs font-semibold hover:bg-slate-200 disabled:opacity-50">Withdraw</button>}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {rejecting && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setRejecting(null)}>
          <div className="bg-white rounded-2xl w-full max-w-md p-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-slate-900">Reject application</h2>
              <button onClick={() => setRejecting(null)} className="p-1.5 rounded-lg hover:bg-slate-100"><FiX className="w-5 h-5 text-slate-500" /></button>
            </div>
            <p className="text-sm text-slate-500 mb-4">{rejecting.applicantName} · {rejecting.opportunityTitle}</p>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Reason</label>
                <select value={reason} onChange={e => setReason(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm">
                  {rejectionReasons.map(r => <option key={r} value={r}>{rejectionLabels[r]}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Details</label>
                <textarea value={details} onChange={e => setDetails(e.target.value)} rows={3} placeholder="Optional notes" className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm" />
              </div>
              <div className="flex gap-3 pt-1">
                <button onClick={() => setRejecting(null)} className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-sm font-semibold">Cancel</button>
                <button onClick={confirmReject} disabled={busyId === rejecting.id} className="flex-1 py-2.5 rounded-xl bg-red-600 text-white text-sm font-semibold hover:bg-red-700 disabled:opacity-50">Confirm reject</button>
              </div>
            </div>
          </div>
        </div>
      )}
    <ApplicationDrawer app={selected} onClose={() => setSelected(null)} onChanged={load} />
    </div>
  );
}