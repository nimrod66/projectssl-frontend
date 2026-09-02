"use client";

import DashboardLayout from "@/app/staff/components/DashboardLayout";
import { FiUsers, FiBriefcase, FiFileText, FiBarChart2, FiCheckSquare, FiCalendar, FiSend } from "react-icons/fi";

const navItems = [
  { href: "/staff/dashboard/admin", label: "Dashboard", icon: <FiBarChart2 className="w-4 h-4" /> },
  { href: "/staff/dashboard/admin/tasks", label: "My Tasks", icon: <FiCheckSquare className="w-4 h-4" /> },
  { href: "/staff/dashboard/admin/calendar", label: "Calendar", icon: <FiCalendar className="w-4 h-4" /> },
  { href: "/staff/dashboard/recruitment", label: "Recruitment", icon: <FiSend className="w-4 h-4" /> },
  { href: "/staff/dashboard/admin/applicants", label: "Applicants", icon: <FiUsers className="w-4 h-4" /> },
  { href: "/staff/dashboard/admin/employers", label: "Employers", icon: <FiBriefcase className="w-4 h-4" /> },
  { href: "/staff/dashboard/admin/contracts", label: "Contracts", icon: <FiFileText className="w-4 h-4" /> },
  { href: "/staff/dashboard/admin/reports", label: "Reports", icon: <FiBarChart2 className="w-4 h-4" /> },
];

const pageTitles: Record<string, string> = {
  "/staff/dashboard/admin": "Dashboard",
  "/staff/dashboard/admin/tasks": "My Tasks",
  "/staff/dashboard/admin/calendar": "Calendar",
  "/staff/dashboard/admin/applicants": "Applicants",
  "/staff/dashboard/admin/employers": "Employers",
  "/staff/dashboard/admin/contracts": "Contracts",
  "/staff/dashboard/admin/reports": "Reports",
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <DashboardLayout navItems={navItems} allowedRoles={["ADMIN", "SUPER_ADMIN"]} pageTitles={pageTitles}>
      {children}
    </DashboardLayout>
  );
}
