import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms & Conditions | Your Company Name",
  description: "Read the terms and conditions for using our services.",
};

export default function TermsPage() {
  return (
    <main className="container mx-auto px-4 py-12 max-w-4xl">
      <h1 className="text-4xl font-bold text-purple-800 mb-6">
        Terms & Conditions
      </h1>
      <p className="text-gray-700 leading-relaxed mb-4">
        Welcome to [Your Company Name]. By accessing or using our website,
        you agree to be bound by these Terms & Conditions...
      </p>
      {/* Add your clauses here */}
    </main>
  );
}
