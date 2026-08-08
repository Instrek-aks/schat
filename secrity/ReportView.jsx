import React, { useEffect, useState } from 'react';

// Findings text by score band (same as report.md)
const p1Findings = {
  critical: 'Your assessment indicates the majority of your India GCC developers are actively using external GenAI tools with no formal governance, audit trail, or data residency controls. Every API call to an external LLM is a potential IP transfer event. Your organisation\'s source code, internal documentation, and proprietary processes are being ingested by third-party model infrastructure with no visibility into retention or usage policies.',
  moderate: 'Your assessment indicates partial or informal controls around GenAI tool usage in your India GCC. While some awareness exists, the absence of a formal audit trail means you cannot demonstrate to a regulator or auditor exactly what data has left your perimeter - or prove it hasn\'t. This is a documented but unquantified risk.',
  strong:   'Your assessment indicates proactive controls around GenAI tool usage. This is genuinely ahead of the majority of GCC peers. The strategic priority now is formalising and scaling these controls as your AI deployment velocity increases, and ensuring your Private LLM architecture keeps pace with developer demand to prevent shadow AI from re-emerging.'
};

const p2Findings = {
  critical: 'Your assessment indicates AI agents operating in your GCC environment are functioning without dedicated identity, scoped permissions, or independent audit trails. When an agent takes an action - modifying data, executing code, triggering a financial transaction - there is no mechanism to attribute that action to a specific agent instance, audit the decision chain, or roll back the consequence. In a regulated environment, this is not a theoretical risk. It is an audit failure waiting to be found.',
  moderate: 'Your assessment indicates some agents are tracked but the framework is incomplete. Partial coverage is the most dangerous posture: it creates a false sense of governance while leaving the highest-risk agents - those with the broadest access - potentially unmonitored. A complete agentic identity framework needs to cover every agent, not most of them.',
  strong:   'Your assessment indicates a mature approach to agentic AI governance. As your agent deployment scales, the priority is ensuring your framework grows with it - particularly as newer, more capable agents request broader system access. The edge cases that matter most are the ones your current framework was not designed for yet.'
};

const p3Findings = {
  critical: 'Your assessment indicates no formal cryptographic inventory has been conducted and post-quantum readiness is not on your active roadmap. Nation-state actors are currently executing "harvest now, decrypt later" operations - archiving your encrypted data today to decrypt when quantum capability arrives. NIST finalised its Post-Quantum Cryptographic standards in 2024. The migration timeline for large GCC environments is 3-5 years. The organisations that have not started are the ones that will not finish before the threat becomes real.',
  moderate: 'Your assessment indicates partial awareness of post-quantum risk but no formal migration programme. Knowing the risk exists is not the same as having a plan to address it. A PQC readiness assessment converts your current "known unknown" into a mapped, prioritised, and costed migration roadmap that your board can review and approve.',
  strong:   'Your assessment indicates a proactive posture on post-quantum readiness. This is a significant competitive advantage as regulatory pressure on PQC migration increases. The strategic priority is completing the cryptographic inventory, validating your NIST PQC algorithm selections, and beginning the migration of your highest-sensitivity data stores.'
};

function getFindingText(findings, score) {
  if (score >= 70) return findings.critical;
  if (score >= 45) return findings.moderate;
  return findings.strong;
}

function getTier(score) {
  if (score >= 70) return { label: 'Critical Exposure', cls: 'critical', desc: '3 of 3 pillars need immediate attention' };
  if (score >= 45) return { label: 'Moderate Risk', cls: 'moderate', desc: 'Partial controls - governance gaps remain' };
  return { label: 'Strong Foundation', cls: 'strong', desc: 'Better than 80% of GCC peers' };
}

function getPillarLabel(score) {
  if (score >= 70) return { label: 'Critical Risk', cls: 'critical' };
  if (score >= 45) return { label: 'Elevated Risk', cls: 'moderate' };
  return { label: 'Managed', cls: 'strong' };
}

const ReportView = ({ lead }) => {
  const [gaugeWidth, setGaugeWidth] = useState('0%');
  const params = new URLSearchParams(window.location.search);
  const isFromEmail = true;

  useEffect(() => {
    // Animate score gauge bar on load
    const timer = setTimeout(() => {
      setGaugeWidth(`${lead.riskScore}%`);
    }, 300);
    return () => clearTimeout(timer);
  }, [lead.riskScore]);

  const tier = getTier(lead.riskScore);
  const p1 = getPillarLabel(lead.p1Score);
  const p2 = getPillarLabel(lead.p2Score);
  const p3 = getPillarLabel(lead.p3Score);

  const topPillar = lead.p1Score >= lead.p2Score && lead.p1Score >= lead.p3Score 
    ? 'AI Sovereignty & Data Leakage' 
    : lead.p2Score >= lead.p3Score 
      ? 'Agentic Accountability' 
      : 'Post-Quantum Defense';

  const dateStr = new Date(lead.createdAt || lead.timestamp).toLocaleDateString('en-GB', { 
    day: 'numeric', 
    month: 'long', 
    year: 'numeric' 
  });

  const bmPolicy = lead.p1Score >= 60 ? 'Likely not yet - below peer average' : 'Partially in place - at or above peer average';
  const bmLlm = lead.p1Score >= 70 ? 'Not deployed - significant gap vs 19% peer baseline' : 'Partial or exploratory';
  const bmAgent = lead.p2Score >= 70 ? 'Not operational - agents inherit human credentials' : lead.p2Score >= 45 ? 'Partial - incomplete coverage' : 'Operational - ahead of 89% of peers';
  const bmPqc = lead.p3Score >= 70 ? 'Not started - below the 18% that have begun' : lead.p3Score >= 45 ? 'Partially mapped - approaching peer baseline' : 'Assessment complete - ahead of 82% of peers';

  return (
    <div className="report-root-container">
      {/* Dynamic Scopes local to this view */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;600&display=swap');

        .report-root-container {
          --ink:        #0B0F1A;
          --ink2:       #111827;
          --ink3:       #1E293B;
          --paper:      #F8FAFC;
          --paper2:     #F1F5F9;
          --paper3:     #E2E8F0;
          --paper4:     #CBD5E1;

          --green:      #059669;
          --green-mid:  #10B981;
          --green-hi:   #34D399;
          --green-vivid:#00F0A0;
          --green-pale: #ECFDF5;
          --green-glow: rgba(16, 185, 129, 0.15);

          --red:        #DC2626;
          --red-mid:    #EF4444;
          --red-pale:   #FEF2F2;
          --red-glow:   rgba(239, 68, 68, 0.12);

          --amber:      #D97706;
          --amber-mid:  #F59E0B;
          --amber-pale: #FFFBEB;
          --amber-glow: rgba(245, 158, 11, 0.12);

          --muted:      #64748B;
          --rule:       #E2E8F0;

          --font-sans:  'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          --font-mono:  'JetBrains Mono', 'Fira Code', monospace;

          --shadow-sm:  0 1px 2px rgba(0,0,0,0.04), 0 1px 3px rgba(0,0,0,0.06);
          --shadow-md:  0 4px 6px -1px rgba(0,0,0,0.07), 0 2px 4px -2px rgba(0,0,0,0.05);
          --shadow-lg:  0 10px 15px -3px rgba(0,0,0,0.08), 0 4px 6px -4px rgba(0,0,0,0.04);
          --shadow-xl:  0 20px 25px -5px rgba(0,0,0,0.08), 0 8px 10px -6px rgba(0,0,0,0.04);

          --radius-sm:  8px;
          --radius-md:  12px;
          --radius-lg:  16px;
          --radius-xl:  20px;

          background: var(--paper);
          color: var(--ink);
          font-family: var(--font-sans);
          font-size: 15px;
          line-height: 1.7;
          text-align: left;
          min-height: 100vh;
          padding-bottom: 0;
          overflow-x: hidden;
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }

        .print-layout {
          display: none !important;
        }

        .screen-layout {
          display: block !important;
        }

        @media print {
          .print-layout {
            display: block !important;
          }
          .screen-layout {
            display: none !important;
          }
        }

        .report-root-container *, 
        .report-root-container *::before, 
        .report-root-container *::after { 
          box-sizing: border-box; 
        }

        .page-wrap { max-width: 780px; margin: 0 auto; padding: 0 32px 80px; }

        /* ── COVER ── */
        .cover {
          background: linear-gradient(155deg, #0B0F1A 0%, #0F172A 40%, #1E293B 100%);
          position: relative; overflow: hidden;
          padding: 56px 52px 52px;
          margin-bottom: 0;
        }
        .cover::before {
          content: '';
          position: absolute; inset: 0;
          background:
            radial-gradient(ellipse 50% 70% at 90% 5%, rgba(16,185,129,0.18) 0%, transparent 60%),
            radial-gradient(ellipse 40% 50% at 5% 95%, rgba(239,68,68,0.08) 0%, transparent 50%),
            radial-gradient(ellipse 30% 40% at 50% 50%, rgba(99,102,241,0.06) 0%, transparent 50%);
          pointer-events: none;
        }
        .cover::after {
          content: '';
          position: absolute; inset: 0;
          background-image: 
            linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px);
          background-size: 48px 48px;
          pointer-events: none;
        }
        .cover-content { position: relative; z-index: 1; }

        .cover-logo { display: flex; align-items: center; gap: 14px; margin-bottom: 52px; }
        .cover-logo-mark {
          width: 48px; height: 48px; border-radius: var(--radius-sm);
          border: 1.5px solid rgba(16,185,129,0.35);
          display: flex; align-items: center; justify-content: center;
          background: rgba(16,185,129,0.06);
          backdrop-filter: blur(8px);
        }
        .cover-logo-text { 
          font-family: var(--font-mono); font-size: 12px; 
          color: rgba(255,255,255,0.45); letter-spacing: 0.18em; 
          text-transform: uppercase; font-weight: 500;
        }

        .cover-eyebrow { 
          font-family: var(--font-mono); font-size: 11px; 
          color: var(--green-hi); letter-spacing: 0.14em; 
          text-transform: uppercase; margin-bottom: 18px;
          display: inline-flex; align-items: center; gap: 10px;
        }
        .cover-eyebrow::before {
          content: '';
          display: inline-block;
          width: 24px; height: 2px;
          background: linear-gradient(90deg, var(--green-hi), transparent);
        }

        .cover-headline {
          font-family: var(--font-sans); 
          font-size: clamp(28px, 6vw, 46px); 
          font-weight: 800; 
          line-height: 1.12;
          color: #fff; margin-bottom: 22px; max-width: 580px;
          letter-spacing: -0.02em;
        }
        .cover-headline em { font-style: italic; color: var(--green-hi); }

        .cover-sub { 
          font-size: clamp(14px, 2.5vw, 15px); 
          color: rgba(255,255,255,0.50); 
          line-height: 1.75; 
          max-width: 500px; 
          margin-bottom: 44px;
          font-weight: 400;
        }

        .cover-meta { display: flex; gap: 0; flex-wrap: wrap; }
        .cover-meta-item {
          padding: 14px 24px;
          border: 1px solid rgba(255,255,255,0.07);
          background: rgba(255,255,255,0.02);
          backdrop-filter: blur(4px);
        }
        .cover-meta-item:first-child { border-radius: var(--radius-sm) 0 0 var(--radius-sm); }
        .cover-meta-item:last-child { border-radius: 0 var(--radius-sm) var(--radius-sm) 0; }
        .cover-meta-label { 
          font-family: var(--font-mono); font-size: 10px; 
          color: rgba(255,255,255,0.28); letter-spacing: 0.12em; 
          text-transform: uppercase; margin-bottom: 4px; 
        }
        .cover-meta-val { 
          font-size: 14px; color: rgba(255,255,255,0.80); 
          font-weight: 600; letter-spacing: 0.01em;
        }

        /* ── SCORE BAND ── */
        .score-band {
          background: linear-gradient(180deg, #111827 0%, #0F172A 100%);
          padding: 40px 52px;
          display: grid; grid-template-columns: auto 1fr auto;
          gap: 48px; align-items: center;
          margin-bottom: 0;
          position: relative;
        }
        .score-band::after {
          content: '';
          position: absolute; bottom: 0; left: 52px; right: 52px;
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.06), transparent);
        }
        .score-main { text-align: center; position: relative; }
        .score-main::before {
          content: '';
          position: absolute;
          top: 50%; left: 50%;
          transform: translate(-50%, -50%);
          width: 120px; height: 120px;
          border-radius: 50%;
          opacity: 0.5;
          pointer-events: none;
        }
        .score-main.critical-glow::before { background: radial-gradient(circle, rgba(239,68,68,0.15) 0%, transparent 70%); }
        .score-main.moderate-glow::before { background: radial-gradient(circle, rgba(245,158,11,0.15) 0%, transparent 70%); }
        .score-main.strong-glow::before { background: radial-gradient(circle, rgba(16,185,129,0.15) 0%, transparent 70%); }

        .score-num { 
          font-family: var(--font-sans); 
          font-size: clamp(52px, 10vw, 76px); 
          font-weight: 900; 
          line-height: 1;
          position: relative;
          letter-spacing: -0.03em;
        }
        .score-num.critical { color: #FF6B6B; text-shadow: 0 0 40px rgba(255,107,107,0.2); }
        .score-num.moderate { color: #FBBF24; text-shadow: 0 0 40px rgba(251,191,36,0.2); }
        .score-num.strong   { color: var(--green-hi); text-shadow: 0 0 40px rgba(52,211,153,0.2); }
        .score-of { 
          font-family: var(--font-mono); font-size: 16px; 
          color: rgba(255,255,255,0.2); font-weight: 400;
          margin-left: 4px;
        }
        .score-label { 
          font-family: var(--font-mono); font-size: 10px; 
          color: rgba(255,255,255,0.3); letter-spacing: 0.14em; 
          text-transform: uppercase; margin-top: 8px; 
        }

        .score-gauge { flex: 1; }
        .gauge-track { 
          height: 12px; 
          background: rgba(255,255,255,0.06); 
          border-radius: 6px; 
          margin-bottom: 10px; 
          position: relative;
          overflow: hidden;
        }
        .gauge-fill { 
          height: 12px; 
          border-radius: 6px; 
          background: linear-gradient(90deg, #34D399 0%, #FBBF24 50%, #EF4444 100%); 
          transition: width 1.4s cubic-bezier(0.22,1,0.36,1);
          position: relative;
        }
        .gauge-fill::after {
          content: '';
          position: absolute;
          right: -1px; top: 50%;
          transform: translateY(-50%);
          width: 18px; height: 18px;
          border-radius: 50%;
          background: #fff;
          box-shadow: 0 0 12px rgba(255,255,255,0.4), 0 2px 8px rgba(0,0,0,0.3);
          border: 3px solid currentColor;
        }
        .gauge-labels { 
          display: flex; justify-content: space-between; 
          font-family: var(--font-mono); font-size: 10px; 
          color: rgba(255,255,255,0.2); letter-spacing: 0.06em;
        }

        .score-tier { text-align: right; }
        .tier-badge {
          display: inline-flex; align-items: center; gap: 8px;
          padding: 8px 18px; border-radius: var(--radius-sm);
          font-family: var(--font-mono); font-size: 11px; font-weight: 600; letter-spacing: 0.08em;
          text-transform: uppercase; margin-bottom: 10px;
        }
        .tier-badge::before {
          content: '';
          width: 8px; height: 8px; border-radius: 50%;
        }
        .tier-badge.critical { 
          background: rgba(239,68,68,0.12); color: #FF6B6B; 
          border: 1px solid rgba(255,107,107,0.25);
          box-shadow: 0 0 20px rgba(239,68,68,0.08);
        }
        .tier-badge.critical::before { background: #FF6B6B; box-shadow: 0 0 8px rgba(255,107,107,0.6); }
        .tier-badge.moderate { 
          background: rgba(245,158,11,0.12); color: #FBBF24; 
          border: 1px solid rgba(251,191,36,0.25);
          box-shadow: 0 0 20px rgba(245,158,11,0.08);
        }
        .tier-badge.moderate::before { background: #FBBF24; box-shadow: 0 0 8px rgba(251,191,36,0.6); }
        .tier-badge.strong { 
          background: rgba(16,185,129,0.12); color: var(--green-hi); 
          border: 1px solid rgba(52,211,153,0.25);
          box-shadow: 0 0 20px rgba(16,185,129,0.08);
        }
        .tier-badge.strong::before { background: var(--green-hi); box-shadow: 0 0 8px rgba(52,211,153,0.6); }
        .tier-desc { font-size: 13px; color: rgba(255,255,255,0.40); font-weight: 400; }

        /* ── SECTION WRAPPERS ── */
        .paper-section { 
          padding: 56px 52px; 
          position: relative;
        }
        .paper-section::after {
          content: '';
          position: absolute; bottom: 0; left: 52px; right: 52px;
          height: 1px;
          background: linear-gradient(90deg, transparent, var(--paper3), transparent);
        }
        .paper-section:last-child::after { display: none; }

        .section-eyebrow {
          font-family: var(--font-mono); font-size: 11px; color: var(--green);
          letter-spacing: 0.16em; text-transform: uppercase; margin-bottom: 14px;
          display: inline-flex; align-items: center; gap: 12px;
          font-weight: 600;
        }
        .section-eyebrow::after { 
          content: ''; flex: 1; height: 1px; 
          background: linear-gradient(90deg, var(--paper3), transparent);
          min-width: 80px;
        }

        .section-title { 
          font-family: var(--font-sans); 
          font-size: clamp(22px, 4.5vw, 32px); 
          font-weight: 800; margin-bottom: 18px; line-height: 1.2; 
          color: var(--ink);
          letter-spacing: -0.02em;
        }
        .section-body { 
          color: var(--muted); line-height: 1.85; margin-bottom: 28px; 
          font-size: 15px; font-weight: 400;
        }

        /* ── PILLAR CARDS ── */
        .pillar-stack { 
          display: flex; flex-direction: column; gap: 16px; 
        }
        .pillar-row {
          background: #fff;
          display: grid;
          grid-template-columns: 6px 1fr;
          gap: 0;
          border-radius: var(--radius-md);
          box-shadow: var(--shadow-md);
          overflow: hidden;
          border: 1px solid var(--paper3);
          transition: box-shadow 0.3s ease;
        }
        .pillar-row:hover { box-shadow: var(--shadow-lg); }
        .pillar-accent { width: 6px; }
        .pillar-accent.critical { background: linear-gradient(180deg, var(--red), #991B1B); }
        .pillar-accent.moderate { background: linear-gradient(180deg, var(--amber), #92400E); }
        .pillar-accent.strong   { background: linear-gradient(180deg, var(--green-mid), #047857); }

        .pillar-body { padding: 28px 32px; }
        .pillar-header { 
          display: flex; align-items: flex-start; justify-content: space-between; 
          gap: 16px; margin-bottom: 16px; flex-wrap: wrap; 
        }
        .pillar-name { 
          font-family: var(--font-sans); font-size: 20px; 
          font-weight: 700; color: var(--ink); letter-spacing: -0.01em;
        }
        .pillar-tag { 
          font-family: var(--font-mono); font-size: 10px; 
          padding: 5px 14px; border-radius: 20px; white-space: nowrap;
          font-weight: 600; letter-spacing: 0.06em;
          text-transform: uppercase;
        }
        .pillar-tag.critical { background: var(--red-pale); color: var(--red); border: 1px solid rgba(220,38,38,0.15); }
        .pillar-tag.moderate { background: var(--amber-pale); color: var(--amber); border: 1px solid rgba(217,119,6,0.15); }
        .pillar-tag.strong   { background: var(--green-pale); color: var(--green); border: 1px solid rgba(5,150,105,0.15); }

        .pillar-fear {
          font-size: 14px; font-style: italic; color: var(--muted);
          border-left: 3px solid var(--paper3); padding: 12px 18px;
          margin-bottom: 18px;
          line-height: 1.7;
          background: var(--paper);
          border-radius: 0 var(--radius-sm) var(--radius-sm) 0;
        }
        .pillar-finding { font-size: 14px; color: var(--ink2); line-height: 1.8; margin-bottom: 18px; }

        .pillar-score-row { display: flex; align-items: center; gap: 14px; }
        .pillar-score-bar-bg { 
          flex: 1; height: 8px; background: var(--paper2); 
          border-radius: 4px; overflow: hidden;
        }
        .pillar-score-bar { height: 8px; border-radius: 4px; transition: width 1s ease; }
        .pillar-score-bar.critical { background: linear-gradient(90deg, var(--red), var(--red-mid)); }
        .pillar-score-bar.moderate { background: linear-gradient(90deg, var(--amber), var(--amber-mid)); }
        .pillar-score-bar.strong   { background: linear-gradient(90deg, var(--green), var(--green-mid)); }
        .pillar-score-num { 
          font-family: var(--font-mono); font-size: 14px; 
          font-weight: 700; min-width: 36px; text-align: right; 
        }
        .pillar-score-num.critical { color: var(--red); }
        .pillar-score-num.moderate { color: var(--amber); }
        .pillar-score-num.strong   { color: var(--green); }

        /* ── IMPACT GRID ── */
        .impact-grid { 
          display: grid; grid-template-columns: 1fr 1fr; 
          gap: 16px; margin-bottom: 36px; 
        }
        .impact-cell { 
          background: #fff; padding: 28px; 
          border-radius: var(--radius-md);
          box-shadow: var(--shadow-sm);
          border: 1px solid var(--paper3);
        }
        .impact-cell:nth-child(1) { 
          background: linear-gradient(145deg, #0F172A, #1E293B); 
          color: #fff; 
          border: 1px solid rgba(255,255,255,0.06);
          box-shadow: var(--shadow-lg);
        }
        .impact-num { 
          font-family: var(--font-sans); font-size: 42px; 
          font-weight: 900; letter-spacing: -0.03em;
        }
        .impact-num.critical-color { color: #FF6B6B; }
        .impact-num.moderate-color { color: #FBBF24; }
        .impact-num.strong-color { color: var(--green-hi); }
        .impact-label { font-size: 13px; color: rgba(255,255,255,0.45); margin-top: 6px; line-height: 1.6; }
        .impact-stat-label { 
          font-size: 11px; font-weight: 700; color: var(--ink); 
          margin-bottom: 8px; text-transform: uppercase; 
          letter-spacing: 0.08em; font-family: var(--font-mono); 
        }
        .impact-stat-val { font-size: 14px; color: var(--muted); line-height: 1.7; }

        /* ── HIGHLIGHT BOX ── */
        .highlight-box { 
          background: linear-gradient(135deg, var(--green-pale), #F0FDF4);
          border: 1px solid rgba(5,150,105,0.12); 
          padding: 24px 28px; margin: 24px 0;
          border-radius: var(--radius-md);
          box-shadow: var(--shadow-sm);
        }
        .highlight-box-title { 
          font-family: var(--font-mono); font-size: 11px; 
          color: var(--green); letter-spacing: 0.12em; 
          text-transform: uppercase; margin-bottom: 10px; 
          font-weight: 600;
          display: flex; align-items: center; gap: 8px;
        }
        .highlight-box-title::before {
          content: '✦';
          font-size: 10px;
        }
        .highlight-box-body { font-size: 14px; color: var(--ink2); line-height: 1.75; }

        /* ── PULL QUOTE ── */
        .pull-quote {
          border-left: 4px solid var(--green-mid); 
          padding: 24px 32px;
          background: linear-gradient(135deg, var(--green-pale), rgba(236,253,245,0.5));
          margin: 32px 0;
          border-radius: 0 var(--radius-md) var(--radius-md) 0;
          box-shadow: var(--shadow-sm);
        }
        .pull-quote-text { 
          font-family: var(--font-sans); font-size: 18px; 
          font-style: italic; color: var(--ink); line-height: 1.6; 
          margin-bottom: 10px; font-weight: 500;
        }
        .pull-quote-source { 
          font-family: var(--font-mono); font-size: 11px; 
          color: var(--muted); letter-spacing: 0.08em; 
        }

        /* ── ROADMAP ── */
        .roadmap { display: flex; flex-direction: column; gap: 0; position: relative; }
        .roadmap::before {
          content: ''; position: absolute; left: 23px; top: 12px; bottom: 12px;
          width: 3px; border-radius: 2px;
          background: linear-gradient(180deg, var(--red) 0%, var(--amber) 50%, var(--green-mid) 100%);
        }
        .roadmap-step { 
          display: grid; grid-template-columns: 48px 1fr; 
          gap: 24px; padding: 0 0 36px; position: relative; 
        }
        .roadmap-step:last-child { padding-bottom: 0; }
        .step-dot {
          width: 48px; height: 48px; border-radius: 50%;
          border: 3px solid var(--rule); background: #fff;
          display: flex; align-items: center; justify-content: center;
          font-family: var(--font-mono); font-size: 11px; font-weight: 700; color: var(--muted);
          flex-shrink: 0; position: relative; z-index: 1;
          box-shadow: var(--shadow-md);
          letter-spacing: -0.02em;
        }
        .step-dot.now { 
          border-color: var(--red); color: var(--red); background: var(--red-pale);
          box-shadow: var(--shadow-md), 0 0 0 6px rgba(239,68,68,0.08);
        }
        .step-dot.soon { 
          border-color: var(--amber); color: var(--amber); background: var(--amber-pale);
          box-shadow: var(--shadow-md), 0 0 0 6px rgba(245,158,11,0.08);
        }
        .step-dot.plan { 
          border-color: var(--green); color: var(--green); background: var(--green-pale);
          box-shadow: var(--shadow-md), 0 0 0 6px rgba(5,150,105,0.08);
        }
        .step-content { padding-top: 10px; }
        .step-horizon { 
          font-family: var(--font-mono); font-size: 10px; 
          letter-spacing: 0.12em; text-transform: uppercase; 
          margin-bottom: 6px; font-weight: 600;
        }
        .step-horizon.now  { color: var(--red); }
        .step-horizon.soon { color: var(--amber); }
        .step-horizon.plan { color: var(--green); }
        .step-title { 
          font-family: var(--font-sans); font-size: 18px; 
          font-weight: 700; margin-bottom: 10px; color: var(--ink);
          letter-spacing: -0.01em;
        }
        .step-desc { font-size: 14px; color: var(--muted); line-height: 1.8; margin-bottom: 14px; }
        .step-services { display: flex; flex-wrap: wrap; gap: 8px; }
        .step-chip { 
          font-family: var(--font-mono); font-size: 11px; 
          padding: 5px 14px; background: #fff; 
          border: 1px solid var(--paper3); color: var(--ink3); 
          border-radius: 20px; font-weight: 500;
          transition: all 0.2s ease;
        }
        .step-chip:hover { 
          border-color: var(--green-mid); 
          color: var(--green); 
          background: var(--green-pale);
        }

        /* ── BENCHMARK TABLE ── */
        .table-responsive {
          width: 100%;
          overflow-x: auto;
          -webkit-overflow-scrolling: touch;
          margin-bottom: 32px;
          border-radius: var(--radius-md);
          box-shadow: var(--shadow-md);
          border: 1px solid var(--paper3);
          overflow: hidden;
        }
        .benchmark-table { width: 100%; border-collapse: collapse; margin-bottom: 0; min-width: 580px; }
        .benchmark-table th { 
          background: linear-gradient(180deg, #0F172A, #1E293B);
          color: rgba(255,255,255,0.55); 
          font-family: var(--font-mono); font-size: 10px; 
          letter-spacing: 0.1em; text-transform: uppercase; 
          padding: 16px 20px; text-align: left; font-weight: 600; 
        }
        .benchmark-table td { 
          padding: 16px 20px; border-bottom: 1px solid var(--paper2); 
          font-size: 14px; vertical-align: middle; color: var(--ink); 
          background: #fff;
        }
        .benchmark-table tr:last-child td { border-bottom: none; }
        .benchmark-table tr:nth-child(even) td { background: var(--paper); }
        .bm-bar-bg { width: 100%; height: 6px; background: var(--paper2); border-radius: 3px; margin-top: 6px; }
        .bm-bar { height: 6px; border-radius: 3px; }

        /* ── INTEL CARDS ── */
        .intel-cards { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
        .intel-card { 
          border: 1px solid var(--paper3); padding: 24px; 
          background: #fff; border-radius: var(--radius-md);
          box-shadow: var(--shadow-sm);
          transition: box-shadow 0.3s ease, transform 0.3s ease;
        }
        .intel-card:hover { box-shadow: var(--shadow-md); transform: translateY(-2px); }
        .intel-card-label { 
          font-family: var(--font-mono); font-size: 10px; 
          color: var(--muted); letter-spacing: 0.1em; 
          text-transform: uppercase; margin-bottom: 12px; 
          font-weight: 600;
        }
        .intel-card-stat { 
          font-family: var(--font-sans); font-size: 32px; 
          font-weight: 800; color: var(--ink); margin-bottom: 6px;
          letter-spacing: -0.02em;
        }
        .intel-card-desc { font-size: 13px; color: var(--muted); line-height: 1.65; }

        /* ── CTA BLOCK ── */
        .cta-block {
          background: linear-gradient(155deg, #0B0F1A 0%, #0F172A 40%, #1E293B 100%);
          padding: 56px 52px;
          position: relative; overflow: hidden;
        }
        .cta-block::before {
          content: '';
          position: absolute; inset: 0;
          background:
            radial-gradient(circle at 90% 20%, rgba(16,185,129,0.12) 0%, transparent 50%),
            radial-gradient(circle at 10% 80%, rgba(99,102,241,0.06) 0%, transparent 40%);
          pointer-events: none;
        }
        .cta-block::after {
          content: '';
          position: absolute; inset: 0;
          background-image: 
            linear-gradient(rgba(255,255,255,0.015) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.015) 1px, transparent 1px);
          background-size: 48px 48px;
          pointer-events: none;
        }
        .cta-label { 
          font-family: var(--font-mono); font-size: 11px; 
          color: var(--green-hi); letter-spacing: 0.14em; 
          text-transform: uppercase; margin-bottom: 18px;
          position: relative; z-index: 1;
          font-weight: 600;
        }
        .cta-headline { 
          font-family: var(--font-sans); 
          font-size: clamp(24px, 5vw, 36px); 
          font-weight: 800; color: #fff; line-height: 1.15; margin-bottom: 18px;
          letter-spacing: -0.02em;
          position: relative; z-index: 1;
        }
        .cta-headline em { font-style: italic; color: var(--green-hi); }
        .cta-sub { 
          font-size: 15px; color: rgba(255,255,255,0.45); 
          line-height: 1.75; margin-bottom: 40px; max-width: 520px;
          position: relative; z-index: 1;
        }

        .cta-options { 
          display: grid; grid-template-columns: 1fr 1fr; 
          gap: 14px; margin-bottom: 40px;
          position: relative; z-index: 1;
        }
        .cta-option {
          border: 1px solid rgba(255,255,255,0.08); 
          padding: 24px;
          cursor: pointer; 
          transition: all 0.25s ease;
          text-decoration: none;
          display: block;
          border-radius: var(--radius-md);
          background: rgba(255,255,255,0.02);
          backdrop-filter: blur(4px);
        }
        .cta-option:hover { 
          border-color: rgba(16,185,129,0.35); 
          background: rgba(16,185,129,0.06); 
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(0,0,0,0.15);
        }
        .cta-option-icon { font-size: 22px; margin-bottom: 12px; }
        .cta-option-title { font-size: 14px; font-weight: 700; color: #fff; margin-bottom: 6px; }
        .cta-option-desc { font-size: 12px; color: rgba(255,255,255,0.35); line-height: 1.55; }

        .cta-primary-btn {
          display: inline-flex; align-items: center; gap: 10px;
          padding: 18px 40px;
          background: linear-gradient(135deg, #10B981 0%, #059669 100%);
          color: #fff;
          font-family: var(--font-mono); font-size: 13px; font-weight: 700; letter-spacing: 0.08em;
          text-transform: uppercase; text-decoration: none; cursor: pointer;
          border: none; border-radius: var(--radius-sm);
          box-shadow: 0 4px 14px rgba(5,150,105,0.35), 0 0 0 1px rgba(16,185,129,0.2);
          transition: all 0.2s ease;
          position: relative; z-index: 1;
        }
        .cta-primary-btn:hover { 
          transform: translateY(-2px); 
          box-shadow: 0 8px 24px rgba(5,150,105,0.4), 0 0 0 1px rgba(16,185,129,0.3);
        }

        .cta-urgency {
          margin-top: 28px; padding: 18px 24px;
          border-left: 4px solid rgba(239,68,68,0.4);
          background: rgba(239,68,68,0.06);
          border-radius: 0 var(--radius-sm) var(--radius-sm) 0;
          text-align: left;
          position: relative; z-index: 1;
        }
        .cta-urgency-text { font-size: 13px; color: rgba(255,107,107,0.85); line-height: 1.7; }

        .expect-steps { 
          display: grid; grid-template-columns: repeat(3,1fr); 
          gap: 16px; margin-bottom: 36px;
          position: relative; z-index: 1;
        }
        .expect-step { 
          background: rgba(255,255,255,0.03); 
          border: 1px solid rgba(255,255,255,0.06);
          padding: 28px 24px; 
          border-radius: var(--radius-md);
        }
        .expect-num { 
          font-family: var(--font-mono); font-size: 32px; 
          font-weight: 700; color: var(--green-hi); 
          margin-bottom: 12px; opacity: 0.7;
        }
        .expect-title { font-size: 15px; font-weight: 700; margin-bottom: 8px; color: #fff; }
        .expect-desc { font-size: 13px; color: rgba(255,255,255,0.40); line-height: 1.65; }

        /* ── FOOTER ── */
        .report-footer {
          background: linear-gradient(180deg, #0F172A, #0B0F1A);
          padding: 36px 52px;
          display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 16px;
          position: relative;
        }
        .report-footer::before {
          content: '';
          position: absolute; top: 0; left: 52px; right: 52px;
          height: 2px;
          background: linear-gradient(90deg, transparent, var(--green-mid), transparent);
        }
        .footer-brand { 
          font-family: var(--font-mono); font-size: 13px; 
          color: rgba(255,255,255,0.30); font-weight: 500;
        }
        .footer-links { display: flex; gap: 28px; }
        .footer-link { 
          font-size: 13px; color: rgba(255,255,255,0.30); 
          text-decoration: none; transition: color 0.2s ease;
        }
        .footer-link:hover { color: var(--green-hi); }
        .footer-disclaimer { 
          font-size: 11px; color: rgba(255,255,255,0.15); 
          margin-top: 16px; width: 100%; text-align: justify; 
          line-height: 1.7;
        }

        /* ── DOWNLOAD BUTTON ── */
        .download-btn {
          background: linear-gradient(135deg, #10B981 0%, #059669 100%);
          color: #fff;
          border: none;
          padding: 10px 20px;
          border-radius: var(--radius-sm);
          font-weight: 700;
          cursor: pointer;
          font-size: 12px;
          letter-spacing: 0.5px;
          text-transform: uppercase;
          font-family: var(--font-mono);
          display: inline-flex;
          align-items: center;
          gap: 8px;
          box-shadow: 0 2px 10px rgba(5,150,105,0.3);
          transition: all 0.2s ease;
        }
        .download-btn:hover { 
          transform: translateY(-1px);
          box-shadow: 0 4px 16px rgba(5,150,105,0.4);
        }

        /* ── RESPONSIVE ── */
        @media (max-width: 768px) {
          .cover { padding: 44px 24px 36px; }
          .cover-meta { gap: 0; flex-direction: column; }
          .cover-meta-item { 
            border-radius: 0 !important; 
            border-bottom: none; 
          }
          .cover-meta-item:first-child { border-radius: var(--radius-sm) var(--radius-sm) 0 0 !important; }
          .cover-meta-item:last-child { border-radius: 0 0 var(--radius-sm) var(--radius-sm) !important; }
          .score-band {
            grid-template-columns: 1fr;
            gap: 28px;
            padding: 36px 24px;
            text-align: center;
          }
          .score-tier {
            text-align: center;
            margin-top: 8px;
          }
          .paper-section { padding: 40px 24px; }
          .paper-section::after { left: 24px; right: 24px; }
          .page-wrap { padding: 0 0 40px; }
          .pillar-row {
            grid-template-columns: 6px 1fr;
          }
          .pillar-body { padding: 22px 20px; }
          .pillar-header { flex-direction: column; align-items: flex-start; gap: 8px; }
          .pillar-tag { align-self: flex-start; }
          .impact-grid { grid-template-columns: 1fr; }
          .intel-cards { grid-template-columns: 1fr; gap: 16px; }
          .cta-block { padding: 44px 24px; }
          .cta-options { grid-template-columns: 1fr; gap: 14px; }
          .expect-steps { grid-template-columns: 1fr; }
          .expect-step { padding: 24px 20px; }
          .report-footer { padding: 32px 24px; flex-direction: column; align-items: flex-start; gap: 24px; }
          .report-footer::before { left: 24px; right: 24px; }
          .footer-links { width: 100%; flex-wrap: wrap; gap: 16px 24px; }
        }

        @media (max-width: 480px) {
          .cover { padding: 32px 16px 28px; }
          .cover-logo { margin-bottom: 36px; }
          .score-band { padding: 28px 16px; gap: 20px; }
          .paper-section { padding: 32px 16px; }
          .paper-section::after { left: 16px; right: 16px; }
          .pillar-body { padding: 18px 14px; }
          .pillar-name { font-size: 17px; }
          .pillar-fear { padding: 10px 14px; margin-bottom: 14px; }
          .intel-card { padding: 20px; }
          .cta-block { padding: 36px 16px; }
          .cta-primary-btn { width: 100%; text-align: center; justify-content: center; padding: 16px 24px; }
          .roadmap-step { gap: 14px; }
          .step-content { padding-top: 4px; }
          .highlight-box { padding: 18px 16px; margin: 18px 0; }
        }

        /* ── PRINT / PDF STYLES ── */
        @page {
          size: A4;
          margin: 1.2cm 1.2cm;
        }

        @media print {
          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            color-adjust: exact !important;
          }

          html, body {
            background: #ffffff !important;
            color: #0F172A !important;
            margin: 0 !important;
            padding: 0 !important;
            font-size: 11px !important;
            line-height: 1.4 !important;
          }

          .print-layout {
            display: block !important;
          }

          .screen-layout {
            display: none !important;
          }

          .report-root-container { 
            background: #ffffff !important;
            padding-bottom: 0 !important;
            width: 100% !important;
            max-width: 100% !important;
            margin: 0 !important;
          }

          .page-wrap {
            max-width: 100% !important;
            width: 100% !important;
            padding: 0 !important;
            margin: 0 !important;
          }

          /* Clean, light containers for PDF print preview */
          .print-pdf-page {
            position: relative;
            height: 262mm;
            page-break-after: always;
            padding: 0 !important;
            margin: 0 !important;
            width: 100%;
            max-width: 100%;
            box-sizing: border-box;
          }
          .print-pdf-page:last-child {
            page-break-after: avoid;
          }

          .print-header {
            border-top: 3px solid #10B981;
            padding-top: 8px;
            margin-bottom: 12px;
            display: flex;
            justify-content: space-between;
            align-items: center;
          }
          .print-logo-text {
            font-family: var(--font-sans);
            font-size: 13px;
            font-weight: 800;
            color: #0F172A;
          }
          .print-subtitle {
            font-size: 7px;
            text-transform: uppercase;
            letter-spacing: 0.1em;
            color: #64748B;
          }

          .print-score-card {
            background: #ffffff;
            border: 1px solid #E2E8F0;
            border-left: 5px solid var(--tier-color, #DC2626);
            padding: 10px 14px;
            margin-bottom: 12px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-radius: 6px;
          }
          .print-score-num {
            font-size: 28px;
            font-weight: 900;
            color: var(--tier-color, #DC2626);
          }
          .print-badge {
            background: var(--tier-color, #DC2626);
            color: #fff;
            padding: 5px 12px;
            font-size: 9px;
            font-weight: 700;
            text-transform: uppercase;
            border-radius: 4px;
          }
          .print-gauge-track {
            width: 140px;
            height: 6px;
            background: #E2E8F0;
            border-radius: 3px;
            overflow: hidden;
            margin-top: 6px;
          }
          .print-gauge-fill {
            height: 6px;
            background: var(--tier-color, #DC2626);
          }

          .print-section-title {
            font-size: 10px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            color: #059669;
            margin-bottom: 8px;
            border-bottom: 1px solid #E2E8F0;
            padding-bottom: 3px;
          }

          .print-pillar-card {
            background: #ffffff;
            border: 1px solid #E2E8F0;
            border-left: 4px solid var(--pillar-color, #64748B);
            padding: 8px 12px;
            margin-bottom: 8px;
            border-radius: 6px;
            page-break-inside: avoid;
          }
          .print-pillar-header {
            display: flex;
            justify-content: space-between;
            margin-bottom: 6px;
          }
          .print-pillar-title {
            font-weight: 700;
            font-size: 11px;
            color: #0F172A;
          }
          .print-pillar-badge {
            font-size: 8px;
            font-weight: 700;
            text-transform: uppercase;
            color: var(--pillar-color, #64748B);
          }
          .print-pillar-text {
            color: #475569;
            font-size: 9.5px;
            line-height: 1.4;
            margin-bottom: 6px;
          }
          .print-pillar-bar-bg {
            height: 4px;
            background: #E2E8F0;
            border-radius: 2px;
            overflow: hidden;
          }
          .print-pillar-bar-fill {
            height: 4px;
            background: var(--pillar-color, #64748B);
          }

          /* Page 2 elements */
          .print-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
            font-size: 9.5px;
          }
          .print-table th {
            background: #0F172A;
            color: #fff;
            padding: 6px 10px;
            text-align: left;
            font-weight: 600;
          }
          .print-table td {
            padding: 6px 10px;
            border-bottom: 1px solid #E2E8F0;
          }
          .print-table tr:nth-child(even) td {
            background: #ffffff;
          }

          .print-roadmap {
            border-left: 2px solid #E2E8F0;
            margin-left: 10px;
            padding-left: 15px;
            margin-bottom: 25px;
          }
          .print-roadmap-step {
            position: relative;
            margin-bottom: 12px;
          }
          .print-roadmap-step::before {
            content: '';
            position: absolute;
            left: -20px;
            top: 3px;
            width: 8px;
            height: 8px;
            border-radius: 50%;
            background: var(--step-color, #64748B);
          }
          .print-roadmap-time {
            font-weight: 700;
            font-size: 8.5px;
            color: var(--step-color, #64748B);
            margin-bottom: 2px;
          }
          .print-roadmap-desc {
            font-size: 9.5px;
            color: #334155;
          }

          /* MINIMIZED Next Steps action block */
          .print-cta-card {
            background: #ffffff;
            border: 1px solid #E2E8F0;
            border-top: 3px solid #10B981;
            padding: 12px 16px;
            border-radius: 6px;
            page-break-inside: avoid;
            display: flex;
            justify-content: space-between;
            align-items: center;
          }
          .print-cta-left {
            max-width: 70%;
          }
          .print-cta-title {
            font-size: 11px;
            font-weight: 700;
            color: #0F172A;
            margin-bottom: 4px;
          }
          .print-cta-desc {
            font-size: 9px;
            color: #475569;
            line-height: 1.3;
          }
          .print-cta-right {
            text-align: right;
            font-size: 8.5px;
            font-weight: 700;
            color: #059669;
            line-height: 1.5;
          }

          .print-footer {
            position: absolute;
            bottom: 0;
            left: 0;
            right: 0;
            border-top: 1px solid #E2E8F0;
            padding-top: 8px;
            display: flex;
            justify-content: space-between;
            font-size: 7.5px;
            color: #94A3B8;
          }
        }
      `}</style>

      {/* ── SCREEN ONLY LAYOUT ── */}
      <div className="screen-layout">
        {/* ── COVER ── */}
        <div className="cover">
          <div className="cover-content">
            <div className="cover-logo" style={{ justifyContent: 'space-between', width: '100%' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div className="cover-logo-mark">
                  <img src="/log.png" alt="Instrek Technologies Logo" style={{ width: '100%', height: '100%', objectFit: 'contain', padding: '4px' }} />
                </div>
                <div className="cover-logo-text">Instrek Technologies</div>
              </div>
              <button 
                className="download-btn"
                onClick={() => window.print()}
              >
                📥 Download PDF
              </button>
            </div>
            <div className="cover-eyebrow">Confidential Risk Assessment Report</div>
            <h1 className="cover-headline">Your organisation carries <em>three open wounds</em> that your AI roadmap hasn't closed.</h1>
            <p className="cover-sub">This report maps your organization's AI security exposure across the three pillars that regulators, auditors, and adversaries are already prioritising. It is based on your responses to the Instrek Technologies risk scan.</p>
            
            <div className="cover-meta">
              <div className="cover-meta-item">
                <div className="cover-meta-label">Prepared for</div>
                <div className="cover-meta-val">{lead.firstName} {lead.lastName}</div>
              </div>
              <div className="cover-meta-item">
                <div className="cover-meta-label">Role</div>
                <div className="cover-meta-val">{lead.role}</div>
              </div>
              <div className="cover-meta-item">
                <div className="cover-meta-label">Organisation</div>
                <div className="cover-meta-val">{lead.company || 'Not Specified'}</div>
              </div>
              <div className="cover-meta-item">
                <div className="cover-meta-label">Report date</div>
                <div className="cover-meta-val">{dateStr}</div>
              </div>
            </div>
          </div>
        </div>

        {/* ── SCORE BAND ── */}
        <div className="score-band">
          <div className={`score-main ${tier.cls}-glow`}>
            <div className={`score-num ${tier.cls}`}>{lead.riskScore}<span className="score-of">/100</span></div>
            <div className="score-label">Composite Risk Score</div>
          </div>
          <div className="score-gauge">
            <div className="gauge-track">
              <div className="gauge-fill" style={{ width: gaugeWidth }}></div>
            </div>
            <div className="gauge-labels">
              <span>Managed</span>
              <span>Elevated</span>
              <span>Critical</span>
            </div>
          </div>
          <div className="score-tier">
            <div className={`tier-badge ${tier.cls}`}>{tier.label}</div>
            <div className="tier-desc">{lead.riskScore >= 70 ? '3 of 3 pillars need immediate attention' : lead.riskScore >= 45 ? 'Partial controls - governance gaps remain' : 'Better than 80% of GCC peers'}</div>
          </div>
        </div>

        {/* ── SECTION 1 - EXECUTIVE SUMMARY ── */}
        <div className="paper-section">
          <div className="page-wrap" style={{ paddingBottom: 0 }}>
            <div className="section-eyebrow">01 — Executive Summary</div>
            <h2 className="section-title">The situation your board will ask about next quarter.</h2>
            <p className="section-body">Based on your self-assessment, your organization is operating with significant unmanaged AI risk. The gap is not primarily technical - it is architectural. Your teams have access to AI tools that your governance framework was not designed for, your agents operate without the identity and auditability of a regulated employee, and your cryptographic infrastructure is built for a threat landscape that has already shifted.</p>
            <p className="section-body">This is not a future risk. It is a present condition. The DPDP Act has given Indian regulators a mechanism to act. The NIST PQC standards have given your auditors a framework to measure against. And the velocity of agentic AI adoption in organizations means that every week without governance is a week of compounding exposure.</p>

            <div className="pull-quote">
              <div className="pull-quote-text">"The organisations that define AI governance frameworks now will not just avoid the next breach. They will win the talent, the client trust, and the regulatory goodwill that defines who leads in the next decade of enterprise AI."</div>
              <div className="pull-quote-source">— Instrek Technologies Research, April 2026</div>
            </div>

            <div className="impact-grid">
              <div className="impact-cell">
                <div className={`impact-num ${tier.cls}-color`}>{lead.riskScore}</div>
                <div className="impact-label">Your composite risk score out of 100. Above 70 indicates critical exposure requiring immediate architectural intervention.</div>
              </div>
              <div className="impact-cell">
                <div className="impact-stat-label">Highest Risk Pillar</div>
                <div className="impact-stat-val">{topPillar} — score {Math.max(lead.p1Score, lead.p2Score, lead.p3Score)}/100. This is where your first 30 days of remediation should be focused.</div>
              </div>
              <div className="impact-cell">
                <div className="impact-stat-label">Regulatory Exposure</div>
                <div className="impact-stat-val">DPDP Act enforcement is active. Your current AI data flow posture may not withstand regulatory scrutiny without documented controls.</div>
              </div>
              <div className="impact-cell">
                <div className="impact-stat-label">Peer Context</div>
                <div className="impact-stat-val">73% of organizations at your AI deployment stage have not completed a formal AI governance architecture. You are in the majority — and that is the risk.</div>
              </div>
            </div>
          </div>
        </div>

        {/* ── SECTION 2 - THREE PILLARS ── */}
        <div className="paper-section">
          <div className="page-wrap" style={{ paddingBottom: 0 }}>
            <div className="section-eyebrow">02 — Risk Pillar Breakdown</div>
            <h2 className="section-title">Where your exposure lives — and what it costs if unaddressed.</h2>
            <p className="section-body">Your risk profile is mapped across the three AI security pillars that matter most to executives in 2026. Each pillar below reflects your specific answers, the gap they reveal, and the architectural response that closes it.</p>

            <div className="pillar-stack">
              {/* PILLAR 1 */}
              <div className="pillar-row">
                <div className={`pillar-accent ${p1.cls}`}></div>
                <div className="pillar-body">
                  <div className="pillar-header">
                    <div className="pillar-name">🔒 AI Sovereignty &amp; Data Leakage</div>
                    <div className={`pillar-tag ${p1.cls}`}>{p1.label}</div>
                  </div>
                  <div className="pillar-fear">"If my India team uses ChatGPT to write code, where does my IP actually go? Can the vendor train on it?"</div>
                  <div className="pillar-finding">{getFindingText(p1Findings, lead.p1Score)}</div>
                  <div className="pillar-score-row">
                    <div className="pillar-score-bar-bg">
                      <div className={`pillar-score-bar ${p1.cls}`} style={{ width: `${lead.p1Score}%` }}></div>
                    </div>
                    <div className={`pillar-score-num ${p1.cls}`}>{lead.p1Score}</div>
                  </div>
                  <div className="highlight-box" style={{ marginTop: '20px' }}>
                    <div className="highlight-box-title">What "closing this gap" looks like</div>
                    <div className="highlight-box-body">A Private LLM deployment on your VPC or on-premise gives your developers full GenAI capability with zero data leaving your perimeter. Combined with a Secure RAG architecture, your proprietary codebases and internal documents become the model's knowledge base - not a training leak.</div>
                  </div>
                </div>
              </div>

              {/* PILLAR 2 */}
              <div className="pillar-row">
                <div className={`pillar-accent ${p2.cls}`}></div>
                <div className="pillar-body">
                  <div className="pillar-header">
                    <div className="pillar-name">🤖 Agentic Accountability</div>
                    <div className={`pillar-tag ${p2.cls}`}>{p2.label}</div>
                  </div>
                  <div className="pillar-fear">"What happens if an autonomous agent makes a $1M financial error or creates a security backdoor - and I don't find out for weeks?"</div>
                  <div className="pillar-finding">{getFindingText(p2Findings, lead.p2Score)}</div>
                  <div className="pillar-score-row">
                    <div className="pillar-score-bar-bg">
                      <div className={`pillar-score-bar ${p2.cls}`} style={{ width: `${lead.p2Score}%` }}></div>
                    </div>
                    <div className={`pillar-score-num ${p2.cls}`}>{lead.p2Score}</div>
                  </div>
                  <div className="highlight-box" style={{ marginTop: '20px' }}>
                    <div className="highlight-box-title">What "closing this gap" looks like</div>
                    <div className="highlight-box-body">Treating AI agents as non-human employees - with their own credentials, scoped permissions, and immutable audit trails - converts an invisible risk into a manageable one.</div>
                  </div>
                </div>
              </div>

              {/* PILLAR 3 */}
              <div className="pillar-row">
                <div className={`pillar-accent ${p3.cls}`}></div>
                <div className="pillar-body">
                  <div className="pillar-header">
                    <div className="pillar-name">🛡️ Post-Quantum &amp; AI Cyber Defense</div>
                    <div className={`pillar-tag ${p3.cls}`}>{p3.label}</div>
                  </div>
                  <div className="pillar-fear">"Hackers are using AI to find vulnerabilities faster than we can patch them. And in five years, a quantum computer could decrypt everything we encrypted today."</div>
                  <div className="pillar-finding">{getFindingText(p3Findings, lead.p3Score)}</div>
                  <div className="pillar-score-row">
                    <div className="pillar-score-bar-bg">
                      <div className={`pillar-score-bar ${p3.cls}`} style={{ width: `${lead.p3Score}%` }}></div>
                    </div>
                    <div className={`pillar-score-num ${p3.cls}`}>{lead.p3Score}</div>
                  </div>
                  <div className="highlight-box" style={{ marginTop: '20px' }}>
                    <div className="highlight-box-title">What "closing this gap" looks like</div>
                    <div className="highlight-box-body">A proactive, self-healing SOC uses AI to detect and auto-remediate threats before they reach human escalation. A Post-Quantum Cryptography readiness assessment maps every RSA and ECC dependency.</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── SECTION 3 - ROADMAP ── */}
        <div className="paper-section" style={{ background: 'var(--paper2)' }}>
          <div className="page-wrap" style={{ paddingBottom: 0 }}>
            <div className="section-eyebrow">03 — Remediation Roadmap</div>
            <h2 className="section-title">Three horizons. One coherent architecture.</h2>
            <div className="roadmap">
              <div className="roadmap-step">
                <div className="step-dot now">30d</div>
                <div className="step-content">
                  <div className="step-horizon now">Immediate — 0 to 30 days</div>
                  <div className="step-title">Contain the bleed: AI data flow audit + shadow AI policy</div>
                  <div className="step-desc">A rapid AI data flow audit maps every external LLM API call being made by your teams.</div>
                </div>
              </div>
              <div className="roadmap-step">
                <div className="step-dot soon">90d</div>
                <div className="step-content">
                  <div className="step-horizon soon">Short-term — 30 to 90 days</div>
                  <div className="step-title">Build the foundation: Private LLM + Agentic Identity</div>
                  <div className="step-desc">Deploy a Private LLM environment in your VPC or on-premise - with Secure RAG.</div>
                </div>
              </div>
              <div className="roadmap-step">
                <div className="step-dot plan">12m</div>
                <div className="step-content">
                  <div className="step-horizon plan">Strategic — 90 days to 12 months</div>
                  <div className="step-title">Future-proof: SOC AI uplift + PQC migration roadmap</div>
                  <div className="step-desc">An AI-powered self-healing SOC shifts your security posture from reactive to proactive.</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── SECTION 4 - PEER BENCHMARKS ── */}
        <div className="paper-section">
          <div className="page-wrap" style={{ paddingBottom: 0 }}>
            <div className="section-eyebrow">04 — Peer Intelligence</div>
            <h2 className="section-title">Where executives at your level actually stand.</h2>
            <div className="table-responsive">
              <table className="benchmark-table">
                <thead>
                  <tr>
                    <th>Capability</th>
                    <th>Peer Average</th>
                    <th>Your Status</th>
                    <th>Maturity</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><strong>AI Acceptable Use Policy</strong></td>
                    <td>41% have a formal policy</td>
                    <td>{bmPolicy}</td>
                    <td><div className="bm-bar-bg"><div className="bm-bar" style={{ width: '41%', background: 'linear-gradient(90deg, var(--amber), var(--amber-mid))' }}></div></div></td>
                  </tr>
                  <tr>
                    <td><strong>Private / On-Prem LLM</strong></td>
                    <td>19% deployed</td>
                    <td>{bmLlm}</td>
                    <td><div className="bm-bar-bg"><div className="bm-bar" style={{ width: '19%', background: 'linear-gradient(90deg, var(--red), var(--red-mid))' }}></div></div></td>
                  </tr>
                  <tr>
                    <td><strong>Agentic Identity Framework</strong></td>
                    <td>11% operational</td>
                    <td>{bmAgent}</td>
                    <td><div className="bm-bar-bg"><div className="bm-bar" style={{ width: '11%', background: 'linear-gradient(90deg, var(--red), var(--red-mid))' }}></div></div></td>
                  </tr>
                  <tr>
                    <td><strong>PQC Readiness Assessment</strong></td>
                    <td>18% completed</td>
                    <td>{bmPqc}</td>
                    <td><div className="bm-bar-bg"><div className="bm-bar" style={{ width: '18%', background: 'linear-gradient(90deg, var(--red), var(--red-mid))' }}></div></div></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* ── SECTION 5 - CTA ── */}
        <div className="cta-block">
          <div className="page-wrap" style={{ padding: 0 }}>
            <div className="cta-label">Your Next Step</div>
            <h2 className="cta-headline">This report surfaces the risk.<br/><em>A conversation closes it.</em></h2>
            <div className="cta-options">
              <a className="cta-option" href="https://calendly.com/instrek/strategy" target="_blank" rel="noreferrer">
                <div className="cta-option-icon">📅</div>
                <div className="cta-option-title">Book a 30-min Strategy Call</div>
                <div className="cta-option-desc">Live session with a security architect. We review your specific pillar profile and recommend a starting architecture.</div>
              </a>
              <a className="cta-option" href={`mailto:strategy@instrek.com`} target="_blank" rel="noreferrer">
                <div className="cta-option-icon">✉️</div>
                <div className="cta-option-title">Request a Written Blueprint</div>
                <div className="cta-option-desc">Email us with your report score and we will respond with a written architecture blueprint.</div>
              </a>
            </div>
            <a className="cta-primary-btn" href="https://calendly.com/instrek/strategy" target="_blank" rel="noreferrer">Book My Strategy Call →</a>
          </div>
        </div>
      </div>

      {/* ── PRINT ONLY LAYOUT (Strict 2-page print document) ── */}
      <div className="print-layout">
        {/* PAGE 1 */}
        <div className="print-pdf-page">
          <div className="print-header">
            <div>
              <div className="print-logo-text">INSTREK TECHNOLOGIES</div>
              <div className="print-subtitle">AI Security assessment report</div>
            </div>
            <div style={{ textAlign: 'right', fontSize: '9px', color: '#64748B' }}>
              <div>CONFIDENTIAL</div>
              <div>Report Date: {dateStr}</div>
            </div>
          </div>

          <div style={{ marginBottom: '16px', fontSize: '11px', color: '#334155' }}>
            <strong>Prepared for:</strong> {lead.firstName} {lead.lastName} &nbsp;|&nbsp; <strong>Role:</strong> {lead.role} &nbsp;|&nbsp; <strong>Organisation:</strong> {lead.company || 'Not Specified'}
          </div>

          {/* Score Box */}
          <div className="print-score-card" style={{ '--tier-color': tier.cls === 'critical' ? '#EF4444' : tier.cls === 'moderate' ? '#F59E0B' : '#10B981' }}>
            <div>
              <div style={{ fontSize: '9px', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#64748B' }}>Composite Risk Score</div>
              <div className="print-score-num">{lead.riskScore}<span style={{ fontSize: '14px', fontWeight: '400', color: '#94A3B8' }}>/100</span></div>
            </div>
            <div>
              <div className="print-badge" style={{ marginBottom: '6px' }}>{tier.label}</div>
              <div className="print-gauge-track">
                <div className="print-gauge-fill" style={{ width: `${lead.riskScore}%` }}></div>
              </div>
            </div>
          </div>

          {/* Exec Summary */}
          <div className="print-section-title">01. Executive Summary</div>
          <p style={{ fontSize: '9.5px', color: '#475569', lineHeight: '1.45', marginBottom: '18px' }}>
            Based on your self-assessment, your organization is operating with significant unmanaged AI risk. The gap is not primarily technical - it is architectural. Your teams have access to AI tools that your governance framework was not designed for, your agents operate without dedicated identity, and your cryptographic infrastructure is unmapped for the post-quantum landscape. Immediate containment and private LLM deployments are recommended.
          </p>

          {/* Pillars */}
          <div className="print-section-title">02. Risk Pillar Analysis</div>
          
          <div className="print-pillar-card" style={{ '--pillar-color': p1.cls === 'critical' ? '#EF4444' : p1.cls === 'moderate' ? '#F59E0B' : '#10B981' }}>
            <div className="print-pillar-header">
              <span className="print-pillar-title">🔒 AI Sovereignty &amp; Data Leakage</span>
              <span className="print-pillar-badge">{p1.label} (Score: {lead.p1Score}/100)</span>
            </div>
            <p className="print-pillar-text">{getFindingText(p1Findings, lead.p1Score).substring(0, 240)}...</p>
            <div className="print-pillar-bar-bg">
              <div className="print-pillar-bar-fill" style={{ width: `${lead.p1Score}%` }}></div>
            </div>
          </div>

          <div className="print-pillar-card" style={{ '--pillar-color': p2.cls === 'critical' ? '#EF4444' : p2.cls === 'moderate' ? '#F59E0B' : '#10B981' }}>
            <div className="print-pillar-header">
              <span className="print-pillar-title">🤖 Agentic Accountability</span>
              <span className="print-pillar-badge">{p2.label} (Score: {lead.p2Score}/100)</span>
            </div>
            <p className="print-pillar-text">{getFindingText(p2Findings, lead.p2Score).substring(0, 240)}...</p>
            <div className="print-pillar-bar-bg">
              <div className="print-pillar-bar-fill" style={{ width: `${lead.p2Score}%` }}></div>
            </div>
          </div>

          <div className="print-pillar-card" style={{ '--pillar-color': p3.cls === 'critical' ? '#EF4444' : p3.cls === 'moderate' ? '#F59E0B' : '#10B981' }}>
            <div className="print-pillar-header">
              <span className="print-pillar-title">🛡️ Post-Quantum &amp; AI Cyber Defense</span>
              <span className="print-pillar-badge">{p3.label} (Score: {lead.p3Score}/100)</span>
            </div>
            <p className="print-pillar-text">{getFindingText(p3Findings, lead.p3Score).substring(0, 240)}...</p>
            <div className="print-pillar-bar-bg">
              <div className="print-pillar-bar-fill" style={{ width: `${lead.p3Score}%` }}></div>
            </div>
          </div>

          <div className="print-footer">
            <span>Instrek Technologies AI Security Report</span>
            <span>Page 1 of 2</span>
          </div>
        </div>

        {/* PAGE 2 */}
        <div className="print-pdf-page">
          <div className="print-header">
            <div>
              <div className="print-logo-text">INSTREK TECHNOLOGIES</div>
              <div className="print-subtitle">AI Security assessment report</div>
            </div>
            <div style={{ textAlign: 'right', fontSize: '9px', color: '#64748B' }}>
              <span>Page 2 of 2</span>
            </div>
          </div>

          {/* Benchmarks Table */}
          <div className="print-section-title">03. Peer intelligence &amp; Benchmarks</div>
          <table className="print-table">
            <thead>
              <tr>
                <th>Security Capability</th>
                <th>Peer Average</th>
                <th>Your Status</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>AI Acceptable Use Policy</strong></td>
                <td>41% have a formal policy</td>
                <td>{bmPolicy}</td>
              </tr>
              <tr>
                <td><strong>Private / On-Prem LLM</strong></td>
                <td>19% deployed VPC instance</td>
                <td>{bmLlm}</td>
              </tr>
              <tr>
                <td><strong>Agentic Identity Framework</strong></td>
                <td>11% operationalised identities</td>
                <td>{bmAgent}</td>
              </tr>
              <tr>
                <td><strong>PQC Readiness Assessment</strong></td>
                <td>18% completed inventory</td>
                <td>{bmPqc}</td>
              </tr>
            </tbody>
          </table>

          {/* Timeline Roadmap */}
          <div className="print-section-title">04. Remediation Roadmap (3 Horizons)</div>
          <div className="print-roadmap">
            <div className="print-roadmap-step" style={{ '--step-color': '#EF4444' }}>
              <div className="print-roadmap-time">Immediate (0 - 30 Days)</div>
              <div className="print-roadmap-desc">Contain the bleed: Run AI data flow audits and establish strict acceptable use policies.</div>
            </div>
            <div className="print-roadmap-step" style={{ '--step-color': '#F59E0B' }}>
              <div className="print-roadmap-time">Short-term (30 - 90 Days)</div>
              <div className="print-roadmap-desc">Build the foundation: Deploy private VPC LLM environments and setup scoped agent identity keys.</div>
            </div>
            <div className="print-roadmap-step" style={{ '--step-color': '#10B981' }}>
              <div className="print-roadmap-time">Strategic (90 Days - 12 Months)</div>
              <div className="print-roadmap-desc">Future-proof: Uplift security operations (SOC) with defensive AI and draft PQC crypto migration roadmaps.</div>
            </div>
          </div>

          {/* Minimised Next Action Card */}
          <div className="print-section-title">05. Next Action Plan</div>
          <div className="print-cta-card">
            <div className="print-cta-left">
              <div className="print-cta-title">This assessment surfaces critical risks. A conversation closes them.</div>
              <div className="print-cta-desc">
                Review your results with an Instrek Security Architect. We will outline a concrete, actionable starting blueprint tailored to your stack.
              </div>
            </div>
             <div className="print-cta-right">
              <div>Schedule strategy session:</div>
              <div>
                <a href="https://calendly.com/instrek/strategy" target="_blank" rel="noreferrer" style={{ color: '#10B981', textDecoration: 'underline' }}>
                  calendly.com/instrek/strategy
                </a>
              </div>
              <div style={{ marginTop: '2px' }}>
                <a href="mailto:strategy@instrek.com" style={{ color: '#64748B', textDecoration: 'none' }}>
                  Email: strategy@instrek.com
                </a>
              </div>
            </div>
          </div>

          <div className="print-footer">
            <span>Instrek Technologies Ltd. &copy; 2026. Governed by DPDP Act & GDPR compliance.</span>
            <span>Page 2 of 2</span>
          </div>
        </div>
      </div>

    </div>
  );
};

export default ReportView;
