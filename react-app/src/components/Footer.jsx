import React from 'react';

export default function Footer({ onOpenAdmin }) {
  return (
    <footer className="relative bg-[#080B14] border-t border-white/9 py-[30px] px-6 text-center overflow-hidden">
      <div className="max-w-[1180px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="text-[13px] text-[#6E7A8E] tracking-wide">
          &copy; {new Date().getFullYear()} Instrek. All rights reserved.
        </p>

      </div>
    </footer>
  );
}
