"use client";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const values = [
  { title: "Integrity", desc: "We operate with transparency and honesty in every placement, ensuring both candidates and employers can trust the process." },
  { title: "Speed", desc: "Our streamlined operations deliver placements in days, not weeks. We understand that time matters for candidates and employers." },
  { title: "Compliance", desc: "Fully licensed and compliant with Kenyan and international labour regulations. Every candidate is properly documented and verified." },
  { title: "Care", desc: "We stay engaged throughout the contract period with monitoring, check-ins, and 24/7 support for deployed candidates." },
];

const timeline = [
  { year: "2019", event: "SSL Agency founded in Nairobi, Kenya" },
  { year: "2020", event: "Expanded to international recruitment markets" },
  { year: "2022", event: "1,000+ candidates placed across 10+ countries" },
  { year: "2024", event: "Launched digital tracking platform for placements" },
];

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-white">
      <Navbar />

      <section className="py-20 bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <p className="text-sm font-semibold text-indigo-300 uppercase tracking-wider mb-4">About Us</p>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-white mb-6">Connecting Talent With Opportunity</h1>
          <p className="text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
            SSL Agency is a licensed international recruitment and manpower consultancy based in Nairobi, Kenya.
            We connect skilled professionals with leading employers across Africa, the Middle East, UAE, and beyond.
          </p>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h2 className="text-3xl font-bold text-slate-900 mb-4">Our Mission</h2>
              <p className="text-slate-600 leading-relaxed">To help both employers and candidates fulfil their potential and achieve maximum productivity through professional local and international HR consulting and recruitment solutions.</p>
            </div>
            <div>
              <h2 className="text-3xl font-bold text-slate-900 mb-4">Our Vision</h2>
              <p className="text-slate-600 leading-relaxed">To provide a unique range of manpower recruitment solutions that deliver lasting value to our clients across Africa, the Middle East, and beyond.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-slate-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <h2 className="text-3xl font-bold text-slate-900 text-center mb-12">Our Values</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((v, i) => (
              <div key={i} className="bg-white rounded-2xl p-6 border border-slate-100 text-center hover:border-indigo-200 hover:shadow-md transition-all duration-300">
                <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 text-indigo-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <h3 className="font-bold text-slate-900 mb-2">{v.title}</h3>
                <p className="text-sm text-slate-500">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <h2 className="text-3xl font-bold text-slate-900 text-center mb-12">Our Journey</h2>
          <div className="space-y-4">
            {timeline.map((t, i) => (
              <div key={i} className="flex gap-5 pb-4">
                <div className="shrink-0 text-right w-16">
                  <span className="text-sm font-bold text-indigo-600">{t.year}</span>
                </div>
                <div className="relative pb-4">
                  <div className="w-3 h-3 rounded-full bg-indigo-600 mt-1.5 absolute -left-[1.6rem]" />
                  <p className="text-slate-700 pt-0.5">{t.event}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-indigo-600">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Ready to Work With Us?</h2>
          <p className="text-indigo-100 mb-8">Whether you're a job seeker or an employer, we're here to help.</p>
          <div className="flex flex-wrap justify-center gap-3">
            <a href="/registration" className="px-6 py-3 bg-white text-indigo-700 font-bold rounded-xl hover:bg-slate-100 transition">Apply as Candidate</a>
            <a href="/employers" className="px-6 py-3 bg-indigo-700 text-white font-bold rounded-xl hover:bg-indigo-800 border border-indigo-400 transition">I'm an Employer</a>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
