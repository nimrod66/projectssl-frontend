"use client";

import { useEffect, useState } from "react";
import api from "@/app/staff/auth/api";
import { useRouter } from "next/navigation";
import Badge from "@/app/components/ui/Badge";

interface Contract { id: number; employerName: string; jobCategory: string; country: string; filledPositions: number; numberOfPositions: number; salary: number; currency: string; status: string; }

export default function OfficerContractsPage() {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => { api.get("/api/contracts").then(r => setContracts(r.data)).catch(() => {}).finally(() => setLoading(false)); }, []);

  if (loading) return <div className="p-6 text-gray-400">Loading...</div>;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Contracts</h1>
      <div className="space-y-3">
        {contracts.map(c => (
          <div key={c.id} onClick={() => router.push(`/staff/dashboard/officer/contracts/${c.id}`)}
            className="bg-white rounded-xl border border-gray-200 p-5 cursor-pointer hover:shadow-md transition">
            <div className="flex justify-between items-start">
              <div><h3 className="font-bold text-gray-900">{c.employerName} — {c.jobCategory.replace(/_/g," ")}</h3>
              <p className="text-sm text-gray-500">{c.country} | {c.filledPositions}/{c.numberOfPositions} filled | {c.salary} {c.currency}</p></div>
              <Badge variant={c.status === "OPEN" ? "success" : "info"}>{c.status}</Badge>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
