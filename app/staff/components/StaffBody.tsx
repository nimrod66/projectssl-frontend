"use client";

export default function StaffBodySection() {
  return (
    <section className="bg-purple-400 py-20">
      <div className="container mx-auto text-center">
        <h2 className="text-3xl font-bold mb-10">Staff Body Section</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 justify-items-center">
          {/* Mission */}
          <div className="card bg-base-100 w-80 shadow-sm">
            <div className="card-body items-center text-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-10 w-10 text-primary mb-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                {/* Target icon for mission */}
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 19V5m7 7H5m12.364-4.364L15.05 8.95M8.95 15.05l-2.314 2.314"
                />
              </svg>
              <h2 className="card-title">Mission</h2>
              <p>
                To guide, serve, and deliver excellence in every aspect of our
                organization.
              </p>
            </div>
          </div>

          {/* Vision */}
          <div className="card bg-base-100 w-80 shadow-sm">
            <div className="card-body items-center text-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-10 w-10 text-secondary mb-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                {/* Eye icon for vision */}
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                />
              </svg>
              <h2 className="card-title">Vision</h2>
              <p>
                To become a leading example of innovation, growth, and impact
                worldwide.
              </p>
            </div>
          </div>

          {/* Core Values */}
          <div className="card bg-base-100 w-80 shadow-sm">
            <div className="card-body items-center text-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-10 w-10 text-accent mb-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                {/* Handshake/heart icon for values */}
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 21l-8-7 3.5-3.5L12 15l4.5-4.5L20 14l-8 7z"
                />
              </svg>
              <h2 className="card-title">Core Values</h2>
              <p>
                Integrity, collaboration, respect, and a strong commitment to
                excellence.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
