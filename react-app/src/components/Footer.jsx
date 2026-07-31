import React from 'react';

export default function Footer({ onOpenAdmin }) {
  return (
    <footer className="relative bg-[#080B14] border-t border-white/9 py-[30px] px-6 text-center overflow-hidden">
      <div className="max-w-[1180px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="text-[13px] text-[#6E7A8E] tracking-wide">
          AI Readiness Assessment. Built to help organisations navigate AI adoption with clarity.
        </p>
        {onOpenAdmin && (
          <button
            onClick={onOpenAdmin}
            className="text-[12px] text-slate-400 hover:text-blue-400 font-medium transition-colors flex items-center gap-1"
          >
            <span>⚙️</span> Admin Portal
          </button>
        )}
      </div>
    </footer>
  );
}
