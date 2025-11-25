"use client";

import React from "react";
// Import Link for Next.js routing best practice, even if not strictly required for external/mailto links
import Link from "next/link"; 

// --- Brand Colors ---
const COLOR_NAVY = "#0A0F1F"; // Dark Navy
const COLOR_BLUE = "#1E4AFF"; // Electric Blue Accent

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    // Set padding and use the Dark Navy brand color for the background
    <footer 
      className="mt-20 py-10" 
      style={{ backgroundColor: COLOR_NAVY }}
    >
      <div className="max-w-7xl mx-auto px-6">
        
        {/* Main Content Row: Copyright & Policy Links */}
        <div className="flex flex-col md:flex-row justify-between items-center text-sm text-gray-300">
          
          {/* Copyright Section */}
          <div className="mb-4 md:mb-0 md:order-1 text-center md:text-left text-gray-400">
            &copy; {year} True World Technology. All rights reserved.
          </div>
          
          {/* Links Section */}
          <div className="flex flex-wrap justify-center gap-6 md:order-2 text-sm font-medium">
            <Link 
              href="/terms" 
              className="hover:text-[#1E4AFF] transition"
            >
              Terms of Service
            </Link>
            <Link 
              href="/privacy" 
              className="hover:text-[#1E4AFF] transition"
            >
              Privacy Policy
            </Link>
            <Link 
              href="/sitemap" 
              className="hover:text-[#1E4AFF] transition"
            >
              Sitemap
            </Link>
            {/* Mailto link */}
            <a 
              href="mailto:support@trueworld.com" 
              className="hover:text-[#1E4AFF] transition"
            >
              Support
            </a>
          </div>
        </div>
        
        {/* Decorative Divider and Brand Motto */}
        <div className="mt-10 pt-6 border-t border-gray-700/50 text-center text-xs text-gray-500">
            Premium Gadgets & Technology. Crafted for tomorrow.
        </div>
      </div>
    </footer>
  );
}