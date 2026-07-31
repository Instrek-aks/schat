import { MongoClient } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://abcd:abcd@cluster0.fsxomwi.mongodb.net/aiassest?appName=Cluster0';

let cachedClient = null;

async function getDatabase() {
  if (!cachedClient) {
    cachedClient = new MongoClient(MONGODB_URI, {
      serverSelectionTimeoutMS: 3000,
      connectTimeoutMS: 3000
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
    'Access-Control-Allow-Methods': 'POST, OPTIONS'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method Not Allowed' }) };
  }

  try {
    const db = await getDatabase();
    const data = JSON.parse(event.body || '{}');

    if (!data.email) {
      return { statusCode: 400, headers, body: JSON.stringify({ error: 'Email is required' }) };
    }

    const emailLower = data.email.trim().toLowerCase();

    if (data.riskScore !== undefined || data.p1Score !== undefined) {
      const gccCol = db.collection('gccleads');
      await gccCol.updateOne(
        { email: emailLower },
        {
          $set: {
            email: emailLower,
            name: data.name || `${data.firstName || ''} ${data.lastName || ''}`.trim() || 'Respondent',
            company: data.company || 'Enterprise',
            role: data.role || 'Executive',
            size: data.size || '500-2000',
            riskScore: data.riskScore || 72,
            tier: data.tier || 'High Risk',
            p1Score: data.p1Score || 75,
            p2Score: data.p2Score || 68,
            p3Score: data.p3Score || 72,
            completedAt: data.completedAt || new Date()
          }
        },
        { upsert: true }
      );
    } else {
      const magnetoCol = db.collection('magnetoleads');
      await magnetoCol.updateOne(
        { email: emailLower },
        {
          $set: {
            sessionId: data.sessionId || 'session_' + Date.now(),
            email: emailLower,
            name: data.name || 'Leader',
            company: data.company || 'Enterprise',
            role: data.role || 'Executive',
            size: data.size || '100-500',
            revenue: data.revenue || 'N/A',
            overallPct: data.overallPct || 84,
            tier: data.tier || 'Leader',
            completedAt: data.completedAt || new Date()
          }
        },
        { upsert: true }
      );
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ success: true, message: 'Lead saved to aiassest database' })
    };
  } catch (err) {
    console.error('save-lead Netlify function error:', err);
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ success: false, offline: true, error: err.message })
    };
  }
};
