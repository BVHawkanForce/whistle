const db = require('../config/database');
const { decrypt } = require('../utils/encryption');
const { encrypt } = require('../utils/encryption');

// Display a case
exports.getCase = async (req, res) => {
  const { code } = req.query;

  if (!code) {
    return res.redirect('/case/login');
  }

  try {
    const reportQuery = `
      SELECT *,
             CASE
               WHEN reporter_code = $1 THEN 'reporter'
               WHEN handler_code  = $1 THEN 'handler'
             END AS user_type
      FROM reports
      WHERE reporter_code = $1 OR handler_code = $1
      LIMIT 1
    `;
    const reportResult = await db.query(reportQuery, [code]);

    if (reportResult.rows.length === 0) {
      return res.status(404).send('Case not found.');
    }

    const report = reportResult.rows[0];
    const isHandler = report.user_type === 'handler';

    report.title = decrypt(report.title);
    report.description = decrypt(report.description);

    const messagesQuery = 'SELECT * FROM messages WHERE report_id = $1 ORDER BY created_at ASC';
    const messagesResult = await db.query(messagesQuery, [report.id]);
    const messages = messagesResult.rows.map((msg) => ({
      ...msg,
      message: decrypt(msg.message),
    }));

    res.render('case-view', {
      t: req.t,
      report,
      messages,
      userType: isHandler ? 'handler' : 'reporter',
    });
  } catch (error) {
    console.error('Error fetching case:', error);
    res.status(500).send('An error occurred while fetching the case.');
  }
};

// Post a new message
exports.postMessage = async (req, res) => {
  const { id } = req.params;
  const { message, userType, is_acknowledgement, is_response } = req.body;

  if (!message) {
    return res.status(400).send('Message content is required.');
  }

  try {
    const encryptedMessage = encrypt(message);
    const sender = userType === 'handler' ? 'handler' : 'reporter';

    const client = await db.getClient();
    try {
      await client.query('BEGIN');

      const messageQuery = `
        INSERT INTO messages (report_id, sender, message)
        VALUES ($1, $2, $3)
      `;
      const messageValues = [id, sender, encryptedMessage];
      await client.query(messageQuery, messageValues);

      if (userType === 'handler') {
        if (is_acknowledgement) {
          await client.query('UPDATE reports SET acknowledged_at = NOW(), status = \'acknowledged\' WHERE id = $1', [id]);
        }
        if (is_response) {
          await client.query('UPDATE reports SET responded_at = NOW(), status = \'responded\' WHERE id = $1', [id]);
        }
      }

      await client.query('COMMIT');
    } catch (e) {
      await client.query('ROLLBACK');
      throw e;
    } finally {
      client.release();
    }

    res.redirect('back');
  } catch (error) {
    console.error('Error posting message:', error);
    res.status(500).send('An error occurred while posting the message.');
  }
};
