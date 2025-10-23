"use client";
import { useEffect, useState } from "react";
import ApplicantsModal from "./ApplicantsModal";
import FilterSection from "./FilterSection";

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

const API_BASE = process.env.NEXT_PUBLIC_API_BASE;

export default function ApplicantsSection() {
  const [maids, setMaids] = useState<Applicant[]>([]);
  const [filteredMaids, setFilteredMaids] = useState<Applicant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<Applicant | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    const fetchMaids = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch(`${API_BASE}/api/applications/public`);
        if (!res.ok)
          throw new Error(`Failed to load applications: ${res.status}`);
        const data = await res.json();
        const loaded = Array.isArray(data) ? data : [];
        setMaids(loaded);
        setFilteredMaids(loaded);
      } catch (e: any) {
        setError(e?.message || "Failed to load applications");
      } finally {
        setLoading(false);
      }
    };
    fetchMaids();
  }, []);

  const openModal = (maid: Applicant) => {
    setSelected(maid);
    setIsOpen(true);
  };

  const closeModal = () => {
    setIsOpen(false);
    setSelected(null);
  };

  return (
    <section className="flex flex-col lg:flex-row gap-6">
      {/* Sidebar Filters */}
      <aside className="hidden lg:block w-full lg:w-1/3 xl:w-1/3">
        <FilterSection applicants={maids} setFiltered={setFilteredMaids} />
      </aside>

      {/* Mobile Filters */}
      <div className="lg:hidden mb-4">
        <button
          onClick={() => setShowFilters(true)}
          className="px-4 py-2 bg-purple-600 text-white rounded-lg shadow"
        >
          Filters
        </button>
      </div>

      {showFilters && (
        <div className="fixed inset-0 z-50 flex">
          <div
            className="flex-1 bg-black/50"
            onClick={() => setShowFilters(false)}
          />
          <div className="w-3/4 max-w-sm bg-white shadow-lg p-4 overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Filters</h2>
              <button
                onClick={() => setShowFilters(false)}
                className="text-gray-600"
              >
                ✕
              </button>
            </div>
            <FilterSection applicants={maids} setFiltered={setFilteredMaids} />
          </div>
        </div>
      )}

      {/* Applicants List / Grid */}
      <div className="w-full">
        {/* States */}
        {loading && (
          <div className="flex items-center justify-center py-16">
            <div className="flex items-center gap-3 text-purple-700">
              <span className="h-5 w-5 rounded-full border-2 border-purple-300 border-t-purple-700 animate-spin" />
              <span className="font-medium">Loading applicants…</span>
            </div>
          </div>
        )}
        {!loading && error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <span className="mt-1">⚠️</span>
              <div>
                <p className="font-semibold">Failed to load applicants</p>
                <p className="text-sm">{error}</p>
                <button
                  onClick={() => {
                    setError(null);
                    setLoading(true);
                    fetch(`${API_BASE}/api/applications/public`)
                      .then((r) => r.json())
                      .then((d) => {
                        const loaded = Array.isArray(d) ? d : [];
                        setMaids(loaded);
                        setFilteredMaids(loaded);
                      })
                      .catch((e) => setError(e?.message || "Failed to load"))
                      .finally(() => setLoading(false));
                  }}
                  className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-red-600 text-white hover:bg-red-700"
                >
                  Retry
                </button>
              </div>
            </div>
          </div>
        )}
        {!loading && !error && filteredMaids.length === 0 && (
          <div className="bg-purple-50 border border-purple-200 text-purple-800 rounded-xl p-6">
            <p className="font-semibold">No applicants found</p>
            <p className="text-sm mt-1">Try adjusting your filters.</p>
          </div>
        )}
        {/* Desktop: List */}
        {!loading && !error && filteredMaids.length > 0 && (
          <div className="hidden lg:flex flex-col gap-4">
            {filteredMaids.map((maid) => (
              <div
                key={maid.id}
                className="flex items-center gap-4 bg-white border border-purple-100 rounded-xl shadow hover:shadow-md transition cursor-pointer overflow-hidden"
                onClick={() => openModal(maid)}
              >
                <div className="w-28 h-40 flex-shrink-0 bg-gray-100 rounded-l-xl overflow-hidden flex items-center justify-center">
                  {maid.showcasePhotos?.[0] ? (
                    <img
                      src={`${API_BASE}${maid.showcasePhotos[0]}`}
                      alt={maid.fullName}
                      className="w-full h-full object-contain"
                      loading="lazy"
                      decoding="async"
                    />
                  ) : (
                    <span className="text-gray-400 text-2xl">No Image</span>
                  )}
                </div>
                <div className="flex-1 p-4 flex flex-col gap-1">
                  <h3 className="text-lg font-bold text-purple-800">
                    {maid.fullName}
                  </h3>
                  <p className="text-gray-700 flex items-center gap-2">
                    👉{" "}
                    <span className="font-semibold text-purple-700">
                      {maid.age ?? "N/A"} years
                    </span>{" "}
                    •{" "}
                    <span className="font-medium text-purple-600">
                      {maid.currentLocation}
                    </span>
                  </p>
                  <p className="text-gray-700 flex items-center gap-2">
                    👉{" "}
                    <span className="font-medium text-purple-700">
                      {maid.experience || "No experience info"}
                    </span>
                  </p>
                  {maid.languages?.length > 0 && (
                    <div className="flex flex-wrap gap-2 items-center">
                      👉{" "}
                      {maid.languages.map((lang, i) => (
                        <span
                          key={i}
                          className="bg-purple-50 text-purple-800 px-2 py-1 rounded-full text-xs font-semibold border border-purple-100"
                        >
                          {lang}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Mobile / Tablet: Grid */}
        {!loading && !error && filteredMaids.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:hidden gap-4">
            {filteredMaids.map((maid) => (
              <div
                key={maid.id}
                className="bg-white border border-purple-100 rounded-xl shadow hover:shadow-md transition cursor-pointer overflow-hidden"
                onClick={() => openModal(maid)}
              >
                <div
                  className="relative w-full bg-gray-100 rounded-t-xl flex items-center justify-center overflow-hidden"
                  style={{ aspectRatio: "3 / 4" }}
                >
                  {maid.showcasePhotos?.[0] ? (
                    <img
                      src={`${API_BASE}${maid.showcasePhotos[0]}`}
                      alt={maid.fullName}
                      className="w-full h-full object-contain"
                      loading="lazy"
                      decoding="async"
                    />
                  ) : (
                    <span className="text-gray-400 text-2xl">No Image</span>
                  )}
                  {maid.videos.length > 0 && (
                    <span className="absolute top-2 right-2 bg-purple-600 text-white px-2 py-1 rounded-md text-xs font-semibold shadow">
                      Video
                    </span>
                  )}
                </div>
                <div className="p-3 space-y-2 bg-purple-50 rounded-b-xl">
                  <h3 className="text-base font-bold text-purple-800 truncate">
                    {maid.fullName}
                  </h3>
                  <p className="text-gray-700 text-sm flex items-center gap-2">
                    👉{" "}
                    <span className="font-semibold text-purple-700">
                      {maid.age ?? "N/A"} years
                    </span>{" "}
                    •{" "}
                    <span className="font-medium text-purple-600">
                      {maid.currentLocation}
                    </span>
                  </p>
                  <p className="text-gray-700 text-sm flex items-center gap-2">
                    👉{" "}
                    <span className="font-medium text-purple-700">
                      {maid.experience || "No experience info"}
                    </span>
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Applicant Modal */}
      {isOpen && (
        <ApplicantsModal
          isOpen={isOpen}
          onClose={closeModal}
          applicant={selected}
        />
      )}
    </section>
  );
}
