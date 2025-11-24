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

  // KEEPING ENDPOINTS EXACTLY AS REQUESTED
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
        console.error("Failed to fetch listings:", err);
        const errorMessage = (err as AxiosError)?.message || "Could not connect to listings.";
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
      const msg = encodeURIComponent(`Hello True World, I'm interested in the ${car.name} (${formatPrice(car.price)}). Is it still available?`);
      if (!whatsappLink.includes('?')) whatsappLink = `${whatsappLink}${whatsappLink.includes('wa.me/') ? '?' : ''}text=${msg}`;
      window.open(whatsappLink, "_blank");
      return;
    } 
    if (car.contactType === "instagram" && link) {
      const instaLink = link.startsWith('http') ? link : `https://www.instagram.com/${link.replace('@', '')}`;
      window.open(instaLink, "_blank");
      return;
    }
    alert(`Contact link for ${car.name} is missing.`);
  };

  // --- Render ---
  return (
    <section className="bg-white py-24 border-t border-gray-100">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 md:px-12 lg:px-16">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 mb-4">
              <span className="w-6 h-[2px] bg-[#1E4AFF]"></span>
              <span className="text-xs font-bold tracking-widest uppercase text-[#1E4AFF]">
                Premium Selection
              </span>
            </div>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-[#0A0F1F] tracking-tight">
              Exclusive Inventory
            </h2>
            <p className="text-gray-500 mt-4 text-lg font-light">
              Browse our hand-picked selection of top-quality items, curated for performance and style.
            </p>
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-32">
            <Loader2 size={40} className="animate-spin text-[#1E4AFF] mb-4" />
            <p className="text-gray-400 font-light">Loading inventory...</p>
          </div>
        )}

        {/* Error */}
        {error && !loading && (
          <div className="text-center py-24 bg-red-50 rounded-lg border border-red-100">
            <Zap size={32} className="text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-red-700 mb-2">Unable to load inventory</h3>
            <p className="text-red-600/80">{error}</p>
          </div>
        )}

        {/* Grid */}
        {!loading && !error && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {cars.length === 0 ? (
              <div className="col-span-full text-center py-24 bg-gray-50 rounded-lg border border-dashed border-gray-200">
                <MessageCircle size={32} className="mx-auto mb-4 text-gray-300" />
                <p className="text-gray-900 font-medium text-lg">Inventory Updating</p>
                <p className="text-gray-500">Check back shortly for new arrivals.</p>
              </div>
            ) : (
              cars.map((car) => (
                <div
                  key={car._id}
                  className="group flex flex-col bg-transparent"
                >
                  {/* Image Area - TALLER, CLEANER, NO OVERLAYS */}
                  <div className="relative w-full aspect-[4/5] bg-gray-50 rounded-lg overflow-hidden mb-6 shadow-sm border border-gray-100">
                    <Image
                      src={car.images?.[0] || car.image || "/placeholder-car.jpg"}
                      alt={car.name}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                      // object-cover ensures it fills the space vividly
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  </div>

                  {/* Content Area */}
                  <div className="flex flex-col flex-grow">
                    
                    {/* Brand & Price Row */}
                    <div className="flex justify-between items-start mb-2">
                      <p className="text-[#1E4AFF] text-xs font-bold uppercase tracking-wider">
                        {car.brand || "Premium"}
                      </p>
                      <p className="font-bold text-[#0A0F1F] text-lg">
                        {formatPrice(car.price)}
                      </p>
                    </div>

                    {/* Name */}
                    <h3 className="font-bold text-xl text-[#0A0F1F] leading-tight mb-3 group-hover:text-[#1E4AFF] transition-colors">
                      {car.name}
                    </h3>

                    {/* Description - FULLY VISIBLE */}
                    <div className="text-gray-500 text-sm leading-relaxed mb-6">
                      {car.description || "No specific description provided for this item."}
                    </div>

                    {/* Action Button */}
                    <button
                      onClick={() => handleContact(car)}
                      className={`mt-auto flex items-center justify-center gap-2 w-full px-4 py-4 rounded-sm text-sm font-semibold transition-all duration-300 shadow-sm
                        ${car.contactType === "whatsapp" 
                            ? "bg-[#0A0F1F] text-white hover:bg-[#1E4AFF] hover:shadow-lg" 
                            : "bg-white text-[#0A0F1F] border border-gray-200 hover:border-[#0A0F1F]"
                        }`}
                    >
                      {car.contactType === "whatsapp" ? (
                        <>
                          <PhoneCall size={18} /> Buy Now
                        </>
                      ) : (
                        <>
                          <Instagram size={18} /> View on Instagram
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