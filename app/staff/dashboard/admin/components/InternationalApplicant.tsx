"use client";

import { useEffect, useRef, useState } from "react";
import api from "@/app/staff/auth/api";
import toast from "react-hot-toast";

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

  passportPhotos: string[];
  fullPhotos: string[];
  nationalIdPhotos: string[];
  resumes: string[];
  birthCertificates: string[];
  goodConducts: string[];
  videos: string[];
  showcasePhotos: string[];
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

  const pollingTimerRef = useRef<NodeJS.Timeout | null>(null);
  const currentIntervalMsRef = useRef<number>(30000);
  const abortControllerRef = useRef<AbortController | null>(null);

  /** -------------------------------
   * FETCH APPLICANTS
   * ------------------------------- */
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

      const data = res.data || [];
      setApplicants(data);
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
  }, []);

  /** -------------------------------
   * SEARCH & FILTER
   * ------------------------------- */
  useEffect(() => {
    const t = setTimeout(() => setSearchQuery(searchInput), 250);
    return () => clearTimeout(t);
  }, [searchInput]);

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

  /** -------------------------------
   * POLLING
   * ------------------------------- */
  useEffect(() => {
    const schedule = () => {
      if (pollingTimerRef.current) clearTimeout(pollingTimerRef.current);
      pollingTimerRef.current = setTimeout(() => {
        if (document.visibilityState === "visible")
          fetchApplicants({ silent: true });
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

  /** -------------------------------
   * UPLOAD YOUTUBE LINK
   * ------------------------------- */
  const uploadYoutubeLink = async (applicantId: number, youtubeUrl: string) => {
    if (!youtubeUrl.trim()) {
      toast.error("Please enter a valid YouTube URL");
      return;
    }
    try {
      setActionLoading(true);
      const res = await api.post<MediaFileDto>(
        `/api/media/inter/${applicantId}/video-link`,
        null,
        {
          params: { youtubeUrl },
        }
      );
      // Update local state
      setApplicants((prev) =>
        prev.map((app) =>
          app.id === applicantId
            ? { ...app, videos: [...app.videos, res.data.fileUrl] }
            : app
        )
      );
      setSelectedApplicant((prev) =>
        prev ? { ...prev, videos: [...prev.videos, res.data.fileUrl] } : prev
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

  /** -------------------------------
   * VET / APPROVE / REJECT / HIRE / RESTORE
   * ------------------------------- */
  const handleVetAction = async (id: number, action: "approve" | "reject") => {
    if (
      action === "approve" &&
      selectedApplicant &&
      (selectedApplicant.showcasePhotos.length === 0 ||
        selectedApplicant.videos.length === 0)
    ) {
      toast.error("Please upload both photo and video before approval.");
      return;
    }

    try {
      setActionLoading(true);
      const res = await api.patch<InternationalApplicant>(
        `/api/international/${id}/${action}`
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

  const handleMarkAsVetted = async (id: number) => {
    try {
      setActionLoading(true);
      const res = await api.patch<InternationalApplicant>(
        `/api/international/${id}/vet`
      );
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

  const handleHire = async (id: number) => {
    try {
      setActionLoading(true);
      const res = await api.patch<InternationalApplicant>(
        `/api/international/${id}/hired`
      );
      setApplicants((prev) =>
        prev.map((app) => (app.id === id ? res.data : app))
      );
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
      setApplicants((prev) =>
        prev.map((app) => (app.id === id ? res.data : app))
      );
      setSelectedApplicant(null);
      toast.success("Restored to pool");
    } catch (err) {
      console.error(err);
      toast.error("Failed to restore");
    } finally {
      setActionLoading(false);
    }
  };

  /** -------------------------------
   * STATUS COUNTS
   * ------------------------------- */
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
