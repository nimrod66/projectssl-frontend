"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";
import {
  FiMapPin, FiUsers, FiClock, FiArrowRight, FiBriefcase, FiCheckCircle, FiAlertCircle, FiCalendar
} from "react-icons/fi";
import { Opportunity, API_BASE, formatSalary, positionsLeft, deadlineLabel, expired } from "@/app/lib/opportunity";
import { isApplicantLoggedIn } from "@/app/applicant/auth/session";
import api from "@/app/applicant/auth/api";
import toast from "react-hot-toast";

const requirements = [
  { key: "requiredExperience", label: "Experience" },
  { key: "requiredEducation", label: "Education" },
  { key: "requiredSkills", label: "Skills" },
  { key: "requiredLanguages", label: "Languages" },
] as const;

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="bg-white rounded-2xl border border-slate-100 p-6 sm:p-8">
      <h2 className="text-lg font-bold text-slate-900 mb-4">{title}</h2>
      {children}
    </section>
  );
}

export default function OpportunityDetailPage() {
  const params = useParams<{ id: string }>();
  const [o, setO] = useState<Opportunity | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [applying, setApplying] = useState(false);
  const [applied, setApplied] = useState(false);

  useEffect(() => {
    if (!params.id) return;
    fetch(`${API_BASE}/api/public/opportunities/${params.id}`)
      .then(r => { if (!r.ok) throw new Error("nope"); return r.json(); })
      .then(setO)
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));

    if (isApplicantLoggedIn()) {
      api.get("/api/applicants/me/applications")
        .then(r => {
          const mine = Array.isArray(r.data) ? r.data as { opportunityId: number }[] : [];
          if (mine.some(a => Number(a.opportunityId) === Number(params.id))) setApplied(true);
        })
        .catch(() => {});
    }
  }, [params.id]);

  const handleApply = async () => {
    setApplying(true);
    try {
      await api.post("/api/applicants/me/applications", { opportunityId: Number(params.id) });
      setApplied(true);
      toast.success("Application submitted!");
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Application failed");
    } finally {
      setApplying(false);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-50">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 space-y-6 animate-pulse">
          <div className="h-9 bg-slate-100 rounded-xl w-2/3" />
          <div className="h-5 bg-slate-100 rounded-xl w-1/3" />
          <div className="h-64 bg-slate-100 rounded-2xl" />
        </div>
        <Footer />
      </main>
    );
  }

  if (notFound || !o) {
    return (
      <main className="min-h-screen bg-slate-50">
        <Navbar />
        <div className="max-w-2xl mx-auto px-4 py-24 text-center">
          <FiAlertCircle className="w-12 h-12 mx-auto mb-4 text-slate-300" />
          <h1 className="text-xl font-bold text-slate-900 mb-2">Opportunity not available</h1>
          <p className="text-slate-500 mb-6">This position may be filled or no longer accepting applications.</p>
          <Link href="/opportunities" className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition">
            Browse all opportunities <FiArrowRight className="w-4 h-4" />
          </Link>
        </div>
        <Footer />
      </main>
    );
  }

  const closed = expired(o.applicationDeadline) || positionsLeft(o) === 0;
  const reqList = requirements.filter(r => o[r.key]);

  return (
    <main className="min-h-screen bg-slate-50">
      <Navbar />

      <section className="bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 text-white py-14">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <Link href="/opportunities" className="inline-flex items-center gap-1.5 text-sm text-indigo-300 hover:text-white transition mb-5">
            <FiArrowRight className="w-4 h-4 rotate-180" /> All opportunities
          </Link>
          <div className="flex flex-wrap items-center gap-2 mb-4">
            {o.jobCategory && <span className="text-xs font-semibold bg-white/10 border border-white/15 px-2.5 py-1 rounded-full">{o.jobCategory}</span>}
            {o.status === "OPEN" && !closed && <span className="text-xs font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-400/20 px-2.5 py-1 rounded-full">Open for applications</span>}
            {closed && <span className="text-xs font-semibold bg-amber-500/15 text-amber-300 border border-amber-400/20 px-2.5 py-1 rounded-full">Currently closed</span>}
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold mb-2">{o.title}</h1>
          {o.employerName && <p className="text-slate-300">{o.employerName}</p>}
          <div className="mt-6 flex flex-wrap gap-x-6 gap-y-3 text-sm text-slate-300">
            <span className="flex items-center gap-2"><FiMapPin className="w-4 h-4 text-indigo-300" />{o.country}{o.location ? ` · ${o.location}` : ""}</span>
            <span className="flex items-center gap-2"><FiUsers className="w-4 h-4 text-indigo-300" />{formatSalary(o)}</span>
            {o.durationMonths ? <span className="flex items-center gap-2"><FiClock className="w-4 h-4 text-indigo-300" />{o.durationMonths} months</span> : null}
            {o.startDate ? <span className="flex items-center gap-2"><FiCalendar className="w-4 h-4 text-indigo-300" />Start {o.startDate}</span> : null}
          </div>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {[
            { l: "Positions", v: `${positionsLeft(o)} of ${o.numberOfPositions} remaining` },
            { l: "Working hours", v: o.workingHours || "As per contract" },
            { l: "Deadline", v: deadlineLabel(o.applicationDeadline) || "Rolling" },
          ].map(s => (
            <div key={s.l} className="bg-white rounded-2xl border border-slate-100 p-4">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">{s.l}</p>
              <p className="text-sm font-semibold text-slate-900">{s.v}</p>
            </div>
          ))}
        </div>

        <Section title="About the role">
          <p className="text-slate-600 leading-relaxed whitespace-pre-line">{o.description || "No description provided."}</p>
        </Section>

        {reqList.length > 0 && (
          <Section title="Requirements">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {reqList.map(r => (
                <div key={r.key}>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">{r.label}</p>
                  <p className="text-sm text-slate-700 whitespace-pre-line">{o[r.key]}</p>
                </div>
              ))}
              {(o.minimumAge || o.maximumAge) && (
                <div>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Age</p>
                  <p className="text-sm text-slate-700">{o.minimumAge ?? 18}{o.maximumAge ? ` – ${o.maximumAge}` : "+"} years</p>
                </div>
              )}
              {o.genderRequirement && (
                <div>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Gender</p>
                  <p className="text-sm text-slate-700">{o.genderRequirement.charAt(0) + o.genderRequirement.slice(1).toLowerCase()}</p>
                </div>
              )}
            </div>
          </Section>
        )}

        {(o.benefits || o.accommodationProvided || o.transportProvided) && (
          <Section title="Benefits">
            <div className="flex flex-wrap gap-2 mb-4">
              {o.accommodationProvided && <span className="inline-flex items-center gap-1.5 text-xs font-semibold bg-emerald-50 text-emerald-700 px-2.5 py-1.5 rounded-lg"><FiCheckCircle className="w-3.5 h-3.5" /> Accommodation provided</span>}
              {o.transportProvided && <span className="inline-flex items-center gap-1.5 text-xs font-semibold bg-emerald-50 text-emerald-700 px-2.5 py-1.5 rounded-lg"><FiCheckCircle className="w-3.5 h-3.5" /> Transport provided</span>}
            </div>
            {o.benefits && <p className="text-slate-600 leading-relaxed whitespace-pre-line">{o.benefits}</p>}
          </Section>
        )}

        {o.termsAndConditions && (
          <Section title="Terms & conditions">
            <p className="text-slate-600 leading-relaxed whitespace-pre-line">{o.termsAndConditions}</p>
          </Section>
        )}

        <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 rounded-3xl text-white p-8 text-center">
          <FiBriefcase className="w-8 h-8 mx-auto mb-3 text-indigo-300" />
          <h2 className="text-xl sm:text-2xl font-extrabold mb-2">Interested in this position?</h2>
          <p className="text-slate-300 max-w-md mx-auto mb-6">Register as a candidate and our recruiters will review your profile against this opportunity.</p>
{closed ? (
            <span className="inline-block px-8 py-3.5 bg-white/10 border border-white/15 text-slate-300 font-semibold rounded-xl">No longer accepting applications</span>
          ) : applied ? (
            <Link href="/applicant/portal" className="inline-flex items-center gap-2 px-8 py-3.5 bg-emerald-500 hover:bg-emerald-400 text-white font-semibold rounded-xl transition-all shadow-lg shadow-emerald-500/20">
              <FiCheckCircle className="w-5 h-5" /> Applied — track in your portal
            </Link>
          ) : isApplicantLoggedIn() ? (
            <button onClick={handleApply} disabled={applying}
              className="inline-flex items-center gap-2 px-8 py-3.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 text-white font-semibold rounded-xl transition-all shadow-lg shadow-indigo-600/20">
              {applying ? "Applying..." : "Apply Now"} {!applying && <FiArrowRight className="w-5 h-5" />}
            </button>
          ) : (
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link href="/registration" className="inline-flex items-center gap-2 px-8 py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl transition-all shadow-lg shadow-indigo-600/20">
                Register to apply <FiArrowRight className="w-5 h-5" />
              </Link>
              <Link href="/applicant/login" className="inline-flex items-center gap-2 px-6 py-3.5 bg-white/10 border border-white/20 text-white font-semibold rounded-xl hover:bg-white/20 transition-all">
                Sign in
              </Link>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </main>
  );
}