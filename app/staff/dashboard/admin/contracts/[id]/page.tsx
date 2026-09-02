"use client";
import { useEffect, useState } from "react";
import api from "@/app/staff/auth/api";
import { useParams, useRouter } from "next/navigation";
import toast from "react-hot-toast";
import PlacementPipeline from "@/app/components/ui/PlacementPipeline";
import Badge from "@/app/components/ui/Badge";
import { useRouter as useNav } from "next/navigation";

interface Placement { id: number; candidateType: string; candidateName: string; stage: string; salary: number; currency: string; contractStartDate: string; contractEndDate: string; notes: string; employerName: string; }
interface ContractDetail { id: number; employerName: string; jobCategory: string; country: string; numberOfPositions: number; filledPositions: number; salary: number; currency: string; status: string; startDate: string; endDate: string; notes: string; }
interface Applicant { id: number; fullName: string; status: string; }

const stageLabels: Record<string, string> = {
  ASSIGNED:"Assigned", ACCEPTED:"Accepted", DOCUMENTS_SUBMITTED:"Docs Submitted", DOCUMENTS_VERIFIED:"Docs Verified",
  MEDICAL_DONE:"Medical Done", CONTRACT_SIGNED:"Contract Signed", VISA_APPLIED:"Visa Applied", VISA_APPROVED:"Visa Approved",
  FLIGHT_BOOKED:"Flight Booked", PRE_DEPARTURE:"Pre-departure", DEPARTED:"Departed", DEPLOYED:"Deployed",
  RENEWED:"Renewed", COMPLETED:"Completed", RETURNED:"Returned", DECLINED:"Declined", TERMINATED:"Terminated"
};

export default function ContractDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [contract, setContract] = useState<ContractDetail | null>(null);
  const [placements, setPlacements] = useState<Placement[]>([]);
  const [loading, setLoading] = useState(true);
  const [candidates, setCandidates] = useState<{local: Applicant[], intl: Applicant[]}>({ local: [], intl: [] });
  const [assignType, setAssignType] = useState("LOCAL");
  const [assignId, setAssignId] = useState("");
  const [advanceId, setAdvanceId] = useState<number | null>(null);
  const [advanceStage, setAdvanceStage] = useState("");
  const [advanceNote, setAdvanceNote] = useState("");
  const [noteId, setNoteId] = useState<number | null>(null);
  const [noteText, setNoteText] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const [cRes, pRes] = await Promise.all([api.get(`/api/contracts/${id}`), api.get(`/api/contracts/${id}/placements`)]);
        setContract(cRes.data); setPlacements(pRes.data);
        const [lRes, iRes] = await Promise.all([api.get("/api/applications?status=APPROVED").catch(() => ({ data: [] })), api.get("/api/international?status=APPROVED").catch(() => ({ data: [] }))]);
        setCandidates({ local: lRes.data, intl: iRes.data });
      } catch { toast.error("Failed to load"); }
      finally { setLoading(false); }
    };
    load();
  }, [id]);

  const handleAssign = async () => {
    if (!assignId) return;
    try {
      await api.post(`/api/contracts/${id}/assign`, { candidateType: assignType, candidateId: Number(assignId) });
      toast.success("Candidate assigned");
      setAssignId("");
      const res = await api.get(`/api/contracts/${id}/placements`);
      setPlacements(res.data);
      const cRes = await api.get(`/api/contracts/${id}`);
      setContract(cRes.data);
    } catch (e: any) { toast.error(e?.response?.data?.message || "Assignment failed"); }
  };

  const handleAdvance = async (placementId: number) => {
    try {
      await api.patch(`/api/placements/${placementId}/stage`, { stage: advanceStage, note: advanceNote });
      toast.success("Stage updated");
      setAdvanceId(null); setAdvanceStage(""); setAdvanceNote("");
      const res = await api.get(`/api/contracts/${id}/placements`);
      setPlacements(res.data);
    } catch (e: any) { toast.error(e?.response?.data?.message || "Update failed"); }
  };

  const handleAddNote = async (placementId: number) => {
    try {
      await api.post(`/api/placements/${placementId}/notes`, { note: noteText });
      toast.success("Note added");
      setNoteId(null); setNoteText("");
    } catch { toast.error("Failed to add note"); }
  };

  if (loading) return <div className="p-8 text-indigo-700">Loading...</div>;
  if (!contract) return <div className="p-8 text-red-600">Contract not found</div>;

  const stages = Object.keys(stageLabels);

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <button onClick={() => router.back()} className="text-indigo-600 hover:underline text-sm">← Back</button>
      <div className="bg-white rounded-xl shadow p-6 border-l-4 border-indigo-500">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{contract.employerName} — {contract.jobCategory.replace(/_/g, " ")}</h1>
            <p className="text-gray-500">{contract.country} | {contract.filledPositions}/{contract.numberOfPositions} filled | {contract.salary} {contract.currency}/{contract.endDate ? new Date(contract.endDate).toLocaleDateString() : "—"}</p>
          </div>
          <span className={`px-3 py-1 rounded-full text-sm font-semibold ${contract.status === "OPEN" ? "bg-green-100 text-green-700" : contract.status === "FILLED" ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-500"}`}>{contract.status}</span>
        </div>
        {contract.notes && <p className="mt-3 text-sm text-gray-600 bg-gray-50 p-3 rounded">{contract.notes}</p>}
      </div>

      {contract.status === "OPEN" && (
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="font-bold text-lg mb-3">Assign Approved Candidate</h2>
          <div className="flex gap-3 items-end flex-wrap">
            <select value={assignType} onChange={e => { setAssignType(e.target.value); setAssignId(""); }} className="border rounded p-2">
              <option value="LOCAL">Local</option><option value="INTERNATIONAL">International</option>
            </select>
            <select value={assignId} onChange={e => setAssignId(e.target.value)} className="border rounded p-2 flex-1 min-w-[200px]">
              <option value="">Select candidate</option>
              {(assignType === "LOCAL" ? candidates.local : candidates.intl).map(a => <option key={a.id} value={a.id}>{a.fullName} ({a.status})</option>)}
            </select>
            <button onClick={handleAssign} className="bg-indigo-600 text-white px-4 py-2 rounded-lg">Assign</button>
          </div>
        </div>
      )}

      <h2 className="text-xl font-bold text-gray-900">Placements ({placements.length})</h2>
      {placements.map(p => (
        <div key={p.id} className="bg-white rounded-xl shadow p-5 space-y-3">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-bold text-lg">{p.candidateName} <span className="text-sm font-normal text-gray-400">({p.candidateType})</span></h3>
              <p className="text-sm text-gray-500">{p.salary} {p.currency} | {p.contractStartDate ? new Date(p.contractStartDate).toLocaleDateString() : "—"} → {p.contractEndDate ? new Date(p.contractEndDate).toLocaleDateString() : "—"}</p>
              <span className={`inline-block mt-1 px-2 py-1 rounded-full text-xs font-semibold ${p.stage === "DEPLOYED" ? "bg-green-100 text-green-700" : p.stage === "TERMINATED" || p.stage === "DECLINED" ? "bg-red-100 text-red-700" : "bg-indigo-100 text-indigo-700"}`}>{stageLabels[p.stage] || p.stage}</span>
              <div className="mt-3"><PlacementPipeline currentStage={p.stage} /></div>
            </div>
            <div className="flex gap-2">
              <button onClick={() => { setAdvanceId(p.id); setAdvanceStage(p.stage); setAdvanceNote(""); setNoteId(null); }} className="text-sm text-indigo-600 hover:underline">Move</button>
              <button onClick={() => { setNoteId(p.id); setNoteText(""); setAdvanceId(null); }} className="text-sm text-blue-600 hover:underline">Note</button>
            </div>
          </div>

          {advanceId === p.id && (
            <div className="bg-indigo-50 p-4 rounded flex gap-3 items-end flex-wrap">
              <select value={advanceStage} onChange={e => setAdvanceStage(e.target.value)} className="border rounded p-2">
                {stages.map(s => <option key={s} value={s}>{stageLabels[s]}</option>)}
              </select>
              <input placeholder="Note" value={advanceNote} onChange={e => setAdvanceNote(e.target.value)} className="border rounded p-2 flex-1" />
              <button onClick={() => handleAdvance(p.id)} className="bg-indigo-600 text-white px-3 py-2 rounded text-sm">Update</button>
              <button onClick={() => setAdvanceId(null)} className="text-gray-500 text-sm">Cancel</button>
            </div>
          )}

          {noteId === p.id && (
            <div className="bg-blue-50 p-4 rounded flex gap-3 items-end flex-wrap">
              <input placeholder="Add a note..." value={noteText} onChange={e => setNoteText(e.target.value)} className="border rounded p-2 flex-1" />
              <button onClick={() => handleAddNote(p.id)} className="bg-blue-600 text-white px-3 py-2 rounded text-sm">Save Note</button>
              <button onClick={() => setNoteId(null)} className="text-gray-500 text-sm">Cancel</button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
