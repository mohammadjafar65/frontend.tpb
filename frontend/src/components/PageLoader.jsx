// components/PageLoader.jsx
import React from "react";

export default function PageLoader() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-blue-100 via-white to-indigo-100">
      {/* Circle animation */}
      <div className="relative w-24 h-24">
        <div className="absolute inset-0 border-4 border-t-transparent border-blue-500 rounded-full animate-spin" />
        <div className="absolute inset-3 border-4 border-t-transparent border-indigo-400 rounded-full animate-spin-slow" />
      </div>
      {/* Text/branding */}
      <div className="absolute bottom-20 text-center">
        <h2 className="text-xl font-semibold text-gray-800 tracking-wide">The Pilgrim Beez</h2>
        <p className="text-sm text-gray-500">Discover. Travel. Explore.</p>
      </div>
    </div>
  );
}