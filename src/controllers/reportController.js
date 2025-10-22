const crypto = require('crypto');
const db = require('../config/database');
const { encrypt } = require('../utils/encryption');

const generateSecureCode = () => {
  return crypto.randomBytes(16).toString('hex');
};

exports.submitReport = async (req, res) => {
  const { title, description } = req.body;

  if (!title || !description) {
    return res.status(400).send('Title and description are required.');
  }

  try {
    const reporterCode = generateSecureCode();
    const handlerCode = generateSecureCode();

    const encryptedTitle = encrypt(title);
    const encryptedDescription = encrypt(description);

    const query = `
      INSERT INTO reports (reporter_code, handler_code, title, description)
      VALUES ($1, $2, $3, $4)
      RETURNING id
    `;
    const values = [reporterCode, handlerCode, encryptedTitle, encryptedDescription];

    const result = await db.query(query, values);
    const reportId = result.rows[0].id;

    // Redirect to a success page displaying the code
    res.redirect(`/report/success?code=${reporterCode}`);

  } catch (error) {
    console.error('Error submitting report:', error);
    res.status(500).send('An error occurred while submitting the report.');
  }
};
