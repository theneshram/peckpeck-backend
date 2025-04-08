const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

const sendMail = async ({ to, subject, html }) => {
  const mailOptions = {
    from: `"Peck Peck" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html
  };

  return transporter.sendMail(mailOptions);
};

module.exports = sendMail;
