"use client";

import { useEffect, useState, useCallback } from "react";
import api from "@/app/staff/auth/api";
import toast from "react-hot-toast";
import { FiX, FiPlus } from "react-icons/fi";
import {
  Placement, PlacementStage, RecruitmentApplication,
  placementStageLabels, checkItemLabels, checkItemOrder, fmtDate,
} from "@/app/staff/lib/recruitment";

const TRANSITIONS: Record<string, string[]> = {
  CREATED: ["DOCUMENTATION", "TERMINATED", "RETURNED"],
  DOCUMENTATION: ["MEDICAL", "TERMINATED", "RETURNED"],
  MEDICAL: ["VISA", "TERMINATED", "RETURNED"],
  VISA: ["CONTRACT_SIGNED", "TERMINATED", "RETURNED"],
  CONTRACT_SIGNED: ["TRAVEL_READY", "TERMINATED", "RETURNED"],
  TRAVEL_READY: ["DEPLOYED", "TERMINATED", "RETURNED"],
  DEPLOYED: ["COMPLETED", "TERMINATED", "RETURNED"],
  COMPLETED: [], TERMINATED: [], RETURNED: [],
};

const tone: Record<string, string> = {
  CREATED: "bg-slate-100 text-slate-600", DOCUMENTATION: "bg-sky-50 text-sky-600",
  MEDICAL: "bg-cyan-50 text-cyan-600", VISA: "bg-violet-50 text-violet-600",
  CONTRACT_SIGNED: "bg-amber-50 text-amber-600", TRAVEL_READY: "bg-orange-50 text-orange-600",
  DEPLOYED: "bg-emerald-50 text-emerald-600", COMPLETED: "bg-emerald-600 text-white",
  TERMINATED: "bg-red-50 text-red-600", RETURNED: "bg-slate-100 text-slate-500",
};

export default function PlacementsPage() {
  const [all, setAll] = useState<Placement[]>([]);
  const [loading, setLoading] = useState(true);
  const [stageFilter, setStageFilter] = useState("ALL");
  const [busyId, setBusyId] = useState<number | null>(null);
  const [detail, setDetail] = useState<Placement | null>(null);
  const [transitioning, setTransitioning] = useState<Placement | null>(null);
  const [targetStage, setTargetStage] = useState("");
  const [reason, setReason] = useState("");
  const [acceptedApps, setAcceptedApps] = useState<RecruitmentApplication[]>([]);
  const [creating, setCreating] = useState(false);
  const [createForm, setCreateForm] = useState({ applicationId: "", startDate: "", expectedEndDate: "" });
  const [createBusy, setCreateBusy] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [pRes, aRes] = await Promise.all([
        api.get("/api/recruitment/placements"),
        api.get("/api/recruitment/applications"),
      ]);
      setAll(Array.isArray(pRes.data) ? pRes.data : []);
      setAcceptedApps((Array.isArray(aRes.data) ? aRes.data : []).filter(x => x.status === "ACCEPTED"));
    } catch {
      toast.error("Failed to load placements");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const refresh = async () => {
    if (detail) {
      const r = await api.get(`/api/recruitment/placements/${detail.id}`).catch(() => null);
      if (r) setDetail(r.data);
    }
    load();
  };

  const filtered = stageFilter === "ALL" ? all : all.filter(p => p.stage === stageFilter);

  const toggleCheck = async (item: string, completed: boolean) => {
    if (!detail) return;
    try {
      await api.patch(`/api/recruitment/placements/${detail.id}/checklist`, { item, completed });
      refresh();
      toast.success(completed ? "Check marked complete" : "Check reopened");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Update failed");
    }
  };

  const confirmTransition = async () => {
    if (!transitioning || !targetStage) return;
    setBusyId(transitioning.id);
    try {
      const res = await api.patch(`/api/recruitment/placements/${transitioning.id}/stage`, {
        stage: targetStage,
        reason: ["TERMINATED", "RETURNED"].includes(targetStage) ? reason : undefined,
      });
      toast.success(`Placement moved to ${placementStageLabels[res.data.stage as PlacementStage]}`);
      setTransitioning(null); setTargetStage(""); setReason("");
      if (detail) {
        const r = await api.get(`/api/recruitment/placements/${detail.id}`).catch(() => null);
        if (r) setDetail(r.data);
      }
      load();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Transition failed");
    } finally {
      setBusyId(null);
    }
  };

  const createPlacement = async () => {
    if (!createForm.applicationId) return;
    setCreateBusy(true);
    try {
      const res = await api.post("/api/recruitment/placements", {
        applicationId: Number(createForm.applicationId),
        startDate: createForm.startDate || undefined,
        expectedEndDate: createForm.expectedEndDate || undefined,
      });
      toast.success(`Placement ${res.data.placementNumber} created`);
      setCreating(false);
      setCreateForm({ applicationId: "", startDate: "", expectedEndDate: "" });
      load();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Create failed");
    } finally {
      setCreateBusy(false);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Placements</h1>
          <p className="text-sm text-slate-500 mt-1">{filtered.length} placement{filtered.length === 1 ? "" : "s"}</p>
        </div>
        <button onClick={() => { setCreating(true); setCreateForm({ applicationId: "", startDate: "", expectedEndDate: "" }); }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700">
          <FiPlus className="w-4 h-4" /> New placement
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        <button onClick={() => setStageFilter("ALL")}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${stageFilter === "ALL" ? "bg-indigo-600 text-white" : "bg-white text-slate-600 border border-slate-200"}`}>
          All ({all.length})
        </button>
        {Object.entries(placementStageLabels).map(([k, label]) => (
          <button key={k} onClick={() => setStageFilter(k)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${stageFilter === k ? "bg-indigo-600 text-white" : "bg-white text-slate-600 border border-slate-200"}`}>
            {label} ({all.filter(p => p.stage === k).length})
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">{Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-16 bg-slate-100 rounded-2xl animate-pulse" />)}</div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center text-slate-400">No placements found</div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                <th className="px-5 py-3">Placement</th>
                <th className="px-5 py-3 hidden md:table-cell">Opportunity</th>
                <th className="px-5 py-3 hidden lg:table-cell">Employer</th>
                <th className="px-5 py-3 hidden sm:table-cell">Start</th>
                <th className="px-5 py-3">Stage</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(p => {
                const opts = TRANSITIONS[p.stage] || [];
                return (
                  <tr key={p.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/60 transition">
                    <td className="px-5 py-3">
                      <p className="font-semibold text-slate-900">{p.applicantName}</p>
                      <p className="text-xs text-slate-400">{p.placementNumber}</p>
                    </td>
                    <td className="px-5 py-3 hidden md:table-cell text-slate-600 max-w-[240px] truncate">{p.opportunityTitle}</td>
                    <td className="px-5 py-3 hidden lg:table-cell text-slate-500">{p.employerName}</td>
                    <td className="px-5 py-3 hidden sm:table-cell text-slate-500">{p.startDate ? fmtDate(p.startDate) : "—"}</td>
                    <td className="px-5 py-3"><span className={`inline-block px-2.5 py-1 rounded-full text-[11px] font-semibold ${tone[p.stage]}`}>{placementStageLabels[p.stage]}</span></td>
                    <td className="px-5 py-3">
                      <div className="flex items-center justify-end gap-1.5">
                        <button onClick={() => setDetail(p)} className="px-3 py-1.5 rounded-lg bg-indigo-50 text-indigo-600 text-xs font-semibold hover:bg-indigo-100">Checklist</button>
                        {opts.length > 0 && (
                          <button onClick={() => { setTransitioning(p); setTargetStage(""); setReason(""); }} disabled={busyId === p.id}
                            className="px-3 py-1.5 rounded-lg bg-slate-100 text-slate-600 text-xs font-semibold hover:bg-slate-200 disabled:opacity-50">
                            Transition
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {transitioning && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setTransitioning(null)}>
          <div className="bg-white rounded-2xl w-full max-w-md p-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-slate-900">Transition placement</h2>
              <button onClick={() => setTransitioning(null)} className="p-1.5 rounded-lg hover:bg-slate-100"><FiX className="w-5 h-5 text-slate-500" /></button>
            </div>
            <p className="text-sm text-slate-500 mb-4">{transitioning.placementNumber} · {transitioning.applicantName}</p>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Target stage</label>
                <select value={targetStage} onChange={e => setTargetStage(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm">
                  <option value="">Select stage…</option>
                  {(TRANSITIONS[transitioning.stage] || []).map(t => <option key={t} value={t}>{placementStageLabels[t as PlacementStage]}</option>)}
                </select>
              </div>
              {["TERMINATED", "RETURNED"].includes(targetStage) && (
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Reason (required)</label>
                  <textarea value={reason} onChange={e => setReason(e.target.value)} rows={2} className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm" />
                </div>
              )}
              <div className="flex gap-3 pt-1">
                <button onClick={() => setTransitioning(null)} className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-sm font-semibold">Cancel</button>
                <button onClick={confirmTransition} disabled={!targetStage || busyId === transitioning.id}
                  className="flex-1 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 disabled:opacity-50">
                  {busyId === transitioning.id ? "..." : "Confirm"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {creating && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setCreating(false)}>
          <div className="bg-white rounded-2xl w-full max-w-md p-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-slate-900">Create placement</h2>
              <button onClick={() => setCreating(false)} className="p-1.5 rounded-lg hover:bg-slate-100"><FiX className="w-5 h-5 text-slate-500" /></button>
            </div>
            {acceptedApps.length === 0 ? (
              <p className="text-sm text-slate-400 py-3 text-center">No accepted applications to place. Accept an offer first.</p>
            ) : (
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Accepted application</label>
                  <select value={createForm.applicationId} onChange={e => setCreateForm(f => ({ ...f, applicationId: e.target.value }))} className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm">
                    <option value="">Select application…</option>
                    {acceptedApps.map(app => (
                      <option key={app.id} value={app.id}>{app.applicantName} · {app.opportunityTitle}</option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Start date</label>
                    <input type="date" value={createForm.startDate} onChange={e => setCreateForm(f => ({ ...f, startDate: e.target.value }))} className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Expected end</label>
                    <input type="date" value={createForm.expectedEndDate} onChange={e => setCreateForm(f => ({ ...f, expectedEndDate: e.target.value }))} className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm" />
                  </div>
                </div>
                <div className="flex gap-3 pt-1">
                  <button onClick={() => setCreating(false)} className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-sm font-semibold">Cancel</button>
                  <button onClick={createPlacement} disabled={!createForm.applicationId || createBusy}
                    className="flex-1 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 disabled:opacity-50">
                    {createBusy ? "..." : "Create placement"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {detail && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setDetail(null)}>
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-1">
              <h2 className="text-lg font-bold text-slate-900">Placement checklist</h2>
              <button onClick={() => setDetail(null)} className="p-1.5 rounded-lg hover:bg-slate-100"><FiX className="w-5 h-5 text-slate-500" /></button>
            </div>
            <p className="text-sm text-slate-500 mb-4">{detail.placementNumber} · {detail.applicantName} · {placementStageLabels[detail.stage]}</p>

            <div className="space-y-2 mb-6">
              {checkItemOrder.map(item => {
                const c = detail.checklist.find(x => x.item === item);
                const done = c?.completed ?? false;
                return (
                  <button key={item} onClick={() => toggleCheck(item, !done)} disabled={!detail.active}
                    className={`w-full flex items-center gap-3 p-3 rounded-xl border-2 text-left transition disabled:opacity-60 ${done ? "border-emerald-200 bg-emerald-50" : "border-slate-100 bg-white hover:border-indigo-200"}`}>
                    <span className={`w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 ${done ? "bg-emerald-500 border-emerald-500 text-white" : "border-slate-300"}`}>
                      {done && <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>}
                    </span>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-slate-800">{checkItemLabels[item]}</p>
                      {c?.completedByName && <p className="text-xs text-slate-400">Completed by {c.completedByName}{c.completedAt ? ` · ${fmtDate(c.completedAt)}` : ""}</p>}
                      {c?.notes && <p className="text-xs text-slate-400">{c.notes}</p>}
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="border-t border-slate-100 pt-4">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">History</p>
              {detail.history.length === 0 ? (
                <p className="text-sm text-slate-400">No history yet</p>
              ) : (
                <div className="space-y-2">
                  {detail.history.map(h => (
                    <div key={h.id} className="flex items-start justify-between gap-2 text-sm">
                      <div>
                        <p className="font-medium text-slate-700">
                          {h.fromStage ? `${placementStageLabels[h.fromStage as PlacementStage]} → ` : ""}{placementStageLabels[h.toStage as PlacementStage]}
                        </p>
                        {h.reason && <p className="text-xs text-slate-400">{h.reason}</p>}
                      </div>
                      <span className="text-xs text-slate-400 shrink-0">{fmtDate(h.createdAt)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}