import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://ch:charu@cluster0.fsxomwi.mongodb.net/schat?appName=Cluster0';

let isConnected = false;

async function connectToDatabase() {
  if (isConnected && mongoose.connection.readyState === 1) return;
  try {
    await mongoose.connect(MONGODB_URI);
    isConnected = true;
  } catch (err) {
    console.error('MongoDB connection error in Netlify Function:', err);
    throw err;
  }
}

// Schemas
const magnetoSchema = new mongoose.Schema({
  sessionId: { type: String, required: true },
  email: { type: String, required: true, index: true },
  name: String,
  company: String,
  role: String,
  size: String,
  revenue: String,
  overallPct: Number,
  tier: String,
  completedAt: { type: Date, default: Date.now }
});

const gccSchema = new mongoose.Schema({
  email: { type: String, required: true, index: true },
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
  completedAt: { type: Date, default: Date.now }
});

const MagnetoLead = mongoose.models.MagnetoLead || mongoose.model('MagnetoLead', magnetoSchema);
const GccLead = mongoose.models.GccLead || mongoose.model('GccLead', gccSchema);

export const handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS'
  };

  if (event.httpMethod === 'OPTIONS') return { statusCode: 200, headers };
  if (event.httpMethod !== 'POST') return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method Not Allowed' }) };

  try {
    await connectToDatabase();
    const data = JSON.parse(event.body || '{}');

    if (!data.email) {
      return { statusCode: 400, headers, body: JSON.stringify({ error: 'Email is required' }) };
    }

    const emailLower = data.email.trim().toLowerCase();

    // Check if saving GCC or Magneto submission
    if (data.riskScore !== undefined || data.p1Score !== undefined) {
      await GccLead.findOneAndUpdate(
        { email: emailLower },
        {
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
        },
        { upsert: true, new: true }
      );
    } else {
      await MagnetoLead.findOneAndUpdate(
        { email: emailLower },
        {
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
        },
        { upsert: true, new: true }
      );
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ success: true, message: 'Lead saved to cloud database successfully' })
    };
  } catch (err) {
    console.error('Failed to save lead to MongoDB:', err);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: err.message })
    };
  }
};
