import React, { useState } from 'react';
import { AlertCircle } from 'lucide-react';

const FREE_DOMAINS = ['gmail','yahoo','hotmail','outlook','rediffmail','ymail','aol','icloud','protonmail','mail','inbox','zoho','gmx','live','msn','me','mac','googlemail'];

function isWorkEmail(email) {
  const domain = email.split('@')[1];
  if (!domain) return false;
  const base = domain.split('.')[0].toLowerCase();
  return !FREE_DOMAINS.includes(base);
}

export default function GateForm({ companyInfo, onSubmit }) {
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');

  function submit(e) {
    e.preventDefault();
    if (!email || !phone) { setError('All fields are required.'); return; }
    const emailLower = email.trim().toLowerCase();
    if (!isWorkEmail(emailLower)) {
      setError('Please use a corporate email (e.g., name@company.com)');
      return;
    }
    setError('');
    onSubmit({ email: emailLower, phone });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#070B14]/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-md rounded-premium border border-white/10 bg-[#0d1425]/90 backdrop-blur-2xl p-8 shadow-[0_25px_60px_rgba(0,0,0,0.8)] overflow-hidden text-center">
        {/* Glow effect */}
        <div className="absolute -top-24 -left-24 w-72 h-72 rounded-full bg-accentBlue/20 blur-[80px] pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-72 h-72 rounded-full bg-accentPurple/15 blur-[80px] pointer-events-none" />

        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-6">
          <div className="w-5 h-5 rounded bg-gradient-to-tr from-accentBlue to-accentPurple" />
          <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Instrek AI</span>
        </div>

        {/* Title */}
        <h2 className="font-sans font-extrabold text-2xl sm:text-3xl text-white leading-tight mb-3">
          Your Results Are Ready
        </h2>
        
        {/* Subtitle */}
        <p className="text-xs sm:text-sm text-slate-400 leading-relaxed mb-8">
          Enter your work details to unlock your customized 100-day AI transformation roadmap and readiness index.
        </p>

        {/* Form */}
        <form onSubmit={submit} className="space-y-6 text-left">
          {/* Work Email */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 ml-1">
              Work Email
            </label>
            <input
              required
              className="w-full text-sm rounded bg-white/5 border border-white/10 text-white placeholder-slate-500 px-4 py-3 outline-none focus:border-accentBlue focus:bg-white/10 focus:shadow-[0_0_15px_rgba(91,124,255,0.2)] transition-all duration-200"
              placeholder="name@company.com"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
          </div>

          {/* Phone Number */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 ml-1">
              Phone Number
            </label>
            <input
              required
              className="w-full text-sm rounded bg-white/5 border border-white/10 text-white placeholder-slate-500 px-4 py-3 outline-none focus:border-accentBlue focus:bg-white/10 focus:shadow-[0_0_15px_rgba(91,124,255,0.2)] transition-all duration-200"
              placeholder="+91 00000 00000"
              type="tel"
              value={phone}
              onChange={e => setPhone(e.target.value)}
            />
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-rose-500/10 text-rose-400 border border-rose-500/20 text-xs px-4 py-3 rounded-lg flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Submit */}
          <button 
            type="submit"
            className="w-full py-3.5 rounded-full bg-gradient-to-r from-accentBlue to-accentPurple text-xs font-bold text-white tracking-wider uppercase transition-all duration-300 shadow-[0_4px_15px_rgba(91,124,255,0.2)] hover:shadow-[0_4px_25px_rgba(168,85,247,0.4)] hover:scale-[1.02]"
          >
            Unlock My Report →
          </button>
        </form>

        <p className="text-[10px] text-slate-500 mt-6 leading-relaxed">
          By unlocking, you agree to receive your analysis and occasional insights from Instrek. We respect your inbox privacy.
        </p>
      </div>
    </div>
  );
}
