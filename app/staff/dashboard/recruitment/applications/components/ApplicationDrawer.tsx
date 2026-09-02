"use client";

import { useEffect, useState } from "react";
import api from "@/app/staff/auth/api";
import toast from "react-hot-toast";
import { FiX } from "react-icons/fi";
import {
  RecruitmentApplication, StaffMember, Interview, Offer,
  interviewStatusLabels, interviewTypeLabels, interviewOutcomeLabels,
  offerStatusLabels, fmtDateTime, fmtDate, toLocalDateTimeLocal,
} from "@/app/staff/lib/recruitment";

const inputCls = "w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500";

const interviewTone: Record<string, string> = {
  SCHEDULED: "bg-sky-50 text-sky-600", COMPLETED: "bg-emerald-50 text-emerald-600",
  CANCELLED: "bg-red-50 text-red-600", MISSED: "bg-amber-50 text-amber-600", RESCHEDULED: "bg-slate-100 text-slate-500",
};

const offerTone: Record<string, string> = {
  PENDING: "bg-amber-50 text-amber-600", ACCEPTED: "bg-emerald-50 text-emerald-600",
  REJECTED: "bg-red-50 text-red-600", WITHDRAWN: "bg-slate-100 text-slate-500", EXPIRED: "bg-slate-100 text-slate-500",
};

export default function ApplicationDrawer({
  app, onClose, onChanged,
}: {
  app: RecruitmentApplication | null;
  onClose: () => void;
  onChanged: () => void;
}) {
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [staffList, setStaffList] = useState<StaffMember[]>([]);
  const [busy, setBusy] = useState(false);

  // interview schedule form
  const [iType, setIType] = useState("SSL_SCREENING");
  const [iAt, setIAt] = useState("");
  const [iInterviewer, setIInterviewer] = useState("");
  const [iLocation, setILocation] = useState("");
  const [iLink, setILink] = useState("");

  // offer create form
  const [oSalary, setOSalary] = useState("");
  const [oCurrency, setOCurrency] = useState("USD");
  const [oTitle, setOTitle] = useState("");
  const [oStart, setOStart] = useState("");
  const [oExpires, setOExpires] = useState("");
  const [oBenefits, setOBenefits] = useState("");
  const [oConditions, setOConditions] = useState("");

  // per-row expansion
  const [completeFor, setCompleteFor] = useState<number | null>(null);
  const [cOutcome, setCOutcome] = useState("PASS");
  const [cRating, setCRating] = useState("3");
  const [cNotes, setCNotes] = useState("");
  const [reschedFor, setReschedFor] = useState<number | null>(null);
  const [rAt, setRAt] = useState("");
  const [rLocation, setRLocation] = useState("");
  const [rejectOfferFor, setRejectOfferFor] = useState<number | null>(null);
  const [oRejectReason, setORejectReason] = useState("");

  useEffect(() => {
    if (!app) return;
    setIType("SSL_SCREENING"); setIAt(""); setIInterviewer(""); setILocation(""); setILink("");
    setOSalary(""); setOCurrency("USD"); setOTitle(""); setOStart(""); setOExpires(""); setOBenefits(""); setOConditions("");
    setCompleteFor(null); setReschedFor(null); setRejectOfferFor(null);
    api.get(`/api/recruitment/interviews/by-application/${app.id}`).then(r => setInterviews(Array.isArray(r.data) ? r.data : [])).catch(() => {});
    api.get(`/api/recruitment/offers/by-application/${app.id}`).then(r => setOffers(Array.isArray(r.data) ? r.data : [])).catch(() => {});
    api.get("/api/staff").then(r => setStaffList(Array.isArray(r.data) ? r.data : [])).catch(() => {});
  }, [app]);

  if (!app) return null;

  const schedule = async () => {
    setBusy(true);
    try {
      await api.post("/api/recruitment/interviews", {
        applicationId: app.id,
        type: iType,
        scheduledAt: iAt ? iAt + ":00" : undefined,
        interviewerId: iInterviewer ? Number(iInterviewer) : undefined,
        location: iLocation || undefined,
        meetingLink: iLink || undefined,
      });
      toast.success("Interview scheduled");
      setIAt(""); setIInterviewer(""); setILocation(""); setILink("");
      const r = await api.get(`/api/recruitment/interviews/by-application/${app.id}`);
      setInterviews(r.data); onChanged();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to schedule interview");
    } finally { setBusy(false); }
  };

  const complete = async (id: number) => {
    setBusy(true);
    try {
      await api.patch(`/api/recruitment/interviews/${id}/complete`, {
        outcome: cOutcome, rating: Number(cRating), notes: cNotes || undefined,
      });
      toast.success("Interview completed");
      setCompleteFor(null); setCNotes("");
      const r = await api.get(`/api/recruitment/interviews/by-application/${app.id}`);
      setInterviews(r.data); onChanged();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to complete interview");
    } finally { setBusy(false); }
  };

  const reschedule = async (id: number) => {
    setBusy(true);
    try {
      await api.patch(`/api/recruitment/interviews/${id}/reschedule`, {
        applicationId: app.id,
        scheduledAt: rAt ? rAt + ":00" : undefined,
        location: rLocation || undefined,
      });
      toast.success("Interview rescheduled");
      setReschedFor(null); setRAt(""); setRLocation("");
      const r = await api.get(`/api/recruitment/interviews/by-application/${app.id}`);
      setInterviews(r.data); onChanged();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to reschedule");
    } finally { setBusy(false); }
  };

  const interviewAction = async (id: number, action: string, body?: Record<string, unknown>) => {
    setBusy(true);
    try {
      await api.patch(`/api/recruitment/interviews/${id}/${action}`, body || {});
      toast.success("Updated");
      const r = await api.get(`/api/recruitment/interviews/by-application/${app.id}`);
      setInterviews(r.data); onChanged();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Action failed");
    } finally { setBusy(false); }
  };

  const createOffer = async () => {
    setBusy(true);
    try {
      await api.post("/api/recruitment/offers", {
        applicationId: app.id,
        offeredSalary: oSalary ? Number(oSalary) : undefined,
        currency: oCurrency || undefined,
        positionTitle: oTitle || undefined,
        startDate: oStart || undefined,
        benefits: oBenefits || undefined,
        conditions: oConditions || undefined,
        expiresAt: oExpires || undefined,
      });
      toast.success("Offer created");
      setOSalary(""); setOCurrency("USD"); setOTitle(""); setOStart(""); setOExpires(""); setOBenefits(""); setOConditions("");
      const r = await api.get(`/api/recruitment/offers/by-application/${app.id}`);
      setOffers(r.data); onChanged();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to create offer");
    } finally { setBusy(false); }
  };

  const offerAction = async (id: number, action: string, body?: Record<string, unknown>) => {
    setBusy(true);
    try {
      await api.patch(`/api/recruitment/offers/${id}/${action}`, body || {});
      toast.success("Updated");
      setRejectOfferFor(null); setORejectReason("");
      const r = await api.get(`/api/recruitment/offers/by-application/${app.id}`);
      setOffers(r.data); onChanged();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Action failed");
    } finally { setBusy(false); }
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex justify-end" onClick={onClose}>
      <div className="bg-white h-full w-full max-w-xl overflow-y-auto p-6" onClick={e => e.stopPropagation()}>
        <div className="flex items-start justify-between mb-5">
          <div>
            <h2 className="text-lg font-bold text-slate-900">{app.applicantName}</h2>
            <p className="text-sm text-slate-500">{app.opportunityTitle} · {app.applicantNumber}</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100"><FiX className="w-5 h-5 text-slate-500" /></button>
        </div>

        <section className="mb-8">
          <h3 className="font-bold text-slate-900 mb-3">Interviews</h3>
          {interviews.length > 0 && (
            <div className="space-y-3 mb-4">
              {interviews.map(iv => (
                <div key={iv.id} className="rounded-xl border border-slate-100 p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-sm font-semibold text-slate-800">{interviewTypeLabels[iv.type]} · {fmtDateTime(iv.scheduledAt)}</p>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {iv.interviewerName ? `Interviewer: ${iv.interviewerName}` : "Interviewer TBD"}
                        {iv.location ? ` · ${iv.location}` : ""}
                      </p>
                      {iv.meetingLink && <p className="text-xs text-indigo-600 mt-0.5 truncate">{iv.meetingLink}</p>}
                      {iv.notes && <p className="text-xs text-slate-400 mt-1">{iv.notes}</p>}
                      {iv.outcome && iv.outcome !== "PENDING" && (
                        <p className="text-xs mt-1">Outcome: <span className="font-semibold">{interviewOutcomeLabels[iv.outcome]}</span>{iv.rating ? ` · rating ${iv.rating}/5` : ""}</p>
                      )}
                    </div>
                    <span className={`shrink-0 text-[11px] font-semibold px-2.5 py-1 rounded-full ${interviewTone[iv.status]}`}>{interviewStatusLabels[iv.status]}</span>
                  </div>

                  {iv.status === "SCHEDULED" && (
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      <button onClick={() => { setCompleteFor(completeFor === iv.id ? null : iv.id); setCOutcome("PASS"); setCRating("3"); setCNotes(""); }} className="px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-600 text-xs font-semibold hover:bg-emerald-100">Complete</button>
                      <button onClick={() => { setReschedFor(reschedFor === iv.id ? null : iv.id); setRAt(iv.scheduledAt ? toLocalDateTimeLocal(iv.scheduledAt) : ""); setRLocation(iv.location || ""); }} className="px-3 py-1.5 rounded-lg bg-amber-50 text-amber-600 text-xs font-semibold hover:bg-amber-100">Reschedule</button>
                      <button onClick={() => interviewAction(iv.id, "cancel", { reason: "Cancelled by staff" })} disabled={busy} className="px-3 py-1.5 rounded-lg bg-red-50 text-red-600 text-xs font-semibold hover:bg-red-100 disabled:opacity-50">Cancel</button>
                      <button onClick={() => interviewAction(iv.id, "miss")} disabled={busy} className="px-3 py-1.5 rounded-lg bg-slate-100 text-slate-600 text-xs font-semibold hover:bg-slate-200 disabled:opacity-50">Mark missed</button>
                    </div>
                  )}

                  {completeFor === iv.id && (
                    <div className="mt-3 grid grid-cols-2 gap-2 border-t border-slate-50 pt-3">
                      <div>
                        <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Outcome</label>
                        <select value={cOutcome} onChange={e => setCOutcome(e.target.value)} className={inputCls}>
                          {Object.keys(interviewOutcomeLabels).map(k => <option key={k} value={k}>{interviewOutcomeLabels[k as keyof typeof interviewOutcomeLabels]}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Rating</label>
                        <select value={cRating} onChange={e => setCRating(e.target.value)} className={inputCls}>
                          {[1, 2, 3, 4, 5].map(n => <option key={n} value={n}>{n}/5</option>)}
                        </select>
                      </div>
                      <div className="col-span-2">
                        <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Notes</label>
                        <textarea value={cNotes} onChange={e => setCNotes(e.target.value)} rows={2} className={inputCls} />
                      </div>
                      <button onClick={() => complete(iv.id)} disabled={busy} className="col-span-2 py-2 rounded-lg bg-emerald-600 text-white text-sm font-semibold disabled:opacity-50">Confirm completion</button>
                    </div>
                  )}

                  {reschedFor === iv.id && (
                    <div className="mt-3 grid grid-cols-2 gap-2 border-t border-slate-50 pt-3">
                      <div>
                        <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">New date/time</label>
                        <input type="datetime-local" value={rAt} onChange={e => setRAt(e.target.value)} className={inputCls} />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Location</label>
                        <input value={rLocation} onChange={e => setRLocation(e.target.value)} className={inputCls} />
                      </div>
                      <button onClick={() => reschedule(iv.id)} disabled={busy} className="col-span-2 py-2 rounded-lg bg-amber-600 text-white text-sm font-semibold disabled:opacity-50">Confirm reschedule</button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          <div className="rounded-xl border border-slate-100 p-4 space-y-3">
            <p className="text-sm font-bold text-slate-700">Schedule interview</p>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Type</label>
                <select value={iType} onChange={e => setIType(e.target.value)} className={inputCls}>
                  <option value="SSL_SCREENING">SSL Screening</option>
                  <option value="EMPLOYER_INTERVIEW">Employer interview</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Date/time</label>
                <input type="datetime-local" value={iAt} onChange={e => setIAt(e.target.value)} className={inputCls} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Interviewer</label>
                <select value={iInterviewer} onChange={e => setIInterviewer(e.target.value)} className={inputCls}>
                  <option value="">Assign…</option>
                  {staffList.map(s => <option key={s.id} value={s.id}>{s.fullName}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Location</label>
                <input value={iLocation} onChange={e => setILocation(e.target.value)} placeholder="e.g. SSL offices" className={inputCls} />
              </div>
              <div className="col-span-2">
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Meeting link</label>
                <input value={iLink} onChange={e => setILink(e.target.value)} placeholder="https://…" className={inputCls} />
              </div>
            </div>
            <button onClick={schedule} disabled={busy} className="w-full py-2.5 rounded-lg bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 disabled:opacity-50">
              {busy ? "..." : "Schedule"}
            </button>
          </div>
        </section>

        <section>
          <h3 className="font-bold text-slate-900 mb-3">Offers</h3>
          {offers.length > 0 && (
            <div className="space-y-3 mb-4">
              {offers.map(o => (
                <div key={o.id} className="rounded-xl border border-slate-100 p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-sm font-semibold text-slate-800">
                        {o.positionTitle || "Offer"} · {o.currency || ""} {o.offeredSalary ?? ""}
                      </p>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Offered {fmtDateTime(o.offeredAt)}{o.startDate ? ` · start ${fmtDate(o.startDate)}` : ""}
                        {o.expiresAt ? ` · expires ${fmtDateTime(o.expiresAt)}` : ""}
                      </p>
                      {o.rejectionReason && <p className="text-xs text-red-500 mt-1">{o.rejectionReason}</p>}
                    </div>
                    <span className={`shrink-0 text-[11px] font-semibold px-2.5 py-1 rounded-full ${offerTone[o.status]}`}>{offerStatusLabels[o.status]}</span>
                  </div>
                  {o.status === "PENDING" && (
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      <button onClick={() => offerAction(o.id, "accept")} disabled={busy} className="px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-600 text-xs font-semibold hover:bg-emerald-100 disabled:opacity-50">Accept</button>
                      <button onClick={() => setRejectOfferFor(rejectOfferFor === o.id ? null : o.id)} className="px-3 py-1.5 rounded-lg bg-red-50 text-red-600 text-xs font-semibold hover:bg-red-100">Reject</button>
                      <button onClick={() => offerAction(o.id, "withdraw", { reason: "Withdrawn by staff" })} disabled={busy} className="px-3 py-1.5 rounded-lg bg-slate-100 text-slate-600 text-xs font-semibold hover:bg-slate-200 disabled:opacity-50">Withdraw</button>
                      <button onClick={() => offerAction(o.id, "expire")} disabled={busy} className="px-3 py-1.5 rounded-lg bg-slate-100 text-slate-600 text-xs font-semibold hover:bg-slate-200 disabled:opacity-50">Expire</button>
                    </div>
                  )}
                  {rejectOfferFor === o.id && (
                    <div className="mt-3 flex gap-2 border-t border-slate-50 pt-3">
                      <input value={oRejectReason} onChange={e => setORejectReason(e.target.value)} placeholder="Rejection reason" className={inputCls} />
                      <button onClick={() => offerAction(o.id, "reject", { reason: oRejectReason || "Declined" })} disabled={busy} className="px-4 py-2 rounded-lg bg-red-600 text-white text-sm font-semibold disabled:opacity-50">Confirm</button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          <div className="rounded-xl border border-slate-100 p-4 space-y-3">
            <p className="text-sm font-bold text-slate-700">Create offer</p>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Salary</label>
                <input type="number" value={oSalary} onChange={e => setOSalary(e.target.value)} className={inputCls} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Currency</label>
                <input value={oCurrency} onChange={e => setOCurrency(e.target.value)} className={inputCls} />
              </div>
              <div className="col-span-2">
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Position title</label>
                <input value={oTitle} onChange={e => setOTitle(e.target.value)} className={inputCls} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Start date</label>
                <input type="date" value={oStart} onChange={e => setOStart(e.target.value)} className={inputCls} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Expires</label>
                <input type="date" value={oExpires} onChange={e => setOExpires(e.target.value)} className={inputCls} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Benefits</label>
                <input value={oBenefits} onChange={e => setOBenefits(e.target.value)} className={inputCls} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Conditions</label>
                <input value={oConditions} onChange={e => setOConditions(e.target.value)} className={inputCls} />
              </div>
            </div>
            <button onClick={createOffer} disabled={busy} className="w-full py-2.5 rounded-lg bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 disabled:opacity-50">
              {busy ? "..." : "Create offer"}
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}