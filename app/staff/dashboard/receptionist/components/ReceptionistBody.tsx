"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import api from "@/app/staff/auth/api";
import toast from "react-hot-toast";

import {
  Search,
  Users,
  CheckCircle,
  XCircle,
  Clock,
  FileText,
  Image as ImageIcon,
  Video,
  Download,
  Eye,
  Phone,
  Mail,
  MapPin,
  Calendar,
  User,
  Briefcase,
  Globe,
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
  status: "PENDING" | "VETTED" | "APPROVED" | "REJECTED";
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

export default function ReceptionistBodySection() {
  const [applicants, setApplicants] = useState<Applicant[]>([]);
  const [filteredApplicants, setFilteredApplicants] = useState<Applicant[]>([]);
  const [selectedApplicant, setSelectedApplicant] = useState<Applicant | null>(
    null
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const resumeLabels = ["Resume", "Birth Certificate", "Good Conduct"];
  const [previewMedia, setPreviewMedia] = useState<{
    type: "image" | "video" | "pdf";
    src: string;
    name?: string;
  } | null>(null);

  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdatedAt, setLastUpdatedAt] = useState<number | null>(null);
  const pollingTimerRef = useRef<NodeJS.Timeout | null>(null);
  const currentIntervalMsRef = useRef<number>(30000);
  const abortControllerRef = useRef<AbortController | null>(null);

  const API_BASE = process.env.NEXT_PUBLIC_API_BASE;

  //Fetch Applicants with abort + error handling
  const fetchApplicants = async (opts?: { silent?: boolean }) => {
    try {
      if (!opts?.silent) setLoading(true);
      setError(null);
      abortControllerRef.current?.abort();
      const controller = new AbortController();
      abortControllerRef.current = controller;
      const res = await api.get<Applicant[]>(`${API_BASE}/api/applications`, {
        signal: controller.signal as any,
      });
      setApplicants(res.data || []);
      setLastUpdatedAt(Date.now());
      // reset backoff on success
      currentIntervalMsRef.current = 30000;
    } catch (err: any) {
      if (err?.name === "CanceledError" || err?.name === "AbortError") {
        return; // ignore aborted requests
      }
      console.error(err);
      setError(err?.message || "Failed to load applicants");
      // backoff on error up to 2 min
      currentIntervalMsRef.current = Math.min(
        currentIntervalMsRef.current * 2,
        120000
      );
    } finally {
      if (!opts?.silent) setLoading(false);
    }
  };

  // initial load
  useEffect(() => {
    fetchApplicants();
  }, []);

  // debounce search input -> searchQuery
  useEffect(() => {
    const t = setTimeout(() => setSearchQuery(searchInput), 250);
    return () => clearTimeout(t);
  }, [searchInput]);

  // derived filtering
  useEffect(() => {
    let filtered = applicants;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (app) =>
          app.fullName.toLowerCase().includes(q) ||
          app.email.toLowerCase().includes(q) ||
          app.phoneNumber.includes(searchQuery)
      );
    }
    if (statusFilter !== "ALL") {
      filtered = filtered.filter((app) => app.status === statusFilter);
    }
    setFilteredApplicants(filtered);
  }, [applicants, searchQuery, statusFilter]);

  // polling with visibility awareness
  useEffect(() => {
    const schedule = () => {
      if (pollingTimerRef.current) clearTimeout(pollingTimerRef.current);
      pollingTimerRef.current = setTimeout(() => {
        if (document.visibilityState === "visible") {
          fetchApplicants({ silent: true });
        }
        schedule();
      }, currentIntervalMsRef.current);
    };
    schedule();
    const onVis = () => {
      if (document.visibilityState === "visible") {
        fetchApplicants({ silent: true });
      }
    };
    document.addEventListener("visibilitychange", onVis);
    return () => {
      document.removeEventListener("visibilitychange", onVis);
      if (pollingTimerRef.current) clearTimeout(pollingTimerRef.current);
      abortControllerRef.current?.abort();
    };
  }, []);

  const handleDownload = (url: string, filename: string) => {
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.click();
  };

  // Search input handler (debounced)
  const handleSearch = (query: string) => {
    setSearchInput(query);
  };

  const handleStatusFilter = (status: string) => {
    setStatusFilter(status);
  };

  // Soft delete applicant (frontend only)
  const handleSoftDelete = (id: number) => {
    if (
      !confirm("Are you sure you want to remove this applicant from the view?")
    ) {
      return;
    }

    // Remove from applicants list (frontend only)
    setApplicants((prev) => prev.filter((app) => app.id !== id));
    setSelectedApplicant(null);
    toast.success("Applicant removed from view");
  };

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
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "APPROVED":
        return <CheckCircle className="w-4 h-4" />;
      case "REJECTED":
        return <XCircle className="w-4 h-4" />;
      case "VETTED":
        return <CheckCircle className="w-4 h-4" />;
      case "PENDING":
        return <Clock className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-yellow-50 p-3 sm:p-4 lg:p-6">
      {/* Header */}
      <header className="bg-white rounded-xl shadow-lg p-4 sm:p-6 mb-4 sm:mb-6 border border-purple-100">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-purple-800 mb-2">
              Receptionist Portal
            </h1>
            <p className="text-gray-600 text-sm sm:text-base">
              Search and view applicant information and status
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
            <select
              value={statusFilter}
              onChange={(e) => handleStatusFilter(e.target.value)}
              className="px-3 sm:px-4 py-2 border border-purple-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
            >
              <option value="ALL">All Status</option>
              <option value="PENDING">Pending</option>
              <option value="VETTED">Vetted</option>
              <option value="APPROVED">Approved</option>
              <option value="REJECTED">Rejected</option>
            </select>
            <button
              onClick={() => fetchApplicants()}
              className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-sm"
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
      </header>

      {/* Results Count */}
      <div className="bg-white rounded-lg shadow-md p-3 sm:p-4 mb-4 sm:mb-6 border border-purple-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600" />
            <span className="text-gray-700 text-sm sm:text-base">
              Found {filteredApplicants.length} applicant
              {filteredApplicants.length !== 1 ? "s" : ""}
            </span>
          </div>
          <div className="text-xs text-gray-500 hidden sm:block">
            Auto-refreshing every ~
            {Math.round(currentIntervalMsRef.current / 1000)}s
          </div>
        </div>
      </div>

      {/* States */}
      {loading && applicants.length === 0 && (
        <div className="flex items-center justify-center py-16">
          <div className="flex items-center gap-3 text-purple-700">
            <span className="h-5 w-5 rounded-full border-2 border-purple-300 border-top-purple-700 animate-spin" />
            <span className="font-medium">Loading…</span>
          </div>
        </div>
      )}
      {!loading && error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 mb-4">
          <div className="flex items-start gap-3">
            <span className="mt-1">⚠️</span>
            <div>
              <p className="font-semibold">Failed to load applicants</p>
              <p className="text-sm">{error}</p>
              <button
                onClick={() => fetchApplicants()}
                className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-red-600 text-white hover:bg-red-700"
              >
                Retry
              </button>
            </div>
          </div>
        </div>
      )}
      {!loading && !error && filteredApplicants.length === 0 && (
        <div className="bg-purple-50 border border-purple-200 text-purple-800 rounded-xl p-6 mb-4">
          <p className="font-semibold">No applicants found</p>
          <p className="text-sm mt-1">
            Try changing your search or status filter.
          </p>
        </div>
      )}

      {/* Applicants List */}
      <div className="space-y-3 sm:space-y-4">
        {filteredApplicants.map((applicant) => (
          <div
            key={applicant.id}
            className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow cursor-pointer border border-purple-100"
            onClick={() => setSelectedApplicant(applicant)}
          >
            <div className="p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
                <div className="flex items-center gap-3 sm:gap-4">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <User className="w-6 h-6 sm:w-8 sm:h-8 text-purple-600" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900 truncate">
                      {applicant.fullName}
                    </h3>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 text-xs sm:text-sm text-gray-600 mt-1">
                      <span className="flex items-center gap-1">
                        <Mail className="w-3 h-3 sm:w-4 sm:h-4" />
                        <span className="truncate">{applicant.email}</span>
                      </span>
                      <span className="hidden sm:inline">•</span>
                      <span className="flex items-center gap-1">
                        <Phone className="w-3 h-3 sm:w-4 sm:h-4" />
                        {applicant.phoneNumber}
                      </span>
                      <span className="hidden sm:inline">•</span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 sm:w-4 sm:h-4" />
                        {applicant.currentLocation}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 sm:gap-4">
                  <span
                    className={`inline-flex items-center gap-1 px-2 sm:px-3 py-1 rounded-full text-xs font-medium border ${getStatusBadge(
                      applicant.status
                    )}`}
                  >
                    {getStatusIcon(applicant.status)}
                    <span className="hidden sm:inline">{applicant.status}</span>
                  </span>
                  <button className="bg-purple-600 hover:bg-purple-700 text-white px-3 sm:px-4 py-1 sm:py-2 rounded-lg text-xs sm:text-sm transition-colors">
                    View Details
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Detailed Modal */}
      {selectedApplicant && (
        <div
          className="fixed inset-0 flex items-center justify-center bg-black/50 z-50 p-2 sm:p-4"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto border border-purple-100">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-purple-600 to-purple-700 px-4 sm:px-6 py-3 sm:py-4 rounded-t-2xl">
              <div className="flex justify-between items-center">
                <h2 className="text-lg sm:text-xl font-bold text-white">
                  Applicant Details: {selectedApplicant.fullName}
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
              {/* Status Banner */}
              <div
                className={`p-3 sm:p-4 rounded-lg border ${getStatusBadge(
                  selectedApplicant.status
                )}`}
              >
                <div className="flex items-center gap-2">
                  {getStatusIcon(selectedApplicant.status)}
                  <span className="font-semibold text-sm sm:text-base">
                    Status: {selectedApplicant.status}
                  </span>
                </div>
              </div>

              {/* Personal Information */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                <div className="space-y-3 sm:space-y-4">
                  <h3 className="text-base sm:text-lg font-semibold text-purple-800 border-b border-purple-200 pb-2">
                    Personal Information
                  </h3>
                  <div className="space-y-2 sm:space-y-3">
                    <div className="flex items-center gap-2 sm:gap-3">
                      <User className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600" />
                      <div>
                        <p className="text-xs sm:text-sm text-gray-900">
                          Full Name
                        </p>
                        <p className="font-medium text-sm text-gray-700 sm:text-base">
                          {selectedApplicant.fullName}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 sm:gap-3">
                      <Mail className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600" />
                      <div>
                        <p className="text-xs sm:text-sm text-gray-900">
                          Email
                        </p>
                        <p className="font-medium text-sm text-gray-700 sm:text-base">
                          {selectedApplicant.email}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 sm:gap-3">
                      <Phone className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600" />
                      <div>
                        <p className="text-xs sm:text-sm text-gray-900">
                          Phone
                        </p>
                        <p className="font-medium text-sm text-gray-700 sm:text-base">
                          {selectedApplicant.phoneNumber}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 sm:gap-3">
                      <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600" />
                      <div>
                        <p className="text-xs sm:text-sm text-gray-900">
                          Date of Birth
                        </p>
                        <p className="font-medium text-sm text-gray-700 sm:text-base">
                          {selectedApplicant.dob || "N/A"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 sm:gap-3">
                      <User className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600" />
                      <div>
                        <p className="text-xs sm:text-sm text-gray-900">Age</p>
                        <p className="font-medium text-sm text-gray-700 sm:text-base">
                          {selectedApplicant.age || "N/A"} years
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-3 sm:space-y-4">
                  <h3 className="text-base sm:text-lg font-semibold text-purple-800 border-b border-purple-200 pb-2">
                    Professional Details
                  </h3>
                  <div className="space-y-2 sm:space-y-3">
                    <div className="flex items-center gap-2 sm:gap-3">
                      <Briefcase className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600" />
                      <div>
                        <p className="text-xs sm:text-sm text-gray-900">
                          Current Profession
                        </p>
                        <p className="font-medium text-sm text-gray-700 sm:text-base">
                          {selectedApplicant.currentProfession || "N/A"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 sm:gap-3">
                      <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600" />
                      <div>
                        <p className="text-xs sm:text-sm text-gray-900">
                          Location
                        </p>
                        <p className="font-medium text-sm text-gray-700 sm:text-base">
                          {selectedApplicant.currentLocation || "N/A"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 sm:gap-3">
                      <Briefcase className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600" />
                      <div>
                        <p className="text-xs sm:text-sm text-gray-900">
                          Experience
                        </p>
                        <p className="font-medium text-sm text-gray-700 sm:text-base">
                          {selectedApplicant.experience || "N/A"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 sm:gap-3">
                      <Globe className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600" />
                      <div>
                        <p className="text-xs sm:text-sm text-gray-900">
                          Languages
                        </p>
                        <p className="font-medium text-sm text-gray-700 sm:text-base">
                          {selectedApplicant.languages.join(", ")}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 sm:gap-3">
                      <Briefcase className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600" />
                      <div>
                        <p className="text-xs sm:text-sm text-gray-900">
                          Job Interest
                        </p>
                        <p className="font-medium text-sm text-gray-700 sm:text-base">
                          {selectedApplicant.jobInterest
                            ? selectedApplicant.jobInterest
                                .replace(/_/g, " ")
                                .toLowerCase()
                                .replace(/\b\w/g, (c) => c.toUpperCase())
                            : "N/A"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Media Files Section */}
              <div className="space-y-3 sm:space-y-4">
                <h3 className="text-base sm:text-lg font-semibold text-purple-800 border-b border-purple-200 pb-2">
                  Media Files
                </h3>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
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
                                onClick={() =>
                                  setPreviewMedia({
                                    type: "image",
                                    src: `${API_BASE}${photo}`,
                                  })
                                }
                                className="w-full aspect-square object-cover rounded-lg shadow-md cursor-pointer transition-transform duration-200 hover:scale-105"
                              />
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  )}

                  {/* Single Video Preview */}
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
                          src={`${API_BASE}${selectedApplicant.videos[0]}`}
                        >
                          Your browser does not support the video tag.
                        </video>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* All Files Section */}
              <div className="space-y-3 sm:space-y-4">
                <h3 className="text-base sm:text-lg font-semibold text-purple-800 border-b border-purple-200 pb-2">
                  All Documents & Files
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  {/* Passport Photos */}
                  {selectedApplicant.passportPhotos.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="font-medium text-gray-700 flex items-center gap-2 text-sm sm:text-base">
                        <ImageIcon className="w-4 h-4" />
                        Passport Photos (
                        {selectedApplicant.passportPhotos.length})
                      </h4>
                      <div className="grid grid-cols-2 gap-2">
                        {selectedApplicant.passportPhotos.map(
                          (photo, index) => (
                            <div key={index} className="relative group">
                              <img
                                src={`${API_BASE}${photo}`}
                                alt={`Passport ${index + 1}`}
                                onClick={() =>
                                  setPreviewMedia({
                                    type: "image",
                                    src: `${API_BASE}${photo}`,
                                  })
                                }
                                className="w-full aspect-square object-cover rounded-lg shadow-md cursor-pointer transition-transform duration-200 hover:scale-105"
                              />
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  )}
                  {/* Full Photos */}
                  {selectedApplicant.fullPhotos.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="font-medium text-gray-700 flex items-center gap-2 text-sm sm:text-base">
                        <ImageIcon className="w-4 h-4" />
                        Full Photos ({selectedApplicant.fullPhotos.length})
                      </h4>
                      <div className="grid grid-cols-2 gap-2">
                        {selectedApplicant.fullPhotos.map((photo, index) => (
                          <div key={index} className="relative group">
                            <img
                              src={`${API_BASE}${photo}`}
                              alt={`Full ${index + 1}`}
                              onClick={() =>
                                setPreviewMedia({
                                  type: "image",
                                  src: `${API_BASE}${photo}`,
                                })
                              }
                              className="w-full aspect-square object-cover rounded-lg shadow-md cursor-pointer transition-transform duration-200 hover:scale-105"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {/* National ID Photos */}
                  {selectedApplicant.nationalIdPhotos.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="font-medium text-gray-700 flex items-center gap-2 text-sm sm:text-base">
                        <FileText className="w-4 h-4" />
                        National ID Photos (
                        {selectedApplicant.nationalIdPhotos.length})
                      </h4>
                      <div className="grid grid-cols-2 gap-2">
                        {selectedApplicant.nationalIdPhotos.map(
                          (photo, index) => (
                            <div key={index} className="relative group">
                              <img
                                src={`${API_BASE}${photo}`}
                                alt={`National Id ${index + 1}`}
                                onClick={() =>
                                  setPreviewMedia({
                                    type: "image",
                                    src: `${API_BASE}${photo}`,
                                  })
                                }
                                className="w-full aspect-square object-cover rounded-lg shadow-md cursor-pointer transition-transform duration-200 hover:scale-105"
                              />
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  )}

                  {/* All Applicant Documents */}
                  {(selectedApplicant.resumes.length > 0 ||
                    selectedApplicant.birthCertificates.length > 0 ||
                    selectedApplicant.goodConducts.length > 0) && (
                    <div className="space-y-2">
                      <h3 className="text-base sm:text-lg font-semibold text-purple-800 border-b border-purple-200 pb-2">
                        Applicant Documents
                      </h3>

                      {/* Resumes */}
                      {selectedApplicant.resumes.length > 0 && (
                        <div className="space-y-2">
                          <p className="font-medium text-purple-700 text-sm">
                            Resume
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

                      {/* Birth Certificates */}
                      {selectedApplicant.birthCertificates.length > 0 && (
                        <div className="space-y-2">
                          <p className="font-medium text-purple-700 text-sm">
                            Birth Certificate
                          </p>
                          {selectedApplicant.birthCertificates.map(
                            (file, idx) => (
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
                      {selectedApplicant.goodConducts.length > 0 && (
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
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-2 sm:gap-4 pt-4 sm:pt-6 border-t border-gray-200">
                <button
                  className="bg-red-500 hover:bg-red-600 text-white px-4 sm:px-6 py-2 rounded-lg flex items-center gap-2 transition-colors text-sm"
                  onClick={() => handleSoftDelete(selectedApplicant.id)}
                >
                  <XCircle className="w-4 h-4" />
                  Remove from View
                </button>
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
