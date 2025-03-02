import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();
const transporter = nodemailer.createTransport({
  service: "gmail",
  host: "smtp.gmail.com",
  port: 465,
  secure: true, // true for port 465, false for other ports
  auth: {
    user: process.env.SMTP_AUTH_USERNAME,
    pass: process.env.SMTP_AUTH_PASS,
  },
});

export async function sendMail(data) {
  const info = await transporter.sendMail({
    from: data.email,
    to: process.env.SMTP_AUTH_USERNAME,
    subject: data.subject,
    text: data.fullName,
    html: `
  <html>
    <head>
      <style>
        body {
          font-family: Arial, sans-serif;
          color: #333;
          background-color: #f4f4f4;
          padding: 20px;
        }
        .email-container {
          background-color: #fff;
          padding: 20px;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
        .email-header {
          font-size: 24px;
          font-weight: bold;
        }
        .email-body {
          font-size: 16px;
          margin-top: 10px;
        }
        .sender-name {
          font-weight: bold;
        }
        .sender-message {
          margin-top: 10px;
        }
      </style>
    </head>
    <body>
      <div class="email-container">
        <div class="email-body">
        <p class="sender-name">${data.message}</p>
        <p class="sender-message">Regards : ${data.fullName}</p>
        </div>
      </div>
    </body>
  </html>
`,
  });

  if (info) return true;

  return false;
}
