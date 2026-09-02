"use client";

import DashboardLayout from "@/app/staff/components/DashboardLayout";
import { FiUsers, FiFileText } from "react-icons/fi";

const navItems = [
  { href: "/staff/dashboard/receptionist", label: "Applicants", icon: <FiUsers className="w-4 h-4" /> },
  { href: "/staff/dashboard/receptionist/contracts", label: "Contracts", icon: <FiFileText className="w-4 h-4" /> },
];

const pageTitles: Record<string, string> = {
  "/staff/dashboard/receptionist": "Applicants",
  "/staff/dashboard/receptionist/contracts": "Contracts",
};

export default function ReceptionistLayout({ children }: { children: React.ReactNode }) {
  return (
    <DashboardLayout navItems={navItems} allowedRoles={["RECEPTIONIST"]} pageTitles={pageTitles}>
      {children}
    </DashboardLayout>
  );
}
