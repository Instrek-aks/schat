// Backend Controller to aggregate live lead data from MongoDB for Admin Panel

exports.getAllLeads = async (req, res) => {
  try {
    const MagnetoAssessment = req.app.get('magnetoAssessmentModel');
    const ShieldGccLead = req.app.get('shieldGccLeadModel');

    if (!MagnetoAssessment || !ShieldGccLead) {
      return res.status(500).json({ error: 'Database models not initialized' });
    }

    const [magnetoDocs, gccDocs] = await Promise.all([
      MagnetoAssessment.find({}).sort({ createdAt: -1 }),
      ShieldGccLead.find({}).sort({ createdAt: -1 })
    ]);

    const leadsMap = new Map();

    // Process Magneto Assessments
    magnetoDocs.forEach(doc => {
      const email = doc.leadInfo?.email || doc.companyInfo?.email;
      if (!email) return;
      const emailKey = email.trim().toLowerCase();

      leadsMap.set(emailKey, {
        email: emailKey,
        name: doc.leadInfo?.name || 'N/A',
        company: doc.companyInfo?.company || 'N/A',
        role: doc.companyInfo?.role || 'N/A',
        size: doc.companyInfo?.size || 'N/A',
        revenue: doc.companyInfo?.revenue || 'N/A',
        magneto: {
          completed: doc.status === 'completed' || Boolean(doc.leadInfo?.email),
          overallPct: doc.scores?.overallPct || 0,
          tier: doc.scores?.tier || 'N/A',
          dimensionScores: doc.scores?.dimensionScores || {},
          completedAt: doc.completedAt || doc.createdAt
        },
        gcc: { completed: false }
      });
    });

    // Process & Pair GCC Leads
    gccDocs.forEach(doc => {
      if (!doc.email) return;
      const emailKey = doc.email.trim().toLowerCase();
      const existing = leadsMap.get(emailKey);

      const fullName = doc.firstName 
        ? `${doc.firstName} ${doc.lastName || ''}`.trim() 
        : 'N/A';

      const gccData = {
        completed: true,
        riskScore: doc.riskScore || 0,
        tier: doc.tier || 'N/A',
        p1Score: doc.p1Score || 0,
        p2Score: doc.p2Score || 0,
        p3Score: doc.p3Score || 0,
        completedAt: doc.createdAt || doc.timestamp
      };

      if (existing) {
        existing.gcc = gccData;
        if (existing.name === 'N/A' && fullName !== 'N/A') existing.name = fullName;
        if (existing.company === 'N/A' && doc.company) existing.company = doc.company;
        if (existing.role === 'N/A' && doc.role) existing.role = doc.role;
        if (existing.size === 'N/A' && doc.size) existing.size = doc.size;
      } else {
        leadsMap.set(emailKey, {
          email: emailKey,
          name: fullName,
          company: doc.company || 'N/A',
          role: doc.role || 'N/A',
          size: doc.size || 'N/A',
          revenue: 'N/A',
          magneto: { completed: false },
          gcc: gccData
        });
      }
    });

    const allLeads = Array.from(leadsMap.values());
    allLeads.forEach(lead => {
      lead.filledBoth = Boolean(lead.magneto?.completed && lead.gcc?.completed);
    });

    const both = allLeads.filter(l => l.filledBoth);
    const magnetoCount = allLeads.filter(l => l.magneto?.completed).length;
    const gccCount = allLeads.filter(l => l.gcc?.completed).length;

    res.json({
      success: true,
      summary: {
        totalBoth: both.length,
        totalMagneto: magnetoCount,
        totalGcc: gccCount,
        totalUnique: allLeads.length,
        conversionRate: allLeads.length > 0 ? Math.round((both.length / allLeads.length) * 100) : 0
      },
      leads: allLeads
    });

  } catch (error) {
    console.error('Error fetching admin leads:', error);
    res.status(500).json({ error: 'Internal server error while fetching leads' });
  }
};
