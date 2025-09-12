"use client";
import { useState } from "react";

export default function ContentSection() {
  const processSteps = [
    {
      number: "1",
      title: "Tell us what you need",
      description:
        "Call or message our team to discuss your specific maid requirements",
    },
    {
      number: "2",
      title: "Review profiles",
      description:
        "Browse detailed maid profiles including experience, skills, and background",
    },
    {
      number: "3",
      title: "Interview & select",
      description:
        "Choose your preferred maid and conduct interviews for the perfect match",
    },
    {
      number: "4",
      title: "Hire & onboard",
      description: "Sign contracts and welcome your new maid to your home",
    },
  ];

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          {/* How to Hire Section */}
          <div className="mb-16">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-purple-800 mb-4">
                How to Hire a Maid
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Follow our simple 4-step process to hire the right maid for your
                household.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {processSteps.map((step, index) => (
                <div key={index} className="text-center">
                  <div className="bg-gradient-to-r from-purple-600 to-purple-800 w-16 h-16 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">
                    {step.number}
                  </div>
                  <h3 className="text-xl font-semibold text-purple-800 mb-3">
                    {step.title}
                  </h3>
                  <p className="text-gray-600">{step.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Trusted Maids Section */}
          <div className="bg-gradient-to-r from-purple-50 to-yellow-50 p-8 rounded-lg">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-purple-800 mb-4">
                Trusted Maids for Your Home
              </h2>
              <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                We provide verified, trained, and reliable maids. All candidates
                undergo background checks and skill evaluations to ensure
                quality service.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-4xl mb-4">🔍</div>
                <h3 className="text-xl font-semibold text-purple-800 mb-2">
                  Background Verified
                </h3>
                <p className="text-gray-600">
                  Thorough checks on identity, references, and work history
                </p>
              </div>
              <div className="text-center">
                <div className="text-4xl mb-4">🎓</div>
                <h3 className="text-xl font-semibold text-purple-800 mb-2">
                  Professionally Trained
                </h3>
                <p className="text-gray-600">
                  Training across housekeeping, childcare, and hygiene
                </p>
              </div>
              <div className="text-center">
                <div className="text-4xl mb-4">🤝</div>
                <h3 className="text-xl font-semibold text-purple-800 mb-2">
                  Trusted & Reliable
                </h3>
                <p className="text-gray-600">
                  Selected for consistency, attitude, and client feedback
                </p>
              </div>
            </div>
          </div>

          {/* FAQ Section */}
          <div className="mt-16">
            <h2 className="text-3xl font-bold text-center text-purple-800 mb-8">
              Frequently Asked Questions
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="text-lg font-semibold text-purple-800 mb-3">
                  Can I hire a maid in Nairobi today?
                </h3>
                <p className="text-gray-600">
                  Same-day hiring depends on availability. We can arrange
                  short-term options quickly.
                </p>
              </div>
              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="text-lg font-semibold text-purple-800 mb-3">
                  Do I need to visit your office to sign a contract?
                </h3>
                <p className="text-gray-600">
                  No. We support digital contracts and remote onboarding for
                  convenience.
                </p>
              </div>
              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="text-lg font-semibold text-purple-800 mb-3">
                  How long does the process take?
                </h3>
                <p className="text-gray-600">
                  Typically 1-2 weeks based on your requirements and candidate
                  availability.
                </p>
              </div>
              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="text-lg font-semibold text-purple-800 mb-3">
                  Which region has the best maids?
                </h3>
                <p className="text-gray-600">
                  Each region has strengths. We recommend based on your home and
                  needs.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
