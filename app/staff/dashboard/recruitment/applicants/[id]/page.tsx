"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import api from "@/app/staff/auth/api";
import { withUploadToken } from "@/app/lib/uploads";
import toast from "react-hot-toast";
import { FiArrowLeft, FiUser, FiCheckCircle, FiXCircle, FiUpload, FiDownload } from "react-icons/fi";
import {
  Applicant, RecruitmentApplication, StaffMember, ReadinessResult, Consent,
  ApplicantDocument, DocumentType, DocumentRequirement,
  LifecycleStage, lifecycleLabels, applicationLabels, ageFrom, fmtDate, fmtDateTime,
  documentStatusLabels, documentStatusTone,
} from "@/app/staff/lib/recruitment";

const TRANSITIONS: Record<string, string[]> = {
  REGISTERED: ["PROFILE_COMPLETE"],
  PROFILE_COMPLETE: ["UNDER_REVIEW", "INACTIVE"],
  UNDER_REVIEW: ["VETTED", "INACTIVE"],
  VETTED: ["ELIGIBLE", "INACTIVE"],
  ELIGIBLE: ["INACTIVE"],
  INACTIVE: ["PROFILE_COMPLETE", "UNDER_REVIEW", "VETTED", "ELIGIBLE"],
  BLACKLISTED: [],
};

const consentTypes = ["DATA_PROCESSING", "MEDICAL", "TRAVEL", "CONTACT", "MARKETING", "TERMS_AND_CONDITIONS"];

function Field({ label, value }: { label: string; value?: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-0.5">{label}</p>
      <p className="text-sm text-slate-800">{value || "—"}</p>
    </div>
  );
}

export default function ApplicantDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [a, setA] = useState<Applicant | null>(null);
  const [apps, setApps] = useState<RecruitmentApplication[]>([]);
  const [staffList, setStaffList] = useState<StaffMember[]>([]);
  const [consents, setConsents] = useState<Consent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [target, setTarget] = useState("");
  const [reason, setReason] = useState("");
  const [recruiterId, setRecruiterId] = useState("");
  const [busy, setBusy] = useState(false);
  const [readiness, setReadiness] = useState<ReadinessResult | null>(null);
  const [showReadiness, setShowReadiness] = useState(false);
  const [consentType, setConsentType] = useState(consentTypes[0]);
  const [termsVersion, setTermsVersion] = useState("v1");
  const [consentBusy, setConsentBusy] = useState(false);

  const [docs, setDocs] = useState<ApplicantDocument[]>([]);
  const [docTypes, setDocTypes] = useState<DocumentType[]>([]);
  const [requirements, setRequirements] = useState<DocumentRequirement[]>([]);
  const [uploadType, setUploadType] = useState("");
  const [docBusy, setDocBusy] = useState(false);
  const [actionModal, setActionModal] = useState<{ doc: ApplicantDocument; kind: "reject" | "resubmit" } | null>(null);
  const [actionReason, setActionReason] = useState("");
  const [actionBusy, setActionBusy] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [aRes, appsRes, staffRes, consentRes, docsRes, typesRes] = await Promise.all([
        api.get(`/api/applicants/${params.id}`),
        api.get(`/api/recruitment/applications/by-applicant/${params.id}`),
        api.get("/api/staff"),
        api.get(`/api/applicants/${params.id}/consent`),
        api.get(`/api/documents/applicant/${params.id}/current`),
        api.get("/api/documents/types"),
      ]);
      setA(aRes.data);
      setApps(Array.isArray(appsRes.data) ? appsRes.data : []);
      setStaffList(Array.isArray(staffRes.data) ? staffRes.data : []);
      setConsents(Array.isArray(consentRes.data) ? consentRes.data : []);
      setDocs(Array.isArray(docsRes.data) ? docsRes.data : []);
      setDocTypes(Array.isArray(typesRes.data) ? typesRes.data : []);
    } catch {
      setError("Applicant not found or you lack permission.");
    } finally {
      setLoading(false);
    }
  }, [params.id]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    if (!a?.applicantType) return;
    api.get(`/api/documents/requirements?applicantType=${a.applicantType}`)
      .then(r => setRequirements(Array.isArray(r.data) ? r.data : []))
      .catch(() => {});
  }, [a?.applicantType]);

  if (loading) return <div className="p-6 max-w-5xl mx-auto space-y-4">{Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-24 bg-slate-100 rounded-2xl animate-pulse" />)}</div>;

  if (error || !a) {
    return (
      <div className="p-6 max-w-2xl mx-auto text-center py-16">
        <p className="text-slate-500 mb-4">{error}</p>
        <button onClick={() => router.push("/staff/dashboard/recruitment/applicants")} className="px-5 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-semibold">Back to applicants</button>
      </div>
    );
  }

  const transitions = TRANSITIONS[a.lifecycleStage] || [];

  const transition = async () => {
    if (!target) return;
    setBusy(true);
    try {
      const res = await api.patch(`/api/applicants/${a.id}/lifecycle`, { stage: target, reason: reason || undefined });
      setA(res.data);
      toast.success(`Moved to ${lifecycleLabels[res.data.lifecycleStage as LifecycleStage]}`);
      setTarget(""); setReason("");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Transition failed");
    } finally { setBusy(false); }
  };

  const assignRecruiter = async () => {
    if (!recruiterId) return;
    setBusy(true);
    try {
      const res = await api.patch(`/api/applicants/${a.id}/recruiter`, { recruiterId: Number(recruiterId) });
      setA(res.data);
      toast.success("Recruiter assigned");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Assignment failed");
    } finally { setBusy(false); }
  };

  const checkReadiness = async () => {
    setShowReadiness(true); setReadiness(null);
    try {
      const res = await api.get(`/api/applicants/${a.id}/readiness`);
      setReadiness(res.data);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Readiness check failed");
    }
  };

  const grantConsent = async () => {
    setConsentBusy(true);
    try {
      const res = await api.post(`/api/applicants/${a.id}/consent`, { consentType, termsVersion, source: "OFFICE" });
      setConsents(prev => [res.data, ...prev]);
      toast.success("Consent recorded");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to record consent");
    } finally { setConsentBusy(false); }
  };

  const revokeConsent = async (c: Consent) => {
    try {
      const res = await api.patch(`/api/applicants/consent/${c.id}/revoke`);
      setConsents(prev => prev.map(x => x.id === c.id ? res.data : x));
      toast.success("Consent revoked");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Revoke failed");
    }
  };

  const verifyDoc = async (doc: ApplicantDocument) => {
    setDocBusy(true);
    try {
      const res = await api.patch(`/api/documents/applicant/${doc.id}/verify`);
      setDocs(prev => prev.map(d => d.id === doc.id ? res.data : d));
      toast.success("Document verified");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Verification failed");
    } finally { setDocBusy(false); }
  };

  const submitDocAction = async () => {
    if (!actionModal) return;
    setActionBusy(true);
    try {
      const { doc, kind } = actionModal;
      const path = kind === "reject" ? "reject" : "resubmission-required";
      const res = await api.patch(`/api/documents/applicant/${doc.id}/${path}`, { reason: actionReason });
      setDocs(prev => prev.map(d => d.id === doc.id ? res.data : d));
      toast.success(kind === "reject" ? "Document rejected" : "Resubmission requested");
      setActionModal(null); setActionReason("");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Action failed");
    } finally { setActionBusy(false); }
  };

  const uploadDoc = async (file: File) => {
    if (!uploadType) { toast.error("Select a document type first"); return; }
    setDocBusy(true);
    try {
      const fd = new FormData();
      fd.append("documentTypeId", uploadType);
      fd.append("file", file);
      const res = await api.post(`/api/documents/applicant/${a.id}/upload`, fd);
      setDocs(prev => prev.filter(d => !(d.current && d.documentType.id === Number(uploadType))).concat([res.data]));
      toast.success("Document uploaded");
      setUploadType("");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Upload failed");
    } finally { setDocBusy(false); }
  };

  const p = a.profile;

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <Link href="/staff/dashboard/recruitment/applicants" className="inline-flex items-center gap-1.5 text-sm text-indigo-600 hover:underline">
        <FiArrowLeft className="w-4 h-4" /> All applicants
      </Link>

      <div className="bg-white rounded-2xl border border-slate-100 p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
              <FiUser className="w-7 h-7" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl font-bold text-slate-900">{a.fullName}</h1>
                <span className="text-[11px] font-semibold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">{lifecycleLabels[a.lifecycleStage]}</span>
                {a.status === "BLACKLISTED" && <span className="text-[11px] font-semibold bg-red-50 text-red-600 px-2 py-0.5 rounded-full">Blacklisted</span>}
              </div>
              <p className="text-sm text-slate-500 mt-1">{a.applicantNumber} · {a.applicantType === "LOCAL" ? "Local" : "International"} applicant · registered {fmtDate(a.createdAt)}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={checkReadiness} className="px-4 py-2 rounded-xl border border-indigo-200 text-indigo-600 text-sm font-semibold hover:bg-indigo-50 transition">
              {showReadiness && readiness ? (readiness.ready ? "Ready" : "Not ready") : "Check readiness"}
            </button>
          </div>
        </div>

        {showReadiness && (
          <div className={`mt-5 rounded-2xl border p-5 ${readiness ? (readiness.ready ? "border-emerald-200 bg-emerald-50" : "border-amber-200 bg-amber-50") : "border-slate-200 bg-slate-50 animate-pulse"}`}>
            {readiness ? (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  {readiness.ready
                    ? <FiCheckCircle className="w-5 h-5 text-emerald-600" />
                    : <FiXCircle className="w-5 h-5 text-amber-600" />}
                  <p className="font-semibold text-slate-800">{readiness.ready ? "Ready" : "Not ready yet"}</p>
                </div>
                <div className="space-y-1.5">
                  {readiness.explanations.map((e, i) => (
                    <div key={i} className="flex items-start gap-2 text-sm">
                      <span className={readiness.ready ? "text-emerald-600" : "text-red-500"}>
                        {readiness.ready ? <FiCheckCircle className="w-4 h-4 mt-0.5" /> : <FiXCircle className="w-4 h-4 mt-0.5" />}
                      </span>
                      <p className="text-slate-700">{e}</p>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-sm text-slate-500">Checking...</p>
            )}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-100 p-6">
            <h2 className="font-bold text-slate-900 mb-4">Personal Information</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <Field label="First name" value={a.firstName} />
              <Field label="Middle name" value={a.middleName} />
              <Field label="Last name" value={a.lastName} />
              <Field label="Gender" value={a.gender} />
              <Field label="Date of birth" value={a.dateOfBirth ? `${fmtDate(a.dateOfBirth)} (${ageFrom(a.dateOfBirth)} yrs)` : undefined} />
              <Field label="Nationality" value={a.nationality} />
              <Field label="County" value={a.county} />
              <Field label="Address" value={a.address} />
              <Field label="Source" value={a.registrationSource} />
              <Field label="Email" value={a.email} />
              <Field label="Phone" value={a.phoneNumber} />
              <Field label="Alt phone" value={a.alternativePhone} />
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-100 p-6">
            <h2 className="font-bold text-slate-900 mb-4">Professional Profile</h2>
            {!p ? (
              <p className="text-sm text-slate-400">Profile not completed yet.</p>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                <Field label="Education" value={p.educationLevel} />
                <Field label="Field of study" value={p.fieldOfStudy} />
                <Field label="Experience" value={p.yearsOfExperience != null ? `${p.yearsOfExperience} yrs` : undefined} />
                <Field label="Employment" value={p.employmentStatus} />
                <Field label="Current employer" value={p.currentEmployer} />
                <Field label="Current position" value={p.currentPosition} />
                <Field label="Availability" value={p.availability} />
                <Field label="Available from" value={p.availableFrom ? fmtDate(p.availableFrom) : undefined} />
                <Field label="Relocate" value={p.willingToRelocate ? "Yes" : "No"} />
                <Field label="Skills" value={p.skills} />
                <Field label="Languages" value={p.languages} />
                <Field label="Preferred countries" value={p.preferredCountries} />
                <Field label="Preferred categories" value={p.preferredJobCategories} />
                <Field label="Salary expectation" value={p.preferredSalary != null ? `${p.preferredSalaryCurrency || "KES"} ${p.preferredSalary}` : undefined} />
              </div>
            )}
          </div>

          <div className="bg-white rounded-2xl border border-slate-100 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-slate-900">Applications</h2>
              <Link href="/staff/dashboard/recruitment/applications" className="text-xs text-indigo-600 hover:underline">All applications</Link>
            </div>
            {apps.length === 0 ? (
              <p className="text-sm text-slate-400 py-3 text-center">No applications yet</p>
            ) : (
              <div className="space-y-2">
                {apps.map(app => (
                  <div key={app.id} className="flex items-center justify-between py-2.5 border-b border-slate-50 last:border-0">
                    <div>
                      <p className="text-sm font-semibold text-slate-800">{app.opportunityTitle}</p>
                      <p className="text-xs text-slate-400">Applied {fmtDate(app.appliedAt)}{app.interviewCount > 0 ? ` · ${app.interviewCount} interview${app.interviewCount > 1 ? "s" : ""}` : ""}</p>
                    </div>
                    <span className="text-[11px] font-semibold bg-slate-100 text-slate-600 px-2.5 py-1 rounded-full">{applicationLabels[app.status]}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-white rounded-2xl border border-slate-100 p-6">
            <h2 className="font-bold text-slate-900 mb-4">Consents</h2>
            <div className="flex flex-wrap items-end gap-2 mb-4">
              <div className="flex-1 min-w-[180px]">
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Type</label>
                <select value={consentType} onChange={e => setConsentType(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm">
                  {consentTypes.map(t => <option key={t} value={t}>{t.replace(/_/g, " ")}</option>)}
                </select>
              </div>
              <div className="w-28">
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Terms</label>
                <input value={termsVersion} onChange={e => setTermsVersion(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm" />
              </div>
              <button onClick={grantConsent} disabled={consentBusy} className="px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 disabled:opacity-50">
                {consentBusy ? "..." : "Grant"}
              </button>
            </div>
            {consents.length === 0 ? (
              <p className="text-sm text-slate-400 py-2 text-center">No consents recorded</p>
            ) : (
              <div className="space-y-2">
                {consents.map(c => (
                  <div key={c.id} className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
                    <div>
                      <p className="text-sm font-semibold text-slate-800">{c.consentType.replace(/_/g, " ")}</p>
                      <p className="text-xs text-slate-400">{c.status} · {c.termsVersion || "—"} · {fmtDateTime(c.signedAt)}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {c.status === "ACTIVE" && (
                        <button onClick={() => revokeConsent(c)} className="text-xs text-red-500 hover:underline">Revoke</button>
                      )}
                      <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${c.status === "ACTIVE" ? "bg-emerald-50 text-emerald-600" : "bg-slate-100 text-slate-500"}`}>{c.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-white rounded-2xl border border-slate-100 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-slate-900">Documents & Verification</h2>
              <span className="text-[11px] font-semibold bg-indigo-50 text-indigo-600 px-2.5 py-1 rounded-full">
                {docs.filter(d => d.status === "VERIFIED").length}/{docs.length} verified
              </span>
            </div>

            <div className="flex flex-wrap items-end gap-2 mb-4">
              <div className="flex-1 min-w-[180px]">
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Upload on behalf</label>
                <select value={uploadType} onChange={e => setUploadType(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm">
                  <option value="">Select type…</option>
                  {docTypes.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
              </div>
              <label className="px-4 py-2 rounded-lg bg-indigo-50 text-indigo-600 text-sm font-semibold hover:bg-indigo-100 border border-indigo-100 cursor-pointer inline-flex items-center gap-2">
                <FiUpload className="w-4 h-4" /> Upload file
                <input type="file" className="hidden" disabled={docBusy} onChange={e => { const f = e.target.files?.[0]; if (f) uploadDoc(f); e.target.value = ""; }} />
              </label>
            </div>

            {docs.length === 0 ? (
              <p className="text-sm text-slate-400 py-3 text-center">No documents uploaded yet</p>
            ) : (
              <div className="space-y-2">
                {docs.map(d => {
                  const req = requirements.find(r => r.documentType.id === d.documentType.id);
                  const verified = d.status === "VERIFIED";
                  return (
                    <div key={d.id} className="py-2.5 border-b border-slate-50 last:border-0">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-semibold text-slate-800">{d.documentType.name}</p>
                          {req?.required && <span className="text-[10px] font-semibold bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded">Required</span>}
                          {d.version > 1 && <span className="text-[10px] font-semibold bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded">v{d.version}</span>}
                        </div>
                        <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${documentStatusTone[d.status] || "bg-slate-100 text-slate-600"}`}>
                          {documentStatusLabels[d.status] || d.status}
                        </span>
                      </div>
                      {d.originalName && (
                        <p className="text-xs text-slate-400 mt-0.5">
                          {d.fileUrl ? (
                            <a href={withUploadToken(d.fileUrl)} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-indigo-600 hover:underline">
                              <FiDownload className="w-3 h-3" /> {d.originalName}
                            </a>
                          ) : d.originalName}
                          {d.uploadedAt ? ` · ${fmtDateTime(d.uploadedAt)}` : ""}
                        </p>
                      )}
                      {d.verifiedByName && <p className="text-xs text-emerald-600 mt-0.5">Verified by {d.verifiedByName}{d.verifiedAt ? ` · ${fmtDateTime(d.verifiedAt)}` : ""}</p>}
                      {d.rejectionReason && <p className="text-xs text-red-500 mt-0.5">Reason: {d.rejectionReason}</p>}
                      {!verified && (
                        <div className="flex items-center gap-1.5 mt-2">
                          <button onClick={() => verifyDoc(d)} disabled={docBusy} className="px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-600 text-xs font-semibold hover:bg-emerald-100 border border-emerald-100">Verify</button>
                          <button onClick={() => { setActionReason(""); setActionModal({ doc: d, kind: "resubmit" }); }} disabled={docBusy} className="px-3 py-1.5 rounded-lg bg-amber-50 text-amber-600 text-xs font-semibold hover:bg-amber-100 border border-amber-100">Request resubmission</button>
                          <button onClick={() => { setActionReason(""); setActionModal({ doc: d, kind: "reject" }); }} disabled={docBusy} className="px-3 py-1.5 rounded-lg bg-red-50 text-red-600 text-xs font-semibold hover:bg-red-100 border border-red-100">Reject</button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-100 p-6">
            <h2 className="font-bold text-slate-900 mb-4">Lifecycle</h2>
            <p className="text-xs text-slate-400 mb-3">Current: <span className="font-semibold text-slate-700">{lifecycleLabels[a.lifecycleStage]}</span></p>
            {transitions.length === 0 ? (
              <p className="text-sm text-slate-400">No further transitions available.</p>
            ) : (
              <div className="space-y-3">
                <select value={target} onChange={e => setTarget(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm">
                  <option value="">Move to…</option>
                  {transitions.map(t => <option key={t} value={t}>{lifecycleLabels[t as keyof typeof lifecycleLabels]}</option>)}
                </select>
                <input value={reason} onChange={e => setReason(e.target.value)} placeholder="Reason (required for inactive)" className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm" />
                <button onClick={transition} disabled={!target || busy} className="w-full py-2.5 rounded-lg bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 disabled:opacity-50">
                  {busy ? "Updating..." : "Update stage"}
                </button>
              </div>
            )}
          </div>

          <div className="bg-white rounded-2xl border border-slate-100 p-6">
            <h2 className="font-bold text-slate-900 mb-4">Assigned Recruiter</h2>
            <p className="text-sm text-slate-700 mb-3">{a.assignedRecruiterName || "Not assigned"}</p>
            <div className="space-y-3">
              <select value={recruiterId} onChange={e => setRecruiterId(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm">
                <option value="">Select recruiter…</option>
                {staffList.map(s => <option key={s.id} value={s.id}>{s.fullName}</option>)}
              </select>
              <button onClick={assignRecruiter} disabled={!recruiterId || busy} className="w-full py-2.5 rounded-lg border border-indigo-200 text-indigo-600 text-sm font-semibold hover:bg-indigo-50 disabled:opacity-50">
                Assign
              </button>
            </div>
          </div>
        </div>
      </div>

      {actionModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setActionModal(null)}>
          <div className="bg-white rounded-2xl w-full max-w-md p-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-slate-900">{actionModal.kind === "reject" ? "Reject document" : "Request resubmission"}</h2>
              <button onClick={() => setActionModal(null)} className="p-1.5 rounded-lg hover:bg-slate-100"><FiXCircle className="w-5 h-5 text-slate-500" /></button>
            </div>
            <p className="text-sm text-slate-500 mb-3">{actionModal.doc.documentType.name}</p>
            <textarea value={actionReason} onChange={e => setActionReason(e.target.value)} placeholder="Reason (required)" rows={3} className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            <div className="flex gap-3 pt-2">
              <button onClick={() => setActionModal(null)} className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-sm font-semibold">Cancel</button>
              <button onClick={submitDocAction} disabled={!actionReason.trim() || actionBusy} className={`flex-1 py-2.5 rounded-xl text-white text-sm font-semibold disabled:opacity-50 ${actionModal.kind === "reject" ? "bg-red-600 hover:bg-red-700" : "bg-amber-500 hover:bg-amber-600"}`}>
                {actionBusy ? "Saving..." : actionModal.kind === "reject" ? "Reject document" : "Request resubmission"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}