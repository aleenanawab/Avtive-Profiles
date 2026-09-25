import nodemailer from 'nodemailer';
import { supabase, supabaseAdmin } from './supabase';

export interface SendPasswordResetEmailParams {
  to: string;
  name?: string;
  resetUrl: string;
}

export interface EmailSendResult {
  success: boolean;
  messageId?: string;
  provider?: 'smtp' | 'resend' | 'supabase';
  error?: string;
}

/**
 * Configure Nodemailer Transporter using environment variables
 */
function getSmtpTransporter() {
  const host = process.env.SMTP_HOST;
  const port = parseInt(process.env.SMTP_PORT || '587', 10);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS || process.env.SMTP_PASSWORD;
  const secure = process.env.SMTP_SECURE === 'true' || port === 465;

  if (!host || !user || !pass) {
    return null;
  }

  return nodemailer.createTransport({
    host,
    port,
    secure,
    auth: {
      user,
      pass
    }
  });
}

/**
 * Clean, minimalistic HTML template containing only the password reset link
 */
function generatePasswordResetHtml(resetUrl: string, name?: string): string {
  const greeting = name ? `Hello ${name},` : 'Hello,';
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reset Your Password</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      background-color: #f8fafc;
      color: #0f172a;
      margin: 0;
      padding: 40px 20px;
    }
    .container {
      max-width: 500px;
      margin: 0 auto;
      background-color: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 16px;
      padding: 32px;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
    }
    .title {
      font-size: 20px;
      font-weight: 700;
      margin-top: 0;
      margin-bottom: 12px;
      color: #0f172a;
    }
    .text {
      font-size: 14px;
      line-height: 1.6;
      color: #475569;
      margin-bottom: 24px;
    }
    .btn {
      display: inline-block;
      background: linear-gradient(135deg, #06b6d4, #2563eb);
      color: #ffffff !important;
      text-decoration: none;
      font-size: 14px;
      font-weight: 600;
      padding: 12px 28px;
      border-radius: 10px;
      text-align: center;
      margin-bottom: 24px;
    }
    .link-fallback {
      font-size: 12px;
      color: #64748b;
      word-break: break-all;
      line-height: 1.5;
      padding-top: 16px;
      border-top: 1px solid #f1f5f9;
    }
    .link-fallback a {
      color: #0284c7;
      text-decoration: underline;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1 class="title">Reset Your Password</h1>
    <p class="text">${greeting}<br>Click the button below to set a new password for your account. This link will expire in 1 hour.</p>
    <div>
      <a href="${resetUrl}" class="btn" target="_blank">Reset Password</a>
    </div>
    <div class="link-fallback">
      If the button above does not work, copy and paste this link into your browser:<br>
      <a href="${resetUrl}">${resetUrl}</a>
    </div>
  </div>
</body>
</html>`;
}

/**
 * Send Password Reset Email directly to the user's registered email
 */
export async function sendPasswordResetEmail({
  to,
  name,
  resetUrl
}: SendPasswordResetEmailParams): Promise<EmailSendResult> {
  const normalizedEmail = to.trim().toLowerCase();

  // 1. Check if SMTP configuration is present
  const transporter = getSmtpTransporter();
  if (transporter) {
    try {
      const fromAddress = process.env.SMTP_FROM || process.env.SMTP_USER || 'no-reply@avtive.app';
      const info = await transporter.sendMail({
        from: fromAddress.includes('<') ? fromAddress : `"Avtive Security" <${fromAddress}>`,
        to: normalizedEmail,
        subject: 'Reset your password',
        text: `Hello,\n\nPlease click the following link to reset your password:\n${resetUrl}\n\nThis link is valid for 1 hour.`,
        html: generatePasswordResetHtml(resetUrl, name)
      });

      return {
        success: true,
        messageId: info.messageId,
        provider: 'smtp'
      };
    } catch (smtpErr: any) {
      console.error('Nodemailer SMTP sending error:', smtpErr);
      // Fall through to other providers if available
    }
  }

  // 2. Try Resend API if configured
  const resendApiKey = process.env.RESEND_API_KEY;
  if (resendApiKey) {
    try {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${resendApiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          from: process.env.RESEND_FROM || 'Avtive Security <onboarding@resend.dev>',
          to: [normalizedEmail],
          subject: 'Reset your password',
          html: generatePasswordResetHtml(resetUrl, name)
        })
      });

      const data = await res.json();
      if (res.ok && data?.id) {
        return {
          success: true,
          messageId: data.id,
          provider: 'resend'
        };
      }
      console.error('Resend API response error:', data);
    } catch (resendErr) {
      console.error('Resend API error:', resendErr);
    }
  }

  // 3. Try Supabase Auth password reset email trigger
  try {
    const { error: sbError } = await supabase.auth.resetPasswordForEmail(normalizedEmail, {
      redirectTo: resetUrl
    });

    if (!sbError) {
      return {
        success: true,
        provider: 'supabase'
      };
    }
    console.warn('Supabase auth resetPasswordForEmail notice:', sbError.message);
  } catch (sbErr) {
    console.error('Supabase Auth reset exception:', sbErr);
  }

  // If no email provider successfully delivered the message
  return {
    success: false,
    error: 'Email delivery service is not configured or failed to dispatch. Please configure SMTP settings (SMTP_HOST, SMTP_USER, SMTP_PASS) or Supabase Auth SMTP in .env.local.'
  };
}
