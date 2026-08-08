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
        .print-only-wrapper {
          display: none;
        }

        @media print {
          .report-root-container > :not(.print-only-wrapper) {
            display: none !important;
          }
          .print-only-wrapper {
            display: block !important;
          }
          @page {
            size: A4 portrait;
            margin: 0;
          }
          html, body {
            background: #FFFFFF !important;
            color: #0F172A !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            margin: 0 !important;
            padding: 0 !important;
            font-family: 'Inter', system-ui, -apple-system, sans-serif !important;
          }
          button, .cta-primary-btn {
            display: none !important;
          }
          .report-root-container {
            background: #FFFFFF !important;
            color: #0F172A !important;
            padding: 0 !important;
            margin: 0 !important;
            width: 100% !important;
          }
          
          /* Page Structure */
          .print-page {
            width: 210mm;
            height: 297mm;
            padding: 16mm 18mm 14mm;
            box-sizing: border-box;
            position: relative;
            page-break-after: always;
            page-break-inside: avoid;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            background: #FFFFFF !important;
          }
          .print-page:last-child {
            page-break-after: auto;
          }

          /* Colors & Utility */
          .bg-navy { background: #0B192C !important; color: #FFFFFF !important; }
          .bg-teal { background: #005F53 !important; color: #FFFFFF !important; }
          .bg-light-mint { background: #F0FDF4 !important; border: 1px solid #DCFCE7 !important; }
          .bg-light-gray { background: #F8FAFC !important; border: 1px solid #E2E8F0 !important; }
          .text-teal { color: #005F53 !important; }
          .text-accent-blue { color: #0284C7 !important; }

          /* Header */
          .report-header-bar {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding-bottom: 12px;
            border-bottom: 2px solid #E2E8F0;
            margin-bottom: 14px;
          }
          .header-brand {
            display: flex;
            align-items: center;
            gap: 10px;
          }
          .header-logo-mark {
            width: 32px;
            height: 32px;
            background: #0B192C;
            border-radius: 6px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #00FFA3;
            font-weight: 800;
            font-size: 14px;
          }
          .header-logo-text {
            font-weight: 700;
            font-size: 15px;
            color: #0B192C;
            letter-spacing: -0.01em;
          }
          .confidential-badge {
            background: #0B192C;
            color: #00D68F;
            font-size: 10px;
            font-weight: 700;
            letter-spacing: 0.08em;
            padding: 5px 12px;
            border-radius: 20px;
            text-transform: uppercase;
          }

          /* Main Title */
          .doc-main-title {
            font-size: 22px;
            font-weight: 800;
            color: #0B192C;
            line-height: 1.25;
            margin-bottom: 12px;
            letter-spacing: -0.02em;
          }

          /* Metadata Card */
          .meta-container-card {
            background: #F8FAFC;
            border: 1px solid #E2E8F0;
            border-radius: 10px;
            padding: 10px 16px;
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 12px;
            margin-bottom: 16px;
          }
          .meta-item {
            display: flex;
            align-items: center;
            gap: 8px;
          }
          .meta-icon {
            width: 26px;
            height: 26px;
            border-radius: 6px;
            background: #E2E8F0;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 12px;
          }
          .meta-label {
            font-size: 9px;
            text-transform: uppercase;
            color: #64748B;
            font-weight: 600;
            letter-spacing: 0.05em;
          }
          .meta-val {
            font-size: 11.5px;
            font-weight: 700;
            color: #0F172A;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
          }

          /* Section Headings */
          .section-heading {
            display: flex;
            align-items: center;
            gap: 8px;
            font-size: 14px;
            font-weight: 800;
            color: #0B192C;
            text-transform: uppercase;
            letter-spacing: 0.04em;
            margin-bottom: 12px;
          }
          .section-num {
            background: #005F53;
            color: #FFFFFF;
            font-size: 11px;
            font-weight: 800;
            padding: 2px 7px;
            border-radius: 4px;
          }

          /* Executive Summary Top Layout */
          .exec-top-grid {
            display: grid;
            grid-template-columns: 190px 1fr;
            gap: 16px;
            margin-bottom: 16px;
          }
          .score-circle-container {
            background: #F8FAFC;
            border: 1px solid #E2E8F0;
            border-radius: 12px;
            padding: 14px;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            text-align: center;
          }
          .circular-ring {
            width: 90px;
            height: 90px;
            border-radius: 50%;
            background: conic-gradient(#005F53 0% 84%, #E2E8F0 84% 100%);
            display: flex;
            align-items: center;
            justify-content: center;
            margin-bottom: 8px;
          }
          .circular-ring-inner {
            width: 72px;
            height: 72px;
            border-radius: 50%;
            background: #FFFFFF;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
          }
          .ring-score-val {
            font-size: 26px;
            font-weight: 900;
            line-height: 1;
            color: #0B192C;
          }
          .ring-score-max {
            font-size: 9px;
            color: #64748B;
            font-weight: 600;
          }
          .classification-badge {
            background: #005F53;
            color: #FFFFFF;
            font-size: 10px;
            font-weight: 700;
            padding: 4px 10px;
            border-radius: 12px;
            letter-spacing: 0.03em;
            text-transform: uppercase;
          }

          .insight-card {
            background: #F0FDF4;
            border: 1px solid #BBF7D0;
            border-radius: 12px;
            padding: 14px 16px;
            position: relative;
            display: flex;
            flex-direction: column;
            justify-content: center;
          }
          .insight-card-icon {
            font-size: 18px;
            margin-bottom: 6px;
          }
          .insight-card-text {
            font-size: 11.5px;
            line-height: 1.55;
            color: #166534;
            font-weight: 500;
          }

          /* Dimension Evaluation Table / Cards */
          .dimension-table {
            width: 100%;
            border-collapse: separate;
            border-spacing: 0 8px;
          }
          .dimension-row {
            background: #F8FAFC;
            border: 1px solid #E2E8F0;
            border-radius: 8px;
          }
          .dimension-row td {
            padding: 10px 12px;
            vertical-align: top;
            font-size: 11px;
          }
          .dimension-row td:first-child {
            border-top-left-radius: 8px;
            border-bottom-left-radius: 8px;
            font-weight: 700;
            color: #0B192C;
            width: 28%;
            display: flex;
            align-items: center;
            gap: 6px;
          }
          .dimension-row td:nth-child(2) {
            width: 15%;
            text-align: center;
          }
          .dimension-row td:last-child {
            border-top-right-radius: 8px;
            border-bottom-right-radius: 8px;
            color: #475569;
            line-height: 1.45;
          }
          .pill-score {
            display: inline-block;
            padding: 3px 10px;
            border-radius: 12px;
            font-weight: 800;
            font-size: 10.5px;
          }
          .pill-score.teal { background: #CCFBF1; color: #005F53; }
          .pill-score.blue { background: #E0F2FE; color: #0369A1; }
          .pill-score.navy { background: #E2E8F0; color: #0B192C; }

          /* Page 2 Layout Grid */
          .page2-grid {
            display: grid;
            grid-template-columns: 1.5fr 1fr;
            gap: 16px;
            flex: 1;
          }

          /* Vertical Timeline Roadmap */
          .timeline-roadmap {
            position: relative;
            padding-left: 20px;
          }
          .timeline-roadmap::before {
            content: '';
            position: absolute;
            left: 7px;
            top: 10px;
            bottom: 10px;
            width: 2px;
            background: #CBD5E1;
          }
          .phase-card-item {
            position: relative;
            margin-bottom: 12px;
          }
          .phase-marker {
            position: absolute;
            left: -20px;
            top: 12px;
            width: 16px;
            height: 16px;
            border-radius: 50%;
            background: #005F53;
            border: 3px solid #FFFFFF;
            box-shadow: 0 0 0 1px #005F53;
          }
          .phase-card {
            background: #F8FAFC;
            border: 1px solid #E2E8F0;
            border-radius: 10px;
            padding: 12px 14px;
          }
          .phase-header {
            display: flex;
            align-items: center;
            gap: 8px;
            margin-bottom: 6px;
          }
          .phase-badge {
            background: #0B192C;
            color: #00FFA3;
            font-size: 9px;
            font-weight: 800;
            padding: 2px 6px;
            border-radius: 4px;
            text-transform: uppercase;
          }
          .phase-title {
            font-size: 12px;
            font-weight: 800;
            color: #0B192C;
          }
          .phase-desc {
            font-size: 10.5px;
            color: #475569;
            line-height: 1.45;
          }

          /* Right Panel Industry Benchmarks */
          .right-panel-container {
            display: flex;
            flex-direction: column;
            gap: 12px;
          }
          .stat-card-highlight {
            background: #F0FDF4;
            border: 1px solid #BBF7D0;
            border-radius: 10px;
            padding: 14px;
            text-align: center;
          }
          .stat-card-num {
            font-size: 24px;
            font-weight: 900;
            color: #005F53;
            line-height: 1;
            margin-bottom: 4px;
          }
          .stat-card-label {
            font-size: 10px;
            font-weight: 700;
            color: #166534;
            text-transform: uppercase;
            letter-spacing: 0.03em;
          }
          .stat-card-desc {
            font-size: 10px;
            color: #475569;
            margin-top: 4px;
            line-height: 1.4;
          }

          .cta-promo-card {
            background: #0B192C;
            color: #FFFFFF;
            border-radius: 10px;
            padding: 14px;
          }
          .cta-promo-title {
            font-size: 12px;
            font-weight: 800;
            color: #00FFA3;
            margin-bottom: 6px;
          }
          .cta-promo-desc {
            font-size: 10px;
            color: #94A3B8;
            line-height: 1.4;
            margin-bottom: 12px;
          }
          .calendly-btn-link {
            display: block;
            background: #005F53;
            color: #FFFFFF !important;
            text-align: center;
            padding: 8px 12px;
            border-radius: 6px;
            font-size: 10.5px;
            font-weight: 800;
            text-decoration: none !important;
            letter-spacing: 0.02em;
          }

        /* Web Screen View Styling - Enterprise Report Presentation */
        @media screen {
          .report-root-container {
            background: #F1F5F9;
            padding: 40px 20px;
            min-height: 100vh;
            display: flex;
            flex-direction: column;
            align-items: center;
          }
          .print-only-wrapper {
            display: flex !important;
            flex-direction: column;
            gap: 32px;
            max-width: 900px;
            width: 100%;
          }
          .print-page {
            background: #FFFFFF !important;
            border: 1px solid #CBD5E1;
            border-radius: 16px;
            padding: 36px 40px;
            box-shadow: 0 10px 25px -5px rgba(15, 23, 42, 0.08);
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            min-height: 1000px;
          }
        }
      `}</style>

      {/* ── PRINT VIEW: EXPLICIT 2-PAGE PREMIUM ENTERPRISE LAYOUT ── */}
      <div className="print-only-wrapper">
        {/* ── PAGE 1 ── */}
        <div className="print-page">
          <div>
            {/* Header */}
            <div className="report-header-bar">
              <div className="header-brand">
                <div className="header-logo-mark">I</div>
                <div className="header-logo-text">Instrek Technologies</div>
              </div>
              <div className="confidential-badge">CONFIDENTIAL ASSESSMENT REPORT</div>
            </div>

            {/* Document Title */}
            <h1 className="doc-main-title">Enterprise AI Readiness Transformation Roadmap</h1>

            {/* Metadata Card Container */}
            <div className="meta-container-card">
              <div className="meta-item">
                <div className="meta-icon">🏢</div>
                <div>
                  <div className="meta-label">Organization</div>
                  <div className="meta-val">{lead.company || 'Enterprise Partner'}</div>
                </div>
              </div>
              <div className="meta-item">
                <div className="meta-icon">👤</div>
                <div>
                  <div className="meta-label">Leader</div>
                  <div className="meta-val">{lead.firstName} {lead.lastName}</div>
                </div>
              </div>
              <div className="meta-item">
                <div className="meta-icon">✉️</div>
                <div>
                  <div className="meta-label">Work Email</div>
                  <div className="meta-val">{lead.email || 'leader@enterprise.com'}</div>
                </div>
              </div>
              <div className="meta-item">
                <div className="meta-icon">📅</div>
                <div>
                  <div className="meta-label">Date</div>
                  <div className="meta-val">{dateStr}</div>
                </div>
              </div>
            </div>

            {/* Section 01 */}
            <div className="section-heading">
              <span className="section-num">01</span> EXECUTIVE SUMMARY &amp; POSTURE
            </div>

            {/* Executive Summary Top Row */}
            <div className="exec-top-grid">
              <div className="score-circle-container">
                <div className="circular-ring">
                  <div className="circular-ring-inner">
                    <div className="ring-score-val">84</div>
                    <div className="ring-score-max">/100</div>
                  </div>
                </div>
                <div className="classification-badge">Managed Risk</div>
              </div>
              <div className="insight-card">
                <div className="insight-card-icon">🛡️</div>
                <div className="insight-card-text">
                  "Based on your self-assessment, your organization is operating with significant unmanaged AI risk. The gap is not primarily technical - it is architectural. Your teams have access to AI tools that your governance framework was not designed for, your agents operate without dedicated identity, and your cryptographic infrastructure requires a post-quantum roadmap."
                </div>
              </div>
            </div>

            {/* Section 02 */}
            <div className="section-heading" style={{ marginTop: '16px' }}>
              <span className="section-num">02</span> DIMENSION EVALUATION AT A GLANCE
            </div>

            {/* Dimension Evaluation Table */}
            <table className="dimension-table">
              <tbody>
                <tr className="dimension-row">
                  <td>
                    <span>🔒</span> AI Sovereignty &amp; Data Leakage
                  </td>
                  <td>
                    <span className="pill-score teal">{lead.p1Score || 78}%</span>
                  </td>
                  <td>
                    {getFindingText(p1Findings, lead.p1Score || 78)}
                  </td>
                </tr>
                <tr className="dimension-row">
                  <td>
                    <span>🤖</span> Agentic Accountability
                  </td>
                  <td>
                    <span className="pill-score blue">{lead.p2Score || 65}%</span>
                  </td>
                  <td>
                    {getFindingText(p2Findings, lead.p2Score || 65)}
                  </td>
                </tr>
                <tr className="dimension-row">
                  <td>
                    <span>🛡️</span> Post-Quantum &amp; Cyber Defense
                  </td>
                  <td>
                    <span className="pill-score navy">{lead.p3Score || 82}%</span>
                  </td>
                  <td>
                    {getFindingText(p3Findings, lead.p3Score || 82)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Footer Page 1 */}
          <div className="print-footer">
            <div>Instrek Technologies • Enterprise Cybersecurity Assessment</div>
            <div>Confidential &amp; Proprietary</div>
            <div>Page 1 of 2</div>
          </div>
        </div>

        {/* ── PAGE 2 ── */}
        <div className="print-page">
          <div>
            {/* Header Page 2 */}
            <div className="report-header-bar">
              <div className="header-brand">
                <div className="header-logo-mark">I</div>
                <div className="header-logo-text">Instrek Technologies</div>
              </div>
              <div className="confidential-badge">CONFIDENTIAL ASSESSMENT REPORT</div>
            </div>

            <div className="page2-grid" style={{ marginTop: '10px' }}>
              {/* Left Column: Section 03 Timeline */}
              <div>
                <div className="section-heading">
                  <span className="section-num">03</span> DETAILED TRANSFORMATION ROADMAP
                </div>

                <div className="timeline-roadmap" style={{ marginTop: '14px' }}>
                  {/* Phase 1 */}
                  <div className="phase-card-item">
                    <div className="phase-marker"></div>
                    <div className="phase-card">
                      <div className="phase-header">
                        <span className="phase-badge">PHASE 1</span>
                        <span className="phase-title">🛡️ Foundational Security &amp; Governance</span>
                      </div>
                      <div className="phase-desc">
                        Before any architectural changes, conduct a rapid AI data flow audit mapping external LLM calls. Establish acceptable-use policies with automated guardrails and DPDP-aligned data residency controls.
                      </div>
                    </div>
                  </div>

                  {/* Phase 2 */}
                  <div className="phase-card-item">
                    <div className="phase-marker"></div>
                    <div className="phase-card">
                      <div className="phase-header">
                        <span className="phase-badge">PHASE 2</span>
                        <span className="phase-title">⚡ Private LLM &amp; Agentic Infrastructure</span>
                      </div>
                      <div className="phase-desc">
                        Deploy a Private LLM environment in your VPC with Secure RAG. Implement agentic identity management—assigning non-human credentials, scoped access controls, and HITL audit checkpoints to production agents.
                      </div>
                    </div>
                  </div>

                  {/* Phase 3 */}
                  <div className="phase-card-item">
                    <div className="phase-marker"></div>
                    <div className="phase-card">
                      <div className="phase-header">
                        <span className="phase-badge">PHASE 3</span>
                        <span className="phase-title">⚛️ Post-Quantum Readiness &amp; Scaling</span>
                      </div>
                      <div className="phase-desc">
                        Transition security posture to an AI-powered self-healing SOC. Execute a Post-Quantum Cryptography readiness assessment, mapping RSA/ECC dependencies and defining a NIST PQC-approved algorithm migration path.
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Section 04 Benchmarks & Next Steps */}
              <div className="right-panel-container">
                <div className="section-heading">
                  <span className="section-num">04</span> BENCHMARKS &amp; STEPS
                </div>

                {/* Benchmark Stat Card */}
                <div className="stat-card-highlight">
                  <div className="stat-card-num">Top 18%</div>
                  <div className="stat-card-label">Peer Benchmark Posture</div>
                  <div className="stat-card-desc">
                    Your current AI security posture places your organization ahead of 82% of industry peers in proactive risk mitigation.
                  </div>
                </div>

                {/* CTA Card */}
                <div className="cta-promo-card">
                  <div className="cta-promo-title">Strategy Architecture Review</div>
                  <div className="cta-promo-desc">
                    Schedule a 30-minute working session with our security architects to review your custom blueprint and technical implementation milestones.
                  </div>
                  <a 
                    className="calendly-btn-link" 
                    href="https://calendly.com/instrek/strategy" 
                    target="_blank" 
                    rel="noreferrer"
                  >
                    📅 Schedule Strategy Review
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Page 2 */}
          <div className="print-footer">
            <div>Instrek Technologies • Enterprise Cybersecurity Assessment</div>
            <div>Confidential &amp; Proprietary</div>
            <div>Page 2 of 2</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportView;
