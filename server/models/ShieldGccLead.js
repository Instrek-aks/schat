const mongoose = require('mongoose');

const shieldGccLeadSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    index: true
  },
  company: {
    type: String
  },
  phone: {
    type: String
  },
  role: {
    type: String
  },
  size: {
    type: String
  },
  riskScore: {
    type: Number
  },
  tier: {
    type: String
  },
  firstName: {
    type: String
  },
  lastName: {
    type: String
  },
  p1Score: {
    type: Number
  },
  p2Score: {
    type: Number
  },
  p3Score: {
    type: Number
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

module.exports = (db) => db.model('ShieldGccLead', shieldGccLeadSchema);
