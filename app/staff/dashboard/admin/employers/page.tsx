"use client";
import { useEffect, useState } from "react";
import api from "@/app/staff/auth/api";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

interface Employer {
  id: number; companyName: string; country: string;
  contactName: string; contactEmail: string; contactPhone: string;
  address: string; notes: string; status: string;
}

export default function EmployersPage() {
  const [employers, setEmployers] = useState<Employer[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const router = useRouter();
  const [form, setForm] = useState({ companyName: "", country: "", contactName: "", contactEmail: "", contactPhone: "", address: "", notes: "", status: "ACTIVE" });

  const fetchEmployers = async () => {
    try {
      const res = await api.get("/api/employers");
      setEmployers(res.data);
    } catch { toast.error("Failed to load employers"); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchEmployers(); }, []);

  const resetForm = () => {
    setForm({ companyName: "", country: "", contactName: "", contactEmail: "", contactPhone: "", address: "", notes: "", status: "ACTIVE" });
    setEditId(null); setShowForm(false);
  };

  const openEdit = (e: Employer) => {
    setForm({ companyName: e.companyName, country: e.country || "", contactName: e.contactName || "", contactEmail: e.contactEmail || "", contactPhone: e.contactPhone || "", address: e.address || "", notes: e.notes || "", status: e.status });
    setEditId(e.id); setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editId) {
        await api.put(`/api/employers/${editId}`, form);
        toast.success("Employer updated");
      } else {
        await api.post("/api/employers", form);
        toast.success("Employer created");
      }
      resetForm(); fetchEmployers();
    } catch { toast.error("Failed to save employer"); }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this employer?")) return;
    try { await api.delete(`/api/employers/${id}`); toast.success("Deleted"); fetchEmployers(); }
    catch { toast.error("Delete failed"); }
  };

  if (loading) return <div className="p-8 text-indigo-700">Loading employers...</div>;

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-indigo-900">Employers</h1>
        <button onClick={() => { resetForm(); setShowForm(!showForm); }} className="bg-indigo-600 text-white px-4 py-2 rounded-lg">
          {showForm ? "Cancel" : "Add Employer"}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow p-6 mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <input required placeholder="Company Name*" value={form.companyName} onChange={e => setForm({...form, companyName: e.target.value})} className="border rounded p-2" />
          <input placeholder="Country" value={form.country} onChange={e => setForm({...form, country: e.target.value})} className="border rounded p-2" />
          <input placeholder="Contact Name" value={form.contactName} onChange={e => setForm({...form, contactName: e.target.value})} className="border rounded p-2" />
          <input placeholder="Contact Email" type="email" value={form.contactEmail} onChange={e => setForm({...form, contactEmail: e.target.value})} className="border rounded p-2" />
          <input placeholder="Contact Phone" value={form.contactPhone} onChange={e => setForm({...form, contactPhone: e.target.value})} className="border rounded p-2" />
          <select value={form.status} onChange={e => setForm({...form, status: e.target.value})} className="border rounded p-2">
            <option value="ACTIVE">Active</option><option value="INACTIVE">Inactive</option>
          </select>
          <textarea placeholder="Address" value={form.address} onChange={e => setForm({...form, address: e.target.value})} className="border rounded p-2 col-span-full" rows={2} />
          <textarea placeholder="Notes" value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} className="border rounded p-2 col-span-full" rows={2} />
          <button type="submit" className="bg-indigo-600 text-white px-6 py-2 rounded-lg col-span-full">{editId ? "Update" : "Create"} Employer</button>
        </form>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {employers.map(e => (
          <div key={e.id} onClick={() => router.push(`/staff/dashboard/admin/employers/${e.id}`)} className="bg-white rounded-xl shadow p-5 border-l-4 border-indigo-500 cursor-pointer hover:shadow-md transition">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-bold text-lg text-gray-900">{e.companyName}</h3>
                <p className="text-sm text-gray-500">{e.country} · {e.contactName}</p>
                <p className="text-sm text-gray-500">{e.contactEmail} · {e.contactPhone}</p>
              </div>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${e.status === "ACTIVE" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>{e.status}</span>
            </div>
            <div className="flex gap-2 mt-3">
              <button onClick={(ev) => { ev.stopPropagation(); openEdit(e); }} className="text-sm text-indigo-600 hover:underline">Edit</button>
              <button onClick={(ev) => { ev.stopPropagation(); handleDelete(e.id); }} className="text-sm text-red-500 hover:underline">Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
