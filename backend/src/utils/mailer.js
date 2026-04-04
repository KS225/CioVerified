import nodemailer from "nodemailer";
import dns from "dns/promises";

/* =========================
   ENV CHECK
========================= */
const requiredEnv = ["EMAIL_USER", "EMAIL_PASS"];

for (const key of requiredEnv) {
  if (!process.env[key]) {
    console.warn(`⚠️ Missing environment variable: ${key}`);
  }
}

/* =========================
   RESOLVE GMAIL TO IPV4
========================= */
const GMAIL_HOST = "smtp.gmail.com";

async function createTransporter() {
  let resolvedHost = GMAIL_HOST;

  try {
    const ipv4List = await dns.resolve4(GMAIL_HOST);
    if (ipv4List?.length) {
      resolvedHost = ipv4List[0];
      console.log("📡 Using Gmail IPv4:", resolvedHost);
    }
  } catch (err) {
    console.warn("⚠️ IPv4 resolve failed, falling back to hostname:", err.message);
  }

  return nodemailer.createTransport({
    host: resolvedHost,
    port: 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS, // Gmail app password
    },
    tls: {
      servername: GMAIL_HOST,
      rejectUnauthorized: false,
    },
    connectionTimeout: 20000,
    greetingTimeout: 20000,
    socketTimeout: 30000,
  });
}

/* =========================
   HTML WRAPPER
========================= */
const getBaseTemplate = ({ title, bodyHtml }) => {
  return `
    <div style="margin:0;padding:0;background:#f6f8fb;font-family:Arial,sans-serif;">
      <div style="max-width:600px;margin:30px auto;background:#ffffff;border:1px solid #e5e7eb;border-radius:10px;overflow:hidden;">
        <div style="background:linear-gradient(90deg,#ff7a00,#ff9f43);padding:18px 24px;">
          <h2 style="margin:0;color:#ffffff;font-size:22px;">CIO Verified</h2>
        </div>

        <div style="padding:30px 24px;color:#1f2937;line-height:1.6;">
          <h3 style="margin-top:0;color:#111827;">${title}</h3>
          ${bodyHtml}
        </div>

        <div style="padding:16px 24px;background:#f9fafb;color:#6b7280;font-size:12px;border-top:1px solid #e5e7eb;">
          This is an automated email from CIO Verified. Please do not reply directly to this message.
        </div>
      </div>
    </div>
  `;
};

/* =========================
   SEND RAW EMAIL
========================= */
export const sendEmail = async ({ to, subject, html, text }) => {
  try {
    const transporter = await createTransporter();

    const info = await transporter.sendMail({
      from: `"CIO Verified" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
      text,
    });

    console.log("✅ Email sent successfully");
    console.log("📨 Message ID:", info.messageId);

    return info;
  } catch (err) {
    console.error("❌ Email send failed:", err.message);
    throw new Error(`Email send failed: ${err.message}`);
  }
};

/* =========================
   SEND OTP
========================= */
export const sendOTP = async (email, otp, type = "verify") => {
  try {
    const isReset = type === "reset";

    const subject = isReset
      ? "Password Reset OTP - CIO Verified"
      : "Email Verification OTP - CIO Verified";

    const title = isReset ? "Reset Your Password" : "Verify Your Email";

    const html = getBaseTemplate({
      title,
      bodyHtml: `
        <p>Hello,</p>
        <p>Your OTP is:</p>

        <div style="margin:20px 0;text-align:center;">
          <div style="
            display:inline-block;
            padding:14px 24px;
            font-size:28px;
            font-weight:bold;
            letter-spacing:6px;
            color:#ff7a00;
            border:2px dashed #ffb066;
            border-radius:8px;
            background:#fff7ed;
          ">
            ${otp}
          </div>
        </div>

        <p>This OTP will expire in <strong>5 minutes</strong>.</p>
        <p>If you did not request this, you can safely ignore this email.</p>
      `,
    });

    const text = `${title}\n\nYour OTP is: ${otp}\nThis OTP will expire in 5 minutes.`;

    await sendEmail({
      to: email,
      subject,
      html,
      text,
    });

    console.log("✅ OTP email sent to:", email);
  } catch (err) {
    console.error("❌ OTP email failed:", err.message);
    throw err;
  }
};

/* =========================
   INVITE EMAIL
========================= */
export const sendInviteEmail = async (email, role, link) => {
  try {
    const subject = `Invitation to join as ${role} - CIO Verified`;

    const html = getBaseTemplate({
      title: "You're Invited",
      bodyHtml: `
        <p>Hello,</p>
        <p>You have been invited to join <strong>CIO Verified</strong> as:</p>
        <p style="font-size:18px;font-weight:bold;color:#111827;">${role}</p>

        <div style="margin:24px 0;">
          <a
            href="${link}"
            style="
              display:inline-block;
              padding:12px 20px;
              background:#ff7a00;
              color:#ffffff;
              text-decoration:none;
              border-radius:6px;
              font-weight:bold;
            "
          >
            Complete Profile
          </a>
        </div>

        <p>If the button does not work, copy and paste this link into your browser:</p>
        <p style="word-break:break-all;color:#2563eb;">${link}</p>
      `,
    });

    const text = `You have been invited as ${role}.\nComplete profile here: ${link}`;

    await sendEmail({
      to: email,
      subject,
      html,
      text,
    });

    console.log("✅ Invite email sent to:", email);
  } catch (err) {
    console.error("❌ Invite email failed:", err.message);
    throw err;
  }
};

/* =========================
   VERIFY MAILER
========================= */
export const verifyMailer = async () => {
  try {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      throw new Error("Missing EMAIL_USER or EMAIL_PASS in environment variables");
    }

    const transporter = await createTransporter();
    await transporter.verify();

    console.log("✅ Gmail mailer ready");
    console.log("📧 EMAIL_USER:", process.env.EMAIL_USER);
  } catch (err) {
    console.error("❌ Mail transporter verification failed:", err.message);
    throw err;
  }
};