const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
    const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASSWORD,
        },
    });

    // Verify connection configuration
    try {
        await transporter.verify();
        console.log('Server is ready to take our messages');
    } catch (error) {
        console.error('SMTP Connection Error:', error);
        throw new Error(`SMTP Connection Error: ${error.message}`);
    }

    const mailOptions = {
        from: `MediConnect <${process.env.EMAIL_FROM}>`,
        to: options.email,
        subject: options.subject,
        text: options.message,
        html: options.html,
    };

    await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;
