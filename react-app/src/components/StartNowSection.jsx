import React from 'react';
import { motion } from 'framer-motion';

export default function StartNowSection({ onStartAssessment }) {
  const badges = ['No signup required', 'Instant results', 'Confidential'];

  return (
    <section className="relative px-4 sm:px-6 py-[80px] sm:py-[120px] bg-gradient-to-b from-[#0D1424] via-[#151033] to-[#1A1030] overflow-hidden text-center flex flex-col items-center">
      {/* Background orbs matching template */}
      <div className="absolute w-[300px] h-[300px] sm:w-[520px] sm:h-[520px] rounded-full bg-[#A855F7] opacity-[0.2] sm:opacity-[0.28] blur-[70px] sm:blur-[90px] top-[-100px] left-[10%] pointer-events-none" />
      <div className="absolute w-[280px] h-[280px] sm:w-[460px] sm:h-[460px] rounded-full bg-[#4C8DFF] opacity-[0.2] sm:opacity-[0.28] blur-[70px] sm:blur-[90px] bottom-[-140px] right-[10%] pointer-events-none" />

      <div className="max-w-[1180px] mx-auto z-10 relative flex flex-col items-center w-full">
        {/* Eyebrow matching template */}
        <div className="inline-flex items-center gap-2 px-[14px] py-[6px] pl-[10px] rounded-full border border-white/9 bg-white/3.5 text-[10px] sm:text-[12px] font-bold uppercase tracking-[1.5px] sm:tracking-[2.4px] text-[#A7B2C4] mb-[18px] sm:mb-[22px]">
          <span className="w-[6px] h-[6px] rounded-full bg-gradient-to-r from-accentBlue to-accentPurple" />
          Start now
        </div>

        {/* Heading */}
        <h2 className="font-sans font-extrabold text-2xl sm:text-3xl md:text-[38px] text-white leading-[1.2] sm:leading-[1.15] tracking-[-0.02em] mb-4 sm:mb-[16px] max-w-3xl">
          Find out where you stand,<br />
          in minutes.
        </h2>

        {/* Description matching template exactly */}
        <p className="font-sans text-xs sm:text-sm md:text-[16.5px] text-[#A7B2C4] max-w-[520px] leading-relaxed mb-8 sm:mb-[32px] px-2">
          Answer a short set of questions across all seven dimensions and get your composite AI readiness score immediately.
        </p>

        {/* CTA Button */}
        <div className="relative mb-[32px] w-full sm:w-auto px-4 sm:px-0">
          {/* Soft button glow */}
          <div className="absolute inset-0 bg-[#A855F7]/25 blur-xl rounded-full scale-90" />
          <button
            onClick={onStartAssessment}
            className="relative group overflow-hidden px-[24px] py-[12px] sm:px-[30px] sm:py-[15px] w-full sm:w-auto rounded-full bg-gradient-to-r from-accentBlue to-accentPurple text-[14px] sm:text-[15px] font-bold text-white tracking-wider hover:scale-[1.02] transition-transform duration-300 whitespace-nowrap"
          >
            <span className="relative z-10 flex items-center justify-center gap-1.5">
              Begin assessment <span className="group-hover:translate-x-1 transition-transform ml-1.5">→</span>
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-accentPurple to-accentBlue opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          </button>
        </div>

        {/* Feature Badges with checkmarks matching template */}
        <div className="flex flex-col sm:flex-row justify-center items-center gap-[10px] w-full sm:w-auto px-4 sm:px-0">
          {badges.map((b, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              className="flex items-center justify-center gap-[6px] text-xs sm:text-[12.5px] font-semibold text-[#A7B2C4] border border-white/9 bg-white/3.5 px-[14px] py-[7px] rounded-full w-full sm:w-auto"
            >
              <span className="text-[#22D3EE] font-sans font-black select-none">✓</span>
              <span>{b}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
