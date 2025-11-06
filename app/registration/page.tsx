"use client";

import Footer from "../components/Footer";
import Navbar from "../components/Navbar";
import SslInternationalRegistrationForm from "./components/InternationalRegistrationForm";
import SslLocalRegistrationForm from "./components/LocalRegistrationForm";

export default function RegistrationPage() {
  return (
    <main>
      <Navbar />
      <SslInternationalRegistrationForm />
      <Footer />
    </main>
  );
}
