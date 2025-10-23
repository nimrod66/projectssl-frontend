"use client";

import { useEffect, useRef, useState } from "react";
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

// Add minimal DTO for media upload responses
interface MediaFileDto {
  fileUrl: string;
}

const jobInterestMap: Record<string, string> = {
  LOCAL_JOBS: "Local Jobs",
  INTERNATIONAL_JOBS: "International Jobs",
};

export default function AdminBodySection() {
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
  const [pendingVideoFile, setPendingVideoFile] = useState<File | null>(null);
  const [pendingVideoPreviewUrl, setPendingVideoPreviewUrl] = useState<
    string | null
  >(null);

  const API_BASE = process.env.NEXT_PUBLIC_API_BASE;

  const [filteredApplicants, setFilteredApplicants] = useState<Applicant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdatedAt, setLastUpdatedAt] = useState<number | null>(null);
  const pollingTimerRef = useRef<NodeJS.Timeout | null>(null);
  const currentIntervalMsRef = useRef<number>(30000);
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
      currentIntervalMsRef.current = 30000; // reset backoff on success
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
  // initial load
  useEffect(() => {
    fetchApplicants();
  }, []);

  // debounce search input
  useEffect(() => {
    const t = setTimeout(() => setSearchQuery(searchInput), 250);
    return () => clearTimeout(t);
  }, [searchInput]);

  // derived filtering when inputs change
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
    field: "showcasePhotos" | "videos"
  ): Promise<string | null> => {
    const formData = new FormData();
    // Backend expects key name "files" (List<MultipartFile>) even for single file
    formData.append("files", file);

    try {
      setIsUploading(true);
      // Use correct media endpoints
      const endpoint =
        field === "showcasePhotos"
          ? `/api/media/${applicantId}/showcase`
          : `/api/media/${applicantId}/videos`;

      const res = await api.post<MediaFileDto[]>(endpoint, formData);
      const first = res.data && res.data[0]?.fileUrl;
      return first || null;
    } catch (err) {
      console.error("Upload failed", err);
      toast.error("Upload failed");
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  // Handle file selection for preview (no immediate upload)
  const handleSelectForPreview = (
    e: React.ChangeEvent<HTMLInputElement>,
    file: File,
    field: "showcasePhotos" | "videos"
  ) => {
    if (field === "showcasePhotos") {
      if (pendingShowcasePreviewUrl)
        URL.revokeObjectURL(pendingShowcasePreviewUrl);
      setPendingShowcaseFile(file);
      setPendingShowcasePreviewUrl(URL.createObjectURL(file));
    } else {
      if (pendingVideoPreviewUrl) URL.revokeObjectURL(pendingVideoPreviewUrl);
      setPendingVideoFile(file);
      setPendingVideoPreviewUrl(URL.createObjectURL(file));
    }
    if (e.target) e.target.value = ""; // allow re-selecting same file
  };

  // On modal close, cleanup previews
  useEffect(() => {
    return () => {
      if (pendingShowcasePreviewUrl)
        URL.revokeObjectURL(pendingShowcasePreviewUrl);
      if (pendingVideoPreviewUrl) URL.revokeObjectURL(pendingVideoPreviewUrl);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // When switching selected applicant, reset pending selections
  useEffect(() => {
    if (!selectedApplicant) {
      if (pendingShowcasePreviewUrl)
        URL.revokeObjectURL(pendingShowcasePreviewUrl);
      if (pendingVideoPreviewUrl) URL.revokeObjectURL(pendingVideoPreviewUrl);
      setPendingShowcaseFile(null);
      setPendingShowcasePreviewUrl(null);
      setPendingVideoFile(null);
      setPendingVideoPreviewUrl(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedApplicant?.id]);

  // Approve handler that uploads pending files first, then approves
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

      // Upload pending video if any
      if (pendingVideoFile) {
        const path = await uploadFile(id, pendingVideoFile, "videos");
        if (!path) throw new Error("Failed to upload video");
        setApplicants((prev) =>
          prev.map((a) =>
            a.id === id ? { ...a, videos: [...a.videos, path] } : a
          )
        );
        setSelectedApplicant((prev) =>
          prev ? { ...prev, videos: [...prev.videos, path] } : prev
        );
      }

      // Ensure both exist now before approving
      const hasPhoto =
        pendingShowcaseFile || selectedApplicant.showcasePhotos.length > 0;
      const hasVideo = pendingVideoFile || selectedApplicant.videos.length > 0;
      if (!hasPhoto || !hasVideo) {
        toast.error(
          "Please add and preview both a photo and a video before approval."
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

  // Mark applicant as vetted
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

  // Hire applicant
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

  // Restore applicant
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

  // Soft delete applicant (frontend only)
  const handleSoftDelete = (id: number) => {
    if (
      !confirm(
        "Are you sure you want to soft delete this applicant? This will remove them from the view."
      )
    ) {
      return;
    }

    // Remove from applicants list (frontend only)
    setApplicants((prev) => prev.filter((app) => app.id !== id));
    setSelectedApplicant(null);
    toast.success("Applicant removed from view");
  };

  const handleUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    file: File,
    field: "showcasePhotos" | "videos"
  ) => {
    if (!selectedApplicant) return;
    const path = await uploadFile(selectedApplicant.id, file, field);
    if (!path) return;

    // Update selected applicant and the global list immediately
    setSelectedApplicant((prev) => {
      if (!prev) return prev;
      const updated: Applicant = {
        ...prev,
        [field]: [...prev[field], path] as unknown as Applicant[typeof field],
      };
      setApplicants((apps) =>
        apps.map((a) => (a.id === prev.id ? (updated as Applicant) : a))
      );
      return updated;
    });

    // clear input value to allow re-uploading the same file if needed
    if (e.target) {
      e.target.value = "";
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
      </div>

      {/* States */}
      {loading && applicants.length === 0 && (
        <div className="flex items-center justify-center py-16">
          <div className="flex items-center gap-3 text-purple-700">
            <span className="h-5 w-5 rounded-full border-2 border-purple-300 border-t-purple-700 animate-spin" />
            <span className="font-medium">Loading…</span>
          </div>
        </div>
      )}
      {!loading && error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 mb-4">
          <div className="flex items-start gap-3">
            <span className="mt-1">⚠️</span>
            <div>
              <p className="font-semibold">Failed to load applications</p>
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
          <p className="font-semibold">No applications found</p>
          <p className="text-sm mt-1">Try changing your search.</p>
        </div>
      )}

      {/* Applicants Table */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-purple-100">
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
                      ) : selectedApplicant.showcasePhotos.length > 0 ? (
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
                      ) : selectedApplicant.videos.length > 0 ? (
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
                    className="bg-red-500 hover:bg-red-600 text-white px-4 sm:px-6 py-2 rounded-lg flex items-center gap-2 transition-colors text-sm"
                    onClick={() =>
                      handleVetAction(selectedApplicant.id, "reject")
                    }
                    disabled={actionLoading}
                  >
                    <XCircle className="w-4 h-4" />
                    Reject
                  </button>
                )}

                {selectedApplicant.status === "PENDING" && (
                  <button
                    className="bg-blue-500 hover:bg-blue-600 text-white px-4 sm:px-6 py-2 rounded-lg transition-colors text-sm"
                    onClick={() => handleMarkAsVetted(selectedApplicant.id)}
                    disabled={actionLoading}
                  >
                    Mark as Vetted
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
                          selectedApplicant.showcasePhotos.length > 0) &&
                        (pendingVideoFile ||
                          selectedApplicant.videos.length > 0)
                      )
                    }
                    className="px-4 py-2 bg-green-500 text-white rounded-lg disabled:opacity-50"
                  >
                    Approve
                  </button>
                )}
                {selectedApplicant.status === "APPROVED" && (
                  <button
                    className="bg-purple-600 hover:bg-purple-700 text-white px-4 sm:px-6 py-2 rounded-lg flex items-center gap-2 transition-colors text-sm"
                    onClick={() => handleHire(selectedApplicant.id)}
                    disabled={actionLoading}
                  >
                    <CheckCircle className="w-4 h-4" />
                    Hire
                  </button>
                )}

                {selectedApplicant.status === "HIRED" && (
                  <button
                    className="bg-orange-500 hover:bg-orange-600 text-white px-4 sm:px-6 py-2 rounded-lg flex items-center gap-2 transition-colors text-sm"
                    onClick={() => handleRestore(selectedApplicant.id)}
                    disabled={actionLoading}
                  >
                    <Clock className="w-4 h-4" />
                    Restore
                  </button>
                )}

                {/* Soft Delete Button - Available for all applicants */}
                <button
                  className="bg-red-500 hover:bg-red-600 text-white px-4 sm:px-6 py-2 rounded-lg flex items-center gap-2 transition-colors text-sm"
                  onClick={() => handleSoftDelete(selectedApplicant.id)}
                  disabled={actionLoading}
                >
                  <XCircle className="w-4 h-4" />
                  Delete
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
