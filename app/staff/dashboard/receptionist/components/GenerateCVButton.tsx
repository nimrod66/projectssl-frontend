"use client";

import { useState } from "react";
import api from "@/app/staff/auth/api";
import { withUploadToken } from "@/app/lib/uploads";
import { PDFDownloadLink, Document, Page, Text, View, StyleSheet, PDFViewer, Image } from "@react-pdf/renderer";
import { X, Download, FileText } from "lucide-react";
import toast from "react-hot-toast";

interface CVDto {
  id: number; fullName: string; nationality?: string; jobRecruitment?: string; religion?: string;
  currentProfession?: string; currentSalary?: number; dob?: string; age?: number;
  maritalStatus?: string; numberOfKids?: string; educationLevel?: string;
  currentLocation?: string; phoneNumber?: string; email?: string;
  languages?: string[]; employmentStatus?: string;
  passportPhotoUrl?: string; fullPhotoUrl?: string; showcasePhotoUrls?: string[];
}

const A = "#6b21a8"; const D = "#111827"; const M = "#6b7280"; const B = "#e5e7eb";

const s = StyleSheet.create({
  page: { padding: 45, fontSize: 9.5, fontFamily: "Helvetica", lineHeight: 1.55, color: D },
  header: { flexDirection: "row", marginBottom: 18, paddingBottom: 14, borderBottom: `3 solid ${A}` },
  agencyName: { fontSize: 13, fontWeight: "bold", color: A, marginBottom: 2 },
  agencySub: { fontSize: 7, color: M, marginBottom: 8 },
  cvLabel: { fontSize: 8, color: M, textTransform: "uppercase", letterSpacing: 1 },
  nameRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 14 },
  name: { fontSize: 22, fontWeight: "bold", color: "#1e1b4b" },
  photoRow: { flexDirection: "row", gap: 18, marginBottom: 16 },
  passportPhoto: { width: 85, height: 110, borderRadius: 4, border: `1 solid ${B}` },
  fullPhoto: { width: 70, height: 110, borderRadius: 4, border: `1 solid ${B}` },
  infoGrid: { flexDirection: "row", flexWrap: "wrap", marginBottom: 2 },
  infoItem: { width: "50%", flexDirection: "row", marginBottom: 4 },
  infoLabel: { width: 90, fontSize: 8, color: M },
  infoValue: { fontSize: 9.5, color: D, fontWeight: "medium", flex: 1 },
  section: { marginTop: 16 },
  sectionTitle: { fontSize: 11, fontWeight: "bold", color: A, borderBottom: `1.5 solid ${B}`, paddingBottom: 3, marginBottom: 8 },
  chipRow: { flexDirection: "row", flexWrap: "wrap", gap: 4, marginBottom: 6 },
  chip: { backgroundColor: "#e0e7ff", color: A, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 4, fontSize: 8, fontWeight: "medium" },
  showcaseRow: { flexDirection: "row", gap: 8, marginTop: 6, flexWrap: "wrap" },
  showcaseImg: { width: 90, height: 110, borderRadius: 3, border: `1 solid ${B}` },
  disclaimer: { marginTop: 24, padding: 10, border: `1 solid ${B}`, borderRadius: 4, backgroundColor: "#fafafa" },
  disclaimerTitle: { fontSize: 8, fontWeight: "bold", color: A, marginBottom: 4 },
  disclaimerText: { fontSize: 7, color: M, lineHeight: 1.4 },
  footer: { position: "absolute", bottom: 30, left: 45, right: 45, flexDirection: "row", justifyContent: "space-between", borderTop: `1 solid ${B}`, paddingTop: 8, fontSize: 7, color: M },
  stamp: { position: "absolute", top: 30, right: 45, border: `2 solid ${A}`, borderRadius: 4, paddingHorizontal: 14, paddingVertical: 8, transform: "rotate(-5deg)" },
  stampText: { fontSize: 8, fontWeight: "bold", color: A, textAlign: "center" },
});

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "";

const info = (label: string, val: any) => {
  if (val == null || val === "" || val === "null") return null;
  let display = String(val);
  if (label === "Salary" && typeof val === "number") display = `KES ${val.toLocaleString()}`;
  return <View style={s.infoItem}><Text style={s.infoLabel}>{label}</Text><Text style={s.infoValue}>{display}</Text></View>;
};

function CVDocument({ cv }: { cv: CVDto }) {
  const pp = cv.passportPhotoUrl && !cv.passportPhotoUrl.startsWith("http") ? withUploadToken(`${API_BASE}${cv.passportPhotoUrl}`) : cv.passportPhotoUrl;
  const fp = cv.fullPhotoUrl && !cv.fullPhotoUrl.startsWith("http") ? withUploadToken(`${API_BASE}${cv.fullPhotoUrl}`) : cv.fullPhotoUrl;
  const showcase = (cv.showcasePhotoUrls || []).map(u => u && !u.startsWith("http") ? withUploadToken(`${API_BASE}${u}`) : u).filter(Boolean);

  return (
    <Document>
      <Page size="A4" style={s.page}>
        <View style={s.header}>
          <View style={{ flex: 1 }}>
            <Text style={s.agencyName}>SSL Agency</Text>
            <Text style={s.agencySub}>Starnet Solutions Limited | International Recruitment</Text>
          </View>
          <View style={s.stamp}>
            <Text style={s.stampText}>AGENCY</Text>
            <Text style={s.stampText}>VERIFIED</Text>
          </View>
        </View>

        <Text style={s.cvLabel}>Curriculum Vitae</Text>
        <View style={s.nameRow}>
          <Text style={s.name}>{cv.fullName || "Candidate"}</Text>
          <Text style={{ fontSize: 9, color: M }}>Date: {new Date().toLocaleDateString()}</Text>
        </View>

        <View style={s.photoRow}>
          {pp ? <Image src={pp} style={s.passportPhoto} /> : <View style={[s.passportPhoto, { backgroundColor: "#f3f4f6" }]} />}
          {fp ? <Image src={fp} style={s.fullPhoto} /> : <View style={[s.fullPhoto, { backgroundColor: "#f3f4f6" }]} />}
          <View style={{ flex: 1 }}>
            <View style={s.infoGrid}>
              {info("Full Name", cv.fullName)}
              {info("Nationality", cv.nationality)}
              {info("Date of Birth", cv.dob)}
              {info("Age", cv.age)}
              {info("Religion", cv.religion)}
              {info("Marital Status", cv.maritalStatus)}
              {info("Children", cv.numberOfKids)}
              {info("Education", cv.educationLevel)}
              {info("Location", cv.currentLocation)}
              {info("Phone", cv.phoneNumber)}
              {info("Email", cv.email)}
            </View>
          </View>
        </View>

        <View style={s.section}>
          <Text style={s.sectionTitle}>Professional Profile</Text>
          <View style={s.infoGrid}>
            {info("Current Profession", cv.currentProfession)}
            {info("Salary", cv.currentSalary)}
            {info("Employment Status", cv.employmentStatus)}
            {info("Job Category Sought", cv.jobRecruitment?.replace(/_/g, " "))}
          </View>
        </View>

        {cv.languages && cv.languages.length > 0 && (
          <View style={s.section}>
            <Text style={s.sectionTitle}>Languages</Text>
            <View style={s.chipRow}>
              {cv.languages.map((l, i) => <Text key={i} style={s.chip}>{l.charAt(0) + l.slice(1).toLowerCase()}</Text>)}
            </View>
          </View>
        )}

        {showcase.length > 0 && (
          <View style={s.section}>
            <Text style={s.sectionTitle}>Showcase Photos</Text>
            <View style={s.showcaseRow}>
              {showcase.map((url, i) => <Image key={i} src={url} style={s.showcaseImg} />)}
            </View>
          </View>
        )}

        <View style={s.disclaimer}>
          <Text style={s.disclaimerTitle}>Declaration & Legal Notice</Text>
          <Text style={s.disclaimerText}>
            I, {cv.fullName}, declare that all information provided in this curriculum vitae is true and accurate to the best of my knowledge.
            I authorize Starnet Solutions Limited to present this document to prospective employers for recruitment and placement purposes.
            This document is the property of Starnet Solutions Limited and is issued solely for official recruitment use.
            Unauthorized reproduction or distribution is prohibited. The photographs contained herein are for identification purposes only.
          </Text>
        </View>

        <View style={s.footer}>
          <Text>Starnet Solutions Limited | SSL Recruitment Agency</Text>
          <Text>Generated: {new Date().toISOString().slice(0, 10)} | CV Ref: {cv.id}</Text>
        </View>
      </Page>
    </Document>
  );
}

interface Props { id: number; buttonText?: string; }

export default function GenerateCVButton({ id, buttonText = "Generate CV" }: Props) {
  const [cv, setCv] = useState<CVDto | null>(null);
  const [loading, setLoading] = useState(false);
  const [showViewer, setShowViewer] = useState(false);

  const fetchCV = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/api/international/${id}/cv`);
      setCv(res.data);
      setShowViewer(true);
    } catch { toast.error("Failed to load CV"); }
    finally { setLoading(false); }
  };

  return (
    <>
      <button onClick={fetchCV} disabled={loading}
        className="w-full px-4 py-2 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition flex items-center gap-2 justify-center text-sm">
        <FileText className="w-4 h-4" /> {loading ? "Loading..." : cv ? "Open CV" : buttonText}
      </button>

      {cv && showViewer && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/70 z-[200] p-4" onClick={() => setShowViewer(false)}>
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-6xl h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="bg-gradient-to-r from-indigo-700 to-indigo-800 px-6 py-3 rounded-t-xl flex justify-between items-center">
              <h2 className="text-lg font-bold text-white flex items-center gap-2"><FileText className="w-5 h-5" /> CV - {cv.fullName}</h2>
              <div className="flex items-center gap-3">
                <PDFDownloadLink document={<CVDocument cv={cv} />} fileName={`${cv.fullName?.replace(/\s+/g, "_") || "cv"}_SSL_CV.pdf`}
                  className="px-4 py-2 bg-white text-indigo-700 font-semibold rounded-lg hover:bg-gray-50 transition flex items-center gap-2 text-sm">
                  {({ loading: dl }) => <><Download className="w-4 h-4" /> {dl ? "Preparing..." : "Download PDF"}</>}
                </PDFDownloadLink>
                <button onClick={() => setShowViewer(false)} className="text-white hover:bg-white/20 p-2 rounded-lg"><X className="w-5 h-5" /></button>
              </div>
            </div>
            <div className="flex-1 bg-gray-100">
              <PDFViewer width="100%" height="100%"><CVDocument cv={cv} /></PDFViewer>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
