INSTREK  |  MAGNETO AI READINESS PLATFORM  —  Developer Technical Documentation 
INSTREK 
MAGNETO 
AI Readiness Assessment Platform 
DEVELOPER TECHNICAL DOCUMENTATION 
Scoring Logic  ·  Architecture  ·  Integration Guide  ·  Report Engine 
Document Version 
Classification 
v1.0 — Initial Release 
Product 
Confidential — Developer Use 
Only 
Client 
Magneto AI Readiness Platform 
Year 
Instrek 
2026 
This document provides complete technical specifications for implementing the Magneto AI Readiness 
Assessment platform, including all scoring logic, calculation engines, report generation rules, and integration 
patterns. 
1.  Platform Overview 
1.1  What is Magneto? 
Magneto is Instrek's enterprise AI Readiness Assessment platform. It evaluates an organisation's 
readiness to adopt, deploy, and scale Artificial Intelligence across 7 critical dimensions derived from 
Instrek's proprietary AI Readiness Questionnaire. The platform delivers a scored maturity report, risk 
quantification, opportunity identification, and a 100-day transformation roadmap. 
Developer Technical Documentation  v1.0  |  Confidential — Instrek Internal 
INSTREK  |  MAGNETO AI READINESS PLATFORM  —  Developer Technical Documentation 
1.2  Assessment Architecture 
The platform follows a 5-stage flow: 
1. Company Intake — Captures organisation profile (name, industry, revenue, size, role, AI 
investment level). 
2. Assessment — 22 weighted questions across 7 dimensions. Each question has 5 scored options 
(1–5). 
3. Email Gate — Corporate email verification before results are revealed. 
4. Report Generation — All scoring, benchmarking, risk calculation, and roadmap logic executes 
client-side in JavaScript. 
5. Results Dashboard — Interactive multi-section report with radar chart, dimension breakdown, risk 
cards, opportunity table, and roadmap. 
The current prototype is a single-file HTML/JS/CSS application with no backend dependency. All 
logic runs in the browser. For production, the developer should migrate the assessment engine 
and report generation to a server-side API. 
1.3  Technology Stack (Current Prototype) 
Layer 
Technology 
Frontend 
Notes 
Charts 
HTML5 / CSS3 / Vanilla JS Single-file SPA. No framework. 
Fonts 
Chart.js v4.4.1 (CDN) Radar chart, gauge, bar charts. 
Data Store 
Google Fonts (CDN) Syne, JetBrains Mono, DM Sans. 
Logo 
Browser memory (JS objects) No persistence. Session only. 
Base64 embedded PNG 
Instrek_Logo_White.png embedded. 
2.  Question Bank & Dimensions 
2.1  The 7 Assessment Dimensions 
All 22 questions are sourced directly from the Instrek AI Readiness Questionnaire 
(AI_Readiness_Questionnaire.xlsx). They are mapped to 7 dimensions as follows: 
# 
Dimension 
ID (code) 
Q 
Count 
01 Company Strategy 
strategy 
3 
What it measures 
AI/ML strategy alignment, executive 
sponsorship, ROI-based use case 
prioritisation. 
Developer Technical Documentation  v1.0  |  Confidential — Instrek Internal 
INSTREK  |  MAGNETO AI READINESS PLATFORM  —  Developer Technical Documentation 
Developer Technical Documentation  v1.0  |  Confidential — Instrek Internal 
02 Business Functions business 3 AI adoption across BUs, KPI definition, 
IT-business collaboration. 
03 Data Readiness data 4 Data centralisation, quality, governance, 
cataloguing, historical availability. 
04 Technology technology 3 Scalable infrastructure, ML tooling, data 
engineering, API integration layers. 
05 Security & 
Governance 
security 3 Data privacy, regulatory compliance 
(DPDP/GDPR), RBAC, ethical AI policies. 
06 People & Talent people 3 AI/ML expertise, employee AI awareness, 
change management for adoption. 
07 Operations & MLOps operations 3 MLOps practices, model monitoring, drift 
detection, AI workflow integration. 
 TOTAL  22  
 
 
2.2  Answer Scoring Scale 
Every question has exactly 5 answer options scored on a fixed integer scale: 
 
Score Label Meaning 
1 Critical Gap Not implemented. Organisation is completely exposed or unaware. 
2 Early Stage Awareness exists but no formal implementation. Ad-hoc or 
informal only. 
3 Developing Partial implementation. Covers some areas but significant gaps 
remain. 
4 Capable Mostly implemented with minor gaps. Systematic approach in 
place. 
5 Leader / Best-in
Class 
Fully implemented, continuously improved, and competitive 
differentiator. 
 
 
3.  Scoring Engine — Calculation Logic 
3.1  Per-Question Score 
Each question answered by the user stores a raw integer score (1–5) in a JavaScript answers object 
indexed by dimension and question index: 
INSTREK  |  MAGNETO AI READINESS PLATFORM  —  Developer Technical Documentation 
Developer Technical Documentation  v1.0  |  Confidential — Instrek Internal 
 
// answers[dimensionIndex][questionIndex] = score (integer 1–5) 
  
answers = { 
  0: { 0: 4, 1: 3, 2: 5 },   // strategy: Q1=4, Q2=3, Q3=5 
  1: { 0: 2, 1: 3, 2: 2 },   // business 
  2: { 0: 1, 1: 2, 2: 3, 3: 2 }, // data (4 questions) 
  3: { 0: 3, 1: 4, 2: 3 },   // technology 
  4: { 0: 2, 1: 3, 2: 2 },   // security 
  5: { 0: 3, 1: 4, 2: 3 },   // people 
  6: { 0: 2, 1: 3, 2: 3 },   // operations 
} 
 
3.2  Dimension Score 
Each dimension is scored as a percentage of maximum possible points for that dimension: 
 
function calcCatScore(catIndex) { 
  const d = answers[catIndex]; 
  const pts = Object.values(d).reduce((acc, score) => acc + score, 0); 
  const max = Object.keys(d).length * 5;  // 5 = max score per question 
  return max ? Math.round(pts / max * 100) : 0; 
} 
  
// Example — Data Readiness (4 questions, scores: 1,2,3,2) 
// pts = 1+2+3+2 = 8 
// max = 4 × 5 = 20 
// score = round(8/20 × 100) = 40% 
 
Note: Each dimension is weighted equally in the overall score. There is no per-question weighting 
in the current engine — the "weight" labels (High/Medium) on questions are displayed for 
respondent context only and do not affect the mathematical calculation. A weighted model is 
described in Section 3.6. 
 
3.3  Overall Maturity Score (OMS) 
The Overall Maturity Score is the simple arithmetic mean of all 7 dimension scores: 
 
const dimScores = CATEGORIES.map((_, i) => calcCatScore(i)); 
// dimScores = [80, 47, 40, 60, 47, 67, 53]  ← example 
  
const overall = Math.round( 
  dimScores.reduce((sum, s) => sum + s, 0) / CATEGORIES.length 
); 
// overall = round((80+47+40+60+47+67+53) / 7) 
// overall = round(394 / 7) 
// overall = round(56.28) 
// overall = 56% 
 
3.4  Maturity Tier Classification 
The OMS maps to one of 5 named maturity tiers. Thresholds are fixed and not configurable via UI: 
INSTREK  |  MAGNETO AI READINESS PLATFORM  —  Developer Technical Documentation 
Developer Technical Documentation  v1.0  |  Confidential — Instrek Internal 
 
Tier Name OMS Range Display 
Colour Description 
Laggard 0 – 24% #EF4444 
(Red) 
Critical foundational gaps. AI cannot deliver value 
at scale without urgent remediation. 
Explorer 25 – 44% #F59E0B 
(Amber) 
AI journey started but critical gaps across 
multiple dimensions limit progress. 
Builder 45 – 61% #60A5FA 
(Blue) 
Meaningful capability with inconsistency. Closing 
weakest dimension is highest leverage. 
Scaler 62 – 77% #2DD4BF 
(Teal) 
Strong foundations and growing deployment. 
Focus on systematising and governing AI. 
Leader 78 – 100% #10B981 
(Green) 
Top-tier AI readiness. Challenge is compounding 
the advantage and deepening AI into the core 
business model. 
 
function getTier(pct) { 
  if (pct < 25) return { name: "Laggard",  color: "var(--danger)" }; 
  if (pct < 45) return { name: "Explorer", color: "var(--warn)"   }; 
  if (pct < 62) return { name: "Builder",  color: "#60a5fa"       }; 
  if (pct < 78) return { name: "Scaler",   color: "var(--teal)"   }; 
  return              { name: "Leader",   color: "var(--safe)"   }; 
} 
 
 
3.5  Industry Benchmark Comparison 
Each dimension score is compared against industry benchmark averages. Benchmarks are hard-coded 
in the INDUSTRY_BENCHMARKS object and represent anonymised aggregate data from 340+ 
enterprise assessments (2025–2026). 
 
const INDUSTRY_BENCHMARKS = { 
  "BFSI":          { strategy:55, business:45, data:40, technology:48, security:52, 
people:38, operations:42 }, 
  "Fintech":       { strategy:62, business:52, data:55, technology:60, security:48, 
people:50, operations:56 }, 
  "Healthcare":    { strategy:42, business:38, data:35, technology:40, security:50, 
people:30, operations:36 }, 
  "Retail & FMCG": { strategy:48, business:46, data:42, technology:45, security:35, 
people:38, operations:44 }, 
  "Manufacturing": { strategy:40, business:38, data:34, technology:42, security:36, 
people:30, operations:38 }, 
  "Technology":    { strategy:70, business:62, data:68, technology:72, security:58, 
people:65, operations:66 }, 
  "Logistics":     { strategy:44, business:40, data:36, technology:44, security:38, 
people:32, operations:42 }, 
  "Education":     { strategy:35, business:32, data:28, technology:34, security:30, 
people:30, operations:28 }, 
  "Other":         { strategy:45, business:40, data:38, technology:44, security:38, 
people:35, operations:40 }, 
}; 
  
// Benchmark delta displayed per dimension: 
INSTREK  |  MAGNETO AI READINESS PLATFORM  —  Developer Technical Documentation 
Developer Technical Documentation  v1.0  |  Confidential — Instrek Internal 
const diff = dimScore - benchmarkScore; 
// Positive diff = above average (shown in green with + prefix) 
// Negative diff = below average (shown in red) 
 
3.6  Weighted Scoring (Recommended for Production) 
The current prototype uses equal weighting across all questions and dimensions. For production, 
Instrek recommends implementing the following weighted model: 
 
The "High Weight" and "Medium Weight" labels visible on questions in the assessment UI are for 
respondent context only. They do NOT currently affect the mathematical score. Implement the 
model below to activate true weighted scoring. 
 
// Recommended question-level weight multipliers 
const WEIGHT = { 
  "High Weight":   1.5,   // multiplied into score before aggregation 
  "Medium Weight": 1.0, 
  "Low Weight":    0.7, 
}; 
  
// Weighted dimension score: 
function calcWeightedScore(catIndex) { 
  let weightedSum = 0; 
  let weightedMax = 0; 
  QUESTIONS[CATEGORIES[catIndex].id].forEach((q, qi) => { 
    const w = WEIGHT[q.weight] || 1.0; 
    const score = answers[catIndex][qi] || 0; 
    weightedSum += score * w; 
    weightedMax += 5 * w; 
  }); 
  return weightedMax ? Math.round(weightedSum / weightedMax * 100) : 0; 
} 
 
 
4.  Report Engine — Output Calculations 
4.1  Risk & Financial Exposure 
The report generates 6 risk/opportunity cards with estimated financial values. These are derived from 
the company revenue input and the Overall Maturity Score. The developer must note these are 
indicative estimates, not audited figures. 
 
Risk Card Formula Logic 
Regulatory / 
Compliance 
revMult × (1 − OMS/100) × 0.35 35% of maximum exposure scales 
with maturity gap. 
Lost Revenue Upside revMult × 0.18 × (1 − OMS/100) 18% AI revenue uplift 
benchmark, scaled by gap. 
INSTREK  |  MAGNETO AI READINESS PLATFORM  —  Developer Technical Documentation 
Developer Technical Documentation  v1.0  |  Confidential — Instrek Internal 
Operational Inefficiency revMult × 0.12 × (1 − OMS/100) 12% productivity gain benchmark, 
scaled by gap. 
Competitive Risk "18–24 month lag" (qualitative) Fixed qualitative label. No 
formula. 
Talent Risk "High risk" (qualitative) Fixed qualitative label. No formula. 
Agentic AI Gap "Critical" (qualitative) Fixed qualitative label. No 
formula. 
 
Revenue multipliers (revMult) are mapped from the revenue band selected in the intake form: 
 
const revMult = { 
  "Under ₹50 Cr":      30, 
  "₹50–250 Cr":      100, 
  "₹250–1000 Cr":    300, 
  "₹1000–5000 Cr":  1000, 
  "₹5000 Cr+":        2500, 
}[companyInfo.revenue] || 200; 
  
// Example — Company with ₹500 Cr revenue, OMS = 40%: 
// revMult = 300 
// Penalty exposure = 300 × (1 - 0.40) × 0.35 = 300 × 0.60 × 0.35 = ₹63 Cr 
// Lost revenue     = 300 × 0.18 × 0.60 = ₹32.4 Cr/yr 
// Inefficiency     = 300 × 0.12 × 0.60 = ₹21.6 Cr/yr 
 
4.2  Dimension Finding Text 
Each dimension card in the report shows a qualitative finding paragraph. The text is selected from a 
pre-written findings library (CAT_FINDINGS object in JS) based on the dimension score tier: 
 
function getCatFinding(catId, pct) { 
  const f = CAT_FINDINGS[catId];  // object with .low, .mid, .high 
  if (pct < 45) return f.low;     // Critical or Explorer tier 
  if (pct < 70) return f.mid;     // Builder or lower Scaler 
  return f.high;                  // Scaler or Leader 
} 
  
// Thresholds: 
//   pct < 45  → "low"  finding (critical gap narrative) 
//   45–69     → "mid"  finding (developing narrative) 
//   70+       → "high" finding (strength narrative) 
 
4.3  Benchmark Delta Display 
// For each dimension in the benchmark section: 
const yours = catScores[i];            // user's dimension score (0–100) 
const avg   = bench[cat.id];           // industry benchmark value 
const diff  = yours - avg;             // delta 
  
// Display rules: 
// diff >= 0 → colour: green (#10B981),  prefix: "+" 
// diff < 0  → colour: red (#F43F5E),    prefix: "" (negative shown) 
  
INSTREK  |  MAGNETO AI READINESS PLATFORM  —  Developer Technical Documentation 
Developer Technical Documentation  v1.0  |  Confidential — Instrek Internal 
// Visual bar: two overlapping bars on same baseline 
// "yours" bar fills to the user score % 
// A vertical marker line sits at the benchmark % 
 
 
4.4  Radar Chart Data 
The radar chart plots two datasets simultaneously — the user's dimension scores and the industry 
benchmark scores: 
 
// Chart.js radar config: 
datasets: [ 
  { 
    label: "Your Score", 
    data: catScores,           // [80, 47, 40, 60, 47, 67, 53] 
    borderColor: "#2563eb", 
    backgroundColor: "rgba(37,99,235,0.12)", 
  }, 
  { 
    label: "Industry Avg", 
    data: benchVals,           // from INDUSTRY_BENCHMARKS[industry] 
    borderColor: "rgba(255,255,255,0.2)", 
    borderDash: [6, 4],        // dashed line for benchmark 
  } 
] 
  
// Scale: 0–100. Axis labels use dimension shortNames. 
// Point colours: each point uses its dimension colour. 
 
4.5  Score Gauge 
The semicircular gauge is drawn on an HTML5 Canvas element. It uses three colour zones to convey 
maturity: 
 
function drawGauge(pct, tierColor) { 
  const cx = W/2, cy = H*0.75; 
  const radius = Math.min(W, H) * 0.68; 
  
  // Background arc (full semicircle, transparent grey) 
  ctx.arc(cx, cy, radius, Math.PI, 2*Math.PI); 
  
  // Three colour zone arcs (0–33% red, 33–62% amber, 62–100% blue): 
  //  [0, 0.33]  → #EF4444 (danger) 
  //  [0.33,0.62]→ #F59E0B (warning) 
  //  [0.62, 1]  → #2563EB (safe/blue) 
  
  // Value arc: filled from 0 to (pct/100 × π radians) 
  const endAngle = Math.PI + (pct/100) * Math.PI; 
  ctx.strokeStyle = tierColor;  // uses the tier's display colour 
  ctx.shadowBlur = 12; 
  ctx.shadowColor = tierColor;  // glowing effect 
  
  // Needle dot at arc endpoint 
  ctx.arc(endX, endY, 8, 0, 2*Math.PI); 
  ctx.fillStyle = tierColor; 
} 
INSTREK  |  MAGNETO AI READINESS PLATFORM  —  Developer Technical Documentation 
Developer Technical Documentation  v1.0  |  Confidential — Instrek Internal 
 
 
4.6  100-Day Roadmap Logic 
The roadmap is currently static — 3 fixed phases with pre-written action items. In the production build, 
these should be made dynamic based on the user's weakest dimensions: 
 
Phase Timeline Logic for Dynamic Generation 
Phase 1 — 
Foundation 
Days 1–30 Inject action items targeting the 2–3 dimensions with scores 
below 40%. Prioritise Security and Strategy if they are in the 
bottom tier. 
Phase 2 — 
Acceleration 
Days 31–70 Focus on deploying AI use cases and closing gaps in Data 
and Technology dimensions. Inject dimension-specific 
actions for any dimension scoring 40–60%. 
Phase 3 — 
Scale & Lead 
Days 71–100 Board-level governance, scaling of successful pilots, and 
external positioning. Always appears in Phase 3 regardless of 
scores. 
 
// Recommended dynamic roadmap trigger logic: 
const criticalDims  = CATEGORIES.filter((c, i) => catScores[i] < 40); 
const developingDims = CATEGORIES.filter((c, i) => catScores[i] >= 40 && catScores[i] < 
60); 
  
// Phase 1 actions = criticalDims.map(d => ACTION_LIBRARY[d.id].urgent) 
// Phase 2 actions = developingDims.map(d => ACTION_LIBRARY[d.id].accelerate) 
// Phase 3 actions = always use scale/governance actions 
 
 
5.  Data Flow & State Management 
5.1  State Object Schema 
The assessment engine uses the following JS state objects. These should be migrated to a backend 
session or database in production: 
 
// Company profile (captured on intake form) 
companyInfo = { 
  company:  String,   // Free text company name 
  industry: String,   // Selected from fixed list of 9 options 
  revenue:  String,   // Selected revenue band (5 options) 
  size:     String,   // Employee count band (5 options) 
  role:     String,   // Respondent role (7 options) 
  invest:   String,   // Current AI investment level (5 options) 
} 
  
// Assessment state 
currentCat = Number;    // 0–6 (dimension index) 
currentQ   = Number;    // 0–N (question index within dimension) 
INSTREK  |  MAGNETO AI READINESS PLATFORM  —  Developer Technical Documentation 
Developer Technical Documentation  v1.0  |  Confidential — Instrek Internal 
  
// Answer store — populated as user answers questions 
answers = { 
  [catIndex: Number]: { 
    [qIndex: Number]: Number  // score: 1–5 
  } 
} 
  
// Example populated answers object: 
// { 0:{0:4,1:3,2:5}, 1:{0:2,1:3,2:2}, 2:{0:1,1:2,2:3,3:2}, ... } 
 
5.2  Assessment Completion Check 
// Total questions = CATEGORIES.reduce((s,c) => s + QUESTIONS[c.id].length, 0) 
// = 3+3+4+3+3+3+3 = 22 
  
// Assessment is complete when: 
const totalAnswered = Object.values(answers) 
  .reduce((sum, d) => sum + Object.keys(d).length, 0); 
  
const isComplete = totalAnswered === 22; 
  
// Navigation: after the final question (operations Q3), trigger showGate() 
// Gate blocks results until corporate email is validated. 
 
5.3  Email Gate Validation Logic 
// Validation rules for email gate: 
function isValidCorporateEmail(email) { 
  const FREE_PROVIDERS = [ 
    "gmail", "yahoo", "hotmail", "outlook", "rediffmail", "yopmail" 
  ]; 
  const isValidFormat = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email); 
  const domain = email.split("@")[1]?.split(".")[0]?.toLowerCase(); 
  const isFreeProvider = FREE_PROVIDERS.includes(domain); 
  return isValidFormat && !isFreeProvider; 
} 
  
// Rejection message for free providers: 
// "Please enter a valid corporate email address (not Gmail/Yahoo)." 
// On success: call buildResults() to render the full report. 
 
 
6.  Production Architecture Recommendations 
6.1  Recommended Tech Stack 
Layer Recommended Purpose 
Frontend Next.js 14 / React Component architecture, SSR for report 
pages, SEO for landing page. 
INSTREK  |  MAGNETO AI READINESS PLATFORM  —  Developer Technical Documentation 
Developer Technical Documentation  v1.0  |  Confidential — Instrek Internal 
Backend API Node.js / FastAPI Assessment session management, 
scoring engine, report generation. 
Database PostgreSQL Store assessments, responses, leads, and 
benchmark data. 
Auth / Gate Custom OTP or Auth0 Email verification before report access. 
Lead capture. 
PDF Export Puppeteer / WeasyPrint Generate downloadable branded PDF 
report. 
Email Resend / SendGrid Send report link, follow-up sequence to 
leads. 
CRM Integration HubSpot / Salesforce API Push lead data (email, company, score) to 
CRM on completion. 
Analytics Mixpanel / PostHog Track assessment completion rates, 
drop-off per question, conversion. 
 
6.2  Critical Production API Endpoints 
// POST /api/assessment/start 
// Body: { companyInfo } 
// Returns: { sessionId: string } 
  
// POST /api/assessment/answer 
// Body: { sessionId, catIndex, qIndex, score } 
// Returns: { progress, liveScore } 
  
// POST /api/assessment/gate 
// Body: { sessionId, email, name } 
// Returns: { reportToken: string } OR { error: "invalid_email" } 
  
// GET /api/report/:reportToken 
// Returns: { answers, scores, report } — full computed report data 
  
// POST /api/lead 
// Body: { email, name, companyInfo, overallScore, tierName } 
// Action: push to CRM, trigger email sequence 
 
6.3  Database Schema (Minimal) 
TABLE assessments 
  id            UUID PRIMARY KEY 
  session_id    VARCHAR(64) UNIQUE 
  company_name  VARCHAR(255) 
  industry      VARCHAR(100) 
  revenue_band  VARCHAR(50) 
  size_band     VARCHAR(50) 
  respondent_role VARCHAR(100) 
  invest_level  VARCHAR(100) 
  created_at    TIMESTAMP 
  completed_at  TIMESTAMP NULL 
  email         VARCHAR(255) NULL  -- set at gate 
INSTREK  |  MAGNETO AI READINESS PLATFORM  —  Developer Technical Documentation 
Developer Technical Documentation  v1.0  |  Confidential — Instrek Internal 
  report_token  VARCHAR(64) NULL   -- set at gate 
  
TABLE answers 
  id              UUID PRIMARY KEY 
  assessment_id   UUID REFERENCES assessments(id) 
  cat_index       SMALLINT  -- 0–6 
  question_index  SMALLINT  -- 0–N 
  score           SMALLINT  -- 1–5 
  answered_at     TIMESTAMP 
  
TABLE dimension_scores   -- computed on completion 
  assessment_id   UUID REFERENCES assessments(id) 
  dimension_id    VARCHAR(20)  -- strategy, business, data... 
  score_pct       SMALLINT     -- 0–100 
  overall_pct     SMALLINT     -- 0–100 
  tier            VARCHAR(20)  -- Laggard|Explorer|Builder|Scaler|Leader 
 
 
7.  UI Component Reference 
7.1  Live Seismograph 
The animated seismograph is a Canvas element that visually represents AI readiness signal in real 
time as questions are answered. It is cosmetic but provides strong engagement value. 
 
// Risk level fed to seismograph = 1 - (currentScore / maxPossibleScore) 
// Risk 0.0 = perfect score → flat green line 
// Risk 1.0 = zero score    → highly erratic red line 
  
// Colour mapping: 
// risk < 0.3 → #10b981 (green)    — Strong signal 
// risk < 0.6 → #f59e0b (amber)    — Developing signal 
// risk >= 0.6 → #f43f5e (red)     — Critical gaps detected 
  
// Amplitude: amp = risk × canvasHeight × 0.38 
// Each frame: v = center - (random × amp + sin(time) × amp × 0.5) 
// Data is a rolling buffer equal to canvas width in pixels. 
// Each frame: shift left, push new value, redraw full line. 
 
7.2  Category Navigation Strip 
The category nav strip inside the assessment panel shows progress across all 7 dimensions. A 
dimension nav button shows three states: 
• Default (grey) — dimension not yet reached. 
• Active (blue underline) — current dimension being answered. 
• Done (green + ✓ prefix) — all questions in this dimension answered. 
 
Clicking a completed or current dimension jumps directly to its first unanswered question. 
 
INSTREK  |  MAGNETO AI READINESS PLATFORM  —  Developer Technical Documentation 
7.3  Progress Bar 
The linear progress bar at the top of the assessment panel fills based on total questions answered out 
of 22: 
const totalAnswered = Object.values(answers) 
.reduce((s,d) => s + Object.keys(d).length, 0); 
progressFill.style.width = (totalAnswered / 22 * 100) + "%"; 
7.4  Live Score Counter 
The four live metric cells at the top of the assessment panel update on every answer: 
• "Total Score" — raw sum of all answer scores so far. 
• "Maturity %" — (totalScore / (answeredCount × 5)) × 100, colour-coded by tier. 
• "Dimension" — "currentCat+1 / 7" counter. 
• "Remaining" — 22 minus totalAnswered. 
8.  Extending the Platform 
8.1  Adding a New Industry to Benchmarks 
• Add a new key to INDUSTRY_BENCHMARKS with 7 dimension scores (0–100 each). 
• Add the industry name to the intake form <select> options. 
• The report engine will automatically use the new benchmark values. 
8.2  Adding Questions to a Dimension 
• Add the question object to QUESTIONS[dimensionId] array. 
• Update the total question count in all references (currently hardcoded as 22 in some display 
strings). 
• No changes to the scoring engine are needed — it dynamically counts questions per dimension. 
If you add questions, update the stats strip on the landing page ("22" → new count) and the gate 
description text ("22 questions"). 
8.3  Adding a New Dimension 
6. Add a new entry to the CATEGORIES array with id, name, icon, color, shortName, desc. 
7. Add the question bank: QUESTIONS[newId] = [ ...questions... ] 
8. Add benchmark values for all industries: INDUSTRY_BENCHMARKS[each].newId = value 
9. Add dimension findings: CAT_FINDINGS[newId] = { low, mid, high } 
Developer Technical Documentation  v1.0  |  Confidential — Instrek Internal 
INSTREK  |  MAGNETO AI READINESS PLATFORM  —  Developer Technical Documentation 
Developer Technical Documentation  v1.0  |  Confidential — Instrek Internal 
10. Update the OMS divisor (currently 7 = CATEGORIES.length — handled automatically). 
 
8.4  PDF Report Export 
The current version has no PDF export. For production, implement a server-side PDF generator: 
// Recommended approach: Puppeteer (headless Chrome) 
// 1. User clicks "Download PDF" on results page 
// 2. POST /api/report/pdf with { reportToken } 
// 3. Server loads /report/:token in headless Chrome 
// 4. Puppeteer renders page, captures as PDF 
// 5. Apply Instrek branded header/footer via PDF options 
// 6. Return PDF blob for download 
  
// Alternative: Generate HTML report string server-side, 
//   render with WeasyPrint for Python-native PDF output. 
 
8.5  CRM Lead Push 
// Trigger on gate submission (after email validation): 
await fetch("/api/lead", { 
  method: "POST", 
  body: JSON.stringify({ 
    email:        gateEmail, 
    name:         gateName, 
    company:      companyInfo.company, 
    industry:     companyInfo.industry, 
    revenue:      companyInfo.revenue, 
    role:         companyInfo.role, 
    overallScore: overall, 
    tier:         tier.name, 
    weakestDim:   weakest.name, 
    strongestDim: strongest.name, 
    dimScores:    catScores, 
  }) 
}); 
  
// CRM field mapping (HubSpot example): 
// email → Contact Email 
// overallScore → Custom: AI Maturity Score 
// tier → Custom: AI Maturity Tier 
// industry → Industry 
// company → Company Name 
 
 
9.  Brand & Design Tokens 
9.1  Colour Palette 
Token Hex Value Usage --bg #03071E Page background — deep navy. 
INSTREK  |  MAGNETO AI READINESS PLATFORM  —  Developer Technical Documentation 
Developer Technical Documentation  v1.0  |  Confidential — Instrek Internal --bg2 #060D2E Cards and panel backgrounds. --bg3 #0A1535 Elevated panels (panel header, seismo bar). --accent (primary) #2563EB All primary CTAs, active states, highlights. --accent2 #3B82F6 Hover states and gradient endpoints. --text #EEEEE6 Primary body text — warm off-white. --muted #5A6272 Secondary text, labels, placeholders. --danger #F43F5E Error states, low scores, risk indicators. --warn #F59E0B Warning states, medium scores. --safe #10B981 Success states, high scores. 
Instrek Orange #E8602C Instrek brand accent — used on logo only in 
Magneto. Not used as UI accent. 
 
9.2  Typography 
Font Family Weights Usage 
Syne 400, 600, 700, 800 All headings, hero text, category names, score 
numbers, buttons. 
JetBrains Mono 300, 400, 500 Score numbers, labels, tags, eyebrows, code 
references. 
DM Sans 300, 400, 500 Body text, form inputs, answer option text. 
 
9.3  Logo Usage 
The Instrek logo (Instrek_Logo_White.png) is embedded as a base64 data URI in the HTML file. It 
appears in: 
• Navigation bar (height: 32px) 
• Email gate modal (height: 28px) 
• Results report navigation (height: 28px) 
• Sprint CTA card (height: 20px) 
• Footer (default height) 
 
For production: serve the logo from a CDN/static asset server instead of embedding it as base64. 
The base64 encoding adds ~1.8MB to the HTML file size. 
 
 
INSTREK  |  MAGNETO AI READINESS PLATFORM  —  Developer Technical Documentation 
Developer Technical Documentation  v1.0  |  Confidential — Instrek Internal 
10.  Changelog & Roadmap 
10.1  Version History 
Version Date Changes 
v0.1 Apr 2026 Initial prototype — 3 industry verticals, 12 questions, basic scoring. 
v0.2 Apr 2026 Expanded to 5 industries, 48 questions across 4 pillars, answer 
options 1–4. 
v0.3 Apr 2026 Added benchmark dashboard, ROI calculator, testimonials, 
deliverables sections to landing page. 
v0.4 Apr 2026 Rebuilt as focused AI Readiness tool — 6 dimensions, 48 
questions, full report engine. 
v1.0 Apr 2026 Final prototype — Instrek questionnaire integrated (7 dimensions, 
22 questions), Instrek logo embedded, LinkedIn blue palette 
applied. This documentation version. 
 
10.2  Recommended Production Roadmap 
Priority Feature Notes 
P0 — 
Critical 
Backend API + Database Replace browser-only state. Enable lead 
capture, persistence, analytics. 
P0 — 
Critical 
Email gate with OTP verification Replace basic validation with real 
email verification. 
P1 — High PDF Report Export Puppeteer-based branded PDF for 
download and sharing. 
P1 — High CRM Integration Auto-push leads to 
HubSpot/Salesforce on report unlock. 
P2 — 
Medium 
Weighted Scoring Engine Activate question-level weight multipliers 
(Section 3.6). 
P2 — 
Medium 
Dynamic Roadmap Generation Generate roadmap actions from 
weakest dimensions (Section 4.6). 
P2 — 
Medium 
Admin Dashboard Instrek internal view of all assessments, 
leads, scores, and trends. 
P3 — Nice LinkedIn Share Card OG image auto-generated with company 
name + score for social sharing. 
P3 — Nice Benchmark Data Refresh Pipeline Auto-update 
INDUSTRY_BENCHMARKS from real 
assessment data monthly. 
INSTREK  |  MAGNETO AI READINESS PLATFORM  —  Developer Technical Documentation 
This document is maintained by Instrek. For questions on implementation, contact the Instrek product team. 
All scoring logic described here reflects the v1.0 prototype. Production implementations may deviate from 
this specification — ensure this document is updated to reflect any such changes. 
Developer Technical Documentation  v1.0  |  Confidential — Instrek Internal 