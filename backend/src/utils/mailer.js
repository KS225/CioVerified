import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

/* =========================
   DEBUG (VERY IMPORTANT)
========================= */
console.log(
  "🔑 RESEND KEY PREFIX:",
  process.env.RESEND_API_KEY?.slice(0, 8)
);

/* =========================
   SEND OTP
========================= */
export const sendOTP = async (email, otp, type = "verify") => {
  try {
    const subject =
      type === "reset" ? "Password Reset OTP" : "Email Verification OTP";

    const title =
      type === "reset" ? "Reset Your Password" : "Verify Your Email";

    const { data, error } = await resend.emails.send({
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

    console.log("📨 RESEND DATA:", data);
    console.log("⚠️ RESEND ERROR:", error);

    if (error) {
      throw new Error(error.message);
    }

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
    const { data, error } = await resend.emails.send({
      from: "CIO Verified <onboarding@resend.dev>",
      to: email,
      subject: `Invitation to join as ${role}`,
      html: `
        <div style="font-family: Arial; padding: 20px;">
          <h2 style="color:#ff7a00;">You're Invited 🎉</h2>
          <p>You have been invited as:</p>
          <h3>${role}</h3>
          <a href="${link}" 
             style="padding:10px 15px;background:#ff7a00;color:#fff;text-decoration:none;">
            Complete Profile
          </a>
        </div>
      `,
    });

    console.log("📨 RESEND DATA:", data);
    console.log("⚠️ RESEND ERROR:", error);

    if (error) {
      throw new Error(error.message);
    }

    console.log("✅ Invite email sent to:", email);
  } catch (err) {
    console.error("❌ Invite email failed:", err.message);
    throw err;
  }
};

/* =========================
   GENERIC EMAIL
========================= */
export const sendEmail = async ({ to, subject, html }) => {
  try {
    const { data, error } = await resend.emails.send({
      from: "CIO Verified <onboarding@resend.dev>",
      to,
      subject,
      html,
    });

    console.log("📨 RESEND DATA:", data);
    console.log("⚠️ RESEND ERROR:", error);

    if (error) {
      throw new Error(error.message);
    }

    console.log("✅ Email sent to:", to);
  } catch (err) {
    console.error("❌ Email error:", err.message);
    throw err;
  }
};

/* =========================
   VERIFY MAILER
========================= */
export const verifyMailer = async () => {
  if (!process.env.RESEND_API_KEY) {
    console.error("❌ RESEND_API_KEY missing in env");
    throw new Error("Missing RESEND_API_KEY");
  }

  console.log("✅ Resend mailer ready");
};