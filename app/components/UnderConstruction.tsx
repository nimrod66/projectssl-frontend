import React, { useState, useEffect } from "react";

export default function UnderConstruction() {
  const [dots, setDots] = useState("");

  useEffect(() => {
    const interval = setInterval(() => {
      setDots((prev) => (prev.length >= 3 ? "" : prev + "."));
    }, 500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4 overflow-hidden relative">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse top-0 -left-48"></div>
        <div className="absolute w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse bottom-0 -right-48 animation-delay-2000"></div>
        <div className="absolute w-96 h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animation-delay-4000"></div>
      </div>

      {/* Main content */}
      <div className="relative z-10 text-center max-w-4xl mx-auto">
        {/* Logo/Brand placeholder */}
        <div className="mb-8 animate-fade-in">
          <div className="inline-block p-4 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20">
            <svg
              className="w-16 h-16 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"
              />
            </svg>
          </div>
          s
        </div>

        {/* Main heading */}
        <h1 className="text-5xl md:text-7xl font-bold text-white mb-4 animate-fade-in-up">
          Something Amazing
          <br />
          <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            Is Coming Soon <br></br>
            <span className="text-yellow-400">
              SSL Starnet Solutions Limited
            </span>
          </span>
        </h1>

        {/* Subheading */}
        <p className="text-xl md:text-2xl text-gray-300 mb-12 animate-fade-in-up animation-delay-200">
          We're crafting an exceptional digital experience.{dots}
        </p>

        {/* Progress bar */}
        <div className="mb-12 animate-fade-in-up animation-delay-400">
          <div className="bg-white/10 backdrop-blur-sm rounded-full h-3 overflow-hidden border border-white/20">
            <div
              className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full animate-progress"
              style={{ width: "65%" }}
            ></div>
          </div>
          <p className="text-sm text-gray-400 mt-3">
            Site under construction - Coming Soon
          </p>
        </div>
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes progress {
          from {
            width: 0%;
          }
          to {
            width: 65%;
          }
        }

        .animate-fade-in {
          animation: fade-in 1s ease-out;
        }

        .animate-fade-in-up {
          animation: fade-in-up 1s ease-out;
        }

        .animate-progress {
          animation: progress 2s ease-out;
        }

        .animation-delay-200 {
          animation-delay: 0.2s;
          opacity: 0;
          animation-fill-mode: forwards;
        }

        .animation-delay-400 {
          animation-delay: 0.4s;
          opacity: 0;
          animation-fill-mode: forwards;
        }

        .animation-delay-600 {
          animation-delay: 0.6s;
          opacity: 0;
          animation-fill-mode: forwards;
        }

        .animation-delay-800 {
          animation-delay: 0.8s;
          opacity: 0;
          animation-fill-mode: forwards;
        }

        .animation-delay-2000 {
          animation-delay: 2s;
        }

        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
}
