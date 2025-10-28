"use client";

import AdminBodySection from "./components/AdminBody";
import ProtectedRoute from "../../auth/ProtectedRoute";

export default function AdminDashboardPage() {
  return (
    <main>
      <ProtectedRoute allowedRoles={["ADMIN"]}>
        <AdminBodySection />
      </ProtectedRoute>
    </main>
  );
}
