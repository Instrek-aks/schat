import React, { useState } from 'react';
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
  const [view, setView] = useState('home');
  const [companyInfo, setCompanyInfo] = useState(null);
  const [assessmentAnswers, setAssessmentAnswers] = useState(null);
  const { calculateOverallScore } = useScoring();

  function handleLaunchAssessment(info) {
    setCompanyInfo(info);
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
      await fetch(`${apiUrl}/api/magneto/leads`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...fullInfo,
          scores: assessmentAnswers,
          overall: overallScore
        })
      });
    } catch (err) {
      console.error('Failed to submit lead:', err);
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
    <>
      {/* Main page (always rendered, hidden when results open) */}
      {/* Main page sections */}
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
    </>
  );
}
