"use client";
import { useEffect, useState } from "react";
import api from "@/app/staff/auth/api";
import { useParams, useRouter } from "next/navigation";
import toast from "react-hot-toast";

interface Placement { id: number; candidateType: string; candidateName: string; stage: string; salary: number; currency: string; contractStartDate: string; contractEndDate: string; }
interface ContractDetail { id: number; employerName: string; jobCategory: string; country: string; filledPositions: number; numberOfPositions: number; salary: number; currency: string; status: string; }

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
  const [advanceId, setAdvanceId] = useState<number | null>(null);
  const [advanceStage, setAdvanceStage] = useState("");
  const [advanceNote, setAdvanceNote] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const [cRes, pRes] = await Promise.all([api.get(`/api/contracts/${id}`), api.get(`/api/contracts/${id}/placements`)]);
        setContract(cRes.data); setPlacements(pRes.data);
      } catch { toast.error("Failed to load"); }
      finally { setLoading(false); }
    };
    load();
  }, [id]);

  const handleAdvance = async (placementId: number) => {
    try {
      await api.patch(`/api/placements/${placementId}/stage`, { stage: advanceStage, note: advanceNote });
      toast.success("Updated");
      setAdvanceId(null); setAdvanceStage(""); setAdvanceNote("");
      const res = await api.get(`/api/contracts/${id}/placements`);
      setPlacements(res.data);
    } catch (e: any) { toast.error(e?.response?.data?.message || "Failed"); }
  };

  if (loading) return <div className="p-6 text-center text-gray-400">Loading...</div>;
  if (!contract) return <div className="p-6 text-red-600">Not found</div>;

  const stages = Object.keys(stageLabels);

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <button onClick={() => router.back()} className="text-indigo-600 hover:underline text-sm">← Back</button>
      <div className="bg-white rounded-xl shadow p-5 border-l-4 border-indigo-500">
        <h1 className="text-xl font-bold text-gray-900">{contract.employerName} — {contract.jobCategory.replace(/_/g, " ")}</h1>
        <p className="text-gray-500">{contract.country} | {contract.filledPositions}/{contract.numberOfPositions} filled | {contract.salary} {contract.currency}</p>
      </div>

      <h2 className="font-bold text-lg text-gray-900">Placements ({placements.length})</h2>
      {placements.map(p => (
        <div key={p.id} className="bg-white rounded-xl shadow p-4 space-y-2">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-bold">{p.candidateName} <span className="text-sm text-gray-400">({p.candidateType})</span></h3>
              <p className="text-sm text-gray-500">{p.salary} {p.currency}</p>
              <span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-xs font-semibold ${p.stage === "DEPLOYED" ? "bg-green-100 text-green-700" : p.stage === "TERMINATED" || p.stage === "DECLINED" ? "bg-red-100 text-red-700" : "bg-indigo-100 text-indigo-700"}`}>{stageLabels[p.stage] || p.stage}</span>
            </div>
            <button onClick={() => { setAdvanceId(p.id); setAdvanceStage(p.stage); setAdvanceNote(""); }} className="text-sm text-indigo-600 hover:underline">Move</button>
          </div>
          {advanceId === p.id && (
            <div className="bg-indigo-50 p-3 rounded flex gap-2 items-end flex-wrap">
              <select value={advanceStage} onChange={e => setAdvanceStage(e.target.value)} className="border rounded p-1.5 text-sm">
                {stages.map(s => <option key={s} value={s}>{stageLabels[s]}</option>)}
              </select>
              <input placeholder="Note" value={advanceNote} onChange={e => setAdvanceNote(e.target.value)} className="border rounded p-1.5 flex-1 text-sm" />
              <button onClick={() => handleAdvance(p.id)} className="bg-indigo-600 text-white px-3 py-1.5 rounded text-sm">Update</button>
              <button onClick={() => setAdvanceId(null)} className="text-gray-500 text-sm">Cancel</button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
