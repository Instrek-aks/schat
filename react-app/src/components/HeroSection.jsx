import React from 'react';
import { motion } from 'framer-motion';

export default function HeroSection({ onStartAssessment, onLearnMore }) {
  // Circular gauge config
  const pct = 68;
  const radius = 46;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (pct / 100) * circumference;

  const categories = [
    { name: 'Data readiness', value: 74, color: '#4C8DFF' },
    { name: 'Technology', value: 58, color: '#5B84FE' },
    { name: 'Governance', value: 41, color: '#6B7AFC' },
    { name: 'People & talent', value: 63, color: '#8968FA' },
  ];

  return (
    <section className="relative min-h-[90vh] flex flex-col justify-center items-center px-4 sm:px-6 pt-[120px] pb-[70px] sm:pt-[140px] sm:pb-[90px] md:pt-[160px] overflow-hidden bg-bgDark">
      {/* Background radial glow orbs matching template */}
      <div className="absolute w-[300px] h-[300px] sm:w-[520px] sm:h-[520px] rounded-full bg-[#4C8DFF] opacity-[0.25] sm:opacity-[0.35] blur-[70px] sm:blur-[90px] top-[-100px] left-[-100px] pointer-events-none animate-pulse-slow" />
      <div className="absolute w-[280px] h-[280px] sm:w-[460px] sm:h-[460px] rounded-full bg-[#A855F7] opacity-[0.25] sm:opacity-[0.35] blur-[70px] sm:blur-[90px] top-[100px] right-[-100px] pointer-events-none animate-pulse-slow" style={{ animationDelay: '2.5s' }} />

      <div className="max-w-[1180px] mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-[56px] items-center z-10">
        
        {/* Left Column: Content */}
        <motion.div 
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
          className="lg:col-span-7 text-left flex flex-col items-start"
        >
          {/* Eyebrow */}
          <div className="inline-flex items-center gap-[8px] px-3.5 py-1.5 rounded-full border border-white/9 bg-white/3.5 text-[10px] sm:text-[12px] font-bold uppercase tracking-[1.5px] sm:tracking-[2.4px] text-[#A7B2C4] mb-[18px] sm:mb-[22px]">
            <span className="w-1.5 h-1.5 rounded-full bg-gradient-to-r from-accentBlue to-accentPurple" />
            AI maturity framework
          </div>

          {/* Heading */}
          <h1 className="font-sans font-extrabold text-[32px] xs:text-[38px] sm:text-[44px] md:text-[50px] text-white leading-[1.15] tracking-[-0.02em] mb-[18px] sm:mb-[22px]">
            Is your organisation<br />ready for <span className="bg-gradient-to-r from-accentBlue to-accentPurple bg-clip-text text-transparent drop-shadow-[0_2px_15px_rgba(168,85,247,0.25)]">AI?</span>
          </h1>

          {/* Description */}
          <p className="font-sans text-[14px] sm:text-[16px] md:text-[18px] text-[#A7B2C4] max-w-[500px] leading-[1.6] mb-[24px] sm:mb-[34px]">
            A structured, seven dimension assessment that shows your organisation exactly where it stands on AI readiness, and what to fix first. Get your score in minutes.
          </p>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-[12px] sm:gap-[14px] w-full sm:w-auto">
            <button 
              onClick={onStartAssessment}
              className="group btn btn-primary px-5 py-3 sm:px-[30px] sm:py-[15px] text-xs sm:text-[15px] font-bold text-white tracking-wide shadow-[0_8px_24px_rgba(88,110,247,0.35)] hover:shadow-[0_12px_32px_rgba(88,110,247,0.5)] rounded-full transition-all duration-300 hover:scale-[1.02] w-full sm:w-auto whitespace-nowrap"
            >
              Begin assessment <span className="inline-block group-hover:translate-x-1 transition-transform ml-1.5">→</span>
            </button>
            <button 
              onClick={onLearnMore}
              className="btn btn-ghost px-5 py-3 sm:px-[30px] sm:py-[15px] text-xs sm:text-[15px] font-bold text-[#F3F5F9] border border-white/16 bg-white/3.5 rounded-full hover:bg-white/6 transition-all duration-300 w-full sm:w-auto whitespace-nowrap"
            >
              See the seven dimensions
            </button>
          </div>
        </motion.div>

        {/* Right Column: Visual Card */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.96, y: 24 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.15, ease: 'easeOut' }}
          className="lg:col-span-5 relative flex justify-center lg:justify-end w-full"
        >
          {/* Gauge Preview Card */}
          <div className="w-full max-w-[460px] rounded-[24px] border border-white/16 bg-gradient-to-b from-white/5 to-white/2 backdrop-blur-[20px] p-5 sm:p-[30px] shadow-[0_30px_60px_rgba(0,0,0,0.45)] hover:border-white/20 transition-all duration-500 group relative">
            
            {/* Header info */}
            <div className="flex justify-between items-center mb-[22px] relative z-10">
              <span className="text-[11px] sm:text-[12.5px] font-semibold text-[#6E7A8E] tracking-[0.4px]">Sample readiness report</span>
              <span className="flex items-center gap-[6px] text-[10px] sm:text-[11.5px] font-bold text-teal-400 bg-teal-500/10 px-2 sm:px-2.5 py-0.5 rounded-full border border-teal-500/20 flex-shrink-0">
                <span className="w-1.5 h-1.5 rounded-full bg-teal-400" />
                Illustrative
              </span>
            </div>

            {/* Circular Gauge */}
            <div className="flex flex-col sm:flex-row items-center gap-[16px] sm:gap-[26px] mb-[26px] relative z-10">
              <div className="relative w-[104px] h-[104px] flex items-center justify-center flex-shrink-0">
                <svg className="w-full h-full transform -rotate-90" width="104" height="104" viewBox="0 0 104 104">
                  {/* Outer ring background */}
                  <circle
                    cx="52"
                    cy="52"
                    r={radius}
                    fill="none"
                    stroke="rgba(255, 255, 255, 0.08)"
                    strokeWidth="9"
                  />
                  {/* Animated stroke */}
                  <motion.circle
                    id="gaugeCircle"
                    cx="52"
                    cy="52"
                    r={radius}
                    fill="none"
                    stroke="url(#gaugeGrad)"
                    strokeWidth="9"
                    strokeDasharray={circumference}
                    initial={{ strokeDashoffset: circumference }}
                    animate={{ strokeDashoffset }}
                    transition={{ duration: 1.3, delay: 0.4, ease: 'easeOut' }}
                    strokeLinecap="round"
                  />
                  <defs>
                    <linearGradient id="gaugeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#4C8DFF" />
                      <stop offset="100%" stopColor="#A855F7" />
                    </linearGradient>
                  </defs>
                </svg>
                {/* Inside circle text */}
                <div className="absolute flex flex-col items-center justify-center">
                  <span className="text-[30px] sm:text-[34px] font-black text-white leading-none">68</span>
                  <span className="text-[10px] sm:text-xs font-bold text-slate-500 tracking-wider mt-0.5">/ 100</span>
                </div>
              </div>

              <div className="text-center sm:text-left flex-1">
                <div className="gauge-num text-[36px] sm:text-[44px] font-extrabold text-[#F3F5F9] leading-tight">68<sub className="text-[14px] sm:text-[16px] text-[#6E7A8E] font-semibold">/100</sub></div>
                <div className="gauge-label text-[12px] sm:text-[13px] text-[#A7B2C4] mt-1">Composite AI readiness</div>
              </div>
            </div>

            {/* Horizontal progress bars */}
            <div className="space-y-3.5 relative z-10">
              {categories.map((c, i) => (
                <div key={i} className="flex items-center gap-[12px]">
                  <span className="name text-[11px] sm:text-[12.5px] text-[#A7B2C4] w-[95px] sm:w-[108px] flex-shrink-0 text-left truncate">{c.name}</span>
                  <div className="mini-bar-track flex-1 h-[6px] rounded-full bg-white/7 overflow-hidden border border-white/2">
                    <motion.div 
                      className="mini-bar-fill h-full rounded-full bg-gradient-to-r from-accentBlue to-accentPurple"
                      initial={{ width: 0 }}
                      animate={{ width: `${c.value}%` }}
                      transition={{ duration: 1.1, delay: 0.7 + i * 0.1, ease: 'easeOut' }}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Footer notice inside card */}
            <div className="mt-[22px] pt-[18px] border-t border-white/9 text-center relative z-10">
              <p className="preview-foot text-[10.5px] sm:text-[11.5px] text-[#6E7A8E] leading-relaxed">
                This is a sample output. Your actual report is generated after you complete the assessment.
              </p>
            </div>

          </div>
        </motion.div>

      </div>
    </section>
  );
}
