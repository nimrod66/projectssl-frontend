"use client";
import { useState, useEffect } from "react";

export default function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem("cookie_consent");
    if (!consent) {
      setVisible(true);
    }
  }, []);

  const acceptCookies = () => {
    localStorage.setItem("cookie_consent", "true");
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 inset-x-0 bg-purple-800 text-white py-4 px-6 flex flex-col md:flex-row items-center justify-between z-50 shadow-lg">
      <p className="text-sm mb-3 md:mb-0">
        We use cookies to enhance your browsing experience. By continuing, you
        agree to our{" "}
        <a href="/cookies" className="underline hover:text-purple-200">
          Cookies Policy
        </a>
        .
      </p>
      <button
        onClick={acceptCookies}
        className="bg-white text-purple-800 px-4 py-2 rounded-lg font-semibold hover:bg-gray-200 transition"
      >
        Accept
      </button>
    </div>
  );
}
