"use client";

export default function AdminHero() {
  return (
    <div className="bg-gradient-to-r from-purple-600 to-purple-700 text-white py-8">
      <div className="container mx-auto px-4">
        <div className="text-center">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            Admin Dashboard
          </h1>
          <p className="text-lg md:text-xl opacity-90">
            Manage and review staff applications
          </p>
        </div>
      </div>
    </div>
  );
}
