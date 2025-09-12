"use client";

import Link from "next/link";

export default function Testimonials() {
  const testimonials = [
    {
      name: "Sarah Kamau",
      location: "Nairobi West",
      rating: 5,
      text: "Starnet Solutions provided us with an excellent domestic staff member who has been taking care of our home and children for over a year now. Professional, reliable, and trustworthy service.",
      avatar: "👩‍💼",
    },
    {
      name: "Ahmed Hassan",
      location: "Mombasa",
      rating: 5,
      text: "The process was very smooth and professional. Our staff member from Mombasa is hardworking and has become part of our family. Highly recommend Starnet Solutions!",
      avatar: "👨‍💼",
    },
    {
      name: "Fatima Odhiambo",
      location: "Kisumu",
      rating: 5,
      text: "Excellent service! The staff was very helpful in finding the perfect domestic worker for our needs. The background verification process gave us peace of mind.",
      avatar: "👩‍💼",
    },
    {
      name: "David Thompson",
      location: "Nakuru",
      rating: 5,
      text: "As an expat family, we were worried about finding reliable help. Starnet Solutions made it easy with their professional approach and quality staff.",
      avatar: "👨‍💼",
    },
  ];

  return (
    <section className="py-16 bg-gradient-to-br from-purple-50 to-yellow-50">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-purple-800 mb-4">
              What Our Clients Say
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Don't just take our word for it. Here's what our satisfied clients
              have to say about their experience with Starnet Solutions Limited.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow"
              >
                <div className="flex items-center mb-4">
                  <div className="text-3xl mr-3">{testimonial.avatar}</div>
                  <div>
                    <h3 className="font-semibold text-purple-800">
                      {testimonial.name}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {testimonial.location}
                    </p>
                  </div>
                </div>

                <div className="flex mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <svg
                      key={i}
                      className="w-5 h-5 text-yellow-400"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>

                <p className="text-gray-600 italic">"{testimonial.text}"</p>
              </div>
            ))}
          </div>

          {/* Stats Section */}
          <div className="mt-16 grid md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-purple-600 mb-2">
                500+
              </div>
              <div className="text-gray-600">Happy Families</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-purple-600 mb-2">
                1000+
              </div>
              <div className="text-gray-600">Staff Placed</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-purple-600 mb-2">98%</div>
              <div className="text-gray-600">Satisfaction Rate</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-purple-600 mb-2">5+</div>
              <div className="text-gray-600">Years Experience</div>
            </div>
          </div>

          {/* CTA Section */}
          <div className="mt-16 text-center bg-white p-8 rounded-lg shadow-md">
            <h3 className="text-2xl font-bold text-purple-800 mb-4">
              Ready to Experience the Difference?
            </h3>
            <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
              Join hundreds of satisfied families who have found their perfect
              domestic staff through Starnet Solutions Limited. Start your
              journey today and enjoy a cleaner, more organized home.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="btn btn-primary btn-lg bg-yellow-400 text-purple-800 hover:bg-yellow-500 font-semibold">
                Hire Staff Now
              </button>
              <Link
                href="/registration"
                className="btn btn-outline btn-lg border-purple-600 text-purple-600 hover:bg-purple-600 hover:text-white"
              >
                Looking for a job?
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
