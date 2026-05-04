const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const chatRoutes = require('./routes/chatRoutes');
const messageModelFactory = require('./models/Message');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// --- DATABASE CONNECTION ---
const MONGODB_URI = process.env.MONGODB_URI;

mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('Connected to Primary Database');
    
    // Create a separate database instance for "schat"
    const chatDb = mongoose.connection.useDb('schat');
    console.log('Connected to "schat" Database instance');

    // Initialize Message model on the chat database
    const Message = messageModelFactory(chatDb);
    
    // Store Message model in app settings for use in controllers
    app.set('chatModel', Message);
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
  });

// Mock database (for demonstration - legacy leads)
let leads = [];

app.get('/', (req, res) => {
  res.send('ShieldGCC & Magneto Backend with Chat is running.');
});

// --- CHAT ROUTES ---
app.use('/api/chat', chatRoutes);

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
