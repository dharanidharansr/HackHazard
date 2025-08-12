const nodemailer = require("nodemailer");
require('dotenv').config();

if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
  console.error("Missing required email configuration!");
  console.log("GMAIL_USER:", !!process.env.GMAIL_USER);
  console.log("GMAIL_APP_PASSWORD:", !!process.env.GMAIL_APP_PASSWORD);
}

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587, // Use port 587 with STARTTLS instead of 465
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
  tls: {
    rejectUnauthorized: false,
  },
  // Add connection timeout
  connectionTimeout: 10000, // 10 seconds
  greetingTimeout: 5000, // 5 seconds
  socketTimeout: 10000, // 10 seconds
});

// Test the connection with better error logging (don't block server startup)
transporter.verify(function (error, success) {
  if (error) {
    console.warn("⚠️  Email service connection failed:", {
      name: error.name,
      message: error.message,
      code: error.code,
      command: error.command,
    });
    console.warn("📧 Email notifications will be disabled. Check your network/firewall settings.");
    console.warn("💡 Solutions:");
    console.warn("   1. Check if your network allows outbound SMTP connections");
    console.warn("   2. Try connecting from a different network");
    console.warn("   3. Verify your Gmail App Password is correct");
    console.warn("   4. Check if 2FA is enabled on your Gmail account");
  } else {
    console.log("✅ Email server is ready");
  }
});

const sendReminderEmail = async (to, habitName, time) => {
  try {
    await transporter.sendMail({
      from: process.env.GMAIL_USER,
      to,
      subject: `Reminder: Time for your habit - ${habitName}`,
      html: `
        <div style="font-family: Arial, sans-serif; color: #333;">
          <h2>⏰ Time for your habit!</h2>
          <p>Hey there! This is a friendly reminder that it's time for:</p>
          <h3 style="color: #A2BFFE;">${habitName}</h3>
          <p>Scheduled for: ${time}</p>
          <p>Keep up the great work! 💪</p>
        </div>
      `,
    });
    console.log(`📧 Reminder email sent successfully to ${to}`);
    return true;
  } catch (error) {
    console.warn(`⚠️  Email sending failed to ${to}:`, error.message);
    return false;
  }
};

const sendMissedHabitEmail = async (to, habitName) => {
  try {
    await transporter.sendMail({
      from: process.env.GMAIL_USER,
      to,
      subject: `Missed your habit? - ${habitName}`,
      html: `
        <div style="font-family: Arial, sans-serif; color: #333;">
          <h2>👋 Quick Check-in</h2>
          <p>We noticed you haven't marked your habit as complete:</p>
          <h3 style="color: #A2BFFE;">${habitName}</h3>
          <p>Did you complete it? Don't forget to mark it in the app!</p>
          <p>Remember: consistency is key to building lasting habits. 🌱</p>
        </div>
      `,
    });
    console.log(`📧 Missed habit email sent successfully to ${to}`);
    return true;
  } catch (error) {
    console.warn(`⚠️  Email sending failed to ${to}:`, error.message);
    return false;
  }
};

module.exports = {
  sendReminderEmail,
  sendMissedHabitEmail,
};
