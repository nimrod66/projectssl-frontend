"use client";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Hero from "./components/Hero";
import Link from "next/link";
import dynamic from "next/dynamic";

const Map = dynamic(() => import("./components/Map"), { ssr: false });

const stats = [
  { value: "1,000+", label: "Candidates Placed" },
  { value: "98%", label: "Client Satisfaction" },
  { value: "15+", label: "Countries Served" },
  { value: "5+", label: "Years Experience" },
];

const services = [
  { title: "Domestic Placement", desc: "Vetted housekeepers, nannies, and caregivers for Kenyan homes." },
  { title: "International Recruitment", desc: "Skilled workers for the Middle East, Africa, and beyond." },
  { title: "Document Processing", desc: "Full visa, medical, and police clearance support." },
  { title: "Contract Management", desc: "End-to-end contract tracking from placement through deployment." },
];

const process = [
  { step: "01", title: "Register", desc: "Create your account in 2 minutes — phone number only, no email needed." },
  { step: "02", title: "Complete Profile", desc: "Add your experience, skills, languages, and work preferences." },
  { step: "03", title: "Upload Documents", desc: "Submit your passport, ID, CV, and certificates for verification." },
  { step: "04", title: "Get Verified", desc: "Visit our Nairobi office for in-person document verification." },
  { step: "05", title: "Get Placed", desc: "We match you to contracts abroad and track your full deployment." },
];

const testimonials = [
  { name: "Sarah K.", location: "Nairobi", text: "SSL found me a position in Dubai within weeks. The entire process was smooth and the support team was always available.", initials: "SK" },
  { name: "James O.", location: "Kisumu", text: "I never imagined I could work abroad. SSL handled everything from my passport to my flight ticket. Now I'm working in Qatar.", initials: "JO" },
  { name: "Aisha M.", location: "Mombasa", text: "Professional from start to finish. They kept me updated at every stage of my visa process.", initials: "AM" },
];

const avatars = ["bg-indigo-600","bg-blue-600","bg-emerald-600"];

export default function Home() {
  return (
    <main className="min-h-screen bg-white">
      <Navbar />
      <Hero />

      {/* Stats */}
      <section className="py-14 bg-white border-b border-slate-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {stats.map((s, i) => (
              <div key={i} className="animate-fade-up" style={{ animationDelay: `${i * 0.1}s` }}>
                <p className="text-3xl sm:text-4xl font-extrabold text-slate-900">{s.value}</p>
                <p className="text-sm text-slate-500 mt-1.5">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-14">
            <p className="text-sm font-semibold text-indigo-600 uppercase tracking-wider mb-3">What We Do</p>
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">Complete Recruitment Solutions</h2>
            <p className="text-slate-500 max-w-xl mx-auto">From candidate sourcing to deployment — we handle every step.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {services.map((s, i) => (
              <div key={i} className="bg-white rounded-2xl p-6 border border-slate-100 hover:border-indigo-200 hover:shadow-md hover:-translate-y-1 transition-all duration-300 text-center">
                <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                </div>
                <h3 className="font-bold text-slate-900 mb-2">{s.title}</h3>
                <p className="text-sm text-slate-500">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Process */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-14">
            <p className="text-sm font-semibold text-indigo-600 uppercase tracking-wider mb-3">How It Works</p>
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">Your Path to Placement</h2>
            <p className="text-slate-500">Five simple steps from registration to deployment.</p>
          </div>
          <div className="space-y-6">
            {process.map((p, i) => (
              <div key={i} className="flex gap-5 items-start group">
                <div className="shrink-0 w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold text-sm group-hover:bg-indigo-600 group-hover:text-white transition-colors duration-300">
                  {p.step}
                </div>
                <div className="pt-1">
                  <h3 className="font-bold text-slate-900 text-lg mb-1">{p.title}</h3>
                  <p className="text-slate-500 text-sm">{p.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-slate-900">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-14">
            <p className="text-sm font-semibold text-indigo-300 uppercase tracking-wider mb-3">Success Stories</p>
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">What Our Candidates Say</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <div key={i} className="bg-white/5 border border-white/10 rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className={`w-10 h-10 rounded-full ${avatars[i]} flex items-center justify-center text-white text-sm font-bold`}>{t.initials}</div>
                  <div>
                    <p className="font-semibold text-white text-sm">{t.name}</p>
                    <p className="text-xs text-slate-400">{t.location}</p>
                  </div>
                </div>
                <p className="text-slate-300 text-sm leading-relaxed">{t.text}</p>
                <div className="flex gap-0.5 mt-3">
                  {[...Array(5)].map((_, j) => (
                    <svg key={j} className="w-4 h-4 text-amber-400" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-indigo-600">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">Ready to Find Your Next Opportunity?</h2>
          <p className="text-indigo-100 text-lg mb-8">Thousands of candidates trust SSL Agency. Start your journey today.</p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link href="/registration" className="px-8 py-3.5 bg-white text-indigo-700 font-bold rounded-xl hover:bg-slate-100 transition shadow-lg">Apply Now</Link>
            <Link href="/opportunities" className="px-8 py-3.5 bg-indigo-700 text-white font-bold rounded-xl hover:bg-indigo-800 border border-indigo-400 transition">Browse Opportunities</Link>
          </div>
        </div>
      </section>

      {/* Partners */}
      <section className="py-14 bg-white border-b border-slate-100">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <p className="text-center text-sm font-semibold text-slate-400 uppercase tracking-wider mb-8">Trusted Partners & Memberships</p>
          <div className="flex flex-wrap justify-center items-center gap-10 opacity-50">
            {["ASMAK", "KNCCI", "Ministry of Labour", "NEA"].map((p, i) => (
              <span key={i} className="text-lg font-bold text-slate-400">{p}</span>
            ))}
          </div>
        </div>
      </section>

      <Map />
      <Footer />
    </main>
  );
}
