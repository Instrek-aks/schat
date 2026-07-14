import React from 'react';
import { motion } from 'framer-motion';

export default function HowItWorksSection({ onStartAssessment }) {
  const steps = [
    {
      num: '01',
      title: 'Answer',
      desc: 'Respond to a short set of plain language questions across all seven dimensions.',
    },
    {
      num: '02',
      title: 'Score',
      desc: 'Each dimension is scored independently, so strengths and gaps are visible at a glance.',
    },
    {
      num: '03',
      title: 'Act',
      desc: 'Receive a composite readiness index and a clear view of what to prioritise next.',
    },
  ];

  // Define static gradient colors for the 7 segments
  const segmentColors = [
    '#4C8DFF', // 1
    '#5B84FE', // 2
    '#6B7AFC', // 3
    '#7A71FB', // 4
    '#8968FA', // 5
    '#995EF8', // 6
    '#A855F7', // 7
  ];

  return (
    <section className="relative px-4 sm:px-6 py-[80px] sm:py-[120px] bg-[#080B14] overflow-hidden">
      {/* Background glow blobs */}
      <div className="absolute top-[30%] left-[15%] w-[40vw] h-[40vw] rounded-full bg-accentBlue/5 blur-[130px] pointer-events-none" />
      <div className="absolute bottom-[25%] right-[15%] w-[40vw] h-[40vw] rounded-full bg-accentPurple/5 blur-[130px] pointer-events-none" />

      <div className="max-w-[1180px] mx-auto z-10 relative text-center flex flex-col items-center">
        {/* Eyebrow */}
        <div className="inline-flex items-center gap-[8px] px-3.5 py-1.5 rounded-full border border-white/9 bg-white/3.5 text-[10px] sm:text-[12px] font-bold uppercase tracking-[1.5px] sm:tracking-[2.4px] text-[#A7B2C4] mb-[18px] sm:mb-[22px]">
          <span className="w-1.5 h-1.5 rounded-full bg-gradient-to-r from-accentBlue to-accentPurple" />
          How it works
        </div>

        {/* Title matching screenshot */}
        <h2 className="font-sans font-extrabold text-2xl sm:text-3xl md:text-[36px] text-white tracking-tight mb-3 sm:mb-4 leading-tight">
          One assessment, seven dimensions
        </h2>

        {/* Subtitle matching screenshot */}
        <p className="font-sans text-xs sm:text-sm md:text-[16.5px] text-[#A7B2C4] max-w-[620px] mx-auto leading-relaxed mb-10 sm:mb-14">
          Each dimension is scored on its own, then combined into a single composite view of where you stand, in language non technical stakeholders can act on immediately.
        </p>

        {/* 3 Step Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-[980px] w-full mb-10 sm:mb-[64px]">
          {steps.map((s, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-100px' }}
              transition={{ duration: 0.6, delay: idx * 0.1 }}
              className="rounded-[16px] border border-white/9 bg-white/3.5 p-5 sm:p-[30px_26px] text-left shadow-[0_20px_45px_rgba(0,0,0,0.3)] hover:border-white/16 hover:bg-white/6 transition-all duration-300 flex flex-col justify-start min-h-[190px] sm:min-h-[220px]"
            >
              {/* Badge */}
              <div className="inline-flex items-center justify-center w-[34px] h-[34px] sm:w-[38px] sm:h-[38px] rounded-lg bg-white/5 border border-white/16 text-white font-sans text-[13px] sm:text-[15px] font-extrabold mb-4 flex-shrink-0">
                {s.num}
              </div>
              
              {/* Title */}
              <h3 className="font-sans font-extrabold text-base sm:text-[18px] text-white mb-2">
                {s.title}
              </h3>
              
              {/* Desc */}
              <p className="font-sans text-[13px] sm:text-[14px] text-[#A7B2C4] leading-relaxed">
                {s.desc}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Segments progress indicator representing 7 dimensions */}
        <div className="max-w-[760px] w-full mb-10 sm:mb-14 space-y-4 px-2 sm:px-0">
          <div className="text-[11px] sm:text-[13px] font-medium text-[#6E7A8E] tracking-wide">
            All seven dimensions, assessed independently
          </div>
          
          <div className="grid grid-cols-7 gap-1 sm:gap-[6px] h-[8px] sm:h-[10px] w-full">
            {segmentColors.map((color, i) => (
              <div key={i} className="relative h-full w-full rounded-full overflow-hidden bg-white/7">
                <motion.div
                  className="h-full w-full rounded-full"
                  style={{ backgroundColor: color }}
                  initial={{ width: 0 }}
                  whileInView={{ width: '100%' }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, delay: 0.1 + i * 0.08, ease: 'easeInOut' }}
                />
              </div>
            ))}
          </div>
        </div>

        {/* CTA below matching image */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="relative w-full sm:w-auto px-4 sm:px-0"
        >
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
        </motion.div>

      </div>
    </section>
  );
}
