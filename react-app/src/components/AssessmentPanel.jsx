import React, { useState } from 'react';
import { CATEGORIES, QUESTIONS, WEIGHTS } from '../config/data.js';
import { useScoring } from '../hooks/useScoring.js';
import Seismograph from './Seismograph.jsx';

const ANS_COLORS = ['#f43f5e','#f59e0b','#60a5fa','#2dd4bf','#10b981'];
const ANS_LABELS = ['A','B','C','D','E'];

export default function AssessmentPanel({ sessionId, onClose, onComplete }) {
  const [catIdx, setCatIdx] = useState(0);
  const [qIdx, setQIdx] = useState(0);
  const [answers, setAnswers] = useState(() => {
    if (sessionId) {
      try {
        const saved = localStorage.getItem(`magneto_answers_${sessionId}`);
        if (saved) return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse saved answers from localStorage:', e);
      }
    }
    return {};
  });
  const { calculateOverallScore } = useScoring();

  const cat = CATEGORIES[catIdx];
  const catQuestions = QUESTIONS[cat.id];
  const q = catQuestions[qIdx];
  const totalAnswered = Object.keys(answers).length;
  const totalQ = CATEGORIES.reduce((a, c) => a + QUESTIONS[c.id].length, 0);
  const progress = Math.round((totalAnswered / totalQ) * 100);
  const ansKey = `${cat.id}_${qIdx}`;
  const currentAns = answers[ansKey];

  // live score estimate (Weighted)
  const liveScore = calculateOverallScore(answers);

  function selectAnswer(score) {
    const nextAnswers = {...answers, [ansKey]: score};
    setAnswers(nextAnswers);
    
    if (sessionId) {
      try {
        localStorage.setItem(`magneto_answers_${sessionId}`, JSON.stringify(nextAnswers));
      } catch (err) {
        console.error('Failed to save answers to localStorage:', err);
      }
    }
  }

  function next() {
    if (!currentAns) return;
    if (qIdx < catQuestions.length - 1) {
      setQIdx(qIdx + 1);
    } else if (catIdx < CATEGORIES.length - 1) {
      setCatIdx(catIdx + 1);
      setQIdx(0);
    } else {
      onComplete(answers);
    }
  }

  function back() {
    if (qIdx > 0) {
      setQIdx(qIdx - 1);
    } else if (catIdx > 0) {
      setCatIdx(catIdx - 1);
      setQIdx(QUESTIONS[CATEGORIES[catIdx - 1].id].length - 1);
    }
  }

  const isFirst = catIdx === 0 && qIdx === 0;
  const isLast = catIdx === CATEGORIES.length - 1 && qIdx === catQuestions.length - 1;

  return (
    <div id="assessment-overlay" className="open">
      <div className="assessment-panel">
        {/* Header */}
        <div className="panel-top">
          <div className="panel-top-left">
            <span className="panel-cat-badge" style={{background: cat.color+'15', color: cat.color, border:`1px solid ${cat.color}33`}}>
              {cat.icon} <span>{cat.name}</span>
            </span>
            <div className="panel-title">AI Readiness Assessment</div>
          </div>
          <button className="panel-close" onClick={onClose}>✕</button>
        </div>

        {/* Progress bar */}
        <div className="prog-wrap">
          <div className="prog-fill" style={{width: progress+'%', background:'var(--accent)'}} />
        </div>

        <div className="panel-scroll-area">
          {/* Live stats */}
          <div className="live-row">
            <div className="live-cell">
              <div className="live-val" style={{color: liveScore >= 70 ? 'var(--safe)' : liveScore >= 40 ? 'var(--warn)' : 'var(--danger)'}}>
                {liveScore > 0 ? liveScore+'%' : '-'}
              </div>
              <div className="live-lab">Live Score</div>
            </div>
            <div className="live-cell">
              <div className="live-val" style={{color: 'var(--blue)'}}>{totalAnswered}</div>
              <div className="live-lab">Answered</div>
            </div>
            <div className="live-cell">
              <div className="live-val" style={{color: 'var(--muted)'}}>{totalQ - totalAnswered}</div>
              <div className="live-lab">Remaining</div>
            </div>
            <div className="live-cell">
              <div className="live-val" style={{color: 'var(--purple)'}}>{progress}%</div>
              <div className="live-lab">Complete</div>
            </div>
          </div>

          {/* Seismograph Area */}
          <div className="seismo-bar">
            <div className="seismo-bar-label">SIGNAL ANALYSIS • LIVE</div>
            <Seismograph />
          </div>

          {/* Category nav */}
          <div className="cat-nav-strip">
            {CATEGORIES.map((c, i) => {
              const done = i < catIdx || (i === catIdx && qIdx === catQuestions.length - 1 && currentAns);
              return (
                <button
                  key={c.id}
                  className={`cat-nav-btn${i === catIdx ? ' active' : ''}${done ? ' done' : ''}`}
                  onClick={() => { setCatIdx(i); setQIdx(0); }}
                  style={i === catIdx ? {color: c.color, borderBottomColor: c.color} : {}}
                >
                  {c.shortName}
                </button>
              );
            })}
          </div>

          {/* Question Area */}
          <div className="q-area">
            <div className="q-meta">
              <span className="q-num">Q{qIdx + 1} OF {catQuestions.length}</span>
              <span className="q-tag" style={{background: cat.color+'15', color: cat.color}}>{cat.shortName.toUpperCase()}</span>
              <span className="q-weight">PRIORITY: {q.weight}</span>
            </div>
            <div className="q-text">{q.text}</div>
            <div className="q-dept">Context: {q.dept}</div>
            <div className="answers">
              {q.options.map((opt, i) => {
                const isSelected = currentAns === opt.score;
                return (
                  <button
                    key={i}
                    className="ans-btn"
                    onClick={() => selectAnswer(opt.score)}
                    style={{
                      background: isSelected ? 'var(--bg2)' : '#fff',
                      borderColor: isSelected ? cat.color : 'var(--border)',
                      borderWidth: isSelected ? 2 : 1
                    }}
                  >
                    <span className="ans-badge" style={{
                      background: isSelected ? cat.color : 'var(--bg2)',
                      color: isSelected ? '#fff' : ANS_COLORS[i]
                    }}>{ANS_LABELS[i]}</span>
                    <div className="ans-content">
                      <div className="ans-label" style={{color: isSelected ? 'var(--text)' : '#475569'}}>{opt.label}</div>
                      {opt.sub && <div className="ans-sub">{opt.sub}</div>}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Nav buttons */}
        <div className="panel-nav">
          <button className="btn-back" onClick={back} disabled={isFirst} style={{ opacity: isFirst ? 0.3 : 1 }}>← BACK</button>
          
          <div className="panel-nav-info">
             PILLAR {catIdx + 1} OF {CATEGORIES.length} • STAGE {qIdx + 1}
          </div>

          <button className="btn-next" onClick={next} disabled={!currentAns} style={{ opacity: !currentAns ? 0.3 : 1 }}>
            {isLast ? 'GET MY RESULTS →' : 'NEXT →'}
          </button>
        </div>
      </div>
    </div>
  );
}
