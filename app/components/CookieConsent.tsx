"use client";

import { useEffect, useState } from "react";

const PREFS_KEY = "cookie_prefs";

export default function CookieConsent() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    try {
      const consent = localStorage.getItem("cookie_consent");
      if (!consent) {
        setIsOpen(true);
      }
    } catch {
      setIsOpen(true);
    }
  }, []);

  const acceptAll = () => {
    localStorage.setItem(
      PREFS_KEY,
      JSON.stringify({ necessary: true, analytics: true, marketing: true })
    );
    localStorage.setItem("cookie_consent", "true");
    setIsOpen(false);
  };

  const rejectAll = () => {
    localStorage.setItem(
      PREFS_KEY,
      JSON.stringify({ necessary: true, analytics: false, marketing: false })
    );
    localStorage.setItem("cookie_consent", "true");
    setIsOpen(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] pointer-events-none">
      {/* Backdrop to block interaction */}
      <div className="absolute inset-0 bg-black/40" />

      {/* Bottom sheet */}
      <div className="absolute inset-x-0 bottom-0 pointer-events-auto">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 pb-safe">
          <div className="m-4 sm:m-6 rounded-2xl bg-white shadow-2xl ring-1 ring-black/10">
            <div className="p-4 sm:p-6">
              <h2 className="text-base sm:text-lg font-semibold text-gray-900">
                We use cookies
              </h2>
              <p className="mt-2 text-sm text-gray-600">
                We use necessary cookies to make our site work. We’d also like
                to set optional analytics and marketing cookies to help us
                improve it. You can change your choices at any time on the
                Cookies Settings page.
              </p>
              <div className="mt-3 text-sm">
                <a href="/privacy" className="text-purple-700 underline mr-3">
                  Privacy Policy
                </a>
                <a href="/terms" className="text-purple-700 underline">
                  Terms
                </a>
              </div>
              <div className="mt-4 flex flex-col sm:flex-row gap-2 sm:gap-3">
                <a
                  href="/cookies"
                  className="btn btn-outline order-3 sm:order-1"
                >
                  Cookie settings
                </a>
                <button onClick={rejectAll} className="btn btn-neutral order-2">
                  Reject non-essential
                </button>
                <button
                  onClick={acceptAll}
                  className="btn btn-primary bg-purple-600 hover:bg-purple-700 order-1 sm:order-3"
                >
                  Accept all
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
