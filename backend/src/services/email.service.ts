import nodemailer, { Transporter } from "nodemailer";

interface SendPasswordResetParams {
  to: string;
  resetToken: string;
  userDisplayName?: string;
}

export class EmailService {
  private static transporter: Transporter | null = null;

  private static getTransporter(): Transporter {
    if (this.transporter) {
      return this.transporter;
    }

    const smtpUser = process.env.SMTP_USER || "vivekrnair2003@gmail.com";
    const smtpPass = process.env.SMTP_PASS || process.env.EMAIL_PASS;

    if (smtpPass) {
      // Production or configured Gmail / Custom SMTP
      this.transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: smtpUser,
          pass: smtpPass,
        },
      });
    } else {
      // Development mode when SMTP_PASS is not yet provided:
      // Stream transport logs the email cleanly with the exact reset link in the terminal
      this.transporter = nodemailer.createTransport({
        streamTransport: true,
        newline: "windows",
      });
    }

    return this.transporter;
  }

  /**
   * Sends an HTML password reset email using Nodemailer.
   */
  static async sendPasswordResetEmail({
    to,
    resetToken,
    userDisplayName = "Brightloop User",
  }: SendPasswordResetParams): Promise<boolean> {
    try {
      const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
      const resetLink = `${frontendUrl}/reset-password/${resetToken}`;
      const fromEmail =
        process.env.SMTP_FROM ||
        `"Brightloop Support" <${process.env.SMTP_USER || "vivekrnair2003@gmail.com"}>`;

      const transporter = this.getTransporter();

      const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 20px; color: #1e293b; }
    .container { max-width: 560px; margin: 0 auto; background: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05); }
    .header { background: linear-gradient(135deg, #4f46e5 0%, #3b82f6 100%); padding: 32px 24px; text-align: center; color: #ffffff; }
    .header h1 { margin: 0; font-size: 24px; font-weight: 700; letter-spacing: -0.5px; }
    .content { padding: 32px 24px; line-height: 1.6; }
    .btn-container { text-align: center; margin: 32px 0; }
    .btn { display: inline-block; background-color: #4f46e5; color: #ffffff !important; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 15px; box-shadow: 0 4px 12px rgba(79, 70, 229, 0.25); }
    .footer { padding: 20px 24px; background-color: #f1f5f9; text-align: center; font-size: 12px; color: #64748b; }
    .link-box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 12px; word-break: break-all; font-size: 12px; color: #475569; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Brightloop</h1>
      <p style="margin: 6px 0 0; opacity: 0.9; font-size: 14px;">Subscription Management System</p>
    </div>
    <div class="content">
      <h2 style="font-size: 18px; margin-top: 0;">Password Reset Request</h2>
      <p>Hello <strong>${userDisplayName}</strong>,</p>
      <p>We received a request to reset the password for your Brightloop account associated with <strong>${to}</strong>.</p>
      <div class="btn-container">
        <a href="${resetLink}" target="_blank" class="btn">Reset My Password</a>
      </div>
      <p style="font-size: 14px; color: #64748b;">
        This password reset link will expire in <strong>1 hour</strong>. If you did not request this change, you can safely ignore this email.
      </p>
      <p style="font-size: 13px; color: #94a3b8; margin-top: 24px;">
        If the button above doesn't work, copy and paste this URL into your browser:
      </p>
      <div class="link-box">
        <a href="${resetLink}" style="color: #4f46e5;">${resetLink}</a>
      </div>
    </div>
    <div class="footer">
      &copy; 2026 Brightloop Inc. Kochi Hackathon 2026. All rights reserved.
    </div>
  </div>
</body>
</html>
      `;

      await transporter.sendMail({
        from: fromEmail,
        to,
        subject: "Reset your Brightloop password",
        text: `Hello ${userDisplayName},\n\nYou requested a password reset. Use this link to reset your password (valid for 1 hour):\n${resetLink}\n\nIf you did not request this, please ignore this email.`,
        html: htmlContent,
      });

      console.log(`📧 [Nodemailer] Password reset email dispatched to ${to}`);
      console.log(`🔗 [Reset Link]: ${resetLink}`);

      return true;
    } catch (error) {
      console.error("❌ [Nodemailer] Failed to send password reset email:", error);
      return false;
    }
  }
}
