// src/utils/emailService.js
const nodemailer = require('nodemailer');
const emailConfig = require('../config/emailConfig');

const transporter = nodemailer.createTransport(emailConfig.smtp);

/**
 * Sends an email notification.
 * @param {string} subject - The subject of the email.
 * @param {string} text - The plain text body of the email.
 * @param {string} html - The HTML body of the email.
 */
async function sendNotification(subject, text, html) {
  const mailOptions = {
    from: emailConfig.from,
    to: emailConfig.to,
    subject: subject,
    text: text,
    html: html
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Email notification sent successfully.');
  } catch (error) {
    console.error('Error sending email notification:', error);
  }
}

module.exports = {
  sendNotification
};
