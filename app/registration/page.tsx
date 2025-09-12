"use client";

import Footer from "../components/Footer";
import Navbar from "../components/Navbar";
import SslRegistrationForm from "./components/RegistrationForm";

export default function RegistrationPage() {
  return (
    <main>
      <Navbar />
      <SslRegistrationForm />
      <Footer />
    </main>
  );
}
