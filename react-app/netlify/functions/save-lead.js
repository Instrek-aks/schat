import { MongoClient } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI;

let cachedClient = null;

async function getDatabase() {
  if (!MONGODB_URI) {
    throw new Error('MONGODB_URI environment variable is not defined');
  }
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
      await gccCol.insertOne({
        email: emailLower,
        name: data.name || `${data.firstName || ''} ${data.lastName || ''}`.trim() || null,
        phone: data.phone || null,
        company: data.company || null,
        role: data.role || null,
        size: data.size || null,
        riskScore: data.riskScore !== undefined ? data.riskScore : null,
        tier: data.tier || null,
        p1Score: data.p1Score !== undefined ? data.p1Score : null,
        p2Score: data.p2Score !== undefined ? data.p2Score : null,
        p3Score: data.p3Score !== undefined ? data.p3Score : null,
        completedAt: data.completedAt ? new Date(data.completedAt) : new Date()
      });
    } else {
      const magnetoCol = db.collection('magnetoleads');
      await magnetoCol.insertOne({
        sessionId: data.sessionId || 'session_' + Date.now(),
        email: emailLower,
        name: data.name || null,
        phone: data.phone || null,
        company: data.company || null,
        role: data.role || null,
        size: data.size || null,
        revenue: data.revenue || null,
        overallPct: data.overallPct !== undefined ? data.overallPct : null,
        tier: data.tier || null,
        completedAt: data.completedAt ? new Date(data.completedAt) : new Date()
      });
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
