"use client";
import { useEffect, useState } from "react";
import api from "@/app/staff/auth/api";
import toast from "react-hot-toast";

interface ReportSummary { totalEmployers: number; openContracts: number; filledContracts: number; activeDeployments: number; completedPlacements: number; totalPlacements: number; totalRevenue: number; deploymentsByCountry: {country:string;count:number}[]; deploymentsByCategory: {category:string;count:number}[]; }
interface ExpiringItem { placementId: number; candidateName: string; employerName: string; country: string; contractEndDate: string; daysRemaining: number; }
interface RevenueData { totalRevenue: number; byEmployer: {employerName:string;deployments:number;revenue:number}[]; byCountry: {country:string;deployments:number;revenue:number}[]; }
interface FunnelData { applicants: {registered:number;vetted:number;approved:number;hired:number;rejected:number}; placements: {assigned:number;visaApplied:number;visaApproved:number;deployed:number;completed:number;terminated:number}; }

export default function ReportsPage() {
  const [summary, setSummary] = useState<ReportSummary | null>(null);
  const [expiring, setExpiring] = useState<ExpiringItem[]>([]);
  const [revenue, setRevenue] = useState<RevenueData | null>(null);
  const [funnel, setFunnel] = useState<FunnelData | null>(null);
  const [days, setDays] = useState(60);

  useEffect(() => {
    const load = async () => {
      try {
        const [sRes, eRes, rRes, fRes] = await Promise.all([api.get("/api/reports/summary"), api.get(`/api/reports/expiring?days=${days}`), api.get("/api/reports/revenue"), api.get("/api/reports/funnel")]);
        setSummary(sRes.data); setExpiring(eRes.data.items); setRevenue(rRes.data); setFunnel(fRes.data);
      } catch { toast.error("Failed to load reports"); }
    };
    load();
  }, [days]);

  if (!summary) return <div className="p-8 text-indigo-700">Loading reports...</div>;

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-8">
      <h1 className="text-2xl font-bold text-indigo-900">Reports</h1>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[{ label:"Employers", v:summary.totalEmployers, c:"bg-indigo-500" },{ label:"Open Contracts", v:summary.openContracts, c:"bg-green-500" },{ label:"Filled Contracts", v:summary.filledContracts, c:"bg-blue-500" },{ label:"Active Deployments", v:summary.activeDeployments, c:"bg-yellow-500" },{ label:"Completed", v:summary.completedPlacements, c:"bg-teal-500" },{ label:"Total Placements", v:summary.totalPlacements, c:"bg-gray-500" },{ label:"Total Revenue", v:`${(summary.totalRevenue||0).toLocaleString()}`, c:"bg-indigo-500" },{ label:"Pipeline", v:summary.totalPlacements, c:"bg-pink-500" }].map(s => (
          <div key={s.label} className={`${s.c} text-white rounded-xl p-4 shadow`}>
            <p className="text-sm opacity-80">{s.label}</p><p className="text-2xl font-bold">{typeof s.v === "number" && s.label === "Total Revenue" ? `$${s.v.toLocaleString()}` : typeof s.v === "number" ? s.v : s.v}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow p-5">
          <h2 className="font-bold text-lg mb-3">Deployments by Country</h2>
          {summary.deploymentsByCountry.map(d => (
            <div key={d.country} className="flex justify-between py-1 border-b last:border-0"><span>{d.country}</span><span className="font-medium">{d.count}</span></div>
          ))}
        </div>
        <div className="bg-white rounded-xl shadow p-5">
          <h2 className="font-bold text-lg mb-3">Deployments by Category</h2>
          {summary.deploymentsByCategory.map(d => (
            <div key={d.category} className="flex justify-between py-1 border-b last:border-0"><span>{d.category.replace(/_/g, " ")}</span><span className="font-medium">{d.count}</span></div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow p-5">
        <div className="flex justify-between items-center mb-3">
          <h2 className="font-bold text-lg">Expiring Contracts</h2>
          <select value={days} onChange={e => setDays(Number(e.target.value))} className="border rounded p-1 text-sm">
            <option value={30}>30 days</option><option value={60}>60 days</option><option value={90}>90 days</option>
          </select>
        </div>
        {expiring.length === 0 ? <p className="text-gray-400">No contracts expiring within {days} days</p> : (
          <div className="space-y-2">{expiring.map(e => (
            <div key={e.placementId} className="flex justify-between items-center p-3 bg-amber-50 rounded-lg">
              <div><span className="font-medium">{e.candidateName}</span> · {e.employerName} · {e.country}</div>
              <div className="text-sm"><span className={`font-bold ${e.daysRemaining < 30 ? "text-red-600" : "text-amber-600"}`}>{e.daysRemaining}d</span> left</div>
            </div>
          ))}</div>
        )}
      </div>

      <div className="bg-white rounded-xl shadow p-5">
        <h2 className="font-bold text-lg mb-3">Revenue</h2>
        {revenue && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div><h3 className="font-semibold text-sm mb-2">By Employer</h3>
              {revenue.byEmployer.map(e => <div key={e.employerName} className="flex justify-between py-1 border-b"><span>{e.employerName} ({e.deployments})</span><span className="font-medium">${e.revenue.toLocaleString()}</span></div>)}
            </div>
            <div><h3 className="font-semibold text-sm mb-2">By Country</h3>
              {revenue.byCountry.map(c => <div key={c.country} className="flex justify-between py-1 border-b"><span>{c.country} ({c.deployments})</span><span className="font-medium">${c.revenue.toLocaleString()}</span></div>)}
            </div>
          </div>
        )}
      </div>

      <div className="bg-white rounded-xl shadow p-5">
        <h2 className="font-bold text-lg mb-3">Pipeline Funnel</h2>
        {funnel && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-sm mb-2">Applicants</h3>
              {[{l:"Registered",v:funnel.applicants.registered},{l:"Vetted",v:funnel.applicants.vetted},{l:"Approved",v:funnel.applicants.approved},{l:"Hired",v:funnel.applicants.hired},{l:"Rejected",v:funnel.applicants.rejected}].map(s => (
                <div key={s.l} className="flex justify-between py-1 border-b"><span>{s.l}</span><span className="font-medium">{s.v}</span></div>
              ))}
            </div>
            <div>
              <h3 className="font-semibold text-sm mb-2">Placements</h3>
              {[{l:"Assigned",v:funnel.placements.assigned},{l:"Visa Applied",v:funnel.placements.visaApplied},{l:"Visa Approved",v:funnel.placements.visaApproved},{l:"Deployed",v:funnel.placements.deployed},{l:"Completed",v:funnel.placements.completed},{l:"Terminated",v:funnel.placements.terminated}].map(s => (
                <div key={s.l} className="flex justify-between py-1 border-b"><span>{s.l}</span><span className="font-medium">{s.v}</span></div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
