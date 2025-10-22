const db = require('../config/database');
const { decrypt } = require('../utils/encryption');
const PDFDocument = require('pdfkit');
const bcrypt = require('bcryptjs');

// Hardcoded admin credentials (for now)
// TODO: Replace with a more secure method, e.g., from a database
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';
const ADMIN_PASSWORD_HASH = process.env.ADMIN_PASSWORD_HASH || bcrypt.hashSync('password', 10);


// Display the admin login page
exports.getLogin = (req, res) => {
    res.render('admin/login', { t: req.t, error: null });
};

// Handle admin login
exports.postLogin = async (req, res) => {
    const { username, password } = req.body;

    if (username === ADMIN_USERNAME && await bcrypt.compare(password, ADMIN_PASSWORD_HASH)) {
        req.session.user = { username: ADMIN_USERNAME };
        res.redirect('/admin/dashboard');
    } else {
        res.render('admin/login', { t: req.t, error: 'Invalid username or password' });
    }
};

// Handle admin logout
exports.getLogout = (req, res) => {
    req.session.destroy(err => {
        if (err) {
            return res.redirect('/admin/dashboard');
        }
        res.clearCookie('connect.sid');
        res.redirect('/admin/login');
    });
};


// Display the admin dashboard
exports.getDashboard = async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM reports ORDER BY created_at DESC');
        const reports = result.rows.map(report => ({
            ...report,
            title: decrypt(report.title)
        }));

        res.render('admin-dashboard', {
            t: req.t,
            reports
        });
    } catch (error) {
        console.error('Error fetching dashboard data:', error);
        res.status(500).send('An error occurred while fetching dashboard data.');
    }
};

// Export a report as PDF
exports.exportPdf = async (req, res) => {
    const { id } = req.params;

    try {
        // Fetch the report
        const reportQuery = 'SELECT * FROM reports WHERE id = $1';
        const reportResult = await db.query(reportQuery, [id]);

        if (reportResult.rows.length === 0) {
            return res.status(404).send('Case not found.');
        }

        const report = reportResult.rows[0];
        report.title = decrypt(report.title);
        report.description = decrypt(report.description);

        // Fetch messages for the report
        const messagesQuery = 'SELECT * FROM messages WHERE report_id = $1 ORDER BY created_at ASC';
        const messagesResult = await db.query(messagesQuery, [id]);
        const messages = messagesResult.rows.map(msg => ({
            ...msg,
            message: decrypt(msg.message)
        }));

        // Create a PDF document
        const doc = new PDFDocument();
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="report-${report.id}.pdf"`);
        doc.pipe(res);

        doc.fontSize(18).text(`${req.t('case')}: ${report.title}`, { underline: true });
        doc.moveDown();
        doc.fontSize(12).text(`${req.t('status')}: ${report.status}`);
        doc.text(`${req.t('created_at')}: ${new Date(report.created_at).toLocaleString()}`);
        doc.moveDown();
        doc.text(`${req.t('description')}: ${report.description}`);
        doc.moveDown();
        doc.addPage();
        doc.fontSize(16).text(req.t('communication_channel'), { underline: true });
        doc.moveDown();

        messages.forEach(message => {
            doc.fontSize(12).text(`${message.sender} (${new Date(message.created_at).toLocaleString()}):`);
            doc.text(message.message);
            doc.moveDown();
        });

        doc.end();

    } catch (error) {
        console.error('Error exporting PDF:', error);
        res.status(500).send('An error occurred while exporting the PDF.');
    }
};

// Close a case
exports.closeCase = async (req, res) => {
    const { id } = req.params;

    try {
        const query = `
            UPDATE reports
            SET status = 'closed', closed_at = NOW()
            WHERE id = $1
        `;
        await db.query(query, [id]);
        res.redirect('/admin/dashboard');
    } catch (error) {
        console.error('Error closing case:', error);
        res.status(500).send('An error occurred while closing the case.');
    }
};

// Get compliance report
exports.getComplianceReport = async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM reports ORDER BY created_at DESC');
        const reports = result.rows.map(report => {
            const createdAt = new Date(report.created_at);
            const ackDeadline = new Date(createdAt);
            ackDeadline.setDate(createdAt.getDate() + 7);
            const resDeadline = new Date(createdAt);
            resDeadline.setMonth(createdAt.getMonth() + 3);

            return {
                ...report,
                title: decrypt(report.title),
                ack_deadline: ackDeadline,
                res_deadline: resDeadline,
                ack_met: report.acknowledged_at ? new Date(report.acknowledged_at) <= ackDeadline : null,
                res_met: report.responded_at ? new Date(report.responded_at) <= resDeadline : null
            };
        });

        res.render('reports/compliance', {
            t: req.t,
            reports
        });
    } catch (error) {
        console.error('Error fetching compliance report data:', error);
        res.status(500).send('An error occurred while fetching compliance report data.');
    }
};

// Get last year's report
exports.getLastYearReport = async (req, res) => {
    try {
        const lastYear = new Date();
        lastYear.setFullYear(lastYear.getFullYear() - 1);

        const result = await db.query('SELECT * FROM reports WHERE created_at >= $1 ORDER BY created_at DESC', [lastYear]);
        const reports = result.rows.map(report => ({
            ...report,
            title: decrypt(report.title)
        }));

        res.render('reports/last-year', {
            t: req.t,
            reports
        });
    } catch (error) {
        console.error('Error fetching last year report data:', error);
        res.status(500).send('An error occurred while fetching last year report data.');
    }
};
