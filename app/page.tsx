"use client";
import Footer from "./components/Footer";
import Hero from "./components/Hero";
import Navbar from "./components/Navbar";
import Testimonials from "./components/Testimonials";
import AdvertisementSection from "./components/AdvertisementSection";
import ContentSection from "./components/ContentSection";
import ApplicantsSection from "./components/ApplicantsSection";
import dynamic from "next/dynamic";

const Map = dynamic(() => import("./components/Map"), { ssr: false });

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="hidden lg:block">
        <Hero />
      </div>

      <section className="py-4 sm:py-6 lg:py-8">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 lg:gap-8 items-start">
            <div className="lg:col-span-8 order-1">
              <ApplicantsSection />
            </div>
            <div className="lg:col-span-4 order-2">
              <div className="lg:sticky lg:top-24 lg:max-h-[80vh] lg:overflow-auto">
                <AdvertisementSection />
              </div>
            </div>
          </div>
        </div>
      </section>

      <ContentSection />

      <div className="hidden lg:block">
        <Testimonials />
      </div>

      <div className="text-base-content">
        <Map />
      </div>

      <Footer />
    </main>
  );
}
