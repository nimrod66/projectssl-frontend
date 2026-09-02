"use client";

import { useEffect, useState } from "react";
import api from "@/app/staff/auth/api";
import { useParams, useRouter } from "next/navigation";
import Card from "@/app/components/ui/Card";
import Badge from "@/app/components/ui/Badge";
import StatCard from "@/app/components/ui/StatCard";
import PageHeader from "@/app/components/ui/PageHeader";
import EmptyState from "@/app/components/ui/EmptyState";
import { SkeletonCard } from "@/app/components/ui/Skeleton";
import { FiBriefcase, FiMapPin, FiPhone, FiMail, FiUsers } from "react-icons/fi";

interface Contract { id: number; jobCategory: string; country: string; numberOfPositions: number; filledPositions: number; salary: number; currency: string; status: string; startDate: string; endDate: string; }
interface Placement { id: number; candidateName: string; stage: string; startDate: string; }
interface Stats { totalContracts: number; activeContracts: number; pastContracts: number; totalPlacements: number; activePlacements: number; deployedPlacements: number; }
interface EmployerData {
  id: number; companyName: string; country: string; contactName: string; contactEmail: string;
  contactPhone: string; address: string; notes: string; status: string;
  stats: Stats; activeContracts: Contract[]; pastContracts: Contract[]; recentPlacements: Placement[];
}

export default function EmployerDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [data, setData] = useState<EmployerData | null>(null);

  useEffect(() => {
    api.get(`/api/employers/${id}/workspace`).then(r => setData(r.data)).catch(() => {});
  }, [id]);

  if (!data) return <div className="p-6 max-w-6xl mx-auto"><SkeletonCard /><SkeletonCard /></div>;

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <PageHeader title={data.companyName}
        description={`${data.country} · ${data.contactName || "No contact"}`}
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Active Contracts" value={data.stats.activeContracts} color="blue" />
        <StatCard label="Active Placements" value={data.stats.activePlacements} color="indigo" />
        <StatCard label="Deployed" value={data.stats.deployedPlacements} color="green" />
        <StatCard label="Total Placements" value={data.stats.totalPlacements} color="amber" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2"><FiBriefcase className="w-4 h-4" /> Active Contracts</h3>
            {data.activeContracts.length === 0 ? (
              <EmptyState title="No active contracts" />
            ) : (
              <div className="space-y-3">
                {data.activeContracts.map(c => (
                  <div key={c.id} onClick={() => router.push(`/staff/dashboard/admin/contracts/${c.id}`)}
                    className="p-4 border border-gray-200 rounded-xl hover:border-indigo-300 hover:shadow-sm cursor-pointer transition">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-semibold text-gray-900">{c.jobCategory.replace(/_/g, " ")}</p>
                        <p className="text-sm text-gray-500">{c.country} · {c.filledPositions}/{c.numberOfPositions} filled · {c.salary} {c.currency}</p>
                      </div>
                      <Badge variant={c.status === "OPEN" ? "success" : "info"}>{c.status}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          <Card>
            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2"><FiUsers className="w-4 h-4" /> Recent Placements</h3>
            {data.recentPlacements.length === 0 ? (
              <EmptyState title="No placements yet" />
            ) : (
              <div className="space-y-2">
                {data.recentPlacements.map(p => (
                  <div key={p.id} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{p.candidateName}</p>
                      <p className="text-xs text-gray-400">{p.startDate}</p>
                    </div>
                    <Badge variant="info">{p.stage}</Badge>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <h3 className="font-bold text-gray-900 mb-3">Contact</h3>
            <div className="space-y-2 text-sm">
              {data.contactName && <div className="flex items-center gap-2 text-gray-600"><FiUsers className="w-4 h-4" /> {data.contactName}</div>}
              {data.contactEmail && <div className="flex items-center gap-2 text-gray-600"><FiMail className="w-4 h-4" /> {data.contactEmail}</div>}
              {data.contactPhone && <div className="flex items-center gap-2 text-gray-600"><FiPhone className="w-4 h-4" /> {data.contactPhone}</div>}
              {data.country && <div className="flex items-center gap-2 text-gray-600"><FiMapPin className="w-4 h-4" /> {data.country}</div>}
            </div>
          </Card>

          {data.address && (
            <Card>
              <h3 className="font-bold text-gray-900 mb-2">Address</h3>
              <p className="text-sm text-gray-600">{data.address}</p>
            </Card>
          )}

          {data.notes && (
            <Card>
              <h3 className="font-bold text-gray-900 mb-2">Notes</h3>
              <p className="text-sm text-gray-600 whitespace-pre-wrap">{data.notes}</p>
            </Card>
          )}

          {data.pastContracts.length > 0 && (
            <Card>
              <h3 className="font-bold text-gray-900 mb-2">Past Contracts</h3>
              <p className="text-xs text-gray-400">{data.pastContracts.length} completed</p>
            </Card>
          )}

          <Card>
            <h3 className="font-bold text-gray-900 mb-2">Status</h3>
            <Badge variant={data.status === "ACTIVE" ? "success" : "neutral"}>{data.status}</Badge>
          </Card>
        </div>
      </div>
    </div>
  );
}
