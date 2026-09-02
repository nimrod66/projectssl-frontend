"use client";

import Link from "next/link";
import Logo from "./Logo";
import { useState, useEffect } from "react";
import { FiMenu, FiX } from "react-icons/fi";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/opportunities", label: "Opportunities" },
  { href: "/about", label: "About" },
  { href: "/employers", label: "For Employers" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav className={`sticky top-0 z-50 transition-all duration-300 ${scrolled ? "bg-white/90 backdrop-blur-md border-b border-slate-200 shadow-sm" : "bg-white"}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2.5 shrink-0">
            <Logo className="h-8 w-8" />
            <span className="text-lg font-bold text-slate-900 tracking-tight">SSL Agency</span>
          </Link>

          <div className="hidden md:flex items-center gap-1">
            {navLinks.map(l => (
              <Link key={l.href} href={l.href}
                className="px-3 py-2 rounded-lg text-sm font-medium text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 transition-colors">
                {l.label}
              </Link>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-2.5">
            <Link href="/applicant/login" className="px-3 py-2 rounded-lg text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors">My Application</Link>
            <Link href="/registration"
              className="px-5 py-2.5 rounded-xl text-sm font-semibold bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm hover:shadow-md transition-all">
              Apply Now
            </Link>
            <Link href="/staff/login"
              className="px-4 py-2 rounded-lg text-sm font-medium text-indigo-600 border border-indigo-200 hover:bg-indigo-50 transition-colors">
              Staff Login
            </Link>
          </div>

          <button onClick={() => setOpen(!open)} className="md:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-lg">
            {open ? <FiX className="w-5 h-5" /> : <FiMenu className="w-5 h-5" />}
          </button>
        </div>

        {open && (
          <div className="md:hidden border-t border-slate-100 py-3 space-y-1 animate-scale-in">
            {navLinks.map(l => (
              <Link key={l.href} href={l.href} onClick={() => setOpen(false)} className="block px-3 py-2.5 rounded-lg text-sm font-medium text-slate-600 hover:bg-indigo-50">{l.label}</Link>
            ))}
            <hr className="my-2" />
            <Link href="/applicant/login" onClick={() => setOpen(false)} className="block px-3 py-2.5 rounded-lg text-sm text-slate-600">My Application</Link>
            <Link href="/registration" onClick={() => setOpen(false)} className="block px-3 py-2.5 rounded-lg text-sm font-semibold text-white bg-indigo-600 text-center">Apply Now</Link>
            <Link href="/staff/login" onClick={() => setOpen(false)} className="block px-3 py-2.5 rounded-lg text-sm text-center text-indigo-600 border border-indigo-200">Staff Login</Link>
          </div>
        )}
      </div>
    </nav>
  );
}
