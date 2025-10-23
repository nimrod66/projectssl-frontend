"use client";
import { useEffect, useState } from "react";

interface Applicant {
  id: number;
  fullName: string;
  age?: number;
  nationality?: string;
  experience?: string;
  currentLocation?: string;
  languages: string[];
  videos: string[];
  showcasePhotos: string[];
  hasCat?: boolean;
  hasDog?: boolean;
  extraPay?: boolean;
  liveOut?: boolean;
  privateRoom?: boolean;
  elderlyCare?: boolean;
  specialNeeds?: boolean;
  olderThan1?: boolean;
  youngerThan1?: boolean;
}

interface ApplicantsModalProps {
  isOpen: boolean;
  onClose: () => void;
  applicant: Applicant | null;
}

export default function ApplicantsModal({
  isOpen,
  onClose,
  applicant,
}: ApplicantsModalProps) {
  const [showVideo, setShowVideo] = useState(false);
  if (!isOpen || !applicant) return null;

  const API_BASE = process.env.NEXT_PUBLIC_API_BASE;
  const companyPhone = "+254702440101";
  const waNumber = companyPhone.replace(/[^0-9]/g, "");
  const waText = encodeURIComponent(
    `Hello Starnet Agency, I am interested in hiring ${applicant.fullName}.`
  );
  const whatsappLink = `https://wa.me/${waNumber}?text=${waText}`;

  const optionalBadges = [
    { key: "hasCat", label: "Works with cats" },
    { key: "hasDog", label: "Works with dogs" },
    { key: "extraPay", label: "Extra pay on off days" },
    { key: "liveOut", label: "Prefers to live out" },
    { key: "privateRoom", label: "Prefers a private room" },
    { key: "elderlyCare", label: "Elderly care" },
    { key: "specialNeeds", label: "Special needs care" },
    { key: "olderThan1", label: "Children older than 1 year" },
    { key: "youngerThan1", label: "Children younger than 1 year" },
  ];

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  const hasVideo = applicant.videos && applicant.videos.length > 0;
  const coverPhoto = applicant.showcasePhotos?.[0]
    ? `${API_BASE}${applicant.showcasePhotos[0]}`
    : "";
  const videoSrc = hasVideo ? `${API_BASE}${applicant.videos[0]}` : "";

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-2 sm:p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="applicant-modal-title"
    >
      <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-xl border border-purple-100">
        {/* Header */}
        <div className="flex justify-between items-center p-4 sm:p-5 border-b border-purple-100 sticky top-0 bg-white z-10">
          <h2
            id="applicant-modal-title"
            className="text-lg sm:text-xl font-bold text-purple-800"
          >
            Applicant Profile
          </h2>
          <button
            onClick={onClose}
            className="inline-flex items-center justify-center h-9 w-9 rounded-full text-purple-700 hover:text-purple-900 hover:bg-purple-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-400"
            aria-label="Close"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 space-y-6">
          {/* Media / Info Row */}
          <div className="flex flex-col sm:flex-row gap-5">
            <div className="w-full sm:w-1/2">
              <div
                className="relative w-full rounded-xl overflow-hidden bg-gray-100"
                style={{ aspectRatio: "3 / 4" }}
              >
                {!showVideo &&
                  (coverPhoto ? (
                    <img
                      src={coverPhoto}
                      alt={applicant.fullName}
                      className="w-full h-full object-contain"
                      loading="lazy"
                      decoding="async"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      No Image
                    </div>
                  ))}
                {showVideo && hasVideo && (
                  <video
                    className="w-full h-full object-contain bg-black"
                    controls
                    autoPlay
                  >
                    <source src={videoSrc} type="video/mp4" />
                  </video>
                )}
                {hasVideo && (
                  <div className="absolute bottom-3 left-3 flex gap-2">
                    <button
                      onClick={() => setShowVideo(false)}
                      className={`px-3 py-1.5 rounded-full text-sm font-medium shadow ${
                        !showVideo
                          ? "bg-purple-600 text-white"
                          : "bg-white text-purple-700 border border-purple-200"
                      }`}
                    >
                      Photo
                    </button>
                    <button
                      onClick={() => setShowVideo(true)}
                      className={`px-3 py-1.5 rounded-full text-sm font-medium shadow ${
                        showVideo
                          ? "bg-purple-600 text-white"
                          : "bg-white text-purple-700 border border-purple-200"
                      }`}
                    >
                      Video
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Info */}
            <div className="flex-1 space-y-3">
              <h3 className="text-xl sm:text-2xl font-bold text-purple-800">
                {applicant.fullName}
              </h3>
              <p className="text-gray-600 text-sm sm:text-base">
                {applicant.age ?? "N/A"} yrs • {applicant.currentLocation}
              </p>
              {applicant.experience && (
                <p className="text-gray-700 text-sm sm:text-base">
                  {applicant.experience}
                </p>
              )}

              {/* Languages */}
              {applicant.languages.length > 0 && (
                <div>
                  <h4 className="font-semibold text-purple-800 mb-2">
                    Languages
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {applicant.languages.map((lang, i) => (
                      <span
                        key={i}
                        className="bg-purple-50 text-purple-800 px-3 py-1 rounded-full text-sm border border-purple-100"
                      >
                        {lang}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Attributes */}
              <div>
                <h4 className="font-semibold text-purple-800 mb-2">
                  Attributes
                </h4>
                <div className="flex flex-wrap gap-2">
                  {optionalBadges.map(
                    (b) =>
                      applicant[b.key as keyof Applicant] && (
                        <span
                          key={b.key}
                          className="bg-emerald-50 text-emerald-800 px-3 py-1 rounded-full text-sm border border-emerald-100"
                        >
                          {b.label}
                        </span>
                      )
                  )}
                </div>
              </div>

              {/* WhatsApp */}
              <a
                href={whatsappLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 w-full bg-green-500 hover:bg-green-600 text-white rounded-lg py-2.5 px-4 text-center font-medium mt-3 shadow"
              >
                Contact on WhatsApp
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
