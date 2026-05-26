import React, { useState, useEffect, useRef } from 'react';
import './Int.css';
import ReportView from './ReportView';

const questions = [
  {
    q: "How many developers in your India GCC actively use GenAI tools like ChatGPT or Copilot?",
    sub: "This tells us your current IP surface area exposed to third-party LLM APIs.",
    icon: ["🔒","⚡","🌐","🔥"],
    opts: ["None, it's banned","A few (<20%), unofficially","Majority (~50%), no policy","Almost all, tools are standard"],
    scores: [10, 35, 65, 90]
  },
  {
    q: "Do your AI agents in production have their own credentials and audit trails?",
    sub: "Agentic AI acting under human credentials is undetectable when something goes wrong.",
    icon: ["✅","📋","🤖","👻"],
    opts: ["Yes, full identity management","Partial — some agents are tracked","No, they inherit human credentials","We don't have AI agents yet"],
    scores: [10, 40, 85, 20]
  },
  {
    q: "Have you mapped which systems use RSA or ECC encryption that quantum computers could break?",
    sub: "Adversaries are harvesting encrypted data now to decrypt it when quantum capability arrives.",
    icon: ["📊","🔍","❓","❌"],
    opts: ["Yes, crypto inventory complete","Partially mapped","No, not on our roadmap","Not sure what this means"],
    scores: [10, 45, 80, 90]
  },
  {
    q: "If regulators asked today: where does your India GCC's AI data flow?",
    sub: "The DPDP Act now gives Indian regulators the right to ask exactly this question.",
    icon: ["📁","📊","🤷","🚨"],
    opts: ["I have a full data flow map","I know roughly, not formally","I'd need weeks to compile it","I don't know and it worries me"],
    scores: [5, 40, 75, 95]
  }
];

const fears = [
  `"If my India team uses ChatGPT to write code, <strong>where does my IP actually go?</strong>"`,
  `"What if an AI agent makes a <strong>$1M financial error</strong> or creates a backdoor — and I don't find out for weeks?"`,
  `"Hackers are using AI to find vulnerabilities <strong>faster than we can patch them.</strong> How do we defend against that?"`
];

const SecurityRiskEngine = () => {
  const [screen, setScreen] = useState('hero');
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [selectedOpt, setSelectedOpt] = useState(null);
  const [totalRiskScore, setTotalRiskScore] = useState(0);
  const [fearIdx, setFearIdx] = useState(0);
  const [scanItemsStatus, setScanItemsStatus] = useState(['idle', 'idle', 'idle', 'idle']);
  const [form, setForm] = useState({ email: '', role: '', size: '', company: '' });
  const [results, setResults] = useState(null);
  const [reportLead, setReportLead] = useState(null);
  const [loadingReport, setLoadingReport] = useState(false);
  const [errorReport, setErrorReport] = useState(null);
  const [createdLeadId, setCreatedLeadId] = useState(null);

  // Check for leadId query parameter on load
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const leadId = params.get('leadId');
    if (leadId) {
      setLoadingReport(true);
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      fetch(`${apiUrl}/api/shieldgcc/leads/${leadId}`)
        .then(res => {
          if (!res.ok) throw new Error('Lead report not found');
          return res.json();
        })
        .then(data => {
          setReportLead(data);
          setScreen('report');
          setLoadingReport(false);
        })
        .catch(err => {
          console.error(err);
          setErrorReport('Could not retrieve risk report. It may have expired or does not exist.');
          setLoadingReport(false);
        });
    }
  }, []);

  // Fear rotation
  useEffect(() => {
    const interval = setInterval(() => {
      const el = document.getElementById('fear-rotate');
      if (el) {
        el.style.opacity = 0;
        setTimeout(() => {
          setFearIdx(prev => (prev + 1) % fears.length);
          el.style.opacity = 1;
        }, 300);
      }
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const goScreen = (id) => {
    setScreen(id);
    window.scrollTo(0, 0);
  };

  const startQuiz = () => {
    setCurrentStep(0);
    setAnswers([]);
    setTotalRiskScore(0);
    setSelectedOpt(null);
    goScreen('quiz');
  };

  const selectOption = (idx, score) => {
    setSelectedOpt({ idx, score });
  };

  const nextStep = () => {
    if (selectedOpt === null) return;
    const newAnswers = [...answers, selectedOpt];
    setAnswers(newAnswers);
    setTotalRiskScore(prev => prev + selectedOpt.score);
    setSelectedOpt(null);

    if (currentStep < questions.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      goScreen('scan');
      runScan(newAnswers);
    }
  };

  const runScan = (finalAnswers) => {
    const statuses = ['active', 'idle', 'idle', 'idle'];
    setScanItemsStatus(statuses);

    let i = 0;
    const interval = setInterval(() => {
      if (i < 4) {
        setScanItemsStatus(prev => {
          const next = [...prev];
          next[i] = 'done';
          if (i + 1 < 4) next[i + 1] = 'active';
          return next;
        });
        i++;
      } else {
        clearInterval(interval);
        setTimeout(() => calculateResults(finalAnswers), 600);
      }
    }, 700);
  };

  const calculateResults = (finalAnswers) => {
    const total = finalAnswers.reduce((acc, curr) => acc + curr.score, 0);
    const avg = Math.round(total / finalAnswers.length);
    
    const pillarScores = [
      { name: 'AI Sovereignty & Data Leakage', icon: '🔒', score: finalAnswers[0].score },
      { name: 'Agentic Accountability', icon: '🤖', score: finalAnswers[1].score },
      { name: 'Post-Quantum Cyber Defense', icon: '🛡️', score: Math.round((finalAnswers[2].score + finalAnswers[3].score) / 2) },
    ];

    pillarScores.sort((a, b) => b.score - a.score);

    let headline, sub, urgency, color;
    if (avg >= 70) {
      headline = 'Critical Exposure Detected';
      sub = `Your GCC profile shows ${avg > 80 ? 'severe' : 'significant'} exposure across multiple AI security pillars. Based on your answers, IP leakage via unmonitored LLM APIs is your most immediate risk. This is not theoretical — organisations with similar profiles have experienced material breaches.`;
      urgency = '⚠ Based on your profile, your GCC has likely already sent proprietary data to unmonitored external AI systems. The window to contain this is now.';
      color = '#FF4C4C';
    } else if (avg >= 45) {
      headline = 'Moderate Risk — Act Before Audit';
      sub = `Your GCC has partial controls but meaningful gaps. Regulators and auditors are increasingly asking for AI governance documentation. Your current posture would struggle to answer those questions. A structured remediation roadmap would move you from reactive to defensible.`;
      urgency = '⚡ DPDP enforcement is active. Your current AI data flow posture may not withstand regulatory scrutiny.';
      color = '#FFB830';
    } else {
      headline = 'Strong Foundation — Harden & Scale';
      sub = 'Your GCC has better AI governance than most. As you scale AI deployment and headcount, formalising this posture will be critical. Post-quantum readiness and agentic identity management are the emerging gaps for organisations at your maturity level.';
      urgency = '✓ Your proactive posture puts you ahead. Now is the time to formalise and scale your governance architecture before AI deployment outpaces it.';
      color = '#00FFA3';
    }

    setResults({ avg, headline, sub, urgency, color, pillarScores });
    goScreen('result');
  };

  const submitForm = async () => {
    if (!form.email || !form.role) return;
    
    const p1Score = results?.pillarScores?.find(p => p.name.includes('Sovereignty'))?.score || 0;
    const p2Score = results?.pillarScores?.find(p => p.name.includes('Accountability'))?.score || 0;
    const p3Score = results?.pillarScores?.find(p => p.name.includes('Quantum'))?.score || 0;

    // Submit to backend
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    try {
      const response = await fetch(`${apiUrl}/api/shieldgcc/leads`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          riskScore: results?.avg,
          tier: results?.avg >= 70 ? 'Critical Exposure' : results?.avg >= 45 ? 'Moderate Risk' : 'Strong Foundation',
          p1Score,
          p2Score,
          p3Score
        })
      });
      const data = await response.json();
      if (data.leadId) {
        // Save the leadId in local storage or state to construct the dynamic link if needed
        localStorage.setItem('shieldgcc_lead_id', data.leadId);
        setCreatedLeadId(data.leadId);
      }
    } catch (err) {
      console.error('Failed to submit lead:', err);
    }

    goScreen('confirm');
  };

  const viewReportSkipForm = async () => {
    const p1Score = results?.pillarScores?.find(p => p.name.includes('Sovereignty'))?.score || 0;
    const p2Score = results?.pillarScores?.find(p => p.name.includes('Accountability'))?.score || 0;
    const p3Score = results?.pillarScores?.find(p => p.name.includes('Quantum'))?.score || 0;

    const anonymousForm = {
      firstName: 'GCC',
      lastName: 'Leader',
      email: 'anonymous@shieldgcc-scan.com',
      role: 'GCC Leader',
      size: '500-2000',
      company: 'ShieldGCC Assessment'
    };

    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    try {
      const response = await fetch(`${apiUrl}/api/shieldgcc/leads`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...anonymousForm,
          riskScore: results?.avg,
          tier: results?.avg >= 70 ? 'Critical Exposure' : results?.avg >= 45 ? 'Moderate Risk' : 'Strong Foundation',
          p1Score,
          p2Score,
          p3Score
        })
      });
      const data = await response.json();
      if (data.leadId) {
        window.location.search = `?leadId=${data.leadId}`;
      }
    } catch (err) {
      console.error('Failed to submit anonymous lead:', err);
      // Fallback: render local report state immediately
      setReportLead({
        ...anonymousForm,
        riskScore: results?.avg,
        tier: results?.avg >= 70 ? 'Critical Exposure' : results?.avg >= 45 ? 'Moderate Risk' : 'Strong Foundation',
        p1Score,
        p2Score,
        p3Score,
        createdAt: new Date().toISOString()
      });
      setScreen('report');
    }
  };

  const viewDemoReport = () => {
    setReportLead({
      firstName: 'Michael',
      lastName: 'Chen',
      email: 'michael.chen@globaltech.com',
      role: 'CISO',
      company: 'GlobalTech GCC India',
      size: '2000+',
      riskScore: 78,
      tier: 'Critical Exposure',
      p1Score: 90,
      p2Score: 85,
      p3Score: 62,
      createdAt: new Date().toISOString()
    });
    setScreen('report');
  };

  if (loadingReport) {
    return (
      <div className="int-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', flexDirection: 'column' }}>
        <div className="scan-ring" style={{ animation: 'spin 2s linear infinite' }}>
          <div className="scan-ring-inner"></div>
        </div>
        <h2 style={{ fontFamily: 'var(--serif)', fontSize: '24px', marginTop: '20px', color: '#fff' }}>Loading your GCC Security Report...</h2>
        <p style={{ color: 'var(--muted)', marginTop: '8px' }}>Fetching board-ready risk assessment profile...</p>
      </div>
    );
  }

  if (errorReport) {
    return (
      <div className="int-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', flexDirection: 'column', padding: '40px', textAlign: 'center' }}>
        <div style={{ fontSize: '48px', marginBottom: '20px' }}>⚠️</div>
        <h2 style={{ fontFamily: 'var(--serif)', fontSize: '28px', color: '#fff', marginBottom: '16px' }}>Report Unavailable</h2>
        <p style={{ color: 'var(--muted)', maxWidth: '480px', marginBottom: '32px', lineHeight: '1.6' }}>{errorReport}</p>
        <button className="cta-primary" onClick={() => { window.location.href = window.location.origin; }}>Go to Home Screen</button>
      </div>
    );
  }

  if (screen === 'report' && reportLead) {
    return <ReportView lead={reportLead} />;
  }

  return (
    <div className="int-container">
      <div className="glow-orb g1"></div>
      <div className="glow-orb g2"></div>

      <div className="wrap">
        {/* HERO SCREEN */}
        {screen === 'hero' && (
          <div className="screen hero-screen active">
            <div>
              <div className="logo-row">
                <div className="logo-mark">
                  <img src="/logo.png" alt="ShieldGCC" className="logo-img" />
                </div>
                <div className="logo-name">SHIELDGCC</div>
              </div>

              <div className="badge-row">
                <div className="badge">India GCC Security</div>
                <div className="badge red">Live Risk Engine</div>
              </div>

              <h1 className="hero-headline">Your India GCC has<br/><em>3 AI vulnerabilities</em><br/>you haven't mapped.</h1>
              <p className="hero-sub">Every Fortune 500 GCC running AI in India carries silent exposure. Find out where yours is in 90 seconds.</p>

              <div className="fear-card">
                <div className="fear-card-label">What your peers are saying</div>
                <div 
                  id="fear-rotate"
                  className="fear-card-text" 
                  dangerouslySetInnerHTML={{ __html: fears[fearIdx] }}
                />
              </div>

              <div className="risk-ticker">
                <div className="ticker-item"><div className="ticker-dot"></div>IP Leakage via LLM APIs</div>
                <div className="ticker-item"><div className="ticker-dot"></div>Shadow AI Agents</div>
                <div className="ticker-item"><div className="ticker-dot"></div>Post-Quantum Exposure</div>
                <div className="ticker-item"><div className="ticker-dot"></div>DPDP Non-Compliance</div>
                <div className="ticker-item"><div className="ticker-dot"></div>Agentic Backdoors</div>
              </div>
            </div>

            <div>
              <button className="cta-primary" onClick={startQuiz}>Run My GCC Risk Scan →</button>
              <button className="cta-ghost" onClick={() => goScreen('form')}>Talk to a GCC Security Advisor</button>
              <div className="trust-row">
                <div className="trust-item">
                  <div className="trust-check">
                    <svg viewBox="0 0 8 8"><polyline points="1,4 3,6 7,2" stroke="#00FFA3" strokeWidth="1.5" fill="none"/></svg>
                  </div>
                  90 seconds
                </div>
                <div className="trust-item">
                  <div className="trust-check">
                    <svg viewBox="0 0 8 8"><polyline points="1,4 3,6 7,2" stroke="#00FFA3" strokeWidth="1.5" fill="none"/></svg>
                  </div>
                  No signup required
                </div>
                <div className="trust-item">
                  <div className="trust-check">
                    <svg viewBox="0 0 8 8"><polyline points="1,4 3,6 7,2" stroke="#00FFA3" strokeWidth="1.5" fill="none"/></svg>
                  </div>
                  Instant results
                </div>
              </div>
            </div>
          </div>
        )}

        {/* QUIZ SCREEN */}
        {screen === 'quiz' && (
          <div className="screen quiz-screen active">
            <div className="progress-bar-bg">
              <div 
                className="progress-bar-fill" 
                style={{ width: `${(currentStep / questions.length) * 100}%` }}
              ></div>
            </div>
            <div className="step-label">Question {currentStep + 1} of {questions.length}</div>
            <h2 className="quiz-q">{questions[currentStep].q}</h2>
            <p className="quiz-sub">{questions[currentStep].sub}</p>
            
            <div className="options-list">
              {questions[currentStep].opts.map((opt, i) => (
                <button 
                  key={i}
                  className={`option-btn ${selectedOpt?.idx === i ? 'selected' : ''}`}
                  onClick={() => selectOption(i, questions[currentStep].scores[i])}
                >
                  <div className="opt-icon">{questions[currentStep].icon[i]}</div>
                  <div className="opt-text">{opt}</div>
                  <div className="opt-check"></div>
                </button>
              ))}
            </div>
            <button 
              className={`next-btn ${selectedOpt !== null ? 'ready' : ''}`} 
              onClick={nextStep}
            >
              Continue →
            </button>
          </div>
        )}

        {/* SCAN SCREEN */}
        {screen === 'scan' && (
          <div className="screen scan-screen active">
            <div className="scan-ring">
              <div className="scan-ring-inner"></div>
              <div className="scan-pulse"></div>
            </div>
            <h2 className="scan-title">Scanning your GCC profile...</h2>
            <p className="scan-sub">Mapping risk vectors against 3 AI security pillars</p>
            <div className="scan-items">
              {[
                "AI sovereignty exposure mapped",
                "Agentic accountability gaps",
                "Post-quantum cryptographic surface",
                "Compliance posture (DPDP + GDPR)"
              ].map((text, i) => (
                <div key={i} className={`scan-item ${scanItemsStatus[i]}`}>
                  <div className="s-dot"></div>
                  {text}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* RESULT SCREEN */}
        {screen === 'result' && results && (
          <div className="screen result-screen active">
            <div className="step-label">Your GCC Risk Profile</div>
            <h2 className="result-headline">{results.headline}</h2>
            <p className="result-sub">{results.sub}</p>

            <div className="risk-gauge-wrap">
              <svg viewBox="0 0 200 120" width="200" height="120">
                <defs>
                  <linearGradient id="gaugeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#00FFA3"/>
                    <stop offset="50%" stopColor="#FFB830"/>
                    <stop offset="100%" stopColor="#FF4C4C"/>
                  </linearGradient>
                </defs>
                <path d="M20,100 A80,80 0 0,1 180,100" fill="none" stroke="#111D24" strokeWidth="14" strokeLinecap="round"/>
                <path d="M20,100 A80,80 0 0,1 180,100" fill="none" stroke="url(#gaugeGrad)" strokeWidth="14" strokeLinecap="round" strokeDasharray="251" strokeDashoffset="0" opacity="0.2"/>
                <path 
                  d="M20,100 A80,80 0 0,1 180,100" 
                  fill="none" 
                  stroke="url(#gaugeGrad)" 
                  strokeWidth="14" 
                  strokeLinecap="round" 
                  strokeDasharray="251" 
                  style={{ strokeDashoffset: 251 - (results.avg / 100) * 251, transition: 'stroke-dashoffset 1s ease-out' }}
                />
              </svg>
              <div className="risk-score-num" style={{ color: results.color }}>{results.avg}</div>
              <div className="risk-score-label">Risk Score</div>
            </div>

            <div className="pillar-results">
              {results.pillarScores.map((p, i) => {
                const cls = p.score >= 70 ? 'critical' : p.score >= 45 ? 'high' : 'medium';
                const label = p.score >= 70 ? 'Critical Risk' : p.score >= 45 ? 'Elevated Risk' : 'Managed';
                return (
                  <div key={i} className={`pillar-result-row ${cls}`}>
                    <div className="pr-icon">{p.icon}</div>
                    <div className="pr-info">
                      <div className="pr-name">{p.name}</div>
                      <div className="pr-level">{label}</div>
                    </div>
                    <div>
                      <div className="pr-bar-bg">
                        <div className="pr-bar" style={{ width: `${p.score}%` }}></div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <button className="result-cta" onClick={() => goScreen('form')}>Get My Full Risk Report →</button>
            <button className="result-ghost" onClick={() => goScreen('form')}>Book a 20-min GCC Security Briefing</button>
            <div className="result-urgency">{results.urgency}</div>
          </div>
        )}

        {/* FORM SCREEN */}
        {screen === 'form' && (
          <div className="screen form-screen active">
            <div className="step-label">Get Your Full Report</div>
            <h2 className="form-headline">We'll send your<br/>GCC security blueprint.</h2>
            <p className="form-sub">Your personalized risk report + remediation architecture, built for your GCC profile. Delivered in 24 hours.</p>

            <div className="form-group">
              <label>Work Email</label>
              <input 
                type="email" 
                placeholder="you@company.com" 
                value={form.email}
                onChange={e => setForm({...form, email: e.target.value})}
                style={{ borderColor: !form.email && 'rgba(255,76,76,0.1)' }}
              />
            </div>
            <div className="form-group">
              <label>Your Role</label>
              <select 
                value={form.role}
                onChange={e => setForm({...form, role: e.target.value})}
                style={{ borderColor: !form.role && 'rgba(255,76,76,0.1)' }}
              >
                <option value="">Select your role</option>
                <option>CISO</option>
                <option>CTO / VP Engineering</option>
                <option>CDO / Chief Data Officer</option>
                <option>COO / Head of GCC</option>
                <option>VP / Director IT</option>
                <option>Other Executive</option>
              </select>
            </div>
            <div className="form-group">
              <label>GCC Headcount</label>
              <select 
                value={form.size}
                onChange={e => setForm({...form, size: e.target.value})}
              >
                <option value="">Select size</option>
                <option>Under 100</option>
                <option>100-500</option>
                <option>500-2000</option>
                <option>2000+</option>
              </select>
            </div>
            <div className="form-group">
              <label>Company</label>
              <input 
                type="text" 
                placeholder="Company name" 
                value={form.company}
                onChange={e => setForm({...form, company: e.target.value})}
              />
            </div>

            <button className="form-submit" onClick={submitForm}>Send My Risk Report →</button>
            <p className="privacy-note">Your data is used only to build your report. No spam. No third-party sharing. Governed by DPDP + GDPR.</p>
          </div>
        )}

        {/* CONFIRM SCREEN */}
        {screen === 'confirm' && (
          <div className="screen confirm-screen active">
            <div>
              <div className="confirm-icon">
                <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                  <polyline points="6,16 13,23 26,9" stroke="#00FFA3" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <h2 className="confirm-headline">Report on its way.<br/>Expect it in 24 hours.</h2>
              <p className="confirm-sub">Our GCC security architects will review your profile and send a tailored remediation blueprint — covering all three risk pillars your scan flagged.</p>

              <div className="confirm-details">
                <div className="confirm-detail-row"><span className="cd-label">Email</span><span className="cd-val">{form.email}</span></div>
                <div className="confirm-detail-row"><span className="cd-label">Role</span><span className="cd-val">{form.role || 'Executive'}</span></div>
                <div className="confirm-detail-row"><span className="cd-label">GCC Size</span><span className="cd-val">{form.size || 'Not specified'}</span></div>
                <div className="confirm-detail-row">
                  <span className="cd-label">Risk Profile</span>
                  <span className="cd-val" style={{ color: results?.color }}>
                    {results?.avg >= 70 ? 'Critical Exposure' : results?.avg >= 45 ? 'Moderate Risk' : 'Strong Foundation'}
                  </span>
                </div>
                <div className="confirm-detail-row"><span className="cd-label">Delivery</span><span className="cd-val">Within 24 hours</span></div>
              </div>

              {createdLeadId && (
                <button 
                  className="cta-primary" 
                  onClick={() => {
                    window.location.search = `?leadId=${createdLeadId}`;
                  }}
                  style={{ marginBottom: '16px', width: '100%' }}
                >
                  View My Live Risk Report →
                </button>
              )}

              <button className="confirm-back" onClick={() => goScreen('hero')}>Run another scan</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SecurityRiskEngine;
