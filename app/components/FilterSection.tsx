import { useState, useEffect } from "react";

interface Filters {
  hasCat?: boolean;
  hasDog?: boolean;
  extraPay?: boolean;
  liveOut?: boolean;
  privateRoom?: boolean;
  elderlyCare?: boolean;
  specialNeeds?: boolean;
  olderThan1?: boolean;
  youngerThan1?: boolean;
  currentLocation?: string;
}

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

interface FilterSectionProps {
  applicants: Applicant[];
  setFiltered: (filtered: Applicant[]) => void;
}

export default function FilterSection({
  applicants,
  setFiltered,
}: FilterSectionProps) {
  const [filters, setFilters] = useState<Filters>({
    currentLocation: "all",
  });

  const [locations, setLocations] = useState<
    { id: string; name: string; count: number }[]
  >([]);

  const API_BASE = process.env.NEXT_PUBLIC_API_BASE;

  // Build locations dynamically based on applicants
  useEffect(() => {
    if (!applicants) return;
    const locMap: Record<string, number> = { all: applicants.length };
    applicants.forEach((a) => {
      const loc = (a.currentLocation || "other").toLowerCase();
      locMap[loc] = (locMap[loc] || 0) + 1;
    });
    const locs = Object.keys(locMap).map((id) => ({
      id,
      name: id.charAt(0).toUpperCase() + id.slice(1),
      count: locMap[id],
    }));
    setLocations(locs);
  }, [applicants]);

  const handleCheckboxChange = (
    key: Exclude<keyof Filters, "currentLocation">
  ) => {
    setFilters((prev) => {
      const updated = { ...prev };
      if (updated[key]) {
        delete updated[key];
      } else {
        updated[key] = true as boolean;
      }
      return updated;
    });
  };

  const handleLocationChange = (loc: string) => {
    setFilters((prev) => ({
      ...prev,
      currentLocation: loc,
    }));
  };
  // Function to fetch filtered applicants
  const fetchFiltered = async (f: Filters) => {
    const payload: Record<string, any> = {};

    Object.entries(f).forEach(([key, value]) => {
      if (key === "currentLocation") {
        if (value && value !== "all") {
          payload[key] = value;
        }
      } else if (value === true) {
        payload[key] = true;
      }
    });

    const res = await fetch(`${API_BASE}/api/applications/filter`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    setFiltered(data);
  };

  // Auto-fetch when filters change
  useEffect(() => {
    fetchFiltered(filters);
  }, [filters]);

  const clearFilters = () => {
    const reset: Filters = { currentLocation: "all" };
    setFilters(reset);
    fetchFiltered(reset);
  };

  const Section = ({
    title,
    children,
  }: {
    title: string;
    children: React.ReactNode;
  }) => (
    <div className="rounded-xl bg-gray-50 p-4 ring-1 ring-gray-200">
      <h3 className="text-sm font-semibold text-purple-800 mb-3 flex items-center gap-2">
        <span className="inline-block h-2 w-2 rounded-full bg-purple-400"></span>
        {title}
      </h3>
      {children}
    </div>
  );

  const CheckboxRow = ({ children }: { children: React.ReactNode }) => (
    <div className="grid grid-cols-1 gap-2 sm:gap-3 text-gray-800">
      {children}
    </div>
  );

  return (
    <section id="filter">
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        {/* Header */}
        <div className="px-4 sm:px-5 py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base sm:text-lg font-bold">Filter Maids</h2>
              <p className="text-white/80 text-xs">
                Refine by home setup, skills, child care, and location
              </p>
            </div>
            <button
              onClick={clearFilters}
              className="hidden sm:inline-flex items-center text-xs bg-white/10 hover:bg-white/20 px-3 py-1 rounded-md"
            >
              Clear all
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
          <Section title="You have">
            <CheckboxRow>
              {[
                { key: "hasCat", label: "Cat" },
                { key: "hasDog", label: "Dog" },
                { key: "extraPay", label: "Works on off days (extra pay)" },
                { key: "liveOut", label: "Live Out" },
                { key: "privateRoom", label: "Private Maid Room" },
              ].map(({ key, label }) => (
                <label
                  key={key}
                  className="flex items-center gap-3 cursor-pointer bg-white rounded-md border px-3 py-2 hover:bg-gray-50"
                >
                  <input
                    type="checkbox"
                    className="checkbox checkbox-primary w-4 h-4 shrink-0"
                    checked={!!filters[key as keyof Filters]}
                    onChange={() =>
                      handleCheckboxChange(
                        key as Exclude<keyof Filters, "currentLocation">
                      )
                    }
                  />
                  <span className="text-sm break-words">{label}</span>
                </label>
              ))}
            </CheckboxRow>
          </Section>

          <Section title="Special skills">
            <CheckboxRow>
              {[
                { key: "elderlyCare", label: "Elderly Care" },
                { key: "specialNeeds", label: "Special Needs Care" },
              ].map(({ key, label }) => (
                <label
                  key={key}
                  className="flex items-center gap-3 cursor-pointer bg-white rounded-md border px-3 py-2 hover:bg-gray-50"
                >
                  <input
                    type="checkbox"
                    className="checkbox checkbox-primary w-4 h-4 shrink-0"
                    checked={!!filters[key as keyof Filters]}
                    onChange={() =>
                      handleCheckboxChange(
                        key as Exclude<keyof Filters, "currentLocation">
                      )
                    }
                  />
                  <span className="text-sm break-words">{label}</span>
                </label>
              ))}
            </CheckboxRow>
          </Section>

          <Section title="Babysitting">
            <CheckboxRow>
              {[
                { key: "olderThan1", label: "Older than 1 year" },
                { key: "youngerThan1", label: "Younger than 1 year" },
              ].map(({ key, label }) => (
                <label
                  key={key}
                  className="flex items-center gap-3 cursor-pointer bg-white rounded-md border px-3 py-2 hover:bg-gray-50"
                >
                  <input
                    type="checkbox"
                    className="checkbox checkbox-primary w-4 h-4 shrink-0"
                    checked={!!filters[key as keyof Filters]}
                    onChange={() =>
                      handleCheckboxChange(
                        key as Exclude<keyof Filters, "currentLocation">
                      )
                    }
                  />
                  <span className="text-sm break-words">{label}</span>
                </label>
              ))}
            </CheckboxRow>
          </Section>

          <Section title="Current Location">
            <div className="grid grid-cols-1 gap-2">
              {locations.map((loc) => (
                <label
                  key={loc.id}
                  className="flex items-center justify-between cursor-pointer p-3 bg-white rounded-md border hover:bg-gray-50"
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="currentLocation"
                      className="radio radio-primary w-4 h-4"
                      checked={filters.currentLocation === loc.id}
                      onChange={() => handleLocationChange(loc.id)}
                    />
                    <span className="font-medium text-sm break-words">
                      {loc.name}
                    </span>
                  </div>
                  <span className="text-xs text-gray-500">{loc.count}</span>
                </label>
              ))}
            </div>
          </Section>
        </div>

        {/* Footer */}
        <div className="px-4 sm:px-5 py-4 border-t border-gray-200 bg-white flex flex-col sm:flex-row gap-2 sm:gap-3">
          <button
            onClick={clearFilters}
            className="btn btn-outline btn-sm flex-1 text-sm"
          >
            Reset
          </button>
          <button
            onClick={() => fetchFiltered(filters)}
            className="btn btn-primary btn-sm flex-1 bg-purple-600 hover:bg-purple-700 text-sm"
          >
            Apply
          </button>
        </div>
      </div>
    </section>
  );
}
