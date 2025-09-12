import Link from "next/link";

export default function Hero() {
  return (
    <div className="hero min-h-[60vh] sm:min-h-[65vh] lg:min-h-[70vh] bg-gradient-to-r from-purple-600 to-purple-800 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-full h-full bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.1%22%3E%3Ccircle%20cx%3D%2230%22%20cy%3D%2230%22%20r%3D%222%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')]"></div>
      </div>

      <div className="hero-content text-center text-white relative z-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6">
            Hire Trusted Domestic Staff in Kenya
          </h1>
          <p className="text-lg sm:text-xl lg:text-2xl mb-6 sm:mb-8 opacity-90 px-2 sm:px-0">
            Professional, verified, and experienced domestic workers for your
            home. Choose from multiple regions with guaranteed quality service
            across Kenya.
          </p>

          {/* Benefits Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mb-6 sm:mb-8 text-xs sm:text-sm lg:text-base">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 sm:p-4">
              <div className="font-semibold">Competitive Salary</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 sm:p-4">
              <div className="font-semibold">Health Insurance</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 sm:p-4">
              <div className="font-semibold">Legal Documentation</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 sm:p-4">
              <div className="font-semibold">Paid Leave</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 sm:p-4">
              <div className="font-semibold">Professional Training</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 sm:p-4">
              <div className="font-semibold">Background Checks</div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
            <Link
              href="/registration"
              className="btn btn-primary btn-lg bg-yellow-400 text-purple-800 hover:bg-yellow-500 border-0 font-semibold text-sm sm:text-base px-6 sm:px-8 py-3 sm:py-4"
            >
              Register Here
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
