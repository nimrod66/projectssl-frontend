"use client";

import Link from "next/link";
import Logo from "./Logo";
import { useState } from "react";

export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-3 sm:py-4">
          {/* Logo */}
          <div className="flex items-center space-x-2 sm:space-x-4">
            <Logo className="h-8 w-8 sm:h-10 sm:w-10" />
            <Link href="/">
              <span className="text-lg sm:text-xl lg:text-2xl font-bold text-purple-600">
                <span className="hidden sm:inline">
                  Starnet Solutions Limited
                </span>
                <span className="sm:hidden">SSL Ltd</span>
              </span>
            </Link>
          </div>

          {/* Navigation Links */}
          <div className="hidden lg:flex items-center space-x-6 lg:space-x-8">
            <Link
              href="/"
              className="text-gray-700 hover:text-purple-600 font-medium transition-colors"
            >
              Home
            </Link>
            <Link
              href="/about"
              className="text-gray-700 hover:text-purple-600 font-medium transition-colors"
            >
              About Us
            </Link>
          </div>

          {/* CTA Buttons */}
          <div className="flex items-center space-x-2 sm:space-x-4">
            <Link
              href="/registration"
              className="hidden sm:inline-flex btn btn-primary btn-sm bg-yellow-400 text-purple-800 hover:bg-yellow-500 font-semibold"
            >
              Register Here
            </Link>
            <Link
              href="/registration"
              className="sm:hidden btn btn-primary btn-xs bg-yellow-400 text-purple-800 hover:bg-yellow-500 font-semibold"
            >
              Register
            </Link>

            {/* Mobile Menu Button */}
            <button
              className="lg:hidden btn btn-ghost btn-sm p-2"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 sm:h-6 sm:w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                {isMobileMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden border-t border-gray-200 py-4 bg-white">
            <div className="flex flex-col space-y-3">
              <Link
                href="/"
                className="text-gray-700 hover:text-purple-600 font-medium px-4 py-2 rounded-lg hover:bg-purple-50 transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Home
              </Link>

              <Link
                href="/about"
                className="text-gray-700 hover:text-purple-600 font-medium px-4 py-2 rounded-lg hover:bg-purple-50 transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                About Us
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
