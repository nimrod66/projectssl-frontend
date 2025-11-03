"use client";

import { useState, useEffect } from "react";
import api from "@/app/staff/auth/api";
import { GlobalWorkerOptions, getDocument } from "pdfjs-dist";
import {
  PDFDownloadLink,
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  PDFViewer,
} from "@react-pdf/renderer";
import { X, Download, FileText, Upload } from "lucide-react";
import toast from "react-hot-toast";

// Import Tesseract.js
import { createWorker } from "tesseract.js";

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
  passportNumber?: string;
  passportExpiry?: string;
  passportIssue?: string;
  placeOfBirth?: string;
  height?: string;
}

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
        <Text>Nationality: {cv.nationality || "N/A"}</Text>
        <Text>DOB: {cv.dob || "N/A"}</Text>
        <Text>Age: {cv.age || "N/A"}</Text>
        <Text>Marital Status: {cv.maritalStatus || "N/A"}</Text>
        <Text>Number of Kids: {cv.numberOfKids || "N/A"}</Text>
        <Text>Religion: {cv.religion || "N/A"}</Text>
        <Text>Place of Birth: {cv.placeOfBirth || "N/A"}</Text>
        <Text>Height: {cv.height || "N/A"}</Text>
      </View>

      <View style={pdfStyles.section}>
        <Text style={pdfStyles.subtitle}>Passport Details</Text>
        <Text>Passport Number: {cv.passportNumber || "N/A"}</Text>
        <Text>Issue Date: {cv.passportIssue || "N/A"}</Text>
        <Text>Expiry Date: {cv.passportExpiry || "N/A"}</Text>
      </View>

      <View style={pdfStyles.section}>
        <Text style={pdfStyles.subtitle}>Professional Information</Text>
        <Text>Job Interest: {cv.jobRecruitment || "N/A"}</Text>
        <Text>Current Profession: {cv.currentProfession || "N/A"}</Text>
        <Text>
          Current Salary:{" "}
          {cv.currentSalary
            ? `KSh ${cv.currentSalary.toLocaleString()}`
            : "N/A"}
        </Text>
        <Text>Employment Status: {cv.employmentStatus || "N/A"}</Text>
        <Text>Education Level: {cv.educationLevel || "N/A"}</Text>
      </View>

      {cv.languages && cv.languages.length > 0 && (
        <View style={pdfStyles.section}>
          <Text style={pdfStyles.subtitle}>Languages</Text>
          <Text>{cv.languages.join(", ")}</Text>
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
  const [passportFile, setPassportFile] = useState<File | null>(null);
  const [passportData, setPassportData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [showViewer, setShowViewer] = useState(false);

  useEffect(() => {
    GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
  }, []);

  const handlePassportUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setPassportFile(e.target.files[0]);
    }
  };

  const readPassport = async () => {
    if (!passportFile) return alert("Please upload a passport PDF first.");
    setLoading(true);
    let fullText = "";

    try {
      const arrayBuffer = await passportFile.arrayBuffer();
      const pdf = await getDocument({ data: arrayBuffer }).promise;

      const worker = await createWorker("eng", 1, {
        logger: (m) => console.log(m), // Log Tesseract progress (optional)
      }); // 'eng' for English language, add 'fas' for Farsi, etc.

      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);

        // --- Attempt 1: Standard PDF Text Extraction ---
        const textContent = await page.getTextContent();
        const pageText = textContent.items
          .map((item: any) => item.str)
          .join(" ");
        fullText += pageText + "\n";
        console.log(`Page ${i} - Extracted PDF text:`, pageText);

        // If no text was extracted by standard method, attempt OCR
        if (!pageText.trim()) {
          console.log(
            `Page ${i} - No text found via standard extraction, attempting OCR...`
          );
          // --- Attempt 2: OCR via Tesseract.js ---
          const viewport = page.getViewport({ scale: 10.0 });
          const canvas = document.createElement("canvas");
          const canvasContext = canvas.getContext("2d");
          canvas.height = viewport.height;
          canvas.width = viewport.width;

          await page.render({ canvasContext, viewport }).promise;

          // Use Tesseract to recognize text from the rendered image
          const {
            data: { text: ocrText },
          } = await worker.recognize(canvas);
          fullText += ocrText + "\n";
          console.log(`Page ${i} - Extracted OCR text:`, ocrText);
        }
      }

      await worker.terminate(); // Terminate Tesseract worker to free up resources

      const extracted = extractPassportData(fullText);

      if (Object.values(extracted).every((val) => !val)) {
        toast.error(
          "No passport details detected. PDF may be unreadable even with OCR."
        );
      } else {
        setPassportData(extracted);
        toast.success("✅ Passport PDF processed successfully!");
      }
    } catch (error) {
      console.error("PDF reading/OCR failed:", error);
      toast.error(
        "❌ Failed to process passport PDF. An error occurred during extraction or OCR."
      );
    } finally {
      setLoading(false);
    }
  };

  const fetchCV = async () => {
    if (!passportData) {
      toast.error("Please process the passport PDF first!");
      return;
    }
    setLoading(true);
    try {
      const response = await api.get(`/api/international/${id}/cv`);
      const mergedCV = { ...response.data, ...passportData };
      setCv(mergedCV);
      setShowViewer(true);
      toast.success("CV loaded and merged successfully!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to load CV");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="flex flex-col gap-3 w-full max-w-md mx-auto">
        <label className="font-semibold flex items-center gap-2">
          <Upload className="w-4 h-4" /> Upload Passport PDF
        </label>
        <input
          type="file"
          accept="application/pdf"
          onChange={handlePassportUpload}
          className="border p-2 rounded"
        />

        <button
          onClick={readPassport}
          disabled={!passportFile || loading}
          className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400"
        >
          {loading ? "Processing PDF..." : "Process Passport PDF"}
        </button>

        <button
          onClick={fetchCV}
          disabled={!passportData || loading}
          className="px-6 py-2 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 transition-all disabled:opacity-50 flex items-center gap-2 justify-center"
        >
          <FileText className="w-4 h-4" />
          {loading ? "Loading CV..." : buttonText}
        </button>
      </div>

      {cv && showViewer && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-60 z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl h-[90vh] flex flex-col">
            <div className="bg-gradient-to-r from-purple-600 to-purple-700 px-6 py-4 rounded-t-xl flex justify-between items-center">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <FileText className="w-5 h-5" /> CV Preview - {cv.fullName}
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

function extractPassportData(text: string) {
  const cleanText = text
    .replace(/[\n\r]+/g, " ")
    .replace(/\s{2,}/g, " ")
    .trim();

  // Passport Number: 1 letter + 7 digits (AK1234567) or similar
  const passportNumber = cleanText.match(/\b[A-Z]{1,2}\d{6,9}\b/)?.[0] || "";

  // Issue Date: DD/MM/YYYY
  const passportIssue =
    cleanText.match(/ISSUE DATE[:\s]*(\d{2}\/\d{2}\/\d{4})/i)?.[1] || "";

  // Expiry Date: DD/MM/YYYY
  const passportExpiry =
    cleanText.match(/EXPIRY DATE[:\s]*(\d{2}\/\d{2}\/\d{4})/i)?.[1] || "";

  // Place of Birth
  const placeOfBirth =
    cleanText.match(/PLACE OF BIRTH[:\s]*([A-Z\s]+)/i)?.[1]?.trim() || "";

  // Height
  const height =
    cleanText.match(/HEIGHT[:\s]*([0-9]{2,3}\s*(CM|M|FT|IN)?)/i)?.[1] || "";

  return {
    passportNumber,
    passportIssue,
    passportExpiry,
    placeOfBirth,
    height,
  };
}
