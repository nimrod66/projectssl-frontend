"use client";

import { useState } from "react";
import api from "@/app/staff/auth/api";
import {
  PDFDownloadLink,
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  PDFViewer,
} from "@react-pdf/renderer";
import { X, Download, FileText } from "lucide-react";

interface InterApplicationCVDto {
  id: number;
  fullName: string;
  nationality?: string;
  jobRecruitment?: string;
  religion?: string;
  currentProfession?: string;
  currentSalary?: number;
  dob?: string;
  age?: number;
  maritalStatus?: string;
  numberOfKids?: string;
  educationLevel?: string;
  languages?: string[];
  employmentStatus?: string;
}

// ✅ Styles for the PDF
const pdfStyles = StyleSheet.create({
  page: { padding: 30, fontSize: 12, fontFamily: "Helvetica" },
  section: { marginBottom: 10 },
  title: { fontSize: 20, fontWeight: "bold", marginBottom: 10 },
  subtitle: { fontSize: 14, fontWeight: "bold", marginTop: 5 },
  text: { marginBottom: 2 },
});

const CVDocument = ({ cv }: { cv: InterApplicationCVDto }) => (
  <Document>
    <Page style={pdfStyles.page}>
      <Text style={pdfStyles.title}>{cv.fullName}</Text>

      <View style={pdfStyles.section}>
        <Text style={pdfStyles.subtitle}>Personal Information</Text>
        <Text style={pdfStyles.text}>
          Nationality: {cv.nationality || "N/A"}
        </Text>
        <Text style={pdfStyles.text}>DOB: {cv.dob || "N/A"}</Text>
        <Text style={pdfStyles.text}>Age: {cv.age || "N/A"}</Text>
        <Text style={pdfStyles.text}>
          Marital Status: {cv.maritalStatus || "N/A"}
        </Text>
        <Text style={pdfStyles.text}>
          Number of Kids: {cv.numberOfKids || "N/A"}
        </Text>
        <Text style={pdfStyles.text}>Religion: {cv.religion || "N/A"}</Text>
      </View>

      <View style={pdfStyles.section}>
        <Text style={pdfStyles.subtitle}>Professional Information</Text>
        <Text style={pdfStyles.text}>
          Job Interest: {cv.jobRecruitment || "N/A"}
        </Text>
        <Text style={pdfStyles.text}>
          Current Profession: {cv.currentProfession || "N/A"}
        </Text>
        <Text style={pdfStyles.text}>
          Current Salary:{" "}
          {cv.currentSalary
            ? `KSh ${cv.currentSalary.toLocaleString()}`
            : "N/A"}
        </Text>
        <Text style={pdfStyles.text}>
          Employment Status: {cv.employmentStatus || "N/A"}
        </Text>
        <Text style={pdfStyles.text}>
          Education Level: {cv.educationLevel || "N/A"}
        </Text>
      </View>

      {cv.languages && cv.languages.length > 0 && (
        <View style={pdfStyles.section}>
          <Text style={pdfStyles.subtitle}>Languages</Text>
          <Text style={pdfStyles.text}>{cv.languages.join(", ")}</Text>
        </View>
      )}
    </Page>
  </Document>
);

interface GenerateCVButtonProps {
  id: number;
  buttonText?: string;
}

export default function GenerateCVButton({
  id,
  buttonText = "Generate CV",
}: GenerateCVButtonProps) {
  const [cv, setCv] = useState<InterApplicationCVDto | null>(null);
  const [loading, setLoading] = useState(false);
  const [showViewer, setShowViewer] = useState(false);

  const fetchCV = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/api/international/${id}/cv`);
      setCv(response.data);
      setShowViewer(true); // show live viewer after fetching
    } catch (err) {
      console.error(err);
      alert("Failed to load CV");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Generate CV Button */}
      <button
        onClick={fetchCV}
        className="px-6 py-2 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 transition-all disabled:opacity-50 flex items-center gap-2"
        disabled={loading}
      >
        <FileText className="w-4 h-4" />
        {loading ? "Loading CV..." : buttonText}
      </button>

      {/* CV Modal */}
      {cv && showViewer && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-60 z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-purple-600 to-purple-700 px-6 py-4 rounded-t-xl flex justify-between items-center">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <FileText className="w-5 h-5" />
                CV Preview - {cv.fullName}
              </h2>
              <div className="flex items-center gap-3">
                <PDFDownloadLink
                  document={<CVDocument cv={cv} />}
                  fileName={`${cv.fullName.replace(/\s+/g, "_")}_CV.pdf`}
                  className="px-4 py-2 bg-white text-purple-700 font-semibold rounded-lg hover:bg-gray-100 transition-all flex items-center gap-2"
                >
                  {({ loading: pdfLoading }) => (
                    <>
                      <Download className="w-4 h-4" />
                      {pdfLoading ? "Preparing..." : "Download"}
                    </>
                  )}
                </PDFDownloadLink>
                <button
                  onClick={() => setShowViewer(false)}
                  className="text-white hover:text-gray-200 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* PDF Viewer */}
            <div className="flex-1 overflow-hidden bg-gray-100">
              <PDFViewer width="100%" height="100%" className="border-0">
                <CVDocument cv={cv} />
              </PDFViewer>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
