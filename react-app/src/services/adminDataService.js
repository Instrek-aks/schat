// Client-side data management service for REAL form submissions (Only users who give assignment/assessment)

const STORES = {
  MAGNETO: 'instrek_magneto_submissions',
  GCC: 'shieldgcc_submissions'
};

const SEED_EMAILS = [
  'sarah.chen@cybervertex.io',
  'rajesh.patel@apexfintech.com',
  'elena.rostova@globaldata.org',
  'david.miller@horizonhealth.med',
  'priya.sharma@techvision.in',
  'marcus.vance@cloudnexus.io'
];

// BroadcastChannel for cross-port real-time synchronization between secrity and react-app
try {
  const channel = new BroadcastChannel('shieldgcc_channel');
  channel.onmessage = (event) => {
    if (event.data?.type === 'GCC_LEAD_SUBMITTED' && event.data?.payload) {
      adminDataService.saveGccSubmission(event.data.payload);
      window.dispatchEvent(new Event('storage'));
    }
  };
} catch (e) {}

export const adminDataService = {
  // Read raw submissions from localStorage (ONLY real submissions, excluding old seed data)
  getRawSubmissions() {
    // Check URL parameters for imported GCC or Magneto reports
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const importGcc = urlParams.get('importGcc') || urlParams.get('report');
      if (importGcc) {
        try {
          const decodedStr = decodeURIComponent(escape(window.atob(importGcc.replace(/-/g, '+').replace(/_/g, '/'))));
          const parsed = JSON.parse(decodedStr);
          if (parsed.email && (parsed.riskScore !== undefined || parsed.p1Score !== undefined)) {
            this.saveGccSubmission(parsed);
          } else if (parsed.companyInfo && parsed.companyInfo.email) {
            this.saveAiReadinessSubmission({
              email: parsed.companyInfo.email,
              name: parsed.companyInfo.name,
              company: parsed.companyInfo.company,
              role: parsed.companyInfo.role,
              size: parsed.companyInfo.size,
              revenue: parsed.companyInfo.revenue,
              overallPct: 84,
              tier: 'Leader'
            });
          }
        } catch (e) {}
      }
    } catch (e) {}

    try {
      const magnetoRaw = localStorage.getItem(STORES.MAGNETO);
      const gccRaw = localStorage.getItem(STORES.GCC);
      
      let magnetoSubmissions = magnetoRaw 
        ? JSON.parse(magnetoRaw).filter(s => !SEED_EMAILS.includes(s.email?.trim().toLowerCase())) 
        : [];
      let gccSubmissions = gccRaw 
        ? JSON.parse(gccRaw).filter(s => !SEED_EMAILS.includes(s.email?.trim().toLowerCase())) 
        : [];

      // Auto-recover active AI Readiness report from localStorage
      try {
        const activeMagneto = localStorage.getItem('instrek_active_report_data');
        if (activeMagneto) {
          const parsed = JSON.parse(activeMagneto);
          if (parsed.companyInfo?.email) {
            const emailLower = parsed.companyInfo.email.trim().toLowerCase();
            if (!magnetoSubmissions.some(s => s.email?.trim().toLowerCase() === emailLower)) {
              magnetoSubmissions.unshift({
                email: emailLower,
                name: parsed.companyInfo.name || 'Leader',
                company: parsed.companyInfo.company || 'Enterprise',
                role: parsed.companyInfo.role || 'Executive',
                size: parsed.companyInfo.size || '100-500',
                revenue: parsed.companyInfo.revenue || 'N/A',
                overallPct: 84,
                tier: 'Leader',
                completedAt: new Date().toISOString()
              });
            }
          }
        }
      } catch (e) {}

      // Auto-recover active GCC report from localStorage
      try {
        const activeGcc = localStorage.getItem('shieldgcc_active_report');
        if (activeGcc) {
          const parsed = JSON.parse(activeGcc);
          if (parsed.email) {
            const emailLower = parsed.email.trim().toLowerCase();
            if (!gccSubmissions.some(s => s.email?.trim().toLowerCase() === emailLower)) {
              gccSubmissions.unshift({
                email: emailLower,
                name: parsed.name || `${parsed.firstName || ''} ${parsed.lastName || ''}`.trim() || 'Respondent',
                company: parsed.company || 'Enterprise',
                role: parsed.role || 'Executive',
                riskScore: parsed.riskScore || 72,
                tier: parsed.tier || 'High Risk',
                p1Score: parsed.p1Score || 75,
                p2Score: parsed.p2Score || 68,
                p3Score: parsed.p3Score || 72,
                completedAt: parsed.createdAt || new Date().toISOString()
              });
            }
          }
        }
      } catch (e) {}

      return { magnetoSubmissions, gccSubmissions };
    } catch (err) {
      console.error('Error reading real submissions from localStorage:', err);
      return { magnetoSubmissions: [], gccSubmissions: [] };
    }
  },

  // Get cross-referenced merged leads matched by Email for real respondents
  getMergedLeads() {
    const { magnetoSubmissions, gccSubmissions } = this.getRawSubmissions();
    const leads = [];

    // Process Real Magneto Submissions
    magnetoSubmissions.forEach(sub => {
      if (!sub.email) return;
      const emailKey = sub.email.trim().toLowerCase();

      leads.push({
        _id: sub._id || sub.sessionId || `magneto_${Date.now()}_${Math.random()}`,
        email: emailKey,
        name: sub.name || sub.leadInfo?.name || 'N/A',
        phone: sub.phone || sub.leadInfo?.phone || 'N/A',
        company: sub.company || sub.companyInfo?.company || 'N/A',
        role: sub.role || sub.companyInfo?.role || 'N/A',
        size: sub.size || sub.companyInfo?.size || 'N/A',
        revenue: sub.revenue || sub.companyInfo?.revenue || 'N/A',
        magneto: {
          completed: true,
          overallPct: sub.overallPct || sub.scores?.overallPct || 0,
          tier: sub.tier || sub.scores?.tier || 'N/A',
          dimensionScores: sub.dimensionScores || {},
          completedAt: sub.completedAt || sub.createdAt || new Date().toISOString()
        },
        gcc: { completed: false },
        filledBoth: false
      });
    });

    // Process Real GCC Submissions
    gccSubmissions.forEach(sub => {
      if (!sub.email) return;
      const emailKey = sub.email.trim().toLowerCase();

      const fullName = sub.firstName 
        ? `${sub.firstName} ${sub.lastName || ''}`.trim() 
        : (sub.name || 'N/A');

      leads.push({
        _id: sub._id || `gcc_${Date.now()}_${Math.random()}`,
        email: emailKey,
        name: fullName,
        phone: sub.phone || 'N/A',
        company: sub.company || 'N/A',
        role: sub.role || 'N/A',
        size: sub.size || 'N/A',
        revenue: 'N/A',
        magneto: { completed: false },
        gcc: {
          completed: true,
          riskScore: sub.riskScore || 0,
          tier: sub.tier || 'N/A',
          p1Score: sub.p1Score || 0,
          p2Score: sub.p2Score || 0,
          p3Score: sub.p3Score || 0,
          completedAt: sub.completedAt || sub.timestamp || sub.createdAt || new Date().toISOString()
        },
        filledBoth: false
      });
    });

    // Sort by completedAt descending
    leads.sort((a, b) => {
      const dateA = new Date(a.magneto?.completed ? a.magneto.completedAt : a.gcc.completedAt);
      const dateB = new Date(b.magneto?.completed ? b.magneto.completedAt : b.gcc.completedAt);
      return dateB - dateA;
    });

    return leads;
  },

  // Async method to fetch merged leads from Cloud Database (Netlify function / API) with fallback to localStorage
  async fetchLiveMergedLeads() {
    const endpoints = [
      import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api/admin/leads` : null,
      '/.netlify/functions/get-leads'
    ].filter(Boolean);

    for (const url of endpoints) {
      try {
        const res = await fetch(url);
        if (res.ok) {
          const data = await res.json();
          if (data.success && Array.isArray(data.leads)) {
            const localLeads = this.getMergedLeads();
            const map = new Map();

            data.leads.forEach(l => {
              if (l.email) map.set(l.email.toLowerCase().trim(), l);
            });

            localLeads.forEach(l => {
              if (!l.email) return;
              const key = l.email.toLowerCase().trim();
              if (!map.has(key)) {
                map.set(key, l);
              } else {
                const existing = map.get(key);
                if (l.magneto?.completed) existing.magneto = { ...existing.magneto, ...l.magneto };
                if (l.gcc?.completed) existing.gcc = { ...existing.gcc, ...l.gcc };
              }
            });

            const merged = Array.from(map.values());
            merged.forEach(l => {
              l.filledBoth = Boolean(l.magneto?.completed && l.gcc?.completed);
            });

            const both = merged.filter(l => l.filledBoth);
            const magnetoCount = merged.filter(l => l.magneto?.completed).length;
            const gccCount = merged.filter(l => l.gcc?.completed).length;

            return {
              success: true,
              leads: merged,
              summary: {
                totalBoth: both.length,
                totalMagneto: magnetoCount,
                totalGcc: gccCount,
                totalUnique: merged.length,
                conversionRate: merged.length > 0 ? Math.round((both.length / merged.length) * 100) : 0
              }
            };
          }
        }
      } catch (err) {
        // Continue to next endpoint or fallback
      }
    }

    const localLeads = this.getMergedLeads();
    const summary = this.getSummaryMetrics();
    return { success: false, leads: localLeads, summary };
  },

  // Calculate summary metrics
  getSummaryMetrics() {
    const leads = this.getMergedLeads();
    const both = leads.filter(l => l.filledBoth);
    const magnetoCount = leads.filter(l => l.magneto?.completed).length;
    const gccCount = leads.filter(l => l.gcc?.completed).length;
    const totalUnique = leads.length;

    const conversionRate = totalUnique > 0 ? Math.round((both.length / totalUnique) * 100) : 0;

    return {
      totalBoth: both.length,
      totalMagneto: magnetoCount,
      totalGcc: gccCount,
      totalUnique,
      conversionRate
    };
  },

  // Save a new real AI Readiness submission when user submits form
  saveAiReadinessSubmission(submission) {
    if (!submission.email) return;
    try {
      const { magnetoSubmissions } = this.getRawSubmissions();
      const emailLower = submission.email.trim().toLowerCase();
      
      const updated = magnetoSubmissions.filter(s => s.email?.trim().toLowerCase() !== emailLower);
      updated.unshift({
        ...submission,
        email: emailLower,
        completedAt: new Date().toISOString()
      });

      localStorage.setItem(STORES.MAGNETO, JSON.stringify(updated));

      // Post to Netlify Function Cloud DB in background for live site
      fetch('/.netlify/functions/save-lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submission)
      }).catch(() => {});
    } catch (err) {
      console.error('Failed to save real AI Readiness submission:', err);
    }
  },

  // Save a new real GCC Risk Scan submission when user submits form
  saveGccSubmission(submission) {
    if (!submission.email) return;
    try {
      const { gccSubmissions } = this.getRawSubmissions();
      const emailLower = submission.email.trim().toLowerCase();

      const updated = gccSubmissions.filter(s => s.email?.trim().toLowerCase() !== emailLower);
      updated.unshift({
        ...submission,
        email: emailLower,
        completedAt: submission.completedAt || new Date().toISOString()
      });

      localStorage.setItem(STORES.GCC, JSON.stringify(updated));

      // Post to Netlify Function Cloud DB in background for live site
      fetch('/.netlify/functions/save-lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submission)
      }).catch(() => {});
    } catch (err) {
      console.error('Failed to save real GCC submission:', err);
    }
  },

  // Clear all submissions
  clearAllSubmissions() {
    localStorage.removeItem(STORES.MAGNETO);
    localStorage.removeItem(STORES.GCC);
  },

  // Export dataset to CSV
  exportToCsv(leads, filterType = 'both') {
    const headers = [
      'Email',
      'Name',
      'Phone',
      'Company Name',
      'Role',
      'Company Size',
      'Filled Both Forms',
      'AI Readiness Completed',
      'AI Readiness Score (%)',
      'AI Readiness Tier',
      'AI Readiness Date',
      'GCC Risk Completed',
      'GCC Risk Score',
      'GCC Risk Tier',
      'GCC Risk Date'
    ];

    const rows = leads.map(lead => [
      `"${lead.email || ''}"`,
      `"${lead.name || ''}"`,
      `"${lead.phone || ''}"`,
      `"${lead.company || ''}"`,
      `"${lead.role || ''}"`,
      `"${lead.size || ''}"`,
      lead.filledBoth ? 'YES' : 'NO',
      lead.magneto?.completed ? 'YES' : 'NO',
      lead.magneto?.completed ? lead.magneto.overallPct : 'N/A',
      `"${lead.magneto?.completed ? lead.magneto.tier : 'N/A'}"`,
      `"${lead.magneto?.completed ? new Date(lead.magneto.completedAt).toLocaleDateString() : 'N/A'}"`,
      lead.gcc?.completed ? 'YES' : 'NO',
      lead.gcc?.completed ? lead.gcc.riskScore : 'N/A',
      `"${lead.gcc?.completed ? lead.gcc.tier : 'N/A'}"`,
      `"${lead.gcc?.completed ? new Date(lead.gcc.completedAt).toLocaleDateString() : 'N/A'}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' 
      + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `real_submissions_${filterType}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};
