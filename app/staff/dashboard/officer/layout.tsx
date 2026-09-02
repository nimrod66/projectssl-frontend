"use client";

import DashboardLayout from "@/app/staff/components/DashboardLayout";
import { FiUsers, FiFileText, FiSearch, FiBarChart2, FiSend } from "react-icons/fi";

const navItems = [
  { href: "/staff/dashboard/officer", label: "Dashboard", icon: <FiBarChart2 className="w-4 h-4" /> },
  { href: "/staff/dashboard/recruitment", label: "Recruitment", icon: <FiSend className="w-4 h-4" /> },
  { href: "/staff/dashboard/officer/applicants", label: "Applicants", icon: <FiUsers className="w-4 h-4" /> },
  { href: "/staff/dashboard/officer/search", label: "Search", icon: <FiSearch className="w-4 h-4" /> },
  { href: "/staff/dashboard/officer/contracts", label: "Contracts", icon: <FiFileText className="w-4 h-4" /> },
];

const pageTitles: Record<string, string> = {
  "/staff/dashboard/officer": "Dashboard",
  "/staff/dashboard/officer/applicants": "Applicants",
  "/staff/dashboard/officer/search": "Search",
  "/staff/dashboard/officer/contracts": "Contracts",
};

export default function OfficerLayout({ children }: { children: React.ReactNode }) {
  return (
    <DashboardLayout navItems={navItems} allowedRoles={["RECRUITMENT_OFFICER", "ADMIN", "SUPER_ADMIN"]} pageTitles={pageTitles}>
      {children}
    </DashboardLayout>
  );
}
