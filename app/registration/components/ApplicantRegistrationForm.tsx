"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { z } from "zod";

const phoneRx = /^(?:\+254|0)(?:7\d{8}|1\d{8})$/;
const schema = z.object({
  firstName: z.string().min(1, "First name is required"),
  middleName: z.string().optional(),
  lastName: z.string().min(1, "Last name is required"),
  gender: z.string().min(1, "Select your gender"),
  dateOfBirth: z.string().min(1, "Date of birth is required"),
  nationality: z.string().min(1, "Nationality is required"),
  county: z.string().optional(),
  address: z.string().optional(),
  phoneNumber: z.string().regex(phoneRx, "Valid Kenyan phone number required (e.g. 0712345678)"),
  alternativePhone: z.string().optional(),
  email: z.string().email("Valid email required"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[a-z]/, "Password must contain a lowercase letter")
    .regex(/[A-Z]/, "Password must contain an uppercase letter")
    .regex(/\d/, "Password must contain a number"),
});

type Schema = z.infer<typeof schema>;

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "";

export default function ApplicantRegistrationForm({ type }: { type: "LOCAL" | "INTERNATIONAL" }) {
  const [form, setForm] = useState<Partial<Schema>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [registered, setRegistered] = useState<{ applicantNumber: string; phoneNumber: string } | null>(null);

  const set = <K extends keyof Schema>(k: K, v: Schema[K]) => {
    setForm(p => ({ ...p, [k]: v }));
    setErrors(prev => { const n = { ...prev }; delete n[k as string]; return n; });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const r = schema.safeParse(form);
    if (!r.success) {
      const ze: Record<string, string> = {};
      r.error.issues.forEach(er => { const k = er.path.join("."); if (!ze[k]) ze[k] = er.message; });
      setErrors(ze);
      toast.error("Please fix the highlighted fields");
      return;
    }
    const d = r.data;

    setLoading(true); setErrors({});
    const tid = toast.loading("Creating your application...");
    try {
      const res = await fetch(`${API_BASE}/api/applicants/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: d.firstName,
          middleName: d.middleName || undefined,
          lastName: d.lastName,
          gender: d.gender,
          dateOfBirth: d.dateOfBirth,
          nationality: d.nationality,
          county: d.county || undefined,
          address: d.address || undefined,
          phoneNumber: d.phoneNumber,
          alternativePhone: d.alternativePhone || undefined,
          email: d.email || undefined,
          registrationSource: "WEBSITE",
          applicantType: type,
          password: d.password || undefined,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(res.status === 409
          ? "This phone number is already registered. Please contact us for assistance."
          : data.message || "Registration failed");
      }
      setRegistered({ applicantNumber: data.applicantNumber, phoneNumber: data.phoneNumber });
      toast.success("Application created successfully!", { id: tid });
    } catch (err: any) {
      toast.error(err.message || "Registration failed", { id: tid });
    } finally {
      setLoading(false);
    }
  };

  if (registered) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 sm:p-10 text-center">
        <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-5">
          <svg className="w-8 h-8 text-emerald-600" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Application received!</h2>
        <p className="text-slate-500 mb-4">Your reference number is:</p>
        <p className="text-2xl font-extrabold text-indigo-600 mb-6 tracking-wide">{registered.applicantNumber}</p>
        <p className="text-sm text-slate-500 mb-8 max-w-sm mx-auto leading-relaxed">
          Sign in with your email and password to complete your profile, upload documents and apply to opportunities.
        </p>
        <div className="space-y-3">
          <a href="/applicant/login" className="block w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl transition text-sm">
            Sign in to your portal
          </a>
          <p className="text-xs text-slate-400">
            Our recruitment team will also contact you on{" "}
            <span className="font-semibold text-slate-700">{registered.phoneNumber}</span> to complete your verification.
          </p>
        </div>
      </div>
    );
  }

  const input = (n: string) => `w-full px-3 py-2.5 rounded-lg border text-sm text-slate-900 bg-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition ${errors[n] ? "border-red-400 bg-red-50" : "border-slate-300 hover:border-slate-400"}`;
  const err = (n: string) => errors[n] ? <p className="text-red-500 text-xs mt-1">{errors[n]}</p> : null;
  const Label = ({ children, req }: { children: React.ReactNode; req?: boolean }) => (
    <label className="block text-sm font-medium text-slate-700 mb-1.5">{children}{req && <span className="text-red-500 ml-0.5">*</span>}</label>
  );
  const badge = "inline-flex items-center justify-center w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 text-sm font-bold shrink-0";

  return (
    <div className="w-full max-w-2xl mx-auto">
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8 space-y-10">

        {/* 1. Personal Information */}
        <div>
          <div className="flex items-center gap-3 mb-3"><span className={badge}>1</span><div><h2 className="text-lg font-bold text-slate-900">Personal Information</h2><p className="text-xs text-slate-400 mt-0.5">Your name, gender and date of birth</p></div></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[{ n: "firstName" as const, l: "First Name", r: true, ph: "e.g. Grace" }, { n: "middleName" as const, l: "Middle Name", ph: "Optional" }, { n: "lastName" as const, l: "Last Name", r: true, ph: "e.g. Wanjiru" }, { n: "gender" as const, l: "Gender", r: true, opts: [{ v: "FEMALE", l: "Female" }, { v: "MALE", l: "Male" }, { v: "OTHER", l: "Other" }] }, { n: "dateOfBirth" as const, l: "Date of Birth", r: true, t: "date" }, { n: "nationality" as const, l: "Nationality", r: true, ph: "e.g. Kenyan" }].map(f => (
              <div key={f.n}>
                <Label req={f.r}>{f.l}</Label>
                {f.opts ? (
                  <select className={input(f.n)} value={(form[f.n] as string) || ""} onChange={e => set(f.n, e.target.value as any)}>
                    <option value="">Select gender</option>
                    {f.opts.map(o => <option key={o.v} value={o.v}>{o.l}</option>)}
                  </select>
                ) : (
                  <input type={f.t || "text"} placeholder={f.ph} className={input(f.n)} value={(form[f.n] as string) || ""} onChange={e => set(f.n, e.target.value as any)} />
                )}
                {err(f.n)}
              </div>
            ))}
          </div>
        </div>

        {/* 2. Contact Details */}
        <div>
          <div className="flex items-center gap-3 mb-3"><span className={badge}>2</span><div><h2 className="text-lg font-bold text-slate-900">Contact Details</h2><p className="text-xs text-slate-400 mt-0.5">How we'll reach you about your application</p></div></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[{ n: "phoneNumber" as const, l: "Phone Number", r: true, t: "tel", ph: "0712345678" }, { n: "alternativePhone" as const, l: "Alternative Phone", t: "tel", ph: "Optional" }, { n: "email" as const, l: "Email Address", r: true, t: "email", ph: "you@example.com" }, { n: "county" as const, l: "County", ph: "e.g. Nairobi" }, { n: "address" as const, l: "Home Address", ph: "e.g. Westlands, Nairobi" }].map(f => (
              <div key={f.n} className={f.n === "address" ? "sm:col-span-2" : ""}>
                <Label req={f.r}>{f.l}</Label>
                <input type={f.t || "text"} placeholder={f.ph} className={input(f.n)} value={(form[f.n] as string) || ""} onChange={e => set(f.n, e.target.value as any)} />
                {err(f.n)}
              </div>
            ))}
          </div>
        </div>

        {/* 3. Account */}
        <div>
          <div className="flex items-center gap-3 mb-3"><span className={badge}>3</span><div><h2 className="text-lg font-bold text-slate-900">Create a Password</h2><p className="text-xs text-slate-400 mt-0.5">You'll use your email and this password to sign in and track your application</p></div></div>
          <div className="grid grid-cols-1 gap-3">
            <div>
              <Label req>Password</Label>
              <input type="password" placeholder="At least 6 characters" className={input("password")} value={(form.password as string) || ""} onChange={e => set("password", e.target.value as any)} />
              {err("password")}
            </div>
          </div>
        </div>

        <p className="text-xs text-slate-400 text-center">
          By submitting you confirm that the information provided is accurate and complete, and you consent to
          SSL Agency processing your data for recruitment purposes. Starnet Solutions Limited will contact you within 2–5 business days.
        </p>

        <button type="submit" disabled={loading}
          className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-semibold rounded-xl transition-colors text-sm shadow-sm">
          {loading ? "Submitting..." : type === "LOCAL" ? "Submit Local Application" : "Submit International Application"}
        </button>
      </form>
    </div>
  );
}