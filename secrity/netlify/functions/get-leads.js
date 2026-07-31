import { MongoClient } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI;

let cachedClient = null;

async function getDatabase() {
  if (!MONGODB_URI) {
    throw new Error('MONGODB_URI environment variable is not defined');
  }
  if (!cachedClient) {
    cachedClient = new MongoClient(MONGODB_URI, {
      serverSelectionTimeoutMS: 4000,
      connectTimeoutMS: 4000
    });
    try {
      await cachedClient.connect();
    } catch (err) {
      cachedClient = null;
      throw err;
    }
  }
  return cachedClient.db('aiassest');
}

export const handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, OPTIONS'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  try {
    const db = await getDatabase();
    const magnetoCol = db.collection('magnetoleads');
    const gccCol = db.collection('gccleads');

    let magnetoDocs = await magnetoCol.find({}).toArray();
    let gccDocs = await gccCol.find({}).toArray();


    const leads = [];

    magnetoDocs.forEach(sub => {
      if (!sub.email) return;
      const key = sub.email.trim().toLowerCase();
      leads.push({
        _id: sub._id,
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
        gcc: { completed: false },
        filledBoth: false
      });
    });

    gccDocs.forEach(sub => {
      if (!sub.email) return;
      const key = sub.email.trim().toLowerCase();
      const fullName = sub.name || `${sub.firstName || ''} ${sub.lastName || ''}`.trim() || 'N/A';

      leads.push({
        _id: sub._id,
        email: key,
        name: fullName,
        company: sub.company || 'N/A',
        role: sub.role || 'N/A',
        size: sub.size || 'N/A',
        revenue: 'N/A',
        magneto: { completed: false },
        gcc: {
          completed: true,
          riskScore: sub.riskScore || 72,
          tier: sub.tier || 'High Risk',
          p1Score: sub.p1Score || 75,
          p2Score: sub.p2Score || 68,
          p3Score: sub.p3Score || 72,
          completedAt: sub.completedAt || new Date()
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
    console.error('get-leads Netlify function error:', err);
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: false,
        offline: true,
        error: err.message,
        leads: [],
        summary: { totalBoth: 0, totalMagneto: 0, totalGcc: 0, totalUnique: 0, conversionRate: 0 }
      })
    };
  }
};
