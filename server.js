const express = require('express');
const path = require('path');
const cors = require('cors');
const dotenv = require('dotenv');
const nodemailer = require('nodemailer');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const publicPath = path.join(__dirname);
app.use(express.static(publicPath));

app.get('/ping', (req, res) => res.send('pong'));

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
    }
});

app.post('/api/contact', async(req, res) => {
    const { name, email, subject, message } = req.body;

    if (!name || !email || !message) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    try {
        await transporter.sendMail({
            from: `${name} <${email}>`,
            to: process.env.TO_EMAIL,
            subject: subject || 'New message from portfolio',
            text: message,
            html: `<p>${message.replace(/\n/g, '<br>')}</p>
                   <p><strong>From:</strong> ${name} (${email})</p>`
        });

        res.json({ ok: true });
    } catch (err) {
        console.error('Mail error:', err);
        res.status(500).json({ error: 'Failed to send email' });
    }
});

// Fallback for SPA
app.get('*', (req, res) => {
    res.sendFile(path.join(publicPath, 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});