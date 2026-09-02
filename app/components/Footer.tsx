"use client";

import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-white font-bold text-lg mb-4">SSL Agency</h3>
            <p className="text-sm text-slate-400 leading-relaxed mb-4">
              Connecting talent with global opportunity. Licensed international recruitment agency based in Nairobi, Kenya.
            </p>
            <p className="text-sm text-slate-500">info@sslrecruitment.com</p>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4 text-xs uppercase tracking-wider">For Candidates</h4>
            <div className="space-y-3 text-sm">
              <Link href="/opportunities" className="block text-slate-400 hover:text-white transition">Find Work</Link>
              <Link href="/registration" className="block text-slate-400 hover:text-white transition">Apply Now</Link>
              <Link href="/applicant/login" className="block text-slate-400 hover:text-white transition">My Application</Link>
            </div>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4 text-xs uppercase tracking-wider">For Employers</h4>
            <div className="space-y-3 text-sm">
              <Link href="/employers" className="block text-slate-400 hover:text-white transition">Our Services</Link>
              <Link href="/opportunities" className="block text-slate-400 hover:text-white transition">Browse Opportunities</Link>
            </div>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4 text-xs uppercase tracking-wider">Company</h4>
            <div className="space-y-3 text-sm">
              <Link href="/about" className="block text-slate-400 hover:text-white transition">About Us</Link>
              <Link href="/staff/login" className="block text-slate-400 hover:text-white transition">Staff Portal</Link>
              <Link href="/privacy" className="block text-slate-400 hover:text-white transition">Privacy</Link>
              <Link href="/terms" className="block text-slate-400 hover:text-white transition">Terms</Link>
            </div>
          </div>
        </div>
        <div className="mt-12 pt-6 border-t border-slate-800 text-center text-sm text-slate-500">
          &copy; {new Date().getFullYear()} Starnet Solutions Limited. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
