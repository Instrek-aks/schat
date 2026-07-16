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

// View states: 'home' | 'assessment' | 'gate' | 'results'
export default function App() {
  const [view, setView] = useState(() => {
    if (window.location.pathname.startsWith('/report/')) return 'loading';
    return 'home';
  });
  const [companyInfo, setCompanyInfo] = useState(null);
  const [assessmentAnswers, setAssessmentAnswers] = useState(null);
  const [sessionId, setSessionId] = useState(null);
  const [isIntakeOpen, setIsIntakeOpen] = useState(false);
  const [previewOnly, setPreviewOnly] = useState(false);

  // Check URL for report link on mount
  useEffect(() => {
    const path = window.location.pathname;
    if (path.startsWith('/report/')) {
      const token = path.substring('/report/'.length);
      if (token) {
        fetchReport(token);
      }
    }
  }, []);

  async function fetchReport(token) {
    try {
      // Decode URL-safe Base64 token → restore standard Base64 → parse JSON
      const standardB64 = token.replace(/-/g, '+').replace(/_/g, '/');
      const decoded = JSON.parse(decodeURIComponent(escape(window.atob(standardB64))));
      setCompanyInfo(decoded.companyInfo);
      setAssessmentAnswers(decoded.answers);
      setPreviewOnly(false);
      setView('results');
    } catch (err) {
      console.error('Error decoding report token client-side:', err);
      // Fallback: try calling backend in case it's an old DB-based token
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      try {
        const res = await fetch(`${apiUrl}/api/instrek/report/${token}`);
        if (res.ok) {
          const data = await res.json();
          setCompanyInfo(data.companyInfo);
          setAssessmentAnswers(data.answers);
          setPreviewOnly(false);
          setView('results');
        } else {
          setView('home');
        }
      } catch (e) {
        console.error('Fallback report fetch failed:', e);
        setView('home');
      }
    }
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
            <div class="header">Instrek AI Readiness Report</div>
            <p style="color: #A0AEC0; font-size: 15px;">Hi ${contactInfo.name || 'Leader'},</p>
            <p style="color: #A0AEC0; font-size: 15px; line-height: 1.6;">Thank you for completing the Instrek AI Readiness Assessment for <strong>${fullInfo.company || 'your organisation'}</strong>. Your custom AI transformation roadmap is ready.</p>
            <div class="score-card">
              <div class="score-title">AI Readiness Assessment</div>
              <p style="color: #00FFA3; font-size: 18px; font-weight: bold; margin-top: 10px;">Report Generated Successfully</p>
            </div>
            <a href="${shareableLink}" class="cta-btn">View My Dashboard</a>
            <div class="footer">
              <p>Instrek &copy; 2026. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `;

      // Send email via Netlify serverless function (API key stays server-side, never in browser)
      console.log('[Email] Sending report email to:', contactInfo.email);
      fetch('/.netlify/functions/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: contactInfo.email,
          subject: 'Your Instrek AI Readiness Report',
          html: emailHtml
        })
      })
      .then(async res => {
        const text = await res.text();
        console.log('[Email] Function response:', text);
        if (!res.ok) {
          throw new Error(`HTTP error ${res.status}: ${text}`);
        }
        console.log('[Email] Report email sent successfully!');
      })
      .catch(err => console.error('[Email] Dispatch failed:', err.message));

    } catch (err) {
      console.error('Failed to generate shareable report token:', err);
    }
  }

  function handleRestart() {
    setView('home');
    setCompanyInfo(null);
    setAssessmentAnswers(null);
    document.body.style.overflow = 'auto';
    window.history.pushState({}, '', '/');
    window.scrollTo({top: 0, behavior: 'smooth'});
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

          <Navigation onStartAssessment={() => setIsIntakeOpen(true)} />
          <HeroSection 
            onStartAssessment={() => setIsIntakeOpen(true)} 
            onLearnMore={scrollToDimensions} 
          />
          <TestimonialSection onStartAssessment={() => setIsIntakeOpen(true)} />
          <HowItWorksSection onStartAssessment={() => setIsIntakeOpen(true)} />
          <DimensionsGridSection onStartAssessment={() => setIsIntakeOpen(true)} />
          <StartNowSection onStartAssessment={() => setIsIntakeOpen(true)} />
          <Footer />
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
    </div>
  );
}
