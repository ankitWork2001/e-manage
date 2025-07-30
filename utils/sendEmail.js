import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const transporter = nodemailer.createTransport({
  service: "gmail", // or use another SMTP like Mailgun/SendGrid
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

/**
 * Sends an email
 * @param {Object} options - Email details
 * @param {string} options.to - Recipient's email
 * @param {string} options.subject - Email subject
 * @param {string} options.text - Plain text version
 * @param {string} options.html - HTML version
 */
export const sendEmail = async ({ to, subject, text, html }) => {
  try {
    const info = await transporter.sendMail({
      from: `"Your App Name" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      text,
      html,
    });

    return info;
  } catch (error) {
    console.error("Error sending email:", error.message);
    throw new Error("Failed to send email.");
  }
};
