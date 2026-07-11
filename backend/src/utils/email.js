const nodemailer = require('nodemailer');

let transporter = null;

const getTransporter = async () => {
  if (transporter) return transporter;

  const testAccount = await nodemailer.createTestAccount();

  transporter = nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    secure: false,
    auth: {
      user: testAccount.user,
      pass: testAccount.pass,
    },
  });

  return transporter;
};

const sendEmail = async ({ to, subject, text }) => {
  try {
    const transport = await getTransporter();

    const info = await transport.sendMail({
      from: '"Blood Bank System" <noreply@bloodbank.com>',
      to,
      subject,
      text,
    });

    console.log(`📧 Email sent: ${subject}`);
    console.log(`   Preview: ${nodemailer.getTestMessageUrl(info)}`);

    return info;
  } catch (error) {
    console.error('Failed to send email:', error.message);
  }
};

module.exports = { sendEmail };