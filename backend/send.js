
const express = require('express');
const nodemailer = require('nodemailer');
const app = express();
const port = 3000;

// Create a transporter using SMTP
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true, // Use SSL
  auth: {
    user: 'peelgently@gmail.com',
    pass: 'nuox oxef jruc hqii'
  }
});

// Function to send email
async function sendEmail() {
  try {
    // Send mail with defined transport object
    let info = await transporter.sendMail({
      from: '"Peel" <peelgently@gmail.com>', // Replace with your name and Gmail address
      to: "thotsemj@gmail.com",
      subject: "Test Email from Node.js App",
      text: "Hello! This is a test email sent from my Node.js application using Nodemailer.",
      html: "<b>Hello!</b> This is a test email sent from my Node.js application using Nodemailer."
    });

    console.log('Message sent: %s', info.messageId);
    console.log('Email sent successfully');
  } catch (error) {
    console.error('Error sending email:', error);
  }
}

// Send email when the server starts
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
  sendEmail();
});