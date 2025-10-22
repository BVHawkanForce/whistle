const db = require('../config/database');
const { decrypt } = require('../utils/encryption');
const PDFDocument = require('pdfkit');

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
