import React, { useState } from 'react';

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

  function submit() {
    if (!email || !phone) { setError('All fields are required.'); return; }
    if (!isWorkEmail(email)) {
      setError('Please use a corporate email (e.g., name@company.com)');
      return;
    }
    setError('');
    onSubmit({ email, phone });
  }

  return (
    <div id="gate-overlay" className="open" style={{
      position:'fixed', inset:0, zIndex:1000, 
      background:'rgba(255,255,255,0.8)', backdropFilter:'blur(40px)',
      overflowY:'auto', padding:'40px 20px', display:'block'
    }}>
      <div className="gate-panel" style={{
        width:'100%', maxWidth:520, background:'#fff', 
        border:'1px solid var(--border)', borderRadius:24, 
        position:'relative', overflow:'hidden', margin:'0 auto',
        padding: 'clamp(24px, 5vw, 48px)', textAlign: 'center'
      }}>
        {/* Glow effect */}
        <div style={{
          position:'absolute', top:-100, left:-100, width:300, height:300,
          background:'var(--accent)', filter:'blur(120px)', opacity:0.08, pointerEvents:'none'
        }} />

        <div className="gate-logo" style={{marginBottom:32}}>
          <span style={{fontFamily:"'Syne',sans-serif",fontWeight:800,fontSize:22}}>
            <span style={{color:'var(--accent)'}}>instrek</span>
          </span>
        </div>

        <h2 style={{
          fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:'clamp(24px, 5vw, 32px)', 
          lineHeight:1.1, marginBottom:16, letterSpacing:'-0.02em'
        }}>
          Your Results Are Ready
        </h2>
        
        <p style={{
          fontSize:15, color:'var(--muted)', lineHeight:1.6, marginBottom:32
        }}>
          Enter your work details to unlock your customized 100-day AI transformation roadmap and readiness index.
        </p>

        <div className="gate-fields" style={{display:'flex', flexDirection:'column', gap:12, marginBottom:24}}>
          <div style={{textAlign:'left'}}>
            <label style={{fontFamily:"'JetBrains Mono',monospace", fontSize:10, textTransform:'uppercase', color:'var(--muted)', marginLeft:4, marginBottom:6, display:'block'}}>Work Email</label>
            <input
              className="gate-input"
              placeholder="name@company.com"
              type="email"
              style={{
                width:'100%', padding:'16px 20px', borderRadius:12, border:'1px solid var(--border2)',
                fontSize:15, outline:'none', transition:'all 0.2s'
              }}
              value={email}
              onChange={e => setEmail(e.target.value)}
              onFocus={e => e.target.style.borderColor = 'var(--accent)'}
              onBlur={e => e.target.style.borderColor = 'var(--border2)'}
            />
          </div>
          <div style={{textAlign:'left'}}>
            <label style={{fontFamily:"'JetBrains Mono',monospace", fontSize:10, textTransform:'uppercase', color:'var(--muted)', marginLeft:4, marginBottom:6, display:'block'}}>Phone Number</label>
            <input
              className="gate-input"
              placeholder="+91 00000 00000"
              type="tel"
              style={{
                width:'100%', padding:'16px 20px', borderRadius:12, border:'1px solid var(--border2)',
                fontSize:15, outline:'none', transition:'all 0.2s'
              }}
              value={phone}
              onChange={e => setPhone(e.target.value)}
              onFocus={e => e.target.style.borderColor = 'var(--accent)'}
              onBlur={e => e.target.style.borderColor = 'var(--border2)'}
            />
          </div>
        </div>

        {error && (
          <div style={{
            background:'#fff1f2', color:'#e11d48', fontSize:13, fontWeight:600,
            padding:'12px 16px', borderRadius:8, marginBottom:24, border:'1px solid #fda4af'
          }}>
            ⚠️ {error}
          </div>
        )}

        <button className="btn-primary" style={{
          width:'100%', padding:'12px 24px', borderRadius:8, background:'var(--accent)',
          color:'#fff', border:'none', fontFamily:"'Syne',sans-serif", fontWeight:800,
          fontSize:11, letterSpacing:'0.1em', cursor:'pointer', transition:'all 0.2s',
          boxShadow: 'none'
        }} onClick={submit}>
          UNLOCK MY REPORT →
        </button>

        <p style={{fontSize:11, color:'var(--muted)', marginTop:24, lineHeight:1.6}}>
          By unlocking, you agree to receive your analysis and occasional insights from Instrek. We respect your inbox privacy.
        </p>
      </div>
    </div>
  );
}
