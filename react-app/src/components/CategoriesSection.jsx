import React from 'react';
import { CATEGORIES, QUESTIONS } from '../config/data.js';

export default function CategoriesSection({ onStartAssessment }) {
  return (
    <>
      <div className="stats-strip reveal">
        {[
          {num:'7', label:'Assessment Dimensions'},
          {num:'28', label:'Calibrated Questions'},
          {num:'5', label:'Scoring Levels per Question'},
          {num:'₹180Cr', label:'Avg. Opportunity Identified'},
          {num:'30d', label:'Remediation Sprint'},
        ].map((s,i) => (
          <div className="stat-cell" key={i}>
            <span className="stat-num">{s.num}</span>
            <div className="stat-label">{s.label}</div>
          </div>
        ))}
      </div>

      <section id="cats-section">
        <div className="section-eyebrow reveal">WHAT WE MEASURE</div>
        <h2 className="reveal reveal-delay-1">7 Dimensions of<br />AI Readiness</h2>
        <div className="cat-grid">
          {CATEGORIES.map((cat, i) => (
            <div
              className={`cat-card reveal reveal-delay-${(i % 3) + 1}`}
              key={cat.id}
              style={{'--cat-color': cat.color, animationDelay: `${0.1 * (i % 5)}s`}}
            >
              <div className="cat-num">0{i+1}</div>
              <span className="cat-icon">{cat.icon}</span>
              <div className="cat-name">{cat.name}</div>
              <div className="cat-desc">{cat.desc}</div>
              <div className="cat-q-count" style={{color: cat.color}}>{QUESTIONS[cat.id]?.length || 4} questions</div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
