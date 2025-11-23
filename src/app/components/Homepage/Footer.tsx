"use client";

import React from "react";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-white shadow-inner mt-10">
      <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col md:flex-row justify-between items-center text-sm text-gray-500">
        <div className="mb-2 md:mb-0">&copy; {year} True World Technology. All rights reserved.</div>
        <div className="flex gap-4">
          <a href="/terms" className="hover:text-gray-900">Terms</a>
          <a href="/privacy" className="hover:text-gray-900">Privacy</a>
          <a href="mailto:support@trueworld.com" className="hover:text-gray-900">Support</a>
        </div>
      </div>
    </footer>
  );
}
