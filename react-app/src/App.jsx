import React, { useState, useEffect } from 'react';
import Navigation from './components/Navigation.jsx';
import HeroSection from './components/HeroSection.jsx';
import CategoriesSection from './components/CategoriesSection.jsx';
import IntakeSection from './components/IntakeSection.jsx';
import AssessmentPanel from './components/AssessmentPanel.jsx';
import GateForm from './components/GateForm.jsx';
import ResultsDashboard from './components/ResultsDashboard.jsx';
import { useScoring } from './hooks/useScoring.js';

// View states: 'home' | 'assessment' | 'gate' | 'results'
export default function App() {
  const [view, setView] = useState(() => {
    if (window.location.pathname.startsWith('/report/')) return 'loading';
    return 'home';
  });
  const [companyInfo, setCompanyInfo] = useState(null);
  const [assessmentAnswers, setAssessmentAnswers] = useState(null);
  const [sessionId, setSessionId] = useState(null);
  const { calculateOverallScore, getTier } = useScoring();

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
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    try {
      const res = await fetch(`${apiUrl}/api/magneto/report/${token}`);
      if (res.ok) {
        const data = await res.json();
        setCompanyInfo(data.companyInfo);
        setAssessmentAnswers(data.answers);
        setView('results');
      } else {
        console.error('Report not found');
        setView('home'); // fallback
      }
    } catch (err) {
      console.error('Error fetching report:', err);
      setView('home');
    }
  }

  async function handleLaunchAssessment(info) {
    setCompanyInfo(info);
    
    // Call backend to start
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    try {
      const res = await fetch(`${apiUrl}/api/magneto/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ companyInfo: info })
      });
      const data = await res.json();
      setSessionId(data.sessionId);
    } catch (err) {
      console.error('Failed to start assessment:', err);
    }

    setView('assessment');
    document.body.style.overflow = 'hidden';
  }

  function handleAssessmentComplete(answers) {
    setAssessmentAnswers(answers);
    setView('gate');
  }

  async function handleGateSubmit(contactInfo) {
    const fullInfo = { ...companyInfo, ...contactInfo };
    const overallScore = calculateOverallScore(assessmentAnswers);
    
    setCompanyInfo(fullInfo);
    setView('results');
    document.body.style.overflow = 'auto';

    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    try {
      await fetch(`${apiUrl}/api/magneto/gate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          email: contactInfo.email,
          name: contactInfo.name || '',
          answers: assessmentAnswers,
          overallPct: overallScore,
          tier: getTier ? getTier(overallScore) : 'Assessed'
        })
      });
    } catch (err) {
      console.error('Failed to submit gate:', err);
    }
  }

  function handleRestart() {
    setView('home');
    setCompanyInfo(null);
    setAssessmentAnswers(null);
    document.body.style.overflow = 'auto';
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
