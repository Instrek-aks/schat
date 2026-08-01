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
        .report-root-container {
          --ink:        #0D1117;
          --ink2:       #1C2631;
          --paper:      #F7F4EF;
          --paper2:     #EDE9E2;
          --paper3:     #E2DDD5;
          --green:      #0B6E4F;
          --green-mid:  #12A372;
          --green-hi:   #00D68F;
          --green-pale: #E8F7F1;
          --red:        #C0392B;
          --red-pale:   #FCF0EE;
          --amber:      #B45309;
          --amber-pale: #FEF5E7;
          --muted:      #6B7C8D;
          --rule:       #D5CECC;
          --serif:      'Poppins', sans-serif;
          --sans:       'Poppins', sans-serif;
          --mono:       'Poppins', sans-serif;

          background: var(--paper);
          color: var(--ink);
          font-family: var(--sans);
          font-size: 15px;
          line-height: 1.7;
          text-align: left;
          min-height: 100vh;
          padding-bottom: 80px;
          overflow-x: hidden;
        }

        .report-root-container *, 
        .report-root-container *::before, 
        .report-root-container *::after { 
          box-sizing: border-box; 
        }

        .page-wrap { max-width: 780px; margin: 0 auto; padding: 0 28px 80px; }

        .cover {
          background: var(--ink);
          position: relative; overflow: hidden;
          padding: 64px 48px 56px;
          margin-bottom: 0;
        }
        .cover::before {
          content: '';
          position: absolute; inset: 0;
          background:
            radial-gradient(ellipse 60% 80% at 95% 10%, rgba(0,214,143,0.12) 0%, transparent 60%),
            radial-gradient(ellipse 40% 60% at 10% 90%, rgba(192,57,43,0.08) 0%, transparent 50%);
          pointer-events: none;
        }
        .cover-grid {
          position: absolute; inset: 0; opacity: 0.04;
          background-image: linear-gradient(rgba(255,255,255,0.3) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(255,255,255,0.3) 1px, transparent 1px);
          background-size: 40px 40px;
        }
        .cover-content { position: relative; z-index: 1; }

        .cover-logo { display: flex; align-items: center; gap: 12px; margin-bottom: 48px; }
        .cover-logo-mark {
          width: 52px; height: 52px; border: 1.5px solid rgba(0,214,143,0.5);
          display: flex; align-items: center; justify-content: center;
          font-family: var(--mono); font-size: 14px; color: var(--green-hi); font-weight: 500;
        }
        .cover-logo-text { font-family: var(--mono); font-size: 13px; color: rgba(255,255,255,0.5); letter-spacing: 0.15em; text-transform: uppercase; }

        .cover-eyebrow { font-family: var(--mono); font-size: 11px; color: var(--green-hi); letter-spacing: 0.12em; text-transform: uppercase; margin-bottom: 16px; }

        .cover-headline {
          font-family: var(--serif); 
          font-size: clamp(26px, 6vw, 44px); 
          font-weight: 700; 
          line-height: 1.15;
          color: #fff; margin-bottom: 20px; max-width: 560px;
        }
        .cover-headline em { font-style: italic; color: var(--green-hi); }

        .cover-sub { 
          font-size: clamp(14px, 2.5vw, 15px); 
          color: rgba(255,255,255,0.55); 
          line-height: 1.7; 
          max-width: 480px; 
          margin-bottom: 40px; 
        }

        .cover-meta { display: flex; gap: 32px; flex-wrap: wrap; }
        .cover-meta-label { font-family: var(--mono); font-size: 10px; color: rgba(255,255,255,0.3); letter-spacing: 0.1em; text-transform: uppercase; margin-bottom: 4px; }
        .cover-meta-val { font-size: 14px; color: rgba(255,255,255,0.75); font-weight: 500; }

        .score-band {
          background: var(--ink2);
          padding: 32px 48px;
          display: grid; grid-template-columns: auto 1fr auto;
          gap: 48px; align-items: center;
          margin-bottom: 0;
        }
        .score-main { text-align: center; }
        .score-num { 
          font-family: var(--serif); 
          font-size: clamp(48px, 9vw, 72px); 
          font-weight: 700; 
          line-height: 1; 
        }
        .score-num.critical { color: #FF6B6B; }
        .score-num.moderate { color: #FFB830; }
        .score-num.strong   { color: var(--green-hi); }
        .score-label { font-family: var(--mono); font-size: 11px; color: rgba(255,255,255,0.4); letter-spacing: 0.1em; text-transform: uppercase; margin-top: 6px; }

        .score-gauge { flex: 1; }
        .gauge-track { height: 8px; background: rgba(255,255,255,0.08); border-radius: 4px; margin-bottom: 6px; }
        .gauge-fill { height: 8px; border-radius: 4px; background: linear-gradient(90deg, var(--green-hi) 0%, #FFB830 55%, #FF6B6B 100%); transition: width 1.2s cubic-bezier(0.4,0,0.2,1); }
        .gauge-labels { display: flex; justify-content: space-between; font-family: var(--mono); font-size: 10px; color: rgba(255,255,255,0.25); }

        .score-tier { text-align: right; }
        .tier-badge {
          display: inline-block; padding: 6px 16px; border-radius: 2px;
          font-family: var(--mono); font-size: 12px; font-weight: 500; letter-spacing: 0.06em;
          text-transform: uppercase; margin-bottom: 8px;
        }
        .tier-badge.critical { background: rgba(192,57,43,0.25); color: #FF6B6B; border: 1px solid rgba(255,107,107,0.3); }
        .tier-badge.moderate { background: rgba(180,83,9,0.25); color: #FFB830; border: 1px solid rgba(255,184,48,0.3); }
        .tier-badge.strong   { background: rgba(11,110,79,0.25); color: var(--green-hi); border: 1px solid rgba(0,214,143,0.3); }
        .tier-desc { font-size: 13px; color: rgba(255,255,255,0.45); }

        .paper-section { padding: 52px 48px; border-bottom: 1px solid var(--rule); }
        .paper-section:last-child { border-bottom: none; }

        .section-eyebrow {
          font-family: var(--mono); font-size: 10px; color: var(--green-mid);
          letter-spacing: 0.15em; text-transform: uppercase; margin-bottom: 12px;
          display: flex; align-items: center; gap: 10px;
        }
        .section-eyebrow::after { content: ''; flex: 1; height: 1px; background: var(--paper3); }

        .section-title { 
          font-family: var(--serif); 
          font-size: clamp(20px, 4.5vw, 30px); 
          font-weight: 600; margin-bottom: 16px; line-height: 1.25; color: var(--ink); 
        }
        .section-body { color: var(--muted); line-height: 1.8; margin-bottom: 24px; font-size: 15px; }

        .pillar-stack { display: flex; flex-direction: column; gap: 1px; background: var(--rule); border: 1px solid var(--rule); }
        .pillar-row {
          background: var(--paper); display: grid;
          grid-template-columns: 4px 1fr;
          gap: 0;
        }
        .pillar-accent { width: 4px; }
        .pillar-accent.critical { background: var(--red); }
        .pillar-accent.moderate { background: var(--amber); }
        .pillar-accent.strong   { background: var(--green); }

        .pillar-body { padding: 24px 28px; }
        .pillar-header { display: flex; align-items: flex-start; justify-content: space-between; gap: 16px; margin-bottom: 12px; flex-wrap: wrap; }
        .pillar-name { font-family: var(--serif); font-size: 19px; font-weight: 600; color: var(--ink); }
        .pillar-tag { font-family: var(--mono); font-size: 11px; padding: 3px 10px; border-radius: 2px; white-space: nowrap; }
        .pillar-tag.critical { background: var(--red-pale); color: var(--red); }
        .pillar-tag.moderate { background: var(--amber-pale); color: var(--amber); }
        .pillar-tag.strong   { background: var(--green-pale); color: var(--green); }

        .pillar-fear {
          font-size: 13px; font-style: italic; color: var(--muted);
          border-left: 2px solid var(--rule); padding-left: 14px; margin-bottom: 14px;
          line-height: 1.6;
        }
        .pillar-finding { font-size: 14px; color: var(--ink); line-height: 1.7; margin-bottom: 14px; }

        .pillar-score-row { display: flex; align-items: center; gap: 12px; }
        .pillar-score-bar-bg { flex: 1; height: 5px; background: var(--paper3); border-radius: 3px; }
        .pillar-score-bar { height: 5px; border-radius: 3px; }
        .pillar-score-bar.critical { background: var(--red); }
        .pillar-score-bar.moderate { background: var(--amber); }
        .pillar-score-bar.strong   { background: var(--green); }
        .pillar-score-num { font-family: var(--mono); font-size: 12px; font-weight: 500; min-width: 28px; text-align: right; }
        .pillar-score-num.critical { color: var(--red); }
        .pillar-score-num.moderate { color: var(--amber); }
        .pillar-score-num.strong   { color: var(--green); }

        .impact-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1px; background: var(--rule); border: 1px solid var(--rule); margin-bottom: 32px; }
        .impact-cell { background: var(--paper); padding: 24px; }
        .impact-cell:nth-child(1) { background: var(--ink); color: #fff; }
        .impact-num { font-family: var(--serif); font-size: 36px; font-weight: 700; color: var(--green-hi); }
        .impact-label { font-size: 13px; color: rgba(255,255,255,0.55); margin-top: 4px; }
        .impact-stat-label { font-size: 12px; font-weight: 600; color: var(--ink); margin-bottom: 4px; text-transform: uppercase; letter-spacing: 0.05em; font-family: var(--mono); }
        .impact-stat-val { font-size: 14px; color: var(--muted); line-height: 1.6; }

        .roadmap { display: flex; flex-direction: column; gap: 0; position: relative; }
        .roadmap::before {
          content: ''; position: absolute; left: 19px; top: 8px; bottom: 8px;
          width: 2px; background: var(--rule);
        }
        .roadmap-step { display: grid; grid-template-columns: 40px 1fr; gap: 20px; padding: 0 0 32px; position: relative; }
        .roadmap-step:last-child { padding-bottom: 0; }
        .step-dot {
          width: 40px; height: 40px; border-radius: 50%;
          border: 2px solid var(--rule); background: var(--paper);
          display: flex; align-items: center; justify-content: center;
          font-family: var(--mono); font-size: 12px; font-weight: 500; color: var(--muted);
          flex-shrink: 0; position: relative; z-index: 1;
        }
        .step-dot.now { border-color: var(--red); color: var(--red); background: var(--red-pale); }
        .step-dot.soon { border-color: var(--amber); color: var(--amber); background: var(--amber-pale); }
        .step-dot.plan { border-color: var(--green); color: var(--green); background: var(--green-pale); }
        .step-content { padding-top: 8px; }
        .step-horizon { font-family: var(--mono); font-size: 10px; letter-spacing: 0.1em; text-transform: uppercase; margin-bottom: 4px; }
        .step-horizon.now  { color: var(--red); }
        .step-horizon.soon { color: var(--amber); }
        .step-horizon.plan { color: var(--green); }
        .step-title { font-family: var(--serif); font-size: 17px; font-weight: 600; margin-bottom: 8px; color: var(--ink); }
        .step-desc { font-size: 14px; color: var(--muted); line-height: 1.7; margin-bottom: 10px; }
        .step-services { display: flex; flex-wrap: wrap; gap: 6px; }
        .step-chip { font-family: var(--mono); font-size: 11px; padding: 3px 10px; background: var(--paper2); border: 1px solid var(--paper3); color: var(--muted); border-radius: 2px; }

        .table-responsive {
          width: 100%;
          overflow-x: auto;
          -webkit-overflow-scrolling: touch;
          margin-bottom: 28px;
          border: 1px solid var(--rule);
        }
        .benchmark-table { width: 100%; border-collapse: collapse; margin-bottom: 0; min-width: 580px; }
        .benchmark-table th { background: var(--ink); color: rgba(255,255,255,0.6); font-family: var(--mono); font-size: 11px; letter-spacing: 0.08em; text-transform: uppercase; padding: 14px 16px; text-align: left; font-weight: 400; }
        .benchmark-table td { padding: 14px 16px; border-bottom: 1px solid var(--rule); font-size: 14px; vertical-align: middle; color: var(--ink); }
        .benchmark-table tr:last-child td { border-bottom: none; }
        .benchmark-table tr:nth-child(even) td { background: var(--paper2); }
        .bm-bar-bg { width: 100%; height: 4px; background: var(--paper3); border-radius: 2px; margin-top: 6px; }
        .bm-bar { height: 4px; border-radius: 2px; }

        .intel-cards { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
        .intel-card { border: 1px solid var(--rule); padding: 20px; background: var(--paper); }
        .intel-card-label { font-family: var(--mono); font-size: 10px; color: var(--muted); letter-spacing: 0.1em; text-transform: uppercase; margin-bottom: 10px; }
        .intel-card-stat { font-family: var(--serif); font-size: 28px; font-weight: 600; color: var(--ink); margin-bottom: 4px; }
        .intel-card-desc { font-size: 13px; color: var(--muted); line-height: 1.6; }

        .cta-block {
          background: var(--ink);
          padding: 52px 48px;
          position: relative; overflow: hidden;
        }
        .cta-block::before {
          content: '';
          position: absolute; top: -80px; right: -80px;
          width: 320px; height: 320px; border-radius: 50%;
          background: radial-gradient(circle, rgba(0,214,143,0.1) 0%, transparent 70%);
          pointer-events: none;
        }
        .cta-label { font-family: var(--mono); font-size: 11px; color: var(--green-hi); letter-spacing: 0.12em; text-transform: uppercase; margin-bottom: 16px; }
        .cta-headline { 
          font-family: var(--serif); 
          font-size: clamp(22px, 5vw, 34px); 
          font-weight: 700; color: #fff; line-height: 1.2; margin-bottom: 16px; 
        }
        .cta-headline em { font-style: italic; color: var(--green-hi); }
        .cta-sub { font-size: 15px; color: rgba(255,255,255,0.5); line-height: 1.7; margin-bottom: 36px; max-width: 500px; }

        .cta-options { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 36px; }
        .cta-option {
          border: 1px solid rgba(255,255,255,0.12); padding: 20px;
          cursor: pointer; transition: border-color 0.2s, background 0.2s;
          text-decoration: none;
          display: block;
        }
        .cta-option:hover { border-color: var(--green-hi); background: rgba(0,214,143,0.05); }
        .cta-option-icon { font-size: 20px; margin-bottom: 10px; }
        .cta-option-title { font-size: 14px; font-weight: 600; color: #fff; margin-bottom: 4px; }
        .cta-option-desc { font-size: 12px; color: rgba(255,255,255,0.4); line-height: 1.5; }

        .cta-primary-btn {
          display: inline-block; padding: 16px 36px;
          background: var(--green-hi); color: var(--ink);
          font-family: var(--mono); font-size: 13px; font-weight: 500; letter-spacing: 0.06em;
          text-transform: uppercase; text-decoration: none; cursor: pointer;
          border: none; transition: opacity 0.15s, transform 0.15s;
        }
        .cta-primary-btn:hover { opacity: 0.88; transform: translateY(-1px); }

        .cta-urgency {
          margin-top: 24px; padding: 14px 20px;
          border-left: 3px solid rgba(255,107,107,0.5);
          background: rgba(192,57,43,0.08);
          text-align: left;
        }
        .cta-urgency-text { font-size: 13px; color: rgba(255,107,107,0.85); line-height: 1.6; }

        .expect-steps { display: grid; grid-template-columns: repeat(3,1fr); gap: 1px; background: var(--rule); border: 1px solid var(--rule); margin-bottom: 32px; }
        .expect-step { background: var(--paper); padding: 24px 20px; }
        .expect-num { font-family: var(--mono); font-size: 28px; font-weight: 500; color: var(--green-mid); margin-bottom: 10px; }
        .expect-title { font-size: 14px; font-weight: 600; margin-bottom: 6px; color: var(--ink); }
        .expect-desc { font-size: 13px; color: var(--muted); line-height: 1.6; }

        .report-footer {
          background: var(--ink2);
          padding: 32px 48px;
          display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 16px;
        }
        .footer-brand { font-family: var(--mono); font-size: 13px; color: rgba(255,255,255,0.35); }
        .footer-links { display: flex; gap: 24px; }
        .footer-link { font-size: 13px; color: rgba(255,255,255,0.35); text-decoration: none; }
        .footer-link:hover { color: var(--green-hi); }
        .footer-disclaimer { font-size: 11px; color: rgba(255,255,255,0.2); margin-top: 12px; width: 100%; text-align: justify; }

        .pull-quote {
          border-left: 4px solid var(--green-mid); padding: 20px 28px;
          background: var(--green-pale); margin: 28px 0;
        }
        .pull-quote-text { font-family: var(--serif); font-size: 18px; font-style: italic; color: var(--ink); line-height: 1.55; margin-bottom: 8px; }
        .pull-quote-source { font-family: var(--mono); font-size: 11px; color: var(--muted); letter-spacing: 0.08em; }

        .highlight-box { background: var(--paper2); border: 1px solid var(--paper3); padding: 20px 24px; margin: 20px 0; }
        .highlight-box-title { font-family: var(--mono); font-size: 11px; color: var(--green); letter-spacing: 0.1em; text-transform: uppercase; margin-bottom: 8px; }
        .highlight-box-body { font-size: 14px; color: var(--ink); line-height: 1.7; }

        @media (max-width: 768px) {
          .cover { padding: 48px 24px 40px; }
          .cover-meta { gap: 20px 24px; }
          .score-band {
            grid-template-columns: 1fr;
            gap: 28px;
            padding: 32px 24px;
            text-align: center;
          }
          .score-tier {
            text-align: center;
            margin-top: 8px;
          }
          .paper-section { padding: 36px 20px; }
          .page-wrap { padding: 0 0 40px; }
          .pillar-row {
            grid-template-columns: 4px 1fr;
          }
          .pillar-body { padding: 20px 18px; }
          .pillar-header { flex-direction: column; align-items: flex-start; gap: 8px; }
          .pillar-tag { align-self: flex-start; }
          .impact-grid { grid-template-columns: 1fr; }
          .intel-cards { grid-template-columns: 1fr; gap: 16px; }
          .cta-block { padding: 40px 24px; }
          .cta-options { grid-template-columns: 1fr; gap: 16px; }
          .expect-steps { grid-template-columns: 1fr; }
          .expect-step { padding: 20px; }
          .report-footer { padding: 28px 24px; flex-direction: column; align-items: flex-start; gap: 24px; }
          .footer-links { width: 100%; flex-wrap: wrap; gap: 16px 24px; }
        }

        @media (max-width: 480px) {
          .cover { padding: 36px 16px 32px; }
          .cover-logo { margin-bottom: 32px; }
          .cover-meta { flex-direction: column; gap: 16px; }
          .score-band { padding: 28px 16px; gap: 20px; }
          .paper-section { padding: 28px 12px; }
          .pillar-body { padding: 16px 12px; }
          .pillar-name { font-size: 17px; }
          .pillar-fear { padding-left: 10px; margin-bottom: 12px; }
          .intel-card { padding: 16px; }
          .cta-block { padding: 32px 16px; }
          .cta-primary-btn { width: 100%; text-align: center; padding: 16px 20px; }
          .roadmap-step { gap: 12px; }
          .step-content { padding-top: 4px; }
          .highlight-box { padding: 16px; margin: 16px 0; }
        }
      `}</style>

      {/* ── COVER ── */}
      <div className="cover">
        <div className="cover-grid"></div>
        <div className="cover-content">
          <div className="cover-logo">
            <div className="cover-logo-mark">
              <img src="/log.png" alt="Instrek Technology Logo" style={{ width: '100%', height: '100%', objectFit: 'contain', padding: '4px' }} />
            </div>
            <div className="cover-logo-text">Instrek Technology</div>
          </div>
          <div className="cover-eyebrow">Confidential Risk Assessment Report</div>
          <h1 className="cover-headline">Your organisation carries <em>three open wounds</em> that your AI roadmap hasn't closed.</h1>
          <p className="cover-sub">This report maps your organization's AI security exposure across the three pillars that regulators, auditors, and adversaries are already prioritising. It is based on your responses to the Instrek Technology risk scan.</p>
          
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
        <div className="score-main">
          <div className={`score-num ${tier.cls}`}>{lead.riskScore}</div>
          <div className="score-label">Risk Score</div>
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
          <div className="tier-desc">{tier.desc}</div>
        </div>
      </div>

      {!isFromEmail && (
        <div className="page-wrap" style={{ marginTop: '20px', marginBottom: '40px', padding: '0 20px' }}>
          <div style={{ padding: '24px', background: 'rgba(0, 214, 143, 0.08)', border: '1px dashed rgba(0, 214, 143, 0.25)', borderRadius: '12px', textAlign: 'center' }}>
            <p style={{ margin: 0, fontSize: '15px', color: '#00FFA3', fontWeight: 'bold' }}>
              📧 We have sent the full board-ready Instrek Technology Risk Report to your email: {lead.email}
            </p>
            <p style={{ margin: '8px 0 0 0', fontSize: '13.5px', color: 'rgba(255,255,255,0.7)', lineHeight: '1.5' }}>
              Please check your inbox (including spam folder) and click the link to view the complete detailed analysis, cryptographic audit maps, compliance readiness levels, and custom remediation roadmaps.
            </p>
          </div>
        </div>
      )}

      {isFromEmail && (
        <>
          {/* ── SECTION 1 - EXECUTIVE SUMMARY ── */}
          <div className="paper-section">
        <div className="page-wrap" style={{ paddingBottom: 0 }}>
          <div className="section-eyebrow">01 - Executive Summary</div>
          <h2 className="section-title">The situation your board will ask about next quarter.</h2>
          <p className="section-body">Based on your self-assessment, your organization is operating with significant unmanaged AI risk. The gap is not primarily technical - it is architectural. Your teams have access to AI tools that your governance framework was not designed for, your agents operate without the identity and auditability of a regulated employee, and your cryptographic infrastructure is built for a threat landscape that has already shifted.</p>
          <p className="section-body">This is not a future risk. It is a present condition. The DPDP Act has given Indian regulators a mechanism to act. The NIST PQC standards have given your auditors a framework to measure against. And the velocity of agentic AI adoption in organizations means that every week without governance is a week of compounding exposure.</p>

          <div className="pull-quote">
            <div className="pull-quote-text">"The organisations that define AI governance frameworks now will not just avoid the next breach. They will win the talent, the client trust, and the regulatory goodwill that defines who leads in the next decade of enterprise AI."</div>
            <div className="pull-quote-source">- Instrek Technology Research, April 2026</div>
          </div>

          <div className="impact-grid">
            <div className="impact-cell">
              <div className="impact-num">{lead.riskScore}</div>
              <div className="impact-label" style={{ color: 'rgba(255,255,255,0.45)' }}>Your composite risk score out of 100. Above 70 indicates critical exposure requiring immediate architectural intervention.</div>
            </div>
            <div className="impact-cell">
              <div className="impact-stat-label">Highest risk pillar</div>
              <div className="impact-stat-val">{topPillar} - score {Math.max(lead.p1Score, lead.p2Score, lead.p3Score)}/100. This is where your first 30 days of remediation should be focused.</div>
            </div>
            <div className="impact-cell">
              <div className="impact-stat-label">Regulatory exposure</div>
              <div className="impact-stat-val">DPDP Act enforcement is active. Your current AI data flow posture may not withstand regulatory scrutiny without documented controls.</div>
            </div>
            <div className="impact-cell">
              <div className="impact-stat-label">Peer context</div>
              <div className="impact-stat-val">73% of organizations at your AI deployment stage have not completed a formal AI governance architecture. You are in the majority - and that is the risk.</div>
            </div>
          </div>
        </div>
      </div>

      {/* ── SECTION 2 - THREE PILLARS ── */}
      <div className="paper-section">
        <div className="page-wrap" style={{ paddingBottom: 0 }}>
          <div className="section-eyebrow">02 - Risk Pillar Breakdown</div>
          <h2 className="section-title">Where your exposure lives - and what it costs if unaddressed.</h2>
          <p className="section-body">Your risk profile is mapped across the three AI security pillars that matter most to executives in 2026. Each pillar below reflects your specific answers, the gap they reveal, and the architectural response that closes it.</p>

          <div className="pillar-stack">
            {/* PILLAR 1 — AI SOVEREIGNTY */}
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
                  <div className="highlight-box-body">A Private LLM deployment on your VPC or on-premise gives your developers full GenAI capability with zero data leaving your perimeter. Combined with a Secure RAG architecture, your proprietary codebases and internal documents become the model's knowledge base - not a training leak. DPDP-compliant data flow mapping ensures every AI interaction is auditable and defensible to regulators.</div>
                </div>
              </div>
            </div>

            {/* PILLAR 2 — AGENTIC */}
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
                  <div className="highlight-box-body">Treating AI agents as non-human employees - with their own credentials, scoped permissions, and immutable audit trails - converts an invisible risk into a manageable one. Human-in-the-loop (HITL) checkpoints at financial, security, and data-write actions ensure no agent can exceed a defined blast radius without human approval. An AI Governance framework gives your board a risk register entry with an owner.</div>
                </div>
              </div>
            </div>

            {/* PILLAR 3 — POST-QUANTUM */}
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
                  <div className="highlight-box-body">A proactive, self-healing SOC uses AI to detect and auto-remediate threats before they reach human escalation - matching adversarial AI velocity with defensive AI velocity. A Post-Quantum Cryptography readiness assessment maps every RSA and ECC dependency in your environment and produces a NIST PQC-aligned migration roadmap. The organisations that start this migration now will complete it before the quantum threat is realised. Those that wait will not.</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── SECTION 3 - REMEDIATION ROADMAP ── */}
      <div className="paper-section" style={{ background: 'var(--paper2)' }}>
        <div className="page-wrap" style={{ paddingBottom: 0 }}>
          <div className="section-eyebrow">03 - Remediation Roadmap</div>
          <h2 className="section-title">Three horizons. One coherent architecture.</h2>
          <p className="section-body">Based on your risk profile, we recommend a structured remediation across three time horizons. This is not a linear checklist - these tracks run in parallel, governed by a single AI Security architecture that prevents the point-solution sprawl that most organizations fall into.</p>

          <div className="roadmap">
            <div className="roadmap-step">
              <div className="step-dot now">30d</div>
              <div className="step-content">
                <div className="step-horizon now">Immediate - 0 to 30 days</div>
                <div className="step-title">Contain the bleed: AI data flow audit + shadow AI policy</div>
                <div className="step-desc">Before any architecture change, you need to know what you are dealing with. A rapid AI data flow audit maps every external LLM API call being made by your teams - including shadow usage. Simultaneously, a published AI acceptable-use policy with enforcement creates a defensible posture for regulators while architectural controls are being built.</div>
                <div className="step-services">
                  <span className="step-chip">AI Data Flow Audit</span>
                  <span className="step-chip">Shadow AI Detection</span>
                  <span className="step-chip">Acceptable Use Policy</span>
                  <span className="step-chip">DPDP Gap Assessment</span>
                </div>
              </div>
            </div>

            <div className="roadmap-step">
              <div className="step-dot soon">90d</div>
              <div className="step-content">
                <div className="step-horizon soon">Short-term - 30 to 90 days</div>
                <div className="step-title">Build the foundation: Private LLM + Agentic Identity</div>
                <div className="step-desc">Deploy a Private LLM environment in your VPC or on-premise - with Secure RAG indexing your internal knowledge bases. In parallel, implement agentic identity management - assigning non-human credentials, scoped access controls, and HITL audit checkpoints to every AI agent operating in production. This closes the two highest-velocity risk vectors simultaneously.</div>
                <div className="step-services">
                  <span className="step-chip">Private LLM Deployment</span>
                  <span className="step-chip">Secure RAG Architecture</span>
                  <span className="step-chip">Agentic Identity Framework</span>
                  <span className="step-chip">HITL Audit Trails</span>
                </div>
              </div>
            </div>

            <div className="roadmap-step">
              <div className="step-dot plan">12m</div>
              <div className="step-content">
                <div className="step-horizon plan">Strategic - 90 days to 12 months</div>
                <div className="step-title">Future-proof: SOC AI uplift + PQC migration roadmap</div>
                <div className="step-desc">With the immediate risks contained, the strategic horizon is about asymmetric capability. An AI-powered self-healing SOC shifts your security posture from reactive to proactive. A Post-Quantum Cryptography readiness assessment produces the migration roadmap your board will need - beginning the transition from RSA/ECC to NIST PQC-approved algorithms across your infrastructure before the regulatory mandate arrives.</div>
                <div className="step-services">
                  <span className="step-chip">AI-Powered SOC</span>
                  <span className="step-chip">Self-Healing Infrastructure</span>
                  <span className="step-chip">PQC Readiness Assessment</span>
                  <span className="step-chip">Crypto-Agile Migration</span>
                  <span className="step-chip">NIST PQC Roadmap</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── SECTION 4 - PEER BENCHMARKS ── */}
      <div className="paper-section">
        <div className="page-wrap" style={{ paddingBottom: 0 }}>
          <div className="section-eyebrow">04 - Peer Intelligence</div>
          <h2 className="section-title">Where executives at your level actually stand.</h2>
          <p className="section-body">These benchmarks are drawn from Instrek Technology's assessment data across 340 organisations scanned in Q1 2026. They give you an objective read on how your posture compares - and where the largest competitive differentiation opportunity sits.</p>

          <div className="intel-cards" style={{ marginBottom: '28px' }}>
            <div className="intel-card">
              <div className="intel-card-label">Organizations with formal AI governance</div>
              <div className="intel-card-stat">27%</div>
              <div className="intel-card-desc">Only 1 in 4 organizations has a documented AI governance framework with an assigned owner. The other 73% rely on informal policies that would not survive an audit.</div>
            </div>
            <div className="intel-card">
              <div className="intel-card-label">Organizations with agentic identity mgmt</div>
              <div className="intel-card-stat">11%</div>
              <div className="intel-card-desc">Fewer than 1 in 10 organizations deploying AI agents has implemented dedicated agent credentials. The rest operate with agents inheriting human access - invisible to audit systems.</div>
            </div>
            <div className="intel-card">
              <div className="intel-card-label">Organizations that have started PQC planning</div>
              <div className="intel-card-stat">18%</div>
              <div className="intel-card-desc">Post-quantum migration is a multi-year programme. The 18% that started in 2025-26 will complete ahead of the regulatory mandate. The majority will not.</div>
            </div>
            <div className="intel-card">
              <div className="intel-card-label">Avg time to detect shadow AI usage</div>
              <div className="intel-card-stat">94 days</div>
              <div className="intel-card-desc">The median organization takes over 90 days to detect that developers have introduced an unauthorised AI tool. In that window, the IP damage is already done.</div>
            </div>
          </div>

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
                  <td><div className="bm-bar-bg"><div className="bm-bar" style={{ width: '41%', background: 'var(--amber)' }}></div></div></td>
                </tr>
                <tr>
                  <td><strong>Private / On-Prem LLM</strong></td>
                  <td>19% deployed</td>
                  <td>{bmLlm}</td>
                  <td><div className="bm-bar-bg"><div className="bm-bar" style={{ width: '19%', background: 'var(--red)' }}></div></div></td>
                </tr>
                <tr>
                  <td><strong>Agentic Identity Framework</strong></td>
                  <td>11% operational</td>
                  <td>{bmAgent}</td>
                  <td><div className="bm-bar-bg"><div className="bm-bar" style={{ width: '11%', background: 'var(--red)' }}></div></div></td>
                </tr>
                <tr>
                  <td><strong>PQC Readiness Assessment</strong></td>
                  <td>18% completed</td>
                  <td>{bmPqc}</td>
                  <td><div className="bm-bar-bg"><div className="bm-bar" style={{ width: '18%', background: 'var(--red)' }}></div></div></td>
                </tr>
                <tr>
                  <td><strong>AI-Powered SOC</strong></td>
                  <td>33% deployed or piloting</td>
                  <td>Likely not yet - majority position</td>
                  <td><div className="bm-bar-bg"><div className="bm-bar" style={{ width: '33%', background: 'var(--amber)' }}></div></div></td>
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
          <p className="cta-sub">Our security architects review a maximum of 8 new organisations per month. A 30-minute strategy call is not a sales call - it is a working session where we map your specific architecture against your highest-priority pillar and give you a concrete, actionable starting point. No commitment required.</p>

          <div className="cta-options">
            <a className="cta-option" href="https://calendly.com/instrek/strategy" target="_blank" rel="noreferrer">
              <div className="cta-option-icon">📅</div>
              <div className="cta-option-title">Book a 30-min Strategy Call</div>
              <div className="cta-option-desc">Live session with a security architect. We review your specific pillar profile and recommend a starting architecture. This week's slots are filling.</div>
            </a>
            <a className="cta-option" href={`mailto:strategy@instrek.com?subject=Instrek Technology Risk Report - Architecture Review Request for ${encodeURIComponent(lead.company || '')}`} target="_blank" rel="noreferrer">
              <div className="cta-option-icon">✉️</div>
              <div className="cta-option-title">Request a Written Architecture Blueprint</div>
              <div className="cta-option-desc">Prefer async? Email us with your report score and we will respond within 24 hours with a written architecture recommendation tailored to your organization size and sector.</div>
            </a>
            <a className="cta-option" href="#" onClick={(e) => { e.preventDefault(); alert("Preparing framework download..."); }}>
              <div className="cta-option-icon">📄</div>
              <div className="cta-option-title">Download the Full AI Risk Framework</div>
              <div className="cta-option-desc">Our 40-page technical framework covers all three pillars with architecture diagrams, vendor evaluation criteria, and implementation checklists for each.</div>
            </a>
            <a className="cta-option" href="#" onClick={(e) => { e.preventDefault(); alert("Report link copied to clipboard! Share it with your team."); navigator.clipboard.writeText(window.location.href); }}>
              <div className="cta-option-icon">👥</div>
              <div className="cta-option-title">Share This Report With Your Team</div>
              <div className="cta-option-desc">Forward this report link to your CISO, CTO, or technology head. A shared risk view accelerates internal alignment and shortens the path to a governance decision.</div>
            </a>
          </div>

          <a className="cta-primary-btn" href="https://calendly.com/instrek/strategy" target="_blank" rel="noreferrer">Book My Strategy Call →</a>

          <div className="cta-urgency">
            <div className="cta-urgency-text">⚠️ We reviewed 340 risk profiles in Q1 2026. The organisations that acted on their highest-risk pillar within 30 days of assessment reduced their measured exposure by an average of 61%. The ones that filed this report and moved on did not. The window to act before your next board AI risk review is now.</div>
          </div>

          <div className="expect-steps" style={{ marginTop: '40px' }}>
            <div className="expect-step">
              <div className="expect-num">01</div>
              <div className="expect-title">You book the call</div>
              <div className="expect-desc">A 30-minute slot with a security architect. Bring your biggest question. We bring the answers.</div>
            </div>
            <div className="expect-step">
              <div className="expect-num">02</div>
              <div className="expect-title">We map your architecture</div>
              <div className="expect-desc">We review your risk profile, your current stack, and your timeline. You leave with a concrete starting point - not a pitch deck.</div>
            </div>
            <div className="expect-step">
              <div className="expect-num">03</div>
              <div className="expect-title">You decide what happens next</div>
              <div className="expect-desc">If there is a fit, we scope a pilot engagement. If there is not, we will tell you honestly and point you to the right resource.</div>
            </div>
          </div>
        </div>
      </div>

          {/* ── FOOTER ── */}
          <div className="report-footer">
            <div className="footer-brand">Instrek Technology - AI Security</div>
            <div className="footer-links">
              <a className="footer-link" href="mailto:strategy@instrek.com">strategy@instrek.com</a>
              <a className="footer-link" href="#" onClick={(e) => e.preventDefault()}>instrek.com</a>
              <a className="footer-link" href="#" onClick={(e) => e.preventDefault()}>Privacy Policy</a>
            </div>
            <div className="footer-disclaimer">This report is based on self-reported data from the Instrek Technology risk assessment. It is intended as a strategic orientation tool and does not constitute a formal security audit. Risk scores are indicative and derived from heuristic models calibrated against peer data. Instrek Technology accepts no liability for decisions made solely on the basis of this report without further technical due diligence.</div>
          </div>
        </>
      )}
    </div>
  );
};

export default ReportView;
