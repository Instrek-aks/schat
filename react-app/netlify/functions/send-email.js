import { Resend } from 'resend';

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

  console.log('[send-email] Netlify Function triggered.');

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
    const apiKey = process.env.RESEND_API_KEY || 're_QNXYix5q_4Fq2RFURxvdwZiGu2gwtBkDY';
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

    // 3. Initialize Resend SDK
    console.log('[send-email] Initializing Resend SDK...');
    const resend = new Resend(apiKey);

    // 4. Send email using Resend SDK
    console.log('[send-email] Sending email via Resend SDK to:', emailLower);
    const { data, error } = await resend.emails.send({
      from: fromEmail,
      to: emailLower,
      subject: subject,
      html: html
    });

    if (error) {
      console.error('[send-email] Resend SDK returned an error:', error);
      const isUnauthorized = error.statusCode === 401 || error.message?.toLowerCase().includes('unauthorized') || error.message?.toLowerCase().includes('api key');
      return {
        statusCode: isUnauthorized ? 401 : 500,
        headers,
        body: JSON.stringify({ error: error.message || 'Resend failed to send email.', details: error })
      };
    }

    console.log('[send-email] Email sent successfully! Data:', data);
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ message: 'Email sent successfully', data })
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
