import React, { useState } from 'react';
import { CATEGORIES, QUESTIONS, WEIGHTS } from '../config/data.js';
import { useScoring } from '../hooks/useScoring.js';
import Seismograph from './Seismograph.jsx';

const ANS_COLORS = ['#f43f5e','#f59e0b','#60a5fa','#2dd4bf','#10b981'];
const ANS_LABELS = ['A','B','C','D','E'];

export default function AssessmentPanel({ onClose, onComplete }) {
  const [catIdx, setCatIdx] = useState(0);
  const [qIdx, setQIdx] = useState(0);
  const [answers, setAnswers] = useState({});
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
    setAnswers(prev => ({...prev, [ansKey]: score}));
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
          <div className="panel-top-left" style={{display:'flex', alignItems:'center', gap:16}}>
            <span className="panel-cat-badge" style={{background: cat.color+'15', color: cat.color, border:`1px solid ${cat.color}33`, fontFamily:"'JetBrains Mono',monospace", fontSize:10, textTransform:'uppercase', padding:'4px 12px', borderRadius:100}}>
              {cat.icon} {cat.name}
            </span>
            <div className="panel-title" style={{fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:20}}>AI Readiness Assessment</div>
          </div>
          <button className="panel-close" onClick={onClose}>✕</button>
        </div>

        {/* Progress bar */}
        <div className="prog-wrap" style={{height:4, background:'var(--bg3)'}}>
          <div className="prog-fill" style={{width: progress+'%', height:'100%', background:'var(--accent)', transition:'width 0.6s cubic-bezier(0.4, 0, 0.2, 1)'}} />
        </div>

        {/* Live stats */}
        <div className="live-row">
          <div className="live-cell">
            <div className="live-val" style={{color: liveScore >= 70 ? 'var(--safe)' : liveScore >= 40 ? 'var(--warn)' : 'var(--danger)'}}>
              {liveScore > 0 ? liveScore+'%' : '—'}
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
        <div className="seismo-bar" style={{background:'var(--bg2)', padding:'12px 32px', borderBottom:'1px solid var(--border)'}}>
          <div className="seismo-bar-label" style={{fontFamily:"'JetBrains Mono',monospace", fontSize:9, letterSpacing:'0.16em', color:'var(--muted)', marginBottom:4}}>SIGNAL ANALYSIS • LIVE</div>
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
        <div className="q-area" style={{padding:48}}>
          <div className="q-meta" style={{display:'flex', gap:12, alignItems:'center', marginBottom:16}}>
            <span className="q-num" style={{fontFamily:"'JetBrains Mono',monospace", fontSize:11, color:'var(--muted)'}}>Q{qIdx + 1} OF {catQuestions.length}</span>
            <span className="q-tag" style={{background: cat.color+'15', color: cat.color, fontSize:10, padding:'2px 8px', borderRadius:4, fontWeight:600}}>{cat.shortName.toUpperCase()}</span>
            <span className="q-weight" style={{fontFamily:"'JetBrains Mono',monospace", fontSize:10, color:'var(--muted)'}}>PRIORITY: {q.weight}</span>
          </div>
          <div className="q-text" style={{fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:24, lineHeight:1.2, marginBottom:8}}>{q.text}</div>
          <div className="q-dept" style={{fontSize:13, color:'var(--muted)', marginBottom:32}}>Context: {q.dept}</div>
          <div className="answers" style={{display:'flex', flexDirection:'column', gap:10}}>
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
                    borderWidth: isSelected ? 2 : 1,
                    display:'flex', alignItems:'flex-start', gap:16, padding:20, borderRadius:12, cursor:'pointer', textAlign:'left', transition:'all 0.2s'
                  }}
                >
                  <span className="ans-badge" style={{
                    minWidth:28, height:28, borderRadius:6, display:'flex', alignItems:'center', justifyContent:'center',
                    background: isSelected ? cat.color : 'var(--bg2)',
                    color: isSelected ? '#fff' : ANS_COLORS[i],
                    fontFamily:"'JetBrains Mono',monospace", fontWeight:700, fontSize:12
                  }}>{ANS_LABELS[i]}</span>
                  <div style={{flex:1}}>
                    <div style={{fontWeight:700, fontSize:15, color: isSelected ? 'var(--text)' : '#475569'}}>{opt.label}</div>
                    {opt.sub && <div style={{color:'var(--muted)', fontSize:12, marginTop:4}}>{opt.sub}</div>}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Nav buttons */}
        <div className="panel-nav" style={{padding:'24px 48px', background:'var(--bg2)', borderTop:'1px solid var(--border)', display:'flex', alignItems:'center', justifyContent:'space-between'}}>
          <button className="btn-back" onClick={back} disabled={isFirst} style={{
            background:'transparent', border:'none', color:'var(--muted)', fontFamily:"'JetBrains Mono',monospace", fontSize:11, cursor:'pointer', opacity: isFirst ? 0.3 : 1
          }}>← BACK</button>
          
          <div style={{fontFamily:"'JetBrains Mono',monospace", fontSize:11, color:'var(--muted)', letterSpacing:'0.1em'}}>
             PILLAR {catIdx + 1} OF {CATEGORIES.length} • STAGE {qIdx + 1}
          </div>

          <button className="btn-next" onClick={next} disabled={!currentAns} style={{
            background: 'var(--accent)', color:'#fff', border:'none', padding:'12px 28px', borderRadius:8,
            fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:12, cursor:'pointer', transition:'all 0.2s',
            opacity: !currentAns ? 0.3 : 1
          }}>
            {isLast ? 'GET MY RESULTS →' : 'NEXT →'}
          </button>
        </div>
      </div>
    </div>
  );
}
