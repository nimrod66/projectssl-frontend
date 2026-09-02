"use client";

import Link from "next/link";

const testimonials = [
  { name: "Sarah Kamau", location: "Nairobi West", text: "Starnet Solutions provided us with an excellent domestic staff member who has been taking care of our home and children for over a year. Professional, reliable, and trustworthy service.", initials: "SK" },
  { name: "Ahmed Hassan", location: "Mombasa", text: "The process was very smooth and professional. Our staff member from Mombasa is hardworking and has become part of our family. Highly recommend Starnet Solutions.", initials: "AH" },
  { name: "Fatima Odhiambo", location: "Kisumu", text: "Excellent service. The staff was very helpful in finding the perfect domestic worker for our needs. The background verification process gave us peace of mind.", initials: "FO" },
  { name: "David Thompson", location: "Nakuru", text: "As an expat family, we were worried about finding reliable help. Starnet Solutions made it easy with their professional approach and quality staff.", initials: "DT" },
];

const stats = [
  { value: "500+", label: "Happy Clients" },
  { value: "1,000+", label: "Candidates Placed" },
  { value: "98%", label: "Satisfaction Rate" },
  { value: "5+", label: "Years Experience" },
];

const colors = ["bg-indigo-600", "bg-blue-600", "bg-emerald-600", "bg-amber-600"];

const StarIcon = () => (
  <svg className="w-4 h-4 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
  </svg>
);

export default function Testimonials() {
  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-14">
          <h2 className="text-3xl font-bold text-gray-900 mb-3">What Our Clients Say</h2>
          <p className="text-gray-500 max-w-xl mx-auto">
            Trusted by families and organizations across Kenya and beyond.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
          {testimonials.map((t, i) => (
            <div key={i} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3 mb-4">
                <div className={`w-10 h-10 rounded-full ${colors[i % colors.length]} flex items-center justify-center text-white text-sm font-bold shrink-0`}>
                  {t.initials}
                </div>
                <div>
                  <p className="font-semibold text-gray-900 text-sm">{t.name}</p>
                  <p className="text-xs text-gray-400">{t.location}</p>
                </div>
              </div>
              <div className="flex gap-0.5 mb-3">
                {[...Array(5)].map((_, j) => <StarIcon key={j} />)}
              </div>
              <p className="text-gray-600 text-sm leading-relaxed italic">{t.text}</p>
            </div>
          ))}
        </div>

        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map((s, i) => (
            <div key={i} className="text-center">
              <p className="text-3xl font-extrabold text-gray-900">{s.value}</p>
              <p className="text-sm text-gray-500 mt-1">{s.label}</p>
            </div>
          ))}
        </div>

        <div className="mt-14 bg-white rounded-2xl p-8 sm:p-10 shadow-sm border border-gray-100 text-center">
          <h3 className="text-2xl font-bold text-gray-900 mb-3">Ready to find the right candidate?</h3>
          <p className="text-gray-500 mb-6 max-w-lg mx-auto">
            Join hundreds of satisfied clients who have found their perfect candidate through SSL Agency.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/opportunities" className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl transition-colors shadow-sm">
              Browse Candidates
            </Link>
            <Link href="/registration" className="px-6 py-3 border border-gray-300 text-gray-700 hover:bg-gray-50 font-semibold rounded-xl transition-colors">
              Register as Candidate
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
