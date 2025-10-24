"use client";

import { useEffect, useState } from "react";
import api from "@/app/staff/auth/api";
import toast from "react-hot-toast";

import {
  Bell,
  CheckCircle,
  XCircle,
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

// Import the Local/International components
import LocalApplicant from "./LocalApplicant";
import InternationalApplicant from "./InternationalApplicant";

// API Base URL - update this to match your backend
const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000";

// Job Interest Map
const jobInterestMap = {
  LOCAL_JOBS: "Local Jobs",
  INTERNATIONAL_JOBS: "International Jobs",
};

export default function AdminBody() {
  const [applicants, setApplicants] = useState<any[]>([]);
  const [filteredApplicants, setFilteredApplicants] = useState<any[]>([]);
  const [searchInput, setSearchInput] = useState("");
  const [filterType, setFilterType] = useState<
    "All" | "Local" | "International"
  >("All");

  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedApplicant, setSelectedApplicant] = useState<any>(null);
  const [pendingShowcaseFile, setPendingShowcaseFile] = useState<File | null>(
    null
  );
  const [pendingShowcasePreviewUrl, setPendingShowcasePreviewUrl] = useState<
    string | null
  >(null);
  const [pendingVideoFile, setPendingVideoFile] = useState<File | null>(null);
  const [pendingVideoPreviewUrl, setPendingVideoPreviewUrl] = useState<
    string | null
  >(null);
  const [lastUpdatedAt, setLastUpdatedAt] = useState<Date | null>(null);

  // Stats
  const pendingCount = applicants.filter(
    (app) => app.status === "PENDING"
  ).length;
  const vettedCount = applicants.filter(
    (app) => app.status === "VETTED"
  ).length;
  const approvedCount = applicants.filter(
    (app) => app.status === "APPROVED"
  ).length;
  const rejectedCount = applicants.filter(
    (app) => app.status === "REJECTED"
  ).length;
  const hiredCount = applicants.filter((app) => app.status === "HIRED").length;

  // Local/International counts
  const localCount = applicants.filter((app) => app.type === "LOCAL").length;
  const internationalCount = applicants.filter(
    (app) => app.type === "INTERNATIONAL"
  ).length;

  const handleSearch = (value: string) => {
    setSearchInput(value);
  };

  const fetchApplicants = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get("/applicants");
      setApplicants(res.data);
      setLastUpdatedAt(new Date());
    } catch (err: any) {
      setError(err.message || "Something went wrong");
      toast.error("Failed to fetch applicants");
    } finally {
      setLoading(false);
    }
  };

  // Fetch applicants on mount
  useEffect(() => {
    fetchApplicants();
  }, []);

  // Filter applicants whenever searchInput, applicants, or filterType changes
  useEffect(() => {
    let filtered = applicants.filter(
      (app) =>
        app.fullName.toLowerCase().includes(searchInput.toLowerCase()) ||
        app.email.toLowerCase().includes(searchInput.toLowerCase()) ||
        app.phoneNumber.includes(searchInput)
    );

    if (filterType !== "All") {
      filtered = filtered.filter(
        (app) => app.type === filterType.toUpperCase()
      );
    }

    setFilteredApplicants(filtered);
  }, [applicants, searchInput, filterType]);

  // Cleanup preview URLs on unmount
  useEffect(() => {
    return () => {
      if (pendingShowcasePreviewUrl) {
        URL.revokeObjectURL(pendingShowcasePreviewUrl);
      }
      if (pendingVideoPreviewUrl) {
        URL.revokeObjectURL(pendingVideoPreviewUrl);
      }
    };
  }, [pendingShowcasePreviewUrl, pendingVideoPreviewUrl]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PENDING":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "VETTED":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "APPROVED":
        return "bg-green-100 text-green-800 border-green-200";
      case "REJECTED":
        return "bg-red-100 text-red-800 border-red-200";
      case "HIRED":
        return "bg-purple-100 text-purple-800 border-purple-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const handleVetAction = async (id: number, action: string) => {
    setActionLoading(true);
    try {
      await api.post(`/applicants/${id}/${action}`);
      toast.success(`Applicant ${action}ed successfully`);
      await fetchApplicants();
      setSelectedApplicant(null);
    } catch (err: any) {
      toast.error(err.message || `Failed to ${action} applicant`);
    } finally {
      setActionLoading(false);
    }
  };

  const handleMarkAsVetted = async (id: number) => {
    setActionLoading(true);
    try {
      await api.patch(`/applicants/${id}/status`, { status: "VETTED" });
      toast.success("Applicant marked as vetted");
      await fetchApplicants();
      setSelectedApplicant(null);
    } catch (err: any) {
      toast.error(err.message || "Failed to mark as vetted");
    } finally {
      setActionLoading(false);
    }
  };

  const approveWithUploads = async (id: number) => {
    setActionLoading(true);
    try {
      const formData = new FormData();

      if (pendingShowcaseFile) {
        formData.append("showcasePhoto", pendingShowcaseFile);
      }
      if (pendingVideoFile) {
        formData.append("video", pendingVideoFile);
      }

      await api.post(`/applicants/${id}/approve`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      toast.success("Applicant approved successfully");
      await fetchApplicants();
      setSelectedApplicant(null);
      setPendingShowcaseFile(null);
      setPendingShowcasePreviewUrl(null);
      setPendingVideoFile(null);
      setPendingVideoPreviewUrl(null);
    } catch (err: any) {
      toast.error(err.message || "Failed to approve applicant");
    } finally {
      setActionLoading(false);
    }
  };

  const handleHire = async (id: number) => {
    setActionLoading(true);
    try {
      await api.patch(`/applicants/${id}/status`, { status: "HIRED" });
      toast.success("Applicant hired successfully");
      await fetchApplicants();
      setSelectedApplicant(null);
    } catch (err: any) {
      toast.error(err.message || "Failed to hire applicant");
    } finally {
      setActionLoading(false);
    }
  };

  const handleRestore = async (id: number) => {
    setActionLoading(true);
    try {
      await api.patch(`/applicants/${id}/status`, { status: "APPROVED" });
      toast.success("Applicant restored successfully");
      await fetchApplicants();
      setSelectedApplicant(null);
    } catch (err: any) {
      toast.error(err.message || "Failed to restore applicant");
    } finally {
      setActionLoading(false);
    }
  };

  const handleSelectForPreview = (
    e: React.ChangeEvent<HTMLInputElement>,
    file: File,
    type: "showcasePhotos" | "videos"
  ) => {
    // Clean up previous preview URL
    if (type === "showcasePhotos" && pendingShowcasePreviewUrl) {
      URL.revokeObjectURL(pendingShowcasePreviewUrl);
    } else if (type === "videos" && pendingVideoPreviewUrl) {
      URL.revokeObjectURL(pendingVideoPreviewUrl);
    }

    if (type === "showcasePhotos") {
      setPendingShowcaseFile(file);
      setPendingShowcasePreviewUrl(URL.createObjectURL(file));
    } else if (type === "videos") {
      setPendingVideoFile(file);
      setPendingVideoPreviewUrl(URL.createObjectURL(file));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-yellow-50 p-3 sm:p-4 lg:p-6">
      {/* Header */}
      <header className="bg-white rounded-xl shadow-lg p-4 sm:p-6 mb-4 sm:mb-6 border border-purple-100">
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
                value={searchInput}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10 pr-4 py-2 border border-purple-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent w-full sm:w-64 text-sm"
              />
            </div>
            <div className="relative">
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 sm:h-6 sm:w-6 flex items-center justify-center">
                {pendingCount}
              </span>
              <button
                className="bg-yellow-400 hover:bg-yellow-500 text-purple-800 p-2 sm:p-3 rounded-lg transition-colors"
                disabled={actionLoading}
              >
                <Bell className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>
            </div>
            <button
              onClick={() => fetchApplicants()}
              className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-sm"
              disabled={loading}
            >
              {loading ? (
                <span className="h-4 w-4 rounded-full border-2 border-purple-300 border-t-white animate-spin" />
              ) : (
                <span className="inline-block">Refresh</span>
              )}
            </button>
          </div>
        </div>
        {lastUpdatedAt && (
          <div className="mt-2 text-xs text-gray-500">
            Last updated: {new Date(lastUpdatedAt).toLocaleTimeString()}
          </div>
        )}

        {/* Filter Toggle */}
        <div className="flex gap-2 mt-2">
          {["All", "Local", "International"].map((type) => (
            <button
              key={type}
              className={`px-3 py-1 rounded-lg text-sm ${
                filterType === type
                  ? "bg-purple-600 text-white"
                  : "bg-purple-100 text-purple-800"
              }`}
              onClick={() => setFilterType(type as any)}
            >
              {type}
            </button>
          ))}
        </div>
      </header>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg mb-4">
          {error}
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-3 lg:grid-cols-7 gap-3 sm:gap-4 lg:gap-6 mb-4 sm:mb-6">
        {/* Original stats */}
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
        <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 border-l-4 border-purple-400">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-xs sm:text-sm">Hired</p>
              <p className="text-xl sm:text-2xl font-bold text-purple-600">
                {hiredCount}
              </p>
            </div>
            <CheckCheckIcon className="w-6 h-6 sm:w-8 sm:h-8 text-purple-400" />
          </div>
        </div>

        {/* Local/International counts */}
        <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 border-l-4 border-indigo-400">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-xs sm:text-sm">Local</p>
              <p className="text-xl sm:text-2xl font-bold text-indigo-600">
                {localCount}
              </p>
            </div>
            <Users className="w-6 h-6 sm:w-8 sm:h-8 text-indigo-400" />
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 border-l-4 border-pink-400">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-xs sm:text-sm">International</p>
              <p className="text-xl sm:text-2xl font-bold text-pink-600">
                {internationalCount}
              </p>
            </div>
            <Users className="w-6 h-6 sm:w-8 sm:h-8 text-pink-400" />
          </div>
        </div>
      </div>

      {/* Applicants Table */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-purple-100">
        <div className="bg-gradient-to-r from-purple-600 to-purple-700 px-4 sm:px-6 py-3 sm:py-4">
          <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
            <Users className="w-4 h-4 sm:w-5 sm:h-5" />
            Applications ({filteredApplicants.length})
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
                  Type
                </th>
                <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-semibold text-purple-800">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredApplicants.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-6 py-8 text-center text-gray-500"
                  >
                    {loading ? "Loading applicants..." : "No applicants found"}
                  </td>
                </tr>
              ) : (
                filteredApplicants.map((app) => (
                  <tr
                    key={app.id}
                    className="hover:bg-purple-50 transition-colors"
                  >
                    <td className="px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm text-gray-900 font-medium">
                      #{app.id}
                    </td>
                    <td className="px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm text-gray-900 font-medium">
                      {app.fullName}
                    </td>
                    <td className="hidden sm:table-cell px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm text-gray-900">
                      {app.email}
                    </td>
                    <td className="hidden lg:table-cell px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm text-gray-900">
                      {app.phoneNumber}
                    </td>
                    <td className="px-3 sm:px-6 py-3 sm:py-4">
                      <span
                        className={`inline-flex items-center px-2 py-1 rounded-full border text-xs font-medium ${getStatusBadge(
                          app.status
                        )}`}
                      >
                        {app.status}
                      </span>
                    </td>
                    <td className="px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm text-gray-900 font-medium">
                      {app.type}
                    </td>
                    <td className="px-3 sm:px-6 py-3 sm:py-4">
                      <button
                        onClick={() => setSelectedApplicant(app)}
                        className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-1 rounded text-xs"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))
              )}
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
                    {selectedApplicant.showcasePhotos?.length > 0 && (
                      <div className="space-y-2">
                        <h4 className="font-medium text-gray-700 flex items-center gap-2 text-sm sm:text-base">
                          <ImageIcon className="w-4 h-4" />
                          Showcase Photos
                        </h4>
                        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-2 gap-2 sm:gap-4">
                          {selectedApplicant.showcasePhotos.map(
                            (photo: string, index: number) => (
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
                    {selectedApplicant.videos?.length > 0 && (
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
                selectedApplicant.passportPhotos?.length > 0 && (
                  <div className="flex justify-center">
                    <img
                      src={`${API_BASE}${selectedApplicant.passportPhotos[0]}`}
                      alt="Passport Photo"
                      className="w-32 h-32 sm:w-40 sm:h-40 object-cover rounded-xl shadow-lg"
                    />
                  </div>
                )}

              {!selectedApplicant.showcasePhotos?.length &&
                !selectedApplicant.passportPhotos?.length && (
                  <div className="w-32 h-32 sm:w-40 sm:h-40 bg-gray-100 rounded-xl flex items-center justify-center mx-auto">
                    <ImageIcon className="w-8 h-8 sm:w-12 sm:h-12 text-gray-400" />
                  </div>
                )}

              {/* Applicant Documents Section */}
              {(selectedApplicant.resumes?.length > 0 ||
                selectedApplicant.birthCertificates?.length > 0 ||
                selectedApplicant.goodConducts?.length > 0) && (
                <div className="space-y-2">
                  <h3 className="text-base sm:text-lg font-semibold text-purple-800 border-b border-purple-200 pb-2">
                    Applicant Documents
                  </h3>
                  {selectedApplicant.resumes?.length > 0 && (
                    <div className="space-y-2">
                      <p className="font-medium text-purple-700 text-sm">
                        Resumes
                      </p>
                      {selectedApplicant.resumes.map(
                        (file: string, idx: number) => (
                          <a
                            key={idx}
                            href={`${API_BASE}${file}`}
                            download={`resume-${idx + 1}`}
                            className="block bg-gray-50 hover:bg-gray-100 px-3 py-2 rounded-lg text-sm text-purple-800"
                          >
                            Download Resume {idx + 1}
                          </a>
                        )
                      )}
                    </div>
                  )}

                  {/* Birth Certificate */}
                  {selectedApplicant.birthCertificates?.length > 0 && (
                    <div className="space-y-2">
                      <p className="font-medium text-purple-700 text-sm">
                        Birth Certificate
                      </p>
                      {selectedApplicant.birthCertificates.map(
                        (file: string, idx: number) => (
                          <a
                            key={idx}
                            href={`${API_BASE}${file}`}
                            download={`birth-certificate-${idx + 1}`}
                            className="block bg-gray-50 hover:bg-gray-100 px-3 py-2 rounded-lg text-sm text-purple-800"
                          >
                            Download Birth Certificate {idx + 1}
                          </a>
                        )
                      )}
                    </div>
                  )}

                  {/* Good Conduct */}
                  {selectedApplicant.goodConducts?.length > 0 && (
                    <div className="space-y-2">
                      <p className="font-medium text-purple-700 text-sm">
                        Good Conduct
                      </p>
                      {selectedApplicant.goodConducts.map(
                        (file: string, idx: number) => (
                          <a
                            key={idx}
                            href={`${API_BASE}${file}`}
                            download={`good-conduct-${idx + 1}`}
                            className="block bg-gray-50 hover:bg-gray-100 px-3 py-2 rounded-lg text-sm text-purple-800"
                          >
                            Download Good Conduct {idx + 1}
                          </a>
                        )
                      )}
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
                      {selectedApplicant.languages?.join(", ") || "N/A"}
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
              {selectedApplicant?.status === "VETTED" && (
                <div className="bg-yellow-50 rounded-lg p-3 sm:p-4 border border-yellow-200">
                  <h3 className="text-base sm:text-lg font-semibold text-yellow-800 mb-3">
                    Upload Showcase Media
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    {/* Select Showcase Photo */}
                    <div
                      className={`flex items-center gap-2 sm:gap-3 bg-white p-2 sm:p-3 rounded-lg border-2 border-dashed ${
                        actionLoading
                          ? "border-gray-300 opacity-50"
                          : "border-yellow-300"
                      }`}
                    >
                      <Upload className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-600" />
                      <label className="cursor-pointer text-xs sm:text-sm text-gray-700">
                        {pendingShowcaseFile
                          ? "Change Showcase Photo"
                          : "Select Showcase Photo"}
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          disabled={actionLoading}
                          onChange={(e) =>
                            e.target.files?.[0] &&
                            handleSelectForPreview(
                              e,
                              e.target.files[0],
                              "showcasePhotos"
                            )
                          }
                        />
                      </label>
                    </div>

                    {/* Select Video */}
                    <div
                      className={`flex items-center gap-2 sm:gap-3 bg-white p-2 sm:p-3 rounded-lg border-2 border-dashed ${
                        actionLoading
                          ? "border-gray-300 opacity-50"
                          : "border-yellow-300"
                      }`}
                    >
                      <Video className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-600" />
                      <label className="cursor-pointer text-xs sm:text-sm text-gray-700">
                        {pendingVideoFile ? "Change Video" : "Select Video"}
                        <input
                          type="file"
                          accept="video/*"
                          className="hidden"
                          disabled={actionLoading}
                          onChange={(e) =>
                            e.target.files?.[0] &&
                            handleSelectForPreview(
                              e,
                              e.target.files[0],
                              "videos"
                            )
                          }
                        />
                      </label>
                    </div>
                  </div>

                  {/* Previews */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mt-3">
                    {/* Photo preview (pending or existing) */}
                    <div className="space-y-2">
                      <h4 className="font-medium text-gray-700 flex items-center gap-2 text-sm sm:text-base">
                        <ImageIcon className="w-4 h-4" />
                        Photo Preview
                      </h4>
                      {pendingShowcasePreviewUrl ? (
                        <img
                          src={pendingShowcasePreviewUrl}
                          alt="Selected showcase preview"
                          className="w-full aspect-square object-cover rounded-lg shadow-md"
                        />
                      ) : selectedApplicant.showcasePhotos?.length > 0 ? (
                        <img
                          src={`${API_BASE}${selectedApplicant.showcasePhotos[0]}`}
                          alt="Existing showcase"
                          className="w-full aspect-square object-cover rounded-lg shadow-md"
                        />
                      ) : (
                        <div className="w-full aspect-square bg-gray-100 rounded-lg flex items-center justify-center">
                          <span className="text-gray-400 text-sm">
                            No photo selected
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Video preview (pending or existing) */}
                    <div className="space-y-2">
                      <h4 className="font-medium text-gray-700 flex items-center gap-2 text-sm sm:text-base">
                        <Video className="w-4 h-4" />
                        Video Preview
                      </h4>
                      {pendingVideoPreviewUrl ? (
                        <video
                          className="w-full aspect-video rounded-lg shadow-md"
                          controls
                        >
                          <source src={pendingVideoPreviewUrl} />
                        </video>
                      ) : selectedApplicant.videos?.length > 0 ? (
                        <video
                          className="w-full aspect-video rounded-lg shadow-md"
                          controls
                        >
                          <source
                            src={`${API_BASE}${selectedApplicant.videos[0]}`}
                          />
                        </video>
                      ) : (
                        <div className="w-full aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
                          <span className="text-gray-400 text-sm">
                            No video selected
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-4 pt-4 sm:pt-6 border-t border-gray-200">
                {(selectedApplicant.status === "PENDING" ||
                  selectedApplicant.status === "VETTED") && (
                  <button
                    className="bg-red-500 hover:bg-red-600 text-white px-4 sm:px-6 py-2 rounded-lg flex items-center justify-center gap-2 transition-colors text-sm disabled:opacity-50"
                    onClick={() =>
                      handleVetAction(selectedApplicant.id, "reject")
                    }
                    disabled={actionLoading}
                  >
                    <XCircle className="w-4 h-4" />
                    {actionLoading ? "Processing..." : "Reject"}
                  </button>
                )}

                {selectedApplicant.status === "PENDING" && (
                  <button
                    className="bg-blue-500 hover:bg-blue-600 text-white px-4 sm:px-6 py-2 rounded-lg transition-colors text-sm disabled:opacity-50"
                    onClick={() => handleMarkAsVetted(selectedApplicant.id)}
                    disabled={actionLoading}
                  >
                    {actionLoading ? "Processing..." : "Mark as Vetted"}
                  </button>
                )}

                {selectedApplicant.status === "VETTED" && (
                  <button
                    onClick={() => approveWithUploads(selectedApplicant.id)}
                    disabled={
                      actionLoading ||
                      // Require at least one of: pending or existing for each type
                      !(
                        (pendingShowcaseFile ||
                          selectedApplicant.showcasePhotos?.length > 0) &&
                        (pendingVideoFile ||
                          selectedApplicant.videos?.length > 0)
                      )
                    }
                    className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg disabled:opacity-50 text-sm"
                  >
                    {actionLoading ? "Processing..." : "Approve"}
                  </button>
                )}

                {selectedApplicant.status === "APPROVED" && (
                  <button
                    className="bg-purple-600 hover:bg-purple-700 text-white px-4 sm:px-6 py-2 rounded-lg flex items-center justify-center gap-2 transition-colors text-sm disabled:opacity-50"
                    onClick={() => handleHire(selectedApplicant.id)}
                    disabled={actionLoading}
                  >
                    <CheckCircle className="w-4 h-4" />
                    {actionLoading ? "Processing..." : "Hire"}
                  </button>
                )}

                {selectedApplicant.status === "HIRED" && (
                  <button
                    className="bg-orange-500 hover:bg-orange-600 text-white px-4 sm:px-6 py-2 rounded-lg flex items-center justify-center gap-2 transition-colors text-sm disabled:opacity-50"
                    onClick={() => handleRestore(selectedApplicant.id)}
                    disabled={actionLoading}
                  >
                    <Clock className="w-4 h-4" />
                    {actionLoading ? "Processing..." : "Restore"}
                  </button>
                )}

                <button
                  className="bg-gray-500 hover:bg-gray-600 text-white px-4 sm:px-6 py-2 rounded-lg transition-colors text-sm"
                  onClick={() => {
                    setSelectedApplicant(null);
                    setPendingShowcaseFile(null);
                    setPendingShowcasePreviewUrl(null);
                    setPendingVideoFile(null);
                    setPendingVideoPreviewUrl(null);
                  }}
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
