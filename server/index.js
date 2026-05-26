const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const chatRoutes = require('./routes/chatRoutes');
const messageModelFactory = require('./models/Message');
const shieldGccLeadModelFactory = require('./models/ShieldGccLead');
const { sendRiskReportEmail } = require('./utils/emailService');

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
    
    // Initialize ShieldGccLead model on the primary connection
    const ShieldGccLead = shieldGccLeadModelFactory(mongoose.connection);
    app.set('shieldGccLeadModel', ShieldGccLead);
    
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
app.post('/api/shieldgcc/leads', async (req, res) => {
  let { email, company, role, size, riskScore, tier, firstName, lastName, p1Score, p2Score, p3Score } = req.body;

  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }

  // Extract name from email if not provided
  if (email && (!firstName || !lastName)) {
    const username = email.split('@')[0];
    const parts = username.split(/[._-]/);
    if (parts.length >= 2) {
      firstName = firstName || (parts[0].charAt(0).toUpperCase() + parts[0].slice(1));
      lastName = lastName || (parts[parts.length - 1].charAt(0).toUpperCase() + parts[parts.length - 1].slice(1));
    } else if (parts.length === 1) {
      firstName = firstName || (parts[0].charAt(0).toUpperCase() + parts[0].slice(1));
      lastName = lastName || 'Leader';
    } else {
      firstName = firstName || 'GCC';
      lastName = lastName || 'Leader';
    }
  }

  const ShieldGccLead = app.get('shieldGccLeadModel');
  if (!ShieldGccLead) {
    return res.status(500).json({ error: 'Database is not fully initialized yet' });
  }

  try {
    const newLead = new ShieldGccLead({
      email,
      company,
      role,
      size,
      riskScore,
      tier,
      firstName,
      lastName,
      p1Score: p1Score || 0,
      p2Score: p2Score || 0,
      p3Score: p3Score || 0
    });

    const savedLead = await newLead.save();
    console.log('New ShieldGCC Lead Saved to MongoDB:', savedLead);

    // Asynchronously trigger risk report email
    sendRiskReportEmail(savedLead)
      .then(() => console.log(`[Email] Risk report email sent to ${email}`))
      .catch(err => console.error(`[Email] Error sending email to ${email}:`, err));

    res.status(201).json({ 
      message: 'Lead captured and saved successfully', 
      leadId: savedLead._id 
    });
  } catch (error) {
    console.error('Error saving lead to database:', error);
    res.status(500).json({ error: 'Internal server error while saving lead' });
  }
});

// Endpoint to retrieve a specific ShieldGCC lead by ID
app.get('/api/shieldgcc/leads/:id', async (req, res) => {
  const ShieldGccLead = app.get('shieldGccLeadModel');
  if (!ShieldGccLead) {
    return res.status(500).json({ error: 'Database is not fully initialized yet' });
  }

  try {
    const lead = await ShieldGccLead.findById(req.params.id);
    if (!lead) {
      return res.status(404).json({ error: 'Lead not found' });
    }
    res.json(lead);
  } catch (error) {
    console.error('Error fetching lead by ID:', error);
    res.status(500).json({ error: 'Internal server error while fetching lead' });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
