import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

export const sendEmail = async ({ to, subject, text, html }) => {
  try {
    // 🔍 DEBUG (remove later)
    console.log("SMTP_MAIL:", process.env.SMTP_MAIL);
    console.log("SMTP_PASSWORD:", process.env.SMTP_PASSWORD ? "LOADED" : "MISSING");

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.SMTP_MAIL,
        pass: process.env.SMTP_PASSWORD,
      },
    });

    await transporter.sendMail({
      from: `"QuickDoc Admin" <${process.env.SMTP_MAIL}>`,
      to,
      subject,
      text,
      html,
    });

    console.log("✅ Email sent successfully");
  } catch (error) {
    console.error("❌ Email send failed:", error.message);
    throw error;
  }
};
