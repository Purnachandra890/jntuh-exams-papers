const nodemailer = require("nodemailer");

const sendEmail = async ({ to, subject, html }) => {
  // This transporter now uses Brevo's SMTP details from your .env file
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USER, // Your Brevo account email
      pass: process.env.EMAIL_API_KEY, // Your Brevo API Key
    },
  });

  await transporter.sendMail({
    from: `"Paper Review" <${process.env.ADMIN_EMAIL}>`,
    to,
    subject,
    html,
  });
};

module.exports = sendEmail;
