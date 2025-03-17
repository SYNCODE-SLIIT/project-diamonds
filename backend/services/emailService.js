import nodemailer from 'nodemailer';

// Configure the transporter (using Ethereal for testing; replace with your SMTP details if needed)
const transporter = nodemailer.createTransport({
  host: 'smtp.ethereal.email',
  port: 587,
  auth: {
    user: 'your_ethereal_user', // Replace with your Ethereal (or other SMTP) user
    pass: 'your_ethereal_password' // Replace with your Ethereal (or other SMTP) password
  }
});

const sendApprovalEmail = async (application, accountCreationLink) => {
  const mailOptions = {
    from: '"Dance Team" <no-reply@danceteam.com>',
    to: application.email,
    subject: 'Your Application has been Approved',
    text: `Hello ${application.fullName},\n\nCongratulations! Your application to join the dance team has been approved.\nPlease create your account using the following link: ${accountCreationLink}\n\nThank you!`,
    html: `<p>Hello ${application.fullName},</p>
           <p>Congratulations! Your application to join the dance team has been approved.</p>
           <p>Please create your account using the following link: <a href="${accountCreationLink}">${accountCreationLink}</a></p>
           <p>Thank you!</p>`
  };

  try {
    let info = await transporter.sendMail(mailOptions);
    console.log('Approval email sent:', info.messageId);
  } catch (error) {
    console.error('Error sending approval email:', error);
    throw error;
  }
};

const sendRejectionEmail = async (application) => {
  const mailOptions = {
    from: '"Dance Team" <no-reply@danceteam.com>',
    to: application.email,
    subject: 'Your Application has been Rejected',
    text: `Hello ${application.fullName},\n\nWe regret to inform you that your application to join the dance team has been rejected.\n\nThank you for your interest.`,
    html: `<p>Hello ${application.fullName},</p>
           <p>We regret to inform you that your application to join the dance team has been rejected.</p>
           <p>Thank you for your interest.</p>`
  };

  try {
    let info = await transporter.sendMail(mailOptions);
    console.log('Rejection email sent:', info.messageId);
  } catch (error) {
    console.error('Error sending rejection email:', error);
    throw error;
  }
};

export default {
  sendApprovalEmail,
  sendRejectionEmail
};