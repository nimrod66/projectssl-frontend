"use client";

import { useEffect, useRef, useState } from "react";
import api from "@/app/staff/auth/api";
import ImageViewerModal from "./ImageViewerModal";
import { getYouTubeEmbedUrl } from "./utils/youtubeUtils";
import toast from "react-hot-toast";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  Calendar,
  Languages,
  DollarSign,
  Eye,
  Download,
  Image as ImageIcon,
  Video,
  FileText,
  Upload,
  X,
  CheckCircle,
  XCircle,
  Clock,
  Globe,
  Trash2,
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
  videos: string[]; // now contains YouTube URLs
  showcasePhotos: string[];
}

// Minimal DTO for media upload responses
interface MediaFileDto {
  fileUrl: string;
}

const jobInterestMap: Record<string, string> = {
  LOCAL_JOBS: "Local Jobs",
  INTERNATIONAL_JOBS: "International Jobs",
};

export default function LocalApplicant() {
  const [applicants, setApplicants] = useState<Applicant[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  const [selectedApplicant, setSelectedApplicant] = useState<Applicant | null>(
    null
  );
  const [isUploading, setIsUploading] = useState(false);

  // Pending selections for preview-before-approve
  const [pendingShowcaseFile, setPendingShowcaseFile] = useState<File | null>(
    null
  );
  const [pendingShowcasePreviewUrl, setPendingShowcasePreviewUrl] = useState<
    string | null
  >(null);

  // Image viewer state
  const [imageViewerOpen, setImageViewerOpen] = useState(false);
  const [viewerImages, setViewerImages] = useState<string[]>([]);
  const [viewerInitialIndex, setViewerInitialIndex] = useState(0);
  const [viewerTitle, setViewerTitle] = useState("");

  const API_BASE = process.env.NEXT_PUBLIC_API_BASE;

  // Helper: open image viewer
  const openImageViewer = (images: string[], index: number, title: string) => {
    setViewerImages(images);
    setViewerInitialIndex(index);
    setViewerTitle(title);
    setImageViewerOpen(true);
  };

  const [filteredApplicants, setFilteredApplicants] = useState<Applicant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdatedAt, setLastUpdatedAt] = useState<number | null>(null);
  const pollingTimerRef = useRef<NodeJS.Timeout | null>(null);
  const currentIntervalMsRef = useRef<number>(1500000);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Fetch applicants (with abort + backoff)
  const fetchApplicants = async (opts?: { silent?: boolean }) => {
    try {
      if (!opts?.silent) setLoading(true);
      setError(null);
      abortControllerRef.current?.abort();
      const controller = new AbortController();
      abortControllerRef.current = controller;
      const res = await api.get<Applicant[]>(`/api/applications`, {
        signal: controller.signal as any,
      });
      const data = res.data || [];
      setApplicants(data);
      setFilteredApplicants((prev) => {
        if (!searchQuery.trim()) return data;
        const q = searchQuery.toLowerCase();
        return data.filter(
          (app) =>
            app.fullName.toLowerCase().includes(q) ||
            app.email.toLowerCase().includes(q) ||
            app.phoneNumber.includes(searchQuery)
        );
      });
      setLastUpdatedAt(Date.now());
      currentIntervalMsRef.current = 1500000; // reset backoff on success
    } catch (err: any) {
      if (err?.name === "CanceledError" || err?.name === "AbortError") return;
      console.error(err);
      setError(err?.message || "Failed to load applications");
      currentIntervalMsRef.current = Math.min(
        currentIntervalMsRef.current * 2,
        120000
      );
    } finally {
      if (!opts?.silent) setLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    fetchApplicants();
  }, []);

  // Debounce search input
  useEffect(() => {
    const t = setTimeout(() => setSearchQuery(searchInput), 250);
    return () => clearTimeout(t);
  }, [searchInput]);

  // Derived filtering when inputs change
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
    setFilteredApplicants(filtered);
  }, [applicants, searchQuery]);

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

  const handleSearch = (query: string) => {
    setSearchInput(query);
  };

  const uploadFile = async (
    applicantId: number,
    file: File,
    field: "showcasePhotos"
  ): Promise<string | null> => {
    const formData = new FormData();
    formData.append("files", file);

    try {
      setIsUploading(true);
      const endpoint = `/api/media/${applicantId}/showcase`;
      const res = await api.post<MediaFileDto[]>(endpoint, formData);
      return res.data?.[0]?.fileUrl || null;
    } catch (err) {
      console.error("Upload failed", err);
      toast.error("Upload failed");
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  // Handle showcase file selection
  const handleSelectForPreview = (
    e: React.ChangeEvent<HTMLInputElement>,
    file: File
  ) => {
    if (pendingShowcasePreviewUrl)
      URL.revokeObjectURL(pendingShowcasePreviewUrl);
    setPendingShowcaseFile(file);
    setPendingShowcasePreviewUrl(URL.createObjectURL(file));
    if (e.target) e.target.value = "";
  };

  // On modal close, cleanup previews
  useEffect(() => {
    return () => {
      if (pendingShowcasePreviewUrl)
        URL.revokeObjectURL(pendingShowcasePreviewUrl);
    };
  }, []);

  // Reset pending selections when switching selected applicant
  useEffect(() => {
    if (!selectedApplicant) {
      if (pendingShowcasePreviewUrl)
        URL.revokeObjectURL(pendingShowcasePreviewUrl);
      setPendingShowcaseFile(null);
      setPendingShowcasePreviewUrl(null);
    }
  }, [selectedApplicant?.id]);

  // Add YouTube video link
  const addVideoLink = (link: string) => {
    if (!selectedApplicant) return;
    const trimmed = link.trim();
    if (!trimmed) return;

    setSelectedApplicant((prev) => {
      if (!prev) return prev;
      const updated: Applicant = {
        ...prev,
        videos: [...prev.videos, trimmed],
      };
      setApplicants((apps) =>
        apps.map((a) => (a.id === prev.id ? updated : a))
      );
      return updated;
    });
  };

  // Approve handler that requires at least one photo & one video link
  const approveWithUploads = async (id: number) => {
    if (!selectedApplicant) return;

    try {
      setActionLoading(true);

      // Upload pending showcase photo if any
      if (pendingShowcaseFile) {
        const path = await uploadFile(
          id,
          pendingShowcaseFile,
          "showcasePhotos"
        );
        if (!path) throw new Error("Failed to upload showcase photo");
        setApplicants((prev) =>
          prev.map((a) =>
            a.id === id
              ? { ...a, showcasePhotos: [...a.showcasePhotos, path] }
              : a
          )
        );
        setSelectedApplicant((prev) =>
          prev
            ? { ...prev, showcasePhotos: [...prev.showcasePhotos, path] }
            : prev
        );
      }

      // Ensure both exist before approving
      const hasPhoto =
        pendingShowcaseFile || selectedApplicant.showcasePhotos.length > 0;
      const hasVideo = selectedApplicant.videos.length > 0;
      if (!hasPhoto || !hasVideo) {
        toast.error(
          "Please add at least one photo and one YouTube video link before approval."
        );
        return;
      }

      await handleVetAction(id, "approve");
    } catch (err) {
      console.error(err);
      toast.error("Approve failed");
    } finally {
      setActionLoading(false);
    }
  };

  const handleMarkAsVetted = async (id: number) => {
    try {
      setActionLoading(true);
      const res = await api.patch<Applicant>(`/api/applications/${id}/vet`);
      setApplicants((prev) =>
        prev.map((app) => (app.id === id ? res.data : app))
      );
      setSelectedApplicant(res.data);
      toast.success("Marked as vetted");
    } catch (err) {
      console.error(err);
      toast.error("Failed to mark as vetted");
    } finally {
      setActionLoading(false);
    }
  };

  const handleVetAction = async (id: number, action: "approve" | "reject") => {
    if (
      action === "approve" &&
      selectedApplicant &&
      (selectedApplicant.showcasePhotos.length === 0 ||
        selectedApplicant.videos.length === 0)
    ) {
      alert(
        "Applicant must have at least one showcase photo and one video link before approval."
      );
      return;
    }

    try {
      setActionLoading(true);
      const res = await api.patch<Applicant>(
        `/api/applications/${id}/${action}`
      );
      setApplicants((prev) =>
        prev.map((app) => (app.id === id ? res.data : app))
      );
      setSelectedApplicant(null);
      toast.success(action === "approve" ? "Approved" : "Rejected");
    } catch (err) {
      console.error(err);
      toast.error("Action failed");
    } finally {
      setActionLoading(false);
    }
  };

  const handleHire = async (id: number) => {
    try {
      setActionLoading(true);
      const res = await api.patch<Applicant>(`/api/applications/${id}/hired`);
      setApplicants((prev) =>
        prev.map((app) => (app.id === id ? res.data : app))
      );
      setSelectedApplicant(null);
      toast.success("Marked as hired");
    } catch (err) {
      console.error(err);
      toast.error("Failed to mark applicant as hired");
    } finally {
      setActionLoading(false);
    }
  };

  const handleRestore = async (id: number) => {
    try {
      setActionLoading(true);
      const res = await api.patch<Applicant>(`/api/applications/${id}/restore`);
      setApplicants((prev) =>
        prev.map((app) => (app.id === id ? res.data : app))
      );
      setSelectedApplicant(null);
      toast.success("Restored to pool");
    } catch (err) {
      console.error(err);
      toast.error("Failed to restore applicant to the client pool");
    } finally {
      setActionLoading(false);
    }
  };

  // Delete applicant
  const handleDeleteApplicant = async (id: number) => {
    if (!confirm("Are you sure you want to delete this applicant?")) return;
    try {
      setActionLoading(true);
      await api.delete(`/api/applications/${id}`);
      setApplicants((prev) => prev.filter((a) => a.id !== id));
      setSelectedApplicant(null);
      toast.success("Applicant deleted successfully");
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete applicant");
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    file: File
  ) => {
    if (!selectedApplicant) return;
    const path = await uploadFile(selectedApplicant.id, file, "showcasePhotos");
    if (!path) return;

    setSelectedApplicant((prev) => {
      if (!prev) return prev;
      const updated: Applicant = {
        ...prev,
        showcasePhotos: [...prev.showcasePhotos, path],
      };
      setApplicants((apps) =>
        apps.map((a) => (a.id === prev.id ? updated : a))
      );
      return updated;
    });

    if (e.target) e.target.value = "";
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
      <header className="bg-white rounded-xl shadow-lg p-4 sm:p-6 mb-4 sm:mb-6 border border-purple-100">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-purple-800 mb-2">
              Local Applicants
            </h1>
            <p className="text-gray-600 text-sm sm:text-base">
              Manage local staff applications
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 w-full lg:w-auto">
            <div className="relative flex-1 sm:flex-none">
              <input
                type="text"
                placeholder="Search by name, email, or phone..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="pl-4 pr-4 py-2 border border-purple-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent w-full sm:w-64 text-sm"
              />
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
      </header>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg mb-4">
          {error}
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4 lg:gap-6 mb-4 sm:mb-6">
        <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 border-l-4 border-yellow-400">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-xs sm:text-sm">Pending</p>
              <p className="text-xl sm:text-2xl font-bold text-yellow-600">
                {pendingCount}
              </p>
            </div>
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
          </div>
        </div>
      </div>

      {/* Applicants Table */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-purple-100">
        <div className="bg-gradient-to-r from-purple-600 to-purple-700 px-4 sm:px-6 py-3 sm:py-4">
          <h2 className="text-lg sm:text-xl font-bold text-white">
            Local Applications ({filteredApplicants.length})
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-purple-50">
              <tr>
                <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-semibold text-purple-800">
                  Application No.
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
              {filteredApplicants.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
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
                      SSL-LAP-ID/{app.id}
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

      {/* Applicant Details Modal */}
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

            <div className="p-4 sm:p-6 space-y-6">
              {/* Applicant Profile Header */}
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6 border border-purple-200">
                <div className="flex items-start gap-4">
                  <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center text-white text-2xl font-bold">
                    {selectedApplicant.fullName.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-purple-900 mb-2">
                      {selectedApplicant.fullName}
                    </h3>
                    <div className="flex flex-wrap gap-4 text-sm text-purple-700">
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4" />
                        {selectedApplicant.email}
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4" />
                        {selectedApplicant.phoneNumber}
                      </div>
                      {selectedApplicant.nationality && (
                        <div className="flex items-center gap-2">
                          <Globe className="w-4 h-4" />
                          {selectedApplicant.nationality}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <span
                      className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg border font-semibold text-sm ${getStatusBadge(
                        selectedApplicant.status
                      )}`}
                    >
                      {selectedApplicant.status === "APPROVED" && (
                        <CheckCircle className="w-4 h-4" />
                      )}
                      {selectedApplicant.status === "REJECTED" && (
                        <XCircle className="w-4 h-4" />
                      )}
                      {selectedApplicant.status === "VETTED" && (
                        <CheckCircle className="w-4 h-4" />
                      )}
                      {selectedApplicant.status === "PENDING" && (
                        <Clock className="w-4 h-4" />
                      )}
                      {selectedApplicant.status === "HIRED" && (
                        <CheckCircle className="w-4 h-4" />
                      )}
                      {selectedApplicant.status}
                    </span>
                  </div>
                </div>
              </div>

              {/* Detailed Information */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <User className="w-5 h-5 text-purple-600" />
                    Personal Information
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <Calendar className="w-4 h-4 text-gray-500 mt-1" />
                      <div>
                        <p className="text-xs text-gray-500 font-medium">
                          Date of Birth
                        </p>
                        <p className="text-sm text-gray-900">
                          {selectedApplicant.dob || "N/A"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <User className="w-4 h-4 text-gray-500 mt-1" />
                      <div>
                        <p className="text-xs text-gray-500 font-medium">Age</p>
                        <p className="text-sm text-gray-900">
                          {selectedApplicant.age || "N/A"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Globe className="w-4 h-4 text-gray-500 mt-1" />
                      <div>
                        <p className="text-xs text-gray-500 font-medium">
                          Nationality
                        </p>
                        <p className="text-sm text-gray-900">
                          {selectedApplicant.nationality || "N/A"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Briefcase className="w-5 h-5 text-purple-600" />
                    Professional Details
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <Briefcase className="w-4 h-4 text-gray-500 mt-1" />
                      <div>
                        <p className="text-xs text-gray-500 font-medium">
                          Profession
                        </p>
                        <p className="text-sm text-gray-900">
                          {selectedApplicant.currentProfession || "N/A"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <MapPin className="w-4 h-4 text-gray-500 mt-1" />
                      <div>
                        <p className="text-xs text-gray-500 font-medium">
                          Location
                        </p>
                        <p className="text-sm text-gray-900">
                          {selectedApplicant.currentLocation || "N/A"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Calendar className="w-4 h-4 text-gray-500 mt-1" />
                      <div>
                        <p className="text-xs text-gray-500 font-medium">
                          Experience
                        </p>
                        <p className="text-sm text-gray-900">
                          {selectedApplicant.experience || "N/A"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Languages className="w-4 h-4 text-gray-500 mt-1" />
                      <div>
                        <p className="text-xs text-gray-500 font-medium">
                          Languages
                        </p>
                        <p className="text-sm text-gray-900">
                          {selectedApplicant.languages?.join(", ") || "N/A"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Briefcase className="w-4 h-4 text-gray-500 mt-1" />
                      <div>
                        <p className="text-xs text-gray-500 font-medium">
                          Job Interest
                        </p>
                        <p className="text-sm text-gray-900">
                          {jobInterestMap[
                            selectedApplicant.jobInterest || ""
                          ] || "N/A"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Media Files Section */}
              <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <ImageIcon className="w-5 h-5 text-purple-600" />
                  Documents & Media Files
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Passport Photos */}
                  {selectedApplicant.passportPhotos?.length > 0 && (
                    <div className="space-y-3">
                      <h4 className="font-medium text-gray-700 flex items-center gap-2">
                        <ImageIcon className="w-4 h-4" />
                        Passport Photos (
                        {selectedApplicant.passportPhotos.length})
                      </h4>
                      <div className="grid grid-cols-3 gap-2">
                        {selectedApplicant.passportPhotos.map((photo, idx) => (
                          <button
                            key={idx}
                            onClick={() =>
                              openImageViewer(
                                selectedApplicant.passportPhotos.map(
                                  (p) => `${API_BASE}${p}`
                                ),
                                idx,
                                "Passport Photos"
                              )
                            }
                            className="relative group cursor-pointer overflow-hidden rounded-lg"
                          >
                            <img
                              src={`${API_BASE}${photo}`}
                              alt={`Passport ${idx + 1}`}
                              className="w-full h-24 object-cover rounded-lg border border-gray-200 hover:border-purple-400 transition-all group-hover:scale-105"
                            />
                            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all rounded-lg flex items-center justify-center">
                              <Eye className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Full Photos */}
                  {selectedApplicant.fullPhotos?.length > 0 && (
                    <div className="space-y-3">
                      <h4 className="font-medium text-gray-700 flex items-center gap-2">
                        <ImageIcon className="w-4 h-4" />
                        Full Photos ({selectedApplicant.fullPhotos.length})
                      </h4>
                      <div className="grid grid-cols-3 gap-2">
                        {selectedApplicant.fullPhotos.map((photo, idx) => (
                          <button
                            key={idx}
                            onClick={() =>
                              openImageViewer(
                                selectedApplicant.fullPhotos.map(
                                  (p) => `${API_BASE}${p}`
                                ),
                                idx,
                                "Full Photos"
                              )
                            }
                            className="relative group cursor-pointer overflow-hidden rounded-lg"
                          >
                            <img
                              src={`${API_BASE}${photo}`}
                              alt={`Full Photo ${idx + 1}`}
                              className="w-full h-24 object-cover rounded-lg border border-gray-200 hover:border-purple-400 transition-all group-hover:scale-105"
                            />
                            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all rounded-lg flex items-center justify-center">
                              <Eye className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* National ID Photos */}
                  {selectedApplicant.nationalIdPhotos?.length > 0 && (
                    <div className="space-y-3">
                      <h4 className="font-medium text-gray-700 flex items-center gap-2">
                        <ImageIcon className="w-4 h-4" />
                        National ID Photos (
                        {selectedApplicant.nationalIdPhotos.length})
                      </h4>
                      <div className="grid grid-cols-3 gap-2">
                        {selectedApplicant.nationalIdPhotos.map(
                          (photo, idx) => (
                            <button
                              key={idx}
                              onClick={() =>
                                openImageViewer(
                                  selectedApplicant.nationalIdPhotos.map(
                                    (p) => `${API_BASE}${p}`
                                  ),
                                  idx,
                                  "National ID Photos"
                                )
                              }
                              className="relative group cursor-pointer overflow-hidden rounded-lg"
                            >
                              <img
                                src={`${API_BASE}${photo}`}
                                alt={`National ID ${idx + 1}`}
                                className="w-full h-24 object-cover rounded-lg border border-gray-200 hover:border-purple-400 transition-all group-hover:scale-105"
                              />
                              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all rounded-lg flex items-center justify-center">
                                <Eye className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                              </div>
                            </button>
                          )
                        )}
                      </div>
                    </div>
                  )}

                  {/* Showcase Photos */}
                  {selectedApplicant.showcasePhotos?.length > 0 && (
                    <div className="space-y-3">
                      <h4 className="font-medium text-gray-700 flex items-center gap-2">
                        <ImageIcon className="w-4 h-4" />
                        Showcase Photos (
                        {selectedApplicant.showcasePhotos.length})
                      </h4>
                      <div className="grid grid-cols-3 gap-2">
                        {selectedApplicant.showcasePhotos.map((photo, idx) => (
                          <button
                            key={idx}
                            onClick={() =>
                              openImageViewer(
                                selectedApplicant.showcasePhotos.map(
                                  (p) => `${API_BASE}${p}`
                                ),
                                idx,
                                "Showcase Photos"
                              )
                            }
                            className="relative group cursor-pointer overflow-hidden rounded-lg"
                          >
                            <img
                              src={`${API_BASE}${photo}`}
                              alt={`Showcase ${idx + 1}`}
                              className="w-full h-24 object-cover rounded-lg border border-gray-200 hover:border-purple-400 transition-all group-hover:scale-105"
                            />
                            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all rounded-lg flex items-center justify-center">
                              <Eye className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Videos */}
                  {selectedApplicant.videos?.length > 0 && (
                    <div className="space-y-3 md:col-span-2">
                      <h4 className="font-medium text-gray-700 flex items-center gap-2">
                        <Video className="w-4 h-4" />
                        Videos ({selectedApplicant.videos.length})
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {selectedApplicant.videos.map((video, idx) => {
                          const embedUrl = getYouTubeEmbedUrl(video);
                          return embedUrl ? (
                            <div
                              key={idx}
                              className="relative bg-black rounded-lg overflow-hidden shadow-md"
                              style={{ paddingBottom: "56.25%" }}
                            >
                              <iframe
                                src={embedUrl}
                                title={`Video ${idx + 1}`}
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                                className="absolute top-0 left-0 w-full h-full"
                              />
                            </div>
                          ) : (
                            <div
                              key={idx}
                              className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200"
                            >
                              <Video className="w-5 h-5 text-purple-600" />
                              <a
                                href={video}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-sm text-blue-600 hover:text-blue-800 underline flex-1 truncate"
                              >
                                {video}
                              </a>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Documents */}
                  <div className="space-y-3">
                    <h4 className="font-medium text-gray-700 flex items-center gap-2">
                      <FileText className="w-4 h-4" />
                      Documents
                    </h4>
                    <div className="space-y-2">
                      {selectedApplicant.resumes?.length > 0 && (
                        <div className="space-y-1">
                          <p className="text-sm font-medium text-gray-600">
                            Resumes
                          </p>
                          {selectedApplicant.resumes.map((resume, idx) => (
                            <a
                              key={idx}
                              href={`${API_BASE}${resume}`}
                              download
                              className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800"
                            >
                              <Download className="w-4 h-4" />
                              Resume {idx + 1}
                            </a>
                          ))}
                        </div>
                      )}
                      {selectedApplicant.birthCertificates?.length > 0 && (
                        <div className="space-y-1">
                          <p className="text-sm font-medium text-gray-600">
                            Birth Certificates
                          </p>
                          {selectedApplicant.birthCertificates.map(
                            (cert, idx) => (
                              <a
                                key={idx}
                                href={`${API_BASE}${cert}`}
                                download
                                className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800"
                              >
                                <Download className="w-4 h-4" />
                                Birth Certificate {idx + 1}
                              </a>
                            )
                          )}
                        </div>
                      )}
                      {selectedApplicant.goodConducts?.length > 0 && (
                        <div className="space-y-1">
                          <p className="text-sm font-medium text-gray-600">
                            Good Conduct Certificates
                          </p>
                          {selectedApplicant.goodConducts.map(
                            (conduct, idx) => (
                              <a
                                key={idx}
                                href={`${API_BASE}${conduct}`}
                                download
                                className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800"
                              >
                                <Download className="w-4 h-4" />
                                Good Conduct {idx + 1}
                              </a>
                            )
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Upload Section for Vetted Applicants */}
              {selectedApplicant.status === "VETTED" && (
                <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl p-6 border border-yellow-200 shadow-sm">
                  <h3 className="text-lg font-semibold text-yellow-800 mb-4 flex items-center gap-2">
                    <Upload className="w-5 h-5" />
                    Upload Showcase Media
                  </h3>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Showcase Photo Upload */}
                    <div className="space-y-3">
                      <label className="block text-sm font-medium text-gray-700">
                        Showcase Photo
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleSelectForPreview(e, file);
                          }}
                          className="flex-1 px-3 py-2 border border-yellow-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent text-sm"
                        />
                        {pendingShowcaseFile && (
                          <button
                            onClick={() => {
                              URL.revokeObjectURL(
                                pendingShowcasePreviewUrl || ""
                              );
                              setPendingShowcaseFile(null);
                              setPendingShowcasePreviewUrl(null);
                            }}
                            className="px-3 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                      {pendingShowcasePreviewUrl && (
                        <div className="mt-3">
                          <img
                            src={pendingShowcasePreviewUrl}
                            alt="Preview"
                            className="w-full h-32 object-cover rounded-lg border border-yellow-300"
                          />
                        </div>
                      )}
                    </div>

                    {/* YouTube Video Link */}
                    <div className="space-y-3">
                      <label className="block text-sm font-medium text-gray-700">
                        YouTube Video Link
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="url"
                          placeholder="Enter YouTube URL"
                          className="flex-1 px-3 py-2 border border-yellow-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent text-sm"
                          onKeyPress={(e) => {
                            if (e.key === "Enter") {
                              addVideoLink(e.currentTarget.value);
                              e.currentTarget.value = "";
                            }
                          }}
                        />
                        <button
                          onClick={(e) => {
                            const input = e.currentTarget
                              .previousElementSibling as HTMLInputElement;
                            if (input.value) {
                              addVideoLink(input.value);
                              input.value = "";
                            }
                          }}
                          className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg transition-colors flex items-center gap-2"
                        >
                          <Upload className="w-4 h-4" />
                          Add
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-purple-600" />
                  Actions
                </h3>
                <div className="flex flex-col sm:flex-row justify-end gap-3">
                  {(selectedApplicant.status === "PENDING" ||
                    selectedApplicant.status === "VETTED") && (
                    <button
                      className="bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-lg transition-colors text-sm disabled:opacity-50 flex items-center gap-2 font-medium"
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
                      className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg transition-colors text-sm disabled:opacity-50 flex items-center gap-2 font-medium"
                      onClick={() => handleMarkAsVetted(selectedApplicant.id)}
                      disabled={actionLoading}
                    >
                      <CheckCircle className="w-4 h-4" />
                      {actionLoading ? "Processing..." : "Mark as Vetted"}
                    </button>
                  )}

                  {selectedApplicant.status === "VETTED" && (
                    <button
                      onClick={() => approveWithUploads(selectedApplicant.id)}
                      disabled={actionLoading}
                      className="px-6 py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg disabled:opacity-50 text-sm flex items-center gap-2 font-medium transition-colors"
                    >
                      <CheckCircle className="w-4 h-4" />
                      {actionLoading ? "Processing..." : "Approve"}
                    </button>
                  )}

                  {selectedApplicant.status === "APPROVED" && (
                    <button
                      className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg transition-colors text-sm disabled:opacity-50 flex items-center gap-2 font-medium"
                      onClick={() => handleHire(selectedApplicant.id)}
                      disabled={actionLoading}
                    >
                      <CheckCircle className="w-4 h-4" />
                      {actionLoading ? "Processing..." : "Hire"}
                    </button>
                  )}

                  {selectedApplicant.status === "HIRED" && (
                    <button
                      className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-lg transition-colors text-sm disabled:opacity-50 flex items-center gap-2 font-medium"
                      onClick={() => handleRestore(selectedApplicant.id)}
                      disabled={actionLoading}
                    >
                      <Clock className="w-4 h-4" />
                      {actionLoading ? "Processing..." : "Restore"}
                    </button>
                  )}

                  {/* Delete Button */}
                  <button
                    className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg transition-colors text-sm disabled:opacity-50 flex items-center gap-2 font-medium"
                    onClick={() => handleDeleteApplicant(selectedApplicant.id)}
                    disabled={actionLoading}
                  >
                    <Trash2 className="w-4 h-4" />
                    {actionLoading ? "Processing..." : "Delete"}
                  </button>

                  <button
                    className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-3 rounded-lg transition-colors text-sm flex items-center gap-2 font-medium"
                    onClick={() => setSelectedApplicant(null)}
                  >
                    <X className="w-4 h-4" />
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Image Viewer Modal */}
      {imageViewerOpen && (
        <ImageViewerModal
          images={viewerImages}
          initialIndex={viewerInitialIndex}
          onClose={() => setImageViewerOpen(false)}
          title={viewerTitle}
        />
      )}
    </div>
  );
}
