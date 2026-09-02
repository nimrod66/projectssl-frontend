"use client";

import DashboardLayout from "@/app/staff/components/DashboardLayout";
import { FiHome, FiUsers, FiBriefcase, FiFileText, FiSend, FiTarget, FiCheckSquare } from "react-icons/fi";

const navItems = [
  { href: "/staff/dashboard/recruitment", label: "Overview", icon: <FiHome className="w-4 h-4" /> },
  { href: "/staff/dashboard/recruitment/applicants", label: "Applicants", icon: <FiUsers className="w-4 h-4" /> },
  { href: "/staff/dashboard/recruitment/opportunities", label: "Opportunities", icon: <FiBriefcase className="w-4 h-4" /> },
  { href: "/staff/dashboard/recruitment/applications", label: "Applications", icon: <FiFileText className="w-4 h-4" /> },
  { href: "/staff/dashboard/recruitment/placements", label: "Placements", icon: <FiSend className="w-4 h-4" /> },
  { href: "/staff/dashboard/recruitment/campaigns", label: "Campaigns", icon: <FiTarget className="w-4 h-4" /> },
  { href: "/staff/dashboard/recruitment/tasks", label: "Tasks", icon: <FiCheckSquare className="w-4 h-4" /> },
];

const pageTitles: Record<string, string> = {
  "/staff/dashboard/recruitment": "Recruitment Overview",
  "/staff/dashboard/recruitment/applicants": "Applicants",
  "/staff/dashboard/recruitment/opportunities": "Opportunities",
  "/staff/dashboard/recruitment/applications": "Applications",
  "/staff/dashboard/recruitment/placements": "Placements",
  "/staff/dashboard/recruitment/campaigns": "Campaigns",
  "/staff/dashboard/recruitment/tasks": "Tasks",
};

export default function RecruitmentLayout({ children }: { children: React.ReactNode }) {
  return (
    <DashboardLayout
      navItems={navItems}
      allowedRoles={["ADMIN", "SUPER_ADMIN", "RECRUITMENT_OFFICER"]}
      pageTitles={pageTitles}
    >
      {children}
    </DashboardLayout>
  );
}