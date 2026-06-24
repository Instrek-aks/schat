export const CATEGORIES = [
  {id:'strategy',name:'Company Strategy',shortName:'Strategy',icon:'🎯',color:'#f43f5e',desc:'AI/ML strategy alignment, executive sponsorship, ROI-based use case prioritisation.'},
  {id:'business',name:'Business Functions',shortName:'Business',icon:'💼',color:'#f59e0b',desc:'AI adoption across BUs, KPI definition, IT-business collaboration.'},
  {id:'data',name:'Data Readiness',shortName:'Data',icon:'📊',color:'#3b82f6',desc:'Data centralisation, quality, governance, cataloguing, historical availability.'},
  {id:'technology',name:'Technology',shortName:'Technology',icon:'⚙️',color:'#0ea5e9',desc:'Scalable infrastructure, ML tooling, data engineering, API integration layers.'},
  {id:'security',name:'Security & Governance',shortName:'Security',icon:'🛡️',color:'#6366f1',desc:'Data privacy, regulatory compliance (DPDP/GDPR), RBAC, ethical AI policies.'},
  {id:'people',name:'People & Talent',shortName:'People',icon:'👥',color:'#d946ef',desc:'AI/ML expertise, employee AI awareness, change management for adoption.'},
  {id:'operations',name:'Operations & MLOps',shortName:'Operations',icon:'🔄',color:'#8b5cf6',desc:'MLOps practices, model monitoring, drift detection, AI workflow integration.'}
];

export const INDUSTRY_BENCHMARKS = {
  "BFSI": { strategy:55, business:45, data:40, technology:48, security:52, people:38, operations:42 },
  "Fintech": { strategy:62, business:52, data:55, technology:60, security:48, people:50, operations:56 },
  "Healthcare": { strategy:42, business:38, data:35, technology:40, security:50, people:30, operations:36 },
  "Retail & FMCG": { strategy:48, business:46, data:42, technology:45, security:35, people:38, operations:44 },
  "Manufacturing": { strategy:40, business:38, data:34, technology:42, security:36, people:30, operations:38 },
  "Technology": { strategy:70, business:62, data:68, technology:72, security:58, people:65, operations:66 },
  "Logistics": { strategy:44, business:40, data:36, technology:44, security:38, people:32, operations:42 },
  "Education": { strategy:35, business:32, data:28, technology:34, security:30, people:30, operations:28 },
  "Other": { strategy:45, business:40, data:38, technology:44, security:38, people:35, operations:40 },
};

export const WEIGHTS = {
  "High": 1.5,
  "Medium": 1.0,
  "Low": 0.7,
};

export const MATURITY_TIERS = [
  { name: "Laggard", min: 0, max: 24, color: "#EF4444", desc: "Critical foundational gaps. AI cannot deliver value at scale without urgent remediation." },
  { name: "Explorer", min: 25, max: 44, color: "#F59E0B", desc: "AI journey started but critical gaps across multiple dimensions limit progress." },
  { name: "Builder", min: 45, max: 61, color: "#60A5FA", desc: "Meaningful capability with inconsistency. Closing weakest dimension is highest leverage." },
  { name: "Scaler", min: 62, max: 77, color: "#60a5fa", desc: "Strong foundations and growing deployment. Focus on systematising and governing AI." },
  { name: "Leader", min: 78, max: 100, color: "#2563eb", desc: "Top-tier AI readiness. Challenge is compounding the advantage and deepening AI into the core business model." }
];

export const REVENUE_MULTIPLIERS = {
  "Under ₹50 Cr": 30,
  "₹50-250 Cr": 100,
  "₹250-1000 Cr": 300,
  "₹1000-5000 Cr": 1000,
  "₹5000 Cr+": 2500,
};

export const ACTION_LIBRARY = {
  strategy: {
    urgent: "Ratify AI strategy and board-level accountability framework.",
    accelerate: "Align AI use cases with core business KPIs and ROI measurement."
  },
  business: {
    urgent: "Map core business processes to identify AI-led automation bottlenecks.",
    accelerate: "Establish cross-functional AI steering committees for BU engagement."
  },
  data: {
    urgent: "Perform a data quality and accessibility audit across silos.",
    accelerate: "Build automated ingestion pipelines and centralised feature stores."
  },
  technology: {
    urgent: "Provision scalable compute infrastructure for AI experimentation.",
    accelerate: "Standardise developer tools and ML lifecycle orchestration."
  },
  security: {
    urgent: "Implement Acceptable Use Policy and shadow AI controls.",
    accelerate: "Build automated PII redaction and differential privacy layers."
  },
  people: {
    urgent: "Launch mandatory AI literacy training for leadership and management.",
    accelerate: "Formalise specialist AI roles and structured change management."
  },
  operations: {
    urgent: "Implement code and model versioning (lineage) for production deployments.",
    accelerate: "Deploy automated model monitoring and data drift alert systems."
  }
};

export const QUESTIONS = {
  strategy:[
    {text:"Has the board or executive committee formally ratified an AI strategy with specific, measurable business goals?",dept:"Executive",weight:"High",options:[{label:"No strategy",sub:"Ad-hoc only",score:1},{label:"Drafting",sub:"In discussion",score:2},{label:"Initial strategy",sub:"Not fully aligned",score:3},{label:"Ratified",sub:"Clear goals set",score:4},{label:"Fully integrated",sub:"Drives enterprise ops",score:5}]},
    {text:"Are AI investments centrally tracked with a defined mechanism for measuring ROI against baseline costs?",dept:"Finance",weight:"Medium",options:[{label:"No tracking",sub:"Unseen costs",score:1},{label:"Basic tracking",sub:"IT costs only",score:2},{label:"Project level",sub:"Inconsistent ROI",score:3},{label:"Centralised",sub:"Clear ROI metrics",score:4},{label:"Dynamic",sub:"Real-time value tracking",score:5}]},
    {text:"Is there a dedicated executive (e.g. CAIO, CDO) accountable for enterprise-wide AI adoption and risk?",dept:"Executive",weight:"High",options:[{label:"No owner",sub:"Fragmented",score:1},{label:"IT owned",sub:"Tech focus only",score:2},{label:"Shared",sub:"Committee led",score:3},{label:"Dedicated Leader",sub:"C-level mandate",score:4},{label:"Integrated Team",sub:"Cross-functional power",score:5}]},
    {text:"How does the organisation prioritise AI use cases?",dept:"Strategy",weight:"Medium",options:[{label:"No process",sub:"Random adoption",score:1},{label:"Ad-hoc",sub:"Whoever asks first",score:2},{label:"Basic matrix",sub:"Value vs Effort",score:3},{label:"Structured",sub:"Clear pipeline",score:4},{label:"Strategic",sub:"Tied to core KPIs",score:5}]}
  ],
  business:[
    {text:"Have core business processes been mapped to identify specific bottlenecks where AI can deliver automation or insight?",dept:"Operations",weight:"High",options:[{label:"No mapping",sub:"Blind ops",score:1},{label:"High-level",sub:"Theoretical only",score:2},{label:"Partial",sub:"In some depts",score:3},{label:"Detailed",sub:"Clear AI targets",score:4},{label:"Continuous",sub:"Dynamic discovery",score:5}]},
    {text:"Are business units actively pulling AI capabilities, or is IT pushing AI onto the business?",dept:"Business",weight:"Medium",options:[{label:"IT Push",sub:"High resistance",score:1},{label:"Siloed pull",sub:"Pockets of interest",score:2},{label:"Collaborative",sub:"Joint pilots",score:3},{label:"Business Pull",sub:"Strong demand",score:4},{label:"Embedded",sub:"AI-native operations",score:5}]},
    {text:"For deployed AI tools, are end-users actively involved in testing and feedback loops?",dept:"Product/Operations",weight:"High",options:[{label:"No feedback",sub:"Deploy and forget",score:1},{label:"Ad-hoc",sub:"Informal complaints",score:2},{label:"Periodic",sub:"Quarterly reviews",score:3},{label:"Active loop",sub:"Structured feedback",score:4},{label:"Continuous",sub:"Real-time tuning",score:5}]},
    {text:"Do you have metrics to track the 'inefficiency tax' of not using AI in core workflows?",dept:"Finance/Ops",weight:"Medium",options:[{label:"Unknown",sub:"No visibility",score:1},{label:"Estimates",sub:"Rough guesses",score:2},{label:"Partial tracking",sub:"Some workflows",score:3},{label:"Tracked",sub:"Clear baseline",score:4},{label:"Optimised",sub:"Cost recovered",score:5}]}
  ],
  data:[
    {text:"Is enterprise data siloed across applications, or unified in a central data lake/warehouse accessible for AI?",dept:"Data",weight:"High",options:[{label:"Siloed",sub:"Hard to access",score:1},{label:"Extractable",sub:"Manual effort",score:2},{label:"Partial Lake",sub:"Some unified data",score:3},{label:"Unified",sub:"Central access",score:4},{label:"AI-Ready",sub:"Feature store active",score:5}]},
    {text:"How would you rate the quality, completeness, and labelling of your historical data?",dept:"Data",weight:"Medium",options:[{label:"Poor",sub:"Untrusted",score:1},{label:"Variable",sub:"Needs heavy prep",score:2},{label:"Fair",sub:"Usable with effort",score:3},{label:"Good",sub:"Mostly clean",score:4},{label:"Excellent",sub:"High-quality labels",score:5}]},
    {text:"Are there automated pipelines in place for data ingestion and preprocessing?",dept:"Data/Engineering",weight:"High",options:[{label:"Manual",sub:"Ad-hoc dumps",score:1},{label:"Scheduled",sub:"Basic cron jobs",score:2},{label:"Automated",sub:"Brittle pipelines",score:3},{label:"Robust",sub:"Managed pipelines",score:4},{label:"Real-time",sub:"Streaming data",score:5}]},
    {text:"Do you have clear data governance defining ownership, privacy classification, and lifecycle?",dept:"Governance",weight:"High",options:[{label:"None",sub:"Wild west",score:1},{label:"Basic IT rules",sub:"Access control only",score:2},{label:"Documented",sub:"Often ignored",score:3},{label:"Enforced",sub:"Clear ownership",score:4},{label:"Automated",sub:"Policy as code",score:5}]}
  ],
  technology:[
    {text:"Does your infrastructure support the compute requirements (GPUs/Cloud) for training or fine-tuning models?",dept:"IT",weight:"Medium",options:[{label:"None",sub:"CPU only",score:1},{label:"Ad-hoc cloud",sub:"Manual spin-up",score:2},{label:"Basic instances",sub:"Limited scale",score:3},{label:"Scalable cloud",sub:"Auto-scaling compute",score:4},{label:"Dedicated ML infra",sub:"Optimised hardware",score:5}]},
    {text:"Do developers have access to a standardised ML tooling stack (e.g. Jupyter, MLflow, HuggingFace)?",dept:"Engineering",weight:"Medium",options:[{label:"BYO tools",sub:"Fragmented",score:1},{label:"Basic tools",sub:"Not integrated",score:2},{label:"Standardised",sub:"Local only",score:3},{label:"Cloud workspace",sub:"Managed envs",score:4},{label:"Enterprise ML platform",sub:"End-to-end",score:5}]},
    {text:"Are core business applications exposed via APIs to allow AI agents to take action?",dept:"Engineering",weight:"High",options:[{label:"Closed systems",sub:"No APIs",score:1},{label:"Read-only",sub:"Data extraction only",score:2},{label:"Partial write",sub:"Limited endpoints",score:3},{label:"Comprehensive APIs",sub:"Actionable",score:4},{label:"Agent-ready",sub:"Event-driven",score:5}]},
    {text:"Are you experimenting with or deploying Large Language Models (internal or third-party APIs)?",dept:"IT/Innovation",weight:"Medium",options:[{label:"No usage",sub:"Blocked",score:1},{label:"Shadow IT",sub:"Unsanctioned use",score:2},{label:"Sandbox",sub:"Testing only",score:3},{label:"API integration",sub:"Production use",score:4},{label:"Fine-tuned LLMs",sub:"Custom models",score:5}]}
  ],
  security:[
    {text:"Do you have a formal Acceptable Use Policy for generative AI tools (like ChatGPT) by employees?",dept:"Security",weight:"High",options:[{label:"No policy",sub:"High risk",score:1},{label:"Drafted",sub:"Not enforced",score:2},{label:"Basic policy",sub:"Signed once",score:3},{label:"Enforced",sub:"Active monitoring",score:4},{label:"Managed access",sub:"Enterprise accounts",score:5}]},
    {text:"How are PII (Personally Identifiable Information) and sensitive data handled before entering AI models?",dept:"Security/Data",weight:"High",options:[{label:"Not handled",sub:"Direct input",score:1},{label:"Manual check",sub:"Human review",score:2},{label:"Basic masking",sub:"Inconsistent",score:3},{label:"Automated redaction",sub:"Pipeline step",score:4},{label:"Differential privacy",sub:"Cryptographic",score:5}]},
    {text:"Is there a framework to test models for bias, fairness, and hallucination before deployment?",dept:"Risk",weight:"Medium",options:[{label:"No testing",sub:"Blind trust",score:1},{label:"Vibe check",sub:"Manual QA",score:2},{label:"Basic scripts",sub:"Inconsistent",score:3},{label:"Structured framework",sub:"Pre-flight checks",score:4},{label:"Red-teaming",sub:"Adversarial testing",score:5}]},
    {text:"Are you prepared for upcoming AI regulations (e.g. EU AI Act, DPDP)?",dept:"Legal",weight:"Medium",options:[{label:"Unaware",sub:"No prep",score:1},{label:"Monitoring",sub:"Watching space",score:2},{label:"Gap analysis",sub:"Started mapping",score:3},{label:"Compliant design",sub:"Built-in",score:4},{label:"Audit-ready",sub:"Provable compliance",score:5}]}
  ],
  people:[
    {text:"What percentage of your workforce has received formal AI literacy training?",dept:"HR",weight:"Medium",options:[{label:"0%",sub:"No training",score:1},{label:"<10%",sub:"Tech teams only",score:2},{label:"10-30%",sub:"Management",score:3},{label:"30-70%",sub:"Broad rollout",score:4},{label:">70%",sub:"Enterprise-wide",score:5}]},
    {text:"Do you have internal specialist talent (Data Scientists, ML Engineers) or rely entirely on vendors?",dept:"HR",weight:"High",options:[{label:"100% Vendor",sub:"No internal IP",score:1},{label:"1-2 hires",sub:"Overwhelmed",score:2},{label:"Small team",sub:"Siloed",score:3},{label:"Balanced",sub:"Strong internal core",score:4},{label:"AI Centre of Excellence",sub:"Hub and spoke",score:5}]},
    {text:"Is there a structured change management process when AI alters an employee's daily workflow?",dept:"Ops/HR",weight:"Medium",options:[{label:"None",sub:"Sink or swim",score:1},{label:"Email updates",sub:"Low support",score:2},{label:"Basic training",sub:"At launch",score:3},{label:"Change managers",sub:"Dedicated support",score:4},{label:"Continuous enablement",sub:"Feedback loops",score:5}]},
    {text:"Does leadership actively champion a culture of experimentation and psychological safety regarding AI?",dept:"Executive",weight:"Medium",options:[{label:"Fear-driven",sub:"Job loss anxiety",score:1},{label:"Neutral",sub:"No message",score:2},{label:"Verbal support",sub:"No budget",score:3},{label:"Active funding",sub:"Innovation budget",score:4},{label:"Rewarded",sub:"Experimentation KPIs",score:5}]}
  ],
  operations:[
    {text:"How is model versioning and code versioning managed?",dept:"Engineering",weight:"High",options:[{label:"Local files",sub:"v1_final_final",score:1},{label:"Git only",sub:"Code only",score:2},{label:"Basic registry",sub:"Manual upload",score:3},{label:"Model Registry",sub:"Automated tracking",score:4},{label:"Full Lineage",sub:"Code+Data+Model",score:5}]},
    {text:"Once an AI model is in production, how is its performance monitored?",dept:"Engineering",weight:"High",options:[{label:"Not monitored",sub:"Wait for complaints",score:1},{label:"System uptime",sub:"IT metrics only",score:2},{label:"Manual checks",sub:"Periodic review",score:3},{label:"Dashboard",sub:"Accuracy tracking",score:4},{label:"Automated alerts",sub:"Drift detection",score:5}]},
    {text:"How long does it take to retrain and deploy a model when data drift is detected?",dept:"Engineering",weight:"Medium",options:[{label:"Months",sub:"Start from scratch",score:1},{label:"Weeks",sub:"Manual pipeline",score:2},{label:"Days",sub:"Partial automation",score:3},{label:"Hours",sub:"Automated pipeline",score:4},{label:"Minutes",sub:"Continuous learning",score:5}]},
    {text:"Are AI outputs clearly logged to provide an audit trail for decisions?",dept:"IT/Risk",weight:"Medium",options:[{label:"No logs",sub:"Black box",score:1},{label:"App logs",sub:"Hard to parse",score:2},{label:"Basic DB",sub:"Simple records",score:3},{label:"Structured audit",sub:"Searchable",score:4},{label:"Explainable",sub:"Reasoning logged",score:5}]}
  ]
};

export const CAT_FINDINGS = {
  strategy:{
    low:'Absent AI strategy means every AI initiative competes for resources without direction. AI investments are random, ROI is unmeasured, and the board has no AI accountability.',
    mid:'AI strategy exists but gaps in executive sponsorship and use-case prioritisation mean the best opportunities are being missed and investment is being misallocated.',
    high:'Strong AI strategy with executive alignment and structured use-case prioritisation. A genuine competitive moat that accelerates all other dimensions.'
  },
  business:{
    low:'Business functions have not engaged with AI. Process mapping is absent, KPIs are undefined, and IT-business collaboration is minimal - creating an execution gap that strategy alone cannot fix.',
    mid:'Partial business unit engagement with AI. KPI definition and cross-functional collaboration need strengthening to ensure AI investments translate into operational value.',
    high:'Strong business unit AI engagement with defined KPIs and collaborative execution models. AI is being pulled by the business, not pushed by IT.'
  },
  data:{
    low:'Data fragmentation, quality issues, and governance gaps are the primary barrier to AI value. No AI initiative will consistently succeed on this data foundation.',
    mid:'Data infrastructure is developing but inconsistency in quality, accessibility, and historical depth will constrain model reliability and slow AI teams.',
    high:'AI-ready data foundation with strong governance, accessibility, and historical depth. A significant structural advantage for AI execution.'
  },
  technology:{
    low:'Technology gaps - particularly compute, tooling, and integration layers - make AI deployment slow, fragile, and expensive. Infrastructure investment is the critical unlock.',
    mid:'Core technology capabilities are in place but gaps in scalability, tooling, and API integration are creating bottlenecks that slow AI deployment velocity.',
    high:'Strong technology stack with scalable compute, integrated ML tooling, and flexible API layers. The foundation for rapid AI deployment at enterprise scale.'
  },
  security:{
    low:'Absent security controls and governance create regulatory exposure, IP leakage risk, and shadow AI proliferation. Remediation is urgent given the pace of AI regulation.',
    mid:'Security controls are partially in place but regulatory alignment, AI governance, and role-based access need strengthening to match the risk profile of AI deployments.',
    high:'Mature security and governance posture. Regulatory compliance and ethical AI frameworks are a competitive differentiator with enterprise customers and regulators.'
  },
  people:{
    low:'Insufficient AI talent and awareness are the most persistent barriers to AI value. Technical investments will underdeliver without the human capability to operate, adopt, and improve AI systems.',
    mid:'A functional AI team exists but specialist gaps and insufficient organisational AI literacy are creating adoption bottlenecks across the business.',
    high:'Strong AI talent pool with a growing culture of AI literacy and structured change management. A talent advantage that compounds over time.'
  },
  operations:{
    low:'Absent MLOps and model integration means AI cannot reliably reach production or stay reliable once deployed. Operational maturity is the primary execution bottleneck.',
    mid:'MLOps capabilities are developing but monitoring, drift detection, and workflow integration gaps mean models degrade silently and deliver inconsistent value.',
    high:'Strong operational MLOps posture with automated monitoring, drift detection, and embedded workflow integration. AI can be deployed, trusted, and improved at pace.'
  }
};
