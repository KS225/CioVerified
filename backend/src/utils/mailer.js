// import nodemailer from "nodemailer";

// const transporter = nodemailer.createTransport({
//   host: "smtp.gmail.com",
//   port: 587,
//   secure: false,
//   auth: {
//     user: process.env.EMAIL_USER,
//     pass: process.env.EMAIL_PASS,
//   },
//   tls: {
//     rejectUnauthorized: false,
//   },
// });

// export const verifyMailer = async () => {
//   try {
//     await transporter.verify();
//     console.log("✅ Mail transporter verified");
//   } catch (err) {
//     console.error("❌ Mail transporter verification failed:", err.message);
//     throw err;
//   }
// };

// export const sendOTP = async (email, otp, type = "verify") => {
//   try {
//     const subject =
//       type === "reset" ? "Password Reset OTP" : "Email Verification OTP";

//     const title =
//       type === "reset" ? "Reset Your Password" : "Verify Your Email";

//     await transporter.sendMail({
//       from: `"CIO Verified" <${process.env.EMAIL_USER}>`,
//       to: email,
//       subject,
//       html: `
//         <div style="font-family: Arial, sans-serif; padding: 20px; color: #1f2937;">
//           <h2 style="color:#ff7a00; margin-bottom: 12px;">${title}</h2>
//           <p>Your OTP is:</p>
//           <h1 style="letter-spacing:4px;">${otp}</h1>
//           <p>This OTP will expire in 5 minutes.</p>
//           <hr />
//           <small>If you didn’t request this, please ignore this email.</small>
//         </div>
//       `,
//     });

//     console.log("✅ OTP email sent to:", email);
//   } catch (err) {
//     console.error("❌ OTP email failed:", err.message);
//     throw err;
//   }
// };

// export const sendInviteEmail = async (email, role, link) => {
//   try {
//     await transporter.sendMail({
//       from: `"CIO Verified" <${process.env.EMAIL_USER}>`,
//       to: email,
//       subject: `Invitation to join as ${role}`,
//       html: `
//         <div style="font-family: Arial, sans-serif; padding: 20px; color: #1f2937;">
//           <h2 style="color:#ff7a00;">You're Invited 🎉</h2>
//           <p>You have been invited to join <b>CIO Verified</b> as:</p>
//           <h3>${role}</h3>
//           <p>Please click the button below to complete your profile:</p>
//           <a href="${link}" 
//              style="display:inline-block;padding:12px 20px;background:#ff7a00;color:#fff;text-decoration:none;border-radius:6px;">
//              Complete Your Profile
//           </a>
//           <p style="margin-top:20px;">Or copy this link:</p>
//           <p>${link}</p>
//           <hr />
//           <small>This link is valid for one-time use.</small>
//         </div>
//       `,
//     });

//     console.log("✅ Invite email sent to:", email);
//   } catch (err) {
//     console.error("❌ Invite email failed:", err.message);
//     throw err;
//   }
// };

// export const sendEmail = async ({ to, subject, html }) => {
//   try {
//     await transporter.sendMail({
//       from: `"CIO Verified" <${process.env.EMAIL_USER}>`,
//       to,
//       subject,
//       html,
//     });

//     console.log("✅ Email sent to:", to);
//   } catch (err) {
//     console.error("❌ Email error:", err.message);
//     throw err;
//   }
// };

import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

/* =========================
   SEND OTP
========================= */
export const sendOTP = async (email, otp, type = "verify") => {
  try {
    const subject =
      type === "reset" ? "Password Reset OTP" : "Email Verification OTP";

    const title =
      type === "reset" ? "Reset Your Password" : "Verify Your Email";

    await resend.emails.send({
      from: "CIO Verified <onboarding@resend.dev>",
      to: email,
      subject,
      html: `
        <div style="font-family: Arial; padding: 20px;">
          <h2 style="color:#ff7a00;">${title}</h2>
          <p>Your OTP is:</p>
          <h1 style="letter-spacing:4px;">${otp}</h1>
          <p>This OTP will expire in 5 minutes.</p>
        </div>
      `,
    });

    console.log("✅ OTP email sent to:", email);
  } catch (err) {
    console.error("❌ OTP email failed:", err);
    throw err;
  }
};

/* =========================
   INVITE EMAIL
========================= */
export const sendInviteEmail = async (email, role, link) => {
  try {
    await resend.emails.send({
      from: "CIO Verified <onboarding@resend.dev>",
      to: email,
      subject: `Invitation to join as ${role}`,
      html: `
        <div style="font-family: Arial; padding: 20px;">
          <h2 style="color:#ff7a00;">You're Invited 🎉</h2>
          <p>You have been invited as:</p>
          <h3>${role}</h3>
          <a href="${link}" style="padding:10px 15px;background:#ff7a00;color:#fff;text-decoration:none;">
            Complete Profile
          </a>
        </div>
      `,
    });

    console.log("✅ Invite email sent to:", email);
  } catch (err) {
    console.error("❌ Invite email failed:", err);
    throw err;
  }
};

/* =========================
   GENERIC EMAIL
========================= */
export const sendEmail = async ({ to, subject, html }) => {
  try {
    await resend.emails.send({
      from: "CIO Verified <onboarding@resend.dev>",
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

/* =========================
   VERIFY MAILER (OPTIONAL)
========================= */
export const verifyMailer = async () => {
  console.log("✅ Resend mailer ready");
};