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
    opts: ["Yes, full identity management","Partial - some agents are tracked","No, they inherit human credentials","We don't have AI agents yet"],
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
    opts: ["I have a data flow map","I know roughly, not formally","I'd need weeks to compile it","I don't know and it worries me"],
    scores: [5, 40, 75, 95]
  }
];

const fears = [
  `"If my India team uses ChatGPT to write code, <strong>where does my IP actually go?</strong>"`,
  `"What if an AI agent makes a <strong>$1M financial error</strong> or creates a backdoor - and I don't find out for weeks?"`,
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

  // On page load/refresh, load report from URL or keep hero screen
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const reportData = params.get('report');
    const importGcc = params.get('importGcc');
    const leadId = params.get('leadId');
    if (reportData) {
      try {
        const decodedStr = decodeURIComponent(escape(window.atob(reportData)));
        const parsed = JSON.parse(decodedStr);
        if (parsed && parsed.email) {
          setReportLead(parsed);
          setScreen('report');
          localStorage.setItem('shieldgcc_active_report', JSON.stringify(parsed));
          return;
        }
      } catch (e) {
        console.error('Failed to parse report parameter:', e);
      }
    } else if (importGcc) {
      try {
        const decodedStr = decodeURIComponent(escape(window.atob(importGcc)));
        const parsed = JSON.parse(decodedStr);
        if (parsed && parsed.email) {
          setReportLead(parsed);
          setScreen('report');
          localStorage.setItem('shieldgcc_active_report', JSON.stringify(parsed));
          return;
        }
      } catch (e) {
        console.error('Failed to parse importGcc parameter:', e);
      }
    } else if (leadId) {
      setLoadingReport(true);
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      fetch(`${apiUrl}/api/shieldgcc/leads/${leadId}`)
        .then(res => {
          if (!res.ok) throw new Error('Failed to fetch lead');
          return res.json();
        })
        .then(data => {
          setReportLead(data);
          setScreen('report');
          localStorage.setItem('shieldgcc_active_report', JSON.stringify(data));
        })
        .catch(err => {
          console.error('Error fetching lead data:', err);
          setErrorReport('Could not retrieve your risk report. Please try scanning again.');
        })
        .finally(() => {
          setLoadingReport(false);
        });
      return;
    }
    
    setScreen('hero');
    setReportLead(null);
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
      sub = `Your GCC profile shows ${avg > 80 ? 'severe' : 'significant'} exposure across multiple AI security pillars. Based on your answers, IP leakage via unmonitored LLM APIs is your most immediate risk. This is not theoretical - organisations with similar profiles have experienced material breaches.`;
      urgency = '⚠ Based on your profile, your GCC has likely already sent proprietary data to unmonitored external AI systems. The window to contain this is now.';
      color = '#FF4C4C';
    } else if (avg >= 45) {
      headline = 'Moderate Risk - Act Before Audit';
      sub = `Your GCC has partial controls but meaningful gaps. Regulators and auditors are increasingly asking for AI governance documentation. Your current posture would struggle to answer those questions. A structured remediation roadmap would move you from reactive to defensible.`;
      urgency = '⚡ DPDP enforcement is active. Your current AI data flow posture may not withstand regulatory scrutiny.';
      color = '#FFB830';
    } else {
      headline = 'Strong Foundation - Harden & Scale';
      sub = 'Your GCC has better AI governance than most. As you scale AI deployment and headcount, formalising this posture will be critical. Post-quantum readiness and agentic identity management are the emerging gaps for organisations at your maturity level.';
      urgency = '✓ Your proactive posture puts you ahead. Now is the time to formalise and scale your governance architecture before AI deployment outpaces it.';
      color = '#00FFA3';
    }

    setResults({ avg, headline, sub, urgency, color, pillarScores });
    goScreen('result');
  };

  const submitForm = () => {
    if (!form.email || !form.role) return;
    
    const emailLower = form.email.trim().toLowerCase();
    const updatedForm = { ...form, email: emailLower };
    setForm(updatedForm);
    
    const p1Score = results?.pillarScores?.find(p => p.name.includes('Sovereignty'))?.score || 0;
    const p2Score = results?.pillarScores?.find(p => p.name.includes('Accountability'))?.score || 0;
    const p3Score = results?.pillarScores?.find(p => p.name.includes('Quantum'))?.score || 0;

    const username = emailLower.split('@')[0];
    const parts = username.split(/[._-]/);
    let firstName = 'GCC';
    let lastName = 'Leader';
    if (parts.length >= 2) {
      firstName = parts[0].charAt(0).toUpperCase() + parts[0].slice(1);
      lastName = parts[parts.length - 1].charAt(0).toUpperCase() + parts[parts.length - 1].slice(1);
    } else if (parts.length === 1) {
      firstName = parts[0].charAt(0).toUpperCase() + parts[0].slice(1);
    }

    const reportPayload = {
      firstName,
      lastName,
      email: emailLower,
      role: form.role,
      company: form.company || 'Instrek Technologies Assessment',
      size: form.size || '500-2000',
      riskScore: results?.avg,
      tier: results?.avg >= 70 ? 'Critical Exposure' : results?.avg >= 45 ? 'Moderate Risk' : 'Strong Foundation',
      p1Score,
      p2Score,
      p3Score,
      createdAt: new Date().toISOString()
    };

    try {
      const encodedData = window.btoa(unescape(encodeURIComponent(JSON.stringify(reportPayload))));
      localStorage.setItem('shieldgcc_lead_report', encodedData);
      localStorage.setItem('shieldgcc_active_report', JSON.stringify(reportPayload));

      // Save submission to client storage for Admin Panel matching
      try {
        const gccSubmissionsRaw = localStorage.getItem('shieldgcc_submissions');
        const gccSubmissions = gccSubmissionsRaw ? JSON.parse(gccSubmissionsRaw) : [];
        const filteredGcc = gccSubmissions.filter(s => s.email?.trim().toLowerCase() !== emailLower);
        filteredGcc.unshift(reportPayload);
        localStorage.setItem('shieldgcc_submissions', JSON.stringify(filteredGcc));

        // Real-time BroadcastChannel sync to Admin Panel across ports
        try {
          const channel = new BroadcastChannel('shieldgcc_channel');
          channel.postMessage({ type: 'GCC_LEAD_SUBMITTED', payload: reportPayload });
        } catch (e) {}

        // POST to Netlify Function Cloud DB for live site
        const endpoints = [
          import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api/shieldgcc/leads` : null,
          '/.netlify/functions/save-lead'
        ].filter(Boolean);

        endpoints.forEach(url => {
          fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(reportPayload)
          }).catch(() => {});
        });
      } catch (err) {
        console.error('Failed to update shieldgcc_submissions in localStorage:', err);
      }

      setCreatedLeadId(encodedData);

      const shareableLink = `${window.location.origin}${window.location.pathname}?report=${encodedData}`;

      let themeColor = '#FF4C4C'; // Critical
      if (reportPayload.tier === 'Moderate Risk') {
        themeColor = '#FFB830'; // Warning
      } else if (reportPayload.tier === 'Strong Foundation') {
        themeColor = '#00FFA3'; // Success
      }

      const emailHtml = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; background-color: #03071E; color: #EEEEE6; margin: 0; padding: 20px; }
            .container { max-width: 600px; margin: 0 auto; background-color: #060D2E; border: 1px solid rgba(255,255,255,0.05); border-radius: 12px; padding: 30px; text-align: center; }
            .header { font-size: 24px; font-weight: bold; color: #2563EB; margin-bottom: 20px; text-transform: uppercase; letter-spacing: 2px; }
            .score-card { background-color: #0A1535; border-radius: 8px; padding: 25px; margin: 20px 0; border: 1px solid rgba(255,255,255,0.05); }
            .score-title { font-size: 12px; color: #5A6272; text-transform: uppercase; letter-spacing: 1.5px; }
            .score-value { font-size: 64px; font-weight: 800; color: ${themeColor}; margin: 10px 0 15px; }
            .badge { display: inline-block; padding: 6px 16px; font-size: 14px; font-weight: bold; border-radius: 30px; text-transform: uppercase; background: rgba(255,255,255,0.05); color: ${themeColor}; border: 1px solid ${themeColor}; }
            .cta-btn { display: inline-block; background-color: #00D68F; color: #0D1117 !important; text-decoration: none; font-weight: bold; padding: 14px 28px; border-radius: 6px; margin: 25px 0 15px; text-transform: uppercase; letter-spacing: 1px; }
            .footer { font-size: 11px; color: #5A6272; margin-top: 30px; line-height: 1.5; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">Instrek Technologies</div>
            <p style="color: #A0AEC0; font-size: 15px;">Hi ${firstName},</p>
            <p style="color: #A0AEC0; font-size: 15px; line-height: 1.6;">Thank you for completing the Instrek Technologies Live Risk Scan. Your assessment report has been successfully generated.</p>
            <div class="score-card">
              <div class="score-title">Your Risk Score</div>
              <div class="score-value">${reportPayload.riskScore}</div>
              <div class="badge">${reportPayload.tier}</div>
            </div>
            <a href="${shareableLink}" class="cta-btn">View My Risk Report</a>
            <div class="footer">
              <p>Instrek Technologies Ltd. &copy; 2026. All rights reserved.</p>
              <p>Governed by DPDP Act & GDPR compliance standards.</p>
            </div>
          </div>
        </body>
        </html>
      `;

      // Generate a clean, well-structured, compact 2-page PDF with light backgrounds and clean layout
      const generateReportPdfBase64 = (data) => {
        const s = (str) => String(str || '').replace(/[()\\]/g, '');
        const wrapText = (text, maxChars = 92) => {
          const words = text.split(' ');
          const lines = [];
          let line = '';
          for (const w of words) {
            if ((line + ' ' + w).trim().length > maxChars) {
              lines.push(line.trim());
              line = w;
            } else {
              line = line ? line + ' ' + w : w;
            }
          }
          if (line.trim()) lines.push(line.trim());
          return lines;
        };

        const tierColor = data.riskScore >= 70 ? '0.94 0.27 0.27' : data.riskScore >= 45 ? '0.96 0.62 0.04' : '0.06 0.73 0.50';
        const tierLabel = data.tier || (data.riskScore >= 70 ? 'Critical Exposure' : data.riskScore >= 45 ? 'Moderate Risk' : 'Strong Foundation');

        const p1Color = data.p1Score >= 70 ? '0.86 0.15 0.15' : data.p1Score >= 45 ? '0.85 0.47 0.02' : '0.02 0.59 0.41';
        const p2Color = data.p2Score >= 70 ? '0.86 0.15 0.15' : data.p2Score >= 45 ? '0.85 0.47 0.02' : '0.02 0.59 0.41';
        const p3Color = data.p3Score >= 70 ? '0.86 0.15 0.15' : data.p3Score >= 45 ? '0.85 0.47 0.02' : '0.02 0.59 0.41';
        const p1Label = data.p1Score >= 70 ? 'Critical Risk' : data.p1Score >= 45 ? 'Elevated Risk' : 'Managed';
        const p2Label = data.p2Score >= 70 ? 'Critical Risk' : data.p2Score >= 45 ? 'Elevated Risk' : 'Managed';
        const p3Label = data.p3Score >= 70 ? 'Critical Risk' : data.p3Score >= 45 ? 'Elevated Risk' : 'Managed';

        const p1Text = data.p1Score >= 70 
          ? "Developers are actively using external GenAI tools without formal audit trails or data residency controls. Every API call to an external LLM is a potential IP transfer event."
          : data.p1Score >= 45 
            ? "Partial controls exist around GenAI usage. Gaps remain as unmonitored tools are used, and shadow AI posture leaves key data flows unmapped."
            : "Proactive controls are in place around GenAI tool usage. Deployed private LLM pathways and secure data boundaries are well-managed.";
        const p2Text = data.p2Score >= 70 
          ? "AI agents function without dedicated identity or independent audit trails, inheriting default human credentials. Attribution and scoped boundaries are missing."
          : data.p2Score >= 45 
            ? "Some agentic pathways are tracked, but coverage is incomplete. High-risk actions lack dedicated credential structures."
            : "Agentic boundaries are controlled. Dedicated agent identities and scoped permission schemes are successfully operationalised.";
        const p3Text = data.p3Score >= 70 
          ? "No formal cryptographic inventory has been conducted and post-quantum readiness is unmapped. High risk of harvest-now, decrypt-later threats."
          : data.p3Score >= 45 
            ? "Partial awareness of quantum cryptographic risks, but a formal migration roadmap or NIST standard adoption is not yet initiated."
            : "Cryptographic inventory is complete and NIST PQC migration planning is proactively under way across all systems.";

        const dateStr = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });

        // ── PAGE 1: Header + Score Card + Executive Summary + Pillar Analysis ──
        const p1Lines = [];
        
        // Clean Top header (White bg with top border)
        p1Lines.push('q', '0.06 0.73 0.50 rg', '0 788 612 4 re f', 'Q');
        
        // Logo & Title
        p1Lines.push('BT', '0.05 0.1 0.2 rg', '/F2 16 Tf', '40 754 Td', '(INSTREK TECHNOLOGIES - AI SECURITY) Tj', 'ET');
        p1Lines.push('BT', '0.4 0.45 0.55 rg', '/F1 8 Tf', '40 740 Td', '(GCC CONFIDENTIAL RISK ASSESSMENT REPORT) Tj', 'ET');
        p1Lines.push('BT', '0.4 0.45 0.55 rg', '/F1 8 Tf', '450 754 Td', `(Date: ${s(dateStr)}) Tj`, 'ET');

        // Divider
        p1Lines.push('q', '0.88 0.91 0.93 rg', '40 728 532 1 re f', 'Q');

        // Prepared for subtitle
        p1Lines.push('BT', '0.1 0.15 0.25 rg', '/F2 12 Tf', '40 706 Td', `(Risk Report for: ${s(data.firstName)} ${s(data.lastName)} | ${s(data.role)} | ${s(data.company)}) Tj`, 'ET');

        // ── Score Card (Light Grey Box with color accent) ──
        p1Lines.push('q', '0.96 0.97 0.99 rg', '40 610 532 76 re f', 'Q');
        p1Lines.push('q', '0.88 0.91 0.93 rg', '40 610 532 76 re S', 'Q');
        p1Lines.push('q', `${tierColor} rg`, '40 610 5 76 re f', 'Q');

        // Risk Score Big text
        p1Lines.push('BT', `${tierColor} rg`, '/F2 36 Tf', '60 636 Td', `(${data.riskScore}) Tj`, 'ET');
        p1Lines.push('BT', '0.5 0.55 0.6 rg', '/F1 11 Tf', '125 640 Td', '(/100) Tj', 'ET');
        p1Lines.push('BT', '0.3 0.35 0.4 rg', '/F1 8 Tf', '60 622 Td', '(COMPOSITE RISK SCORE) Tj', 'ET');

        // Tier badge
        p1Lines.push('q', `${tierColor} rg`, '340 648 180 20 re f', 'Q');
        p1Lines.push('BT', '1 1 1 rg', '/F2 9 Tf', '355 654 Td', `(${s(tierLabel).toUpperCase()}) Tj`, 'ET');

        // Gauge bar background
        p1Lines.push('q', '0.88 0.91 0.93 rg', '340 630 180 6 re f', 'Q');
        const gaugeW = Math.round(180 * data.riskScore / 100);
        p1Lines.push('q', `${tierColor} rg`, `340 630 ${gaugeW} 6 re f`, 'Q');

        // Executive summary text
        p1Lines.push('BT', '0.05 0.1 0.2 rg', '/F2 9 Tf', '40 584 Td', '(EXECUTIVE SUMMARY) Tj', 'ET');
        const execText = "Based on your self-assessment, your GCC operates with unmanaged AI exposures. Critical gaps exist in shadow GenAI controls, autonomous agent tracking, and quantum encryption readiness.";
        p1Lines.push('BT', '0.4 0.45 0.5 rg', '/F1 9 Tf', '40 570 Td', `(${s(execText)}) Tj`, 'ET');

        // Divider
        p1Lines.push('q', '0.88 0.91 0.93 rg', '40 556 532 1 re f', 'Q');

        // ── 3 Pillar analysis cards compacted on page 1 ──
        p1Lines.push('BT', '0.05 0.1 0.2 rg', '/F2 11 Tf', '40 535 Td', '(01. RISK PILLAR ANALYSIS) Tj', 'ET');

        let cy = 520;

        // Pillar 1 Card
        p1Lines.push('q', '0.98 0.98 0.99 rg', `40 ${cy - 138} 532 125 re f`, 'Q');
        p1Lines.push('q', '0.90 0.92 0.94 rg', `40 ${cy - 138} 532 125 re S`, 'Q');
        p1Lines.push('q', `${p1Color} rg`, `40 ${cy - 138} 4 125 re f`, 'Q');
        p1Lines.push('BT', '0.05 0.1 0.2 rg', '/F2 10 Tf', `55 ${cy - 20} Td`, '(AI Sovereignty & Data Leakage) Tj', 'ET');
        p1Lines.push('BT', `${p1Color} rg`, '/F2 9 Tf', `480 ${cy - 20} Td`, `(Score: ${data.p1Score}/100) Tj`, 'ET');
        const p1W = wrapText(p1Text, 88);
        let py1 = cy - 38;
        for (const line of p1W) {
          p1Lines.push('BT', '0.35 0.4 0.45 rg', '/F1 9 Tf', `55 ${py1} Td`, `(${s(line)}) Tj`, 'ET');
          py1 -= 13;
        }
        // What closing the gap looks like
        p1Lines.push('BT', '0.02 0.59 0.41 rg', '/F2 8 Tf', `55 ${cy - 92} Td`, '(REMEDIATION TARGET: Private LLM deployments & secure RAG gateways to keep all IP inside the perimeter.) Tj', 'ET');
        p1Lines.push('q', '0.90 0.92 0.94 rg', `55 ${cy - 110} 460 4 re f`, 'Q');
        p1Lines.push('q', `${p1Color} rg`, `55 ${cy - 110} ${Math.round(460 * data.p1Score / 100)} 4 re f`, 'Q');

        // Pillar 2 Card
        cy -= 144;
        p1Lines.push('q', '0.98 0.98 0.99 rg', `40 ${cy - 138} 532 125 re f`, 'Q');
        p1Lines.push('q', '0.90 0.92 0.94 rg', `40 ${cy - 138} 532 125 re S`, 'Q');
        p1Lines.push('q', `${p2Color} rg`, `40 ${cy - 138} 4 125 re f`, 'Q');
        p1Lines.push('BT', '0.05 0.1 0.2 rg', '/F2 10 Tf', `55 ${cy - 20} Td`, '(Agentic Accountability) Tj', 'ET');
        p1Lines.push('BT', `${p2Color} rg`, '/F2 9 Tf', `480 ${cy - 20} Td`, `(Score: ${data.p2Score}/100) Tj`, 'ET');
        const p2W = wrapText(p2Text, 88);
        let py2 = cy - 38;
        for (const line of p2W) {
          p1Lines.push('BT', '0.35 0.4 0.45 rg', '/F1 9 Tf', `55 ${py2} Td`, `(${s(line)}) Tj`, 'ET');
          py2 -= 13;
        }
        p1Lines.push('BT', '0.02 0.59 0.41 rg', '/F2 8 Tf', `55 ${cy - 92} Td`, '(REMEDIATION TARGET: Structured agent identities & human-in-the-loop permission approvals.) Tj', 'ET');
        p1Lines.push('q', '0.90 0.92 0.94 rg', `55 ${cy - 110} 460 4 re f`, 'Q');
        p1Lines.push('q', `${p2Color} rg`, `55 ${cy - 110} ${Math.round(460 * data.p2Score / 100)} 4 re f`, 'Q');

        // Pillar 3 Card
        cy -= 144;
        p1Lines.push('q', '0.98 0.98 0.99 rg', `40 ${cy - 138} 532 125 re f`, 'Q');
        p1Lines.push('q', '0.90 0.92 0.94 rg', `40 ${cy - 138} 532 125 re S`, 'Q');
        p1Lines.push('q', `${p3Color} rg`, `40 ${cy - 138} 4 125 re f`, 'Q');
        p1Lines.push('BT', '0.05 0.1 0.2 rg', '/F2 10 Tf', `55 ${cy - 20} Td`, '(Post-Quantum & AI Cyber Defense) Tj', 'ET');
        p1Lines.push('BT', `${p3Color} rg`, '/F2 9 Tf', `480 ${cy - 20} Td`, `(Score: ${data.p3Score}/100) Tj`, 'ET');
        const p3W = wrapText(p3Text, 88);
        let py3 = cy - 38;
        for (const line of p3W) {
          p1Lines.push('BT', '0.35 0.4 0.45 rg', '/F1 9 Tf', `55 ${py3} Td`, `(${s(line)}) Tj`, 'ET');
          py3 -= 13;
        }
        p1Lines.push('BT', '0.02 0.59 0.41 rg', '/F2 8 Tf', `55 ${cy - 92} Td`, '(REMEDIATION TARGET: Crypto agile discovery inventories & migration plans to NIST post-quantum standard.) Tj', 'ET');
        p1Lines.push('q', '0.90 0.92 0.94 rg', `55 ${cy - 110} 460 4 re f`, 'Q');
        p1Lines.push('q', `${p3Color} rg`, `55 ${cy - 110} ${Math.round(460 * data.p3Score / 100)} 4 re f`, 'Q');

        // Footer Page 1
        p1Lines.push('q', '0.06 0.73 0.50 rg', '0 30 612 1 re f', 'Q');
        p1Lines.push('BT', '0.5 0.55 0.6 rg', '/F1 7 Tf', '40 18 Td', '(Instrek Technologies | Confidential Security Scan Report | Page 1 of 2) Tj', 'ET');

        const page1Content = p1Lines.join('\n');

        // ── PAGE 2: Peer intelligence, Roadmap, and Call-to-action ──
        const p2Lines = [];
        // Header band (Clean light border)
        p2Lines.push('q', '0.06 0.73 0.50 rg', '0 788 612 4 re f', 'Q');
        p2Lines.push('BT', '0.05 0.1 0.2 rg', '/F2 10 Tf', '40 762 Td', '(INSTREK TECHNOLOGIES  |  SECURITY COMPLIANCE ROADMAP) Tj', 'ET');
        p2Lines.push('q', '0.88 0.91 0.93 rg', '40 750 532 1 re f', 'Q');

        // Peer Intelligence Section
        p2Lines.push('BT', '0.05 0.1 0.2 rg', '/F2 11 Tf', '40 724 Td', '(02. PEER INTEL & BENCHMARKS) Tj', 'ET');

        // Table
        const tTop = 698;
        p2Lines.push('q', '0.96 0.97 0.99 rg', `40 ${tTop - 18} 532 18 re f`, 'Q');
        p2Lines.push('q', '0.88 0.91 0.93 rg', `40 ${tTop - 18} 532 18 re S`, 'Q');
        p2Lines.push('BT', '0.1 0.15 0.2 rg', '/F2 8 Tf', `50 ${tTop - 13} Td`, '(CAPABILITY) Tj', 'ET');
        p2Lines.push('BT', '0.1 0.15 0.2 rg', '/F2 8 Tf', `250 ${tTop - 13} Td`, '(PEER AVG) Tj', 'ET');
        p2Lines.push('BT', '0.1 0.15 0.2 rg', '/F2 8 Tf', `400 ${tTop - 13} Td`, '(MATURITY GAPS) Tj', 'ET');

        const benchmarks = [
          ['AI Acceptable Use Policy', '41% set rules', 41, '0.85 0.47 0.02'],
          ['Private / On-Prem LLM', '19% deployed', 19, '0.86 0.15 0.15'],
          ['Agentic Identity Framework', '11% operational', 11, '0.86 0.15 0.15'],
          ['PQC Readiness Assessment', '18% completed', 18, '0.86 0.15 0.15'],
          ['AI-Powered SOC', '33% active', 33, '0.85 0.47 0.02'],
        ];
        let ty = tTop - 18;
        benchmarks.forEach((bm, i) => {
          const rowBg = i % 2 === 0 ? '0.98 0.99 1' : '1 1 1';
          p2Lines.push('q', `${rowBg} rg`, `40 ${ty - 22} 532 22 re f`, 'Q');
          p2Lines.push('q', '0.93 0.94 0.96 rg', `40 ${ty - 22} 532 22 re S`, 'Q');
          p2Lines.push('BT', '0.1 0.1 0.15 rg', '/F1 9 Tf', `50 ${ty - 14} Td`, `(${bm[0]}) Tj`, 'ET');
          p2Lines.push('BT', '0.4 0.45 0.5 rg', '/F1 9 Tf', `250 ${ty - 14} Td`, `(${bm[1]}) Tj`, 'ET');
          // Bar
          p2Lines.push('q', '0.92 0.94 0.96 rg', `400 ${ty - 16} 150 5 re f`, 'Q');
          p2Lines.push('q', `${bm[3]} rg`, `400 ${ty - 16} ${Math.round(150 * bm[2] / 100)} 5 re f`, 'Q');
          ty -= 22;
        });

        // Roadmap Section
        const rmTop = ty - 32;
        p2Lines.push('BT', '0.05 0.1 0.2 rg', '/F2 11 Tf', `40 ${rmTop} Td`, '(03. REMEDIATION ROADMAP - THREE HORIZONS) Tj', 'ET');

        // Roadmap timeline items
        const steps = [
          { time: '0-30 DAYS (Immediate)', title: 'AI Data Flow Audit + Shadow AI Policy implementation.', color: '0.86 0.15 0.15', badge: '30d' },
          { time: '30-90 DAYS (Short-term)', title: 'VPC-based Private LLM setup & Scoped Agent identities.', color: '0.85 0.47 0.02', badge: '90d' },
          { time: '90d-12 MONTHS (Strategic)', title: 'AI SOC implementation & post-quantum NIST cryptomigration.', color: '0.02 0.59 0.41', badge: '12m' },
        ];
        let ry = rmTop - 25;
        // Vertical timeline bar
        p2Lines.push('q', '0.90 0.92 0.94 rg', `58 ${ry - 95} 2 100 re f`, 'Q');
        steps.forEach((step) => {
          // Dot
          p2Lines.push('q', `${step.color} rg`, `50 ${ry - 2} 18 18 re f`, 'Q');
          p2Lines.push('BT', '1 1 1 rg', '/F2 7 Tf', `53 ${ry + 3} Td`, `(${step.badge}) Tj`, 'ET');
          // Details
          p2Lines.push('BT', `${step.color} rg`, '/F2 8 Tf', `80 ${ry + 10} Td`, `(${step.time}) Tj`, 'ET');
          p2Lines.push('BT', '0.1 0.15 0.2 rg', '/F1 9 Tf', `80 ${ry - 2} Td`, `(${s(step.title)}) Tj`, 'ET');
          ry -= 44;
        });

        // CTA Section (Light gradient card instead of dark background)
        const ctaTop = ry - 25;
        p2Lines.push('q', '0.96 0.97 0.99 rg', `40 ${ctaTop - 85} 532 85 re f`, 'Q');
        p2Lines.push('q', '0.88 0.91 0.93 rg', `40 ${ctaTop - 85} 532 85 re S`, 'Q');
        p2Lines.push('q', '0.06 0.73 0.50 rg', `40 ${ctaTop - 2} 532 2 re f`, 'Q');

        p2Lines.push('BT', '0.06 0.53 0.35 rg', '/F2 9 Tf', `60 ${ctaTop - 18} Td`, '(YOUR NEXT ACTION PLAN) Tj', 'ET');
        p2Lines.push('BT', '0.05 0.1 0.2 rg', '/F2 12 Tf', `60 ${ctaTop - 36} Td`, '(This report surfaces critical issues. We help you resolve them.) Tj', 'ET');
        p2Lines.push('BT', '0.35 0.4 0.45 rg', '/F1 9 Tf', `60 ${ctaTop - 54} Td`, '(Book a custom 30-min strategy review session: calendly.com/instrek/strategy) Tj', 'ET');
        p2Lines.push('BT', '0.35 0.4 0.45 rg', '/F1 8 Tf', `60 ${ctaTop - 70} Td`, '(Or contact us at: strategy@instrek.com  |  Visit: instrek.com) Tj', 'ET');

        // Clean CTA button on right
        p2Lines.push('q', '0.06 0.73 0.50 rg', `410 ${ctaTop - 50} 145 25 re f`, 'Q');
        p2Lines.push('BT', '1 1 1 rg', '/F2 8 Tf', `430 ${ctaTop - 42} Td`, '(BOOK CALL NOW) Tj', 'ET');

        // Footer Page 2
        p2Lines.push('q', '0.06 0.73 0.50 rg', '0 30 612 1 re f', 'Q');
        p2Lines.push('BT', '0.5 0.55 0.6 rg', '/F1 7 Tf', '40 18 Td', '(Instrek Technologies | Confidential Security Scan Report | Page 2 of 2) Tj', 'ET');
        p2Lines.push('BT', '0.6 0.65 0.7 rg', '/F1 6 Tf', '40 8 Td', '(All details are subject to NDA. Instrek accepts no liability for decisions made solely on the basis of this assessment.) Tj', 'ET');

        const page2Content = p2Lines.join('\n');

        // ── Assemble PDF ──
        const objects = [];
        let objNum = 1;

        // Object 1: Catalog
        objects.push(`${objNum} 0 obj << /Type /Catalog /Pages 2 0 R >> endobj`);
        objNum++;

        // Object 2: Pages
        objects.push(`${objNum} 0 obj << /Type /Pages /Kids [3 0 R 4 0 R] /Count 2 >> endobj`);
        objNum++;

        // Object 3: Page 1
        objects.push(`${objNum} 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 5 0 R /Resources << /Font << /F1 7 0 R /F2 8 0 R >> >> >> endobj`);
        objNum++;

        // Object 4: Page 2
        objects.push(`${objNum} 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 6 0 R /Resources << /Font << /F1 7 0 R /F2 8 0 R >> >> >> endobj`);
        objNum++;

        // Object 5: Page 1 content stream
        objects.push(`${objNum} 0 obj << /Length ${page1Content.length} >>\nstream\n${page1Content}\nendstream\nendobj`);
        objNum++;

        // Object 6: Page 2 content stream
        objects.push(`${objNum} 0 obj << /Length ${page2Content.length} >>\nstream\n${page2Content}\nendstream\nendobj`);
        objNum++;

        // Object 7: Font Helvetica (regular)
        objects.push(`${objNum} 0 obj << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> endobj`);
        objNum++;

        // Object 8: Font Helvetica-Bold
        objects.push(`${objNum} 0 obj << /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >> endobj`);
        objNum++;

        let pdf = '%PDF-1.4\n';
        const offsets = [];
        for (const obj of objects) {
          offsets.push(pdf.length);
          pdf += obj + '\n';
        }

        const xrefOffset = pdf.length;
        pdf += 'xref\n';
        pdf += `0 ${objNum}\n`;
        pdf += '0000000000 65535 f \n';
        for (const offset of offsets) {
          pdf += String(offset).padStart(10, '0') + ' 00000 n \n';
        }

        pdf += `trailer << /Size ${objNum} /Root 1 0 R >>\n`;
        pdf += 'startxref\n';
        pdf += xrefOffset + '\n';
        pdf += '%%EOF';

        return window.btoa(unescape(encodeURIComponent(pdf)));
      };

      const pdfAttachmentBase64 = generateReportPdfBase64(reportPayload);

      fetch('/.netlify/functions/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: emailLower,
          subject: `Gcc-Security-Risk Report (PDF Attached)`,
          html: emailHtml,
          attachments: [
            {
              filename: `GCC_Security_Risk_Report_${(firstName || 'Scan').replace(/[^a-zA-Z0-9]/g, '_')}.pdf`,
              content: pdfAttachmentBase64
            }
          ]
        })
      })
      .then(res => {
        if (!res.ok) {
          throw new Error(`HTTP error ${res.status}.`);
        }
        return res.json();
      })
      .then(data => console.log('Email dispatched successfully with PDF attachment:', data))
      .catch(err => console.warn('Email dispatch skipped or failed:', err.message));

      setReportLead(reportPayload);
      setScreen('report');
      window.scrollTo(0, 0);
    } catch (err) {
      console.error('Failed to serialize report data:', err);
      goScreen('hero');
    }
  };

  const viewReportSkipForm = () => {
    const p1Score = results?.pillarScores?.find(p => p.name.includes('Sovereignty'))?.score || 0;
    const p2Score = results?.pillarScores?.find(p => p.name.includes('Accountability'))?.score || 0;
    const p3Score = results?.pillarScores?.find(p => p.name.includes('Quantum'))?.score || 0;

    const anonymousForm = {
      firstName: 'GCC',
      lastName: 'Leader',
      email: 'anonymous@shieldgcc-scan.com',
      role: 'GCC Leader',
      size: '500-2000',
      company: 'Instrek Technologies Assessment',
      riskScore: results?.avg,
      tier: results?.avg >= 70 ? 'Critical Exposure' : results?.avg >= 45 ? 'Moderate Risk' : 'Strong Foundation',
      p1Score,
      p2Score,
      p3Score,
      createdAt: new Date().toISOString()
    };

    try {
      const encodedData = window.btoa(unescape(encodeURIComponent(JSON.stringify(anonymousForm))));
      setReportLead(anonymousForm);
      setScreen('report');
      window.scrollTo(0, 0);
    } catch (err) {
      console.error('Failed to submit anonymous lead:', err);
      setReportLead(anonymousForm);
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
                  <img src="/log.png" alt="Instrek Technologies" className="logo-img" />
                </div>
                <div className="logo-text-group">
                  <div className="logo-name">Instrek Technologies</div>
                </div>
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
                <div className="ticker-track">
                  <div className="ticker-item"><div className="ticker-dot"></div>IP Leakage via LLM APIs</div>
                  <div className="ticker-item"><div className="ticker-dot"></div>Shadow AI Agents</div>
                  <div className="ticker-item"><div className="ticker-dot"></div>Post-Quantum Exposure</div>
                  <div className="ticker-item"><div className="ticker-dot"></div>DPDP Non-Compliance</div>
                  <div className="ticker-item"><div className="ticker-dot"></div>Agentic Backdoors</div>
                  <div className="ticker-item"><div className="ticker-dot"></div>IP Leakage via LLM APIs</div>
                  <div className="ticker-item"><div className="ticker-dot"></div>Shadow AI Agents</div>
                  <div className="ticker-item"><div className="ticker-dot"></div>Post-Quantum Exposure</div>
                  <div className="ticker-item"><div className="ticker-dot"></div>DPDP Non-Compliance</div>
                  <div className="ticker-item"><div className="ticker-dot"></div>Agentic Backdoors</div>
                </div>
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
              <p className="confirm-sub">Our GCC security architects will review your profile and send a tailored remediation blueprint - covering all three risk pillars your scan flagged.</p>

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
                <>
                  <button 
                    className="cta-primary" 
                    onClick={() => {
                      window.location.search = `?report=${createdLeadId}`;
                    }}
                    style={{ marginBottom: '16px', width: '100%' }}
                  >
                    View My Live Risk Report →
                  </button>

                  <button
                    className="cta-ghost"
                    onClick={() => {
                      const shareableLink = `https://sca1-t.netlify.app${window.location.pathname}?report=${createdLeadId}`;
                      const subject = encodeURIComponent("Gcc-Security-Risk Report");
                      const body = encodeURIComponent(`Hi,\n\nHere is your custom Gcc-Security-Risk Report.\n\nRisk Score: ${results?.avg}/100 (${results?.avg >= 70 ? 'Critical Exposure' : results?.avg >= 45 ? 'Moderate Risk' : 'Strong Foundation'})\n\nView full interactive report here:\n${shareableLink}\n\nBest regards,\nInstrek Technologies Team`);
                      window.location.href = `mailto:${form.email}?subject=${subject}&body=${body}`;
                    }}
                    style={{ marginBottom: '16px', width: '100%', border: '1px solid rgba(255,255,255,0.2)', color: '#fff' }}
                  >
                    📧 Email Report Link to Myself
                  </button>
                </>
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
