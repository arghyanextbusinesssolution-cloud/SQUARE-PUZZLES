/**
 * Email service
 * Sends emails from the backend using Nodemailer and EmailJS (for welcome emails)
 */
const nodemailer = require('nodemailer');

const EMAILJS_API = 'https://api.emailjs.com/api/v1.0/email/send';

const config = {
  publicKey: process.env.EMAILJS_PUBLIC_KEY,
  privateKey: process.env.EMAILJS_PRIVATE_KEY,
  serviceId: process.env.EMAILJS_SERVICE_ID || 'default_service',
  templateWelcome: process.env.EMAILJS_TEMPLATE_WELCOME || 'template_hr8f21p',
};

/**
 * Check if EmailJS is properly configured
 */
const isConfigured = () => {
  const hasKeys = config.publicKey && config.privateKey;
  if (!hasKeys) {
    console.log('[EmailService] Not configured: missing EMAILJS_PUBLIC_KEY or EMAILJS_PRIVATE_KEY');
    return false;
  }
  return true;
};

/**
 * Send welcome email via EmailJS REST API
 * @param {string} userEmail - Recipient email
 * @param {string} userName - Recipient name
 * @returns {Promise<{ success: boolean, error?: string }>}
 */
const sendWelcomeEmail = async (userEmail, userName) => {
  console.log('[EmailService] Attempting to send welcome email to:', userEmail);

  if (!isConfigured()) {
    return { success: false, error: 'EmailJS not configured' };
  }

  // Template variables - your EmailJS template uses {{email}} for To, {{name}} for subject
  const template_params = {
    email: userEmail,
    name: userName || 'Player',
    to_email: userEmail,
    user_email: userEmail,
    to_name: userName || 'Player',
    user_name: userName || 'Player',
    app_name: 'Square Puzzles',
  };

  const payload = {
    service_id: config.serviceId,
    template_id: config.templateWelcome,
    user_id: config.publicKey,
    accessToken: config.privateKey,
    template_params,
  };

  try {
    const response = await fetch(EMAILJS_API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (response.ok) {
      console.log('[EmailService] Welcome email sent successfully to:', userEmail);
      return { success: true };
    }

    const errorText = await response.text();
    console.error('[EmailService] Failed to send welcome email:', response.status, errorText);
    return { success: false, error: errorText || `HTTP ${response.status}` };
  } catch (err) {
    console.error('[EmailService] Error sending welcome email:', err.message);
    return { success: false, error: err.message };
  }
};

/**
 * Configure Nodemailer SMTP Transporter
 */
const createTransporter = () => {
  return nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true, // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
    family: 4, // Force IPv4 to avoid ENETUNREACH error on IPv6
    // Add timeouts to prevent long-hanging requests
    connectionTimeout: 10000, // 10 seconds
    greetingTimeout: 10000,
    socketTimeout: 15000
  });
};

/**
 * Send password reset email via Nodemailer
 * @param {string} userEmail - Recipient email
 * @param {string} resetToken - The raw reset token
 * @returns {Promise<{ success: boolean, error?: string }>}
 */
const sendPasswordResetEmail = async (userEmail, resetToken) => {
  console.log('[EmailService] Attempting to send password reset email to:', userEmail);

  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.error('[EmailService] Not configured: missing EMAIL_USER or EMAIL_PASS');
    return { success: false, error: 'SMTP not configured' };
  }

  const transporter = createTransporter();

  // Use CLIENT_URL from env, fallback to frontend URL for safety
  const clientUrl = process.env.CLIENT_URL || 'http://localhost:3000';
  const resetUrl = `${clientUrl}/reset-password/${resetToken}`;

  const mailOptions = {
    from: `"Square Puzzles" <${process.env.EMAIL_USER}>`,
    to: userEmail,
    subject: 'Password Reset Request',
    html: `
      <h2>Password Reset Request</h2>
      <p>Someone requested to reset the password for your Square Puzzles account.</p>
      <p>If you did not request this, please ignore this email and your password will remain unchanged.</p>
      <p>Click the link below to reset your password. This link is valid for 15 minutes.</p>
      <a href="${resetUrl}" style="display:inline-block;padding:10px 20px;margin-top:20px;background-color:#059669;color:white;text-decoration:none;border-radius:5px;">Reset Password</a>
      <p style="margin-top:30px;color:#666;font-size:12px;">Link not working? Paste this into your browser: <br>${resetUrl}</p>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('[EmailService] Password reset email sent:', info.messageId);
    return { success: true };
  } catch (err) {
    console.error('[EmailService] Comprehensive Error Report for Password Reset:');
    console.error(' - Error Message:', err.message);
    console.error(' - Error Code:', err.code);
    console.error(' - Command:', err.command);
    console.error(' - Response:', err.response);
    console.error(' - Host:', err.host);
    console.error(' - Port:', err.port);
    if (err.stack) {
      console.error('[EmailService] Error Stack:', err.stack);
    }
    return { success: false, error: err.message };
  }
};

module.exports = {
  sendWelcomeEmail,
  sendPasswordResetEmail,
  isConfigured,
};
