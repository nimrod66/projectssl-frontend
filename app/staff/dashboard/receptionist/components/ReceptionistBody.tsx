"use client";

import { useEffect, useRef, useState } from "react";
import api from "@/app/staff/auth/api";

import {
  Search,
  Users,
  CheckCircle,
  XCircle,
  Clock,
  User,
  Globe,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  Calendar,
  Languages,
  DollarSign,
  X,
  Download,
  RefreshCw,
  FileText,
  Image as ImageIcon,
  Video,
  Eye,
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

interface InternationalApplicants {
  id: number;
  fullName: string;
  email: string;
  phoneNumber: string;
  dob?: string;
  age?: number;
  nationality?: string;
  religion?: string;
  maritalStatus?: number;
  numberOfKids?: string;
  educationLevel?: string | string[];
  currentProfession?: string;
  currentSalary?: number;
  currentLocation?: string;
  languages?: string[];
  employmentStatus?: string;
  jobRecruitment?: string | string[];
  status: "PENDING" | "VETTED" | "APPROVED" | "REJECTED";
  createdAt?: string;
  updatedAt?: string;
  passportPhotos?: string[];
  fullPhotos?: string[];
  nationalIdPhotos?: string[];
  resumes?: string[];
  birthCertificates?: string[];
  goodConducts?: string[];
  videos?: string[];
  showcasePhotos?: string[];
}

export default function ReceptionistBodySection() {
  const [domesticApplicants, setDomesticApplicants] = useState<Applicant[]>([]);
  const [internationalApplicants, setInternationalApplicants] = useState<
    InternationalApplicants[]
  >([]);
  const [filteredDomestic, setFilteredDomestic] = useState<Applicant[]>([]);
  const [filteredInternational, setFilteredInternational] = useState<
    InternationalApplicants[]
  >([]);
  const [selectedApplicant, setSelectedApplicant] = useState<
    Applicant | InternationalApplicants | null
  >(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [previewMedia, setPreviewMedia] = useState<{
    type: "image" | "video" | "pdf" | "youtube";
    src: string;
    name?: string;
  } | null>(null);
  const [activeTab, setActiveTab] = useState<"LOCAL" | "INTERNATIONAL">(
    "LOCAL"
  );
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdatedAt, setLastUpdatedAt] = useState<number | null>(null);
  const pollingTimerRef = useRef<NodeJS.Timeout | null>(null);
  const currentIntervalMsRef = useRef<number>(30000);
  const abortControllerRef = useRef<AbortController | null>(null);

  const API_BASE = process.env.NEXT_PUBLIC_API_BASE;

  const fetchApplicants = async (opts?: { silent?: boolean }) => {
    try {
      if (!opts?.silent) setLoading(true);
      setError(null);
      abortControllerRef.current?.abort();
      const controller = new AbortController();
      abortControllerRef.current = controller;

      const [domesticRes, internationalRes] = await Promise.all([
        api.get<Applicant[]>(`/api/applications`, {
          signal: controller.signal as any,
        }),
        api.get<InternationalApplicants[]>(`/api/international`, {
          signal: controller.signal as any,
        }),
      ]);

      setDomesticApplicants(domesticRes.data || []);
      setInternationalApplicants(internationalRes.data || []);
      setLastUpdatedAt(Date.now());
      currentIntervalMsRef.current = 30000; // reset backoff on success
    } catch (err: any) {
      if (err?.name === "CanceledError" || err?.name === "AbortError") return;
      console.error(err);
      setError(err?.message || "Failed to load applicants");
      currentIntervalMsRef.current = Math.min(
        currentIntervalMsRef.current * 2,
        120000
      );
    } finally {
      if (!opts?.silent) setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplicants();
  }, []);

  useEffect(() => {
    const t = setTimeout(() => setSearchQuery(searchInput), 250);
    return () => clearTimeout(t);
  }, [searchInput]);

  useEffect(() => {
    const filter = (apps: Applicant[] | InternationalApplicants[]) => {
      let filtered = apps;
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
      return filtered;
    };
    setFilteredDomestic(filter(domesticApplicants) as Applicant[]);
    setFilteredInternational(
      filter(internationalApplicants) as InternationalApplicants[]
    );
  }, [domesticApplicants, internationalApplicants, searchQuery, statusFilter]);

  // Polling with visibility awareness
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
      if (document.visibilityState === "visible")
        fetchApplicants({ silent: true });
    };
    document.addEventListener("visibilitychange", onVis);
    return () => {
      document.removeEventListener("visibilitychange", onVis);
      if (pollingTimerRef.current) clearTimeout(pollingTimerRef.current);
      abortControllerRef.current?.abort();
    };
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "APPROVED":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "REJECTED":
        return "bg-rose-50 text-rose-700 border-rose-200";
      case "VETTED":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "PENDING":
        return "bg-amber-50 text-amber-700 border-amber-200";
      default:
        return "bg-gray-50 text-gray-700 border-gray-200";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "APPROVED":
        return <CheckCircle className="w-3.5 h-3.5" />;
      case "REJECTED":
        return <XCircle className="w-3.5 h-3.5" />;
      case "VETTED":
        return <CheckCircle className="w-3.5 h-3.5" />;
      case "PENDING":
        return <Clock className="w-3.5 h-3.5" />;
      default:
        return <Clock className="w-3.5 h-3.5" />;
    }
  };

  const displayedApplicants =
    activeTab === "LOCAL" ? filteredDomestic : filteredInternational;

  const youtubeEmbedUrl = (url: string) => {
    const match = url.match(/(?:youtu\.be\/|youtube\.com\/watch\?v=)([\w-]+)/);
    return match ? `https://www.youtube.com/embed/${match[1]}` : url;
  };

  // Helper function to safely handle array/string fields
  const formatArrayField = (field: string | string[] | undefined): string => {
    if (!field) return "";
    if (Array.isArray(field)) {
      return field.length > 0 ? field.join(", ") : "";
    }
    return String(field);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-yellow-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
        {/* Header Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-purple-100/50 p-6 lg:p-8 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="space-y-1">
              <h1 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-purple-700 to-purple-900 bg-clip-text text-transparent">
                Receptionist Portal
              </h1>
              <p className="text-gray-600 text-sm lg:text-base">
                Manage and review applicant profiles
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search applicants..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  className="pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent w-full sm:w-72 text-sm transition-all"
                />
              </div>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm bg-white transition-all cursor-pointer"
              >
                <option value="ALL">All Status</option>
                <option value="PENDING">Pending</option>
                <option value="VETTED">Vetted</option>
                <option value="APPROVED">Approved</option>
                <option value="REJECTED">Rejected</option>
              </select>

              <button
                onClick={() => fetchApplicants()}
                disabled={loading}
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md"
              >
                <RefreshCw
                  className={`w-4 h-4 ${loading ? "animate-spin" : ""}`}
                />
                Refresh
              </button>
            </div>
          </div>

          {lastUpdatedAt && (
            <div className="mt-4 pt-4 border-t border-gray-100">
              <p className="text-xs text-gray-500">
                Last updated: {new Date(lastUpdatedAt).toLocaleTimeString()}
              </p>
            </div>
          )}
        </div>

        {/* Tabs Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-purple-100/50 mb-6 overflow-hidden">
          <div className="flex border-b border-gray-100">
            <button
              onClick={() => setActiveTab("LOCAL")}
              className={`flex-1 px-6 py-4 font-semibold text-sm transition-all relative ${
                activeTab === "LOCAL"
                  ? "text-purple-700 bg-purple-50/50"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              {activeTab === "LOCAL" && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-600" />
              )}
              <div className="flex items-center justify-center gap-2">
                <User className="w-4 h-4" />
                <span>Local Applicants</span>
                <span className="inline-flex items-center justify-center min-w-[24px] h-6 px-2 rounded-full bg-purple-100 text-purple-700 text-xs font-bold">
                  {filteredDomestic.length}
                </span>
              </div>
            </button>

            <button
              onClick={() => setActiveTab("INTERNATIONAL")}
              className={`flex-1 px-6 py-4 font-semibold text-sm transition-all relative ${
                activeTab === "INTERNATIONAL"
                  ? "text-purple-700 bg-purple-50/50"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              {activeTab === "INTERNATIONAL" && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-600" />
              )}
              <div className="flex items-center justify-center gap-2">
                <Globe className="w-4 h-4" />
                <span>International</span>
                <span className="inline-flex items-center justify-center min-w-[24px] h-6 px-2 rounded-full bg-purple-100 text-purple-700 text-xs font-bold">
                  {filteredInternational.length}
                </span>
              </div>
            </button>
          </div>
        </div>

        {/* Loading State */}
        {loading && displayedApplicants.length === 0 && (
          <div className="flex items-center justify-center py-20">
            <div className="flex flex-col items-center gap-4">
              <div className="h-12 w-12 rounded-full border-4 border-purple-200 border-t-purple-600 animate-spin" />
              <p className="text-gray-600 font-medium">Loading applicants...</p>
            </div>
          </div>
        )}

        {/* Error State */}
        {!loading && error && (
          <div className="bg-rose-50 border border-rose-200 rounded-2xl p-6">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center">
                <XCircle className="w-5 h-5 text-rose-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-rose-900 mb-1">
                  Failed to load applicants
                </h3>
                <p className="text-sm text-rose-700 mb-3">{error}</p>
                <button
                  onClick={() => fetchApplicants()}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-rose-600 text-white hover:bg-rose-700 text-sm font-medium transition-all"
                >
                  Try Again
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && displayedApplicants.length === 0 && (
          <div className="bg-purple-50 border border-purple-200 rounded-2xl p-8 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-purple-100 mb-4">
              <Users className="w-8 h-8 text-purple-600" />
            </div>
            <h3 className="font-semibold text-purple-900 mb-2">
              No applicants found
            </h3>
            <p className="text-sm text-purple-700">
              Try adjusting your search or filter criteria
            </p>
          </div>
        )}

        {/* Applicants Grid */}
        <div className="grid grid-cols-1 gap-4">
          {displayedApplicants.map((applicant) => (
            <div
              key={applicant.id}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-md hover:border-purple-200 transition-all cursor-pointer overflow-hidden group"
              onClick={() => setSelectedApplicant(applicant)}
            >
              <div className="p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4 flex-1 min-w-0">
                    <div className="flex-shrink-0 w-14 h-14 bg-gradient-to-br from-purple-100 to-purple-50 rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform">
                      {activeTab === "LOCAL" ? (
                        <User className="w-7 h-7 text-purple-600" />
                      ) : (
                        <Globe className="w-7 h-7 text-purple-600" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0 space-y-3">
                      <div>
                        <h3 className="font-semibold text-lg text-gray-900 mb-1 truncate">
                          {applicant.fullName}
                        </h3>
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-gray-600">
                          <div className="flex items-center gap-1.5">
                            <Mail className="w-3.5 h-3.5 text-gray-400" />
                            <span className="truncate">{applicant.email}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Phone className="w-3.5 h-3.5 text-gray-400" />
                            <span>{applicant.phoneNumber}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-3">
                        {applicant.nationality && (
                          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 rounded-lg text-xs font-medium text-gray-700">
                            <Globe className="w-3.5 h-3.5 text-gray-500" />
                            {applicant.nationality}
                          </div>
                        )}
                        {applicant.currentProfession && (
                          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 rounded-lg text-xs font-medium text-gray-700">
                            <Briefcase className="w-3.5 h-3.5 text-gray-500" />
                            {applicant.currentProfession}
                          </div>
                        )}
                        {"experience" in applicant && applicant.experience && (
                          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 rounded-lg text-xs font-medium text-gray-700">
                            <Calendar className="w-3.5 h-3.5 text-gray-500" />
                            {applicant.experience}
                          </div>
                        )}
                        {"educationLevel" in applicant &&
                          applicant.educationLevel && (
                            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 rounded-lg text-xs font-medium text-gray-700">
                              <FileText className="w-3.5 h-3.5 text-gray-500" />
                              {formatArrayField(applicant.educationLevel)}
                            </div>
                          )}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-2 flex-shrink-0">
                    <span
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold ${getStatusBadge(
                        applicant.status
                      )}`}
                    >
                      {getStatusIcon(applicant.status)}
                      {applicant.status}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Applicant Detail Modal */}
        {selectedApplicant && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl my-8 animate-in fade-in zoom-in duration-200">
              <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 rounded-t-2xl flex items-center justify-between z-10">
                <h2 className="text-2xl font-bold text-purple-800">
                  Applicant Details
                </h2>
                <button
                  onClick={() => setSelectedApplicant(null)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              <div className="p-6 space-y-6 max-h-[calc(100vh-200px)] overflow-y-auto">
                {/* Basic Info Card */}
                <div className="bg-gradient-to-br from-purple-50 to-purple-100/50 rounded-xl p-6 border border-purple-200">
                  <h3 className="text-2xl font-bold text-purple-900 mb-4">
                    {selectedApplicant.fullName}
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <div className="flex items-start gap-3">
                        <Mail className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-xs text-purple-700 font-medium mb-0.5">
                            Email
                          </p>
                          <p className="text-sm text-gray-900">
                            {selectedApplicant.email}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <Phone className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-xs text-purple-700 font-medium mb-0.5">
                            Phone
                          </p>
                          <p className="text-sm text-gray-900">
                            {selectedApplicant.phoneNumber}
                          </p>
                        </div>
                      </div>

                      {selectedApplicant.dob && (
                        <div className="flex items-start gap-3">
                          <Calendar className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="text-xs text-purple-700 font-medium mb-0.5">
                              Date of Birth
                            </p>
                            <p className="text-sm text-gray-900">
                              {selectedApplicant.dob}
                            </p>
                          </div>
                        </div>
                      )}

                      {selectedApplicant.currentLocation && (
                        <div className="flex items-start gap-3">
                          <MapPin className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="text-xs text-purple-700 font-medium mb-0.5">
                              Location
                            </p>
                            <p className="text-sm text-gray-900">
                              {selectedApplicant.currentLocation}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="space-y-3">
                      {selectedApplicant.nationality && (
                        <div className="flex items-start gap-3">
                          <Globe className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="text-xs text-purple-700 font-medium mb-0.5">
                              Nationality
                            </p>
                            <p className="text-sm text-gray-900">
                              {selectedApplicant.nationality}
                            </p>
                          </div>
                        </div>
                      )}

                      {selectedApplicant.currentProfession && (
                        <div className="flex items-start gap-3">
                          <Briefcase className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="text-xs text-purple-700 font-medium mb-0.5">
                              Profession
                            </p>
                            <p className="text-sm text-gray-900">
                              {selectedApplicant.currentProfession}
                            </p>
                          </div>
                        </div>
                      )}

                      {"experience" in selectedApplicant &&
                        selectedApplicant.experience && (
                          <div className="flex items-start gap-3">
                            <Clock className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                            <div>
                              <p className="text-xs text-purple-700 font-medium mb-0.5">
                                Experience
                              </p>
                              <p className="text-sm text-gray-900">
                                {selectedApplicant.experience}
                              </p>
                            </div>
                          </div>
                        )}

                      {"educationLevel" in selectedApplicant &&
                        selectedApplicant.educationLevel && (
                          <div className="flex items-start gap-3">
                            <FileText className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                            <div>
                              <p className="text-xs text-purple-700 font-medium mb-0.5">
                                Education Level
                              </p>
                              <p className="text-sm text-gray-900">
                                {formatArrayField(
                                  selectedApplicant.educationLevel
                                )}
                              </p>
                            </div>
                          </div>
                        )}

                      {"religion" in selectedApplicant &&
                        selectedApplicant.religion && (
                          <div className="flex items-start gap-3">
                            <User className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                            <div>
                              <p className="text-xs text-purple-700 font-medium mb-0.5">
                                Religion
                              </p>
                              <p className="text-sm text-gray-900">
                                {selectedApplicant.religion}
                              </p>
                            </div>
                          </div>
                        )}

                      {"maritalStatus" in selectedApplicant &&
                        selectedApplicant.maritalStatus && (
                          <div className="flex items-start gap-3">
                            <User className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                            <div>
                              <p className="text-xs text-purple-700 font-medium mb-0.5">
                                Marital Status
                              </p>
                              <p className="text-sm text-gray-900">
                                {selectedApplicant.maritalStatus}
                              </p>
                            </div>
                          </div>
                        )}

                      {"numberOfKids" in selectedApplicant &&
                        selectedApplicant.numberOfKids && (
                          <div className="flex items-start gap-3">
                            <User className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                            <div>
                              <p className="text-xs text-purple-700 font-medium mb-0.5">
                                Number of Kids
                              </p>
                              <p className="text-sm text-gray-900">
                                {selectedApplicant.numberOfKids}
                              </p>
                            </div>
                          </div>
                        )}

                      {selectedApplicant.currentSalary && (
                        <div className="flex items-start gap-3">
                          <DollarSign className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="text-xs text-purple-700 font-medium mb-0.5">
                              Current Salary
                            </p>
                            <p className="text-sm text-gray-900">
                              KSh{" "}
                              {selectedApplicant.currentSalary.toLocaleString()}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {selectedApplicant.languages &&
                    Array.isArray(selectedApplicant.languages) &&
                    selectedApplicant.languages.length > 0 && (
                      <div className="mt-4 pt-4 border-t border-purple-200">
                        <div className="flex items-start gap-3">
                          <Languages className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="text-xs text-purple-700 font-medium mb-2">
                              Languages
                            </p>
                            <div className="flex flex-wrap gap-2">
                              {Array.isArray(selectedApplicant.languages) ? (
                                selectedApplicant.languages.map((lang, idx) => (
                                  <span
                                    key={idx}
                                    className="px-3 py-1 bg-white border border-purple-200 rounded-full text-xs font-medium text-purple-700"
                                  >
                                    {lang}
                                  </span>
                                ))
                              ) : (
                                <span className="px-3 py-1 bg-white border border-purple-200 rounded-full text-xs font-medium text-purple-700">
                                  {String(selectedApplicant.languages)}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                  <div className="mt-4 pt-4 border-t border-purple-200">
                    <span
                      className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg border font-semibold text-sm ${getStatusBadge(
                        selectedApplicant.status
                      )}`}
                    >
                      {getStatusIcon(selectedApplicant.status)}
                      Status: {selectedApplicant.status}
                    </span>
                  </div>
                </div>

                {/* Documents & Media Section */}
                <div className="space-y-4">
                  <h3 className="text-lg font-bold text-gray-900">
                    Documents & Media
                  </h3>

                  {[
                    {
                      label: "Passport Photos",
                      files: selectedApplicant.passportPhotos,
                      icon: ImageIcon,
                    },
                    {
                      label: "Full Photos",
                      files: selectedApplicant.fullPhotos,
                      icon: ImageIcon,
                    },
                    {
                      label: "National ID",
                      files: selectedApplicant.nationalIdPhotos,
                      icon: ImageIcon,
                    },
                    {
                      label: "Resumes",
                      files: selectedApplicant.resumes,
                      icon: FileText,
                    },
                    {
                      label: "Birth Certificates",
                      files: selectedApplicant.birthCertificates,
                      icon: FileText,
                    },
                    {
                      label: "Good Conduct",
                      files: selectedApplicant.goodConducts,
                      icon: FileText,
                    },
                    {
                      label: "Videos",
                      files: selectedApplicant.videos,
                      icon: Video,
                    },
                    {
                      label: "Showcase Photos",
                      files: selectedApplicant.showcasePhotos,
                      icon: ImageIcon,
                    },
                  ].map((group) =>
                    group.files && group.files.length > 0 ? (
                      <div
                        key={group.label}
                        className="bg-gray-50 rounded-xl p-4 border border-gray-200"
                      >
                        <div className="flex items-center gap-2 mb-3">
                          <group.icon className="w-5 h-5 text-gray-600" />
                          <h4 className="font-semibold text-gray-900">
                            {group.label}
                          </h4>
                          <span className="ml-auto text-xs text-gray-500 bg-white px-2 py-1 rounded-full border border-gray-200">
                            {group.files?.length || 0}{" "}
                            {(group.files?.length || 0) === 1
                              ? "file"
                              : "files"}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                          {group.files?.map((file, idx) => {
                            const fullUrl = file.startsWith("http")
                              ? file
                              : `${API_BASE}${file}`;
                            const isPdf = file.endsWith(".pdf");
                            const isVideo = group.label === "Videos";

                            return (
                              <button
                                key={idx}
                                onClick={() => {
                                  if (isVideo) {
                                    const isYoutube =
                                      fullUrl.includes("youtube.com") ||
                                      fullUrl.includes("youtu.be");
                                    setPreviewMedia({
                                      type: isYoutube ? "youtube" : "video",
                                      src: isYoutube
                                        ? youtubeEmbedUrl(fullUrl)
                                        : fullUrl,
                                      name: `${group.label} ${idx + 1}`,
                                    });
                                  } else if (isPdf) {
                                    setPreviewMedia({
                                      type: "pdf",
                                      src: fullUrl,
                                      name: file,
                                    });
                                  } else {
                                    setPreviewMedia({
                                      type: "image",
                                      src: fullUrl,
                                      name: file,
                                    });
                                  }
                                }}
                                className="group relative bg-white border-2 border-gray-200 hover:border-purple-400 rounded-xl p-4 transition-all hover:shadow-md"
                              >
                                <div className="flex flex-col items-center gap-2">
                                  <div className="w-12 h-12 bg-purple-50 rounded-lg flex items-center justify-center group-hover:bg-purple-100 transition-colors">
                                    {isPdf ? (
                                      <FileText className="w-6 h-6 text-purple-600" />
                                    ) : isVideo ? (
                                      <Video className="w-6 h-6 text-purple-600" />
                                    ) : (
                                      <ImageIcon className="w-6 h-6 text-purple-600" />
                                    )}
                                  </div>
                                  <div className="text-xs font-medium text-gray-700 text-center">
                                    {group.label} {idx + 1}
                                  </div>
                                </div>
                                <div className="absolute inset-0 flex items-center justify-center bg-purple-600/0 group-hover:bg-purple-600/10 rounded-xl transition-colors">
                                  <Eye className="w-5 h-5 text-purple-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ) : null
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Media Preview Modal */}
        {previewMedia && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden">
              <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between z-10">
                <h3 className="font-semibold text-gray-900">
                  {previewMedia.name || "Media Preview"}
                </h3>
                <button
                  onClick={() => setPreviewMedia(null)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              <div className="p-6 overflow-auto max-h-[calc(90vh-80px)]">
                {previewMedia.type === "image" && (
                  <img
                    src={previewMedia.src}
                    alt={previewMedia.name || "Media preview"}
                    className="w-full h-auto rounded-lg"
                  />
                )}
                {previewMedia.type === "video" && (
                  <video
                    src={previewMedia.src}
                    controls
                    className="w-full h-auto rounded-lg"
                  />
                )}
                {previewMedia.type === "pdf" && (
                  <embed
                    src={previewMedia.src}
                    type="application/pdf"
                    className="w-full h-[70vh] rounded-lg"
                  />
                )}
                {previewMedia.type === "youtube" && (
                  <iframe
                    src={previewMedia.src}
                    title={previewMedia.name || "YouTube Video"}
                    frameBorder="0"
                    allowFullScreen
                    className="w-full aspect-video rounded-lg"
                  />
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
