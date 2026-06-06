const crypto = require('crypto');
const { sendMagnetoReportEmail } = require('../utils/emailService');

// Utility to generate unique tokens
const generateToken = () => crypto.randomBytes(32).toString('hex');

exports.startAssessment = async (req, res) => {
  try {
    const { companyInfo } = req.body;
    const MagnetoAssessment = req.app.get('magnetoAssessmentModel');
    
    if (!MagnetoAssessment) {
      return res.status(500).json({ error: 'Database not initialized' });
    }

    const sessionId = generateToken();
    const newAssessment = new MagnetoAssessment({
      sessionId,
      companyInfo,
      answers: {}
    });

    await newAssessment.save();
    res.status(201).json({ sessionId });
  } catch (error) {
    console.error('Error starting assessment:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.saveAnswer = async (req, res) => {
  try {
    const { sessionId, ansKey, score } = req.body;
    const MagnetoAssessment = req.app.get('magnetoAssessmentModel');

    const assessment = await MagnetoAssessment.findOne({ sessionId });
    if (!assessment) {
      return res.status(404).json({ error: 'Assessment not found' });
    }

    if (!assessment.answers) assessment.answers = {};
    
    // Set flat score
    if (ansKey) {
      assessment.answers[ansKey] = score;
    }

    // Need to tell Mongoose that the mixed type field 'answers' was modified
    assessment.markModified('answers');
    await assessment.save();

    // Calculate progress (total answered out of 22)
    const totalAnswered = Object.keys(assessment.answers).length;

    res.json({ progress: totalAnswered, success: true });
  } catch (error) {
    console.error('Error saving answer:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.emailGate = async (req, res) => {
  try {
    const { sessionId, email, name, answers, overallPct, tier } = req.body;
    const MagnetoAssessment = req.app.get('magnetoAssessmentModel');

    // Free provider check (simple version, matching frontend logic)
    const FREE_PROVIDERS = ["gmail", "yahoo", "hotmail", "outlook", "rediffmail", "yopmail"];
    const domain = email.split("@")[1]?.split(".")[0]?.toLowerCase();
    if (FREE_PROVIDERS.includes(domain)) {
      return res.status(400).json({ error: "invalid_email", message: "Please enter a valid corporate email address (not Gmail/Yahoo)." });
    }

    const assessment = await MagnetoAssessment.findOne({ sessionId });
    if (!assessment) {
      return res.status(404).json({ error: 'Assessment not found' });
    }

    const reportToken = generateToken();

    assessment.leadInfo = { email, name };
    assessment.reportToken = reportToken;
    if (answers) assessment.answers = answers;
    assessment.scores = { overallPct, tier };
    assessment.status = 'completed';
    assessment.completedAt = new Date();

    await assessment.save();

    // Asynchronously trigger the report email
    sendMagnetoReportEmail(assessment)
      .then(() => console.log(`[Email] Magneto report email sent to ${email}`))
      .catch(err => console.error(`[Email] Error sending Magneto email to ${email}:`, err));

    res.json({ reportToken });
  } catch (error) {
    console.error('Error at email gate:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.getReport = async (req, res) => {
  try {
    const { reportToken } = req.params;
    const MagnetoAssessment = req.app.get('magnetoAssessmentModel');

    const assessment = await MagnetoAssessment.findOne({ reportToken });
    if (!assessment) {
      return res.status(404).json({ error: 'Report not found' });
    }

    res.json({
      answers: assessment.answers,
      scores: assessment.scores,
      companyInfo: assessment.companyInfo,
      completedAt: assessment.completedAt
    });
  } catch (error) {
    console.error('Error fetching report:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
