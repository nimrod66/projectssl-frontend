"use client";

import { useEffect, useState } from "react";
import api from "@/app/staff/auth/api";
import Card from "@/app/components/ui/Card";
import Badge from "@/app/components/ui/Badge";
import PageHeader from "@/app/components/ui/PageHeader";
import EmptyState from "@/app/components/ui/EmptyState";
import { SkeletonCard } from "@/app/components/ui/Skeleton";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { FiCalendar, FiCheckCircle, FiXCircle, FiArrowRight } from "react-icons/fi";

interface Task { id: number; title: string; description: string; status: string; priority: string; dueDate: string; entityId: number; entityType: string; }

const priorityColors: Record<string, "danger" | "warning" | "info" | "neutral"> = { URGENT: "danger", HIGH: "danger", MEDIUM: "warning", LOW: "info" };
const statusColors: Record<string, "default" | "success" | "info" | "neutral"> = { OPEN: "neutral", IN_PROGRESS: "info", COMPLETED: "success", CANCELLED: "neutral" };

export default function MyTasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const router = useRouter();

  useEffect(() => {
    api.get("/api/tasks").then(r => setTasks(r.data)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const filtered = filter === "all" ? tasks : tasks.filter(t => t.status === filter);

  const updateStatus = async (id: number, status: string) => {
    await api.patch(`/api/tasks/${id}`, { status }).then(() => {
      setTasks(prev => prev.map(t => t.id === id ? { ...t, status } : t));
    }).catch(() => toast.error("Failed"));
  };

  const navigate = (t: Task) => {
    const routes: Record<string, string> = { placement: `/staff/dashboard/admin/contracts`, candidate: `/staff/dashboard/admin/applicants`, contract: `/staff/dashboard/admin/contracts`, employer: `/staff/dashboard/admin/employers` };
    const base = routes[t.entityType] || "/staff/dashboard/admin";
    router.push(t.entityId ? `${base}/${t.entityId}` : base);
  };

  if (loading) return <div className="p-6 max-w-4xl mx-auto space-y-4">{[...Array(4)].map((_, i) => <SkeletonCard key={i} />)}</div>;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <PageHeader title="My Tasks" description="Tasks assigned to you. Auto-generated from placement stage changes." />

      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl mb-6 w-fit">
        {["all", "OPEN", "IN_PROGRESS", "COMPLETED", "CANCELLED"].map(f => (
          <button key={f} onClick={() => setFilter(f)} className={`px-4 py-2 rounded-lg text-sm font-medium transition ${filter === f ? "bg-white text-indigo-700 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}>
            {f === "all" ? "All" : f.replace("_", " ")}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <EmptyState title="No tasks" description="Tasks will appear here when placements advance through stages" />
      ) : (
        <div className="space-y-2">
          {filtered.map(t => (
            <Card key={t.id} className="flex items-center justify-between gap-4 cursor-pointer" onClick={() => navigate(t)}>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-medium text-gray-900 text-sm">{t.title}</h3>
                  <Badge variant={priorityColors[t.priority] || "neutral"}>{t.priority}</Badge>
                  <Badge variant={statusColors[t.status] || "neutral"}>{t.status}</Badge>
                </div>
                {t.description && <p className="text-xs text-gray-500 mt-0.5">{t.description}</p>}
                {t.dueDate && (
                  <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-1">
                    <FiCalendar className="w-3 h-3" /> {new Date(t.dueDate).toLocaleDateString()}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-1 shrink-0">
                {t.status !== "COMPLETED" && (
                  <button onClick={(e) => { e.stopPropagation(); updateStatus(t.id, "COMPLETED"); }} className="p-1.5 rounded-lg hover:bg-green-50 text-green-600" title="Mark done"><FiCheckCircle className="w-4 h-4" /></button>
                )}
                {t.status !== "CANCELLED" && t.status !== "COMPLETED" && (
                  <button onClick={(e) => { e.stopPropagation(); updateStatus(t.id, "CANCELLED"); }} className="p-1.5 rounded-lg hover:bg-red-50 text-red-500" title="Cancel"><FiXCircle className="w-4 h-4" /></button>
                )}
                <button onClick={(e) => { e.stopPropagation(); navigate(t); }} className="p-1.5 rounded-lg hover:bg-indigo-50 text-indigo-600" title="Go to entity"><FiArrowRight className="w-4 h-4" /></button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
