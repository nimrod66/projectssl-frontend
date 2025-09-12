"use client";

import Footer from "@/app/components/Footer";
import AdminBodySection from "./components/AdminBody";
import AdminNavbar from "./components/AdminNavbar";
import ProtectedRoute from "../../auth/ProtectedRoute";

export default function AdminDashboardPage() {
  return (
    <main>
      <ProtectedRoute allowedRoles={["ADMIN"]}>
        <AdminNavbar />
        <AdminBodySection />
        <Footer />
      </ProtectedRoute>
    </main>
  );
}
