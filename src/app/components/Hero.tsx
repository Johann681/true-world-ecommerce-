"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";

// --- Icons ---
const ArrowRight = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M5 12h14" />
    <path d="m12 5 7 7-7 7" />
  </svg>
);

export function SplitHeroSlider() {
  const slides = [
    { 
      src: "/home.jpg", 
      alt: "Premium tech showcase 1",
      // Fallback color if image fails to load
      bgColor: "bg-gray-100" 
    },
    { 
      src: "/home2.jpg", 
      alt: "Premium tech showcase 2",
      bgColor: "bg-gray-200"
    },
    { 
      src: "/home3.jpg", 
      alt: "Premium tech showcase 3",
      bgColor: "bg-gray-300"
    },
  ];

  const prefersReduced = useReducedMotion();
  const [index, setIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-play logic with pause on hover
  useEffect(() => {
    if (prefersReduced || isHovered) return;
    
    timeoutRef.current = setInterval(() => {
      setIndex((prev) => (prev + 1) % slides.length);
    }, 5000); // Slower, more elegant timing

    return () => {
      if (timeoutRef.current) clearInterval(timeoutRef.current);
    };
  }, [prefersReduced, isHovered, slides.length]);

  return (
    <section className="w-full bg-white text-[#0A0F1F] overflow-hidden">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 md:px-12 lg:px-16 py-16 md:py-24 lg:py-32">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20 items-center">

          {/* LEFT: Cinematic Slider */}
          <div 
            className="lg:col-span-7 relative order-2 lg:order-1"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            {/* Image Container */}
            <div className="relative w-full aspect-[4/5] md:aspect-[16/10] lg:aspect-[4/3] bg-[#F5F7FA] rounded-sm overflow-hidden shadow-2xl shadow-gray-200/50">
              <AnimatePresence mode="wait">
                <motion.div
                  key={index}
                  className={`absolute inset-0 w-full h-full ${slides[index].bgColor}`}
                  initial={{ opacity: 0, scale: 1.1 }} // Start slightly zoomed in
                  animate={{ opacity: 1, scale: 1 }}   // Zoom out to normal (or vice versa)
                  exit={{ opacity: 0 }}
                  transition={{ 
                    opacity: { duration: 0.8, ease: "easeInOut" },
                    scale: { duration: 6, ease: "linear" } // "Ken Burns" effect
                  }}
                >
                  <img
                    src={slides[index].src}
                    alt={slides[index].alt}
                    className="w-full h-full object-cover"
                  />
                  
                  {/* Subtle Gradient Overlay for Depth */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-60" />
                </motion.div>
              </AnimatePresence>

              {/* Modern Progress Indicators */}
              <div className="absolute left-6 bottom-6 md:left-8 md:bottom-8 flex items-center gap-3 z-10">
                {slides.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setIndex(i)}
                    className="group relative py-2 focus:outline-none"
                    aria-label={`Go to slide ${i + 1}`}
                  >
                    <div className="h-[3px] rounded-full transition-all duration-500 w-8 md:w-12 overflow-hidden bg-white/30 backdrop-blur-sm">
                      <motion.div 
                        className="h-full bg-white"
                        initial={{ width: "0%" }}
                        animate={{ width: i === index ? "100%" : "0%" }}
                        transition={{ duration: i === index ? 5 : 0.3, ease: "linear" }}
                      />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT: Typography & Actions */}
          <div className="lg:col-span-5 px-2 md:px-0 order-1 lg:order-2">
            <motion.div
              initial="hidden"
              animate="visible"
              variants={{
                hidden: { opacity: 0 },
                visible: { opacity: 1, transition: { staggerChildren: 0.15 } }
              }}
            >
              {/* Eyebrow Tag */}
              <motion.div 
                variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }}
                className="inline-flex items-center gap-2 mb-6"
              >
                <span className="w-8 h-[1px] bg-[#1E4AFF]"></span>
                <span className="text-xs font-bold tracking-widest uppercase text-[#1E4AFF]">New Collection</span>
              </motion.div>

              {/* Headline */}
              <motion.h2
                variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
                className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold tracking-tight leading-[1.1] text-[#0A0F1F]"
              >
                Designed with <br className="hidden lg:block" /> 
                <span className="text-gray-900">intent.</span>
                <span className="block mt-2 text-[#1E4AFF]">Built to last.</span>
              </motion.h2>

              {/* Description */}
              <motion.p
                variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
                className="mt-6 text-base md:text-lg text-gray-500 max-w-md leading-relaxed font-light"
              >
                Explore our curated collection of devices and luxury products — 
                clean layouts, premium visuals, and an experience crafted for 
                modern customers.
              </motion.p>

              {/* Buttons */}
              <motion.div
                variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
                className="mt-10 flex flex-wrap gap-4"
              >
                <a
                  href="/collections/featured"
                  className="group relative inline-flex items-center justify-center px-8 py-4 text-sm font-semibold text-white bg-[#0A0F1F] overflow-hidden rounded-sm transition-all hover:bg-[#1E4AFF]"
                >
                  <span className="relative z-10 flex items-center gap-2">
                    Shop Featured
                    <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
                  </span>
                </a>

                <a
                  href="/collections/cars"
                  className="group inline-flex items-center justify-center px-8 py-4 text-sm font-semibold text-[#0A0F1F] bg-transparent border border-gray-200 rounded-sm hover:border-[#0A0F1F] transition-all"
                >
                  View Cars
                </a>
              </motion.div>
            </motion.div>
          </div>

        </div>
      </div>
    </section>
  );
}

export default function HomePage() {
  return (
    <main className="w-full bg-white">
      <SplitHeroSlider />
    </main>
  );
}