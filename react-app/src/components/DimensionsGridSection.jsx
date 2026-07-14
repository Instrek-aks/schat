import React from 'react';
import { motion } from 'framer-motion';

export default function DimensionsGridSection({ onStartAssessment }) {
  const dimensions = [
    {
      num: '01 / 07',
      title: 'Company strategy',
      bullets: ['AI/ML strategy alignment', 'Executive sponsorship', 'ROI based prioritisation'],
      borderColor: '#4C8DFF',
      textColor: '#4C8DFF',
    },
    {
      num: '02 / 07',
      title: 'Business functions',
      bullets: ['Adoption across business units', 'KPI definition', 'IT and business collaboration'],
      borderColor: '#5B84FE',
      textColor: '#5B84FE',
    },
    {
      num: '03 / 07',
      title: 'Data readiness',
      bullets: ['Centralisation and quality', 'Governance and cataloguing', 'Historical availability'],
      borderColor: '#6B7AFC',
      textColor: '#6B7AFC',
    },
    {
      num: '04 / 07',
      title: 'Technology',
      bullets: ['Scalable infrastructure', 'ML tooling and data engineering', 'API integration layers'],
      borderColor: '#7A71FB',
      textColor: '#7A71FB',
    },
    {
      num: '05 / 07',
      title: 'Security & governance',
      bullets: ['Data privacy', 'DPDP and GDPR compliance', 'RBAC and ethical AI policy'],
      borderColor: '#8968FA',
      textColor: '#8968FA',
    },
    {
      num: '06 / 07',
      title: 'People & talent',
      bullets: ['AI/ML expertise', 'Employee AI awareness', 'Change management'],
      borderColor: '#995EF8',
      textColor: '#995EF8',
    },
    {
      num: '07 / 07',
      title: 'Operations & MLOps',
      bullets: ['MLOps practices', 'Model monitoring and drift detection', 'AI workflow integration'],
      borderColor: '#A855F7',
      textColor: '#A855F7',
    },
  ];

  return (
    <section id="dimensions-section" className="relative px-4 sm:px-6 py-[80px] sm:py-[120px] bg-[#0D1220] overflow-hidden">
      {/* Background glow blobs */}
      <div className="absolute top-[50%] right-[5%] w-[40vw] h-[40vw] rounded-full bg-accentBlue/5 blur-[130px] pointer-events-none" />

      <div className="max-w-[1180px] mx-auto z-10 relative">
        
        {/* Header */}
        <div className="text-center mb-[40px] sm:mb-16">
          {/* Eyebrow */}
          <div className="inline-flex items-center gap-[8px] px-3.5 py-1.5 rounded-full border border-white/9 bg-white/3.5 text-[10px] sm:text-[12px] font-bold uppercase tracking-[1.5px] sm:tracking-[2.4px] text-[#A7B2C4] mb-[18px] sm:mb-[22px]">
            <span className="w-1.5 h-1.5 rounded-full bg-gradient-to-r from-accentBlue to-accentPurple" />
            The framework
          </div>

          {/* Title */}
          <h2 className="font-sans font-extrabold text-2xl sm:text-3xl md:text-[36px] text-white tracking-tight mb-3 sm:mb-4 leading-tight">
            The seven dimensions of AI readiness
          </h2>

          {/* Subtitle */}
          <p className="font-sans text-xs sm:text-sm md:text-[16.5px] text-[#A7B2C4] max-w-[620px] mx-auto leading-relaxed">
            Every organisation is assessed across the same seven dimensions, so results are consistent and easy to compare over time.
          </p>
        </div>

        {/* 8-Card Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-[18px] items-stretch">
          {dimensions.map((d, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.5, delay: idx * 0.05 }}
              className="rounded-[16px] bg-white/3.5 p-5 sm:p-[26px_24px] text-left shadow-[0_15px_35px_rgba(0,0,0,0.35)] hover:-translate-y-1.5 transition-all duration-305 relative group flex flex-col justify-between overflow-hidden min-h-[200px] sm:min-h-[240px]"
              style={{
                borderTop: `3px solid ${d.borderColor}`,
                borderLeft: '1px solid rgba(255, 255, 255, 0.09)',
                borderRight: '1px solid rgba(255, 255, 255, 0.09)',
                borderBottom: '1px solid rgba(255, 255, 255, 0.09)',
                boxShadow: `0 15px 35px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.02)`
              }}
            >
              {/* Subtle inner hover glow */}
              <div 
                className="absolute inset-0 rounded-[16px] opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none bg-gradient-to-tr from-transparent via-white/2 to-transparent -z-10"
              />
              <div 
                className="absolute -top-[30%] -right-[30%] w-[60%] h-[60%] rounded-full opacity-0 group-hover:opacity-10 transition-opacity duration-500 pointer-events-none"
                style={{ background: `radial-gradient(circle, ${d.borderColor} 0%, transparent 70%)` }}
              />

              <div className="relative z-10">
                {/* Badge matching format */}
                <div className="text-[11px] sm:text-[12px] font-extrabold tracking-wider mb-2 sm:mb-3" style={{ color: d.textColor }}>
                  {d.num}
                </div>
                
                {/* Title */}
                <h3 className="font-sans font-extrabold text-[15px] sm:text-[17px] text-white mb-3">
                  {d.title}
                </h3>

                {/* Bullet-free vertical list matching image */}
                <div className="space-y-1.5">
                  {d.bullets.map((bullet, bIdx) => (
                    <div key={bIdx} className="text-xs sm:text-[13px] text-[#A7B2C4] leading-snug">
                      {bullet}
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}

          {/* Card 8: Gradient CTA Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.5, delay: 7 * 0.05 }}
            className="rounded-[16px] p-5 sm:p-[26px_24px] text-left shadow-[0_20px_45px_rgba(0,0,0,0.4)] flex flex-col justify-between hover:-translate-y-1.5 transition-all duration-300 group min-h-[200px] sm:min-h-[240px] border border-white/9 bg-gradient-to-br from-[#4C8DFF]/16 to-[#A855F7]/16 relative overflow-hidden"
          >
            <div className="relative z-10">
              <h3 className="font-sans font-extrabold text-sm sm:text-[16px] text-white leading-snug max-w-[190px]">
                Ready to see where you stand?
              </h3>
            </div>

            <div className="relative z-10 mt-6 sm:mt-8">
              {/* Glow for the button */}
              <div className="absolute inset-0 bg-[#A855F7]/20 blur-lg rounded-full scale-90" />
              <button 
                onClick={onStartAssessment}
                className="w-full flex items-center justify-center gap-1 px-4 py-2 sm:px-5 sm:py-2.5 rounded-full bg-gradient-to-r from-accentBlue to-accentPurple text-[12px] sm:text-[13.5px] font-bold text-white tracking-wide shadow-[0_8px_24px_rgba(88,110,247,0.35)] hover:shadow-[0_12px_32px_rgba(88,110,247,0.5)] transition-all duration-300 hover:scale-[1.02] whitespace-nowrap"
              >
                <span>Begin assessment</span>
                <span className="group-hover:translate-x-1 transition-transform">→</span>
              </button>
            </div>
          </motion.div>
        </div>

      </div>
    </section>
  );
}
