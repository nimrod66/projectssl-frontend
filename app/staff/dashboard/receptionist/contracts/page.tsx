"use client";
import { useEffect, useState } from "react";
import api from "@/app/staff/auth/api";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

interface Contract {
  id: number; employerId: number; employerName: string; jobCategory: string;
  country: string; numberOfPositions: number; filledPositions: number;
  salary: number; currency: string; startDate: string; endDate: string;
  status: string;
}

export default function ReceptionistContractsPage() {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    api.get("/api/contracts").then(r => setContracts(r.data)).catch(() => toast.error("Failed to load")).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-6 text-center text-gray-400">Loading contracts...</div>;

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="grid gap-4">
        {contracts.length === 0 && <p className="text-gray-400 text-center py-12">No contracts yet</p>}
        {contracts.map(c => (
          <div key={c.id} onClick={() => router.push(`/staff/dashboard/receptionist/contracts/${c.id}`)} className="bg-white rounded-xl shadow p-5 cursor-pointer hover:shadow-md transition border-l-4 border-indigo-500">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-bold text-lg text-gray-900">{c.employerName} — {c.jobCategory.replace(/_/g, " ")}</h3>
                <p className="text-sm text-gray-500">{c.country} | {c.filledPositions}/{c.numberOfPositions} filled | {c.salary} {c.currency}</p>
              </div>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${c.status === "OPEN" ? "bg-green-100 text-green-700" : c.status === "FILLED" ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-500"}`}>{c.status}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
