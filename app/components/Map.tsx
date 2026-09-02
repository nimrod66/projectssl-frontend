"use client";

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css";
import "leaflet-defaulticon-compatibility";

const position: [number, number] = [-1.271717241699611, 36.99599491069658];

export default function Map() {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Visit Our Office</h2>
          <p className="text-gray-500">Located in Ruai, Nairobi, Kenya</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 items-start">
          <div className="h-[400px] lg:h-[500px] rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <MapContainer center={position} zoom={15} scrollWheelZoom={false} style={{ height: "100%", width: "100%" }}>
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              <Marker position={position}>
                <Popup>
                  <strong>Starnet Solutions Limited</strong><br />
                  Ruai, Nairobi, Kenya<br />
                  <a href="tel:+254702440101" className="text-indigo-600">+254 702 440 101</a><br />
                  <a href="tel:+254725811516" className="text-indigo-600">+254 725 811 516</a>
                </Popup>
              </Marker>
            </MapContainer>
          </div>

          <div className="space-y-5">
            <div className="bg-gray-50 rounded-xl p-6 border border-gray-100">
              <h3 className="text-lg font-bold text-gray-900 mb-3">Office Address</h3>
              <p className="text-gray-600">Suite E2, 5th Floor, Ruai Plaza<br />Along Kangundo Rd, Nairobi, Kenya</p>
            </div>

            <div className="bg-gray-50 rounded-xl p-6 border border-gray-100">
              <h3 className="text-lg font-bold text-gray-900 mb-3">Contact</h3>
              <div className="space-y-2 text-gray-600">
                <p>+254 725 811 516</p>
                <p>+254 702 440 101</p>
                <p className="text-indigo-600">info@sslrecruitment.com</p>
              </div>
            </div>

            <div className="bg-gray-50 rounded-xl p-6 border border-gray-100">
              <h3 className="text-lg font-bold text-gray-900 mb-3">Business Hours</h3>
              <div className="space-y-1 text-sm text-gray-600">
                <div className="flex justify-between"><span>Monday – Friday</span><span>8:00 AM – 6:00 PM</span></div>
                <div className="flex justify-between"><span>Saturday</span><span>9:00 AM – 4:00 PM</span></div>
                <div className="flex justify-between"><span>Sunday</span><span>Closed</span></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
