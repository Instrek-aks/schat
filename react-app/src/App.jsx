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
        const sanitize = (str) => String(str || '').replace(/[()\\]/g, '');

        const compName = sanitize(fullInfo.company || contactInfo.companyName || 'Tt');
        const userName = sanitize(updatedContactInfo.name || contactInfo.fullName || 'Leader');
        const userEmail = sanitize(contactInfo.email || emailLower || 'connect@legalolympiad.com');
        const currentDate = sanitize(new Date().toLocaleDateString('en-GB')); // DD/MM/YYYY
        const shareableLink = `${window.location.origin}/report/${token}`;

        // PAGE 1 STREAMS
        const p1Streams = [
          // Header dark green badge top right
          "0.01 0.22 0.20 rg",
          "415 765 157 27 rect fill",
          
          // Header Logo & Text
          "BT",
          "0.01 0.22 0.20 rg",
          "/F2 16 Tf",
          "40 766 Td",
          "(INSTREK) Tj",
          "0 -14 Td",
          "/F1 9 Tf",
          "0.2 0.25 0.3 rg",
          "(TECHNOLOGIES) Tj",
          
          "430 782 Td",
          "1 1 1 rg",
          "/F2 7 Tf",
          "(CONFIDENTIAL) Tj",
          "0 -9 Td",
          "/F1 6.5 Tf",
          "(ASSESSMENT REPORT) Tj",
          "ET",

          // Main Title & Subtitle
          "BT",
          "0.05 0.08 0.12 rg",
          "/F2 26 Tf",
          "40 716 Td",
          "(Enterprise AI Readiness) Tj",
          "0 -28 Td",
          "0.04 0.43 0.31 rg",
          "/F1 22 Tf",
          "(Transformation Roadmap) Tj",
          "ET",

          // Accent line under title
          "0.04 0.43 0.31 rg",
          "40 678 532 2.5 rect fill",

          // Metadata Card Box
          "0.97 0.98 0.98 rg",
          "40 615 532 50 rect fill",
          "0.85 0.88 0.88 RG",
          "0.8 w",
          "40 615 532 50 rect stroke",

          // Vertical dividers in Metadata box
          "0.85 0.88 0.88 RG",
          "173 623 0.5 34 rect stroke",
          "306 623 0.5 34 rect stroke",
          "440 623 0.5 34 rect stroke",

          // Metadata labels & values
          "BT",
          "0.3 0.35 0.4 rg",
          "/F2 8 Tf",
          "85 648 Td",
          "(Organization) Tj",
          "0 -13 Td",
          "0.05 0.08 0.12 rg",
          "/F1 9 Tf",
          `(${compName}) Tj`,

          "BT",
          "0.3 0.35 0.4 rg",
          "/F2 8 Tf",
          "218 648 Td",
          "(Leader) Tj",
          "0 -13 Td",
          "0.05 0.08 0.12 rg",
          "/F1 9 Tf",
          `(${userName}) Tj`,

          "BT",
          "0.3 0.35 0.4 rg",
          "/F2 8 Tf",
          "351 648 Td",
          "(Work Email) Tj",
          "0 -13 Td",
          "0.05 0.08 0.12 rg",
          "/F1 8.5 Tf",
          `(${userEmail}) Tj`,

          "BT",
          "0.3 0.35 0.4 rg",
          "/F2 8 Tf",
          "485 648 Td",
          "(Date) Tj",
          "0 -13 Td",
          "0.05 0.08 0.12 rg",
          "/F1 9 Tf",
          `(${currentDate}) Tj`,
          "ET",

          // 01 EXECUTIVE SUMMARY & POSTURE Section Title
          "0.01 0.22 0.20 rg",
          "40 580 25 18 rect fill",
          "BT",
          "1 1 1 rg",
          "/F2 9 Tf",
          "47 585 Td",
          "(01) Tj",
          "72 585 Td",
          "0.01 0.22 0.20 rg",
          "/F2 10 Tf",
          "(EXECUTIVE SUMMARY & POSTURE) Tj",
          "ET",

          // Left Score Card Container
          "0.98 0.99 0.99 rg",
          "40 440 255 125 rect fill",
          "0.85 0.88 0.88 RG",
          "40 440 255 125 rect stroke",

          // Overall Readiness Score pill
          "0.01 0.22 0.20 rg",
          "52 546 150 16 rect fill",
          "BT",
          "1 1 1 rg",
          "/F2 7 Tf",
          "62 551 Td",
          "(OVERALL READINESS SCORE) Tj",
          "ET",

          // Circular Score Gauge representation
          "0.04 0.43 0.31 RG",
          "4 w",
          "112 485 34 0 360 arc stroke",
          "0.85 0.88 0.88 RG",
          "1 w",

          "BT",
          "0.05 0.08 0.12 rg",
          "/F2 26 Tf",
          "97 483 Td",
          "(84) Tj",
          "0 -14 Td",
          "0.3 0.35 0.4 rg",
          "/F1 10 Tf",
          "(/ 100) Tj",
          "ET",

          // Classification Tier Label & Pill
          "BT",
          "0.3 0.35 0.4 rg",
          "/F2 7.5 Tf",
          "185 496 Td",
          "(CLASSIFICATION TIER:) Tj",
          "ET",

          "0.01 0.22 0.20 rg",
          "180 472 105 18 rect fill",
          "BT",
          "1 1 1 rg",
          "/F2 7.5 Tf",
          "186 477 Td",
          "(Enterprise AI Leader) Tj",
          "ET",

          // Right Executive Summary Quote Card
          "0.94 0.97 0.96 rg",
          "310 440 262 125 rect fill",
          "0.75 0.85 0.82 RG",
          "310 440 262 125 rect stroke",

          "BT",
          "0.04 0.43 0.31 rg",
          "/F2 22 Tf",
          "325 536 Td",
          "(\") Tj",
          "0.05 0.08 0.12 rg",
          "/F2 9.5 Tf",
          "325 515 Td",
          "(Your organization has established a strong) Tj",
          "0 -13 Td",
          "(foundation across core enterprise AI dimensions.) Tj",
          "0 -22 Td",
          "0.2 0.25 0.3 rg",
          "/F1 8.5 Tf",
          "(This roadmap evaluates Data Readiness,) Tj",
          "0 -12 Td",
          "(Architecture, Security Governance, and) Tj",
          "0 -12 Td",
          "(AI Operations.) Tj",
          "ET",

          // 02 DIMENSION EVALUATION AT A GLANCE Section Title
          "0.04 0.43 0.31 rg",
          "40 405 25 18 rect fill",
          "BT",
          "1 1 1 rg",
          "/F2 9 Tf",
          "47 410 Td",
          "(02) Tj",
          "72 410 Td",
          "0.04 0.43 0.31 rg",
          "/F2 10 Tf",
          "(DIMENSION EVALUATION AT A GLANCE) Tj",
          "ET",

          // Dimensions Outer Box
          "0.98 0.99 0.99 rg",
          "40 235 532 155 rect fill",
          "0.85 0.88 0.88 RG",
          "40 235 532 155 rect stroke",

          // Row 1: Strategy & Vision
          "0.92 0.97 0.94 rg",
          "225 352 45 22 rect fill",
          "BT",
          "0.05 0.08 0.12 rg",
          "/F2 10 Tf",
          "80 358 Td",
          "(Strategy & Vision) Tj",
          "0.04 0.43 0.31 rg",
          "/F2 10 Tf",
          "235 358 Td",
          "(88%) Tj",
          "0.3 0.35 0.4 rg",
          "/F1 8.5 Tf",
          "290 358 Td",
          "(- Advanced alignment across leadership) Tj",
          "ET",

          // Row 2: Architecture & Data
          "0.90 0.95 0.98 rg",
          "225 316 45 22 rect fill",
          "BT",
          "0.05 0.08 0.12 rg",
          "/F2 10 Tf",
          "80 322 Td",
          "(Architecture & Data) Tj",
          "0.15 0.45 0.70 rg",
          "/F2 10 Tf",
          "235 322 Td",
          "(82%) Tj",
          "0.3 0.35 0.4 rg",
          "/F1 8.5 Tf",
          "290 322 Td",
          "(- Enterprise data governance in place) Tj",
          "ET",

          // Row 3: Security & Compliance
          "0.92 0.94 0.99 rg",
          "225 280 45 22 rect fill",
          "BT",
          "0.05 0.08 0.12 rg",
          "/F2 10 Tf",
          "80 286 Td",
          "(Security & Compliance) Tj",
          "0.20 0.35 0.85 rg",
          "/F2 10 Tf",
          "235 286 Td",
          "(85%) Tj",
          "0.3 0.35 0.4 rg",
          "/F1 8.5 Tf",
          "290 286 Td",
          "(- DPDP & GDPR compliance enforced) Tj",
          "ET",

          // Row 4: Talent & Operations
          "0.95 0.92 0.98 rg",
          "225 244 45 22 rect fill",
          "BT",
          "0.05 0.08 0.12 rg",
          "/F2 10 Tf",
          "80 250 Td",
          "(Talent & Operations) Tj",
          "0.50 0.20 0.75 rg",
          "/F2 10 Tf",
          "235 250 Td",
          "(81%) Tj",
          "0.3 0.35 0.4 rg",
          "/F1 8.5 Tf",
          "290 250 Td",
          "(- Scaling operational AI capabilities) Tj",
          "ET",

          // Page 1 Footer Bar
          "0.01 0.22 0.20 rg",
          "0 180 612 25 rect fill",
          "0.04 0.43 0.31 rg",
          "525 180 87 25 rect fill",
          "BT",
          "1 1 1 rg",
          "/F1 8 Tf",
          "40 189 Td",
          "(Confidential & Proprietary) Tj",
          "430 189 Td",
          "/F2 8 Tf",
          "(INSTREK TECHNOLOGIES) Tj",
          "565 189 Td",
          "/F2 11 Tf",
          "(01) Tj",
          "ET"
        ].join("\n");

        // PAGE 2 STREAMS
        const p2Streams = [
          // 03 DETAILED TRANSFORMATION ROADMAP Section Title
          "0.04 0.43 0.31 rg",
          "40 750 25 18 rect fill",
          "BT",
          "1 1 1 rg",
          "/F2 9 Tf",
          "47 755 Td",
          "(03) Tj",
          "72 755 Td",
          "0.04 0.43 0.31 rg",
          "/F2 9.5 Tf",
          "(DETAILED TRANSFORMATION ROADMAP & RECOMMENDATIONS) Tj",
          "ET",

          // Phase 1 Card
          "0.98 0.99 0.99 rg",
          "95 640 240 90 rect fill",
          "0.88 0.90 0.90 RG",
          "95 640 240 90 rect stroke",
          "BT",
          "0.04 0.43 0.31 rg",
          "/F2 7.5 Tf",
          "105 715 Td",
          "(PHASE 1:) Tj",
          "0 -10 Td",
          "/F2 8.5 Tf",
          "0.05 0.08 0.12 rg",
          "(FOUNDATIONAL SECURITY & GOVERNANCE) Tj",
          "0 -15 Td",
          "/F1 7.5 Tf",
          "0.2 0.25 0.3 rg",
          "(. Formalize GenAI usage policies and enforce) Tj",
          "0 -10 Td",
          "(  data residency controls across all teams.) Tj",
          "0 -14 Td",
          "(. Deploy zero-trust API gateways to prevent) Tj",
          "0 -10 Td",
          "(  sensitive IP leakage to third-party models.) Tj",
          "ET",

          // Phase 2 Card
          "0.98 0.99 0.99 rg",
          "95 530 240 90 rect fill",
          "0.88 0.90 0.90 RG",
          "95 530 240 90 rect stroke",
          "BT",
          "0.04 0.43 0.31 rg",
          "/F2 7.5 Tf",
          "105 605 Td",
          "(PHASE 2:) Tj",
          "0 -10 Td",
          "/F2 8.5 Tf",
          "0.05 0.08 0.12 rg",
          "(PRIVATE LLM & AGENTIC INFRASTRUCTURE) Tj",
          "0 -15 Td",
          "/F1 7.5 Tf",
          "0.2 0.25 0.3 rg",
          "(. Establish dedicated private model instances) Tj",
          "0 -10 Td",
          "(  with scoped role-based access control.) Tj",
          "0 -14 Td",
          "(. Implement agentic identity frameworks to) Tj",
          "0 -10 Td",
          "(  track and audit AI agent transactions.) Tj",
          "ET",

          // Phase 3 Card
          "0.98 0.99 0.99 rg",
          "95 420 240 90 rect fill",
          "0.88 0.90 0.90 RG",
          "95 420 240 90 rect stroke",
          "BT",
          "0.04 0.43 0.31 rg",
          "/F2 7.5 Tf",
          "105 495 Td",
          "(PHASE 3:) Tj",
          "0 -10 Td",
          "/F2 8.5 Tf",
          "0.05 0.08 0.12 rg",
          "(POST-QUANTUM READINESS & SCALING) Tj",
          "0 -15 Td",
          "/F1 7.5 Tf",
          "0.2 0.25 0.3 rg",
          "(. Conduct cryptographic inventory and align) Tj",
          "0 -10 Td",
          "(  migration timeline with NIST PQC standards.) Tj",
          "ET",

          // Vertical Roadmap line & nodes
          "0.04 0.43 0.31 RG",
          "1.5 w",
          "65 420 0 310 rect stroke",
          "0.04 0.43 0.31 rg",
          "65 685 5 0 360 arc fill",
          "65 575 5 0 360 arc fill",
          "65 465 5 0 360 arc fill",

          // 04 INDUSTRY BENCHMARKS & NEXT STEPS Section Title
          "0.01 0.22 0.20 rg",
          "350 750 25 18 rect fill",
          "BT",
          "1 1 1 rg",
          "/F2 9 Tf",
          "357 755 Td",
          "(04) Tj",
          "382 755 Td",
          "0.01 0.22 0.20 rg",
          "/F2 9 Tf",
          "(INDUSTRY BENCHMARKS) Tj",
          "382 743 Td",
          "(& NEXT STEPS) Tj",
          "ET",

          // Peer Benchmark Card
          "0.94 0.97 0.96 rg",
          "350 630 222 95 rect fill",
          "0.85 0.90 0.88 RG",
          "350 630 222 95 rect stroke",
          "BT",
          "0.05 0.08 0.12 rg",
          "/F1 9 Tf",
          "415 690 Td",
          "(Your organisation ranks in the) Tj",
          "0 -15 Td",
          "/F2 11 Tf",
          "0.04 0.43 0.31 rg",
          "(top 15%) Tj",
          "48 0 Td",
          "0.05 0.08 0.12 rg",
          "/F1 9 Tf",
          "( of peer enterprise) Tj",
          "-48 -14 Td",
          "(AI readiness assessments.) Tj",
          "ET",

          // Schedule Strategy Review Card (Dark Green)
          "0.01 0.22 0.20 rg",
          "350 420 222 190 rect fill",
          "BT",
          "1 1 1 rg",
          "/F2 10 Tf",
          "400 560 Td",
          "(Schedule a 30-minute strategy) Tj",
          "0 -14 Td",
          "(review with Instrek Architects:) Tj",
          "ET",

          // VIEW MY FULL REPORT / CALL TO ACTION BUTTON (Exact requested redirection button)
          "1 1 1 rg",
          "365 465 192 34 rect fill",
          "BT",
          "0.01 0.22 0.20 rg",
          "/F2 9 Tf",
          "382 478 Td",
          "(VIEW MY FULL REPORT) Tj",
          "ET",

          // Page 2 Bottom Footer
          "BT",
          "0.3 0.35 0.4 rg",
          "/F1 7.5 Tf",
          "40 190 Td",
          "(Instrek Technologies - Governed by DPDP Act & GDPR compliance standards.) Tj",
          "440 190 Td",
          "(Confidential & Proprietary) Tj",
          "ET",

          "0.04 0.43 0.31 rg",
          "530 180 82 25 rect fill",
          "BT",
          "1 1 1 rg",
          "/F2 11 Tf",
          "565 189 Td",
          "(02) Tj",
          "ET"
        ].join("\n");

        // Assemble standard PDF objects with Link Annotation on Page 2 button rectangle
        let pdf = "%PDF-1.4\n";
        pdf += "1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj\n";
        pdf += "2 0 obj << /Type /Pages /Kids [3 0 R 4 0 R] /Count 2 >> endobj\n";
        pdf += "3 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 5 0 R /Resources << /Font << /F1 7 0 R /F2 8 0 R >> >> >> endobj\n";
        
        // Page 2 object contains Annotations array pointing to link object 9 0 R
        pdf += "4 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 6 0 R /Annots [9 0 R] /Resources << /Font << /F1 7 0 R /F2 8 0 R >> >> >> endobj\n";
        
        pdf += "7 0 obj << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> endobj\n";
        pdf += "8 0 obj << /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >> endobj\n";

        // Interactive Link Annotation Object for "VIEW MY FULL REPORT" button on Page 2
        pdf += `9 0 obj << /Type /Annot /Subtype /Link /Rect [365 465 557 499] /Border [0 0 0] /A << /Type /Action /S /URI /URI (${shareableLink}) >> >> endobj\n`;

        pdf += `5 0 obj << /Length ${p1Streams.length} >>\nstream\n${p1Streams}\nendstream\nendobj\n`;
        pdf += `6 0 obj << /Length ${p2Streams.length} >>\nstream\n${p2Streams}\nendstream\nendobj\n`;

        pdf += [
          "xref",
          "0 10",
          "0000000000 65535 f ",
          "0000000009 00000 n ",
          "0000000058 00000 n ",
          "0000000121 00000 n ",
          "0000000256 00000 n ",
          "0000000620 00000 n ",
          "0000000760 00000 n ",
          "0000000380 00000 n ",
          "0000000450 00000 n ",
          "0000000520 00000 n ",
          "trailer << /Size 10 /Root 1 0 R >>",
          "startxref",
          "900",
          "%%EOF"
        ].join("\n");

        return window.btoa(unescape(encodeURIComponent(pdf)));
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
