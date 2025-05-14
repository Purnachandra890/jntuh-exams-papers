const nodemailer = require('nodemailer');

const sendEmail = async ({ to, subject, html }) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.ADMIN_EMAIL,
      pass: process.env.ADMIN_PASSWORD, // use App Password if Gmail
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
