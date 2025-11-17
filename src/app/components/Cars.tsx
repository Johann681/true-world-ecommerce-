/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { Instagram, PhoneCall } from "lucide-react";
import Image from "next/image";

export default function CarShopSection() {
  const [cars, setCars] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

  useEffect(() => {
    const fetchCars = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/cars`);
        // Ensure we always set an array
        const carsArray = Array.isArray(res.data) ? res.data : res.data?.data ?? [];
        setCars(carsArray);
      } catch (err) {
        console.error("Failed to fetch cars:", err);
        setCars([]); // fallback to empty array
      } finally {
        setLoading(false);
      }
    };

    fetchCars();
  }, []); // run once

  const handleWhatsApp = (car: any) => {
    const msg = encodeURIComponent(
      `Hi! I'm interested in the ${car.name} — ${
        car.price ? `₦${car.price.toLocaleString()}` : "please send details."
      }`
    );
    window.open(`https://wa.me/2348000000000?text=${msg}`, "_blank");
  };

  const handleInstagram = () => {
    window.open("https://www.instagram.com/yourpage/", "_blank");
  };

  if (loading) {
    return (
      <div className="p-10 text-center text-gray-500">Loading cars...</div>
    );
  }

  return (
    <section className="max-w-7xl mx-auto px-4 py-12">
      <h2 className="text-2xl md:text-3xl font-bold mb-8 text-center">
        Explore Our Cars
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {cars.length === 0 ? (
          <div className="col-span-full text-center text-gray-500 py-10">
            🚗 No cars found. Please check back later!
          </div>
        ) : (
          cars.map((car) => (
            <div
              key={car._id}
              className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 p-4 flex flex-col items-center text-center"
            >
              <div className="w-full h-52 relative rounded-xl overflow-hidden">
                <Image
                  src={car.images?.[0] || "/placeholder-car.jpg"}
                  alt={car.name}
                  fill
                  className="object-cover rounded-xl"
                />
              </div>

              <h3 className="mt-4 font-semibold text-lg">{car.name}</h3>
              <p className="text-gray-500 text-sm mt-1 line-clamp-2">
                {car.description}
              </p>
              {car.price && (
                <p className="mt-2 font-bold text-black text-base">
                  ₦{car.price.toLocaleString()}
                </p>
              )}

              <div className="mt-4 flex gap-3 w-full justify-center">
                {car.contactType === "whatsapp" ? (
                  <button
                    onClick={() => handleWhatsApp(car)}
                    className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <PhoneCall size={18} /> WhatsApp
                  </button>
                ) : (
                  <button
                    onClick={handleInstagram}
                    className="flex items-center gap-2 border border-gray-400 px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <Instagram size={18} /> Instagram
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  );
}
