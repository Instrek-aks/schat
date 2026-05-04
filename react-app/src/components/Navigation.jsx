export default function Navigation({ onStartAssessment }) {
  return (
    <nav>
      <div className="nav-logo">instrek</div>
      <div className="nav-center">AI READINESS • MAGNETO #2024</div>
      <button className="nav-cta" onClick={onStartAssessment}>Start Assessment</button>
    </nav>
  );
}
