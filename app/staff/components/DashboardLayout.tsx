"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import api from "@/app/staff/auth/api";
import ProtectedRoute from "@/app/staff/auth/ProtectedRoute";
import { FiLogOut, FiMenu, FiBell, FiSearch } from "react-icons/fi";
import { TfiUser } from "react-icons/tfi";

interface Staff { fullName: string; firstName: string; lastName: string; }

export interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
}

interface Props {
  navItems: NavItem[];
  allowedRoles: string[];
  children: React.ReactNode;
  pageTitles: Record<string, string>;
}

export default function DashboardLayout({ navItems, allowedRoles, children, pageTitles }: Props) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [staff, setStaff] = useState<Staff | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifs, setNotifs] = useState<any[]>([]);
  const [showNotifs, setShowNotifs] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<any>(null);
  const [showSearch, setShowSearch] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  const fetchNotifs = () =>
    api.get("/api/notifications")
      .then(r => { setUnreadCount(r.data.unreadCount || 0); setNotifs(r.data.items || []); })
      .catch(() => {});

  useEffect(() => {
    api.get<Staff>("/api/staff/me").then(r => setStaff(r.data)).catch(() => {});
    fetchNotifs();
    const interval = setInterval(fetchNotifs, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (searchTerm.length < 2) { setSearchResults(null); return; }
    const timer = setTimeout(() => {
      api.get(`/api/search?q=${encodeURIComponent(searchTerm)}`).then(r => setSearchResults(r.data)).catch(() => {});
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const logout = () => {
    localStorage.removeItem("token"); localStorage.removeItem("expiry"); localStorage.removeItem("role");
    router.replace("/staff/login");
  };

  const isActive = (href: string) => {
    if (href.endsWith("/officer") || href.endsWith("/superadmin") || href.endsWith("/receptionist")) return pathname === href;
    return pathname.startsWith(href);
  };
  const title = pageTitles[pathname] || Object.entries(pageTitles).find(([k]) => pathname.startsWith(k + "/"))?.[1] || "";

  return (
    <ProtectedRoute allowedRoles={allowedRoles}>
      <div className="flex h-screen bg-gray-50 overflow-hidden">
        <aside className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-white border-r border-gray-200 transform transition-transform duration-300 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} md:static md:translate-x-0`}>
          <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200">
            <span className="font-bold text-indigo-700 text-lg">SSL Agency</span>
            <button onClick={() => setSidebarOpen(false)} className="text-gray-500 md:hidden">×</button>
          </div>
          <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
            {navItems.map(item => (
              <button key={item.href} onClick={() => { router.push(item.href); setSidebarOpen(false); }}
                className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium transition ${isActive(item.href) ? "bg-indigo-600 text-white shadow-sm" : "text-gray-600 hover:bg-indigo-50 hover:text-indigo-700"}`}>
                {item.icon} {item.label}
              </button>
            ))}
          </nav>
          <div className="p-3 border-t border-gray-200">
            <button onClick={logout} className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50">
              <FiLogOut className="w-4 h-4" /> Logout
            </button>
          </div>
        </aside>

        {sidebarOpen && <div className="fixed inset-0 bg-black/30 z-40 md:hidden" onClick={() => setSidebarOpen(false)} />}

        <div className="flex-1 flex flex-col overflow-auto">
          <header className="flex items-center justify-between h-16 bg-white border-b border-gray-200 px-4 sm:px-6 shrink-0">
            <div className="flex items-center gap-3">
              <button className="md:hidden text-gray-700" onClick={() => setSidebarOpen(true)}><FiMenu size={22} /></button>
              <div className="hidden sm:block relative">
                <FiSearch className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                <input type="text" placeholder="Search..."
                  value={searchTerm} onChange={e => { setSearchTerm(e.target.value); setShowSearch(true); }}
                  onFocus={() => setShowSearch(true)} onBlur={() => setTimeout(() => setShowSearch(false), 200)}
                  className="pl-9 pr-4 py-2 w-72 rounded-lg border border-gray-200 text-sm focus:border-indigo-300 focus:ring-1 focus:ring-indigo-300 outline-none transition" />
                {showSearch && searchResults && (
                  <div className="absolute top-full left-0 mt-1 w-96 bg-white rounded-xl shadow-lg border border-gray-200 z-50 max-h-80 overflow-y-auto">
                    {searchResults.candidates?.length > 0 && (
                      <div className="p-2">
                        <p className="text-xs font-semibold text-gray-400 uppercase px-2 py-1">Candidates</p>
                        {searchResults.candidates.map((c: any) => (
                          <button key={`${c.type}-${c.id}`} onMouseDown={() => { router.push(`/staff/dashboard/admin/applicants/${c.id}`); setSearchTerm(""); }}
                            className="w-full text-left px-3 py-2 rounded-lg hover:bg-indigo-50 text-sm flex justify-between items-center">
                            <span className="font-medium text-gray-900">{c.fullName}</span>
                            <span className="text-xs text-gray-400">{c.type} · {c.status}</span>
                          </button>
                        ))}
                      </div>
                    )}
                    {searchResults.employers?.length > 0 && (
                      <div className="p-2 border-t">
                        <p className="text-xs font-semibold text-gray-400 uppercase px-2 py-1">Employers</p>
                        {searchResults.employers.map((e: any) => (
                          <button key={e.id} onMouseDown={() => { router.push(`/staff/dashboard/admin/employers/${e.id}`); setSearchTerm(""); }}
                            className="w-full text-left px-3 py-2 rounded-lg hover:bg-indigo-50 text-sm">
                            <span className="font-medium text-gray-900">{e.name}</span>
                          </button>
                        ))}
                      </div>
                    )}
                    {searchResults.contracts?.length > 0 && (
                      <div className="p-2 border-t">
                        <p className="text-xs font-semibold text-gray-400 uppercase px-2 py-1">Contracts</p>
                        {searchResults.contracts.map((c: any) => (
                          <button key={c.id} onMouseDown={() => { router.push(`/staff/dashboard/admin/contracts/${c.id}`); setSearchTerm(""); }}
                            className="w-full text-left px-3 py-2 rounded-lg hover:bg-indigo-50 text-sm">
                            <span className="font-medium text-gray-900">{c.name}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
              <h1 className="text-lg font-bold text-indigo-700 hidden sm:block">{title}</h1>
            </div>
            <div className="flex items-center gap-3 text-sm text-gray-600">
              <div className="relative">
                <button onClick={() => setShowNotifs(v => !v)} className="relative p-1.5 rounded-lg hover:bg-gray-100">
                  <FiBell className="w-5 h-5" />
                  {unreadCount > 0 && <span className="absolute -top-0.5 -right-0.5 w-5 h-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center font-bold">{unreadCount}</span>}
                </button>
                {showNotifs && (
                  <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl border border-gray-200 shadow-lg z-50">
                    <div className="flex items-center justify-between px-4 py-2.5 border-b border-gray-100">
                      <p className="text-sm font-semibold text-gray-700">Notifications</p>
                      <button
                        onClick={() => { api.patch("/api/notifications/read-all").then(fetchNotifs).catch(() => {}); }}
                        className="text-xs text-indigo-600 hover:underline">Mark all read</button>
                    </div>
                    <div className="max-h-64 overflow-auto">
                      {notifs.length === 0 ? (
                        <p className="text-sm text-gray-400 px-4 py-6 text-center">You're all caught up</p>
                      ) : notifs.map((n: any) => (
                        <div key={n.id} className="px-4 py-2.5 border-b border-gray-50 last:border-0">
                          <p className="text-sm text-gray-800">{n.message}</p>
                          <p className="text-xs text-gray-400">{(n.createdAt || "").replace("T", " ").slice(0, 16)}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <TfiUser className="w-4 h-4" />
              <span>{staff ? `${staff.firstName} ${staff.lastName}` : "..."}</span>
            </div>
          </header>
          <main className="flex-1 overflow-auto">{children}</main>
        </div>
      </div>
    </ProtectedRoute>
  );
}
