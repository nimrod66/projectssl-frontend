"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import api from "@/app/staff/auth/api";
import toast from "react-hot-toast";
import { FiPlus, FiX, FiRefreshCw, FiCheckSquare, FiLink } from "react-icons/fi";
import {
  RecruitmentTask,
  taskStatusLabels, taskStatusTone, taskPriorityLabels, taskPriorityTone,
  fmtDate,
} from "@/app/staff/lib/recruitment";

interface StaffOption { id: number; fullName: string; role: string; }
interface ApplicantOption { id: number; fullName: string; applicantNumber: string; }
interface OpportunityOption { id: number; title: string; }

const emptyForm = { title: "", description: "", priority: "MEDIUM", assignedToId: "", relatedApplicantId: "", relatedOpportunityId: "", dueDate: "" };

export default function RecruitmentTasksPage() {
  const [tasks, setTasks] = useState<RecruitmentTask[]>([]);
  const [staffList, setStaffList] = useState<StaffOption[]>([]);
  const [applicants, setApplicants] = useState<ApplicantOption[]>([]);
  const [opportunities, setOpportunities] = useState<OpportunityOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [busy, setBusy] = useState(false);

  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<RecruitmentTask | null>(null);
  const [form, setForm] = useState(emptyForm);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [tRes, sRes, aRes, oRes] = await Promise.all([
        api.get("/api/recruitment/tasks"),
        api.get("/api/staff"),
        api.get("/api/applicants"),
        api.get("/api/opportunities"),
      ]);
      setTasks(Array.isArray(tRes.data) ? tRes.data : []);
      setStaffList(Array.isArray(sRes.data) ? sRes.data : []);
      setApplicants(Array.isArray(aRes.data) ? aRes.data : []);
      setOpportunities(Array.isArray(oRes.data) ? oRes.data : []);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to load tasks");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const openCreate = () => { setEditing(null); setForm(emptyForm); setShowModal(true); };
  const openEdit = (t: RecruitmentTask) => {
    setEditing(t);
    setForm({
      title: t.title,
      description: t.description || "",
      priority: t.priority,
      assignedToId: t.assignedToId != null ? String(t.assignedToId) : "",
      relatedApplicantId: t.relatedApplicantId != null ? String(t.relatedApplicantId) : "",
      relatedOpportunityId: t.relatedOpportunityId != null ? String(t.relatedOpportunityId) : "",
      dueDate: t.dueDate || "",
    });
    setShowModal(true);
  };

  const save = async () => {
    if (!form.title.trim()) { toast.error("Title is required"); return; }
    setBusy(true);
    try {
      const body = {
        title: form.title,
        description: form.description || undefined,
        priority: form.priority,
        assignedToId: form.assignedToId ? Number(form.assignedToId) : undefined,
        relatedApplicantId: form.relatedApplicantId ? Number(form.relatedApplicantId) : undefined,
        relatedOpportunityId: form.relatedOpportunityId ? Number(form.relatedOpportunityId) : undefined,
        dueDate: form.dueDate || undefined,
      };
      const res = editing
        ? await api.put(`/api/recruitment/tasks/${editing.id}`, body)
        : await api.post("/api/recruitment/tasks", body);
      setTasks(prev => editing
        ? prev.map(t => t.id === editing.id ? res.data : t)
        : [res.data, ...prev]);
      toast.success(editing ? "Task updated" : "Task created");
      setShowModal(false);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Save failed");
    } finally { setBusy(false); }
  };

  const transition = async (t: RecruitmentTask, status: string) => {
    setBusy(true);
    try {
      const res = await api.patch(`/api/recruitment/tasks/${t.id}/status`, { status });
      setTasks(prev => prev.map(x => x.id === t.id ? res.data : x));
      toast.success(`Task marked ${taskStatusLabels[status]}`);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Status change failed");
    } finally { setBusy(false); }
  };

  const filtered = filter === "all" ? tasks : tasks.filter(t => t.status === filter);

  const inputCls = "w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500";

  if (loading) {
    return <div className="p-6 max-w-5xl mx-auto space-y-4">{Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-16 bg-slate-100 rounded-2xl animate-pulse" />)}</div>;
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Recruitment Tasks</h1>
          <p className="text-sm text-slate-500 mt-0.5">Assign and track follow-up work across applicants and opportunities</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={load} className="p-2 rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-50" title="Refresh"><FiRefreshCw className="w-4 h-4" /></button>
          <button onClick={openCreate} className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700">
            <FiPlus className="w-4 h-4" /> New task
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-1 bg-slate-100 p-1 rounded-xl mb-6 w-fit">
        {["all", ...Object.keys(taskStatusLabels)].map(f => (
          <button key={f} onClick={() => setFilter(f)} className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${filter === f ? "bg-white text-indigo-700 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}>
            {f === "all" ? "All" : taskStatusLabels[f]}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center">
          <FiCheckSquare className="w-8 h-8 text-slate-300 mx-auto mb-3" />
          <p className="text-sm text-slate-400">No tasks here yet.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                <th className="px-5 py-3">Task</th>
                <th className="px-5 py-3 hidden md:table-cell">Assignee</th>
                <th className="px-5 py-3 hidden sm:table-cell">Due</th>
                <th className="px-5 py-3">Priority</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(t => (
                <tr key={t.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/60 transition">
                  <td className="px-5 py-3">
                    <p className="font-semibold text-slate-800">{t.title}</p>
                    {t.description && <p className="text-xs text-slate-400 truncate max-w-[260px]">{t.description}</p>}
                    {(t.relatedApplicantId || t.relatedOpportunityId) && (
                      <div className="flex items-center gap-2 mt-0.5">
                        {t.relatedApplicantId && (
                          <Link href={`/staff/dashboard/recruitment/applicants/${t.relatedApplicantId}`} className="inline-flex items-center gap-0.5 text-xs text-indigo-600 hover:underline">
                            <FiLink className="w-3 h-3" /> Applicant
                          </Link>
                        )}
                        {t.relatedOpportunityId && (
                          <Link href="/staff/dashboard/recruitment/opportunities" className="inline-flex items-center gap-0.5 text-xs text-indigo-600 hover:underline">
                            <FiLink className="w-3 h-3" /> Opportunity
                          </Link>
                        )}
                      </div>
                    )}
                  </td>
                  <td className="px-5 py-3 hidden md:table-cell text-slate-600">{t.assignedToName || "Unassigned"}</td>
                  <td className="px-5 py-3 hidden sm:table-cell text-xs text-slate-500">{t.dueDate ? fmtDate(t.dueDate) : "—"}</td>
                  <td className="px-5 py-3">
                    <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${taskPriorityTone[t.priority] || "bg-slate-100 text-slate-600"}`}>{taskPriorityLabels[t.priority] || t.priority}</span>
                  </td>
                  <td className="px-5 py-3">
                    <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${taskStatusTone[t.status] || "bg-slate-100 text-slate-600"}`}>{taskStatusLabels[t.status] || t.status}</span>
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <select
                        value=""
                        onChange={e => { if (e.target.value) transition(t, e.target.value); }}
                        disabled={busy}
                        className="px-2 py-1.5 rounded-lg border border-slate-200 text-xs"
                      >
                        <option value="">Change status…</option>
                        {Object.keys(taskStatusLabels).map(s => (
                          <option key={s} value={s}>{taskStatusLabels[s]}</option>
                        ))}
                      </select>
                      <button onClick={() => openEdit(t)} className="px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs text-slate-600 hover:bg-slate-50">Edit</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-2xl w-full max-w-md p-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-slate-900">{editing ? "Edit task" : "New task"}</h2>
              <button onClick={() => setShowModal(false)} className="p-1.5 rounded-lg hover:bg-slate-100"><FiX className="w-5 h-5 text-slate-500" /></button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Title</label>
                <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="e.g. Call applicant to collect KRA PIN" className={inputCls} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Description</label>
                <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={2} placeholder="Optional" className={inputCls} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Priority</label>
                  <select value={form.priority} onChange={e => setForm(f => ({ ...f, priority: e.target.value }))} className={inputCls}>
                    {Object.keys(taskPriorityLabels).map(p => <option key={p} value={p}>{taskPriorityLabels[p]}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Due date</label>
                  <input type="date" value={form.dueDate} onChange={e => setForm(f => ({ ...f, dueDate: e.target.value }))} className={inputCls} />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Assign to</label>
                <select value={form.assignedToId} onChange={e => setForm(f => ({ ...f, assignedToId: e.target.value }))} className={inputCls}>
                  <option value="">Unassigned</option>
                  {staffList.map(s => <option key={s.id} value={s.id}>{s.fullName} ({s.role})</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Related applicant</label>
                  <select value={form.relatedApplicantId} onChange={e => setForm(f => ({ ...f, relatedApplicantId: e.target.value }))} className={inputCls}>
                    <option value="">None</option>
                    {applicants.map(x => <option key={x.id} value={x.id}>{x.fullName}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Related opportunity</label>
                  <select value={form.relatedOpportunityId} onChange={e => setForm(f => ({ ...f, relatedOpportunityId: e.target.value }))} className={inputCls}>
                    <option value="">None</option>
                    {opportunities.map(o => <option key={o.id} value={o.id}>{o.title}</option>)}
                  </select>
                </div>
              </div>
            </div>
            <div className="flex gap-3 pt-5">
              <button onClick={() => setShowModal(false)} className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-sm font-semibold">Cancel</button>
              <button onClick={save} disabled={busy} className="flex-1 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 disabled:opacity-50">
                {busy ? "Saving..." : editing ? "Save changes" : "Create task"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}