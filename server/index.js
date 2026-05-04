const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Mock database (for demonstration)
let leads = [];

app.get('/', (req, res) => {
  res.send('ShieldGCC & Magneto Backend is running.');
});

// Endpoint to capture Magneto assessment leads
app.post('/api/magneto/leads', (req, res) => {
  const { email, company, role, revenue, industry, scores, overall } = req.body;
  
  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }

  const newLead = {
    id: Date.now(),
    project: 'Magneto',
    email,
    company,
    role,
    revenue,
    industry,
    scores,
    overall,
    timestamp: new Date()
  };

  leads.push(newLead);
  console.log('New Magneto Lead Captured:', newLead);

  res.status(201).json({ 
    message: 'Lead captured successfully', 
    leadId: newLead.id 
  });
});

// Endpoint to capture ShieldGCC risk scan leads
app.post('/api/shieldgcc/leads', (req, res) => {
  const { email, company, role, size, riskScore, tier } = req.body;

  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }

  const newLead = {
    id: Date.now(),
    project: 'ShieldGCC',
    email,
    company,
    role,
    size,
    riskScore,
    tier,
    timestamp: new Date()
  };

  leads.push(newLead);
  console.log('New ShieldGCC Lead Captured:', newLead);

  res.status(201).json({ 
    message: 'Lead captured successfully', 
    leadId: newLead.id 
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
