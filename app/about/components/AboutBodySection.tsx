"use client";
import { Target, Eye, Handshake, CheckCircle } from "lucide-react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import "swiper/css";

const companyProfile = [
  {
    title: "Our Mission",
    description: "To help both employers and candidates fulfil their potential and achieve maximum productivity through professional local and international HR consulting and recruitment solutions.",
    icon: Target,
  },
  {
    title: "Our Vision",
    description: "To provide a unique range of manpower recruitment solutions that deliver lasting value to our clients across Africa, the Middle East, and beyond.",
    icon: Eye,
  },
  {
    title: "Why Choose Us",
    description: "We work as an extension of your HR team, providing the right candidate that fits your requirements and culture — with speed, precision, and sincerity.",
    icon: Handshake,
  },
];

const sponsors = [
  { name: "NEA", logo: "/assets/asmak-logo-kenya-2.png" },
  { name: "ASMAK", logo: "/assets/asmak-logo-kenya-3.png" },
  { name: "Ministry of Labour", logo: "/assets/ministry-of-labour-logo-kenya.png" },
  { name: "KNCCI", logo: "/assets/kncci-logo-kenya.png" },
];

const values = [
  { title: "Background Verified", desc: "Every candidate undergoes thorough identity, reference, and work history checks before joining our pool." },
  { title: "Fast Turnaround", desc: "From initial consultation to candidate placement — our streamlined process delivers results in days, not weeks." },
  { title: "Ongoing Support", desc: "We stay engaged throughout the contract period with monitoring, check-ins, and continuous support." },
];

export default function AboutBodySection() {
  return (
    <>
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">About Us</h2>
            <p className="text-lg text-gray-500 leading-relaxed max-w-3xl mx-auto">
              We are a licensed international recruitment and manpower consultancy based in Kenya,
              connecting organizations with the right talent across Africa, the Middle East, UAE, and beyond.
              Our approach is firmly underpinned by core values of integrity, speed, and exceptional service.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-20">
            {companyProfile.map((item, i) => {
              const Icon = item.icon;
              return (
                <div key={i} className="bg-white border border-gray-200 rounded-2xl p-8 text-center hover:border-indigo-300 hover:shadow-lg transition-all duration-300">
                  <div className="w-14 h-14 rounded-xl bg-indigo-100 flex items-center justify-center mx-auto mb-5">
                    <Icon className="w-7 h-7 text-indigo-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{item.title}</h3>
                  <p className="text-gray-500 leading-relaxed text-sm">{item.description}</p>
                </div>
              );
            })}
          </div>

          <div className="bg-gray-50 rounded-2xl p-8 sm:p-12 mb-20">
            <div className="text-center mb-10">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Why Work With Us</h2>
              <p className="text-gray-500">Three pillars that set us apart.</p>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              {values.map((v, i) => (
                <div key={i} className="text-center">
                  <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="font-bold text-gray-900 mb-2">{v.title}</h3>
                  <p className="text-gray-500 text-sm">{v.desc}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-8">Our Partners & Memberships</h2>
            <Swiper modules={[Autoplay]} autoplay={{ delay: 2500, disableOnInteraction: false }} loop slidesPerView={2} breakpoints={{ 640: { slidesPerView: 2 }, 1024: { slidesPerView: 4 } }} spaceBetween={40}>
              {sponsors.map((s, i) => (
                <SwiperSlide key={i}>
                  <div className="flex justify-center items-center px-4">
                    <img src={s.logo} alt={s.name} className="h-20 w-auto object-contain grayscale hover:grayscale-0 transition duration-300" />
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        </div>
      </section>
    </>
  );
}
