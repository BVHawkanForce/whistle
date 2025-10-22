// src/config/emailConfig.js
require('dotenv').config();

module.exports = {
  smtp: {
    host: process.env.SMTP_HOST || 'smtp.example.com',
    port: process.env.SMTP_PORT || 587,
    secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER || 'user@example.com',
      pass: process.env.SMTP_PASS || 'password'
    }
  },
  from: process.env.EMAIL_FROM || '"Whistleblowing App" <noreply@example.com>',
  to: process.env.EMAIL_TO || 'management@example.com'
};
