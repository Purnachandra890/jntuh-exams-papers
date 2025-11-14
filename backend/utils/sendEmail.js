const Brevo = require('@getbrevo/brevo'); // Brevo API SDK

const sendEmail = async ({ to, subject, html }) => {
  try {
    const apiInstance = new Brevo.TransactionalEmailsApi();
    const apiKey = apiInstance.authentications['apiKey'];
    apiKey.apiKey = process.env.EMAIL_API_KEY; // Same key you used for SMTP

    const sendSmtpEmail = new Brevo.SendSmtpEmail();

    sendSmtpEmail.sender = {
      name: "Paper Review",
      email: process.env.ADMIN_EMAIL,   // Gmail is fine here!
    };

    sendSmtpEmail.to = [{ email: to }];
    sendSmtpEmail.subject = subject;
    sendSmtpEmail.htmlContent = html;

    await apiInstance.sendTransacEmail(sendSmtpEmail);

    console.log("Email sent via Brevo API to:", to);
  } catch (error) {
    console.error("Email API Error:", error.response?.data || error.message);
    throw error;
  }
};

module.exports = sendEmail;
