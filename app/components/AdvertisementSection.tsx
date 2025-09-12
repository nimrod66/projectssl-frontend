"use client";

export default function AdvertisementSection() {
  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-purple-700 rounded-lg p-4 sm:p-6 text-white">
        <h2 className="text-lg sm:text-xl font-bold mb-2">Our Services</h2>
        <p className="text-sm sm:text-base opacity-90">
          Professional domestic staff solutions
        </p>
      </div>

      {/* Service Cards */}
      <div className="space-y-4 sm:space-y-6">
        {/* Basic Housekeeping */}
        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-4 sm:p-6">
          <div className="flex items-start justify-between mb-3">
            <h3 className="text-base sm:text-lg font-semibold text-purple-800">
              Basic Housekeeping
            </h3>
            <span className="bg-green-100 text-green-800 text-xs sm:text-sm px-2 py-1 rounded-full font-medium">
              Popular
            </span>
          </div>
          <p className="text-sm sm:text-base text-gray-600 mb-4">
            Daily cleaning, laundry, and general household maintenance
          </p>
          <div className="space-y-2 mb-4">
            <div className="flex items-center gap-2 text-sm text-gray-700">
              <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
              Daily cleaning and tidying
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-700">
              <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
              Laundry and ironing
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-700">
              <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
              Kitchen maintenance
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-lg sm:text-xl font-bold text-purple-800">
              KSh 25,000/month
            </span>
            <button className="bg-yellow-400 hover:bg-yellow-500 text-purple-800 px-3 sm:px-4 py-2 rounded-lg text-sm font-semibold transition-colors">
              Learn More
            </button>
          </div>
        </div>

        {/* Full-Time Maid */}
        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-4 sm:p-6">
          <div className="flex items-start justify-between mb-3">
            <h3 className="text-base sm:text-lg font-semibold text-purple-800">
              Full-Time Maid
            </h3>
            <span className="bg-blue-100 text-blue-800 text-xs sm:text-sm px-2 py-1 rounded-full font-medium">
              Premium
            </span>
          </div>
          <p className="text-sm sm:text-base text-gray-600 mb-4">
            Comprehensive household management with cooking and childcare
          </p>
          <div className="space-y-2 mb-4">
            <div className="flex items-center gap-2 text-sm text-gray-700">
              <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
              All housekeeping duties
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-700">
              <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
              Meal preparation
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-700">
              <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
              Childcare assistance
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-lg sm:text-xl font-bold text-purple-800">
              KSh 35,000/month
            </span>
            <button className="bg-purple-600 hover:bg-purple-700 text-white px-3 sm:px-4 py-2 rounded-lg text-sm font-semibold transition-colors">
              Learn More
            </button>
          </div>
        </div>

        {/* Specialized Care */}
        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-4 sm:p-6">
          <div className="flex items-start justify-between mb-3">
            <h3 className="text-base sm:text-lg font-semibold text-purple-800">
              Specialized Care
            </h3>
            <span className="bg-yellow-100 text-yellow-800 text-xs sm:text-sm px-2 py-1 rounded-full font-medium">
              Custom
            </span>
          </div>
          <p className="text-sm sm:text-base text-gray-600 mb-4">
            Elderly care, special needs, and pet care services
          </p>
          <div className="space-y-2 mb-4">
            <div className="flex items-center gap-2 text-sm text-gray-700">
              <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
              Elderly care and companionship
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-700">
              <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
              Special needs support
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-700">
              <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
              Pet care and walking
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-lg sm:text-xl font-bold text-purple-800">
              KSh 40,000/month
            </span>
            <button className="bg-purple-600 hover:bg-purple-700 text-white px-3 sm:px-4 py-2 rounded-lg text-sm font-semibold transition-colors">
              Learn More
            </button>
          </div>
        </div>
      </div>

      {/* Benefits Section */}
      <div className="bg-gradient-to-br from-purple-50 to-yellow-50 rounded-lg p-4 sm:p-6 border border-purple-200">
        <h3 className="text-base sm:text-lg font-semibold text-purple-800 mb-3">
          Why Choose Us?
        </h3>
        <div className="space-y-2 sm:space-y-3">
          <div className="flex items-center gap-2 text-sm sm:text-base text-gray-700">
            <span className="w-2 h-2 bg-yellow-500 rounded-full"></span>
            Verified and background-checked staff
          </div>
          <div className="flex items-center gap-2 text-sm sm:text-base text-gray-700">
            <span className="w-2 h-2 bg-yellow-500 rounded-full"></span>
            Professional training and certification
          </div>
          <div className="flex items-center gap-2 text-sm sm:text-base text-gray-700">
            <span className="w-2 h-2 bg-yellow-500 rounded-full"></span>
            Insurance and legal compliance
          </div>
          <div className="flex items-center gap-2 text-sm sm:text-base text-gray-700">
            <span className="w-2 h-2 bg-yellow-500 rounded-full"></span>
            24/7 support and replacement guarantee
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200 p-4 sm:p-6 text-center">
        <h3 className="text-base sm:text-lg font-semibold text-purple-800 mb-2">
          Need Custom Service?
        </h3>
        <p className="text-sm sm:text-base text-gray-600 mb-4">
          Contact us for personalized solutions tailored to your needs
        </p>
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
          <button className="bg-yellow-400 hover:bg-yellow-500 text-purple-800 px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-semibold transition-colors">
            Get Quote
          </button>
          <button className="bg-purple-600 hover:bg-purple-700 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-semibold transition-colors">
            Contact Us
          </button>
        </div>
      </div>
    </div>
  );
}
