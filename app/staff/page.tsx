"use client";

import Footer from "../components/Footer";
import StaffBodySection from "./components/StaffBody";
import StaffHeroSection from "./components/StaffHero";
import StaffNavbar from "./components/StaffNavbar";

export default function StaffHomePage() {
  return (
    <main>
      <StaffNavbar />
      <StaffHeroSection />
      <StaffBodySection />
      <Footer />
    </main>
  );
}
