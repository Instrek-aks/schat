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

    const leads = [];

    // Process Magneto Assessments
    magnetoDocs.forEach(doc => {
      const email = doc.leadInfo?.email || doc.companyInfo?.email;
      if (!email) return;
      const emailKey = email.trim().toLowerCase();

      leads.push({
        _id: doc._id,
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
        gcc: { completed: false },
        filledBoth: false
      });
    });

    // Process GCC Leads
    gccDocs.forEach(doc => {
      if (!doc.email) return;
      const emailKey = doc.email.trim().toLowerCase();

      const fullName = doc.firstName 
        ? `${doc.firstName} ${doc.lastName || ''}`.trim() 
        : 'N/A';

      leads.push({
        _id: doc._id,
        email: emailKey,
        name: fullName,
        company: doc.company || 'N/A',
        role: doc.role || 'N/A',
        size: doc.size || 'N/A',
        revenue: 'N/A',
        magneto: { completed: false },
        gcc: {
          completed: true,
          riskScore: doc.riskScore || 0,
          tier: doc.tier || 'N/A',
          p1Score: doc.p1Score || 0,
          p2Score: doc.p2Score || 0,
          p3Score: doc.p3Score || 0,
          completedAt: doc.createdAt || doc.timestamp
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

    const magnetoCount = leads.filter(l => l.magneto?.completed).length;
    const gccCount = leads.filter(l => l.gcc?.completed).length;

    res.json({
      success: true,
      summary: {
        totalBoth: 0,
        totalMagneto: magnetoCount,
        totalGcc: gccCount,
        totalUnique: leads.length,
        conversionRate: 0
      },
      leads
    });

  } catch (error) {
    console.error('Error fetching admin leads:', error);
    res.status(500).json({ error: 'Internal server error while fetching leads' });
  }
};
