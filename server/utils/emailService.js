// Helper to convert hex to rgb for styling backgrounds
function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? 
    `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}` 
    : '244, 63, 94';
}

exports.sendRiskReportEmail = async (leadData) => {
  const { _id, email, company, role, size, riskScore, tier } = leadData;
  
  if (!process.env.RESEND_API_KEY) {
    console.warn('[emailService] RESEND_API_KEY is not set in environment variables. Email notification skipped.');
    return;
  }

  let fromValue = process.env.RESEND_FROM || 'Instrek Technologies <onboarding@resend.dev>';
  
  // Self-heal: If the fromValue contains brackets <...> but no '@', automatically prepend 'info@'
  if (fromValue.includes('<') && fromValue.includes('>') && !fromValue.includes('@')) {
    fromValue = fromValue.replace('<', '<info@');
    console.warn(`[emailService] RESEND_FROM was missing an '@' symbol. Auto-corrected to: ${fromValue}`);
  }
  
  // Extract email address for mailto links if needed
  const emailRegex = /<([^>]+)>/;
  const match = fromValue.match(emailRegex);
  const fromEmail = match ? match[1] : fromValue;

  // Decide badge color based on tier
  let themeColor = '#F43F5E'; // Default: Critical (Red)
  if (tier === 'Moderate Risk') {
    themeColor = '#F59E0B'; // Orange
  } else if (tier === 'Strong Foundation' || riskScore < 45) {
    themeColor = '#10B981'; // Green
  }

  const rgbColor = hexToRgb(themeColor);

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body {
          font-family: 'Poppins', sans-serif;
          background-color: #03071E;
          color: #EEEEE6;
          margin: 0;
          padding: 0;
          -webkit-font-smoothing: antialiased;
        }
        .email-container {
          max-width: 600px;
          margin: 20px auto;
          background-color: #060D2E;
          border: 1px solid rgba(255, 255, 255, 0.05);
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 10px 30px rgba(0,0,0,0.5);
        }
        .header {
          background-color: #0A1535;
          padding: 30px 20px;
          text-align: center;
          border-bottom: 2px solid #2563EB;
        }
        .logo {
          color: #2563EB;
          font-size: 24px;
          font-weight: 800;
          letter-spacing: 2px;
          text-transform: uppercase;
          margin: 0;
        }
        .logo-sub {
          color: #5A6272;
          font-size: 11px;
          letter-spacing: 1px;
          text-transform: uppercase;
          margin-top: 5px;
        }
        .content {
          padding: 40px 30px;
        }
        .greeting {
          font-size: 18px;
          font-weight: 600;
          margin-top: 0;
          margin-bottom: 20px;
          color: #FFFFFF;
        }
        .intro-text {
          color: #A0AEC0;
          font-size: 15px;
          line-height: 1.6;
          margin-bottom: 30px;
        }
        .score-card {
          background-color: #0A1535;
          border-radius: 8px;
          padding: 25px;
          text-align: center;
          margin-bottom: 30px;
          border: 1px solid rgba(255,255,255,0.05);
        }
        .score-title {
          font-size: 13px;
          color: #5A6272;
          text-transform: uppercase;
          letter-spacing: 1.5px;
          margin: 0 0 10px 0;
        }
        .score-value {
          font-size: 64px;
          font-weight: 800;
          margin: 0;
          line-height: 1;
        }
        .tier-badge {
          display: inline-block;
          padding: 6px 16px;
          font-size: 14px;
          font-weight: 700;
          border-radius: 30px;
          margin-top: 15px;
          text-transform: uppercase;
          letter-spacing: 1px;
        }
        .details-table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 35px;
        }
        .details-table td {
          padding: 12px 0;
          border-bottom: 1px solid rgba(255,255,255,0.05);
          font-size: 14px;
        }
        .label {
          color: #5A6272;
          font-weight: 500;
          width: 40%;
        }
        .value {
          color: #EEEEE6;
          font-weight: 600;
          text-align: right;
        }
        .cta-button {
          display: block;
          background-color: #2563EB;
          color: #FFFFFF !important;
          text-decoration: none;
          text-align: center;
          font-size: 16px;
          font-weight: 700;
          padding: 15px;
          border-radius: 6px;
          margin-bottom: 30px;
        }
        .footer {
          background-color: #0A1535;
          padding: 20px;
          text-align: center;
          font-size: 12px;
          color: #5A6272;
          border-top: 1px solid rgba(255,255,255,0.05);
        }
        .footer p {
          margin: 5px 0;
        }
      </style>
    </head>
    <body>
      <div class="email-container">
        <div class="header">
          <h1 class="logo">Instrek Technologies</h1>
          <div class="logo-sub">Security Assessment</div>
        </div>
        <div class="content">
          <h2 class="greeting">Hi Leader,</h2>
          <p class="intro-text">
            Thank you for completing the Instrek Technologies Live Risk Scan. Your profile has been successfully evaluated across our primary security pillars.
          </p>
          
          <div class="score-card">
            <p class="score-title">Your Risk Score</p>
            <h2 class="score-value" style="color: ${themeColor};">${riskScore}</h2>
            <span class="tier-badge" style="background-color: rgba(${rgbColor}, 0.15); color: ${themeColor}; border: 1px solid ${themeColor};">
              ${tier}
            </span>
          </div>

          <table class="details-table">
            <tr>
              <td class="label">Company</td>
              <td class="value">${company || 'Not Specified'}</td>
            </tr>
            <tr>
              <td class="label">Your Role</td>
              <td class="value">${role || 'Not Specified'}</td>
            </tr>
            <tr>
              <td class="label">Size</td>
              <td class="value">${size || 'Not Specified'}</td>
            </tr>
            <tr>
              <td class="label">Scan ID</td>
              <td class="value">${Date.now()}</td>
            </tr>
          </table>
          <a href="${process.env.CLIENT_URL || 'https://sca1-t.netlify.app'}/?leadId=${_id}" class="cta-button" target="_blank" style="background-color: #00D68F; color: #0D1117 !important; margin-bottom: 15px;">
            View Your Full Risk Report
          </a>

          <a href="mailto:${fromEmail}?subject=Security%20Briefing%20Request" class="cta-button">
            Book a 20-Min Security Briefing
          </a>
          
          <p class="intro-text" style="font-size: 13px; text-align: center; color: #5A6272;">
            Our security architects are preparing your custom remediation blueprint to address the AI Sovereignty, Agentic Accountability, and Post-Quantum exposure flagged in this scan. We will reach out within 24 hours.
          </p>
        </div>
        <div class="footer">
          <p>Instrek Technologies &copy; 2026. All rights reserved.</p>
          <p>Governed by DPDP Act & GDPR compliance standards.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: fromValue,
        to: email,
        subject: `Instrek Technologies AI Risk Report: ${tier}`,
        html: htmlContent
      })
    });

    const resultData = await response.json();

    if (!response.ok) {
      throw new Error(resultData.message || `Resend HTTP error ${response.status}`);
    }

    console.log('[emailService] Email successfully sent via Resend API:', resultData);
    return resultData;
  } catch (error) {
    console.error('[emailService] Failed to send email via Resend API:', error);
    throw error;
  }
};

exports.sendMagnetoReportEmail = async (assessment) => {
  const { leadInfo, companyInfo, scores, reportToken, sessionId } = assessment;
  
  if (!process.env.RESEND_API_KEY) {
    console.warn('[emailService] RESEND_API_KEY is not set in environment variables. Email notification skipped.');
    return;
  }

  let fromValue = process.env.RESEND_FROM || 'Instrek Technologies <onboarding@resend.dev>';
  
  if (fromValue.includes('<') && fromValue.includes('>') && !fromValue.includes('@')) {
    fromValue = fromValue.replace('<', '<info@');
  }

  const emailRegex = /<([^>]+)>/;
  const match = fromValue.match(emailRegex);
  const fromEmail = match ? match[1] : fromValue;

  let themeColor = '#60A5FA'; // Default blue
  if (scores?.overallPct < 45) themeColor = '#EF4444'; // Red
  if (scores?.overallPct >= 78) themeColor = '#10B981'; // Green

  const rgbColor = hexToRgb(themeColor);
  const frontendUrl = process.env.CLIENT_URL || 'http://localhost:5173'; // fallback for dev
  const reportLink = `${frontendUrl}/report/${reportToken}`;

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: 'Poppins', sans-serif; background-color: #03071E; color: #EEEEE6; margin: 0; padding: 0; }
        .email-container { max-width: 600px; margin: 20px auto; background-color: #060D2E; border-radius: 12px; overflow: hidden; }
        .header { background-color: #0A1535; padding: 30px 20px; text-align: center; border-bottom: 2px solid #2563EB; }
        .logo { color: #2563EB; font-size: 24px; font-weight: 800; text-transform: uppercase; margin: 0; }
        .logo-sub { color: #5A6272; font-size: 11px; text-transform: uppercase; margin-top: 5px; }
        .content { padding: 40px 30px; }
        .greeting { font-size: 18px; font-weight: 600; margin-top: 0; margin-bottom: 20px; color: #FFFFFF; }
        .intro-text { color: #A0AEC0; font-size: 15px; line-height: 1.6; margin-bottom: 30px; }
        .score-card { background-color: #0A1535; border-radius: 8px; padding: 25px; text-align: center; margin-bottom: 30px; }
        .score-title { font-size: 13px; color: #5A6272; text-transform: uppercase; margin: 0 0 10px 0; }
        .score-value { font-size: 64px; font-weight: 800; margin: 0; line-height: 1; }
        .tier-badge { display: inline-block; padding: 6px 16px; font-size: 14px; font-weight: 700; border-radius: 30px; margin-top: 15px; text-transform: uppercase; }
        .cta-button { display: block; background-color: #2563EB; color: #FFFFFF !important; text-decoration: none; text-align: center; font-size: 16px; font-weight: 700; padding: 15px; border-radius: 6px; margin-bottom: 30px; }
        .footer { background-color: #0A1535; padding: 20px; text-align: center; font-size: 12px; color: #5A6272; border-top: 1px solid rgba(255,255,255,0.05); }
      </style>
    </head>
    <body>
      <div class="email-container">
        <div class="header">
          <h1 class="logo">Instrek Technologies</h1>
          <div class="logo-sub">Technology Solutions</div>
        </div>
        <div class="content">
          <h2 class="greeting">Hi ${leadInfo?.name || 'Leader'},</h2>
          <p class="intro-text">
            Thank you for completing the Magneto Instrek Technologies Assessment. We have processed your responses and your custom report is ready.
          </p>
          
          <div class="score-card">
            <p class="score-title">Overall Maturity Score</p>
            <h2 class="score-value" style="color: ${themeColor};">${scores?.overallPct || 0}%</h2>
            <span class="tier-badge" style="background-color: rgba(${rgbColor}, 0.15); color: ${themeColor}; border: 1px solid ${themeColor};">
              ${scores?.tier || 'Assessed'}
            </span>
          </div>

          <a href="${reportLink}" class="cta-button">
            View Your Full Results Dashboard
          </a>
        </div>
        <div class="footer">
          <p>Instrek Technologies &copy; 2026. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: fromValue,
        to: leadInfo.email,
        subject: `Your Instrek Technologies Report: ${scores?.overallPct || 0}%`,
        html: htmlContent
      })
    });

    const resultData = await response.json();

    if (!response.ok) {
      throw new Error(resultData.message || `Resend HTTP error ${response.status}`);
    }

    console.log('[emailService] Magneto report email successfully sent:', resultData);
    return resultData;
  } catch (error) {
    console.error('[emailService] Failed to send Magneto report email:', error);
  }
};
