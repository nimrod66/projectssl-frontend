"use client";

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css";
import "leaflet-defaulticon-compatibility";

// Starnet Solutions office location in Nairobi, Kenya
const position: [number, number] = [-1.271717241699611, 36.99599491069658];

export default function Map() {
  return (
    <section className="py-16 bg-white relative z-10">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-purple-800 mb-4">
              Visit Our Office
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Located in Ruai, Nairobi, Kenya
            </p>
          </div>

          {/* Grid: Map + Info */}
          <div className="grid lg:grid-cols-2 gap-8 items-start">
            {/* Map Container */}
            <div className="sticky top-24 h-[400px] lg:h-[500px] rounded-xl shadow-md overflow-hidden">
              <MapContainer
                center={position}
                zoom={15}
                scrollWheelZoom={false}
                style={{ height: "100%", width: "100%" }}
              >
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                <Marker position={position}>
                  <Popup>
                    <div className="text-center">
                      <strong>Starnet Solutions Limited</strong>
                      <br />
                      Ruai, Nairobi
                      <br />
                      Kenya
                      <br />
                      <a
                        href="tel:+254702440101"
                        className="text-purple-600 hover:underline"
                      >
                        + 254 702 440 101
                      </a>
                      <br />
                      <a
                        href="tel:+254725811516"
                        className="text-purple-600 hover:underline"
                      >
                        +254 725 811 516
                      </a>
                    </div>
                  </Popup>
                </Marker>
              </MapContainer>
            </div>

            {/* Office Info */}
            <div className="space-y-6">
              <div className="bg-gray-50 p-6 rounded-lg shadow">
                <h3 className="text-2xl font-bold text-purple-800 mb-4">
                  Office Address
                </h3>
                <p className="text-gray-600 mb-4">
                  Suite E2, 5th Floor, Ruai Plaza, Along Kangundo Rd, Nairobi,
                  Kenya
                </p>
              </div>

              <div className="bg-gray-50 p-6 rounded-lg shadow">
                <h3 className="text-2xl font-bold text-purple-800 mb-4">
                  Contact Information
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <svg
                      className="w-5 h-5 text-purple-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                      />
                    </svg>
                    <span className="text-gray-600">+254 725 811 516</span>
                    <span className="text-gray-600">+254 702 440 101</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <svg
                      className="w-5 h-5 text-purple-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                      />
                    </svg>
                    <span className="text-gray-600">
                      info@sslrecruitment.com
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 p-6 rounded-lg shadow">
                <h3 className="text-2xl font-bold text-purple-800 mb-4">
                  Business Hours
                </h3>
                <div className="space-y-2 text-gray-600">
                  <div className="flex justify-between">
                    <span>Monday - Friday:</span>
                    <span>8:00 AM - 6:00 PM</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Saturday:</span>
                    <span>9:00 AM - 4:00 PM</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Sunday:</span>
                    <span>Closed</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
