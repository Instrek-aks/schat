import React, { useState, useEffect } from 'react';
import Navigation from './components/Navigation.jsx';
import HeroSection from './components/HeroSection.jsx';
import CategoriesSection from './components/CategoriesSection.jsx';
import IntakeSection from './components/IntakeSection.jsx';
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

  // Check URL for report link on mount
  useEffect(() => {
    const path = window.location.pathname;
    if (path.startsWith('/report/')) {
      const token = path.split('/')[2];
      if (token) {
        fetchReport(token);
      }
    }
  }, []);

  async function fetchReport(token) {
    try {
      // Decode Base64 token in client
      const decoded = JSON.parse(decodeURIComponent(escape(window.atob(token))));
      setCompanyInfo(decoded.companyInfo);
      setAssessmentAnswers(decoded.answers);
      setView('results');
    } catch (err) {
      console.error('Error decoding report token client-side:', err);
      // Fallback: try calling backend in case it's an old DB-based token
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      try {
        const res = await fetch(`${apiUrl}/api/magneto/report/${token}`);
        if (res.ok) {
          const data = await res.json();
          setCompanyInfo(data.companyInfo);
          setAssessmentAnswers(data.answers);
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
    const clientSessionId = 'magneto_' + Math.random().toString(36).substring(2, 11);
    setSessionId(clientSessionId);

    setView('assessment');
    document.body.style.overflow = 'hidden';
  }

  function handleAssessmentComplete(answers) {
    setAssessmentAnswers(answers);
    setView('gate');
  }

  function handleGateSubmit(contactInfo) {
    const fullInfo = { ...companyInfo, ...contactInfo };
    setCompanyInfo(fullInfo);
    setView('results');
    document.body.style.overflow = 'auto';

    // Construct the full report payload
    const reportPayload = {
      companyInfo: fullInfo,
      answers: assessmentAnswers,
      createdAt: new Date().toISOString()
    };

    try {
      // Encode report payload into a Base64 string
      const token = window.btoa(unescape(encodeURIComponent(JSON.stringify(reportPayload))));
      // Update browser URL history state to point to /report/<token>
      window.history.pushState({}, '', `/report/${token}`);
      localStorage.setItem('magneto_report_token', token);

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
            <div class="header">Instrek Magneto</div>
            <p style="color: #A0AEC0; font-size: 15px;">Hi ${contactInfo.name || 'Leader'},</p>
            <p style="color: #A0AEC0; font-size: 15px; line-height: 1.6;">Thank you for completing the Magneto AI Readiness Assessment for <strong>${fullInfo.company || 'your organisation'}</strong>. Your custom AI transformation roadmap is ready.</p>
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

      fetch('/.netlify/functions/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: contactInfo.email,
          subject: 'Your Magneto AI Readiness Report',
          html: emailHtml
        })
      })
      .then(res => {
        if (!res.ok) {
          throw new Error(`HTTP error ${res.status}. Netlify functions are not hosted by the Vite dev server (run via netlify dev to test functions locally).`);
        }
        return res.json();
      })
      .then(data => console.log('Magneto email sent successfully:', data))
      .catch(err => console.warn('Email dispatch skipped or failed:', err.message));

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

  function scrollToCats() {
    document.getElementById('cats-section')?.scrollIntoView({behavior:'smooth'});
  }

  return (
    <div className="app-container">
      {view === 'loading' && (
        <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent)' }}>
          <h2>Loading your report...</h2>
        </div>
      )}

      {view === 'home' && (
        <>
          <Navigation onStartAssessment={scrollToIntake} />
          <HeroSection onStartAssessment={scrollToIntake} onLearnMore={scrollToCats} />
          <CategoriesSection onStartAssessment={scrollToIntake} />
          <IntakeSection onLaunch={handleLaunchAssessment} />
        </>
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
        />
      )}
    </div>
  );
}
