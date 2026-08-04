const mongoose = require('mongoose');

const magnetoAssessmentSchema = new mongoose.Schema({
  sessionId: {
    type: String,
    required: true,
    unique: true
  },
  companyInfo: {
    company: String,
    industry: String,
    revenue: String,
    size: String,
    role: String,
    invest: String
  },
  // answers stored as an object. E.g., { "0": { "0": 4, "1": 3 }, "1": { ... } }
  answers: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  scores: {
    dimensionScores: [{
      dimensionId: String,
      scorePct: Number
    }],
    overallPct: Number,
    tier: String
  },
  leadInfo: {
    email: String,
    name: String,
    phone: String
  },
  reportToken: {
    type: String,
    unique: true,
    sparse: true
  },
  status: {
    type: String,
    enum: ['in_progress', 'completed'],
    default: 'in_progress'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  completedAt: {
    type: Date
  }
});

// Using a factory pattern similar to existing models in the codebase
const magnetoAssessmentModelFactory = (connection) => {
  return connection.model('MagnetoAssessment', magnetoAssessmentSchema);
};

module.exports = magnetoAssessmentModelFactory;
