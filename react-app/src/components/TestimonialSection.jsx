import React from 'react';
import { motion } from 'framer-motion';

export default function TestimonialSection({ onStartAssessment }) {
  return (
    <section className="relative px-4 sm:px-6 py-[80px] sm:py-[120px] bg-[#0D1220] overflow-hidden flex flex-col items-center">
      {/* Background glow blobs */}
      <div className="absolute top-[40%] left-[50%] -translate-x-1/2 -translate-y-1/2 w-[40vw] h-[40vw] rounded-full bg-accentPurple/5 blur-[120px] pointer-events-none" />

      {/* Card container */}
      <div className="max-w-[780px] w-full z-10 relative mb-8 sm:mb-10">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.7 }}
          className="rounded-[20px] sm:rounded-[24px] border border-white/9 bg-white/3.5 backdrop-blur-2xl p-6 sm:p-10 md:p-[56px_48px] text-center shadow-[0_30px_60px_rgba(0,0,0,0.45)] hover:border-white/16 transition-all duration-300 relative group"
        >
          {/* Subtle inner overlay */}
          <div className="absolute inset-0 rounded-[24px] bg-accentPurple/2 opacity-[0.02] pointer-events-none" />

          {/* Quotation Icon */}
          <div className="flex justify-center gap-1.5 mb-1 select-none">
            <div className="quote-mark text-[60px] sm:text-[90px] font-extrabold leading-none bg-gradient-to-r from-accentBlue to-accentPurple bg-clip-text text-transparent">&ldquo;</div>
          </div>

          {/* Heading matching image exactly */}
          <h2 className="why-quote font-sans font-bold text-lg sm:text-xl md:text-[27px] text-[#F3F5F9] leading-[1.4] sm:leading-[1.5] mb-[16px] sm:mb-[22px] tracking-tight">
            AI is a vast ocean. We do not want you to get lost in it. This assessment helps you navigate your AI journey with clarity and confidence.
          </h2>

          {/* Description matching image exactly */}
          <p className="why-support font-sans text-xs sm:text-sm md:text-[16.5px] text-[#A7B2C4] leading-relaxed max-w-[560px] mx-auto">
            Most organisations do not struggle with AI because of the technology itself. They struggle because readiness was never measured in the first place, so effort goes into the wrong place at the wrong time.
          </p>
        </motion.div>
      </div>

      {/* Button below card matching image exactly */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="z-10 relative w-full sm:w-auto px-4 sm:px-0"
      >
        {/* Soft button glow */}
        <div className="absolute inset-0 bg-[#A855F7]/25 blur-xl rounded-full scale-90" />
        <button 
          onClick={onStartAssessment}
          className="relative group overflow-hidden px-[24px] py-[12px] sm:px-[30px] sm:py-[15px] w-full sm:w-auto rounded-full bg-gradient-to-r from-accentBlue to-accentPurple text-[14px] sm:text-[15px] font-bold text-white tracking-wider hover:scale-[1.02] transition-transform duration-300 whitespace-nowrap"
        >
          <span className="relative z-10 flex items-center justify-center gap-1.5">
            Begin assessment <span className="group-hover:translate-x-1 transition-transform">→</span>
          </span>
          <div className="absolute inset-0 bg-gradient-to-r from-accentPurple to-accentBlue opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        </button>
      </motion.div>

    </section>
  );
}
