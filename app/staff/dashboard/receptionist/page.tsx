"use client";

import ReceptionistBodySection from "./components/ReceptionistBody";
import ReceptionistNavbar from "./components/ReceptionistNavbar";
import ProtectedRoute from "../../auth/ProtectedRoute";

export default function ReceptionistDashboardPage() {
  return (
    <main>
      <ProtectedRoute allowedRoles={["RECEPTIONIST"]}>
        <ReceptionistNavbar />
        <ReceptionistBodySection />
      </ProtectedRoute>
    </main>
  );
}
