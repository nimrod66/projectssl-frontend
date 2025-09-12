"use client";
import { useState } from "react";

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
  const companyPhone = "+254700000000";
  const waNumber = companyPhone.replace(/[^0-9]/g, "");
  const waText = encodeURIComponent(
    `Hello, I'm interested in hiring ${applicant.fullName}.`
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
    { key: "olderThan1", label: "Children older than 1 yr" },
    { key: "youngerThan1", label: "Children younger than 1 yr" },
  ];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-2 sm:p-4">
      <div className="bg-white rounded-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-lg">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-gray-200 sticky top-0 bg-white z-10">
          <h2 className="text-lg sm:text-xl font-bold text-purple-800">
            Applicant Profile
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 space-y-6">
          {/* Showcase / Video */}
          <div className="flex flex-col sm:flex-row gap-4">
            {!showVideo ? (
              <button
                onClick={() => setShowVideo(true)}
                className="relative w-full sm:w-1/2 h-64 sm:h-72 rounded-lg overflow-hidden bg-gray-200 group"
              >
                <img
                  src={`${API_BASE}${applicant.showcasePhotos?.[0]}`}
                  alt={applicant.fullName}
                  className="w-full h-full object-cover"
                />
                {applicant.videos.length > 0 && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/50 transition">
                    <span className="text-white text-lg sm:text-xl font-semibold bg-purple-600 px-4 py-2 rounded-full shadow-lg">
                      ▶ Watch Video
                    </span>
                  </div>
                )}
              </button>
            ) : (
              <video
                className="w-full sm:w-1/2 h-64 sm:h-72 object-cover rounded-lg"
                controls
                autoPlay
              >
                <source
                  src={`${API_BASE}${applicant.videos?.[0]}`}
                  type="video/mp4"
                />
              </video>
            )}

            {/* Info */}
            <div className="flex-1 space-y-3">
              <h3 className="text-xl sm:text-2xl font-bold text-purple-800">
                {applicant.fullName}
              </h3>
              <p className="text-gray-600 text-sm sm:text-base">
                {applicant.age ?? "N/A"} yrs • {applicant.currentLocation}
              </p>
              <p className="text-gray-700 text-sm sm:text-base">
                {applicant.experience}
              </p>

              {/* Languages */}
              {applicant.languages.length > 0 && (
                <div>
                  <h4 className="font-semibold text-purple-800 mb-1">
                    Languages
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {applicant.languages.map((lang, i) => (
                      <span
                        key={i}
                        className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm"
                      >
                        {lang}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Attributes */}
              <div>
                <h4 className="font-semibold text-purple-800 mb-1">
                  Attributes
                </h4>
                <div className="flex flex-wrap gap-2">
                  {optionalBadges.map(
                    (b) =>
                      applicant[b.key as keyof Applicant] && (
                        <span
                          key={b.key}
                          className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm"
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
                className="block w-full bg-green-500 hover:bg-green-600 text-white rounded-lg py-2 px-4 text-center font-medium mt-3"
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
