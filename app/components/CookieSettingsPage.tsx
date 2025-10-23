"use client";

import { useEffect, useState } from "react";

type CookiePrefs = {
  necessary: boolean;
  analytics: boolean;
  marketing: boolean;
};

const PREFS_KEY = "cookie_prefs";

export default function CookiesSettingsPage() {
  const [prefs, setPrefs] = useState<CookiePrefs>({
    necessary: true,
    analytics: false,
    marketing: false,
  });

  const [changed, setChanged] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(PREFS_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        setPrefs((prev) => ({ ...prev, ...parsed }));
      }
    } catch {}
  }, []);

  const save = () => {
    localStorage.setItem(PREFS_KEY, JSON.stringify(prefs));
    localStorage.setItem("cookie_consent", "true");
    setChanged(false);
    alert("Preferences saved");
  };

  const toggle = (key: keyof CookiePrefs) => {
    if (key === "necessary") return; // always on
    setPrefs((p) => {
      setChanged(true);
      return { ...p, [key]: !p[key] };
    });
  };

  const acceptAll = () => {
    setPrefs({ necessary: true, analytics: true, marketing: true });
    setChanged(true);
  };

  const rejectAll = () => {
    setPrefs({ necessary: true, analytics: false, marketing: false });
    setChanged(true);
  };

  return (
    <main className="container mx-auto px-4 py-12 max-w-3xl">
      <h1 className="text-3xl font-bold text-purple-800 mb-6">
        Cookie Settings
      </h1>
      <p className="text-gray-700 mb-6">
        Choose which categories of cookies to allow. Necessary cookies are
        always enabled to provide core functionality.
      </p>

      <div className="space-y-4">
        {/* Necessary */}
        <div className="flex items-start justify-between bg-white rounded-lg border p-4">
          <div>
            <p className="font-semibold text-gray-900">Necessary</p>
            <p className="text-sm text-gray-600">
              Required for site functionality.
            </p>
          </div>
          <input
            type="checkbox"
            className="toggle toggle-primary"
            checked
            readOnly
          />
        </div>

        {/* Analytics */}
        <div className="flex items-start justify-between bg-white rounded-lg border p-4">
          <div>
            <p className="font-semibold text-gray-900">Analytics</p>
            <p className="text-sm text-gray-600">
              Helps us understand usage (e.g., Google Analytics).
            </p>
          </div>
          <input
            type="checkbox"
            className="toggle toggle-primary"
            checked={prefs.analytics}
            onChange={() => toggle("analytics")}
          />
        </div>

        {/* Marketing */}
        <div className="flex items-start justify-between bg-white rounded-lg border p-4">
          <div>
            <p className="font-semibold text-gray-900">Marketing</p>
            <p className="text-sm text-gray-600">
              Personalized content and ads.
            </p>
          </div>
          <input
            type="checkbox"
            className="toggle toggle-primary"
            checked={prefs.marketing}
            onChange={() => toggle("marketing")}
          />
        </div>
      </div>

      {/* Buttons */}
      <div className="mt-6 flex gap-3 flex-wrap">
        <button
          onClick={save}
          disabled={!changed}
          className="btn btn-primary bg-purple-600 hover:bg-purple-700 disabled:opacity-50"
        >
          Save Preferences
        </button>
        <button onClick={acceptAll} className="btn btn-success">
          Accept All
        </button>
        <button onClick={rejectAll} className="btn btn-outline">
          Reject All
        </button>
        <a href="/privacy" className="btn">
          Privacy Policy
        </a>
        <a href="/terms" className="btn">
          Terms
        </a>
      </div>
    </main>
  );
}
