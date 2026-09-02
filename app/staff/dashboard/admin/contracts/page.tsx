"use client";
import { useEffect, useState } from "react";
import api from "@/app/staff/auth/api";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

interface Contract {
  id: number; employerId: number; employerName: string; jobCategory: string;
  country: string; numberOfPositions: number; filledPositions: number;
  salary: number; currency: string; startDate: string; endDate: string;
  durationMonths?: number; status: string;
}

interface Employer { id: number; companyName: string; }

export default function ContractsPage() {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [employers, setEmployers] = useState<Employer[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const router = useRouter();
  const [form, setForm] = useState({ employerId: "", jobCategory: "", country: "", numberOfPositions: "1", salary: "", currency: "USD", durationMonths: "12", startDate: "", endDate: "", renewable: false, notes: "" });

  useEffect(() => {
    const load = async () => {
      try {
        const [cRes, eRes] = await Promise.all([api.get("/api/contracts"), api.get("/api/employers")]);
        setContracts(cRes.data);
        setEmployers(eRes.data);
      } catch { toast.error("Failed to load"); }
      finally { setLoading(false); }
    };
    load();
  }, []);

  const resetForm = () => {
    setForm({ employerId: "", jobCategory: "", country: "", numberOfPositions: "1", salary: "", currency: "USD", durationMonths: "12", startDate: "", endDate: "", renewable: false, notes: "" });
    setShowForm(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post("/api/contracts", { ...form, employerId: Number(form.employerId), numberOfPositions: Number(form.numberOfPositions), salary: Number(form.salary), durationMonths: Number(form.durationMonths) || 12 });
      toast.success("Contract created");
      resetForm();
      const res = await api.get("/api/contracts");
      setContracts(res.data);
    } catch { toast.error("Failed to create contract"); }
  };

  if (loading) return <div className="p-8 text-indigo-700">Loading contracts...</div>;

  const categories = ["DOMESTIC_WORKERS", "CAREGIVING", "CLEANING", "CONSTRUCTIONS", "ELECTRICIANS", "HOTEL_HOSPITALITY", "MEDICAL", "SECURITY", "TECHNOLOGY", "ADMINISTRATIONS", "AGRICULTURE", "EDUCATION", "GARMENTS", "HEAVY_EQUIPMENT", "MANUFACTURING", "MECHANICAL", "POWER_GAS_WATER", "SUPERMARKETS"];

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-indigo-900">Contracts</h1>
        <button onClick={() => setShowForm(!showForm)} className="bg-indigo-600 text-white px-4 py-2 rounded-lg">
          {showForm ? "Cancel" : "New Contract"}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow p-6 mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <select required value={form.employerId} onChange={e => setForm({...form, employerId: e.target.value})} className="border rounded p-2">
            <option value="">Select Employer</option>
            {employers.map(e => <option key={e.id} value={e.id}>{e.companyName}</option>)}
          </select>
          <select required value={form.jobCategory} onChange={e => setForm({...form, jobCategory: e.target.value})} className="border rounded p-2">
            <option value="">Job Category</option>
            {categories.map(c => <option key={c} value={c}>{c.replace(/_/g, " ")}</option>)}
          </select>
          <input required placeholder="Country" value={form.country} onChange={e => setForm({...form, country: e.target.value})} className="border rounded p-2" />
          <input type="number" required placeholder="Positions" value={form.numberOfPositions} onChange={e => setForm({...form, numberOfPositions: e.target.value})} className="border rounded p-2" />
          <input type="number" required placeholder="Salary" step="0.01" value={form.salary} onChange={e => setForm({...form, salary: e.target.value})} className="border rounded p-2" />
          <select value={form.currency} onChange={e => setForm({...form, currency: e.target.value})} className="border rounded p-2">
            <option value="USD">USD</option><option value="EUR">EUR</option><option value="GBP">GBP</option>
          </select>
          <input type="number" placeholder="Duration (months)" value={form.durationMonths} onChange={e => setForm({...form, durationMonths: e.target.value})} className="border rounded p-2" />
          <input type="date" value={form.startDate} onChange={e => setForm({...form, startDate: e.target.value})} className="border rounded p-2" />
          <input type="date" value={form.endDate} onChange={e => setForm({...form, endDate: e.target.value})} className="border rounded p-2" />
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.renewable} onChange={e => setForm({...form, renewable: e.target.checked})} />Renewable</label>
          <textarea placeholder="Notes" value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} className="border rounded p-2 col-span-full" rows={2} />
          <button type="submit" className="bg-indigo-600 text-white px-6 py-2 rounded-lg col-span-full">Create Contract</button>
        </form>
      )}

      <div className="grid grid-cols-1 gap-4">
        {contracts.map(c => (
          <div key={c.id} onClick={() => router.push(`/staff/dashboard/admin/contracts/${c.id}`)} className="bg-white rounded-xl shadow p-5 cursor-pointer hover:shadow-md transition border-l-4 border-indigo-500">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-bold text-lg text-gray-900">{c.employerName} — {c.jobCategory.replace(/_/g, " ")}</h3>
                <p className="text-sm text-gray-500">{c.country} | {c.filledPositions}/{c.numberOfPositions} filled | {c.salary} {c.currency}/{c.durationMonths ? c.durationMonths + "mo" : ""}</p>
              </div>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${c.status === "OPEN" ? "bg-green-100 text-green-700" : c.status === "FILLED" ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-500"}`}>{c.status}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
