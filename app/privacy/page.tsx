import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy | Starnet",
  description: "Learn how we collect, use, and protect your personal data.",
};

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="bg-white rounded-2xl shadow-sm ring-1 ring-gray-200 p-6 sm:p-8">
          <h1 className="text-4xl font-bold text-purple-800 mb-6">
            Privacy Policy
          </h1>
          <p className="text-gray-700 leading-relaxed mb-6">
            This Privacy Policy explains how we collect, use, disclose, and
            safeguard your information when you use our services.
          </p>

          <section className="space-y-4 mb-8">
            <h2 className="text-2xl font-semibold text-purple-700">
              Information We Collect
            </h2>
            <ul className="list-disc pl-6 text-gray-700 space-y-2">
              <li>
                Personal Identification data (name, email, phone, location)
              </li>
              <li>Professional data (experience, skills, languages)</li>
              <li>Media you upload (photos, videos, documents)</li>
              <li>Usage data and cookies for analytics and improvements</li>
            </ul>
          </section>

          <section className="space-y-4 mb-8">
            <h2 className="text-2xl font-semibold text-purple-700">
              How We Use Your Data
            </h2>
            <ul className="list-disc pl-6 text-gray-700 space-y-2">
              <li>Process applications and manage staff profiles</li>
              <li>Improve our website and services</li>
              <li>Communicate with you about your application</li>
              <li>Comply with legal obligations</li>
            </ul>
          </section>

          <section className="space-y-4 mb-8">
            <h2 className="text-2xl font-semibold text-purple-700">
              Data Sharing
            </h2>
            <p className="text-gray-700">
              We do not sell personal data. We may share data with service
              providers under strict agreements and with authorities when
              legally required.
            </p>
          </section>

          <section className="space-y-4 mb-8">
            <h2 className="text-2xl font-semibold text-purple-700">
              Your Rights
            </h2>
            <ul className="list-disc pl-6 text-gray-700 space-y-2">
              <li>Access, correct, or delete your personal data</li>
              <li>Withdraw consent for non-essential cookies</li>
              <li>Lodge a complaint with a supervisory authority</li>
            </ul>
          </section>

          <section className="space-y-4 mb-8">
            <h2 className="text-2xl font-semibold text-purple-700">
              Cookie Preferences
            </h2>
            <p className="text-gray-700">
              Manage your cookie preferences on our{" "}
              <a href="/cookies" className="text-purple-700 underline">
                Cookies Settings
              </a>{" "}
              page.
            </p>
          </section>

          <section className="space-y-2 text-gray-600 text-sm">
            <p>Last updated: {new Date().toLocaleDateString()}</p>
            <p>Contact: privacy@starnet.example</p>
          </section>
        </div>
      </div>
    </main>
  );
}
