"use client";

import { useState, useEffect, useCallback } from "react";
import api from "@/app/staff/auth/api";
import Card from "@/app/components/ui/Card";
import Badge from "@/app/components/ui/Badge";
import PageHeader from "@/app/components/ui/PageHeader";
import EmptyState from "@/app/components/ui/EmptyState";
import PlacementPipeline from "@/app/components/ui/PlacementPipeline";
import toast from "react-hot-toast";
import { FiCheckSquare, FiXSquare, FiTrash2 } from "react-icons/fi";
import {SkeletonCard} from "@/app/components/ui/Skeleton";

interface Applicant {
  id: number; fullName: string; status: string; email: string; phoneNumber: string;
  nationality: string; currentLocation: string; experience: string;
  languages: string[]; createdAt: string; type: string;
}

const statusColors: Record<string, "default" | "success" | "warning" | "danger" | "info"> = {
  PENDING: "warning", VETTED: "info", APPROVED: "success", REJECTED: "danger", HIRED: "success",
};

export default function ApplicantsListPage() {
  const [tab, setTab] = useState<"local" | "international">("local");
  const [localData, setLocalData] = useState<Applicant[]>([]);
  const [intlData, setIntlData] = useState<Applicant[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [statusFilter, setStatusFilter] = useState("all");

  const data = tab === "local" ? localData : intlData;
  const endpoint = tab === "local" ? "/api/applications" : "/api/international";

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const url = statusFilter !== "all" ? `${endpoint}?status=${statusFilter.toUpperCase()}` : endpoint;
      const res = await api.get(url);
      const raw = Array.isArray(res.data) ? res.data : [];
      tab === "local" ? setLocalData(raw) : setIntlData(raw);
    } catch {} finally { setLoading(false); }
  }, [tab, statusFilter, endpoint]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const toggleSelect = (id: number) => {
    setSelected(prev => { const next = new Set(prev); next.has(id) ? next.delete(id) : next.add(id); return next; });
  };

  const selectAll = () => {
    if (selected.size === data.length) setSelected(new Set());
    else setSelected(new Set(data.map(d => d.id)));
  };

  const handleBulk = async (action: string) => {
    if (selected.size === 0) return;
    const confirmMsg = `${action.toUpperCase()} ${selected.size} applicant(s)?`;
    if (!window.confirm(confirmMsg)) return;
    try {
      await api.post(`${endpoint}/bulk`, { ids: Array.from(selected), action });
      toast.success(`${action} complete`);
      setSelected(new Set()); fetchData();
    } catch { toast.error(`${action} failed`); }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <PageHeader title="Applicants" description="Manage local and international candidates" />

      <div className="flex flex-wrap items-center gap-3 mb-4">
        <div className="flex gap-1 bg-gray-100 p-1 rounded-xl">
          {(["local", "international"] as const).map(t => (
            <button key={t} onClick={() => { setTab(t); setSelected(new Set()); }}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${tab === t ? "bg-white text-indigo-700 shadow-sm" : "text-gray-500"}`}>
              {t === "local" ? "Local" : "International"}
            </button>
          ))}
        </div>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
          className="border border-gray-300 rounded-lg text-sm px-3 py-2 ml-auto">
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="vetted">Vetted</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
          <option value="hired">Hired</option>
        </select>
      </div>

      {selected.size > 0 && (
        <div className="flex items-center gap-2 bg-indigo-50 rounded-xl px-4 py-2 mb-3">
          <span className="text-sm font-medium text-indigo-700">{selected.size} selected</span>
          <button onClick={() => handleBulk("vet")} className="px-3 py-1 rounded-lg bg-blue-100 text-blue-700 text-xs font-medium hover:bg-blue-200">Vet</button>
          <button onClick={() => handleBulk("approve")} className="px-3 py-1 rounded-lg bg-green-100 text-green-700 text-xs font-medium hover:bg-green-200">Approve</button>
          <button onClick={() => handleBulk("reject")} className="px-3 py-1 rounded-lg bg-red-100 text-red-700 text-xs font-medium hover:bg-red-200">Reject</button>
          <button onClick={() => handleBulk("archive")} className="px-3 py-1 rounded-lg bg-gray-100 text-gray-700 text-xs font-medium hover:bg-gray-200">Archive</button>
        </div>
      )}

      {loading ? (
        <div className="grid gap-4">{[...Array(4)].map((_, i) => <SkeletonCard key={i} />)}</div>
      ) : data.length === 0 ? (
        <EmptyState title="No applicants" description="No candidates match the current filters" />
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="w-10 px-4 py-3"><input type="checkbox" onChange={selectAll} checked={selected.size === data.length && data.length > 0} className="rounded" /></th>
                <th className="text-left px-3 py-3 font-medium text-gray-600">Name</th>
                <th className="text-left px-3 py-3 font-medium text-gray-600 hidden sm:table-cell">Contact</th>
                <th className="text-left px-3 py-3 font-medium text-gray-600 hidden md:table-cell">Location</th>
                <th className="text-left px-3 py-3 font-medium text-gray-600">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {data.map(a => (
                <tr key={a.id} className={`hover:bg-gray-50 ${tab === "local" ? "cursor-pointer" : ""}`} onClick={() => {
                  if (tab !== "local") return;
                  const url = `/staff/dashboard/admin/applicants/${a.id}`;
                  (window as any).open?.(url, "_self");
                }}>
                  <td className="px-4 py-3" onClick={e => e.stopPropagation()}><input type="checkbox" checked={selected.has(a.id)} onChange={() => toggleSelect(a.id)} className="rounded" /></td>
                  <td className="px-3 py-3 font-medium text-gray-900">{a.fullName}</td>
                  <td className="px-3 py-3 text-gray-500 hidden sm:table-cell">{a.email}</td>
                  <td className="px-3 py-3 text-gray-500 hidden md:table-cell">{a.currentLocation || a.nationality}</td>
                  <td className="px-3 py-3"><Badge variant={statusColors[a.status] || "neutral"}>{a.status}</Badge></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
