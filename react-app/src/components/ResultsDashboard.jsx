import React, { useEffect, useRef, useState } from 'react';
import { Radar } from 'react-chartjs-2';
import { Chart as ChartJS, RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend } from 'chart.js';
import { CATEGORIES, QUESTIONS, INDUSTRY_BENCHMARKS, WEIGHTS, MATURITY_TIERS, REVENUE_MULTIPLIERS, ACTION_LIBRARY } from '../config/data.js';
import { useScoring } from '../hooks/useScoring.js';

ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend);

function getTier(pct) {
  return MATURITY_TIERS.find(t => pct >= t.min && pct <= t.max) || MATURITY_TIERS[0];
}

function getScoreColor(pct) {
  return getTier(pct).color;
}

function ScoreGauge({ pct, color }) {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const W = canvas.offsetWidth || 240, H = canvas.offsetHeight || 152;
    canvas.width = W; canvas.height = H;
    const cx = W/2, cy = H*0.75, r = Math.min(W,H)*0.68;
    ctx.clearRect(0,0,W,H);
    
    // Background arc
    ctx.beginPath(); ctx.arc(cx,cy,r,Math.PI,2*Math.PI);
    ctx.strokeStyle='rgba(0,0,0,0.05)'; ctx.lineWidth=14; ctx.stroke();
    
    // Segmented background
    [[0,0.33,'#f43f5e'],[0.33,0.62,'#f59e0b'],[0.62,1,'#2563eb']].forEach(([f,t,c])=>{
      ctx.beginPath(); ctx.arc(cx,cy,r,Math.PI+f*Math.PI,Math.PI+t*Math.PI);
      ctx.strokeStyle=c+'22'; ctx.lineWidth=14; ctx.lineCap='butt'; ctx.stroke();
    });
    
    // Progress arc
    const ea = Math.PI+(pct/100)*Math.PI;
    ctx.beginPath(); ctx.arc(cx,cy,r,Math.PI,ea);
    ctx.strokeStyle=color; ctx.lineWidth=14; ctx.lineCap='round';
    ctx.stroke();
    
    // Needle/Dot
    const nx=cx+Math.cos(ea)*r, ny=cy+Math.sin(ea)*r;
    ctx.beginPath(); ctx.arc(nx,ny,8,0,2*Math.PI);
    ctx.fillStyle='#ffffff'; ctx.fill();
    ctx.strokeStyle=color; ctx.lineWidth=3; ctx.stroke();
  }, [pct, color]);
  return <canvas ref={canvasRef} style={{width:'100%',height:'100%'}} />;
}

export default function ResultsDashboard({ answers, companyInfo, onRestart, previewOnly }) {
  const [barsAnimated, setBarsAnimated] = useState(false);
  const { calculateCategoryScores, calculateOverallScore } = useScoring();
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    setTimeout(() => setBarsAnimated(true), 300);
  }, []);

  const catScoresMap = calculateCategoryScores(answers);
  const catScores = CATEGORIES.map(c => catScoresMap[c.id]);
  const overall = calculateOverallScore(answers);
  const tier = getTier(overall);
  const scoreColor = getScoreColor(overall);
  const bench = INDUSTRY_BENCHMARKS[companyInfo.industry] || INDUSTRY_BENCHMARKS['Other'];

  const radarData = {
    labels: CATEGORIES.map(c => c.shortName),
    disabled: true,
    datasets: [
      {
        label: companyInfo.company || 'Your Score',
        data: catScores,
        borderColor: '#5B7CFF',
        backgroundColor: 'rgba(91, 124, 255, 0.15)',
        borderWidth: 3,
        pointBackgroundColor: '#A855F7',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 6,
      },
      {
        label: 'Industry Benchmark',
        data: CATEGORIES.map(c => bench[c.id]),
        borderColor: 'rgba(255, 255, 255, 0.25)',
        backgroundColor: 'rgba(255, 255, 255, 0.03)',
        borderWidth: 1.5,
        borderDash: [5,5],
        pointRadius: 0,
      }
    ]
  };

  const radarOptions = {
    responsive: true, maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: { 
        backgroundColor: '#0d1425',
        borderColor: 'rgba(255,255,255,0.08)',
        borderWidth: 1,
        padding: 12,
        titleFont: { size: 13, family: 'Inter', weight: 'bold' },
        bodyFont: { size: 12, family: 'Inter' },
        callbacks: { label: ctx => `${ctx.dataset.label}: ${ctx.raw}%` } 
      }
    },
    scales: {
      r: {
        min: 0, max: 100,
        ticks: { display: false },
        grid: { color: 'rgba(255, 255, 255, 0.08)' },
        angleLines: { color: 'rgba(255, 255, 255, 0.08)' },
        pointLabels: { color: '#94a3b8', font: { family: "Inter", size: 10, weight: 600 } }
      }
    }
  };

  const revM = REVENUE_MULTIPLIERS[companyInfo.revenue] || 200;
  const gap = (100 - overall) / 100;
  const penaltyEx = Math.round(revM * gap * 0.45);
  const oppCost = Math.round(revM * 0.22 * gap);
  const ineffCost = Math.round(revM * 0.15 * gap);

  const riskCards = [
    {type:'Regulatory',title:'Compliance & Governance Exposure',body:'Non-compliant AI under DPDP and sector regulations. Shadow AI and absent audit trails create enforcement risk.',val:'₹'+penaltyEx+' Cr',bc:'#e11d48',bd:'rgba(225,29,72,0.2)'},
    {type:'Competitive',title:'AI Capability Gap vs Peers',body:'AI-native competitors are building structural leads in efficiency and intelligence that compound every quarter.',val:'18-24 month lag',bc:'#d97706',bd:'rgba(217,119,6,0.2)'},
    {type:'Revenue',title:'Unrealised AI Revenue Upside',body:'Personalisation and AI-native products are generating measurable revenue uplift for AI-mature peers.',val:'₹'+oppCost+' Cr/yr',bc:'#7c3aed',bd:'rgba(124,58,237,0.2)'},
  ];

  const sortedCats = [...CATEGORIES].sort((a, b) => catScoresMap[a.id] - catScoresMap[b.id]);
  const weakest = sortedCats[0];
  const secondWeakest = sortedCats[1];
  
  const phases = [
    {
      label:'Phase 1 - Foundation',
      title:'Eliminate Critical Gaps',
      tl:'Days 1-30',
      ph:'#e11d48',
      items:[
        ACTION_LIBRARY[weakest.id].urgent,
        ACTION_LIBRARY[secondWeakest.id].urgent,
        "Audit current AI tool usage and data flows",
        "Run executive AI literacy workshop"
      ],
      impact:`Remediate ${weakest.shortName} critical gaps.`,
      ib:'rgba(225,29,72,0.08)',
      ic:'#e11d48'
    },
    {
      label:'Phase 2 - Acceleration',
      title:'Deploy High-Impact AI',
      tl:'Days 31-70',
      ph:'#d97706',
      items:[
        ACTION_LIBRARY[weakest.id].accelerate,
        "Deploy MLOps pipeline and model registry",
        "Launch internal LLM assistant pilot",
        "Implement real-time model monitoring"
      ],
      impact:'First measurable AI ROI. Infrastructure to scale.',
      ib:'rgba(217,119,6,0.08)',
      ic:'#d97706'
    },
    {
      label:'Phase 3 - Scale',
      title:'Achieve AI Sovereignty',
      tl:'Days 71-100',
      ph:'#059669',
      items:[
        "Scale top AI use cases to full production",
        "Launch organisation-wide AI fluency",
        "Publish AI ethics framework externally",
        "Initiate AI Centre of Excellence"
      ],
      impact:'Sustained competitive advantage.',
      ib:'rgba(5,150,105,0.08)',
      ic:'#059669'
    },
  ];

  const weakNames = CATEGORIES.filter((_,i) => catScores[i] < 60).map(c => c.name).slice(0,2).join(' and ') || 'key dimensions';

  return (
    <div id="results-overlay" className="open">
      <div className="results-nav">
        <span className="results-nav-logo">
          <img src="/logo.png" alt="Instrek" className="logo-img" />
          <span className="logo-sep">-</span> AI Readiness Report
        </span>
        <div style={{display:'flex',gap:12,alignItems:'center'}}>
          <span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:11,color:'var(--muted)'}}>
            {companyInfo.company}
          </span>
          <button className="btn-restart" onClick={onRestart}>↺ RETAKE</button>
        </div>
      </div>

      <div className="results-body">

        {/* Hero Section / Score gauge card — always displayed at the top */}
        <div className="score-hero">
          <div className="score-gauge-wrap">
            <ScoreGauge pct={overall} color={scoreColor} />
            <div className="score-overlay">
              <div className="score-big" style={{color: scoreColor}}>{overall}%</div>
              <div className="score-sub">AI READINESS</div>
            </div>
          </div>
          <div className="score-meta">
            <div className="score-tier-badge" style={{background: tier.color+'15', color: tier.color, border:`1px solid ${tier.color}33`}}>
              <span style={{width:8,height:8,borderRadius:'50%',background:tier.color}} />
              {tier.name}
            </div>
            <div className="score-company">{companyInfo.company || 'Your Organisation'}</div>
            <div className="score-desc">{tier.desc}</div>
            <div className="score-quick-stats">
              {[
                {num: overall+'%', lab:'Overall Index'},
                {num: catScores.filter(s=>s>=70).length+'/'+CATEGORIES.length, lab:'Strong Pillars'},
                {num: catScores.filter(s=>s<50).length, lab:'Critical Gaps'},
                {num: CATEGORIES.reduce((a,c,i)=>a+(catScores[i]-bench[c.id]),0) > 0 ? 'Above' : 'Below', lab:'Industry Avg'},
              ].map((s,i) => (
                <div key={i}>
                  <div className="sqs-num" style={{color:scoreColor}}>{s.num}</div>
                  <div className="sqs-lab">{s.lab}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {previewOnly ? (
          /* PREVIEW MODE: Confirmation message instructing the user to check their email */
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '48px 32px',
            textAlign: 'center',
            background: 'var(--bg2)',
            border: '1px solid var(--border)',
            borderRadius: '24px',
            marginTop: '24px',
            boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
          }}>
            {/* Email Icon */}
            <div style={{
              width: 64,
              height: 64,
              borderRadius: '50%',
              background: 'rgba(91,124,255,0.12)',
              border: '1.5px solid rgba(91,124,255,0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 28,
              marginBottom: 20,
            }}>✉️</div>

            {/* Main Message */}
            <h3 style={{
              fontFamily: "'Syne',sans-serif",
              fontWeight: 800,
              fontSize: 'clamp(20px, 4vw, 26px)',
              color: '#ffffff',
              lineHeight: 1.3,
              marginBottom: 12,
            }}>
              Please check your email to see the full report.
            </h3>

            {/* Sub-description */}
            <p style={{
              fontSize: 14,
              color: 'var(--muted)',
              lineHeight: 1.7,
              maxWidth: 480,
              marginBottom: 32,
            }}>
              Your customized 100-day AI transformation roadmap and capability radar have been sent to{' '}
              <strong style={{color: '#5B7CFF'}}>{companyInfo.email}</strong>.
            </p>

            {/* CTAs */}
            <div style={{display:'flex', flexDirection:'column', gap:12, width:'100%', maxWidth:320}}>
              <button
                className="btn-cta"
                style={{width:'100%', textAlign:'center'}}
                onClick={() => window.open('https://instrek.com','_blank')}
              >
                BOOK A STRATEGY CALL →
              </button>
              <button
                className="btn-restart"
                style={{width:'100%', padding:'12px 0', borderRadius:8, fontSize:12}}
                onClick={onRestart}
              >
                ↺ START NEW ASSESSMENT
              </button>
            </div>
          </div>
        ) : (
          <div className="results-body-inner">
        
            {/* 01: Strategy Roadmap */}
            <div className="r-section">
              <div className="r-section-header">
                <span className="r-section-num">01</span>
                <span className="r-section-title">100-Day AI Acceleration Roadmap</span>
              </div>
              <div className="roadmap-phases">
                {phases.map((p,i) => (
                  <div className="phase-card" key={i} style={{'--ph-color':p.ph}}>
                    <div className="phase-label">{p.label}</div>
                    <div className="phase-title">{p.title}</div>
                    <div className="phase-timeline" style={{color:p.ph}}>{p.tl}</div>
                    <div className="phase-items">
                      {p.items.map((item,j) => (
                        <div className="phase-item" key={j}>{item}</div>
                      ))}
                    </div>
                    <div className="phase-impact" style={{background:p.ib,color:p.ic}}>⟶ {p.impact}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* 02: Dimension Breakdown */}
            <div className="r-section">
              <div className="r-section-header">
                <span className="r-section-num">02</span>
                <span className="r-section-title">Dimension Performance & Benchmarking</span>
              </div>
              <div className="results-split">
                <div className="cat-breakdown-grid">
                  {CATEGORIES.map((cat, i) => {
                    const pct = catScores[i];
                    const t = getTier(pct);
                    return (
                      <div className="cbd-card" key={cat.id} style={{'--cbd-color': cat.color}}>
                        <div className="cbd-top">
                          <div className="cbd-name">{cat.icon} {cat.name}</div>
                          <div className="cbd-pct" style={{color: cat.color}}>{pct}%</div>
                        </div>
                        <div className="cbd-bar-wrap">
                          <div className="cbd-bar" style={{width: barsAnimated ? pct+'%' : '0%', background: cat.color}} />
                        </div>
                        <div className="cbd-tier" style={{background: t.color+'12', color: t.color, border:`1px solid ${t.color}22`}}>{t.name}</div>
                        <div className="cbd-finding">{t.desc.slice(0, 100)}...</div>
                      </div>
                    );
                  })}
                </div>
                <div className="radar-card-wrap">
                  <div style={{fontFamily:"'Syne',sans-serif",fontWeight:800,fontSize:18,marginBottom:24}}>AI Capability Radar</div>
                  <div style={{height:300,position:'relative'}}>
                    <Radar data={radarData} options={radarOptions} />
                  </div>
                  <div style={{marginTop:24,display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
                    {CATEGORIES.map((cat, i) => (
                      <div key={i} style={{display:'flex',alignItems:'center',gap:8,fontSize:11}}>
                        <div style={{width:6,height:6,borderRadius:'50%',background:cat.color}} />
                        <span style={{color:'var(--muted)'}}>{cat.shortName}</span>
                        <span style={{marginLeft:'auto',fontWeight:700}}>{catScores[i]}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* 03: Risks & Exposure */}
            <div className="r-section">
              <div className="r-section-header">
                <span className="r-section-num">03</span>
                <span className="r-section-title">Risk Exposure Analysis</span>
              </div>
              <div className="risk-grid">
                {riskCards.map((r,i) => (
                  <div className="risk-card" key={i} style={{border:`2px solid ${r.bc}`, background:r.bc+'08'}}>
                    <div className="risk-card-type" style={{color:r.bc}}>{r.type.toUpperCase()}</div>
                    <div className="risk-card-title">{r.title}</div>
                    <div className="risk-card-body">{r.body}</div>
                    <div className="risk-card-value" style={{color:r.bc}}>{r.val}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Final Sprint CTA */}
            <div className="sprint-cta">
              <div>
                <div className="sprint-cta-logo">
                  <img src="/logo.png" alt="Instrek" className="logo-img-inv" />
                </div>
                <div className="sprint-cta-title">
                  {overall}% - YOUR PATH TO AI LEADERSHIP
                </div>
                <div className="sprint-cta-body">
                  Instrek has identified critical gaps across {weakNames}. Our 30-Day AI Acceleration Sprint delivers a prioritised roadmap, data architecture review, and governance framework - with a guaranteed path to your next maturity tier. Let's talk this week.
                </div>
              </div>
              <button className="btn-cta" onClick={() => window.open('https://instrek.com','_blank')}>
                BOOK A STRATEGY CALL →
              </button>
            </div>

            <div className="results-footer">
              <div>Copyright 2026 Instrek Technologies</div>
              <button className="btn-restart" onClick={onRestart}>↺ START NEW ASSESSMENT</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
