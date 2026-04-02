import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  tls: {
    rejectUnauthorized: false,
  },
});

export const verifyMailer = async () => {
  try {
    await transporter.verify();
    console.log("✅ Mail transporter verified");
  } catch (err) {
    console.error("❌ Mail transporter verification failed:", err);
    throw err;
  }
};

export const sendOTP = async (email, otp, type = "verify") => {
  try {
    const subject =
      type === "reset" ? "Password Reset OTP" : "Email Verification OTP";

    const title =
      type === "reset" ? "Reset Your Password" : "Verify Your Email";

    await transporter.sendMail({
      from: `"CIO Verified" <${process.env.EMAIL_USER}>`,
      to: email,
      subject,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; color: #1f2937;">
          <h2 style="color:#ff7a00; margin-bottom: 12px;">${title}</h2>
          <p>Your OTP is:</p>
          <h1 style="letter-spacing:4px;">${otp}</h1>
          <p>This OTP will expire in 5 minutes.</p>
          <hr />
          <small>If you didn’t request this, please ignore this email.</small>
        </div>
      `,
    });

    console.log("✅ OTP email sent to:", email);
  } catch (err) {
    console.error("❌ OTP email failed:", err);
    throw err;
  }
};

export const sendInviteEmail = async (email, role, link) => {
  try {
    await transporter.sendMail({
      from: `"CIO Verified" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: `Invitation to join as ${role}`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; color: #1f2937;">
          <h2 style="color:#ff7a00;">You're Invited 🎉</h2>
          <p>You have been invited to join <b>CIO Verified</b> as:</p>
          <h3>${role}</h3>
          <p>Please click the button below to complete your profile:</p>
          <a href="${link}" 
             style="display:inline-block;padding:12px 20px;background:#ff7a00;color:#fff;text-decoration:none;border-radius:6px;">
             Complete Your Profile
          </a>
          <p style="margin-top:20px;">Or copy this link:</p>
          <p>${link}</p>
          <hr />
          <small>This link is valid for one-time use.</small>
        </div>
      `,
    });

    console.log("✅ Invite email sent to:", email);
  } catch (err) {
    console.error("❌ Invite email failed:", err);
    throw err;
  }
};

export const sendEmail = async ({ to, subject, html }) => {
  try {
    await transporter.sendMail({
      from: `"CIO Verified" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    });

    console.log("✅ Email sent to:", to);
  } catch (err) {
    console.error("❌ Email error:", err);
    throw err;
  }
};