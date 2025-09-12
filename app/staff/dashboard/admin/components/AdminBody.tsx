"use client";

import { useEffect, useState } from "react";
import api from "@/app/staff/auth/api";

import {
  Bell,
  CheckCircle,
  XCircle,
  FileText,
  Download,
  Search,
  Video,
  Image as ImageIcon,
  Upload,
  Users,
  Clock,
  CheckSquare,
  CheckCheckIcon,
  XSquare,
} from "lucide-react";

interface Applicant {
  id: number;
  fullName: string;
  email: string;
  phoneNumber: string;
  dob?: string;
  age?: number;
  nationality?: string;
  experience?: string;
  currentSalary?: number;
  currentProfession?: string;
  currentLocation?: string;
  languages: string[];
  employmentStatus?: string;
  jobInterest?: string;
  status: "PENDING" | "VETTED" | "APPROVED" | "REJECTED" | "HIRED";
  createdAt?: string;
  updatedAt?: string;

  passportPhotos: string[];
  fullPhotos: string[];
  nationalIdPhotos: string[];
  resumes: string[];
  birthCertificates: string[];
  goodConducts: string[];
  videos: string[];
  showcasePhotos: string[];
}

const jobInterestMap: Record<string, string> = {
  LOCAL_JOBS: "Local Jobs",
  INTERNATIONAL_JOBS: "International Jobs",
};

export default function AdminBodySection() {
  const [applicants, setApplicants] = useState<Applicant[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [previewPhoto, setPreviewPhoto] = useState<string | null>(null);
  const [previewVideo, setPreviewVideo] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [pendingPhoto, setPendingPhoto] = useState<File | null>(null);
  const [pendingVideo, setPendingVideo] = useState<File | null>(null);

  const [selectedApplicant, setSelectedApplicant] = useState<Applicant | null>(
    null
  );
  const [isUploading, setIsUploading] = useState(false);

  const API_BASE = process.env.NEXT_PUBLIC_API_BASE;

  const [filteredApplicants, setFilteredApplicants] = useState<Applicant[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch applicants
  const fetchApplicants = async () => {
    try {
      setLoading(true);
      const res = await api.get<Applicant[]>(`${API_BASE}/api/applications`);
      setApplicants(res.data);
      setFilteredApplicants(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchApplicants();
  }, []);

  const handleSearch = (query: string) => {
    setSearchQuery(query);

    if (query.trim()) {
      const filtered = applicants.filter(
        (app) =>
          app.fullName.toLowerCase().includes(query.toLowerCase()) ||
          app.email.toLowerCase().includes(query.toLowerCase()) ||
          app.phoneNumber.includes(query)
      );
      setFilteredApplicants(filtered);
    } else {
      setFilteredApplicants(applicants);
    }
  };

  const handleUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    file: File,
    type: "showcasePhotos" | "videos"
  ) => {
    if (!selectedApplicant) return;
    if (!e.target.files || e.target.files.length === 0) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      setIsUploading(true);
      const res = await fetch(
        `${API_BASE}/api/applications/${selectedApplicant.id}/upload-${type}`,
        { method: "POST", body: formData }
      );

      if (!res.ok) throw new Error(`Upload failed: ${res.statusText}`);
      const uploadedPath = await res.text();

      setSelectedApplicant((prev) =>
        prev
          ? {
              ...prev,
              showcasePhotos:
                type === "showcasePhotos"
                  ? [...prev.showcasePhotos, uploadedPath]
                  : prev.showcasePhotos,
              videos:
                type === "videos"
                  ? [...prev.videos, uploadedPath]
                  : prev.videos,
            }
          : prev
      );
    } catch (err) {
      console.error("Upload error:", err);
      alert("Upload failed");
    } finally {
      setIsUploading(false);
    }
  };

  // Mark applicant as vetted
  const handleMarkAsVetted = async (id: number) => {
    try {
      const res = await api.patch<Applicant>(`/api/applications/${id}/vet`);
      setApplicants((prev) =>
        prev.map((app) => (app.id === id ? res.data : app))
      );
      setSelectedApplicant(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  // Vetting actions
  const handleVetAction = async (id: number, action: "approve" | "reject") => {
    if (
      action === "approve" &&
      selectedApplicant &&
      (selectedApplicant.showcasePhotos.length === 0 ||
        selectedApplicant.videos.length === 0)
    ) {
      alert(
        "Applicant must have at least one showcase photo and one video uploaded before approval."
      );
      return;
    }

    try {
      const res = await api.patch<Applicant>(
        `/api/applications/${id}/${action}`
      );
      setApplicants((prev) =>
        prev.map((app) => (app.id === id ? res.data : app))
      );
      setSelectedApplicant(null);
    } finally {
      setActionLoading(false);
    }
  };

  // Hire applicant
  const handleHire = async (id: number) => {
    try {
      const res = await api.patch<Applicant>(`/api/applications/${id}/hired`);
      setApplicants((prev) =>
        prev.map((app) => (app.id === id ? res.data : app))
      );
      setSelectedApplicant(null);
    } catch (err) {
      console.error(err);
      alert("Failed to mark applicant as hired");
    }
  };

  // Restore applicant
  const handleRestore = async (id: number) => {
    try {
      const res = await api.patch<Applicant>(`/api/applications/${id}/restore`);
      setApplicants((prev) =>
        prev.map((app) => (app.id === id ? res.data : app))
      );
      setSelectedApplicant(null);
    } catch (err) {
      console.error(err);
      alert("Failed to restore applicant to the client pool");
    }
  };

  const pendingCount = applicants.filter((a) => a.status === "PENDING").length;
  const vettedCount = applicants.filter((a) => a.status === "VETTED").length;
  const approvedCount = applicants.filter(
    (a) => a.status === "APPROVED"
  ).length;
  const rejectedCount = applicants.filter(
    (a) => a.status === "REJECTED"
  ).length;
  const hiredCount = applicants.filter((a) => a.status === "HIRED").length;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "APPROVED":
        return "bg-green-100 text-green-800 border-green-200";
      case "REJECTED":
        return "bg-red-100 text-red-800 border-red-200";
      case "VETTED":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "PENDING":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "HIRED":
        return "bg-purple-100 text-purple-800 border-purple-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-yellow-50 p-3 sm:p-4 lg:p-6">
      {/* Header */}
      <header className="bg-white rounded-xl shadow-lg p-4 sm:p-6 mb-4 sm:mb-6">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-purple-800 mb-2">
              Admin Dashboard
            </h1>
            <p className="text-gray-600 text-sm sm:text-base">
              Manage and vet domestic staff applications
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 w-full lg:w-auto">
            <div className="relative flex-1 sm:flex-none">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search by name, email, or phone..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10 pr-4 py-2 border  border-gray-900 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent w-full sm:w-64 text-sm"
              />
            </div>
            <div className="relative">
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 sm:h-6 sm:w-6 flex items-center justify-center">
                {pendingCount}
              </span>
              <button className="bg-yellow-400 hover:bg-yellow-500 text-purple-800 p-2 sm:p-3 rounded-lg transition-colors">
                <Bell className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Stats Cards */}
      <div className="grid grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 lg:gap-6 mb-4 sm:mb-6">
        <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 border-l-4 border-yellow-400">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-xs sm:text-sm">Pending</p>
              <p className="text-xl sm:text-2xl font-bold text-yellow-600">
                {pendingCount}
              </p>
            </div>
            <Clock className="w-6 h-6 sm:w-8 sm:h-8 text-yellow-400" />
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 border-l-4 border-blue-400">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-xs sm:text-sm">Vetted</p>
              <p className="text-xl sm:text-2xl font-bold text-blue-600">
                {vettedCount}
              </p>
            </div>
            <CheckSquare className="w-6 h-6 sm:w-8 sm:h-8 text-blue-400" />
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 border-l-4 border-green-400">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-xs sm:text-sm">Approved</p>
              <p className="text-xl sm:text-2xl font-bold text-green-600">
                {approvedCount}
              </p>
            </div>
            <CheckCircle className="w-6 h-6 sm:w-8 sm:h-8 text-green-400" />
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 border-l-4 border-red-400">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-xs sm:text-sm">Rejected</p>
              <p className="text-xl sm:text-2xl font-bold text-red-600">
                {rejectedCount}
              </p>
            </div>
            <XSquare className="w-6 h-6 sm:w-8 sm:h-8 text-red-400" />
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 border-l-4 border-red-400">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-xs sm:text-sm">Hired</p>
              <p className="text-xl sm:text-2xl font-bold text-red-600">
                {hiredCount}
              </p>
            </div>
            <CheckCheckIcon className="w-6 h-6 sm:w-8 sm:h-8 text-red-400" />
          </div>
        </div>
      </div>

      {/* Applicants Table */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="bg-gradient-to-r from-purple-600 to-purple-700 px-4 sm:px-6 py-3 sm:py-4">
          <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
            <Users className="w-4 h-4 sm:w-5 sm:h-5" />
            Applications ({applicants.length})
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-purple-50">
              <tr>
                <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-semibold text-purple-800">
                  ID
                </th>
                <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-semibold text-purple-800">
                  Applicant
                </th>
                <th className="hidden sm:table-cell px-3 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-semibold text-purple-800">
                  Email
                </th>
                <th className="hidden lg:table-cell px-3 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-semibold text-purple-800">
                  Phone
                </th>
                <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-semibold text-purple-800">
                  Status
                </th>
                <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-semibold text-purple-800">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredApplicants.map((app) => (
                <tr
                  key={app.id}
                  className="hover:bg-purple-50 transition-colors"
                >
                  <td className="px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm text-gray-900 font-medium">
                    #{app.id}
                  </td>
                  <td className="px-3 sm:px-6 py-3 sm:py-4">
                    <div>
                      <p className="text-sm sm:text-base font-medium text-gray-900">
                        {app.fullName}
                      </p>
                      <p className="text-xs sm:text-sm text-gray-500">
                        {app.currentLocation}
                      </p>
                    </div>
                  </td>
                  <td className="hidden sm:table-cell px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm text-gray-900">
                    {app.email}
                  </td>
                  <td className="hidden lg:table-cell px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm text-gray-900">
                    {app.phoneNumber}
                  </td>
                  <td className="px-3 sm:px-6 py-3 sm:py-4">
                    <span
                      className={`inline-flex items-center px-2 sm:px-3 py-1 rounded-full text-xs font-medium border ${getStatusBadge(
                        app.status
                      )}`}
                    >
                      {app.status}
                    </span>
                  </td>
                  <td className="px-3 sm:px-6 py-3 sm:py-4">
                    <button
                      className="bg-purple-600 hover:bg-purple-700 text-white px-2 sm:px-4 py-1 sm:py-2 rounded-lg text-xs sm:text-sm transition-colors"
                      onClick={() => setSelectedApplicant(app)}
                    >
                      Review
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Vetting Modal */}
      {selectedApplicant && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 p-2 sm:p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-purple-600 to-purple-700 px-4 sm:px-6 py-3 sm:py-4 rounded-t-xl">
              <div className="flex justify-between items-center">
                <h2 className="text-lg sm:text-xl font-bold text-white">
                  Review Applicant: {selectedApplicant.fullName}
                </h2>
                <button
                  onClick={() => setSelectedApplicant(null)}
                  className="text-white hover:text-gray-200 text-xl sm:text-2xl font-bold"
                >
                  ×
                </button>
              </div>
            </div>

            <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
              {/* Media Section */}
              {selectedApplicant.status === "APPROVED" && (
                <div className="space-y-3 sm:space-y-4">
                  <h3 className="text-base sm:text-lg font-semibold text-purple-800 border-b border-purple-200 pb-2">
                    Media Files
                  </h3>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 justify-center">
                    {/* Showcase Photos */}
                    {selectedApplicant.showcasePhotos.length > 0 && (
                      <div className="space-y-2">
                        <h4 className="font-medium text-gray-700 flex items-center gap-2 text-sm sm:text-base">
                          <ImageIcon className="w-4 h-4" />
                          Showcase Photos
                        </h4>
                        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-2 gap-2 sm:gap-4">
                          {selectedApplicant.showcasePhotos.map(
                            (photo, index) => (
                              <div key={index} className="relative group">
                                <img
                                  src={`${API_BASE}${photo}`}
                                  alt={`Showcase ${index + 1}`}
                                  className="w-full aspect-square object-cover rounded-lg shadow-md cursor-pointer transition-transform duration-200 hover:scale-105"
                                />
                              </div>
                            )
                          )}
                        </div>
                      </div>
                    )}

                    {/* Video Preview */}
                    {selectedApplicant.videos.length > 0 && (
                      <div className="space-y-2">
                        <h4 className="font-medium text-gray-700 flex items-center gap-2 text-sm sm:text-base">
                          <Video className="w-4 h-4" />
                          Video
                        </h4>
                        <div className="w-full aspect-video">
                          <video
                            className="w-full h-full rounded-lg shadow-md object-cover"
                            controls
                          >
                            <source
                              src={`${API_BASE}${selectedApplicant.videos[0]}`}
                              type="video/mp4"
                            />
                            Your browser does not support the video tag.
                          </video>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Fallback if no media */}
              {selectedApplicant.status !== "APPROVED" &&
                selectedApplicant.passportPhotos.length > 0 && (
                  <div className="flex justify-center">
                    <img
                      src={`${API_BASE}${selectedApplicant.passportPhotos[0]}`}
                      alt="Full Photo"
                      className="w-32 h-32 sm:w-40 sm:h-40 object-cover rounded-xl shadow-lg"
                    />
                  </div>
                )}

              {!selectedApplicant.showcasePhotos.length &&
                !selectedApplicant.fullPhotos.length && (
                  <div className="w-32 h-32 sm:w-40 sm:h-40 bg-gray-100 rounded-xl flex items-center justify-center mx-auto">
                    <ImageIcon className="w-8 h-8 sm:w-12 sm:h-12 text-gray-400" />
                  </div>
                )}

              {/* Applicant Documents Section */}
              {selectedApplicant.resumes?.length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-base sm:text-lg font-semibold text-purple-800 border-b border-purple-200 pb-2">
                    Applicant Documents
                  </h3>
                  {selectedApplicant.resumes?.length > 0 && (
                    <div className="space-y-2">
                      <p className="font-medium text-purple-700 text-sm">
                        Resumes
                      </p>
                      {selectedApplicant.resumes.map((file, idx) => (
                        <a
                          key={idx}
                          href={`${API_BASE}${file}`}
                          download={`resume-${idx + 1}`}
                          className="block bg-gray-50 hover:bg-gray-100 px-3 py-2 rounded-lg text-sm text-purple-800"
                        >
                          Download Resume {idx + 1}
                        </a>
                      ))}
                    </div>
                  )}

                  {/* Birth Certificate */}
                  {selectedApplicant.birthCertificates?.length > 0 && (
                    <div className="space-y-2">
                      <p className="font-medium text-purple-700 text-sm">
                        Birth Certificate
                      </p>
                      {selectedApplicant.birthCertificates.map((file, idx) => (
                        <a
                          key={idx}
                          href={`${API_BASE}${file}`}
                          download={`birth-certificate-${idx + 1}`}
                          className="block bg-gray-50 hover:bg-gray-100 px-3 py-2 rounded-lg text-sm text-purple-800"
                        >
                          Download Birth Certificate {idx + 1}
                        </a>
                      ))}
                    </div>
                  )}

                  {/* Good Conduct */}
                  {selectedApplicant.goodConducts?.length > 0 && (
                    <div className="space-y-2">
                      <p className="font-medium text-purple-700 text-sm">
                        Good Conduct
                      </p>
                      {selectedApplicant.goodConducts.map((file, idx) => (
                        <a
                          key={idx}
                          href={`${API_BASE}${file}`}
                          download={`good-conduct-${idx + 1}`}
                          className="block bg-gray-50 hover:bg-gray-100 px-3 py-2 rounded-lg text-sm text-purple-800"
                        >
                          Download Good Conduct {idx + 1}
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Applicant Info */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                <div className="space-y-3 sm:space-y-4">
                  <h3 className="text-base sm:text-lg font-semibold text-purple-800 border-b border-purple-200 pb-2">
                    Personal Information
                  </h3>
                  <div className="space-y-2 text-xs sm:text-sm">
                    <p className="font-semibold text-base text-gray-900 sm:text-sm">
                      <span className="font-medium text-gray-700">Email:</span>{" "}
                      {selectedApplicant.email}
                    </p>
                    <p className="font-semibold text-base text-gray-900 sm:text-sm">
                      <span className="font-medium text-gray-700">Phone:</span>{" "}
                      {selectedApplicant.phoneNumber}
                    </p>
                    <p className="font-semibold text-base text-gray-900 sm:text-sm">
                      <span className="font-medium text-gray-700">DOB:</span>{" "}
                      {selectedApplicant.dob || "N/A"}
                    </p>
                    <p className="font-semibold text-base text-gray-900 sm:text-sm">
                      <span className="font-medium text-gray-700">Age:</span>{" "}
                      {selectedApplicant.age || "N/A"}
                    </p>
                    <p className="font-semibold text-base text-gray-900 sm:text-sm">
                      <span className="font-medium text-gray-700">
                        Nationality:
                      </span>{" "}
                      {selectedApplicant.nationality || "N/A"}
                    </p>
                  </div>
                </div>
                <div className="space-y-3 sm:space-y-4">
                  <h3 className="text-base sm:text-lg font-semibold text-purple-800 border-b border-purple-200 pb-2">
                    Professional Details
                  </h3>
                  <div className="space-y-2 text-xs sm:text-sm">
                    <p className="font-semibold text-base text-gray-900 sm:text-sm">
                      <span className="font-medium text-gray-700">
                        Profession:
                      </span>{" "}
                      {selectedApplicant.currentProfession || "N/A"}
                    </p>
                    <p className="font-semibold text-base text-gray-900 sm:text-sm">
                      <span className="font-medium text-gray-700">
                        Location:
                      </span>{" "}
                      {selectedApplicant.currentLocation || "N/A"}
                    </p>
                    <p className="font-semibold text-base text-gray-900 sm:text-sm">
                      <span className="font-medium text-gray-700">
                        Experience:
                      </span>{" "}
                      {selectedApplicant.experience || "N/A"}
                    </p>
                    <p className="font-semibold text-base text-gray-900 sm:text-sm">
                      <span className="font-medium text-gray-700">
                        Languages:
                      </span>{" "}
                      {selectedApplicant.languages.join(", ")}
                    </p>
                    <p className="font-semibold text-base text-gray-900 sm:text-sm">
                      <span className="font-medium text-gray-700">
                        Job Interest:
                      </span>{" "}
                      {jobInterestMap[
                        selectedApplicant.jobInterest as keyof typeof jobInterestMap
                      ] || "N/A"}
                    </p>
                  </div>
                </div>
              </div>
              {/* Upload Section */}
              {selectedApplicant.status === "VETTED" && (
                <div className="bg-yellow-50 rounded-lg p-3 sm:p-4 border border-yellow-200">
                  <h3 className="text-base sm:text-lg font-semibold text-yellow-800 mb-3">
                    Upload Showcase Media
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <label
                      className={`flex items-center gap-2 sm:gap-3 cursor-pointer bg-white p-2 sm:p-3 rounded-lg border-2 border-dashed ${
                        isUploading
                          ? "border-gray-300 opacity-50 cursor-not-allowed"
                          : "border-yellow-300 hover:border-yellow-400"
                      }`}
                    >
                      <Upload className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-600" />
                      <span className="text-xs sm:text-sm text-gray-700">
                        {isUploading ? "Uploading..." : "Upload Showcase Photo"}
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        disabled={isUploading}
                        onChange={(e) =>
                          e.target.files?.[0] &&
                          handleUpload(e, e.target.files[0], "showcasePhotos")
                        }
                      />
                    </label>

                    <label
                      className={`flex items-center gap-2 sm:gap-3 cursor-pointer bg-white p-2 sm:p-3 rounded-lg border-2 border-dashed ${
                        isUploading
                          ? "border-gray-300 opacity-50 cursor-not-allowed"
                          : "border-yellow-300 hover:border-yellow-400"
                      }`}
                    >
                      <Video className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-600" />
                      <span className="text-xs sm:text-sm text-gray-700">
                        {isUploading ? "Uploading..." : "Upload Video"}
                      </span>
                      <input
                        type="file"
                        accept="video/*"
                        className="hidden"
                        disabled={isUploading}
                        onChange={(e) =>
                          e.target.files?.[0] &&
                          handleUpload(e, e.target.files[0], "videos")
                        }
                      />
                    </label>
                  </div>
                </div>
              )}
              {/* Preview Section */}
              {(previewPhoto || previewVideo) && (
                <div className="mt-4 space-y-4">
                  {previewPhoto && (
                    <div>
                      <p className="text-xs font-medium text-gray-600 mb-1">
                        Preview Photo
                      </p>
                      <img
                        src={previewPhoto}
                        alt="Preview"
                        className="w-32 h-32 sm:w-48 sm:h-48 object-fit rounded-lg border shadow-md"
                      />
                    </div>
                  )}
                  {previewVideo && (
                    <div>
                      <p className="text-xs font-medium text-gray-600 mb-1">
                        Preview Video
                      </p>
                      <video
                        src={previewVideo}
                        controls
                        className="w-full max-w-md rounded-lg border shadow-md"
                      />
                    </div>
                  )}
                </div>
              )}
              {/* Actions */}
              <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-4 pt-4 sm:pt-6 border-t border-gray-200">
                {(selectedApplicant.status === "PENDING" ||
                  selectedApplicant.status === "VETTED") && (
                  <button
                    className="bg-red-500 hover:bg-red-600 text-white px-4 sm:px-6 py-2 rounded-lg flex items-center gap-2 transition-colors text-sm"
                    onClick={() =>
                      handleVetAction(selectedApplicant.id, "reject")
                    }
                  >
                    <XCircle className="w-4 h-4" />
                    Reject
                  </button>
                )}

                {selectedApplicant.status === "PENDING" && (
                  <button
                    className="bg-blue-500 hover:bg-blue-600 text-white px-4 sm:px-6 py-2 rounded-lg transition-colors text-sm"
                    onClick={() => handleMarkAsVetted(selectedApplicant.id)}
                  >
                    Mark as Vetted
                  </button>
                )}

                {selectedApplicant.status === "VETTED" && (
                  <button
                    className={`px-4 sm:px-6 py-2 rounded-lg flex items-center gap-2 transition-colors text-sm ${
                      selectedApplicant.showcasePhotos.length > 0 &&
                      selectedApplicant.videos.length > 0
                        ? "bg-green-500 hover:bg-green-600 text-white"
                        : "bg-gray-300 text-gray-500 cursor-not-allowed"
                    }`}
                    onClick={() =>
                      handleVetAction(selectedApplicant.id, "approve")
                    }
                    disabled={
                      selectedApplicant.showcasePhotos.length === 0 ||
                      selectedApplicant.videos.length === 0
                    }
                  >
                    <CheckCircle className="w-4 h-4" />
                    Approve
                  </button>
                )}

                {selectedApplicant.status === "APPROVED" && (
                  <button
                    className="bg-purple-600 hover:bg-purple-700 text-white px-4 sm:px-6 py-2 rounded-lg flex items-center gap-2 transition-colors text-sm"
                    onClick={() => handleHire(selectedApplicant.id)}
                  >
                    <CheckCircle className="w-4 h-4" />
                    Hire
                  </button>
                )}

                {selectedApplicant.status === "HIRED" && (
                  <button
                    className="bg-orange-500 hover:bg-orange-600 text-white px-4 sm:px-6 py-2 rounded-lg flex items-center gap-2 transition-colors text-sm"
                    onClick={() => handleRestore(selectedApplicant.id)}
                  >
                    <Clock className="w-4 h-4" />
                    Restore
                  </button>
                )}

                <button
                  className="bg-gray-500 hover:bg-gray-600 text-white px-4 sm:px-6 py-2 rounded-lg transition-colors text-sm"
                  onClick={() => setSelectedApplicant(null)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
