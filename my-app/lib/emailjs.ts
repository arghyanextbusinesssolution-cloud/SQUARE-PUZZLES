import emailjs from '@emailjs/browser';

// Initialize EmailJS with your public key
const SERVICE_ID = process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID || '';
const PUBLIC_KEY = process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY || '';

// Template IDs
const TEMPLATES = {
  WELCOME: process.env.NEXT_PUBLIC_EMAILJS_WELCOME_TEMPLATE || '',
  PASSWORD_RESET: process.env.NEXT_PUBLIC_EMAILJS_RESET_TEMPLATE || '',
  DAILY_REMINDER: process.env.NEXT_PUBLIC_EMAILJS_REMINDER_TEMPLATE || '',
  REPORT_CONFIRMATION: process.env.NEXT_PUBLIC_EMAILJS_REPORT_TEMPLATE || '',
  COMPLETION: process.env.NEXT_PUBLIC_EMAILJS_COMPLETION_TEMPLATE || '',
};

// Initialize EmailJS
export const initEmailJS = () => {
  if (PUBLIC_KEY) {
    emailjs.init(PUBLIC_KEY);
  }
};

// Initialize immediately if public key is present (defensive — ensures later sends don't fail)
initEmailJS();

// Send welcome email
export const sendWelcomeEmail = async (userEmail: string, userName: string) => {
  console.log('[EmailJS] Sending welcome email to:', userEmail);

  if (!SERVICE_ID || !TEMPLATES.WELCOME) {
    console.warn('[EmailJS] Not configured for welcome emails. Missing SERVICE_ID or WELCOME template.');
    return;
  }

  if (!PUBLIC_KEY) {
    console.warn('[EmailJS] Public key not configured. Skipping welcome email.');
    return;
  }

  try {
    initEmailJS();
    await emailjs.send(SERVICE_ID, TEMPLATES.WELCOME, {
      to_email: userEmail,
      to_name: userName || 'Player',
      app_name: 'Square Puzzles',
    });
    console.log('[EmailJS] Welcome email sent successfully to:', userEmail);
  } catch (error) {
    console.error('[EmailJS] Failed to send welcome email:', error);
  }
};

// Send password reset email
export const sendPasswordResetEmail = async (
  userEmail: string,
  userName: string,
  resetLink: string
) => {
  if (!SERVICE_ID || !TEMPLATES.PASSWORD_RESET) {
    console.warn('EmailJS not configured for password reset emails');
    return;
  }

  try {
    initEmailJS();
    await emailjs.send(SERVICE_ID, TEMPLATES.PASSWORD_RESET, {
      to_email: userEmail,
      to_name: userName || 'Player',
      reset_link: resetLink,
      app_name: 'Square Puzzles',
    });
  } catch (error) {
    console.error('Failed to send password reset email:', error);
  }
};

// Send daily reminder email
export const sendDailyReminder = async (userEmail: string, userName: string) => {
  if (!SERVICE_ID || !TEMPLATES.DAILY_REMINDER) {
    console.warn('EmailJS not configured for daily reminders');
    return;
  }

  try {
    initEmailJS();
    await emailjs.send(SERVICE_ID, TEMPLATES.DAILY_REMINDER, {
      to_email: userEmail,
      to_name: userName || 'Player',
      app_name: 'Square Puzzles',
      puzzle_url: typeof window !== 'undefined' ? `${window.location.origin}/play` : '',
    });
  } catch (error) {
    console.error('Failed to send daily reminder:', error);
  }
};

// Send report confirmation to admin
export const sendReportConfirmation = async (
  adminEmail: string,
  reportDetails: {
    reportId: string;
    userId: string;
    puzzleDate: string;
    reportType: string;
    description?: string;
  }
) => {
  if (!SERVICE_ID || !TEMPLATES.REPORT_CONFIRMATION) {
    console.warn('EmailJS not configured for report confirmations');
    return;
  }

  try {
    initEmailJS();
    await emailjs.send(SERVICE_ID, TEMPLATES.REPORT_CONFIRMATION, {
      to_email: adminEmail,
      report_id: reportDetails.reportId,
      user_id: reportDetails.userId,
      puzzle_date: reportDetails.puzzleDate,
      report_type: reportDetails.reportType,
      description: reportDetails.description || 'No description provided',
      app_name: 'Square Puzzles',
    });
  } catch (error) {
    console.error('Failed to send report confirmation:', error);
  }
};

// Send completion notification
export const sendCompletionNotification = async (
  userEmail: string,
  userName: string,
  puzzleDate: string,
  hintUsed: boolean
) => {
  if (!SERVICE_ID || !TEMPLATES.COMPLETION) {
    console.warn('EmailJS not configured for completion notifications');
    return;
  }

  try {
    initEmailJS();
    await emailjs.send(SERVICE_ID, TEMPLATES.COMPLETION, {
      to_email: userEmail,
      to_name: userName || 'Player',
      puzzle_date: puzzleDate,
      hint_status: hintUsed ? 'Used hint' : 'No hint used',
      app_name: 'Square Puzzles',
    });
  } catch (error) {
    console.error('Failed to send completion notification:', error);
  }
};

export const emailService = {
  initEmailJS,
  sendWelcomeEmail,
  sendPasswordResetEmail,
  sendDailyReminder,
  sendReportConfirmation,
  sendCompletionNotification,
};
