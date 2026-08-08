import React, { useState, useEffect } from 'react';
import Navigation from './components/Navigation.jsx';
import HeroSection from './components/HeroSection.jsx';
import TestimonialSection from './components/TestimonialSection.jsx';
import HowItWorksSection from './components/HowItWorksSection.jsx';
import DimensionsGridSection from './components/DimensionsGridSection.jsx';
import StartNowSection from './components/StartNowSection.jsx';
import Footer from './components/Footer.jsx';
import IntakeModal from './components/IntakeModal.jsx';
import AssessmentPanel from './components/AssessmentPanel.jsx';
import GateForm from './components/GateForm.jsx';
import ResultsDashboard from './components/ResultsDashboard.jsx';

import AdminPanel from './components/AdminPanel.jsx';
import { adminDataService } from './services/adminDataService.js';

// View states: 'home' | 'assessment' | 'gate' | 'results' | 'admin'
export default function App() {
  const [view, setView] = useState(() => {
    const path = window.location.pathname;
    const search = window.location.search;
    if (path === '/admin' || search.includes('admin')) return 'admin';
    if (path.startsWith('/report/')) return 'loading';
    return 'home';
  });
  const [companyInfo, setCompanyInfo] = useState(null);
  const [assessmentAnswers, setAssessmentAnswers] = useState(null);
  const [sessionId, setSessionId] = useState(null);
  const [isIntakeOpen, setIsIntakeOpen] = useState(false);
  const [previewOnly, setPreviewOnly] = useState(false);

  // Check URL on mount: Admin stays Admin, report loads report token
  useEffect(() => {
    const path = window.location.pathname;
    const search = window.location.search;

    if (path === '/admin' || search.includes('admin')) {
      setView('admin');
      return;
    }

    if (path.startsWith('/report/')) {
      const token = path.replace('/report/', '');
      fetchReport(token);
      return;
    }
  }, []);

function decodeReportToken(rawToken) {
  if (!rawToken) return null;
  try {
    let cleanToken = rawToken.split('/')[0].split('?')[0].split('#')[0];
    let standardB64 = cleanToken.replace(/-/g, '+').replace(/_/g, '/');
    while (standardB64.length % 4 !== 0) {
      standardB64 += '=';
    }
    const decodedStr = decodeURIComponent(escape(window.atob(standardB64)));
    return JSON.parse(decodedStr);
  } catch (e) {
    try {
      let cleanToken = rawToken.split('/')[0].split('?')[0].split('#')[0];
      let standardB64 = cleanToken.replace(/-/g, '+').replace(/_/g, '/');
      while (standardB64.length % 4 !== 0) {
        standardB64 += '=';
      }
      return JSON.parse(window.atob(standardB64));
    } catch (e2) {
      return null;
    }
  }
}

  async function fetchReport(token) {
    // 1. Try decoding token directly
    const decoded = decodeReportToken(token);
    if (decoded && decoded.companyInfo && decoded.answers) {
      setCompanyInfo(decoded.companyInfo);
      setAssessmentAnswers(decoded.answers);
      setPreviewOnly(false);
      setView('results');
      localStorage.setItem('instrek_active_report_data', JSON.stringify({
        companyInfo: decoded.companyInfo,
        answers: decoded.answers,
        token
      }));
      return;
    }

    // 2. Check localStorage backup before giving up
    const savedReport = localStorage.getItem('instrek_active_report_data');
    if (savedReport) {
      try {
        const parsed = JSON.parse(savedReport);
        if (parsed.companyInfo && parsed.answers) {
          setCompanyInfo(parsed.companyInfo);
          setAssessmentAnswers(parsed.answers);
          setPreviewOnly(false);
          setView('results');
          return;
        }
      } catch (e) {}
    }

    // 3. Optional backend fallback
    const apiUrl = import.meta.env.VITE_API_URL;
    if (apiUrl) {
      try {
        const res = await fetch(`${apiUrl}/api/instrek/report/${token}`);
        if (res.ok) {
          const data = await res.json();
          if (data.companyInfo && data.answers) {
            setCompanyInfo(data.companyInfo);
            setAssessmentAnswers(data.answers);
            setPreviewOnly(false);
            setView('results');
            localStorage.setItem('instrek_active_report_data', JSON.stringify({
              companyInfo: data.companyInfo,
              answers: data.answers,
              token
            }));
            return;
          }
        }
      } catch (e) {}
    }

    setView('home');
  }

  function handleLaunchAssessment(info) {
    setCompanyInfo(info);
    
    // Generate a unique client-side session ID
    const clientSessionId = 'instrek_' + Math.random().toString(36).substring(2, 11);
    setSessionId(clientSessionId);

    setView('assessment');
    document.body.style.overflow = 'hidden';
  }

  function handleAssessmentComplete(answers) {
    setAssessmentAnswers(answers);
    setView('gate');
  }

  function handleGateSubmit(contactInfo) {
    const emailLower = contactInfo.email ? contactInfo.email.trim().toLowerCase() : '';
    const updatedContactInfo = { ...contactInfo, email: emailLower };
    const fullInfo = { ...companyInfo, ...updatedContactInfo };
    setCompanyInfo(fullInfo);
    setPreviewOnly(true);
    setView('results');
    document.body.style.overflow = 'auto';

    // Client-side & Backend submission recording for Admin Panel
    const magnetoPayload = {
      sessionId: sessionId || 'session_' + Date.now(),
      email: emailLower,
      name: updatedContactInfo.name || 'Leader',
      phone: updatedContactInfo.phone || '',
      company: fullInfo.company || 'Enterprise',
      role: fullInfo.role || 'Leader',
      size: fullInfo.size || '100-500',
      revenue: fullInfo.revenue || 'N/A',
      overallPct: 84,
      tier: 'Leader'
    };

    adminDataService.saveAiReadinessSubmission(magnetoPayload);

    // POST to Cloud DB for live site
    const endpoints = [
      import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api/magneto/gate` : null,
      '/.netlify/functions/save-lead'
    ].filter(Boolean);

    endpoints.forEach(url => {
      fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(magnetoPayload)
      }).catch(() => {});
    });

    // Construct the full report payload
    const reportPayload = {
      companyInfo: fullInfo,
      answers: assessmentAnswers,
      createdAt: new Date().toISOString()
    };

    try {
      // Encode as URL-safe Base64: replace + → - and / → _ so token has no URL path separators
      const token = window.btoa(unescape(encodeURIComponent(JSON.stringify(reportPayload))))
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');
      // Push /report URL so email link refresh works correctly
      window.history.pushState({}, '', `/report/${token}`);
      localStorage.setItem('instrek_report_token', token);
      localStorage.setItem('instrek_active_report_data', JSON.stringify({
        companyInfo: fullInfo,
        answers: assessmentAnswers,
        token
      }));

      const shareableLink = `${window.location.origin}/report/${token}`;

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
            .cta-btn { display: inline-block; background-color: #2563EB; color: #FFFFFF !important; text-decoration: none; font-weight: bold; padding: 14px 28px; border-radius: 6px; margin: 25px 0 15px; text-transform: uppercase; letter-spacing: 1px; }
            .footer { font-size: 11px; color: #5A6272; margin-top: 30px; line-height: 1.5; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">Instrek Technologies Report</div>
            <p style="color: #A0AEC0; font-size: 15px;">Hi ${contactInfo.name || 'Leader'},</p>
            <p style="color: #A0AEC0; font-size: 15px; line-height: 1.6;">Thank you for completing the Instrek Technologies Assessment for <strong>${fullInfo.company || 'your organisation'}</strong>. Your custom transformation roadmap is ready.</p>
            <div class="score-card">
              <div class="score-title">Instrek Technologies</div>
              <p style="color: #00FFA3; font-size: 18px; font-weight: bold; margin-top: 10px;">Report Generated Successfully</p>
            </div>
            <a href="${shareableLink}" class="cta-btn">View My Dashboard</a>
            <div class="footer">
              <p>Instrek Technologies &copy; 2026. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `;

      const generatePdfBase64 = () => {
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

        const compName = s(fullInfo.company || contactInfo.companyName || 'Enterprise');
        const userName = s(updatedContactInfo.name || contactInfo.fullName || 'Leader');
        const userEmail = s(contactInfo.email || emailLower);
        const dateStr = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });

        const scoreColor = overall >= 75 ? '0.06 0.73 0.50' : overall >= 50 ? '0.96 0.62 0.04' : '0.94 0.27 0.27';
        const tierLabel = tier.name || 'Enterprise AI Leader';

        // Helper to get score colors for categories
        const getCatColor = (score) => {
          if (score >= 75) return '0.02 0.59 0.41';
          if (score >= 50) return '0.85 0.47 0.02';
          return '0.86 0.15 0.15';
        };

        const catColors = catScores.map(score => getCatColor(score));

        // ── PAGE 1: Header + Score + Exec Summary + 4 Category Cards ──
        const p1Lines = [];
        
        // Top border accent
        p1Lines.push('q', '0.04 0.43 0.31 rg', '0 788 612 4 re f', 'Q');

        // Header
        p1Lines.push('BT', '0.05 0.1 0.2 rg', '/F2 16 Tf', '40 754 Td', '(INSTREK TECHNOLOGIES - AI READINESS) Tj', 'ET');
        p1Lines.push('BT', '0.4 0.45 0.55 rg', '/F1 8 Tf', '40 740 Td', '(GCC CONFIDENTIAL AI READINESS ASSESSMENT REPORT) Tj', 'ET');
        p1Lines.push('BT', '0.4 0.45 0.55 rg', '/F1 8 Tf', '450 754 Td', `(Date: ${s(dateStr)}) Tj`, 'ET');

        p1Lines.push('q', '0.88 0.91 0.93 rg', '40 728 532 1 re f', 'Q');

        // Prepared for subtitle
        p1Lines.push('BT', '0.1 0.15 0.25 rg', '/F2 11 Tf', '40 708 Td', `(Readiness Report for: ${compName} | Leader: ${userName}) Tj`, 'ET');

        // ── Score Card (Light Grey Box with color accent) ──
        p1Lines.push('q', '0.96 0.97 0.99 rg', '40 622 532 72 re f', 'Q');
        p1Lines.push('q', '0.88 0.91 0.93 rg', '40 622 532 72 re S', 'Q');
        p1Lines.push('q', `${scoreColor} rg`, '40 622 5 72 re f', 'Q');

        // Overall Score big text
        p1Lines.push('BT', `${scoreColor} rg`, '/F2 34 Tf', '60 644 Td', `(${overall}%) Tj`, 'ET');
        p1Lines.push('BT', '0.3 0.35 0.4 rg', '/F1 8 Tf', '60 632 Td', '(OVERALL READINESS INDEX) Tj', 'ET');

        // Tier badge
        p1Lines.push('q', `${scoreColor} rg`, '340 656 180 20 re f', 'Q');
        p1Lines.push('BT', '1 1 1 rg', '/F2 9 Tf', '355 662 Td', `(${s(tierLabel).toUpperCase()}) Tj`, 'ET');

        // Gauge bar background
        p1Lines.push('q', '0.88 0.91 0.93 rg', '340 638 180 5 re f', 'Q');
        const gaugeW = Math.round(180 * overall / 100);
        p1Lines.push('q', `${scoreColor} rg`, `340 638 ${gaugeW} 5 re f`, 'Q');

        // Executive summary text
        p1Lines.push('BT', '0.05 0.1 0.2 rg', '/F2 9 Tf', '40 598 Td', '(EXECUTIVE SUMMARY) Tj', 'ET');
        const execText = "Your organization has established a foundational AI posture. Critical gaps exist in modern data pipelines, shadow governance parameters, and operational resource scaling structures.";
        const execW = wrapText(execText, 110);
        let ey = 584;
        for (const line of execW) {
          p1Lines.push('BT', '0.4 0.45 0.5 rg', '/F1 9 Tf', `40 ${ey} Td`, `(${s(line)}) Tj`, 'ET');
          ey -= 11;
        }

        // Divider
        p1Lines.push('q', '0.88 0.91 0.93 rg', '40 560 532 1 re f', 'Q');

        // ── 4 Category Dimension Cards compacted on page 1 ──
        p1Lines.push('BT', '0.05 0.1 0.2 rg', '/F2 11 Tf', '40 540 Td', '(01. DIMENSION PERFORMANCE & BREAKDOWN) Tj', 'ET');

        let cy = 526;
        const dimensions = [
          { name: 'Strategy & Vision', score: catScores[0], desc: 'Alignment of technology pipelines with corporate scale, use-case mapping, and ROI frameworks.', color: catColors[0] },
          { name: 'Architecture & Data', score: catScores[1], desc: 'Unified RAG pipelines, data clean rooms, warehouse performance, and pipeline processing speeds.', color: catColors[1] },
          { name: 'Security & Compliance', score: catScores[2], desc: 'Zero-trust API key monitoring, DPDP regulatory audits, and post-quantum cryptographic roadmaps.', color: catColors[2] },
          { name: 'Talent & Operations', score: catScores[3], desc: 'Centre of excellence orchestration, developer skill fluency levels, and prompt ops management.', color: catColors[3] }
        ];

        dimensions.forEach((dim) => {
          p1Lines.push('q', '0.98 0.98 0.99 rg', `40 ${cy - 88} 532 80 re f`, 'Q');
          p1Lines.push('q', '0.90 0.92 0.94 rg', `40 ${cy - 88} 532 80 re S`, 'Q');
          p1Lines.push('q', `${dim.color} rg`, `40 ${cy - 88} 4 80 re f`, 'Q');
          
          p1Lines.push('BT', '0.05 0.1 0.2 rg', '/F2 10 Tf', `55 ${cy - 18} Td`, `(${dim.name}) Tj`, 'ET');
          p1Lines.push('BT', `${dim.color} rg`, '/F2 9 Tf', `480 ${cy - 18} Td`, `(Score: ${dim.score}%) Tj`, 'ET');
          
          const lines = wrapText(dim.desc, 90);
          let py = cy - 34;
          for (const line of lines) {
            p1Lines.push('BT', '0.4 0.45 0.5 rg', '/F1 8.5 Tf', `55 ${py} Td`, `(${s(line)}) Tj`, 'ET');
            py -= 11;
          }

          // Small progress bar
          p1Lines.push('q', '0.90 0.92 0.94 rg', `55 ${cy - 72} 460 3 re f`, 'Q');
          p1Lines.push('q', `${dim.color} rg`, `55 ${cy - 72} ${Math.round(460 * dim.score / 100)} 3 re f`, 'Q');

          cy -= 94;
        });

        // Footer Page 1
        p1Lines.push('q', '0.04 0.43 0.31 rg', '0 30 612 1 re f', 'Q');
        p1Lines.push('BT', '0.5 0.55 0.6 rg', '/F1 7 Tf', '40 18 Td', '(Instrek Technologies | Confidential AI Readiness Report | Page 1 of 2) Tj', 'ET');

        const p1Streams = p1Lines.join('\n');

        // ── PAGE 2: Roadmap phases + Next Action Plan Card ──
        const p2Lines = [];
        
        p2Lines.push('q', '0.04 0.43 0.31 rg', '0 788 612 4 re f', 'Q');
        p2Lines.push('BT', '0.05 0.1 0.2 rg', '/F2 10 Tf', '40 762 Td', '(INSTREK TECHNOLOGIES  |  ROADMAP & ACTION STRATEGY) Tj', 'ET');
        p2Lines.push('q', '0.88 0.91 0.93 rg', '40 750 532 1 re f', 'Q');

        // 100-Day Roadmap Section
        p2Lines.push('BT', '0.05 0.1 0.2 rg', '/F2 11 Tf', '40 724 Td', '(02. 100-DAY ACCELERATION ROADMAP) Tj', 'ET');

        const roadmapPhases = [
          { time: 'PHASE 1 (Days 1 - 30)', title: 'Eliminate critical security gaps, audit external flows, publish AUP.', color: '0.86 0.15 0.15' },
          { time: 'PHASE 2 (Days 31 - 70)', title: 'Deploy secure VPC instances, private RAG indexes, and Agent identities.', color: '0.85 0.47 0.02' },
          { time: 'PHASE 3 (Days 71 - 100)', title: 'Scale enterprise production, initiate AI Center of Excellence structures.', color: '0.02 0.59 0.41' }
        ];

        let ry = 690;
        p2Lines.push('q', '0.90 0.92 0.94 rg', '58 580 2 115 re f', 'Q');
        roadmapPhases.forEach((phase) => {
          p2Lines.push('q', `${phase.color} rg`, `50 ${ry - 2} 18 18 re f`, 'Q');
          p2Lines.push('BT', `${phase.color} rg`, '/F2 8.5 Tf', `80 ${ry + 8} Td`, `(${phase.time}) Tj`, 'ET');
          p2Lines.push('BT', '0.1 0.15 0.2 rg', '/F1 9.5 Tf', `80 ${ry - 4} Td`, `(${s(phase.title)}) Tj`, 'ET');
          ry -= 46;
        });

        // Benchmark Section
        p2Lines.push('BT', '0.05 0.1 0.2 rg', '/F2 11 Tf', '40 538 Td', '(03. INDUSTRY PERFORMANCE BENCHMARKS) Tj', 'ET');
        
        const bTop = 512;
        p2Lines.push('q', '0.96 0.97 0.99 rg', `40 ${bTop - 18} 532 18 re f`, 'Q');
        p2Lines.push('q', '0.88 0.91 0.93 rg', `40 ${bTop - 18} 532 18 re S`, 'Q');
        p2Lines.push('BT', '0.1 0.15 0.2 rg', '/F2 8 Tf', `50 ${bTop - 13} Td`, '(CAPABILITY) Tj', 'ET');
        p2Lines.push('BT', '0.1 0.15 0.2 rg', '/F2 8 Tf', `250 ${bTop - 13} Td`, '(PEER AVERAGE) Tj', 'ET');
        p2Lines.push('BT', '0.1 0.15 0.2 rg', '/F2 8 Tf', `400 ${bTop - 13} Td`, '(MATURITY GAP STATUS) Tj', 'ET');

        const benchmarksList = [
          ['AI Acceptable Use Policy', '41% set rules', 41, '0.85 0.47 0.02'],
          ['Private LLM VPC Deployment', '19% deployed', 19, '0.86 0.15 0.15'],
          ['Agentic Identity Scope', '11% operational', 11, '0.86 0.15 0.15'],
          ['NIST PQC Assessment Mapped', '18% completed', 18, '0.86 0.15 0.15']
        ];

        let ty = bTop - 18;
        benchmarksList.forEach((bm, i) => {
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

        // CTA Section (Light gray box with green top accent border)
        const ctaTop = ty - 25;
        p2Lines.push('q', '0.96 0.97 0.99 rg', `40 ${ctaTop - 85} 532 85 re f`, 'Q');
        p2Lines.push('q', '0.88 0.91 0.93 rg', `40 ${ctaTop - 85} 532 85 re S`, 'Q');
        p2Lines.push('q', '0.04 0.43 0.31 rg', `40 ${ctaTop - 2} 532 2 re f`, 'Q');

        p2Lines.push('BT', '0.06 0.53 0.35 rg', '/F2 9 Tf', `60 ${ctaTop - 18} Td`, '(YOUR NEXT ACTION PLAN) Tj', 'ET');
        p2Lines.push('BT', '0.05 0.1 0.2 rg', '/F2 10.5 Tf', `60 ${ctaTop - 36} Td`, '(This assessment surfaces critical gaps. Let\'s resolve them.) Tj', 'ET');
        p2Lines.push('BT', '0.35 0.4 0.45 rg', '/F1 8.5 Tf', `60 ${ctaTop - 54} Td`, '(Book a custom 30-min strategy review session: calendly.com/instrek/strategy) Tj', 'ET');
        p2Lines.push('BT', '0.35 0.4 0.45 rg', '/F1 8 Tf', `60 ${ctaTop - 70} Td`, '(Or contact us at: strategy@instrek.com  |  Visit: instrek.com) Tj', 'ET');

        // Button rectangle & Text
        p2Lines.push('q', '0.04 0.43 0.31 rg', `410 ${ctaTop - 50} 145 25 re f`, 'Q');
        p2Lines.push('BT', '1 1 1 rg', '/F2 8 Tf', `430 ${ctaTop - 42} Td`, '(BOOK CALL NOW) Tj', 'ET');

        // Footer Page 2
        p2Lines.push('q', '0.04 0.43 0.31 rg', '0 30 612 1 re f', 'Q');
        p2Lines.push('BT', '0.5 0.55 0.6 rg', '/F1 7 Tf', '40 18 Td', '(Instrek Technologies | Confidential AI Readiness Report | Page 2 of 2) Tj', 'ET');
        p2Lines.push('BT', '0.6 0.65 0.7 rg', '/F1 6 Tf', '40 8 Td', '(All details are subject to NDA. Instrek accepts no liability for decisions made solely on the basis of this assessment.) Tj', 'ET');

        const p2Streams = p2Lines.join('\n');

        let pdf = "%PDF-1.4\n";
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
        objects.push(`${objNum} 0 obj << /Length ${p1Streams.length} >>\nstream\n${p1Streams}\nendstream\nendobj`);
        objNum++;

        // Object 6: Page 2 content stream
        objects.push(`${objNum} 0 obj << /Length ${p2Streams.length} >>\nstream\n${p2Streams}\nendstream\nendobj`);
        objNum++;

        // Object 7: Font Helvetica (regular)
        objects.push(`${objNum} 0 obj << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> endobj`);
        objNum++;

        // Object 8: Font Helvetica-Bold
        objects.push(`${objNum} 0 obj << /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >> endobj`);
        objNum++;

        let pdfData = '%PDF-1.4\n';
        const offsets = [];
        for (const obj of objects) {
          offsets.push(pdfData.length);
          pdfData += obj + '\n';
        }

        const xrefOffset = pdfData.length;
        pdfData += 'xref\n';
        pdfData += `0 ${objNum}\n`;
        pdfData += '0000000000 65535 f \n';
        for (const offset of offsets) {
          pdfData += String(offset).padStart(10, '0') + ' 00000 n \n';
        }

        pdfData += `trailer << /Size ${objNum} /Root 1 0 R >>\n`;
        pdfData += 'startxref\n';
        pdfData += xrefOffset + '\n';
        pdfData += '%%EOF';

        return window.btoa(unescape(encodeURIComponent(pdfData)));
      };

      const pdfBase64 = generatePdfBase64();

      // Send email via Netlify serverless function (API key stays server-side, never in browser)
      console.log('[Email] Sending report email to:', contactInfo.email);
      fetch('/.netlify/functions/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: contactInfo.email,
          subject: 'Your Ai-readiness Report (PDF Attached)',
          html: emailHtml,
          attachments: [
            {
              filename: `AI_Readiness_Report_${(contactInfo.fullName || 'Report').replace(/[^a-zA-Z0-9]/g, '_')}.pdf`,
              content: pdfBase64
            }
          ]
        })
      })
      .then(async res => {
        const text = await res.text();
        console.log('[Email] Function response:', text);
        if (!res.ok) {
          throw new Error(`HTTP error ${res.status}: ${text}`);
        }
        console.log('[Email] Report email sent successfully with PDF!');
      })
      .catch(err => console.error('[Email] Dispatch failed:', err.message));

    } catch (err) {
      console.error('Failed to generate shareable report token:', err);
    }
  }

  function handleRestart() {
    localStorage.removeItem('instrek_active_report_data');
    if (window.location.pathname.startsWith('/report/')) {
      window.history.pushState({}, '', '/');
    }
    setView('home');
    setCompanyInfo(null);
    setAssessmentAnswers(null);
    document.body.style.overflow = 'auto';
    window.history.pushState({}, '', '/');
    window.scrollTo({top: 0, behavior: 'smooth'});
  }

  function handleOpenAdmin() {
    setView('admin');
    window.history.pushState({}, '', '/admin');
  }

  function scrollToIntake() {
    document.getElementById('intake-section')?.scrollIntoView({behavior:'smooth'});
  }

  function scrollToDimensions() {
    document.getElementById('dimensions-section')?.scrollIntoView({behavior:'smooth'});
  }

  return (
    <div className="app-container bg-bgDark min-h-screen text-slate-100 font-sans">
      {view === 'loading' && (
        <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent)' }}>
          <h2>Loading your report...</h2>
        </div>
      )}

      {view === 'home' && (
        <div className="relative overflow-hidden bg-[#070B14]">
          {/* Background Ambient Glows */}
          <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none -z-10">
            {/* Top Left Blue Glow */}
            <div className="absolute top-[-5%] left-[-15%] w-[60vw] h-[60vw] rounded-full bg-[#5B7CFF]/8 blur-[130px] animate-pulse-slow" />
            {/* Top Right Purple Glow */}
            <div className="absolute top-[2%] right-[-15%] w-[65vw] h-[65vw] rounded-full bg-[#A855F7]/8 blur-[140px] animate-pulse-slow" style={{ animationDelay: '3s' }} />
            {/* Mid Page glow */}
            <div className="absolute top-[25%] left-[10%] w-[50vw] h-[50vw] rounded-full bg-[#5B7CFF]/3 blur-[120px]" />
            {/* Quote Card Glow */}
            <div className="absolute top-[40%] right-[10%] w-[45vw] h-[45vw] rounded-full bg-[#A855F7]/3 blur-[120px]" />
            {/* Dimensions Section Glow */}
            <div className="absolute top-[65%] left-[50%] -translate-x-1/2 w-[60vw] h-[60vw] rounded-full bg-[#5B7CFF]/2 blur-[130px]" />
            {/* Bottom Glow */}
            <div className="absolute bottom-[2%] left-[50%] -translate-x-1/2 w-[80vw] h-[60vw] rounded-full bg-gradient-to-tr from-[#5B7CFF]/6 to-[#A855F7]/6 blur-[150px]" />
          </div>

          <Navigation 
            onStartAssessment={() => setIsIntakeOpen(true)} 
            onOpenAdmin={handleOpenAdmin}
          />
          <HeroSection 
            onStartAssessment={() => setIsIntakeOpen(true)} 
            onLearnMore={scrollToDimensions} 
            onOpenAdmin={handleOpenAdmin}
          />
          <TestimonialSection onStartAssessment={() => setIsIntakeOpen(true)} />
          <HowItWorksSection onStartAssessment={() => setIsIntakeOpen(true)} />
          <DimensionsGridSection onStartAssessment={() => setIsIntakeOpen(true)} />
          <StartNowSection onStartAssessment={() => setIsIntakeOpen(true)} />
          <Footer onOpenAdmin={handleOpenAdmin} />
          <IntakeModal 
            isOpen={isIntakeOpen} 
            onClose={() => setIsIntakeOpen(false)} 
            onLaunch={handleLaunchAssessment} 
          />
        </div>
      )}

      {/* Assessment overlay */}
      {view === 'assessment' && (
        <AssessmentPanel
          sessionId={sessionId}
          onClose={() => { setView('home'); document.body.style.overflow='auto'; }}
          onComplete={handleAssessmentComplete}
        />
      )}

      {/* Gate form */}
      {view === 'gate' && (
        <GateForm companyInfo={companyInfo} onSubmit={handleGateSubmit} />
      )}

      {/* Results dashboard */}
      {view === 'results' && (
        <ResultsDashboard
          answers={assessmentAnswers}
          companyInfo={companyInfo}
          onRestart={handleRestart}
          previewOnly={previewOnly}
        />
      )}

      {/* Admin Panel */}
      {view === 'admin' && (
        <AdminPanel onBack={() => { setView('home'); window.history.pushState({}, '', '/'); }} />
      )}


    </div>
  );
}
