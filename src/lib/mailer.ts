import nodemailer from "nodemailer";

function getTransport() {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || 587);
  if (!host) return null;
  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: process.env.SMTP_USER
      ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
      : undefined,
  });
}

export async function sendVerificationEmail(to: string, token: string) {
  const link = `${process.env.APP_URL || "http://localhost:3000"}/api/auth/verify?token=${token}`;
  const transport = getTransport();

  if (!transport) {
    console.log(`[dayflow] SMTP not configured. Verification link for ${to}: ${link}`);
    return { delivered: false as const };
  }

  await transport.sendMail({
    from: process.env.SMTP_FROM || "Dayflow HRMS <no-reply@dayflow.local>",
    to,
    subject: "Verify your Dayflow account",
    text: `Welcome to Dayflow! Verify your email by opening this link: ${link}`,
    html: `<p>Welcome to <b>Dayflow</b>!</p><p><a href="${link}">Click here to verify your email</a></p>`,
  });
  return { delivered: true as const };
}
