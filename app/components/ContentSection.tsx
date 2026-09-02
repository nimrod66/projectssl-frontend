"use client";

export default function ContentSection() {
  const processSteps = [
    { number: "1", title: "Tell us your needs", description: "Call or message our team to discuss your specific staffing requirements." },
    { number: "2", title: "Review profiles", description: "Browse detailed candidate profiles including experience, skills, and background checks." },
    { number: "3", title: "Interview and select", description: "Choose your preferred candidate and conduct interviews for the perfect match." },
    { number: "4", title: "Hire and onboard", description: "Sign contracts and welcome your new hire to your team." },
  ];

  const trustItems = [
    { title: "Background Verified", desc: "Thorough checks on identity, references, and work history for every candidate." },
    { title: "Professionally Trained", desc: "Training across housekeeping, childcare, eldercare, and hygiene standards." },
    { title: "Trusted and Reliable", desc: "Selected for consistency, positive attitude, and proven client feedback." },
  ];

  const faq = [
    { q: "How long does the hiring process take?", a: "Typically 1 to 2 weeks depending on your requirements and candidate availability. Urgent placements can be faster." },
    { q: "Do I need to visit your office to sign a contract?", a: "No. We support digital contracts and remote onboarding for your convenience." },
    { q: "Are your candidates from Kenya or abroad?", a: "We have a large pool of both local (Kenyan) candidates and international candidates across multiple countries." },
    { q: "What happens after a candidate is deployed?", a: "Our tracking system monitors every placement — from documents and visa processing through to deployment and contract completion." },
  ];

  return (
    <section className="py-16 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">How It Works</h2>
            <p className="text-lg text-gray-500 max-w-2xl mx-auto">
              A simple four-step process to find the right candidate for your household or organization.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {processSteps.map((step, i) => (
              <div key={i} className="text-center">
                <div className="bg-gradient-to-r from-indigo-600 to-indigo-800 w-14 h-14 rounded-full flex items-center justify-center text-white text-xl font-bold mx-auto mb-4">
                  {step.number}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{step.title}</h3>
                <p className="text-gray-500 text-sm">{step.description}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-gradient-to-r from-indigo-50 to-gray-50 rounded-2xl p-8 sm:p-10 mb-16">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">Trusted Candidates for Your Home</h2>
            <p className="text-gray-500 max-w-2xl mx-auto">
              Every candidate undergoes background checks and skill evaluations before joining our pool.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {trustItems.map((item, i) => (
              <div key={i} className="text-center">
                <div className="w-12 h-12 rounded-xl bg-indigo-100 flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 text-indigo-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-gray-500 text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-8">Frequently Asked Questions</h2>
          <div className="grid md:grid-cols-2 gap-4 max-w-4xl mx-auto">
            {faq.map((item, i) => (
              <div key={i} className="bg-gray-50 rounded-xl p-5">
                <h3 className="font-semibold text-gray-900 mb-2">{item.q}</h3>
                <p className="text-gray-500 text-sm">{item.a}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
