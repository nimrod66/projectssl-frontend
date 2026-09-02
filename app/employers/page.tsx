"use client";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Link from "next/link";

const services = [
  { title: "Candidate Sourcing", desc: "Access our pre-vetted pool of domestic and international candidates across multiple sectors." },
  { title: "Background Verification", desc: "Every candidate undergoes identity, reference, and document verification before profiling." },
  { title: "Visa Processing", desc: "We handle the complete visa application process for international placements." },
  { title: "Contract Management", desc: "Track every placement from assignment through deployment with our digital platform." },
  { title: "Medical Clearance", desc: "Coordinate medical examinations and police clearances required for deployment." },
  { title: "Ongoing Support", desc: "24/7 support throughout the contract period with monitoring and check-ins." },
];

const industries = ["Domestic Workers", "Caregiving", "Hospitality", "Construction", "Medical", "Security", "Agriculture", "Manufacturing", "Technology"];

export default function EmployersPage() {
  return (
    <main className="min-h-screen bg-white">
      <Navbar />

      <section className="py-20 bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <p className="text-sm font-semibold text-indigo-300 uppercase tracking-wider mb-4">For Employers</p>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-white mb-6">Find Your Next Hire With SSL Agency</h1>
          <p className="text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Access a large pool of pre-vetted, professionally trained candidates ready for placement.
            We handle everything from sourcing to deployment so you can focus on your business.
          </p>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <h2 className="text-3xl font-bold text-slate-900 text-center mb-12">What We Offer</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((s, i) => (
              <div key={i} className="bg-white rounded-2xl p-6 border border-slate-100 hover:border-indigo-200 hover:shadow-md hover:-translate-y-1 transition-all duration-300">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center mb-4">
                  <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="font-bold text-slate-900 mb-2">{s.title}</h3>
                <p className="text-sm text-slate-500">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-slate-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <h2 className="text-3xl font-bold text-slate-900 text-center mb-12">Industries We Serve</h2>
          <div className="flex flex-wrap justify-center gap-3">
            {industries.map((ind, i) => (
              <span key={i} className="px-4 py-2 rounded-full bg-white border border-slate-200 text-sm font-medium text-slate-700 hover:border-indigo-300 hover:text-indigo-600 transition-colors">
                {ind}
              </span>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-indigo-600">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Partner With SSL Agency</h2>
          <p className="text-indigo-100 mb-8">Tell us what you need and we'll find the right candidates for your organization.</p>
          <Link href="/opportunities" className="inline-block px-8 py-3.5 bg-white text-indigo-700 font-bold rounded-xl hover:bg-slate-100 transition shadow-lg">
            Browse Our Opportunities
          </Link>
        </div>
      </section>

      <Footer />
    </main>
  );
}
