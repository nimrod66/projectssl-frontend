"use client";

import { useEffect, useState, useCallback } from "react";
import api from "@/app/staff/auth/api";
import toast from "react-hot-toast";
import { FiPlus, FiX } from "react-icons/fi";
import { Opportunity, OpportunityStatus, opportunityLabels, fmtDate } from "@/app/staff/lib/recruitment";

const TRANSITIONS: Record<string, string[]> = {
  DRAFT: ["PENDING_APPROVAL", "CLOSED"],
  PENDING_APPROVAL: ["OPEN", "DRAFT", "CLOSED"],
  OPEN: ["PAUSED", "FILLED", "CLOSED"],
  PAUSED: ["OPEN", "CLOSED"],
  FILLED: [], CLOSED: [],
};

const tone: Record<string, string> = {
  DRAFT: "bg-slate-100 text-slate-600", PENDING_APPROVAL: "bg-amber-50 text-amber-600",
  OPEN: "bg-emerald-50 text-emerald-600", PAUSED: "bg-sky-50 text-sky-600",
  FILLED: "bg-violet-50 text-violet-600", CLOSED: "bg-slate-100 text-slate-500",
};

interface Employer { id: number; companyName: string; }

interface FormState {
  employerId: string; title: string; description: string; country: string; location: string;
  jobCategory: string; numberOfPositions: string; salaryMinimum: string; salaryMaximum: string;
  currency: string; durationMonths: string; startDate: string; applicationDeadline: string;
  requiredExperience: string; requiredEducation: string; requiredSkills: string; requiredLanguages: string;
  minimumAge: string; maximumAge: string; genderRequirement: string;
  accommodationProvided: boolean; transportProvided: boolean;
}

const emptyForm: FormState = {
  employerId: "", title: "", description: "", country: "", location: "", jobCategory: "",
  numberOfPositions: "", salaryMinimum: "", salaryMaximum: "", currency: "USD", durationMonths: "",
  startDate: "", applicationDeadline: "", requiredExperience: "", requiredEducation: "",
  requiredSkills: "", requiredLanguages: "", minimumAge: "", maximumAge: "", genderRequirement: "",
  accommodationProvided: false, transportProvided: false,
};

const inputCls = "w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500";

export default function OpportunitiesPage() {
  const [all, setAll] = useState<Opportunity[]>([]);
  const [employers, setEmployers] = useState<Employer[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [busy, setBusy] = useState<number | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [o, e] = await Promise.all([api.get("/api/opportunities"), api.get("/api/employers")]);
      setAll(Array.isArray(o.data) ? o.data : []);
      setEmployers(Array.isArray(e.data) ? e.data : []);
    } catch {
      toast.error("Failed to load opportunities");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = statusFilter === "ALL" ? all : all.filter(o => o.status === statusFilter);

  const set = <K extends keyof FormState>(k: K, v: FormState[K]) => setForm(f => ({ ...f, [k]: v }));

  const create = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post("/api/opportunities", {
        employerId: Number(form.employerId),
        title: form.title,
        description: form.description || undefined,
        country: form.country,
        location: form.location || undefined,
        jobCategory: form.jobCategory || undefined,
        numberOfPositions: form.numberOfPositions ? Number(form.numberOfPositions) : 1,
        salaryMinimum: form.salaryMinimum ? Number(form.salaryMinimum) : undefined,
        salaryMaximum: form.salaryMaximum ? Number(form.salaryMaximum) : undefined,
        currency: form.currency || undefined,
        durationMonths: form.durationMonths ? Number(form.durationMonths) : undefined,
        startDate: form.startDate || undefined,
        applicationDeadline: form.applicationDeadline || undefined,
        requiredExperience: form.requiredExperience || undefined,
        requiredEducation: form.requiredEducation || undefined,
        requiredSkills: form.requiredSkills || undefined,
        requiredLanguages: form.requiredLanguages || undefined,
        minimumAge: form.minimumAge ? Number(form.minimumAge) : undefined,
        maximumAge: form.maximumAge ? Number(form.maximumAge) : undefined,
        genderRequirement: form.genderRequirement || undefined,
        accommodationProvided: form.accommodationProvided,
        transportProvided: form.transportProvided,
      });
      toast.success("Opportunity created as draft");
      setShowCreate(false);
      setForm(emptyForm);
      load();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to create opportunity");
    } finally { setSaving(false); }
  };

  const transition = async (id: number, target: string) => {
    setBusy(id);
    try {
      const res = await api.patch(`/api/opportunities/${id}/status`, { status: target });
      setAll(prev => prev.map(o => o.id === id ? { ...o, status: res.data.status, filledPositions: res.data.filledPositions } : o));
      toast.success(`Moved to ${opportunityLabels[res.data.status as OpportunityStatus]}`);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Transition failed");
    } finally { setBusy(null); }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Opportunities</h1>
          <p className="text-sm text-slate-500 mt-1">{filtered.length} opportunity{filtered.length === 1 ? "" : "s"}</p>
        </div>
        <button onClick={() => setShowCreate(true)} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 transition">
          <FiPlus className="w-4 h-4" /> New opportunity
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        <button onClick={() => setStatusFilter("ALL")}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${statusFilter === "ALL" ? "bg-indigo-600 text-white" : "bg-white text-slate-600 border border-slate-200"}`}>
          All ({all.length})
        </button>
        {Object.entries(opportunityLabels).map(([k, label]) => (
          <button key={k} onClick={() => setStatusFilter(k)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${statusFilter === k ? "bg-indigo-600 text-white" : "bg-white text-slate-600 border border-slate-200"}`}>
            {label} ({all.filter(o => o.status === k).length})
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">{Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-16 bg-slate-100 rounded-2xl animate-pulse" />)}</div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center text-slate-400">No opportunities found</div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                <th className="px-5 py-3">Title</th>
                <th className="px-5 py-3 hidden md:table-cell">Country</th>
                <th className="px-5 py-3 hidden lg:table-cell">Employer</th>
                <th className="px-5 py-3 hidden sm:table-cell">Spots</th>
                <th className="px-5 py-3 hidden lg:table-cell">Deadline</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3">Transition</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(o => {
                const opts = TRANSITIONS[o.status] || [];
                return (
                  <tr key={o.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/60 transition">
                    <td className="px-5 py-3">
                      <p className="font-semibold text-slate-900">{o.title}</p>
                      <p className="text-xs text-slate-400">{o.jobCategory || "General"}</p>
                    </td>
                    <td className="px-5 py-3 hidden md:table-cell text-slate-500">{o.country}{o.location ? ` · ${o.location}` : ""}</td>
                    <td className="px-5 py-3 hidden lg:table-cell text-slate-500">{o.employerName}</td>
                    <td className="px-5 py-3 hidden sm:table-cell text-slate-500">{Math.max(0, o.numberOfPositions - o.filledPositions)} / {o.numberOfPositions}</td>
                    <td className="px-5 py-3 hidden lg:table-cell text-slate-500">{o.applicationDeadline ? fmtDate(o.applicationDeadline) : "—"}</td>
                    <td className="px-5 py-3"><span className={`inline-block px-2.5 py-1 rounded-full text-[11px] font-semibold ${tone[o.status]}`}>{opportunityLabels[o.status]}</span></td>
                    <td className="px-5 py-3">
                      {opts.length === 0 ? (
                        <span className="text-xs text-slate-300">—</span>
                      ) : (
                        <select value="" onChange={e => { if (e.target.value) transition(o.id, e.target.value); }} disabled={busy === o.id}
                          className="px-2 py-1.5 rounded-lg border border-slate-200 text-xs disabled:opacity-50">
                          <option value="">Move to…</option>
                          {opts.map(t => <option key={t} value={t}>{opportunityLabels[t as OpportunityStatus]}</option>)}
                        </select>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {showCreate && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setShowCreate(false)}>
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-slate-900">Create Opportunity</h2>
              <button onClick={() => setShowCreate(false)} className="p-1.5 rounded-lg hover:bg-slate-100"><FiX className="w-5 h-5 text-slate-500" /></button>
            </div>
            <form onSubmit={create} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Employer *</label>
                  <select required value={form.employerId} onChange={e => set("employerId", e.target.value)} className={inputCls}>
                    <option value="">Select employer…</option>
                    {employers.map(e => <option key={e.id} value={e.id}>{e.companyName}</option>)}
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Title *</label>
                  <input required value={form.title} onChange={e => set("title", e.target.value)} className={inputCls} />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Description</label>
                  <textarea value={form.description} onChange={e => set("description", e.target.value)} rows={3} className={inputCls} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Country *</label>
                  <input required value={form.country} onChange={e => set("country", e.target.value)} className={inputCls} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Location</label>
                  <input value={form.location} onChange={e => set("location", e.target.value)} className={inputCls} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Category</label>
                  <input value={form.jobCategory} onChange={e => set("jobCategory", e.target.value)} placeholder="e.g. Domestic work" className={inputCls} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Positions *</label>
                  <input type="number" min={1} value={form.numberOfPositions} onChange={e => set("numberOfPositions", e.target.value)} className={inputCls} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Salary min</label>
                  <input type="number" value={form.salaryMinimum} onChange={e => set("salaryMinimum", e.target.value)} className={inputCls} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Salary max</label>
                  <input type="number" value={form.salaryMaximum} onChange={e => set("salaryMaximum", e.target.value)} className={inputCls} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Currency</label>
                  <input value={form.currency} onChange={e => set("currency", e.target.value)} className={inputCls} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Duration (months)</label>
                  <input type="number" value={form.durationMonths} onChange={e => set("durationMonths", e.target.value)} className={inputCls} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Start date</label>
                  <input type="date" value={form.startDate} onChange={e => set("startDate", e.target.value)} className={inputCls} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Deadline</label>
                  <input type="date" value={form.applicationDeadline} onChange={e => set("applicationDeadline", e.target.value)} className={inputCls} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Min age</label>
                  <input type="number" value={form.minimumAge} onChange={e => set("minimumAge", e.target.value)} className={inputCls} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Max age</label>
                  <input type="number" value={form.maximumAge} onChange={e => set("maximumAge", e.target.value)} className={inputCls} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Gender</label>
                  <select value={form.genderRequirement} onChange={e => set("genderRequirement", e.target.value)} className={inputCls}>
                    <option value="">Any</option>
                    <option value="MALE">Male</option>
                    <option value="FEMALE">Female</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>
                <div className="flex items-end gap-4">
                  <label className="flex items-center gap-2 text-sm text-slate-700"><input type="checkbox" checked={form.accommodationProvided} onChange={e => set("accommodationProvided", e.target.checked)} className="accent-indigo-600" /> Accommodation</label>
                  <label className="flex items-center gap-2 text-sm text-slate-700"><input type="checkbox" checked={form.transportProvided} onChange={e => set("transportProvided", e.target.checked)} className="accent-indigo-600" /> Transport</label>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Required experience</label>
                  <input value={form.requiredExperience} onChange={e => set("requiredExperience", e.target.value)} className={inputCls} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Required education</label>
                  <input value={form.requiredEducation} onChange={e => set("requiredEducation", e.target.value)} className={inputCls} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Required skills</label>
                  <input value={form.requiredSkills} onChange={e => set("requiredSkills", e.target.value)} className={inputCls} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Required languages</label>
                  <input value={form.requiredLanguages} onChange={e => set("requiredLanguages", e.target.value)} className={inputCls} />
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowCreate(false)} className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-sm font-semibold">Cancel</button>
                <button type="submit" disabled={saving} className="flex-1 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 disabled:opacity-50">
                  {saving ? "Creating..." : "Create draft"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}