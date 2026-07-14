exports.handler = async (event, context) => {
  // Enable CORS for frontend requests
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS'
  };

  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers
    };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method Not Allowed' })
    };
  }

  try {
    const { email, subject, html } = JSON.parse(event.body);
    const emailLower = email ? email.trim().toLowerCase() : '';

    const apiKey = process.env.RESEND_API_KEY || 're_8GC4e9CG_DP9An243JVhDMTz4zHtQB5WN';
    const fromEmail = process.env.RESEND_FROM || 'ShieldGCC <info@shieldgcc.instrek.com>';

    if (!apiKey) {
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: 'RESEND_API_KEY environment variable is not configured on Netlify.' })
      };
    }

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: fromEmail,
        to: emailLower,
        subject: subject,
        html: html
      })
    });

    const result = await response.json();
    
    return {
      statusCode: response.ok ? 200 : response.status,
      headers,
      body: JSON.stringify(result)
    };
  } catch (error) {
    console.error('Error in Netlify function:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: error.message })
    };
  }
};
