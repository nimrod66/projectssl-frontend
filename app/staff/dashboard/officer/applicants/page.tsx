"use client";

import { useState, useEffect } from "react";
import api from "@/app/staff/auth/api";
import Badge from "@/app/components/ui/Badge";
import PageHeader from "@/app/components/ui/PageHeader";
import EmptyState from "@/app/components/ui/EmptyState";
import { SkeletonCard } from "@/app/components/ui/Skeleton";

interface Applicant { id: number; fullName: string; status: string; email: string; nationality: string; currentLocation: string; type: string; }

const statusColors: Record<string, "default" | "success" | "warning" | "danger" | "info"> = {
  PENDING: "warning", VETTED: "info", APPROVED: "success", REJECTED: "danger", HIRED: "success",
};

export default function OfficerApplicantsPage() {
  const [tab, setTab] = useState<"local"|"international">("local");
  const [data, setData] = useState<Applicant[]>([]);
  const [loading, setLoading] = useState(true);

  const endpoint = tab === "local" ? "/api/applications" : "/api/international";

  useEffect(() => {
    setLoading(true);
    api.get(endpoint).then(r => setData(Array.isArray(r.data) ? r.data : [])).catch(() => {}).finally(() => setLoading(false));
  }, [tab, endpoint]);

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <PageHeader title="Applicants" description="Review and vet candidates" />
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl mb-4 w-fit">
        {(["local","international"] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${tab === t ? "bg-white text-indigo-700 shadow-sm" : "text-gray-500"}`}>
            {t === "local" ? "Local" : "International"}
          </button>
        ))}
      </div>

      {loading ? <div className="grid gap-4">{[...Array(4)].map((_,i)=><SkeletonCard key={i}/>)}</div>
      : data.length === 0 ? <EmptyState title="No applicants" />
      : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-3 py-3 font-medium text-gray-600">Name</th>
                <th className="text-left px-3 py-3 font-medium text-gray-600 hidden sm:table-cell">Contact</th>
                <th className="text-left px-3 py-3 font-medium text-gray-600 hidden md:table-cell">Location</th>
                <th className="text-left px-3 py-3 font-medium text-gray-600">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {data.map(a => (
                <tr key={a.id} className="hover:bg-gray-50">
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
