import https from 'https';

export const handler = async (event, context) => {
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

  console.log('[send-email] Netlify Function (ESM) triggered.');

  try {
    // 1. Validate request body
    if (!event.body) {
      console.warn('[send-email] Missing request body.');
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Bad Request: Missing body parameters.' })
      };
    }

    const { email, subject, html } = JSON.parse(event.body);
    console.log('[send-email] Parsed request fields. Email:', email, ', Subject:', subject);

    if (!email || !subject || !html) {
      console.warn('[send-email] Validation failed: missing email, subject, or html.');
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Bad Request: email, subject, and html are required fields.' })
      };
    }

    const emailLower = email.trim().toLowerCase();

    // 2. Load API Key (Priority: process.env.RESEND_API_KEY -> fallback)
    console.log('[send-email] Checking for RESEND_API_KEY environment variable...');
    const apiKey = process.env.RESEND_API_KEY;
    const fromEmail = process.env.RESEND_FROM || 'ShieldGCC <info@shieldgcc.instrek.com>';

    console.log('[send-email] API Key retrieved. Length:', apiKey ? apiKey.length : 0);
    console.log('[send-email] From email address:', fromEmail);

    if (!apiKey) {
      console.error('[send-email] No Resend API Key found.');
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: 'Internal Server Error: RESEND_API_KEY is not configured.' })
      };
    }

    // 3. Make HTTPS request directly to Resend API using built-in Node.js module (zero npm dependencies)
    const payload = JSON.stringify({
      from: fromEmail,
      to: emailLower,
      subject: subject,
      html: html
    });

    console.log('[send-email] Sending POST request to api.resend.com...');
    const result = await new Promise((resolve, reject) => {
      const options = {
        hostname: 'api.resend.com',
        port: 443,
        path: '/emails',
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(payload)
        }
      };

      const req = https.request(options, (res) => {
        let body = '';
        res.on('data', (chunk) => {
          body += chunk;
        });
        res.on('end', () => {
          resolve({
            statusCode: res.statusCode,
            body: body
          });
        });
      });

      req.on('error', (err) => {
        reject(err);
      });

      req.write(payload);
      req.end();
    });

    console.log('[send-email] Resend API Response Status:', result.statusCode);
    console.log('[send-email] Resend API Response Body:', result.body);

    let responseData;
    try {
      responseData = JSON.parse(result.body);
    } catch (e) {
      responseData = { message: result.body };
    }

    const isSuccess = result.statusCode === 200 || result.statusCode === 201;

    return {
      statusCode: isSuccess ? 200 : result.statusCode,
      headers,
      body: JSON.stringify(responseData)
    };

  } catch (error) {
    console.error('[send-email] Unhandled exception occurred in Netlify Function:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: error.message || 'Internal Server Error',
        stack: error.stack
      })
    };
  }
};
