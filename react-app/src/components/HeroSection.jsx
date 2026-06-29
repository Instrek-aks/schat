import React, { useEffect, useRef } from 'react';
import { Radar } from 'react-chartjs-2';
import { Chart as ChartJS, RadialLinearScale, PointElement, LineElement, Filler, Tooltip } from 'chart.js';
import { CATEGORIES } from '../config/data.js';

ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip);

const HERO_VALS = [62,45,71,58,38,54,67];

export default function HeroSection({ onStartAssessment, onLearnMore }) {
  const radarData = {
    labels: CATEGORIES.map(c => c.shortName),
    datasets: [{
      label: 'Avg',
      data: HERO_VALS,
      borderColor: '#2563eb',
      backgroundColor: 'rgba(37, 99, 235, 0.2)',
      borderWidth: 2,
      pointBackgroundColor: '#fff',
      pointBorderColor: '#2563eb',
      pointRadius: 3,
    }]
  };

  const radarOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      r: {
        min: 0, max: 100,
        ticks: { display: false },
        grid: { color: 'rgba(255,255,255,0.08)' },
        angleLines: { color: 'rgba(255,255,255,0.08)' },
        pointLabels: {
          color: '#94a3b8',
          font: { family: "'JetBrains Mono',monospace", size: 9 }
        }
      }
    }
  };

  return (
    <section id="hero">
      <div className="hero-eyebrow reveal">ENTERPRISE AI READINESS ASSESSMENT</div>
      <h1 className="reveal reveal-delay-1">Is Your Organisation<br /><em>Ready for AI?</em></h1>
      <p className="hero-sub reveal reveal-delay-2">
        Instrek's Magneto assesses your AI readiness across 7 critical dimensions - Strategy, Business, Data, Technology, Security, People, and Operations. Get your board-ready score in minutes.
      </p>
      <div className="hero-actions reveal reveal-delay-3">
        <button className="btn-primary" onClick={onStartAssessment}>BEGIN ASSESSMENT →</button>
        <button className="btn-ghost" onClick={onLearnMore}>See Dimensions</button>
      </div>
      <div className="hero-visual reveal reveal-delay-4" style={{animationDelay: '0.4s'}}>
        <div className="hero-visual-label">SAMPLE MATURITY PROFILE — ANONYMISED ENTERPRISE</div>
        <div className="hero-chart-wrap">
          <div className="hero-radar-wrap">
            <Radar data={radarData} options={radarOptions} />
          </div>
          <div className="hero-dim-list">
            {CATEGORIES.map((c, i) => (
              <div className="hdim" key={c.id}>
                <span className="hdim-name">{c.shortName}</span>
                <div className="hdim-bar-wrap">
                  <div className="hdim-bar" style={{width: HERO_VALS[i]+'%', background: c.color}} />
                </div>
                <span className="hdim-val" style={{color: c.color}}>{HERO_VALS[i]}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
