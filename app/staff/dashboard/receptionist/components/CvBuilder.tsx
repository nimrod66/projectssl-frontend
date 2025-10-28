"use client";

import { useEffect, useState } from "react";
import api from "@/app/staff/auth/api";
import {
  PDFDownloadLink,
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from "@react-pdf/renderer";

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

// PDF Styles
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
        <Text style={pdfStyles.text}>Date of Birth: {cv.dob || "N/A"}</Text>
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

export default function CVPage({ id }: { id: number }) {
  const [cv, setCv] = useState<InterApplicationCVDto | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCV = async () => {
      try {
        const response = await api.get(`/api/international/${id}/cv`);
        setCv(response.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchCV();
  }, [id]);

  if (loading) return <p className="text-center mt-10">Loading CV...</p>;
  if (!cv)
    return <p className="text-center mt-10 text-red-500">CV not found</p>;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white shadow rounded-lg p-6 mb-4">
        <h1 className="text-2xl font-bold text-purple-800 mb-4">
          {cv.fullName}
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <p>
              <span className="font-semibold">Nationality:</span>{" "}
              {cv.nationality || "N/A"}
            </p>
            <p>
              <span className="font-semibold">DOB:</span> {cv.dob || "N/A"}
            </p>
            <p>
              <span className="font-semibold">Age:</span> {cv.age || "N/A"}
            </p>
            <p>
              <span className="font-semibold">Marital Status:</span>{" "}
              {cv.maritalStatus || "N/A"}
            </p>
          </div>

          <div className="space-y-2">
            <p>
              <span className="font-semibold">Current Profession:</span>{" "}
              {cv.currentProfession || "N/A"}
            </p>
            <p>
              <span className="font-semibold">Current Salary:</span>{" "}
              {cv.currentSalary
                ? `KSh ${cv.currentSalary.toLocaleString()}`
                : "N/A"}
            </p>
            <p>
              <span className="font-semibold">Job Interest:</span>{" "}
              {cv.jobRecruitment || "N/A"}
            </p>
            <p>
              <span className="font-semibold">Languages:</span>{" "}
              {cv.languages?.join(", ") || "N/A"}
            </p>
          </div>
        </div>
      </div>

      <PDFDownloadLink
        document={<CVDocument cv={cv} />}
        fileName={`${cv.fullName}_CV.pdf`}
        className="inline-block px-6 py-2 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 transition-all"
      >
        {({ loading }) => (loading ? "Generating PDF..." : "Download PDF")}
      </PDFDownloadLink>
    </div>
  );
}
