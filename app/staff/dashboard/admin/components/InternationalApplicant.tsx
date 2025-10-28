"use client";

import { useEffect, useRef, useState } from "react";
import api from "@/app/staff/auth/api";
import GenerateCVButton from "../../receptionist/components/GenerateCVButton";
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
  GraduationCap,
  Heart,
  Users,
} from "lucide-react";

interface InternationalApplicant {
  id: number;
  fullName: string;
  phoneNumber: string;
  email: string;
  dob?: string;
  age?: number;
  nationality?: string;
  religion?: string;
  maritalStatus?: string[];
  numberOfKids?: string;
  educationLevel?: string[];
  currentProfession?: string;
  currentSalary?: number;
  currentLocation?: string;
  languages: string[];
  employmentStatus?: string;
  jobRecruitment?: string;
  status: "PENDING" | "VETTED" | "APPROVED" | "REJECTED" | "HIRED";
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

interface MediaFileDto {
  fileUrl: string;
}


export default function InternationalApplicant() {
  const [applicants, setApplicants] = useState<InternationalApplicant[]>([]);
  const [filteredApplicants, setFilteredApplicants] = useState<
    InternationalApplicant[]
  >([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [selectedApplicant, setSelectedApplicant] =
    useState<InternationalApplicant | null>(null);
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [pendingShowcaseFile, setPendingShowcaseFile] = useState<File | null>(
    null
  );
  const [pendingShowcasePreviewUrl, setPendingShowcasePreviewUrl] = useState<
    string | null
  >(null);

  const API_BASE = process.env.NEXT_PUBLIC_API_BASE;

  // Image viewer state
  const [imageViewerOpen, setImageViewerOpen] = useState(false);
  const [viewerImages, setViewerImages] = useState<string[]>([]);
  const [viewerInitialIndex, setViewerInitialIndex] = useState(0);
  const [viewerTitle, setViewerTitle] = useState("");

  const pollingTimerRef = useRef<NodeJS.Timeout | null>(null);
  const currentIntervalMsRef = useRef<number>(30000);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Helper: safe get arrays
  const ensureArrays = (app: InternationalApplicant) => ({
    ...app,
    passportPhotos: app.passportPhotos ?? [],
    fullPhotos: app.fullPhotos ?? [],
    nationalIdPhotos: app.nationalIdPhotos ?? [],
    resumes: app.resumes ?? [],
    birthCertificates: app.birthCertificates ?? [],
    goodConducts: app.goodConducts ?? [],
    videos: app.videos ?? [],
    showcasePhotos: app.showcasePhotos ?? [],
  });

  // Helper: open image viewer
  const openImageViewer = (images: string[], index: number, title: string) => {
    setViewerImages(images);
    setViewerInitialIndex(index);
    setViewerTitle(title);
    setImageViewerOpen(true);
  };

  // Fetch applicants (with abort + backoff)
  const fetchApplicants = async (opts?: { silent?: boolean }) => {
    try {
      if (!opts?.silent) setLoading(true);
      setError(null);
      abortControllerRef.current?.abort();

      const controller = new AbortController();
      abortControllerRef.current = controller;

      const res = await api.get<InternationalApplicant[]>(
        "/api/international",
        {
          signal: controller.signal as any,
        }
      );

      const data = (res.data || []).map(ensureArrays);
      setApplicants(data);
      // apply search filter using current searchQuery
      setFilteredApplicants(
        data.filter((app) =>
          !searchQuery.trim()
            ? true
            : app.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
              app.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
              app.phoneNumber.includes(searchQuery)
        )
      );

      currentIntervalMsRef.current = 30000;
    } catch (err: any) {
      if (err?.name === "CanceledError" || err?.name === "AbortError") return;
      console.error(err);
      setError(err?.message || "Failed to load international applicants");
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
    // clean up on unmount
    return () => {
      abortControllerRef.current?.abort();
      if (pollingTimerRef.current) clearTimeout(pollingTimerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // debounce search input -> searchQuery
  useEffect(() => {
    const t = setTimeout(() => setSearchQuery(searchInput), 250);
    return () => clearTimeout(t);
  }, [searchInput]);

  // recompute filtered applicants when applicants or searchQuery changes
  useEffect(() => {
    setFilteredApplicants(
      applicants.filter((app) =>
        !searchQuery.trim()
          ? true
          : app.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            app.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
            app.phoneNumber.includes(searchQuery)
      )
    );
  }, [applicants, searchQuery]);

  // polling scheduler with backoff and visibility handling
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Upload YouTube link
  const uploadYoutubeLink = async (applicantId: number, youtubeUrl: string) => {
    if (!youtubeUrl.trim()) {
      toast.error("Please enter a valid YouTube URL");
      return;
    }
    try {
      setActionLoading(true);
      const res = await api.post<MediaFileDto>(
        `/api/media/inter/${applicantId}/video-link`,
        { youtubeUrl } // send in request body
      );

      const newUrl = res.data.fileUrl;
      setApplicants((prev) =>
        prev.map((app) =>
          app.id === applicantId
            ? { ...ensureArrays(app), videos: [...(app.videos ?? []), newUrl] }
            : app
        )
      );
      setSelectedApplicant((prev) =>
        prev
          ? { ...ensureArrays(prev), videos: [...(prev.videos ?? []), newUrl] }
          : prev
      );
      toast.success("YouTube link uploaded");
      setYoutubeUrl("");
    } catch (err) {
      console.error(err);
      toast.error("Upload failed");
    } finally {
      setActionLoading(false);
    }
  };

  // Upload showcase photo
  const uploadShowcasePhoto = async (applicantId: number) => {
    if (!pendingShowcaseFile) {
      toast.error("Please select a showcase photo first");
      return;
    }
    try {
      setActionLoading(true);
      const formData = new FormData();
      formData.append("files", pendingShowcaseFile); // must match @RequestPart("files")

      const res = await api.post<MediaFileDto>(
        `/api/media/inter/${applicantId}/showcase`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      // Update local state with new file URL
      const newUrl = res.data.fileUrl;
      setApplicants((prev) =>
        prev.map((app) =>
          app.id === applicantId
            ? {
                ...ensureArrays(app),
                showcase: [...(app.showcasePhotos ?? []), newUrl],
              }
            : app
        )
      );
      setSelectedApplicant((prev) =>
        prev
          ? {
              ...ensureArrays(prev),
              showcase: [...(prev.showcasePhotos ?? []), newUrl],
            }
          : prev
      );
      toast.success("Showcase photo uploaded");
      setPendingShowcaseFile(null);
    } catch (err) {
      console.error(err);
      toast.error("Upload failed");
    } finally {
      setActionLoading(false);
    }
  };

  // Vet/Approve/Reject actions
  const handleVetAction = async (id: number, action: "approve" | "reject") => {
    // ensure photo + video before approving
    if (action === "approve") {
      const app = applicants.find((a) => a.id === id) || selectedApplicant;
      if (
        app &&
        ((app.showcasePhotos?.length ?? 0) === 0 ||
          (app.videos?.length ?? 0) === 0)
      ) {
        toast.error("Please upload both photo and video before approval.");
        return;
      }
    }

    try {
      setActionLoading(true);
      const res = await api.patch<InternationalApplicant>(
        `/api/international/${id}/${action}`
      );
      const data = ensureArrays(res.data);
      setApplicants((prev) => prev.map((a) => (a.id === id ? data : a)));
      setSelectedApplicant(null);
      toast.success(action === "approve" ? "Approved" : "Rejected");
    } catch (err) {
      console.error(err);
      toast.error("Action failed");
    } finally {
      setActionLoading(false);
    }
  };

  const handleMarkAsVetted = async (id: number) => {
    try {
      setActionLoading(true);
      const res = await api.patch<InternationalApplicant>(
        `/api/international/${id}/vet`
      );
      const data = ensureArrays(res.data);
      setApplicants((prev) => prev.map((a) => (a.id === id ? data : a)));
      setSelectedApplicant(data);
      toast.success("Marked as vetted");
    } catch (err) {
      console.error(err);
      toast.error("Failed to mark as vetted");
    } finally {
      setActionLoading(false);
    }
  };

  const handleHire = async (id: number) => {
    try {
      setActionLoading(true);
      const res = await api.patch<InternationalApplicant>(
        `/api/international/${id}/hired`
      );
      const data = ensureArrays(res.data);
      setApplicants((prev) => prev.map((a) => (a.id === id ? data : a)));
      setSelectedApplicant(null);
      toast.success("Marked as hired");
    } catch (err) {
      console.error(err);
      toast.error("Failed to mark as hired");
    } finally {
      setActionLoading(false);
    }
  };

  const handleRestore = async (id: number) => {
    try {
      setActionLoading(true);
      const res = await api.patch<InternationalApplicant>(
        `/api/international/${id}/restore`
      );
      const data = ensureArrays(res.data);
      setApplicants((prev) => prev.map((a) => (a.id === id ? data : a)));
      setSelectedApplicant(null);
      toast.success("Restored to pool");
    } catch (err) {
      console.error(err);
      toast.error("Failed to restore");
    } finally {
      setActionLoading(false);
    }
  };

  // Delete applicant
  const handleDeleteApplicant = async (id: number) => {
    if (!confirm("Are you sure you want to delete this applicant?")) return;
    try {
      setActionLoading(true);
      await api.delete(`/api/international/${id}`);
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

  // preview file selection handler
  const handleSelectForPreview = (
    e: React.ChangeEvent<HTMLInputElement>,
    file?: File
  ) => {
    const chosen = file ?? e.target.files?.[0];
    if (!chosen) return;
    // revoke old preview if exists
    if (pendingShowcasePreviewUrl) {
      URL.revokeObjectURL(pendingShowcasePreviewUrl);
    }
    const previewUrl = URL.createObjectURL(chosen);
    setPendingShowcaseFile(chosen);
    setPendingShowcasePreviewUrl(previewUrl);
  };

  // cleanup object URL when component unmounts
  useEffect(() => {
    return () => {
      if (pendingShowcasePreviewUrl) {
        URL.revokeObjectURL(pendingShowcasePreviewUrl);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
              International Applicants
            </h1>
            <p className="text-gray-600 text-sm sm:text-base">
              Manage international staff applications
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
          <div>
            <p className="text-gray-600 text-xs sm:text-sm">Pending</p>
            <p className="text-xl sm:text-2xl font-bold text-yellow-600">
              {pendingCount}
            </p>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 border-l-4 border-blue-400">
          <div>
            <p className="text-gray-600 text-xs sm:text-sm">Vetted</p>
            <p className="text-xl sm:text-2xl font-bold text-blue-600">
              {vettedCount}
            </p>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 border-l-4 border-green-400">
          <div>
            <p className="text-gray-600 text-xs sm:text-sm">Approved</p>
            <p className="text-xl sm:text-2xl font-bold text-green-600">
              {approvedCount}
            </p>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 border-l-4 border-red-400">
          <div>
            <p className="text-gray-600 text-xs sm:text-sm">Rejected</p>
            <p className="text-xl sm:text-2xl font-bold text-red-600">
              {rejectedCount}
            </p>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 border-l-4 border-purple-400">
          <div>
            <p className="text-gray-600 text-xs sm:text-sm">Hired</p>
            <p className="text-xl sm:text-2xl font-bold text-purple-600">
              {hiredCount}
            </p>
          </div>
        </div>
      </div>

      {/* Applicants Table */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-purple-100">
        <div className="bg-gradient-to-r from-purple-600 to-purple-700 px-4 sm:px-6 py-3 sm:py-4">
          <h2 className="text-lg sm:text-xl font-bold text-white">
            International Applications ({filteredApplicants.length})
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
                      SSL-IAP-ID/{app.id}
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
                        onClick={() => setSelectedApplicant(ensureArrays(app))}
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
                          {selectedApplicant.age ?? "N/A"}
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
                    {selectedApplicant.religion && (
                      <div className="flex items-start gap-3">
                        <Heart className="w-4 h-4 text-gray-500 mt-1" />
                        <div>
                          <p className="text-xs text-gray-500 font-medium">
                            Religion
                          </p>
                          <p className="text-sm text-gray-900">
                            {selectedApplicant.religion}
                          </p>
                        </div>
                      </div>
                    )}
                    {selectedApplicant.maritalStatus && (
                      <div className="flex items-start gap-3">
                        <Users className="w-4 h-4 text-gray-500 mt-1" />
                        <div>
                          <p className="text-xs text-gray-500 font-medium">
                            Marital Status
                          </p>
                          <p className="text-sm text-gray-900">
                            {Array.isArray(selectedApplicant.maritalStatus)
                              ? selectedApplicant.maritalStatus.join(", ")
                              : selectedApplicant.maritalStatus}
                          </p>
                        </div>
                      </div>
                    )}
                    {selectedApplicant.numberOfKids && (
                      <div className="flex items-start gap-3">
                        <Users className="w-4 h-4 text-gray-500 mt-1" />
                        <div>
                          <p className="text-xs text-gray-500 font-medium">
                            Number of Kids
                          </p>
                          <p className="text-sm text-gray-900">
                            {selectedApplicant.numberOfKids}
                          </p>
                        </div>
                      </div>
                    )}
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
                    {selectedApplicant.educationLevel && (
                      <div className="flex items-start gap-3">
                        <GraduationCap className="w-4 h-4 text-gray-500 mt-1" />
                        <div>
                          <p className="text-xs text-gray-500 font-medium">
                            Education Level
                          </p>
                          <p className="text-sm text-gray-900">
                            {Array.isArray(selectedApplicant.educationLevel)
                              ? selectedApplicant.educationLevel.join(", ")
                              : selectedApplicant.educationLevel}
                          </p>
                        </div>
                      </div>
                    )}
                    {selectedApplicant.currentSalary && (
                      <div className="flex items-start gap-3">
                        <DollarSign className="w-4 h-4 text-gray-500 mt-1" />
                        <div>
                          <p className="text-xs text-gray-500 font-medium">
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
              </div>

              {/* Media Files Section */}
              <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <ImageIcon className="w-5 h-5 text-purple-600" />
                  Documents & Media Files
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Helper to prefix API_BASE */}
                  {(() => {
                    const prefix = (path?: string) =>
                      path ? `${API_BASE}${path}` : "";
                    return null; // just for scoping
                  })()}

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
                                selectedApplicant.passportPhotos ?? [],
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
                                selectedApplicant.fullPhotos ?? [],
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
                                  selectedApplicant.nationalIdPhotos ?? [],
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
                                selectedApplicant.showcasePhotos ?? [],
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
                                href={`${API_BASE}${video}`}
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
                          onChange={(e) => handleSelectForPreview(e)}
                          className="flex-1 px-3 py-2 border border-yellow-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent text-sm"
                        />
                        {pendingShowcaseFile && (
                          <button
                            onClick={() => {
                              if (pendingShowcasePreviewUrl)
                                URL.revokeObjectURL(pendingShowcasePreviewUrl);
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
                        <div className="mt-3 flex items-center gap-3">
                          <img
                            src={pendingShowcasePreviewUrl}
                            alt="Preview"
                            className="w-32 h-32 object-cover rounded-lg border border-yellow-300"
                          />
                          <div className="flex flex-col gap-2">
                            <button
                              onClick={() =>
                                uploadShowcasePhoto(selectedApplicant.id)
                              }
                              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm disabled:opacity-50 transition-colors flex items-center gap-2"
                              disabled={actionLoading}
                            >
                              <Upload className="w-4 h-4" />
                              {actionLoading ? "Uploading..." : "Upload Photo"}
                            </button>
                          </div>
                        </div>
                      )}

                      {/* show existing showcase photos */}
                      {selectedApplicant.showcasePhotos &&
                        selectedApplicant.showcasePhotos.length > 0 && (
                          <div className="mt-3">
                            <p className="text-sm font-medium text-gray-600 mb-2">
                              Existing Photos:
                            </p>
                            <div className="grid grid-cols-3 gap-2">
                              {selectedApplicant.showcasePhotos.map(
                                (url, idx) => (
                                  <div key={idx} className="relative group">
                                    <img
                                      src={url}
                                      alt={`showcase-${idx}`}
                                      className="w-full h-20 object-cover rounded-lg border border-gray-200 hover:border-purple-300 transition-colors"
                                    />
                                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all rounded-lg flex items-center justify-center">
                                      <Eye className="w-4 h-4 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </div>
                                  </div>
                                )
                              )}
                            </div>
                          </div>
                        )}
                    </div>

                    {/* YouTube Video Upload */}
                    <div className="space-y-3">
                      <label className="block text-sm font-medium text-gray-700">
                        YouTube Video Link
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="url"
                          placeholder="Enter YouTube URL"
                          value={youtubeUrl}
                          onChange={(e) => setYoutubeUrl(e.target.value)}
                          className="flex-1 px-3 py-2 border border-yellow-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent text-sm"
                        />
                        <button
                          onClick={() =>
                            uploadYoutubeLink(selectedApplicant.id, youtubeUrl)
                          }
                          disabled={actionLoading || !youtubeUrl.trim()}
                          className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg disabled:opacity-50 transition-colors flex items-center gap-2"
                        >
                          <Upload className="w-4 h-4" />
                          {actionLoading ? "Adding..." : "Add Video"}
                        </button>
                      </div>

                      {/* existing video urls list */}
                      {selectedApplicant.videos &&
                        selectedApplicant.videos.length > 0 && (
                          <div className="mt-3">
                            <p className="text-sm font-medium text-gray-600 mb-2">
                              Existing Videos:
                            </p>
                            <div className="space-y-2">
                              {selectedApplicant.videos.map((v, i) => (
                                <div
                                  key={i}
                                  className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
                                >
                                  <Video className="w-5 h-5 text-purple-600" />
                                  <a
                                    href={v}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="text-sm text-blue-600 hover:text-blue-800 underline flex-1 truncate"
                                  >
                                    {v}
                                  </a>
                                  <Eye className="w-4 h-4 text-gray-500" />
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                    </div>
                  </div>
                </div>
              )}

              {/* Generate CV Section */}
              <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-purple-600" />
                  Generate CV
                </h3>
                <GenerateCVButton id={selectedApplicant.id} />
              </div>

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
                      onClick={() =>
                        handleVetAction(selectedApplicant.id, "approve")
                      }
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
