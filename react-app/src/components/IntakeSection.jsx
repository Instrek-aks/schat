import React, { useState } from 'react';

const INDUSTRIES = ['Financial Services','Healthcare','Retail & E-commerce','Manufacturing','Technology','Professional Services','Other'];
const REVENUES = ['Under ₹100Cr','₹100Cr - ₹500Cr','₹500Cr - ₹2,000Cr','Over ₹2,000Cr'];
const SIZES = ['1-50','51-200','201-1,000','1,000+'];
const ROLES = ['Founder / CEO','CTO / CDO / CAIO','Head of Product / Ops','Legal / Compliance Lead'];
const LEVELS = ['None (Exploring)','Early (Pilot phase)','Active (Production usage)','Advanced (AI-first ops)'];

export default function IntakeSection({ onLaunch }) {
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

  return (
    <section id="intake-section">
      <div className="section-eyebrow reveal">STEP 01 — COMPANY PROFILE</div>
      <h2 className="reveal reveal-delay-1">Tell Us About<br />Your Organisation</h2>
      
      <div className="intake-grid reveal reveal-delay-2">
        <div className="intake-field">
          <label className="intake-label">COMPANY NAME</label>
          <input 
            className="intake-input" 
            placeholder="Acme Technologies Pvt. Ltd." 
            value={form.company} 
            onChange={e=>update('company',e.target.value)} 
          />
        </div>
        <div className="intake-field">
          <label className="intake-label">INDUSTRY</label>
          <select className="intake-select" value={form.industry} onChange={e=>update('industry',e.target.value)}>
            <option value="">Select industry</option>
            {INDUSTRIES.map(i => <option key={i}>{i}</option>)}
          </select>
        </div>
        <div className="intake-field">
          <label className="intake-label">ANNUAL REVENUE</label>
          <select className="intake-select" value={form.revenue} onChange={e=>update('revenue',e.target.value)}>
            <option value="">Select range</option>
            {REVENUES.map(r => <option key={r}>{r}</option>)}
          </select>
        </div>
        <div className="intake-field">
          <label className="intake-label">EMPLOYEE COUNT</label>
          <select className="intake-select" value={form.size} onChange={e=>update('size',e.target.value)}>
            <option value="">Select size</option>
            {SIZES.map(s => <option key={s}>{s}</option>)}
          </select>
        </div>
        <div className="intake-field">
          <label className="intake-label">RESPONDENT ROLE</label>
          <select className="intake-select" value={form.role} onChange={e=>update('role',e.target.value)}>
            <option value="">Select role</option>
            {ROLES.map(r => <option key={r}>{r}</option>)}
          </select>
        </div>
        <div className="intake-field">
          <label className="intake-label">CURRENT AI INVESTMENT LEVEL</label>
          <select className="intake-select" value={form.level} onChange={e=>update('level',e.target.value)}>
            <option value="">Select level</option>
            {LEVELS.map(l => <option key={l}>{l}</option>)}
          </select>
        </div>
      </div>

      <div className="intake-launch reveal reveal-delay-3">
        <button 
          className="btn-primary" 
          onClick={() => canLaunch && onLaunch(form)} 
          disabled={!canLaunch}
          style={{
            opacity: canLaunch ? 1 : 0.5,
            padding: '12px 28px',
            fontSize: '11px',
            letterSpacing: '0.1em'
          }}
        >
          LAUNCH FULL ASSESSMENT →
        </button>
        <div className="intake-note">~8 minutes · 22 questions · Free report</div>
      </div>
    </section>
  );
}
