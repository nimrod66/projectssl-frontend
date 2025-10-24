"use client";

import { useEffect, useRef, useState } from "react";
import api from "@/app/staff/auth/api";
import toast from "react-hot-toast";

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

export default function InternationalApplicants() {
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
}
