"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";
import toast from "react-hot-toast";
import {
  FiUser, FiFileText, FiBriefcase, FiLogOut, FiCheckCircle,
  FiUpload, FiArrowRight, FiShield, FiAlertTriangle, FiClock
} from "react-icons/fi";
import api from "@/app/applicant/auth/api";
import { isApplicantLoggedIn, clearSession, getApplicantNumber } from "@/app/applicant/auth/session";

type Lifecycle = "REGISTERED" | "PROFILE_COMPLETE" | "UNDER_REVIEW" | "VETTED" | "ELIGIBLE" | "INACTIVE" | "BLACKLISTED";
type Availability = "AVAILABLE_IMMEDIATELY" | "AVAILABLE_IN_30_DAYS" | "EMPLOYED" | "UNAVAILABLE";
type MaritalStatus = "SINGLE" | "MARRIED" | "DIVORCED" | "WIDOWED";
type ConsentType = "DATA_PROCESSING" | "MEDICAL" | "TRAVEL" | "CONTACT" | "MARKETING" | "TERMS_AND_CONDITIONS";
type AppStatus = "SUBMITTED" | "SCREENING" | "SHORTLISTED" | "INTERVIEW" | "OFFERED" | "ACCEPTED" | "PLACED" | "REJECTED" | "WITHDRAWN";
type OfferStatus = "PENDING" | "ACCEPTED" | "REJECTED" | "WITHDRAWN" | "EXPIRED";
type DocStatus = "NOT_SUBMITTED" | "UPLOADED" | "UNDER_REVIEW" | "VERIFIED" | "REJECTED" | "RESUBMISSION_REQUIRED" | "EXPIRED";

interface DocType { id: number; code: string; name: string; description?: string | null; requiresVerification: boolean; }
interface Profile {
  educationLevel?: string | null; fieldOfStudy?: string | null; professionalSummary?: string | null;
  yearsOfExperience?: number | null; skills?: string | null; languages?: string | null;
  preferredJobCategories?: string | null; preferredCountries?: string | null;
  preferredSalary?: number | null; preferredSalaryCurrency?: string | null;
  availability?: Availability | null; availableFrom?: string | null;
  willingToRelocate?: boolean; employmentStatus?: string | null;
  currentEmployer?: string | null; currentPosition?: string | null;
  relevantExperience?: string | null; reasonForLeaving?: string | null;
  religion?: string | null; maritalStatus?: MaritalStatus | null;
  numberOfChildren?: number | null; nextOfKinName?: string | null;
  nextOfKinPhone?: string | null; nextOfKinRelationship?: string | null;
}
interface Applicant {
  id: number; applicantNumber: string; applicantType: "LOCAL" | "INTERNATIONAL";
  firstName: string; lastName: string; fullName: string;
  email?: string | null; phoneNumber: string; nationality?: string | null; county?: string | null;
  lifecycleStage: Lifecycle; status: string; profile: Profile | null;
}
interface Consent { id: number; consentType: ConsentType; termsVersion?: string | null; status: "ACTIVE" | "REVOKED"; signedAt: string; }
interface Requirement { id: number; documentType: DocType; required: boolean; }
interface ApplicantDoc { id: number; documentType: DocType; fileUrl?: string | null; originalName?: string | null; status: DocStatus; version: number; current: boolean; rejectionReason?: string | null; uploadedAt: string; }
interface Application { id: number; applicantId: number; opportunityId: number; opportunityTitle: string; assignedRecruiterName?: string | null; status: AppStatus; rejectionReason?: string | null; rejectionDetails?: string | null; appliedAt: string; interviewCount: number; offerCount: number; }
interface Offer { id: number; applicationId: number; opportunityTitle: string; offeredSalary?: number | null; currency?: string | null; positionTitle?: string | null; startDate?: string | null; benefits?: string | null; conditions?: string | null; status: OfferStatus; rejectionReason?: string | null; offeredAt: string; expiresAt?: string | null; }
interface Readiness { ready: boolean; explanations: string[]; }

const lifecycleColors: Record<Lifecycle, string> = {
  REGISTERED: "bg-slate-100 text-slate-700",
  PROFILE_COMPLETE: "bg-blue-100 text-blue-700",
  UNDER_REVIEW: "bg-amber-100 text-amber-700",
  VETTED: "bg-teal-100 text-teal-700",
  ELIGIBLE: "bg-emerald-100 text-emerald-700",
  INACTIVE: "bg-gray-100 text-gray-600",
  BLACKLISTED: "bg-red-100 text-red-700",
};
const appColors: Record<AppStatus, string> = {
  SUBMITTED: "bg-slate-100 text-slate-700",
  SCREENING: "bg-blue-100 text-blue-700",
  SHORTLISTED: "bg-teal-100 text-teal-700",
  INTERVIEW: "bg-amber-100 text-amber-700",
  OFFERED: "bg-violet-100 text-violet-700",
  ACCEPTED: "bg-emerald-100 text-emerald-700",
  PLACED: "bg-emerald-100 text-emerald-700",
  REJECTED: "bg-red-100 text-red-700",
  WITHDRAWN: "bg-gray-100 text-gray-600",
};
const offerColors: Record<OfferStatus, string> = {
  PENDING: "bg-amber-100 text-amber-700",
  ACCEPTED: "bg-emerald-100 text-emerald-700",
  REJECTED: "bg-red-100 text-red-700",
  WITHDRAWN: "bg-gray-100 text-gray-600",
  EXPIRED: "bg-gray-100 text-gray-600",
};
const consentTypes: { value: ConsentType; label: string; desc: string }[] = [
  { value: "DATA_PROCESSING", label: "Data processing", desc: "SSL Agency may collect and process my personal data for recruitment." },
  { value: "MEDICAL", label: "Medical information", desc: "SSL Agency may collect and process medical information required for the role." },
  { value: "TRAVEL", label: "Travel & deployment", desc: "SSL Agency may arrange and process my travel and deployment." },
  { value: "CONTACT", label: "Contact me", desc: "SSL Agency may contact me by phone, SMS or email about opportunities." },
  { value: "MARKETING", label: "Marketing", desc: "SSL Agency may send me promotional information about services." },
  { value: "TERMS_AND_CONDITIONS", label: "Terms & conditions", desc: "I have read and accept the terms and conditions." },
];
const consentsKey: Record<ConsentType, string> = {
  DATA_PROCESSING: "DATA_PROCESSING", MEDICAL: "MEDICAL", TRAVEL: "TRAVEL",
  CONTACT: "CONTACT", MARKETING: "MARKETING", TERMS_AND_CONDITIONS: "TERMS_AND_CONDITIONS",
};

const TabBtn = ({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) => (
  <button onClick={onClick}
    className={`px-4 py-2 rounded-xl text-sm font-semibold transition ${active ? "bg-indigo-600 text-white shadow-sm" : "text-slate-600 hover:bg-slate-100"}`}>
    {children}
  </button>
);

const Badge = ({ label, className }: { label: string; className: string }) => (
  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${className}`}>{label}</span>
);

export default function ApplicantPortalPage() {
  const router = useRouter();
  const [authed, setAuthed] = useState(false);
  const [tab, setTab] = useState<"overview" | "profile" | "docs" | "apps">("overview");

  const [me, setMe] = useState<Applicant | null>(null);
  const [consents, setConsents] = useState<Consent[]>([]);
  const [requirements, setRequirements] = useState<Requirement[]>([]);
  const [docs, setDocs] = useState<ApplicantDoc[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [readiness, setReadiness] = useState<Readiness | null>(null);
  const [offersByApp, setOffersByApp] = useState<Record<number, Offer[]>>({});
  const [loading, setLoading] = useState(true);

  const loadAll = async () => {
    const [m, c, r, d, a, rd] = await Promise.all([
      api.get("/api/applicants/me"),
      api.get("/api/applicants/me/consent"),
      api.get("/api/applicants/me/document-requirements"),
      api.get("/api/applicants/me/documents"),
      api.get("/api/applicants/me/applications"),
      api.get("/api/applicants/me/readiness"),
    ]);
    setMe(m.data);
    setConsents(Array.isArray(c.data) ? c.data : []);
    setRequirements(Array.isArray(r.data) ? r.data : []);
    setDocs(Array.isArray(d.data) ? d.data : []);
    setApplications(Array.isArray(a.data) ? a.data : []);
    setReadiness(rd.data);
    const offerMap: Record<number, Offer[]> = {};
    for (const app of (Array.isArray(a.data) ? a.data : [])) {
      try {
        const res = await api.get(`/api/applicants/me/applications/${app.id}/offers`);
        offerMap[app.id] = Array.isArray(res.data) ? res.data : [];
      } catch { offerMap[app.id] = []; }
    }
    setOffersByApp(offerMap);
  };

  useEffect(() => {
    if (!isApplicantLoggedIn()) {
      router.replace("/applicant/login?next=/applicant/portal");
      return;
    }
    setAuthed(true);
    loadAll().catch(err => {
      if (err?.response?.status === 401 || err?.response?.status === 403) {
        clearSession();
        router.replace("/applicant/login?next=/applicant/portal");
      }
      toast.error("Failed to load your profile");
    }).finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const signOut = () => {
    clearSession();
    router.replace("/applicant/login");
  };

  const granted = (t: ConsentType) => consents.some(c => c.consentType === t && c.status === "ACTIVE");
  const grantConsent = async (t: ConsentType) => {
    try {
      const res = await api.post("/api/applicants/me/consent", { consentType: consentsKey[t], termsVersion: "v1" });
      setConsents(prev => [res.data, ...prev]);
      toast.success("Consent recorded");
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to record consent");
    }
  };

  const uploadDoc = async (typeId: number, file: File) => {
    const fd = new FormData();
    fd.append("documentTypeId", String(typeId));
    fd.append("file", file);
    try {
      const res = await api.post("/api/applicants/me/documents/upload", fd);
      setDocs(prev => prev.filter(d => !(d.current && d.documentType.id === typeId)).concat([res.data]));
      toast.success("Document uploaded");
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Upload failed");
    }
  };

  const withdrawApp = async (app: Application) => {
    const reason = window.prompt(`Withdraw application for "${app.opportunityTitle}"? (optional reason)`);
    if (reason === null) return;
    try {
      await api.post(`/api/applicants/me/applications/${app.id}/withdraw`, { reason: reason || undefined });
      toast.success("Application withdrawn");
      loadAll().catch(() => {});
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to withdraw");
    }
  };

  const respondOffer = async (offerId: number, action: "accept" | "reject") => {
    if (action === "reject") {
      const reason = window.prompt("Reason for rejecting the offer?");
      if (reason === null) return;
      try {
        await api.patch(`/api/applicants/me/offers/${offerId}/reject`, { reason: reason || undefined });
        toast.success("Offer rejected");
      } catch (err: any) {
        toast.error(err?.response?.data?.message || "Failed to reject offer");
        return;
      }
    } else {
      if (!window.confirm("Accept this offer? Your application will move to ACCEPTED.")) return;
      try {
        await api.patch(`/api/applicants/me/offers/${offerId}/accept`);
        toast.success("Offer accepted!");
      } catch (err: any) {
        toast.error(err?.response?.data?.message || "Failed to accept offer");
        return;
      }
    }
    loadAll().catch(() => {});
  };

  if (!authed) {
    return <main className="min-h-screen bg-slate-50"><Navbar /><div className="h-96" /><Footer /></main>;
  }

  if (loading || !me) {
    return (
      <main className="min-h-screen bg-slate-50">
        <Navbar />
        <div className="max-w-5xl mx-auto px-4 py-12 animate-pulse space-y-6">
          <div className="h-24 bg-slate-100 rounded-2xl" />
          <div className="h-64 bg-slate-100 rounded-2xl" />
        </div>
        <Footer />
      </main>
    );
  }

  const p = me.profile || {};
  const requiredDocs = requirements.filter(r => r.required);
  const docFor = (typeId: number) => docs.find(d => d.current && d.documentType.id === typeId);

  const ProfileForm = () => {
    const [f, setF] = useState<Profile>({
      educationLevel: p.educationLevel ?? "",
      fieldOfStudy: p.fieldOfStudy ?? "",
      professionalSummary: p.professionalSummary ?? "",
      yearsOfExperience: p.yearsOfExperience ?? undefined,
      skills: p.skills ?? "",
      languages: p.languages ?? "",
      preferredJobCategories: p.preferredJobCategories ?? "",
      preferredCountries: p.preferredCountries ?? "",
      preferredSalary: p.preferredSalary ?? undefined,
      preferredSalaryCurrency: p.preferredSalaryCurrency ?? "USD",
      availability: p.availability ?? undefined,
      availableFrom: p.availableFrom ?? "",
      willingToRelocate: p.willingToRelocate ?? false,
      employmentStatus: p.employmentStatus ?? "",
      currentEmployer: p.currentEmployer ?? "",
      currentPosition: p.currentPosition ?? "",
      relevantExperience: p.relevantExperience ?? "",
      reasonForLeaving: p.reasonForLeaving ?? "",
      religion: p.religion ?? "",
      maritalStatus: p.maritalStatus ?? undefined,
      numberOfChildren: p.numberOfChildren ?? undefined,
      nextOfKinName: p.nextOfKinName ?? "",
      nextOfKinPhone: p.nextOfKinPhone ?? "",
      nextOfKinRelationship: p.nextOfKinRelationship ?? "",
    });
    const [saving, setSaving] = useState(false);

    const set = <K extends keyof Profile>(k: K, v: Profile[K]) => setF(prev => ({ ...prev, [k]: v }));
    const num = (v: string) => (v === "" ? undefined : Number(v));
    const text = "w-full px-3 py-2.5 rounded-lg border border-slate-300 text-sm text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition";

    const save = async () => {
      setSaving(true);
      try {
        const payload: Profile = {
          ...f,
          yearsOfExperience: f.yearsOfExperience === undefined ? null : f.yearsOfExperience,
          preferredSalary: f.preferredSalary === undefined ? null : f.preferredSalary,
          numberOfChildren: f.numberOfChildren === undefined ? null : f.numberOfChildren,
          availability: f.availability || null,
          maritalStatus: f.maritalStatus || null,
        };
        const res = await api.patch("/api/applicants/me/profile", payload);
        setMe(res.data);
        toast.success("Profile saved");
        setReadiness(null);
        api.get("/api/applicants/me/readiness").then(r => setReadiness(r.data)).catch(() => {});
      } catch (err: any) {
        toast.error(err?.response?.data?.message || "Failed to save profile");
      } finally { setSaving(false); }
    };

    const Field = ({ label, children, span }: { label: string; children: React.ReactNode; span?: boolean }) => (
      <div className={span ? "sm:col-span-2" : ""}>
        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">{label}</label>
        {children}
      </div>
    );

    return (
      <div className="bg-white rounded-2xl border border-slate-100 p-6 space-y-6">
        <div>
          <h3 className="text-lg font-bold text-slate-900 mb-1">Your profile</h3>
          <p className="text-sm text-slate-500">Completing your profile helps our recruiters match you to the right opportunities.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Education level">
            <input className={text} value={f.educationLevel ?? ""} onChange={e => set("educationLevel", e.target.value)} placeholder="e.g. Bachelor's degree" />
          </Field>
          <Field label="Field of study">
            <input className={text} value={f.fieldOfStudy ?? ""} onChange={e => set("fieldOfStudy", e.target.value)} placeholder="e.g. Nursing" />
          </Field>
          <Field label="Years of experience">
            <input type="number" min={0} className={text} value={f.yearsOfExperience ?? ""} onChange={e => set("yearsOfExperience", num(e.target.value))} placeholder="e.g. 3" />
          </Field>
          <Field label="Availability">
            <select className={text} value={f.availability ?? ""} onChange={e => set("availability", (e.target.value || undefined) as Availability | undefined)}>
              <option value="">Select availability</option>
              <option value="AVAILABLE_IMMEDIATELY">Available immediately</option>
              <option value="AVAILABLE_IN_30_DAYS">Available in 30 days</option>
              <option value="EMPLOYED">Currently employed</option>
              <option value="UNAVAILABLE">Currently unavailable</option>
            </select>
          </Field>
          <Field label="Available from">
            <input type="date" className={text} value={f.availableFrom ?? ""} onChange={e => set("availableFrom", e.target.value)} />
          </Field>
          <Field label="Employment status">
            <input className={text} value={f.employmentStatus ?? ""} onChange={e => set("employmentStatus", e.target.value)} placeholder="e.g. Unemployed, Employed" />
          </Field>
          <Field label="Current employer">
            <input className={text} value={f.currentEmployer ?? ""} onChange={e => set("currentEmployer", e.target.value)} />
          </Field>
          <Field label="Current position">
            <input className={text} value={f.currentPosition ?? ""} onChange={e => set("currentPosition", e.target.value)} />
          </Field>
          <Field label="Skills" span>
            <input className={text} value={f.skills ?? ""} onChange={e => set("skills", e.target.value)} placeholder="Comma separated, e.g. Caregiving, First Aid, Cooking" />
          </Field>
          <Field label="Languages" span>
            <input className={text} value={f.languages ?? ""} onChange={e => set("languages", e.target.value)} placeholder="Comma separated, e.g. English, Swahili, Arabic" />
          </Field>
          <Field label="Preferred job categories" span>
            <input className={text} value={f.preferredJobCategories ?? ""} onChange={e => set("preferredJobCategories", e.target.value)} placeholder="e.g. Healthcare, Domestic, Construction" />
          </Field>
          <Field label="Preferred countries" span>
            <input className={text} value={f.preferredCountries ?? ""} onChange={e => set("preferredCountries", e.target.value)} placeholder="e.g. Qatar, UAE, Saudi Arabia" />
          </Field>
          <Field label="Preferred monthly salary">
            <input type="number" min={0} className={text} value={f.preferredSalary ?? ""} onChange={e => set("preferredSalary", num(e.target.value))} placeholder="e.g. 800" />
          </Field>
          <Field label="Currency">
            <input className={text} value={f.preferredSalaryCurrency ?? ""} onChange={e => set("preferredSalaryCurrency", e.target.value)} placeholder="USD" />
          </Field>
          <Field label="Professional summary" span>
            <textarea className={text} rows={3} value={f.professionalSummary ?? ""} onChange={e => set("professionalSummary", e.target.value)} placeholder="Short summary of your experience and strengths" />
          </Field>
          <Field label="Relevant experience" span>
            <textarea className={text} rows={3} value={f.relevantExperience ?? ""} onChange={e => set("relevantExperience", e.target.value)} placeholder="Describe experience relevant to the roles you're seeking" />
          </Field>
          <Field label="Reason for leaving current role" span>
            <textarea className={text} rows={2} value={f.reasonForLeaving ?? ""} onChange={e => set("reasonForLeaving", e.target.value)} />
          </Field>
          <Field label="Marital status">
            <select className={text} value={f.maritalStatus ?? ""} onChange={e => set("maritalStatus", (e.target.value || undefined) as MaritalStatus | undefined)}>
              <option value="">Select</option>
              <option value="SINGLE">Single</option>
              <option value="MARRIED">Married</option>
              <option value="DIVORCED">Divorced</option>
              <option value="WIDOWED">Widowed</option>
            </select>
          </Field>
          <Field label="Number of children">
            <input type="number" min={0} className={text} value={f.numberOfChildren ?? ""} onChange={e => set("numberOfChildren", num(e.target.value))} />
          </Field>
          <Field label="Religion">
            <input className={text} value={f.religion ?? ""} onChange={e => set("religion", e.target.value)} />
          </Field>
          <Field label="Next of kin name">
            <input className={text} value={f.nextOfKinName ?? ""} onChange={e => set("nextOfKinName", e.target.value)} />
          </Field>
          <Field label="Next of kin phone">
            <input className={text} value={f.nextOfKinPhone ?? ""} onChange={e => set("nextOfKinPhone", e.target.value)} />
          </Field>
          <Field label="Next of kin relationship">
            <input className={text} value={f.nextOfKinRelationship ?? ""} onChange={e => set("nextOfKinRelationship", e.target.value)} />
          </Field>
          <Field label="Willing to relocate" span>
            <label className="flex items-center gap-2 text-sm text-slate-700">
              <input type="checkbox" checked={!!f.willingToRelocate} onChange={e => set("willingToRelocate", e.target.checked)} className="w-4 h-4 accent-indigo-600" />
              I am willing to relocate / travel abroad for work
            </label>
          </Field>
        </div>
        <div className="flex justify-end">
          <button onClick={save} disabled={saving}
            className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-sm font-semibold rounded-xl transition">
            {saving ? "Saving..." : "Save profile"}
          </button>
        </div>
      </div>
    );
  };

  const DocumentsTab = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border border-slate-100 p-6">
        <div className="flex items-center gap-2 mb-1"><FiShield className="w-4 h-4 text-indigo-600" /><h3 className="text-lg font-bold text-slate-900">Consent</h3></div>
        <p className="text-sm text-slate-500 mb-5">Grant the consents below so we can process your application.</p>
        <div className="grid grid-cols-1 gap-3">
          {consentTypes.map(c => {
            const active = granted(c.value);
            return (
              <div key={c.value} className="flex items-start justify-between gap-4 rounded-xl border border-slate-200 p-4">
                <div>
                  <p className="text-sm font-semibold text-slate-800">{c.label}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{c.desc}</p>
                </div>
                {active ? (
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full shrink-0"><FiCheckCircle className="w-3.5 h-3.5" /> Granted</span>
                ) : (
                  <button onClick={() => grantConsent(c.value)}
                    className="shrink-0 px-3.5 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition">
                    Grant consent
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 p-6">
        <div className="flex items-center gap-2 mb-1"><FiFileText className="w-4 h-4 text-indigo-600" /><h3 className="text-lg font-bold text-slate-900">Documents</h3></div>
        <p className="text-sm text-slate-500 mb-5">Upload the required documents. Uploading a new version replaces the previous one.</p>
        {requiredDocs.length === 0 && (
          <p className="text-sm text-slate-500 bg-slate-50 rounded-xl p-4">No document requirements have been configured yet.</p>
        )}
        <div className="grid grid-cols-1 gap-3">
          {requiredDocs.map(r => {
            const doc = docFor(r.documentType.id);
            const statusBadge = doc ? (
              doc.status === "VERIFIED" ? <Badge label="Verified" className="bg-emerald-100 text-emerald-700" />
                : doc.status === "REJECTED" ? <Badge label="Rejected" className="bg-red-100 text-red-700" />
                : doc.status === "RESUBMISSION_REQUIRED" ? <Badge label="Resubmission required" className="bg-amber-100 text-amber-700" />
                : doc.status === "UNDER_REVIEW" ? <Badge label="Under review" className="bg-blue-100 text-blue-700" />
                : doc.status === "EXPIRED" ? <Badge label="Expired" className="bg-gray-100 text-gray-600" />
                : doc.status === "NOT_SUBMITTED" ? <Badge label="Not submitted" className="bg-slate-100 text-slate-500" />
                : <Badge label="Uploaded" className="bg-slate-100 text-slate-600" />
            ) : null;
            return (
              <div key={r.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-slate-200 p-4">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-semibold text-slate-800">{r.documentType.name}</p>
                    {r.documentType.requiresVerification && <span className="text-[10px] font-semibold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded">Needs verification</span>}
                    {statusBadge}
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5 truncate">{doc?.originalName || r.documentType.description || "Not uploaded yet"}</p>
                  {doc?.rejectionReason && <p className="text-xs text-red-500 mt-1">Reason: {doc.rejectionReason}</p>}
                </div>
                <label className="shrink-0 inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-100 rounded-lg cursor-pointer transition">
                  <FiUpload className="w-3.5 h-3.5" /> {doc ? "Replace" : "Upload"}
                  <input type="file" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) uploadDoc(r.documentType.id, f); e.target.value = ""; }} />
                </label>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );

  const canWithdraw = (s: AppStatus) => !["REJECTED", "WITHDRAWN", "PLACED", "ACCEPTED"].includes(s);

  const ApplicationsTab = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-slate-900">My applications</h3>
          <p className="text-sm text-slate-500">Track status and respond to offers.</p>
        </div>
        <a href="/opportunities" className="inline-flex items-center gap-1.5 text-sm font-semibold text-indigo-600 hover:text-indigo-700">
          Browse opportunities <FiArrowRight className="w-4 h-4" />
        </a>
      </div>
      {applications.length === 0 && (
        <div className="bg-white rounded-2xl border border-slate-100 p-8 text-center">
          <FiBriefcase className="w-8 h-8 mx-auto mb-3 text-slate-300" />
          <p className="text-sm text-slate-500">You haven't applied to any opportunities yet.</p>
          <a href="/opportunities" className="inline-flex items-center gap-2 mt-4 px-5 py-2.5 bg-indigo-600 text-white text-sm font-semibold rounded-xl hover:bg-indigo-700 transition">
            Explore opportunities <FiArrowRight className="w-4 h-4" />
          </a>
        </div>
      )}
      {applications.map(app => (
        <div key={app.id} className="bg-white rounded-2xl border border-slate-100 p-6 space-y-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="font-bold text-slate-900">{app.opportunityTitle}</p>
              <p className="text-xs text-slate-500 mt-0.5">
                Applied {new Date(app.appliedAt).toLocaleDateString()}
                {app.assignedRecruiterName ? ` · Recruiter: ${app.assignedRecruiterName}` : ""}
              </p>
            </div>
            <Badge label={app.status} className={appColors[app.status]} />
          </div>
          {app.rejectionDetails && <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{app.rejectionDetails}</p>}
          {(offersByApp[app.id] || []).length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Offers</p>
              {(offersByApp[app.id] || []).map(o => (
                <div key={o.id} className="rounded-xl border border-slate-200 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <p className="text-sm font-semibold text-slate-800">
                        {o.positionTitle || "Offer"} {o.offeredSalary != null ? `· ${o.currency || "USD"} ${Number(o.offeredSalary).toLocaleString()}` : ""}
                      </p>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Made {new Date(o.offeredAt).toLocaleDateString()}
                        {o.startDate ? ` · Start ${o.startDate}` : ""}
                        {o.expiresAt ? ` · Expires ${new Date(o.expiresAt).toLocaleDateString()}` : ""}
                      </p>
                    </div>
                    <Badge label={o.status} className={offerColors[o.status]} />
                  </div>
                  {o.benefits && <p className="text-xs text-slate-600 mt-2 whitespace-pre-line"><span className="font-semibold">Benefits:</span> {o.benefits}</p>}
                  {o.conditions && <p className="text-xs text-slate-600 mt-1 whitespace-pre-line"><span className="font-semibold">Conditions:</span> {o.conditions}</p>}
                  {o.status === "PENDING" && (
                    <div className="flex gap-2 mt-3">
                      <button onClick={() => respondOffer(o.id, "accept")}
                        className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition">Accept offer</button>
                      <button onClick={() => respondOffer(o.id, "reject")}
                        className="px-4 py-2 text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 border border-red-100 rounded-lg transition">Decline</button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
          {canWithdraw(app.status) && (
            <button onClick={() => withdrawApp(app)}
              className="text-xs font-semibold text-slate-500 hover:text-red-600 transition">Withdraw application</button>
          )}
        </div>
      ))}
    </div>
  );

  return (
    <main className="min-h-screen bg-slate-50">
      <Navbar />
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 space-y-6">
        <div className="bg-white rounded-2xl border border-slate-100 p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-indigo-100 flex items-center justify-center shrink-0">
              <FiUser className="w-7 h-7 text-indigo-600" />
            </div>
            <div>
              <p className="text-lg font-extrabold text-slate-900">{me.fullName}</p>
              <p className="text-xs text-slate-500">{getApplicantNumber() || me.applicantNumber} · {me.applicantType} applicant</p>
              <div className="mt-1.5 flex flex-wrap items-center gap-2">
                <Badge label={me.lifecycleStage} className={lifecycleColors[me.lifecycleStage]} />
                {me.status === "BLACKLISTED" && <Badge label="Blacklisted" className="bg-red-100 text-red-700" />}
              </div>
            </div>
          </div>
          <button onClick={signOut}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-slate-600 hover:text-red-600 border border-slate-200 rounded-xl transition">
            <FiLogOut className="w-4 h-4" /> Sign out
          </button>
        </div>

        {readiness && (
          <div className={`rounded-2xl border p-5 ${readiness.ready ? "border-emerald-200 bg-emerald-50" : "border-amber-200 bg-amber-50"}`}>
            <div className="flex items-center gap-2 mb-1">
              {readiness.ready
                ? <FiCheckCircle className="w-5 h-5 text-emerald-600" />
                : <FiAlertTriangle className="w-5 h-5 text-amber-600" />}
              <p className="font-bold text-slate-800">
                {readiness.ready ? "You're ready to apply" : "Complete these to start applying"}
              </p>
            </div>
            {readiness.explanations.map((x, i) => (
              <p key={i} className="text-sm text-slate-600 mt-1 flex items-center gap-2">
                <FiClock className="w-3.5 h-3.5 shrink-0 text-slate-400" /> {x}
              </p>
            ))}
          </div>
        )}

        <div className="flex flex-wrap gap-2">
          <TabBtn active={tab === "overview"} onClick={() => setTab("overview")}>Overview</TabBtn>
          <TabBtn active={tab === "profile"} onClick={() => setTab("profile")}>Profile</TabBtn>
          <TabBtn active={tab === "docs"} onClick={() => setTab("docs")}>Documents &amp; Consent</TabBtn>
          <TabBtn active={tab === "apps"} onClick={() => setTab("apps")}>Applications</TabBtn>
        </div>

        {tab === "overview" && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white rounded-2xl border border-slate-100 p-5">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Lifecycle</p>
              <p className="text-lg font-bold text-slate-900">{me.lifecycleStage}</p>
            </div>
            <div className="bg-white rounded-2xl border border-slate-100 p-5">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Consents granted</p>
              <p className="text-lg font-bold text-slate-900">{consents.filter(c => c.status === "ACTIVE").length} / {consentTypes.length}</p>
            </div>
            <div className="bg-white rounded-2xl border border-slate-100 p-5">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Applications</p>
              <p className="text-lg font-bold text-slate-900">{applications.length}</p>
            </div>
          </div>
        )}

        {tab === "profile" && <ProfileForm />}
        {tab === "docs" && <DocumentsTab />}
        {tab === "apps" && <ApplicationsTab />}
      </div>
      <Footer />
    </main>
  );
}
