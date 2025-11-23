/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useEffect, useState } from "react";
import axios, { AxiosError } from "axios";
import { Instagram, Zap, Loader2, MessageCircle, PhoneCall } from "lucide-react";
import Image from "next/image";

// --- Helper Functions ---
const formatPrice = (n?: number | string) => {
  if (typeof n === "number") return `₦${n.toLocaleString()}`;
  if (typeof n === "string" && !isNaN(Number(n))) return `₦${Number(n).toLocaleString()}`;
  return "Price on Request";
};

// --- Main Component ---
export default function CarShopSection() {
  const [cars, setCars] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const API_URL = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000").replace(/\/$/, "");

  useEffect(() => {
    const fetchCars = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await axios.get(`${API_URL}/api/cars`);
        const carsArray = Array.isArray(res.data) ? res.data : res.data?.data ?? [];
        setCars(carsArray);
      } catch (err) {
        console.error("Failed to fetch cars:", err);
        const errorMessage = (err as AxiosError)?.message || "Could not connect to car listings.";
        setError(errorMessage);
        setCars([]);
      } finally {
        setLoading(false);
      }
    };
    fetchCars();
  }, [API_URL]);

  const handleContact = (car: any) => {
    const link = car.contactLink?.trim();
    if (car.contactType === "whatsapp" && link) {
      let whatsappLink = link.startsWith('http') ? link : `https://wa.me/${link}`;
      const msg = encodeURIComponent(`Hello, I'm interested in the ${car.name} (${formatPrice(car.price)}). Is it still available?`);
      if (!whatsappLink.includes('?')) whatsappLink = `${whatsappLink}${whatsappLink.includes('wa.me/') ? '?' : ''}text=${msg}`;
      window.open(whatsappLink, "_blank");
      return;
    } 
    if (car.contactType === "instagram" && link) {
      const instaLink = link.startsWith('http') ? link : `https://www.instagram.com/${link.replace('@', '')}`;
      window.open(instaLink, "_blank");
      return;
    }
    alert(`Contact link for ${car.name} is missing. Please contact support.`);
  };

  // --- Render ---
  return (
    <section className="bg-gray-50 py-24">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-16">
          <p className="text-indigo-600 uppercase text-sm font-semibold tracking-wide mb-2">Premium Cars</p>
          <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900">Exclusive Car Listings</h2>
          <p className="text-gray-500 mt-3 max-w-2xl mx-auto">Browse our hand-picked selection of top-quality vehicles, updated daily for your convenience.</p>
        </div>

        {/* Loading */}
        {loading && (
          <div className="text-center py-24">
            <Loader2 size={32} className="animate-spin text-indigo-500 mx-auto mb-4" />
            <p className="text-lg text-gray-500">Loading premium car listings...</p>
          </div>
        )}

        {/* Error */}
        {error && !loading && (
          <div className="text-center py-24">
            <Zap size={32} className="text-red-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-red-600 mb-2">Error Loading Cars</h3>
            <p className="text-gray-500">{error}</p>
          </div>
        )}

        {/* Car Grid */}
        {!loading && !error && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {cars.length === 0 ? (
              <div className="col-span-full text-center text-gray-500 py-16 bg-white rounded-xl border border-dashed border-gray-300">
                <MessageCircle size={32} className="mx-auto mb-3 text-gray-400" />
                <p className="text-lg font-medium">No active listings available right now.</p>
                <p className="text-sm mt-1">Check back soon for new arrivals!</p>
              </div>
            ) : (
              cars.map((car) => (
                <div
                  key={car._id}
                  className="bg-white rounded-3xl shadow-lg border border-gray-100 transition-all duration-300 transform hover:scale-[1.03] hover:shadow-2xl flex flex-col overflow-hidden"
                >
                  {/* Image */}
                  <div className="w-full h-56 relative overflow-hidden bg-gray-100">
                    <Image
                      src={car.images?.[0] || car.image || "/placeholder-car.jpg"}
                      alt={car.name}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                      className="object-cover transition duration-500 group-hover:opacity-90"
                    />
                  </div>

                  {/* Content */}
                  <div className="p-5 flex flex-col flex-grow">
                    <div className="flex-grow">
                      <h3 className="font-bold text-xl text-gray-900 line-clamp-1">{car.name}</h3>
                      <p className="text-indigo-600 text-sm font-semibold mt-1">{car.brand || "Unspecified"}</p>
                      <p className="text-gray-500 text-sm mt-2 line-clamp-3">{car.description || "No description provided."}</p>
                    </div>

                    <p className="mt-4 mb-5 font-extrabold text-2xl text-green-700">{formatPrice(car.price)}</p>

                    <button
                      onClick={() => handleContact(car)}
                      className={`flex items-center justify-center gap-2 w-full px-4 py-3 rounded-xl text-white font-semibold transition-colors shadow-lg 
                        ${car.contactType === "whatsapp" 
                            ? "bg-green-500 hover:bg-green-600 shadow-green-500/30" 
                            : "bg-indigo-600 hover:bg-indigo-700 shadow-indigo-500/30"
                        }`}
                    >
                      {car.contactType === "whatsapp" ? (
                        <>
                          <PhoneCall size={20} /> Chat on WhatsApp
                        </>
                      ) : (
                        <>
                          <Instagram size={20} /> Message on Instagram
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </section>
  );
}
