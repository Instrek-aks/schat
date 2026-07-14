import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

const INDUSTRIES = ['Financial Services','Healthcare','Retail & E-commerce','Manufacturing','Technology','Professional Services','Other'];
const REVENUES = ['Under ₹100Cr','₹100Cr - ₹500Cr','₹500Cr - ₹2,000Cr','Over ₹2,000Cr'];
const SIZES = ['1-50','51-200','201-1,000','1,000+'];
const ROLES = ['Founder / CEO','CTO / CDO / CAIO','Head of Product / Ops','Legal / Compliance Lead'];
const LEVELS = ['None (Exploring)','Early (Pilot phase)','Active (Production usage)','Advanced (AI-first ops)'];

export default function IntakeModal({ isOpen, onClose, onLaunch }) {
  const [form, setForm] = useState({ 
    company:'', 
    industry:'', 
    revenue:'', 
    size:'',
    role: '',
    level: ''
  });

  const update = (k, v) => setForm(f => ({...f, [k]: v}));

  const canLaunch = form.company && form.industry && form.revenue && form.size && form.role && form.level;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (canLaunch) {
      onLaunch(form);
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          
          {/* Backdrop */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-[#070B14]/80 backdrop-blur-md"
          />

          {/* Modal Container */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.3 }}
            className="relative w-full max-w-2xl rounded-premium border border-white/10 bg-[#0d1425]/90 backdrop-blur-2xl p-6 sm:p-8 shadow-[0_25px_60px_rgba(0,0,0,0.8)] overflow-hidden z-10 text-left"
          >
            {/* Ambient background glow inside modal */}
            <div className="absolute -top-[30%] -right-[30%] w-[60%] h-[60%] rounded-full bg-accentBlue/20 blur-[80px] pointer-events-none" />
            <div className="absolute -bottom-[30%] -left-[30%] w-[60%] h-[60%] rounded-full bg-accentPurple/15 blur-[80px] pointer-events-none" />

            {/* Close Button */}
            <button 
              onClick={onClose}
              className="absolute top-5 right-5 w-8 h-8 rounded-full border border-white/5 bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white flex items-center justify-center transition-all duration-200"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Header */}
            <div className="mb-8 pr-10">
              <span className="text-[10px] font-bold uppercase tracking-wider text-accentBlue mb-2 block">
                Step 01 - Company Profile
              </span>
              <h2 className="font-sans font-extrabold text-xl sm:text-2xl text-white">
                Tell Us About Your Organisation
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                This information helps calibrate the assessment parameters for your specific sector and scale.
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                
                {/* Company Name */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    Company Name
                  </label>
                  <input 
                    type="text"
                    required
                    className="w-full text-sm rounded bg-white/5 border border-white/10 text-white placeholder-slate-500 px-4 py-3 outline-none focus:border-accentBlue focus:bg-white/10 focus:shadow-[0_0_15px_rgba(91,124,255,0.2)] transition-all duration-200"
                    placeholder="Acme Technologies Pvt. Ltd."
                    value={form.company}
                    onChange={e => update('company', e.target.value)}
                  />
                </div>

                {/* Industry */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    Industry
                  </label>
                  <select 
                    required
                    className="w-full text-sm rounded bg-white/5 border border-white/10 text-slate-300 px-4 py-3 outline-none focus:border-accentBlue focus:bg-white/10 focus:shadow-[0_0_15px_rgba(91,124,255,0.2)] transition-all duration-200 [&>option]:bg-[#0d1425] [&>option]:text-white"
                    value={form.industry}
                    onChange={e => update('industry', e.target.value)}
                  >
                    <option value="">Select industry</option>
                    {INDUSTRIES.map(i => <option key={i} value={i}>{i}</option>)}
                  </select>
                </div>

                {/* Annual Revenue */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    Annual Revenue
                  </label>
                  <select 
                    required
                    className="w-full text-sm rounded bg-white/5 border border-white/10 text-slate-300 px-4 py-3 outline-none focus:border-accentBlue focus:bg-white/10 focus:shadow-[0_0_15px_rgba(91,124,255,0.2)] transition-all duration-200 [&>option]:bg-[#0d1425] [&>option]:text-white"
                    value={form.revenue}
                    onChange={e => update('revenue', e.target.value)}
                  >
                    <option value="">Select range</option>
                    {REVENUES.map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>

                {/* Employee Count */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    Employee Count
                  </label>
                  <select 
                    required
                    className="w-full text-sm rounded bg-white/5 border border-white/10 text-slate-300 px-4 py-3 outline-none focus:border-accentBlue focus:bg-white/10 focus:shadow-[0_0_15px_rgba(91,124,255,0.2)] transition-all duration-200 [&>option]:bg-[#0d1425] [&>option]:text-white"
                    value={form.size}
                    onChange={e => update('size', e.target.value)}
                  >
                    <option value="">Select size</option>
                    {SIZES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>

                {/* Respondent Role */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    Respondent Role
                  </label>
                  <select 
                    required
                    className="w-full text-sm rounded bg-white/5 border border-white/10 text-slate-300 px-4 py-3 outline-none focus:border-accentBlue focus:bg-white/10 focus:shadow-[0_0_15px_rgba(91,124,255,0.2)] transition-all duration-200 [&>option]:bg-[#0d1425] [&>option]:text-white"
                    value={form.role}
                    onChange={e => update('role', e.target.value)}
                  >
                    <option value="">Select role</option>
                    {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>

                {/* Current AI Investment */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    Current AI Investment Level
                  </label>
                  <select 
                    required
                    className="w-full text-sm rounded bg-white/5 border border-white/10 text-slate-300 px-4 py-3 outline-none focus:border-accentBlue focus:bg-white/10 focus:shadow-[0_0_15px_rgba(91,124,255,0.2)] transition-all duration-200 [&>option]:bg-[#0d1425] [&>option]:text-white"
                    value={form.level}
                    onChange={e => update('level', e.target.value)}
                  >
                    <option value="">Select level</option>
                    {LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
                  </select>
                </div>

              </div>

              {/* Launch Action */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-white/5">
                <button 
                  type="submit"
                  disabled={!canLaunch}
                  className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-gradient-to-r from-accentBlue to-accentPurple text-xs font-bold text-white tracking-wider uppercase transition-all duration-300 shadow-[0_4px_15px_rgba(91,124,255,0.2)] hover:shadow-[0_4px_25px_rgba(168,85,247,0.4)] hover:scale-[1.02] disabled:opacity-40 disabled:hover:scale-100 disabled:shadow-none"
                >
                  Launch Full Assessment →
                </button>
                <div className="text-[10px] font-medium text-slate-500 tracking-wide text-center sm:text-right">
                  ~8 minutes · 28 questions · Free report
                </div>
              </div>
            </form>

          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
