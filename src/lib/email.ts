// ============================================
// src/lib/email.ts
// Email Service - Email sending utilities
// ============================================

import nodemailer from 'nodemailer';

// Updated configuration untuk Nodemailer 7.0.12
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 587,
  secure: process.env.SMTP_SECURE === 'true', // true untuk port 465, false untuk port lain
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  // Additional security options untuk Nodemailer 7.0.12
  tls: {
    // Tidak memaksa verifikasi sertifikat di development
    rejectUnauthorized: process.env.NODE_ENV === 'production',
  },
});

export async function sendVerificationEmail(email: string, name: string, token: string) {
  const verificationUrl = `${process.env.NEXT_PUBLIC_APP_URL}/verify?token=${token}`;

  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: email,
    subject: 'Verifikasi Email - SIJA Learn',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Halo ${name}!</h2>
        <p>Terima kasih telah mendaftar di SIJA Learn.</p>
        <p>Silakan klik tombol di bawah untuk verifikasi email Anda:</p>
        <a href="${verificationUrl}" 
           style="display: inline-block; padding: 12px 24px; background-color: #3b82f6; color: white; text-decoration: none; border-radius: 4px; margin: 16px 0;">
          Verifikasi Email
        </a>
        <p>Atau copy link berikut ke browser Anda:</p>
        <p style="color: #666; word-break: break-all;">${verificationUrl}</p>
        <p>Link ini akan kadaluarsa dalam 24 jam.</p>
        <hr style="margin: 24px 0; border: none; border-top: 1px solid #ddd;">
        <p style="color: #999; font-size: 12px;">
          Jika Anda tidak mendaftar akun ini, abaikan email ini.
        </p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    console.error('Error sending email:', error);
    return { success: false, error };
  }
}

export async function sendWelcomeEmail(email: string, name: string) {
  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: email,
    subject: 'Selamat Datang di SIJA Learn!',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Selamat Datang, ${name}!</h2>
        <p>Email Anda telah berhasil diverifikasi.</p>
        <p>Sekarang Anda dapat mengakses semua fitur SIJA Learn:</p>
        <ul>
          <li>Membaca artikel dan tutorial</li>
          <li>Mengikuti course yang tersedia</li>
          <li>Memberikan komentar pada artikel</li>
        </ul>
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/articles" 
           style="display: inline-block; padding: 12px 24px; background-color: #3b82f6; color: white; text-decoration: none; border-radius: 4px; margin: 16px 0;">
          Jelajahi Artikel
        </a>
        <p>Selamat belajar!</p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    console.error('Error sending welcome email:', error);
    return { success: false, error };
  }
}

export async function sendPasswordResetOTP(email: string, name: string, otp: string) {
  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: email,
    subject: 'Kode OTP Ganti Password - SIJA Learn',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Halo ${name}!</h2>
        <p>Anda telah meminta untuk mengganti password akun SIJA Learn Anda.</p>
        <p>Berikut adalah kode OTP Anda:</p>
        <div style="background-color: #f3f4f6; padding: 20px; text-align: center; border-radius: 8px; margin: 20px 0;">
          <h1 style="color: #3b82f6; font-size: 36px; letter-spacing: 8px; margin: 0;">${otp}</h1>
        </div>
        <p><strong>Kode ini akan kadaluarsa dalam 10 menit.</strong></p>
        <p>Jangan bagikan kode ini kepada siapapun, termasuk staff SIJA Learn.</p>
        <hr style="margin: 24px 0; border: none; border-top: 1px solid #ddd;">
        <p style="color: #999; font-size: 12px;">
          Jika Anda tidak meminta perubahan password, abaikan email ini dan pastikan akun Anda aman.
        </p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    console.error('Error sending OTP email:', error);
    return { success: false, error };
  }
}