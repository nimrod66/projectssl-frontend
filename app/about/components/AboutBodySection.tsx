"use client";
import { Target, Eye, Handshake } from "lucide-react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import "swiper/css";

export default function AboutBodySection() {
  const companyProfile = [
    {
      title: "Our Mission",
      description:
        "To help both employers/companies and employees fulfil their potential and achieve maximum productivity and profitability through our Professional Local and International HR Consulting and Recruitment solutions.",
      icon: <Target className="w-10 h-10 text-yellow-500" />,
    },
    {
      title: "Our Vision",
      description:
        "To provide a unique range of manpower recruitment solutions that provide value to our clients.",
      icon: <Eye className="w-10 h-10 text-yellow-500" />,
    },
    {
      title: "Why Choose Us?",
      description:
        "We work as an extension of your Human Resource team and provide the right candidate that fits your requirements and culture.",
      icon: <Handshake className="w-10 h-10 text-yellow-500" />,
    },
  ];

  const sliderItems = [
    { text: "Trusted by top companies across Africa and the Middle East." },
    { text: "Seamless recruitment processes with optimized costs." },
    { text: "Access to a rich pool of international talent." },
  ];
  const sponsors = [
    { name: "NEA", logo: "/assets/asmak-logo-kenya-2.png" },
    { name: "ASMAK", logo: "/assets/asmak-logo-kenya-3.png" },
    {
      name: "Ministry of Labour and Social Protection",
      logo: "/assets/ministry-of-labour-logo-kenya.png",
    },
    { name: "KNCCI", logo: "/assets/kncci-logo-kenya.png" },
  ];

  return (
    <>
      {/* About Us Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-extrabold text-purple-800 mb-6">
                About Us
              </h2>
              <p className="text-lg md:text-xl text-gray-600 leading-relaxed max-w-4xl mx-auto">
                We are a licensed international recruitment and manpower
                consultancy company based in Kenya, dedicated to connecting
                companies with the right talents across Africa, the Middle East,
                UAE and beyond. <br />
                Our approach to business is firmly underpinned by our core
                values in delivering exceptional standards of job placement
                services with speed and sincerity.
              </p>
            </div>

            {/* Cards Section */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10">
              {companyProfile.map((item, index) => (
                <div
                  key={index}
                  className="bg-white border border-gray-200 rounded-2xl p-8 shadow-md hover:border-purple-600 hover:shadow-[0_0_15px_rgba(126,34,206,0.3)] transition duration-300 text-center"
                >
                  <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    {item.icon}
                  </div>

                  <h3 className="text-2xl font-semibold text-purple-800 mb-4">
                    {item.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {item.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Sponsors Section */}
      <section className="bg-white py-10">
        <div className="container mx-auto px-4">
          <h3 className="text-center text-2xl font-bold text-purple-800 mb-8">
            Our Partners & Memberships
          </h3>
          <Swiper
            modules={[Autoplay]}
            autoplay={{ delay: 2500, disableOnInteraction: false }}
            loop
            slidesPerView={2}
            breakpoints={{
              640: { slidesPerView: 1 },
              1024: { slidesPerView: 2 },
            }}
            spaceBetween={30}
            className="flex items-center"
          >
            {sponsors.map((sponsor, index) => (
              <SwiperSlide key={index}>
                <div className="flex justify-center items-center">
                  <img
                    src={sponsor.logo}
                    alt={sponsor.name}
                    className="h-24 w-auto object-contain grayscale hover:grayscale-0 transition duration-300"
                  />
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </section>

      {/* Advertisement Banner */}
      <section className="bg-gradient-to-r from-yellow-300 to-purple-500 py-10">
        <div className="container mx-auto px-4">
          <Swiper
            modules={[Autoplay]}
            autoplay={{ delay: 3500, disableOnInteraction: false }}
            loop
            spaceBetween={30}
            className="text-center"
          >
            {sliderItems.map((slide, index) => (
              <SwiperSlide key={index}>
                <p className="text-white text-xl md:text-2xl font-medium max-w-3xl mx-auto">
                  {slide.text}
                </p>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </section>
    </>
  );
}
