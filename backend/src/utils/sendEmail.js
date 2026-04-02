import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const getEmailTemplate = (title, message, applicationId) => {
  return `
  <div style="font-family: Arial, sans-serif; background:#f4f6f8; padding:20px;">
    <div style="max-width:600px; margin:auto; background:#ffffff; border-radius:10px; overflow:hidden;">
      
      <div style="background:#fa7300; padding:20px; text-align:center;">
        <img src="https://via.placeholder.com/150x50?text=CIO+Verified" style="height:50px;" />
      </div>

      <div style="padding:30px;">
        <h2 style="color:#0b3d91;">${title}</h2>
        <p>${message}</p>

        ${
          applicationId
            ? `<p><strong>Application ID:</strong> ${applicationId}</p>`
            : ""
        }

        <a href="http://localhost:5173/dashboard"
           style="display:inline-block;margin-top:20px;background:#0b3d91;color:#fff;padding:10px 15px;border-radius:5px;text-decoration:none;">
           Go to Dashboard
        </a>
      </div>

      <div style="background:#f1f1f1; padding:20px; text-align:center;">
        <p>📧 info@cioverified.com</p>
      </div>

    </div>
  </div>
  `;
};

const sendEmail = async (to, subject, message, applicationId = null) => {
  try {
    await transporter.sendMail({
      from: `"CIO Verified" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html: getEmailTemplate(subject, message, applicationId),
    });

    console.log("✅ Email sent");
  } catch (err) {
    console.error("❌ Email failed:", err);
  }
};

export default sendEmail;