import React, { useState, useEffect } from 'react';

export default function Navigation({ onStartAssessment, onOpenAdmin }) {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#070B14] border-b border-white/5 py-1.5 sm:py-2.5 md:py-3.5 backdrop-blur-md">
      <div className="max-w-[1180px] mx-auto px-2.5 sm:px-8 flex items-center justify-between gap-3 h-11 sm:h-13 md:h-14">
        {/* Logo */}
        <div 
          className="flex items-center gap-2 cursor-pointer select-none group flex-shrink-0" 
          onClick={() => window.scrollTo({top:0, behavior:'smooth'})}
        >
          <div className="w-[8px] h-[8px] sm:w-[9px] sm:h-[9px] md:w-[10px] md:h-[10px] rounded-full bg-gradient-to-r from-accentBlue to-accentPurple shadow-[0_0_10px_rgba(168,85,247,0.7)] group-hover:scale-110 transition-transform duration-300 flex-shrink-0" />
          <span className="font-sans font-extrabold text-[11.5px] sm:text-[15px] md:text-[18px] tracking-[-0.01em] text-white group-hover:text-slate-200 transition-colors">
            AI Readiness
          </span>
        </div>

        {/* CTA Buttons - Visible on all screens */}
        <div className="flex items-center gap-2">


          <button 
            onClick={onStartAssessment}
            className="relative group overflow-hidden px-2 py-0.5 sm:px-4 sm:py-2 md:px-6 md:py-3 rounded-full bg-gradient-to-r from-accentBlue to-accentPurple text-[9px] sm:text-[12.5px] md:text-[14px] font-bold text-white tracking-wide shadow-[0_8px_24px_rgba(88,110,247,0.35)] hover:shadow-[0_12px_32px_rgba(88,110,247,0.5)] transition-all duration-300 hover:scale-[1.02] flex-shrink-0 whitespace-nowrap"
          >
            <span className="relative z-10 flex items-center gap-1">
              Begin assessment <span className="group-hover:translate-x-1 transition-transform">→</span>
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-accentPurple to-accentBlue opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          </button>
        </div>
      </div>
    </nav>
  );
}
