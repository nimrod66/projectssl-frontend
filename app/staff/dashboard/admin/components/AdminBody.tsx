"use client";

import { useState, useEffect } from "react";
import LocalApplicant from "./LocalApplicant";
import InternationalApplicant from "./InternationalApplicant";
import { FiUsers, FiLogOut, FiMenu } from "react-icons/fi";
import { TfiUser } from "react-icons/tfi";
import useLogout from "@/app/staff/auth/logout";
import api from "@/app/staff/auth/api";

interface Staff {
  fullName: string;
}

export default function AdminBody() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [tab, setTab] = useState<"local" | "international">("local");
  const [staff, setStaff] = useState<Staff | null>(null);
  const logout = useLogout();

  // Fetch staff info on mount
  useEffect(() => {
    const fetchStaff = async () => {
      try {
        const response = await api.get<Staff>("/api/staff/me");
        setStaff(response.data);
      } catch (err) {
        console.error("Failed to fetch staff info:", err);
      }
    };
    fetchStaff();
  }, []);

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex flex-col bg-white border-r border-gray-200 transform transition-transform duration-300 sm:static sm:translate-x-0 ${
          sidebarOpen ? "translate-x-0 w-64" : "-translate-x-full w-64"
        }`}
      >
        <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200">
          <span className="font-bold text-purple-700 text-lg">SSL Agency</span>
          <button
            onClick={() => setSidebarOpen(false)}
            className="text-gray-500 hover:text-gray-700 sm:hidden"
          >
            ×
          </button>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          <button
            onClick={() => setTab("local")}
            className={`flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              tab === "local"
                ? "bg-purple-600 text-white"
                : "hover:bg-purple-100 text-purple-700"
            }`}
          >
            <FiUsers /> Local
          </button>
          <button
            onClick={() => setTab("international")}
            className={`flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              tab === "international"
                ? "bg-purple-600 text-white"
                : "hover:bg-purple-100 text-purple-700"
            }`}
          >
            <FiUsers /> International
          </button>
        </nav>

        <div className="p-4 border-t border-gray-200">
          <button
            onClick={logout}
            className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm font-medium hover:bg-red-100 text-red-600"
          >
            <FiLogOut /> Logout
          </button>
        </div>
      </aside>

      {/* Overlay for mobile sidebar */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black opacity-30 z-40 sm:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-auto">
        {/* Topbar */}
        <header className="flex items-center justify-between h-16 bg-white border-b border-gray-200 px-4 sm:px-6 sticky top-0 z-10">
          <div className="flex items-center gap-4">
            <button
              className="sm:hidden text-gray-700"
              onClick={() => setSidebarOpen(true)}
            >
              <FiMenu size={24} />
            </button>
            <h1 className="text-lg font-bold text-purple-700">
              {tab === "local"
                ? "Local Applicants"
                : "International Applicants"}
            </h1>
          </div>
          <div className="flex items-center gap-4 text-sm sm:text-base text-gray-700">
            <TfiUser />
            {staff ? staff.fullName : "Loading..."}
          </div>
        </header>

        {/* Tab Buttons */}
        <div className="flex gap-2 p-2 sm:p-4 bg-gray-100 border-b border-gray-200 overflow-x-auto">
          <button
            className={`px-3 sm:px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
              tab === "local"
                ? "bg-purple-600 text-white"
                : "bg-white border border-gray-300 text-gray-700 hover:bg-purple-50"
            }`}
            onClick={() => setTab("local")}
          >
            Local Applicants
          </button>
          <button
            className={`px-3 sm:px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
              tab === "international"
                ? "bg-purple-600 text-white"
                : "bg-white border border-gray-300 text-gray-700 hover:bg-purple-50"
            }`}
            onClick={() => setTab("international")}
          >
            International Applicants
          </button>
        </div>

        {/* Content */}
        <main className="p-2 sm:p-4 flex-1 overflow-auto">
          {tab === "local" && <LocalApplicant />}
          {tab === "international" && <InternationalApplicant />}
        </main>
      </div>
    </div>
  );
}
