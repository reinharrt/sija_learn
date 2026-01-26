# SIJA Learn - Platform Pembelajaran

Platform repositori materi digital dan pusat informasi untuk siswa jurusan Sistem Informatika, Jaringan dan Aplikasi.

## 🚀 Update ke Next.js 15.5.9 & Nodemailer 7.0.12

### Langkah Update

1. **Backup project Anda terlebih dahulu**

2. **Update package.json**
   - Ganti file `package.json` dengan versi yang sudah diupdate

3. **Hapus dependencies lama**
   ```bash
   rm -rf node_modules package-lock.json
   ```

4. **Install dependencies baru**
   ```bash
   npm install
   ```

5. **Atau gunakan automated upgrade CLI**
   ```bash
   npx @next/codemod@canary upgrade latest
   ```

### Perubahan Penting

#### Next.js 15.5.9
- ✅ **Turbopack Builds (beta)**: Production builds lebih cepat
- ✅ **Node.js Middleware (stable)**: Full Node.js API support di middleware
- ✅ **TypeScript Improvements**: Typed routes, route validation
- ⚠️ **Deprecation Warnings**: Persiapan untuk Next.js 16

#### Nodemailer 7.0.12
- ✅ Security improvements
- ✅ DoS vulnerability fixes
- ✅ Better domain handling

### File yang Diupdate

1. **package.json**
   - Next.js: `15.1.11` → `15.5.9`
   - Nodemailer: `6.9.16` → `7.0.12`
   - ESLint config: `15.1.11` → `15.5.9`

2. **next.config.js**
   - Added `images.qualities` untuk Next.js 16 compatibility
   - Added `images.localPatterns` untuk local images dengan query strings
   - Ready untuk `typedRoutes` (uncomment jika dibutuhkan)

3. **middleware.ts**
   - Updated dengan Node.js runtime (now stable!)
   - Better performance dan full Node.js APIs access

4. **lib/email.ts**
   - Updated untuk Nodemailer 7.0.12
   - Improved security dengan TLS options
   - Better error handling

5. **.env.example**
   - Added `SMTP_SECURE` option

## 📦 Tech Stack

- **Framework**: Next.js 15.5.9 (App Router)
- **Language**: TypeScript
- **Database**: MongoDB
- **Authentication**: JWT + bcryptjs
- **Email**: Nodemailer 7.0.12
- **Styling**: Tailwind CSS
- **Icons**: Font Awesome

## 🛠️ Installation

1. **Clone repository**
   ```bash
   git clone <repository-url>
   cd sija-learn
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Setup environment variables**
   ```bash
   cp .env.example .env.local
   ```
   
   Edit `.env.local` dan isi dengan konfigurasi Anda:
   - MongoDB URI
   - JWT Secret
   - SMTP credentials (Gmail)
   - App URL

4. **Run development server**
   ```bash
   npm run dev
   ```
   
   Atau dengan Turbopack (lebih cepat):
   ```bash
   npm run dev --turbopack
   ```

5. **Build untuk production**
   ```bash
   npm run build
   ```
   
   Atau dengan Turbopack (beta):
   ```bash
   npm run build --turbopack
   ```

6. **Start production server**
   ```bash
   npm start
   ```

## 🔐 User Roles

- **USER**: Membaca artikel, memberikan komentar
- **WRITER**: Membuat dan mengedit artikel sendiri
- **COURSE_ADMIN**: Membuat dan mengelola course
- **ADMIN**: Full access ke semua fitur

## 📁 Project Structure

```
sija-learn/
├── src/
│   ├── app/                 # Next.js App Router
│   │   ├── api/            # API Routes
│   │   ├── (auth)/         # Auth pages
│   │   ├── articles/       # Article pages
│   │   ├── courses/        # Course pages
│   │   └── admin/          # Admin dashboard
│   ├── components/         # React components
│   ├── contexts/           # React contexts
│   ├── lib/               # Utility libraries
│   ├── models/            # Database models
│   └── types/             # TypeScript types
├── public/                # Static files
└── ...config files
```

## 🔒 Security Updates

### Fixed Vulnerabilities

#### Next.js 15.5.9
- ✅ Fixed Information exposure in dev server
- ✅ Fixed Cache Key Confusion for Image Optimization
- ✅ Fixed Content Injection Vulnerability
- ✅ Fixed Improper Middleware Redirect (SSRF)
- ✅ Fixed Authorization Bypass in Middleware

#### Nodemailer 7.0.12
- ✅ Fixed Email to unintended domain issue
- ✅ Fixed DoS via recursive calls in addressparser
- ✅ Fixed DoS through uncontrolled recursion

## 🚨 Breaking Changes Preparation (Next.js 16)

Aplikasi ini sudah dipersiapkan untuk Next.js 16 dengan:

1. ✅ Tidak menggunakan `legacyBehavior` pada `<Link>`
2. ✅ Tidak menggunakan AMP
3. ✅ Explicit `images.qualities` configuration
4. ✅ Explicit `images.localPatterns` configuration
5. ✅ Ready untuk TypeScript typed routes

## 📚 Features

- ✨ User authentication (Register, Login, Email Verification)
- 📝 Article management dengan block editor
- 🎓 Course management
- 💬 Comment system
- 👥 User role management
- 🔍 Search & filter articles
- 📊 Admin dashboard
- 📱 Responsive design

## 🧪 Development

```bash
# Run development server
npm run dev

# Run with Turbopack (faster)
npm run dev --turbopack

# Build for production
npm run build

# Build with Turbopack (beta, faster)
npm run build --turbopack

# Type checking
npm run lint
```

## 📝 Environment Variables

```env
# MongoDB
MONGODB_URI=mongodb://localhost:27017/sija-learn

# JWT
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=7d

# Email (Gmail)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
EMAIL_FROM=SIJA Learn <noreply@sijalearn.com>

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is for educational purposes - Kelompok 5.

## 👥 Team

SIJA Learn - Kelompok 5

---

**Updated for Next.js 15.5.9 & Nodemailer 7.0.12**