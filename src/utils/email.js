const nodemailer = require('nodemailer');
require('dotenv').config();

const fromAddress = process.env.SMTP_FROM || process.env.SMTP_USER || 'no-reply@example.com';

const transportOptions = {
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT || 25),
  secure: process.env.SMTP_SECURE === 'true'
};

// Bara auth om SMTP_USER finns
if (process.env.SMTP_USER) {
  transportOptions.auth = { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS || '' };
}

const transporter = nodemailer.createTransport(transportOptions);

async function sendMail(subject, text) {
  const to = process.env.NOTIFY_EMAILS;
  if (!process.env.SMTP_HOST) {
    console.error('SMTP_HOST not set');
    return;
  }
  if (!to) {
    console.error('NOTIFY_EMAILS not set');
    return;
  }
  try {
    await transporter.sendMail({
      from: fromAddress, // <-- använder SMTP_FROM
      to,
      subject,
      text
    });
    console.log(`Email sent to ${to}`);
  } catch (err) {
    console.error('Error sending email notification:', err);
  }
}

module.exports = { sendMail };
