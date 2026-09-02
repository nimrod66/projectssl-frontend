"use client";

import { useEffect, useState } from "react";
import api from "@/app/staff/auth/api";
import StatCard from "@/app/components/ui/StatCard";
import { SkeletonCard } from "@/app/components/ui/Skeleton";
import { FiUsers, FiClock } from "react-icons/fi";

export default function OfficerDashboard() {
  const [stats, setStats] = useState<any>(null);
  useEffect(() => { api.get("/api/dashboard").then(r => setStats(r.data)).catch(() => {}); }, []);

  if (!stats) return <div className="p-6"><div className="grid grid-cols-2 gap-4">{[...Array(4)].map((_, i) => <SkeletonCard key={i} />)}</div></div>;

  const s = stats.quickStats || {};
  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Dashboard</h1>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Pending Review" value={s.pendingReview || 0} color="amber" icon={<FiClock />} />
        <StatCard label="Vetted" value={s.vetted || 0} color="blue" />
        <StatCard label="Approved" value={s.approved || 0} color="green" />
        <StatCard label="Total Candidates" value={s.totalCandidates || 0} color="indigo" icon={<FiUsers />} />
      </div>
    </div>
  );
}
