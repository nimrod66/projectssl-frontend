"use client";

import { useEffect, useState, useCallback } from "react";
import api from "@/app/staff/auth/api";
import toast from "react-hot-toast";
import { FiPlus, FiX, FiUsers, FiTarget, FiRefreshCw } from "react-icons/fi";
import {
  Campaign, CampaignMember,
  campaignStatusLabels, campaignStatusTone, CAMPAIGN_TRANSITIONS,
  fmtDate,
} from "@/app/staff/lib/recruitment";

interface ApplicantOption { id: number; fullName: string; applicantNumber: string; applicantType: string; }

const emptyForm = { name: "", description: "", targetApplicantType: "LOCAL", startDate: "", endDate: "" };

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [applicants, setApplicants] = useState<ApplicantOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [busy, setBusy] = useState(false);

  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Campaign | null>(null);
  const [form, setForm] = useState(emptyForm);

  const [members, setMembers] = useState<Campaign | null>(null);
  const [addApplicantId, setAddApplicantId] = useState("");
  const [memberBusy, setMemberBusy] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [cRes, aRes] = await Promise.all([
        api.get("/api/campaigns"),
        api.get("/api/applicants"),
      ]);
      setCampaigns(Array.isArray(cRes.data) ? cRes.data : []);
      setApplicants(Array.isArray(aRes.data) ? aRes.data : []);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to load campaigns");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const openCreate = () => { setEditing(null); setForm(emptyForm); setShowModal(true); };
  const openEdit = (c: Campaign) => {
    setEditing(c);
    setForm({
      name: c.name,
      description: c.description || "",
      targetApplicantType: c.targetApplicantType,
      startDate: c.startDate || "",
      endDate: c.endDate || "",
    });
    setShowModal(true);
  };

  const save = async () => {
    if (!form.name.trim()) { toast.error("Name is required"); return; }
    setBusy(true);
    try {
      const body = {
        name: form.name,
        description: form.description || undefined,
        targetApplicantType: form.targetApplicantType,
        startDate: form.startDate || undefined,
        endDate: form.endDate || undefined,
      };
      const res = editing
        ? await api.put(`/api/campaigns/${editing.id}`, body)
        : await api.post("/api/campaigns", body);
      setCampaigns(prev => editing
        ? prev.map(c => c.id === editing.id ? res.data : c)
        : [res.data, ...prev]);
      toast.success(editing ? "Campaign updated" : "Campaign created");
      setShowModal(false);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Save failed");
    } finally { setBusy(false); }
  };

  const transition = async (c: Campaign, status: string) => {
    setBusy(true);
    try {
      const res = await api.patch(`/api/campaigns/${c.id}/status`, { status });
      setCampaigns(prev => prev.map(x => x.id === c.id ? res.data : x));
      toast.success(`Campaign is now ${campaignStatusLabels[status]}`);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Status change failed");
    } finally { setBusy(false); }
  };

  const removeMember = async (m: CampaignMember) => {
    if (!members) return;
    setMemberBusy(true);
    try {
      const res = await api.delete(`/api/campaigns/${members.id}/applicants/${m.applicantId}`);
      setMembers(res.data);
      setCampaigns(prev => prev.map(c => c.id === members.id ? res.data : c));
      toast.success("Member removed");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Remove failed");
    } finally { setMemberBusy(false); }
  };

  const addMember = async () => {
    if (!members || !addApplicantId) return;
    setMemberBusy(true);
    try {
      const res = await api.post(`/api/campaigns/${members.id}/applicants`, { applicantId: Number(addApplicantId) });
      setMembers(res.data);
      setCampaigns(prev => prev.map(c => c.id === members.id ? res.data : c));
      setAddApplicantId("");
      toast.success("Member added");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Add failed");
    } finally { setMemberBusy(false); }
  };

  const filtered = filter === "all" ? campaigns : campaigns.filter(c => c.status === filter);

  const inputCls = "w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500";

  if (loading) {
    return <div className="p-6 max-w-5xl mx-auto space-y-4">{Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-20 bg-slate-100 rounded-2xl animate-pulse" />)}</div>;
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Campaigns</h1>
          <p className="text-sm text-slate-500 mt-0.5">Recruitment drives and applicant outreach</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={load} className="p-2 rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-50" title="Refresh"><FiRefreshCw className="w-4 h-4" /></button>
          <button onClick={openCreate} className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700">
            <FiPlus className="w-4 h-4" /> New campaign
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-1 bg-slate-100 p-1 rounded-xl mb-6 w-fit">
        {["all", ...Object.keys(campaignStatusLabels)].map(f => (
          <button key={f} onClick={() => setFilter(f)} className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${filter === f ? "bg-white text-indigo-700 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}>
            {f === "all" ? "All" : campaignStatusLabels[f]}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center">
          <FiTarget className="w-8 h-8 text-slate-300 mx-auto mb-3" />
          <p className="text-sm text-slate-400">No campaigns yet. Create one to start recruiting.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                <th className="px-5 py-3">Campaign</th>
                <th className="px-5 py-3 hidden md:table-cell">Target</th>
                <th className="px-5 py-3 hidden sm:table-cell">Dates</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3">Members</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(c => (
                <tr key={c.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/60 transition">
                  <td className="px-5 py-3">
                    <p className="font-semibold text-slate-800">{c.name}</p>
                    {c.description && <p className="text-xs text-slate-400 truncate max-w-[240px]">{c.description}</p>}
                  </td>
                  <td className="px-5 py-3 hidden md:table-cell text-slate-600">{c.targetApplicantType === "LOCAL" ? "Local" : "International"}</td>
                  <td className="px-5 py-3 hidden sm:table-cell text-xs text-slate-500">
                    {c.startDate ? fmtDate(c.startDate) : "—"} → {c.endDate ? fmtDate(c.endDate) : "—"}
                  </td>
                  <td className="px-5 py-3">
                    <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${campaignStatusTone[c.status] || "bg-slate-100 text-slate-600"}`}>{campaignStatusLabels[c.status] || c.status}</span>
                  </td>
                  <td className="px-5 py-3">
                    <button onClick={() => { setMembers(c); setAddApplicantId(""); }} className="inline-flex items-center gap-1.5 text-sm text-indigo-600 hover:underline">
                      <FiUsers className="w-3.5 h-3.5" /> {c.members.length}
                    </button>
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <select
                        value=""
                        onChange={e => { if (e.target.value) transition(c, e.target.value); }}
                        disabled={busy || CAMPAIGN_TRANSITIONS[c.status]?.length === 0}
                        className="px-2 py-1.5 rounded-lg border border-slate-200 text-xs"
                      >
                        <option value="">Move to…</option>
                        {(CAMPAIGN_TRANSITIONS[c.status] || []).map(s => (
                          <option key={s} value={s}>{campaignStatusLabels[s]}</option>
                        ))}
                      </select>
                      <button onClick={() => openEdit(c)} className="px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs text-slate-600 hover:bg-slate-50">Edit</button>
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
              <h2 className="text-lg font-bold text-slate-900">{editing ? "Edit campaign" : "New campaign"}</h2>
              <button onClick={() => setShowModal(false)} className="p-1.5 rounded-lg hover:bg-slate-100"><FiX className="w-5 h-5 text-slate-500" /></button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Name</label>
                <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Q3 Domestic Staff Drive" className={inputCls} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Description</label>
                <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={2} placeholder="Optional" className={inputCls} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Target applicant type</label>
                <select value={form.targetApplicantType} onChange={e => setForm(f => ({ ...f, targetApplicantType: e.target.value }))} className={inputCls}>
                  <option value="LOCAL">Local</option>
                  <option value="INTERNATIONAL">International</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Start date</label>
                  <input type="date" value={form.startDate} onChange={e => setForm(f => ({ ...f, startDate: e.target.value }))} className={inputCls} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">End date</label>
                  <input type="date" value={form.endDate} onChange={e => setForm(f => ({ ...f, endDate: e.target.value }))} className={inputCls} />
                </div>
              </div>
            </div>
            <div className="flex gap-3 pt-5">
              <button onClick={() => setShowModal(false)} className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-sm font-semibold">Cancel</button>
              <button onClick={save} disabled={busy} className="flex-1 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 disabled:opacity-50">
                {busy ? "Saving..." : editing ? "Save changes" : "Create campaign"}
              </button>
            </div>
          </div>
        </div>
      )}

      {members && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setMembers(null)}>
          <div className="bg-white rounded-2xl w-full max-w-lg p-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-slate-900">Members — {members.name}</h2>
              <button onClick={() => setMembers(null)} className="p-1.5 rounded-lg hover:bg-slate-100"><FiX className="w-5 h-5 text-slate-500" /></button>
            </div>
            <div className="flex gap-2 mb-4">
              <select value={addApplicantId} onChange={e => setAddApplicantId(e.target.value)} className="flex-1 px-3 py-2 rounded-lg border border-slate-200 text-sm">
                <option value="">Add applicant…</option>
                {applicants
                  .filter(x => !members.members.some(m => m.applicantId === x.id))
                  .map(x => <option key={x.id} value={x.id}>{x.fullName} · {x.applicantNumber}</option>)}
              </select>
              <button onClick={addMember} disabled={!addApplicantId || memberBusy} className="px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-semibold disabled:opacity-50">Add</button>
            </div>
            {members.members.length === 0 ? (
              <p className="text-sm text-slate-400 py-3 text-center">No members yet</p>
            ) : (
              <div className="space-y-1.5 max-h-72 overflow-y-auto">
                {members.members.map(m => (
                  <div key={m.id} className="flex items-center justify-between py-2 px-3 rounded-lg border border-slate-100">
                    <div>
                      <p className="text-sm font-semibold text-slate-800">{m.applicantName}</p>
                      <p className="text-xs text-slate-400">{m.applicantNumber} · added {fmtDate(m.addedAt)}</p>
                    </div>
                    <button onClick={() => removeMember(m)} disabled={memberBusy} className="text-xs text-red-500 hover:underline">Remove</button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}