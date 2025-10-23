import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms & Conditions | Starnet",
  description: "Read the terms and conditions for using our services.",
};

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="bg-white rounded-2xl shadow-sm ring-1 ring-gray-200 p-6 sm:p-8">
          <h1 className="text-4xl font-bold text-purple-800 mb-6">
            Terms & Conditions
          </h1>
          <section className="space-y-4 mb-8">
            <h2 className="text-2xl font-semibold text-purple-700">
              1. Acceptance of Terms
            </h2>
            <p className="text-gray-700">
              By using our website and services, you agree to these terms.
            </p>
          </section>
          <section className="space-y-4 mb-8">
            <h2 className="text-2xl font-semibold text-purple-700">
              2. User Obligations
            </h2>
            <p className="text-gray-700">
              Provide accurate information and respect our policies.
            </p>
          </section>
          <section className="space-y-4 mb-8">
            <h2 className="text-2xl font-semibold text-purple-700">
              3. Content & Media
            </h2>
            <p className="text-gray-700">
              You must own the rights to uploaded media and consent to
              processing.
            </p>
          </section>
          <section className="space-y-4 mb-8">
            <h2 className="text-2xl font-semibold text-purple-700">
              4. Privacy
            </h2>
            <p className="text-gray-700">
              See our{" "}
              <a href="/privacy" className="underline text-purple-700">
                Privacy Policy
              </a>{" "}
              for data practices.
            </p>
          </section>
          <section className="space-y-4 mb-8">
            <h2 className="text-2xl font-semibold text-purple-700">
              5. Liability
            </h2>
            <p className="text-gray-700">
              Services are provided as-is. We limit liability to the extent
              permitted by law.
            </p>
          </section>
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-purple-700">
              6. Changes
            </h2>
            <p className="text-gray-700">
              We may update these terms. Continued use constitutes acceptance.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
