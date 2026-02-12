// src/lib/email.ts

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

// Neobrutalist Email Template


function createNeobrutalistEmailTemplate(
  title: string,
  content: string,
  ctaText: string,
  ctaUrl: string,
  unsubscribeToken?: string
): string {
  const unsubscribeUrl = unsubscribeToken
    ? `${process.env.NEXT_PUBLIC_APP_URL}/unsubscribe?token=${unsubscribeToken}`
    : '';

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${title}</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: 'Arial Black', Arial, sans-serif; background-color: #F8FAFC;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #F8FAFC; padding: 40px 20px;">
        <tr>
          <td align="center">
            <table width="600" cellpadding="0" cellspacing="0" style="max-width: 600px; background-color: #FFFFFF; border: 4px solid #000000; box-shadow: 8px 8px 0px 0px rgba(0,0,0,1);">
              
              <!-- Header -->
              <tr>
                <td style="background-color: #FACC15; border-bottom: 4px solid #000000; padding: 30px; text-align: center;">
                  <img src="https://i.imgur.com/WljEUIZ.png" alt="SijaLearn" style="height: 60px; margin-bottom: 10px; display: block; margin-left: auto; margin-right: auto;" />
                  <h1 style="margin: 0; font-size: 32px; font-weight: 900; color: #000000; text-transform: uppercase; letter-spacing: -1px;">
                    SIJALEARN.MY.ID
                  </h1>
                </td>
              </tr>

              <!-- Content -->
              <tr>
                <td style="padding: 40px 30px;">
                  <h2 style="margin: 0 0 20px 0; font-size: 24px; font-weight: 900; color: #000000; text-transform: uppercase; line-height: 1.2;">
                    ${title}
                  </h2>
                  <div style="font-size: 16px; font-weight: 700; color: #000000; line-height: 1.6; margin-bottom: 30px;">
                    ${content}
                  </div>
                  
                  <!-- CTA Button -->
                  <table cellpadding="0" cellspacing="0" style="margin: 30px 0;">
                    <tr>
                      <td>
                        <a href="${ctaUrl}" style="display: inline-block; padding: 16px 32px; background-color: #FACC15; color: #000000; text-decoration: none; font-weight: 900; font-size: 14px; text-transform: uppercase; letter-spacing: 1px; border: 3px solid #000000; box-shadow: 4px 4px 0px 0px rgba(0,0,0,1);">
                          ${ctaText}
                        </a>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>

              <!-- Footer -->
              <tr>
                <td style="background-color: #000000; padding: 30px; border-top: 4px solid #000000;">
                  <p style="margin: 0 0 10px 0; font-size: 12px; font-weight: 700; color: #FFFFFF; text-align: center;">
                    © ${new Date().getFullYear()} SIJALEARN.my.id - Platform Belajar SMKN 1 Cimahi
                  </p>
                  ${unsubscribeToken ? `
                  <p style="margin: 10px 0 0 0; font-size: 11px; font-weight: 700; color: #FACC15; text-align: center;">
                    <a href="${unsubscribeUrl}" style="color: #FACC15; text-decoration: underline;">
                      Berhenti berlangganan
                    </a>
                  </p>
                  ` : ''}
                </td>
              </tr>

            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;
}

// Verification & Authentication Emails

export async function sendVerificationEmail(email: string, name: string, token: string) {
  const verificationUrl = `${process.env.NEXT_PUBLIC_APP_URL}/verify?token=${token}`;

  const content = `
    <p style="margin: 0 0 15px 0;">Halo <strong>${name}</strong>!</p>
    <p style="margin: 0 0 15px 0;">Terima kasih telah mendaftar di SijaLearn!</p>
    <p style="margin: 0 0 15px 0;">Untuk menyelesaikan registrasi, klik tombol di bawah untuk verifikasi email kamu:</p>
    <div style="background-color: #FEF3C7; border: 2px solid #000000; padding: 15px; margin: 20px 0;">
      <p style="margin: 0; font-size: 14px; font-weight: 600; color: #78350F;">
        Link verifikasi berlaku selama <strong>24 jam</strong>
      </p>
    </div>
    <p style="margin: 0; font-size: 13px; font-weight: 600; color: #64748B;">
      Jika kamu tidak mendaftar akun ini, abaikan email ini.
    </p>
  `;

  const html = createNeobrutalistEmailTemplate(
    'Verifikasi Email Kamu',
    content,
    'Verifikasi Email',
    verificationUrl
  );

  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: email,
    subject: 'Verifikasi Email - SijaLearn',
    html,
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
  const content = `
    <p style="margin: 0 0 15px 0;">Selamat datang, <strong>${name}</strong>!</p>
    <p style="margin: 0 0 15px 0;">Email kamu telah berhasil diverifikasi!</p>
    <p style="margin: 0 0 10px 0;">Sekarang kamu dapat mengakses semua fitur SijaLearn:</p>
    <ul style="margin: 0 0 15px 0; padding-left: 20px;">
      <li style="margin-bottom: 8px;"><strong>Membaca artikel</strong> dan tutorial</li>
      <li style="margin-bottom: 8px;"><strong>Mengikuti kursus</strong> yang tersedia</li>
      <li style="margin-bottom: 8px;"><strong>Memberikan komentar</strong> pada artikel</li>
      <li style="margin-bottom: 8px;"><strong>Mendapatkan XP</strong> dan naik level</li>
    </ul>
    <div style="background-color: #DBEAFE; border: 2px solid #000000; padding: 15px; margin: 20px 0;">
      <p style="margin: 0; font-size: 14px; font-weight: 600; color: #1E40AF;">
        <strong>Tips:</strong> Mulai dari kursus dasar untuk pemula!
      </p>
    </div>
    <p style="margin: 0;">Selamat belajar dan semangat!</p>
  `;

  const html = createNeobrutalistEmailTemplate(
    'Email Terverifikasi!',
    content,
    'Jelajahi Artikel',
    `${process.env.NEXT_PUBLIC_APP_URL}/articles`
  );

  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: email,
    subject: 'Selamat Datang di SijaLearn!',
    html,
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
  const content = `
    <p style="margin: 0 0 15px 0;">Halo <strong>${name}</strong>!</p>
    <p style="margin: 0 0 15px 0;">Kamu telah meminta untuk mengganti password akun SijaLearn.</p>
    <p style="margin: 0 0 15px 0;">Berikut adalah kode OTP kamu:</p>
    <div style="background-color: #DBEAFE; border: 3px solid #000000; padding: 30px; text-align: center; margin: 20px 0; box-shadow: 4px 4px 0px 0px rgba(0,0,0,1);">
      <h1 style="color: #1E40AF; font-size: 48px; font-weight: 900; letter-spacing: 12px; margin: 0; text-shadow: 2px 2px 0px rgba(0,0,0,0.1);">
        ${otp}
      </h1>
    </div>
    <div style="background-color: #FEF3C7; border: 2px solid #000000; padding: 15px; margin: 20px 0;">
      <p style="margin: 0; font-size: 14px; font-weight: 600; color: #78350F;">
        Kode OTP berlaku selama <strong>10 menit</strong>
      </p>
    </div>
    <p style="margin: 0 0 15px 0; font-size: 14px; font-weight: 700; color: #DC2626;">
      <strong>PENTING:</strong> Jangan bagikan kode ini kepada siapapun!
    </p>
    <p style="margin: 0; font-size: 13px; font-weight: 600; color: #64748B;">
      Jika kamu tidak meminta perubahan password, abaikan email ini dan pastikan akun kamu aman.
    </p>
  `;

  const html = createNeobrutalistEmailTemplate(
    'Kode OTP Reset Password',
    content,
    'Ke Halaman Reset',
    `${process.env.NEXT_PUBLIC_APP_URL}/forgot-password`
  );

  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: email,
    subject: 'Kode OTP Ganti Password - SijaLearn',
    html,
  };

  try {
    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    console.error('Error sending OTP email:', error);
    return { success: false, error };
  }
}

// Email Subscription Templates

export async function sendWelcomeSubscriptionEmail(email: string, unsubscribeToken: string) {
  const content = `
    <p style="margin: 0 0 15px 0;">Terima kasih telah berlangganan newsletter SijaLearn!</p>
    <p style="margin: 0 0 15px 0;">Kamu akan mendapatkan notifikasi email setiap kali ada:</p>
    <ul style="margin: 0 0 15px 0; padding-left: 20px;">
      <li style="margin-bottom: 8px;"><strong>Kursus baru</strong> yang dipublikasikan</li>
      <li style="margin-bottom: 8px;"><strong>Artikel baru</strong> yang dirilis</li>
    </ul>
    <div style="background-color: #DBEAFE; border: 2px solid #000000; padding: 15px; margin: 20px 0;">
      <p style="margin: 0; font-size: 14px; font-weight: 600; color: #1E40AF;">
        Jangan lupa cek inbox kamu secara berkala!
      </p>
    </div>
    <p style="margin: 0;">Tetap semangat belajar!</p>
  `;

  const html = createNeobrutalistEmailTemplate(
    'Selamat Datang!',
    content,
    'Jelajahi Sekarang',
    `${process.env.NEXT_PUBLIC_APP_URL}/courses`,
    unsubscribeToken
  );

  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: email,
    subject: 'Selamat Datang di SijaLearn Newsletter!',
    html,
  };

  try {
    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    console.error('Error sending welcome subscription email:', error);
    return { success: false, error };
  }
}

export async function sendNewCourseEmail(
  email: string,
  courseTitle: string,
  courseDescription: string,
  courseSlug: string,
  unsubscribeToken: string
) {
  const courseUrl = `${process.env.NEXT_PUBLIC_APP_URL}/courses/${courseSlug}`;

  const content = `
    <p style="margin: 0 0 15px 0;">Ada kursus baru yang baru saja dipublikasikan!</p>
    <div style="background-color: #F8FAFC; border: 3px solid #000000; padding: 20px; margin: 20px 0; box-shadow: 4px 4px 0px 0px rgba(0,0,0,0.3);">
      <h3 style="margin: 0 0 10px 0; font-size: 18px; font-weight: 900; color: #000000;">
        ${courseTitle}
      </h3>
      <p style="margin: 0; font-size: 14px; font-weight: 600; color: #334155; line-height: 1.5;">
        ${courseDescription}
      </p>
    </div>
    <div style="background-color: #DBEAFE; border: 2px solid #000000; padding: 15px; margin: 20px 0;">
      <p style="margin: 0; font-size: 14px; font-weight: 600; color: #1E40AF;">
        <strong>Bonus:</strong> Kumpulkan XP dengan menyelesaikan kursus ini!
      </p>
    </div>
    <p style="margin: 0;">Jangan lewatkan kesempatan untuk belajar hal baru!</p>
  `;

  const html = createNeobrutalistEmailTemplate(
    'Kursus Baru!',
    content,
    'Lihat Kursus',
    courseUrl,
    unsubscribeToken
  );

  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: email,
    subject: `Kursus Baru: ${courseTitle}`,
    html,
  };

  try {
    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    console.error('Error sending new course email:', error);
    return { success: false, error };
  }
}

export async function sendNewArticleEmail(
  email: string,
  articleTitle: string,
  articleDescription: string,
  articleSlug: string,
  unsubscribeToken: string
) {
  const articleUrl = `${process.env.NEXT_PUBLIC_APP_URL}/articles/${articleSlug}`;

  const content = `
    <p style="margin: 0 0 15px 0;">Artikel baru telah dirilis!</p>
    <div style="background-color: #F8FAFC; border: 3px solid #000000; padding: 20px; margin: 20px 0; box-shadow: 4px 4px 0px 0px rgba(0,0,0,0.3);">
      <h3 style="margin: 0 0 10px 0; font-size: 18px; font-weight: 900; color: #000000;">
        ${articleTitle}
      </h3>
      <p style="margin: 0; font-size: 14px; font-weight: 600; color: #334155; line-height: 1.5;">
        ${articleDescription}
      </p>
    </div>
    <div style="background-color: #DBEAFE; border: 2px solid #000000; padding: 15px; margin: 20px 0;">
      <p style="margin: 0; font-size: 14px; font-weight: 600; color: #1E40AF;">
        <strong>Bonus:</strong> Dapatkan XP dengan membaca artikel ini!
      </p>
    </div>
    <p style="margin: 0;">Baca sekarang dan tingkatkan pengetahuanmu!</p>
  `;

  const html = createNeobrutalistEmailTemplate(
    'Artikel Baru!',
    content,
    'Baca Artikel',
    articleUrl,
    unsubscribeToken
  );

  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: email,
    subject: `Artikel Baru: ${articleTitle}`,
    html,
  };

  try {
    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    console.error('Error sending new article email:', error);
    return { success: false, error };
  }
}