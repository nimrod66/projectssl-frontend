"use client";

import { useEffect, useState } from "react";
import api from "@/app/staff/auth/api";
import Card from "@/app/components/ui/Card";
import Badge from "@/app/components/ui/Badge";
import StatCard from "@/app/components/ui/StatCard";
import { SkeletonCard } from "@/app/components/ui/Skeleton";
import { useRouter } from "next/navigation";
import { FiUsers, FiClock, FiCheckCircle, FiAlertTriangle, FiSend, FiBriefcase, FiCheckSquare } from "react-icons/fi";

interface RecentItem { id: number; fullName: string; type: string; status: string; createdAt: string; }
interface PlacementItem { id: number; candidateName: string; stage: string; contractId: number; employerName: string; }
interface ExpiryItem { id: number; candidateName: string; employerName: string; endDate: string; daysLeft: number; }
interface DeploymentItem { id: number; candidateName: string; country: string; updatedAt: string; }
interface QuickStats { totalCandidates: number; pendingReview: number; vetted: number; approved: number; hired: number; activePlacements: number; openContracts: number; filledContracts: number; }
interface DashboardData {
  pendingReview: number;
  quickStats: QuickStats;
  recentRegistrations: RecentItem[];
  placementsInProgress: PlacementItem[];
  contractsNearExpiry: ExpiryItem[];
  recentDeployments: DeploymentItem[];
}

const stageLabels: Record<string, string> = {
  ASSIGNED: "Assigned", ACCEPTED: "Accepted", DOCUMENTS_SUBMITTED: "Docs Submitted",
  DOCUMENTS_VERIFIED: "Docs Verified", MEDICAL_DONE: "Medical Done", CONTRACT_SIGNED: "Contract Signed",
  VISA_APPLIED: "Visa Applied", VISA_APPROVED: "Visa Approved", FLIGHT_BOOKED: "Flight Booked",
  PRE_DEPARTURE: "Pre-departure", DEPARTED: "Departed", DEPLOYED: "Deployed",
  RENEWED: "Renewed", COMPLETED: "Completed", RETURNED: "Returned", DECLINED: "Declined", TERMINATED: "Terminated",
};

const statusVariant: Record<string, "default" | "success" | "warning" | "danger" | "info"> = {
  PENDING: "warning", VETTED: "info", APPROVED: "success", REJECTED: "danger", HIRED: "success",
};

export default function AdminDashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [taskCount, setTaskCount] = useState(0);
  const router = useRouter();

  useEffect(() => {
    api.get("/api/dashboard").then(r => setData(r.data)).catch(() => {});
    api.get("/api/tasks").then(r => { const tasks = r.data || []; setTaskCount(tasks.filter((t: any) => t.status !== "COMPLETED" && t.status !== "CANCELLED").length); }).catch(() => {});
  }, []);

  if (!data) return (
    <div className="p-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)}
      </div>
    </div>
  );

  const { quickStats: s } = data;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">Agency overview at a glance</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard label="Pending Review" value={s.pendingReview} color="amber" icon={<FiClock />} />
        <StatCard label="Approved" value={s.approved} color="green" icon={<FiCheckCircle />} />
        <StatCard label="Active Placements" value={s.activePlacements} color="indigo" icon={<FiBriefcase />} />
        <StatCard label="Open Contracts" value={s.openContracts} color="blue" icon={<FiSend />} />
        <StatCard label="My Tasks" value={taskCount} color={taskCount > 0 ? "red" : "indigo"} icon={<FiCheckSquare />} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-bold text-gray-900">Candidates Awaiting Review</h2>
            <button onClick={() => router.push("/staff/dashboard/admin")} className="text-xs text-indigo-600 hover:underline font-medium">View all</button>
          </div>
          {data.recentRegistrations.filter(r => r.status === "PENDING").length === 0 ? (
            <p className="text-xs text-gray-400 py-4 text-center">No pending reviews</p>
          ) : (
            <div className="space-y-2">
              {data.recentRegistrations.filter(r => r.status === "PENDING").slice(0, 5).map(r => (
                <div key={`${r.type}-${r.id}`} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{r.fullName}</p>
                    <p className="text-xs text-gray-400">{r.type === "local" ? "Local" : "International"}</p>
                  </div>
                  <Badge variant={statusVariant[r.status] || "neutral"}>{r.status}</Badge>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-bold text-gray-900">Placements In Progress</h2>
            <button onClick={() => router.push("/staff/dashboard/admin/contracts")} className="text-xs text-indigo-600 hover:underline font-medium">View all</button>
          </div>
          {data.placementsInProgress.length === 0 ? (
            <p className="text-xs text-gray-400 py-4 text-center">No active placements</p>
          ) : (
            <div className="space-y-2">
              {data.placementsInProgress.map(p => (
                <div key={p.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{p.candidateName}</p>
                    <p className="text-xs text-gray-400">{p.employerName}</p>
                  </div>
                  <Badge variant="info">{stageLabels[p.stage] || p.stage}</Badge>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      <Card accent="red">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <FiAlertTriangle className="w-4 h-4 text-red-500" />
            <h2 className="font-bold text-gray-900">Contracts Near Expiry</h2>
          </div>
          <button onClick={() => router.push("/staff/dashboard/admin/reports")} className="text-xs text-indigo-600 hover:underline font-medium">View reports</button>
        </div>
        {data.contractsNearExpiry.length === 0 ? (
          <p className="text-xs text-gray-400 py-4 text-center">No contracts near expiry</p>
        ) : (
          <div className="space-y-2">
            {data.contractsNearExpiry.map(c => (
              <div key={c.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                <div>
                  <p className="text-sm font-medium text-gray-900">{c.candidateName} · {c.employerName}</p>
                  <p className="text-xs text-gray-400">Ends {c.endDate}</p>
                </div>
                <Badge variant={c.daysLeft <= 30 ? "danger" : "warning"}>{c.daysLeft}d left</Badge>
              </div>
            ))}
          </div>
        )}
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <h2 className="font-bold text-gray-900 mb-3">Recent Registrations</h2>
          <div className="space-y-2">
            {data.recentRegistrations.slice(0, 6).map(r => (
              <div key={`${r.type}-${r.id}`} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                <div>
                  <p className="text-sm font-medium text-gray-900">{r.fullName}</p>
                  <p className="text-xs text-gray-400">{r.type === "local" ? "Local" : "International"} · {r.createdAt ? new Date(r.createdAt).toLocaleDateString() : ""}</p>
                </div>
                <Badge variant={statusVariant[r.status] || "neutral"}>{r.status}</Badge>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <h2 className="font-bold text-gray-900 mb-3">Recent Deployments</h2>
          <div className="space-y-2">
            {data.recentDeployments.length === 0 ? (
              <p className="text-xs text-gray-400 py-4 text-center">No recent deployments</p>
            ) : (
              data.recentDeployments.map(d => (
                <div key={d.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{d.candidateName}</p>
                    <p className="text-xs text-gray-400">{d.country} · {d.updatedAt ? new Date(d.updatedAt).toLocaleDateString() : ""}</p>
                  </div>
                  <Badge variant="success">Deployed</Badge>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
