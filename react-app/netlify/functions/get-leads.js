import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://ch:charu@cluster0.fsxomwi.mongodb.net/schat?appName=Cluster0';

let isConnected = false;

async function connectToDatabase() {
  if (isConnected && mongoose.connection.readyState === 1) return;
  try {
    await mongoose.connect(MONGODB_URI);
    isConnected = true;
  } catch (err) {
    console.error('MongoDB connection error in get-leads Function:', err);
    throw err;
  }
}

const magnetoSchema = new mongoose.Schema({
  sessionId: String,
  email: String,
  name: String,
  company: String,
  role: String,
  size: String,
  revenue: String,
  overallPct: Number,
  tier: String,
  completedAt: Date
});

const gccSchema = new mongoose.Schema({
  email: String,
  name: String,
  firstName: String,
  lastName: String,
  company: String,
  role: String,
  size: String,
  riskScore: Number,
  tier: String,
  p1Score: Number,
  p2Score: Number,
  p3Score: Number,
  completedAt: Date
});

const MagnetoLead = mongoose.models.MagnetoLead || mongoose.model('MagnetoLead', magnetoSchema);
const GccLead = mongoose.models.GccLead || mongoose.model('GccLead', gccSchema);

export const handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, OPTIONS'
  };

  if (event.httpMethod === 'OPTIONS') return { statusCode: 200, headers };

  try {
    await connectToDatabase();

    const magnetoDocs = await MagnetoLead.find({}).lean();
    const gccDocs = await GccLead.find({}).lean();

    const map = new Map();

    magnetoDocs.forEach(sub => {
      if (!sub.email) return;
      const key = sub.email.trim().toLowerCase();
      map.set(key, {
        email: key,
        name: sub.name || 'N/A',
        company: sub.company || 'N/A',
        role: sub.role || 'N/A',
        size: sub.size || 'N/A',
        revenue: sub.revenue || 'N/A',
        magneto: {
          completed: true,
          overallPct: sub.overallPct || 84,
          tier: sub.tier || 'Leader',
          completedAt: sub.completedAt || new Date()
        },
        gcc: { completed: false }
      });
    });

    gccDocs.forEach(sub => {
      if (!sub.email) return;
      const key = sub.email.trim().toLowerCase();
      const existing = map.get(key);

      const gccData = {
        completed: true,
        riskScore: sub.riskScore || 72,
        tier: sub.tier || 'High Risk',
        p1Score: sub.p1Score || 75,
        p2Score: sub.p2Score || 68,
        p3Score: sub.p3Score || 72,
        completedAt: sub.completedAt || new Date()
      };

      const fullName = sub.name || `${sub.firstName || ''} ${sub.lastName || ''}`.trim() || 'N/A';

      if (existing) {
        existing.gcc = gccData;
        if (existing.name === 'N/A' && fullName !== 'N/A') existing.name = fullName;
        if (existing.company === 'N/A' && sub.company) existing.company = sub.company;
        if (existing.role === 'N/A' && sub.role) existing.role = sub.role;
        if (existing.size === 'N/A' && sub.size) existing.size = sub.size;
      } else {
        map.set(key, {
          email: key,
          name: fullName,
          company: sub.company || 'N/A',
          role: sub.role || 'N/A',
          size: sub.size || 'N/A',
          revenue: 'N/A',
          magneto: { completed: false },
          gcc: gccData
        });
      }
    });

    const leads = Array.from(map.values());
    leads.forEach(l => {
      l.filledBoth = Boolean(l.magneto?.completed && l.gcc?.completed);
    });

    const both = leads.filter(l => l.filledBoth);
    const magnetoCount = leads.filter(l => l.magneto?.completed).length;
    const gccCount = leads.filter(l => l.gcc?.completed).length;

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        leads,
        summary: {
          totalBoth: both.length,
          totalMagneto: magnetoCount,
          totalGcc: gccCount,
          totalUnique: leads.length,
          conversionRate: leads.length > 0 ? Math.round((both.length / leads.length) * 100) : 0
        }
      })
    };
  } catch (err) {
    console.error('Failed to get leads from MongoDB:', err);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ success: false, error: err.message, leads: [], summary: { totalBoth: 0, totalMagneto: 0, totalGcc: 0, totalUnique: 0, conversionRate: 0 } })
    };
  }
};
