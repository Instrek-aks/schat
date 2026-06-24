export const CATEGORIES = [
  { id: 'strategy', name: 'Company Strategy', icon: '🎯', color: '#3b82f6', shortName: 'Strategy', desc: 'AI/ML strategy alignment, executive sponsorship, ROI-based use case prioritisation.' },
  { id: 'business', name: 'Business Functions', icon: '💼', color: '#10b981', shortName: 'Business', desc: 'AI adoption across BUs, KPI definition, IT-business collaboration.' },
  { id: 'data', name: 'Data Readiness', icon: '📊', color: '#8b5cf6', shortName: 'Data', desc: 'Data centralisation, quality, governance, cataloguing, historical availability.' },
  { id: 'technology', name: 'Technology', icon: '⚙️', color: '#f59e0b', shortName: 'Technology', desc: 'Scalable infrastructure, ML tooling, data engineering, API integration layers.' },
  { id: 'security', name: 'Security & Governance', icon: '🛡️', color: '#ef4444', shortName: 'Security', desc: 'Data privacy, regulatory compliance, RBAC, ethical AI policies.' },
  { id: 'people', name: 'People & Talent', icon: '👥', color: '#ec4899', shortName: 'People', desc: 'AI/ML expertise, employee AI awareness, change management for adoption.' },
  { id: 'operations', name: 'Operations & MLOps', icon: '🔄', color: '#14b8a6', shortName: 'Operations', desc: 'MLOps practices, model monitoring, drift detection, AI workflow integration.' }
];

export const INDUSTRY_BENCHMARKS = {
  "BFSI":          { strategy:55, business:45, data:40, technology:48, security:52, people:38, operations:42 },
  "Fintech":       { strategy:62, business:52, data:55, technology:60, security:48, people:50, operations:56 },
  "Healthcare":    { strategy:42, business:38, data:35, technology:40, security:50, people:30, operations:36 },
  "Retail & FMCG": { strategy:48, business:46, data:42, technology:45, security:35, people:38, operations:44 },
  "Manufacturing": { strategy:40, business:38, data:34, technology:42, security:36, people:30, operations:38 },
  "Technology":    { strategy:70, business:62, data:68, technology:72, security:58, people:65, operations:66 },
  "Logistics":     { strategy:44, business:40, data:36, technology:44, security:38, people:32, operations:42 },
  "Education":     { strategy:35, business:32, data:28, technology:34, security:30, people:30, operations:28 },
  "Other":         { strategy:45, business:40, data:38, technology:44, security:38, people:35, operations:40 },
};

export const WEIGHT = {
  "High Weight":   1.5,
  "Medium Weight": 1.0,
  "Low Weight":    0.7,
};

export const getRevMult = (revenueBand) => {
  return {
    "Under ₹50 Cr":      30,
    "₹50-250 Cr":      100,
    "₹250-1000 Cr":    300,
    "₹1000-5000 Cr":  1000,
    "₹5000 Cr+":        2500,
  }[revenueBand] || 200;
};

export const CAT_FINDINGS = {
  strategy: {
    low: "Critical gaps in leadership alignment and AI strategy. Missing clear ROI-driven use case prioritization.",
    mid: "AI strategy is developing but lacks enterprise-wide coherence. Some use cases are identified but execution is siloed.",
    high: "Strong executive sponsorship with a clear, ROI-driven AI strategy scaling across the organization."
  },
  business: {
    low: "Business units are completely disconnected from AI initiatives. No defined KPIs for AI adoption.",
    mid: "Early adoption in select business units. IT and business collaboration exists but needs formalization.",
    high: "Business units lead AI adoption with clear KPIs, tight IT collaboration, and integrated workflows."
  },
  data: {
    low: "Data is highly fragmented, poor quality, and inaccessible. No formal data governance in place.",
    mid: "Data centralization efforts are underway, but quality and cataloguing gaps hinder scalable AI.",
    high: "Enterprise data is centralized, governed, high-quality, and readily accessible for advanced ML models."
  },
  technology: {
    low: "Legacy infrastructure unable to support modern ML workloads. Missing core data engineering pipelines.",
    mid: "Basic cloud infrastructure and tools exist, but lack the scalability required for enterprise-wide deployment.",
    high: "State-of-the-art scalable infrastructure, robust ML tooling, and mature API integration layers deployed."
  },
  security: {
    low: "Severe exposure to data privacy and compliance risks. No ethical AI policies or RBAC implemented.",
    mid: "Basic security measures in place, but lacking comprehensive AI-specific governance and compliance tracking.",
    high: "Robust data privacy, automated compliance checks, and strict ethical AI governance established."
  },
  people: {
    low: "Severe shortage of internal AI/ML expertise. Complete lack of employee awareness and change management.",
    mid: "Some technical talent exists, but broader employee AI literacy and change management programs are missing.",
    high: "Deep internal AI expertise, strong continuous learning culture, and excellent AI change management."
  },
  operations: {
    low: "No MLOps practices. Models (if any) are deployed manually with no monitoring or drift detection.",
    mid: "Basic model deployment processes exist, but monitoring is manual and drift detection is reactive.",
    high: "Mature MLOps pipelines with automated CI/CD, continuous model monitoring, and proactive drift detection."
  }
};

// Mock 22 Questions across 7 Dimensions (3,3,4,3,3,3,3)
const mockAnswers = [
  { text: "Not implemented. Organisation is completely exposed or unaware.", score: 1 },
  { text: "Awareness exists but no formal implementation. Ad-hoc or informal only.", score: 2 },
  { text: "Partial implementation. Covers some areas but significant gaps remain.", score: 3 },
  { text: "Mostly implemented with minor gaps. Systematic approach in place.", score: 4 },
  { text: "Fully implemented, continuously improved, and competitive differentiator.", score: 5 }
];

export const QUESTIONS = {
  strategy: [
    { text: "Does the executive team have a clearly defined AI strategy aligned with business goals?", weight: "High Weight", options: mockAnswers },
    { text: "Is there a formal process for prioritizing AI use cases based on ROI?", weight: "Medium Weight", options: mockAnswers },
    { text: "Are AI initiatives sponsored and tracked at the board level?", weight: "High Weight", options: mockAnswers }
  ],
  business: [
    { text: "How integrated are AI solutions into daily business operations and workflows?", weight: "High Weight", options: mockAnswers },
    { text: "Are there defined KPIs and metrics to measure the success of AI initiatives?", weight: "Medium Weight", options: mockAnswers },
    { text: "How strong is the collaboration between IT and business units on AI projects?", weight: "High Weight", options: mockAnswers }
  ],
  data: [
    { text: "Is enterprise data centralized and accessible (e.g., Data Lake/Warehouse)?", weight: "High Weight", options: mockAnswers },
    { text: "How mature are your data quality and cleansing processes?", weight: "Medium Weight", options: mockAnswers },
    { text: "Do you have formal data governance and cataloguing policies in place?", weight: "High Weight", options: mockAnswers },
    { text: "Is sufficient historical data available and labeled for training ML models?", weight: "Medium Weight", options: mockAnswers }
  ],
  technology: [
    { text: "Can your current IT infrastructure scale to support advanced ML workloads?", weight: "High Weight", options: mockAnswers },
    { text: "Are standard ML tools and frameworks adopted across the organization?", weight: "Medium Weight", options: mockAnswers },
    { text: "Do you have robust API integration layers to connect AI models with applications?", weight: "High Weight", options: mockAnswers }
  ],
  security: [
    { text: "Are AI initiatives fully compliant with data privacy regulations (e.g., DPDP/GDPR)?", weight: "High Weight", options: mockAnswers },
    { text: "Is Role-Based Access Control (RBAC) strictly enforced for AI systems and data?", weight: "High Weight", options: mockAnswers },
    { text: "Do you have established policies for Ethical AI and bias mitigation?", weight: "Medium Weight", options: mockAnswers }
  ],
  people: [
    { text: "Do you have sufficient internal AI/ML engineering and data science expertise?", weight: "High Weight", options: mockAnswers },
    { text: "Are there ongoing programs to improve AI literacy among non-technical employees?", weight: "Medium Weight", options: mockAnswers },
    { text: "Is there a dedicated change management process to drive AI adoption?", weight: "High Weight", options: mockAnswers }
  ],
  operations: [
    { text: "Are mature MLOps practices (CI/CD for models) implemented?", weight: "High Weight", options: mockAnswers },
    { text: "Do you have automated systems for continuous model performance monitoring?", weight: "High Weight", options: mockAnswers },
    { text: "Is model drift detection and automated retraining fully operational?", weight: "Medium Weight", options: mockAnswers }
  ]
};
