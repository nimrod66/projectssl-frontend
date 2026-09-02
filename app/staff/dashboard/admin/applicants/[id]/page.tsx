"use client";

import { useEffect, useState } from "react";
import api from "@/app/staff/auth/api";
import { withUploadToken } from "@/app/lib/uploads";
import { useParams, useRouter } from "next/navigation";
import Card from "@/app/components/ui/Card";
import Badge from "@/app/components/ui/Badge";
import PageHeader from "@/app/components/ui/PageHeader";
import EmptyState from "@/app/components/ui/EmptyState";
import Skeleton, { SkeletonCard } from "@/app/components/ui/Skeleton";
import { FiChevronLeft, FiFile, FiClock, FiBriefcase, FiMapPin, FiPhone, FiMail, FiUser } from "react-icons/fi";

interface Doc { id: number; fileName: string; fileUrl: string; kind: string; }
interface TimelineEvent { timestamp: string; description: string; type: string; actor: string | null; }
interface PlacementSummary { id: number; contractId: number; employerName: string; stage: string; startDate: string; endDate: string; salary: number; currency: string; }

interface CandidateData {
  id: number; fullName: string; firstName: string; lastName: string; age: number; nationality: string;
  phoneNumber: string; email: string; currentLocation: string; experience: string;
  currentProfession: string; currentSalary: number; languages: string[];
  employmentStatus: string; jobInterest: string; status: string;
  details: Record<string, boolean>;
  documents: Doc[];
  timeline: TimelineEvent[];
  placements: PlacementSummary[];
}

const API_BASE = process.env.NEXT_PUBLIC_API_BASE;

const statusVariant: Record<string, "default" | "success" | "warning" | "danger" | "info"> = {
  PENDING: "warning", VETTED: "info", APPROVED: "success", REJECTED: "danger", HIRED: "success",
};

const kindLabels: Record<string, string> = {
  PASSPORT: "Passport Photo", NATIONAL_ID: "National ID", FULL_PHOTO: "Full Body Photo",
  RESUME: "Resume / CV", BIRTH_CERTIFICATE: "Birth Certificate", GOOD_CONDUCT: "Certificate of Good Conduct",
  VIDEO: "Video", SHOWCASE_PHOTO: "Showcase Photo",
};

const stageLabels: Record<string, string> = {
  ASSIGNED: "Assigned", ACCEPTED: "Accepted", DOCUMENTS_SUBMITTED: "Docs Submitted",
  DOCUMENTS_VERIFIED: "Docs Verified", MEDICAL_DONE: "Medical Done",
  CONTRACT_SIGNED: "Contract Signed", VISA_APPLIED: "Visa Applied", VISA_APPROVED: "Visa Approved",
  FLIGHT_BOOKED: "Flight Booked", PRE_DEPARTURE: "Pre-departure", DEPARTED: "Departed",
  DEPLOYED: "Deployed", RENEWED: "Renewed", COMPLETED: "Completed", RETURNED: "Returned",
};

const Tabs = ({ tabs, active, onChange }: { tabs: string[]; active: string; onChange: (t: string) => void }) => (
  <div className="flex gap-1 bg-gray-100 p-1 rounded-xl">
    {tabs.map(t => (
      <button key={t} onClick={() => onChange(t)}
        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${active === t ? "bg-white text-indigo-700 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}>
        {t}
      </button>
    ))}
  </div>
);

export default function CandidateDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [data, setData] = useState<CandidateData | null>(null);
  const [tab, setTab] = useState("Profile");
  const [imgIndex, setImgIndex] = useState(0);

  useEffect(() => {
    api.get(`/api/candidates/local/${id}`).then(r => setData(r.data)).catch(() => {});
  }, [id]);

  if (!data) return <div className="p-6 max-w-5xl mx-auto"><Skeleton className="h-8 w-64 mb-4" /><SkeletonCard /><SkeletonCard /></div>;

  const photos = data.documents.filter(d => d.kind === "SHOWCASE_PHOTO" || d.kind === "PASSPORT" || d.kind === "FULL_PHOTO");
  const checklistKinds = ["PASSPORT", "NATIONAL_ID", "FULL_PHOTO", "RESUME", "BIRTH_CERTIFICATE", "GOOD_CONDUCT"];

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <button onClick={() => router.back()} className="flex items-center gap-1 text-sm text-indigo-600 hover:underline mb-2">
        <FiChevronLeft /> Back
      </button>

      <div className="flex flex-col sm:flex-row sm:items-end gap-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-xl bg-indigo-100 flex items-center justify-center shrink-0 overflow-hidden">
            {photos.length > 0 ? (
              <img src={withUploadToken(`${API_BASE}${photos[0].fileUrl}`)} className="w-full h-full object-cover" />
            ) : (
              <FiUser className="w-7 h-7 text-indigo-500" />
            )}
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">{data.fullName}</h1>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant={statusVariant[data.status] || "neutral"}>{data.status}</Badge>
              <span className="text-sm text-gray-400">{data.age} yrs · {data.nationality}</span>
            </div>
          </div>
        </div>
      </div>

      <Tabs tabs={["Profile", "Documents", "Timeline", "Placement"]} active={tab} onChange={setTab} />

      {tab === "Profile" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2"><FiUser className="w-4 h-4" /> Personal Info</h3>
            <div className="space-y-2 text-sm">
              {[{ l: "Location", v: data.currentLocation }, { l: "Phone", v: data.phoneNumber }, { l: "Email", v: data.email }, { l: "Experience", v: data.experience }, { l: "Profession", v: data.currentProfession }, { l: "Salary", v: data.currentSalary ? `KES ${data.currentSalary.toLocaleString()}` : null }, { l: "Job Interest", v: data.jobInterest }, { l: "Employment", v: data.employmentStatus }].filter(o => o.v).map(o => (
                <div key={o.l} className="flex justify-between"><span className="text-gray-500">{o.l}</span><span className="text-gray-900">{o.v}</span></div>
              ))}
            </div>
          </Card>

          <Card>
            <h3 className="font-bold text-gray-900 mb-3">Languages</h3>
            <div className="flex flex-wrap gap-1.5">
              {data.languages.map(l => <Badge key={l}>{l}</Badge>)}
            </div>
          </Card>

          <Card>
            <h3 className="font-bold text-gray-900 mb-3">Preferences</h3>
            <div className="flex flex-wrap gap-1.5">
              {Object.entries(data.details).filter(([, v]) => v).map(([k]) => (
                <Badge key={k} variant="info">{k.replace(/([A-Z])/g, " $1").trim()}</Badge>
              ))}
              {Object.values(data.details).every(v => !v) && <span className="text-xs text-gray-400">No preferences set</span>}
            </div>
          </Card>
        </div>
      )}

      {tab === "Documents" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {checklistKinds.map(kind => {
            const docs = data.documents.filter(d => d.kind === kind);
            const hasDoc = docs.length > 0;
            return (
              <Card key={kind} accent={hasDoc ? "green" : "none"}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900 flex items-center gap-2">
                      <FiFile className="w-4 h-4" /> {kindLabels[kind] || kind}
                    </p>
                    {hasDoc && <p className="text-xs text-gray-400 mt-0.5">{docs[0].fileName}</p>}
                  </div>
                  <Badge variant={hasDoc ? "success" : "warning"}>{hasDoc ? "Uploaded" : "Missing"}</Badge>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {tab === "Timeline" && (
        <div className="space-y-0">
          {data.timeline.length === 0 ? (
            <EmptyState title="No timeline events" description="Events will appear here as the application progresses" />
          ) : (
            data.timeline.map((e, i) => (
              <div key={i} className="flex gap-4 pb-4 relative">
                <div className="flex flex-col items-center">
                  <div className="w-3 h-3 rounded-full bg-indigo-500 mt-1.5 shrink-0" />
                  {i < data.timeline.length - 1 && <div className="w-0.5 h-full bg-gray-200 mt-1" />}
                </div>
                <div className="flex-1 pb-4">
                  <p className="text-sm font-medium text-gray-900">{e.description}</p>
                  <p className="text-xs text-gray-400">{e.timestamp ? new Date(e.timestamp).toLocaleString() : ""}</p>
                </div>
                <Badge variant={e.type === "APPROVED" || e.type === "HIRED" ? "success" : e.type === "REJECTED" ? "danger" : "info"}>{e.type}</Badge>
              </div>
            ))
          )}
        </div>
      )}

      {tab === "Placement" && (
        <div className="space-y-4">
          {data.placements.length === 0 ? (
            <EmptyState title="No placement" description="This candidate has not been assigned to a contract yet" />
          ) : (
            data.placements.map(p => (
              <Card key={p.id} accent="blue" className="cursor-pointer" onClick={() => router.push(`/staff/dashboard/admin/contracts/${p.contractId}`)}>
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-semibold text-gray-900">{p.employerName}</p>
                    <div className="flex items-center gap-3 text-sm text-gray-500 mt-1">
                      <span>{stageLabels[p.stage] || p.stage}</span>
                      {p.salary && <span>{p.salary} {p.currency}</span>}
                    </div>
                    <p className="text-xs text-gray-400 mt-1">{p.startDate} → {p.endDate}</p>
                  </div>
                  <Badge variant="info">{stageLabels[p.stage] || p.stage}</Badge>
                </div>
              </Card>
            ))
          )}
        </div>
      )}
    </div>
  );
}
