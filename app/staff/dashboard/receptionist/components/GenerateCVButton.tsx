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
  Image,
} from "@react-pdf/renderer";
import { X, Download, FileText, Upload } from "lucide-react";
import toast from "react-hot-toast";

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
  page: {
    padding: 40,
    fontSize: 11,
    fontFamily: "Helvetica",
    backgroundColor: "#ffffff",
    lineHeight: 1.6,
  },
  headerContainer: {
    marginBottom: 24,
    borderBottom: "2 solid #1e40af",
    paddingBottom: 20,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  headerCenter: {
    textAlign: "center",
    flex: 1,
    paddingHorizontal: 10,
  },
  logo: {
    width: 52,
    height: 52,
    marginRight: 12,
  },
  flag: {
    width: 70,
    height: 44,
    marginLeft: 12,
    borderRadius: 2,
  },
  cvTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1e40af",
    marginBottom: 6,
    letterSpacing: 1,
  },
  fullName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1f2937",
    marginBottom: 4,
  },
  country: {
    fontSize: 10,
    color: "#6b7280",
    fontStyle: "italic",
  },
  sectionContainer: {
    marginBottom: 18,
    backgroundColor: "#f9fafb",
    padding: 14,
    borderRadius: 4,
    borderLeft: "3 solid #3b82f6",
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#1e40af",
    marginBottom: 10,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  infoRow: {
    flexDirection: "row",
    marginBottom: 6,
    alignItems: "flex-start",
  },
  infoLabel: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#374151",
    width: 140,
    marginRight: 8,
  },
  infoValue: {
    fontSize: 10,
    color: "#4b5563",
    flex: 1,
  },
  dividerLine: {
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
    marginVertical: 4,
  },
  languagesList: {
    fontSize: 10,
    color: "#4b5563",
    lineHeight: 1.5,
  },
  footer: {
    position: "absolute",
    bottom: 30,
    left: 40,
    right: 40,
    textAlign: "center",
    fontSize: 8,
    color: "#9ca3af",
    borderTop: "1 solid #e5e7eb",
    paddingTop: 10,
  },
});

const CVDocument = ({
  cv,
  logoSrc,
  flagSrc,
}: {
  cv: InterApplicationCVDto;
  logoSrc?: string;
  flagSrc?: string;
}) => (
  <Document>
    <Page style={pdfStyles.page}>
      {/* Professional Header */}
      <View style={pdfStyles.headerContainer}>
        <View style={pdfStyles.headerRow}>
          {logoSrc && <Image style={pdfStyles.logo} src={logoSrc} />}
          <View style={pdfStyles.headerCenter}>
            <Text style={pdfStyles.cvTitle}>CURRICULUM VITAE</Text>
            <Text style={pdfStyles.fullName}>{cv.fullName}</Text>
            <Text style={pdfStyles.country}>Republic of Kenya</Text>
          </View>
          {flagSrc && <Image style={pdfStyles.flag} src={flagSrc} />}
        </View>
      </View>

      {/* Personal Information Section */}
      <View style={pdfStyles.sectionContainer}>
        <Text style={pdfStyles.sectionTitle}>Personal Information</Text>
        <View style={pdfStyles.infoRow}>
          <Text style={pdfStyles.infoLabel}>Nationality:</Text>
          <Text style={pdfStyles.infoValue}>{cv.nationality || "N/A"}</Text>
        </View>
        <View style={pdfStyles.infoRow}>
          <Text style={pdfStyles.infoLabel}>Date of Birth:</Text>
          <Text style={pdfStyles.infoValue}>{cv.dob || "N/A"}</Text>
        </View>
        <View style={pdfStyles.infoRow}>
          <Text style={pdfStyles.infoLabel}>Age:</Text>
          <Text style={pdfStyles.infoValue}>{cv.age || "N/A"} years</Text>
        </View>
        <View style={pdfStyles.infoRow}>
          <Text style={pdfStyles.infoLabel}>Place of Birth:</Text>
          <Text style={pdfStyles.infoValue}>{cv.placeOfBirth || "N/A"}</Text>
        </View>
        <View style={pdfStyles.infoRow}>
          <Text style={pdfStyles.infoLabel}>Marital Status:</Text>
          <Text style={pdfStyles.infoValue}>{cv.maritalStatus || "N/A"}</Text>
        </View>
        <View style={pdfStyles.infoRow}>
          <Text style={pdfStyles.infoLabel}>Number of Children:</Text>
          <Text style={pdfStyles.infoValue}>{cv.numberOfKids || "N/A"}</Text>
        </View>
        <View style={pdfStyles.infoRow}>
          <Text style={pdfStyles.infoLabel}>Religion:</Text>
          <Text style={pdfStyles.infoValue}>{cv.religion || "N/A"}</Text>
        </View>
        <View style={pdfStyles.infoRow}>
          <Text style={pdfStyles.infoLabel}>Height:</Text>
          <Text style={pdfStyles.infoValue}>{cv.height || "N/A"}</Text>
        </View>
      </View>

      {/* Passport Details Section */}
      <View style={pdfStyles.sectionContainer}>
        <Text style={pdfStyles.sectionTitle}>Passport Details</Text>
        <View style={pdfStyles.infoRow}>
          <Text style={pdfStyles.infoLabel}>Passport Number:</Text>
          <Text style={pdfStyles.infoValue}>{cv.passportNumber || "N/A"}</Text>
        </View>
        <View style={pdfStyles.infoRow}>
          <Text style={pdfStyles.infoLabel}>Date of Issue:</Text>
          <Text style={pdfStyles.infoValue}>{cv.passportIssue || "N/A"}</Text>
        </View>
        <View style={pdfStyles.infoRow}>
          <Text style={pdfStyles.infoLabel}>Date of Expiry:</Text>
          <Text style={pdfStyles.infoValue}>{cv.passportExpiry || "N/A"}</Text>
        </View>
      </View>

      {/* Professional Information Section */}
      <View style={pdfStyles.sectionContainer}>
        <Text style={pdfStyles.sectionTitle}>Professional Information</Text>
        <View style={pdfStyles.infoRow}>
          <Text style={pdfStyles.infoLabel}>Job Position Sought:</Text>
          <Text style={pdfStyles.infoValue}>{cv.jobRecruitment || "N/A"}</Text>
        </View>
        <View style={pdfStyles.infoRow}>
          <Text style={pdfStyles.infoLabel}>Current Profession:</Text>
          <Text style={pdfStyles.infoValue}>
            {cv.currentProfession || "N/A"}
          </Text>
        </View>
        <View style={pdfStyles.infoRow}>
          <Text style={pdfStyles.infoLabel}>Employment Status:</Text>
          <Text style={pdfStyles.infoValue}>
            {cv.employmentStatus || "N/A"}
          </Text>
        </View>
        <View style={pdfStyles.infoRow}>
          <Text style={pdfStyles.infoLabel}>Current Salary:</Text>
          <Text style={pdfStyles.infoValue}>
            {cv.currentSalary
              ? `KSh ${cv.currentSalary.toLocaleString()}`
              : "N/A"}
          </Text>
        </View>
        <View style={pdfStyles.infoRow}>
          <Text style={pdfStyles.infoLabel}>Education Level:</Text>
          <Text style={pdfStyles.infoValue}>{cv.educationLevel || "N/A"}</Text>
        </View>
      </View>

      {/* Languages Section */}
      {cv.languages && cv.languages.length > 0 && (
        <View style={pdfStyles.sectionContainer}>
          <Text style={pdfStyles.sectionTitle}>Languages</Text>
          <Text style={pdfStyles.languagesList}>{cv.languages.join(", ")}</Text>
        </View>
      )}

      {/* Footer */}
      <Text style={pdfStyles.footer}>
        This CV was generated on {new Date().toLocaleDateString()} •
        Confidential Document
      </Text>
    </Page>
  </Document>
);

interface GenerateCVButtonProps {
  id: number;
  buttonText?: string;
  logoSrc?: string;
  flagSrc?: string;
}

export default function GenerateCVButton({
  id,
  buttonText = "Generate CV",
  logoSrc,
  flagSrc = "https://upload.wikimedia.org/wikipedia/commons/thumb/4/49/Flag_of_Kenya.svg/320px-Flag_of_Kenya.svg.png",
}: GenerateCVButtonProps) {
  const [cv, setCv] = useState<InterApplicationCVDto | null>(null);
  const [passportFile, setPassportFile] = useState<File | null>(null);
  const [passportData, setPassportData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [showViewer, setShowViewer] = useState(false);

  const springBootBaseUrl =
    process.env.NEXT_PUBLIC_SPRING_BOOT_URL || "http://localhost:9090";

  const handlePassportUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setPassportFile(e.target.files[0]);
      setPassportData(null);
    }
  };

  const processWithSpringBoot = async (file: File) => {
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch(`${springBootBaseUrl}/api/ocr/passport`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Spring Boot API error: ${response.status}`);
      }

      const result = await response.json();

      if (result.error) {
        throw new Error(result.error);
      }

      console.log("✅ Spring Boot OCR Result:", result);
      return result;
    } catch (error) {
      console.error("❌ Spring Boot OCR Error:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const readPassport = async () => {
    if (!passportFile) {
      toast.error("Please upload a passport PDF first.");
      return;
    }

    try {
      toast.loading("Sending to Spring Boot for processing...", {
        id: "spring-boot-processing",
      });

      const extractedData = await processWithSpringBoot(passportFile);

      setPassportData(extractedData);
      toast.success("✅ Passport processed successfully with Spring Boot!");
    } catch (error: any) {
      console.error("Failed to process passport:", error);
      toast.error(`Failed to process passport: ${error.message}`);
    } finally {
      toast.dismiss("spring-boot-processing");
    }
  };

  const fetchCV = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/api/international/${id}/cv`);
      const mergedCV = passportData
        ? { ...response.data, ...passportData }
        : response.data;
      setCv(mergedCV);
      setShowViewer(true);
      toast.success(
        passportData
          ? "CV loaded and merged successfully!"
          : "CV loaded (no passport data merged)"
      );
    } catch (err) {
      console.error("Failed to load CV:", err);
      toast.error("Failed to load CV data");
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateCV = async () => {
    if (cv) {
      setShowViewer(true);
    } else {
      await fetchCV();
    }
  };

  return (
    <>
      <div className="flex flex-col gap-4 w-full max-w-md mx-auto p-6 bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="space-y-2">
          <label className="font-semibold text-gray-700 flex items-center gap-2 text-sm">
            <Upload className="w-4 h-4 text-blue-600" /> Upload Passport PDF
          </label>
          <input
            type="file"
            accept="application/pdf"
            onChange={handlePassportUpload}
            className="w-full border border-gray-300 p-2.5 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            disabled={loading}
          />
        </div>

        {passportFile && (
          <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded-md border border-gray-200">
            <span className="font-medium">Selected:</span> {passportFile.name}
          </div>
        )}

        <button
          onClick={readPassport}
          disabled={!passportFile || loading}
          className="w-full px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all shadow-sm hover:shadow-md"
        >
          {loading ? "Processing with Spring Boot..." : "Process Passport PDF"}
        </button>

        <button
          onClick={handleGenerateCV}
          disabled={loading}
          className="w-full px-6 py-3 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 justify-center shadow-sm hover:shadow-md"
        >
          <FileText className="w-5 h-5" />
          {loading ? "Loading CV..." : cv ? "Open CV" : buttonText}
        </button>

        {passportData && (
          <div className="mt-2 p-4 bg-green-50 border border-green-200 rounded-lg">
            <h3 className="font-semibold text-green-800 mb-3 flex items-center gap-2">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              Passport Data Extracted
            </h3>
            <div className="text-sm text-green-700 space-y-2">
              {passportData.passportNumber &&
                passportData.passportNumber !== "N/A" && (
                  <div className="flex gap-2">
                    <span className="font-medium">Passport:</span>
                    <span>{passportData.passportNumber}</span>
                  </div>
                )}
              {passportData.passportIssue &&
                passportData.passportIssue !== "N/A" && (
                  <div className="flex gap-2">
                    <span className="font-medium">Issue:</span>
                    <span>{passportData.passportIssue}</span>
                  </div>
                )}
              {passportData.passportExpiry &&
                passportData.passportExpiry !== "N/A" && (
                  <div className="flex gap-2">
                    <span className="font-medium">Expiry:</span>
                    <span>{passportData.passportExpiry}</span>
                  </div>
                )}
              {passportData.placeOfBirth &&
                passportData.placeOfBirth !== "N/A" && (
                  <div className="flex gap-2">
                    <span className="font-medium">Place of Birth:</span>
                    <span>{passportData.placeOfBirth}</span>
                  </div>
                )}
              {passportData.height && passportData.height !== "N/A" && (
                <div className="flex gap-2">
                  <span className="font-medium">Height:</span>
                  <span>{passportData.height}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {passportData &&
          Object.values(passportData).every((val) => val === "N/A" || !val) && (
            <div className="mt-2 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <h3 className="font-semibold text-yellow-800 mb-2 flex items-center gap-2">
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
                No Data Extracted
              </h3>
              <div className="text-sm text-yellow-700">
                The passport PDF could not be processed. Please ensure it's a
                clear, readable scan.
              </div>
            </div>
          )}
      </div>

      {cv && showViewer && (
        <div
          className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-70 z-[200] p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          onClick={() => setShowViewer(false)}
        >
          <div
            className="bg-white rounded-xl shadow-2xl w-full max-w-5xl h-[90vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-gradient-to-r from-blue-700 to-purple-700 px-6 py-4 rounded-t-xl flex justify-between items-center">
              <h2
                className="text-xl font-bold text-white flex items-center gap-2"
                id="cv-modal-title"
              >
                <FileText className="w-5 h-5" /> CV Preview - {cv.fullName}
              </h2>
              <div className="flex items-center gap-3">
                <PDFDownloadLink
                  document={
                    <CVDocument cv={cv} logoSrc={logoSrc} flagSrc={flagSrc} />
                  }
                  fileName={`${
                    cv.fullName?.replace(/\s+/g, "_") || "cv"
                  }_CV.pdf`}
                  className="px-5 py-2.5 bg-white text-blue-700 font-semibold rounded-lg hover:bg-gray-50 transition-all flex items-center gap-2 shadow-md"
                >
                  {({ loading: pdfLoading }) => (
                    <>
                      <Download className="w-4 h-4" />
                      {pdfLoading ? "Preparing..." : "Download PDF"}
                    </>
                  )}
                </PDFDownloadLink>
                <button
                  onClick={() => setShowViewer(false)}
                  className="text-white hover:bg-white hover:bg-opacity-20 p-2 rounded-lg transition-colors"
                  aria-label="Close"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-hidden bg-gray-100">
              <PDFViewer width="100%" height="100%" className="border-0">
                <CVDocument cv={cv} logoSrc={logoSrc} flagSrc={flagSrc} />
              </PDFViewer>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
