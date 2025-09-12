"use client";

import Footer from "@/app/components/Footer";
import ReceptionistBodySection from "./components/ReceptionistBody";
import ProtectedRoute from "../../auth/ProtectedRoute";
import ReceptionistNavbar from "./components/ReceptionistNavbar";

export default function ReceptionistDashboardPage() {
  return (
    <main>
      <ProtectedRoute allowedRoles={["RECEPTIONIST"]}>
        <ReceptionistNavbar />
        <ReceptionistBodySection />
        <Footer />
      </ProtectedRoute>
    </main>
  );
}
