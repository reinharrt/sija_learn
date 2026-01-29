# 🚀 SIJA Learn - Installation Guide

Complete step-by-step installation guide untuk SIJA Learn platform.

## 📋 Prerequisites

Sebelum memulai, pastikan sudah install:

- **Node.js** 18.x atau lebih baru ([Download](https://nodejs.org/))
- **MongoDB** 6.0+ (Local atau MongoDB Atlas)
- **Git** ([Download](https://git-scm.com/))
- **Code Editor** (VS Code recommended)

Cek versi yang terinstall:
```bash
node --version  # Should be v18.x or higher
npm --version   # Should be v9.x or higher
```

## 📦 Step 1: Clone Project

```bash
# Clone repository
git clone <repository-url>
cd sija-learn

# Or extract from tar.gz
tar -xzf sija-learn.tar.gz
cd sija-learn
```
e
## 🔧 Step 2: Install Dependencies

```bash
npm install
```

**Expected output:**
```
added 400+ packages in 30s
```

**If errors occur:**
```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

## 🗄️ Step 3: Setup Database

### Option A: MongoDB Local Installation

**Windows:**
1. Download MongoDB Community Server
2. Install with default settings
3. MongoDB akan running di `mongodb://localhost:27017`

**macOS:**
```bash
# Install via Homebrew
brew tap mongodb/brew
brew install mongodb-community

# Start MongoDB
brew services start mongodb-community
```

**Linux (Ubuntu/Debian):**
```bash
# Import MongoDB public GPG key
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -

# Add MongoDB repository
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list

# Install MongoDB
sudo apt-get update
sudo apt-get install -y mongodb-org

# Start MongoDB
sudo systemctl start mongod
sudo systemctl enable mongod
```

**Verify MongoDB is running:**
```bash
mongosh
# Should connect successfully
```

### Option B: MongoDB Atlas (Cloud - Recommended)

1. **Create Account:**
   - Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
   - Sign up for free account
   - Verify email

2. **Create Cluster:**
   - Click "Build a Database"
   - Select **FREE tier (M0)**
   - Choose region (Singapore recommended)
   - Click "Create Cluster"

3. **Setup Database Access:**
   - Go to "Database Access"
   - Click "Add New Database User"
   - Create username & password (save this!)
   - Set privileges: "Read and write to any database"

4. **Setup Network Access:**
   - Go to "Network Access"
   - Click "Add IP Address"
   - Click "Allow Access from Anywhere" (for development)
   - Or add your specific IP

5. **Get Connection String:**
   - Go to "Database" → "Connect"
   - Choose "Connect your application"
   - Copy connection string
   - Will look like: `mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/`

## 🔐 Step 4: Configure Environment Variables

1. **Copy example file:**
```bash
cp .env.example .env.local
```

2. **Edit `.env.local`:**

```env
# === MongoDB Configuration ===
# Local MongoDB:
MONGODB_URI=mongodb://localhost:27017/sija-learn

# OR MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/sija-learn?retryWrites=true&w=majority

# === JWT Configuration ===
JWT_SECRET=your-super-secret-jwt-key-min-32-characters-long-change-this
JWT_EXPIRES_IN=7d

# === Email SMTP Configuration (Gmail) ===
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-specific-password
EMAIL_FROM=SIJA Learn <noreply@sijalearn.com>

# === Application Configuration ===
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development
```

### 📧 Step 4.1: Setup Gmail SMTP

**Required for email verification!**

1. **Enable 2-Step Verification:**
   - Go to [Google Account Security](https://myaccount.google.com/security)
   - Enable "2-Step Verification"

2. **Generate App Password:**
   - Still in Security page
   - Scroll to "App passwords"
   - Select app: "Mail"
   - Select device: "Other" → type "SIJA Learn"
   - Click "Generate"
   - **Copy the 16-character password**

3. **Update `.env.local`:**
```env
SMTP_USER=your-actual-email@gmail.com
SMTP_PASS=xxxx xxxx xxxx xxxx  # The 16-char password
```

**Test email configuration:**
Create file `test-email.js`:
```javascript
const nodemailer = require('nodemailer');
require('dotenv').config({ path: '.env.local' });

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

transporter.sendMail({
  from: process.env.EMAIL_FROM,
  to: process.env.SMTP_USER,
  subject: 'Test Email',
  text: 'Email configuration works!',
}, (err, info) => {
  if (err) console.error('Error:', err);
  else console.log('Success!', info);
});
```

Run: `node test-email.js`

## 🚀 Step 5: Run Development Server

```bash
npm run dev
```

**Expected output:**
```
▲ Next.js 15.1.11
- Local:        http://localhost:3000
- Network:      http://192.168.1.x:3000

✓ Ready in 2.3s (with Turbopack)
```

Open browser: http://localhost:3000

## ✅ Step 6: Initial Setup & Testing

### 6.1 Register First User

1. Go to http://localhost:3000/register
2. Fill in:
   - Name: Admin User
   - Email: admin@example.com
   - Password: Admin123! (min 8 chars, uppercase, lowercase, number)
3. Click "Daftar"
4. Check email for verification link
5. Click verification link
6. You should see "Email berhasil diverifikasi"

### 6.2 Login

1. Go to http://localhost:3000/login
2. Use registered credentials
3. You should be logged in!

### 6.3 Upgrade First User to Admin

**Connect to MongoDB:**

**Local MongoDB:**
```bash
mongosh
use sija-learn
db.users.updateOne(
  { email: "admin@example.com" },
  { $set: { role: "admin" } }
)
```

**MongoDB Atlas:**
```bash
mongosh "mongodb+srv://cluster0.xxxxx.mongodb.net/sija-learn" --username your-username
# Enter password when prompted
db.users.updateOne(
  { email: "admin@example.com" },
  { $set: { role: "admin" } }
)
```

Logout and login again to see Admin menu.

### 6.4 Test Features

- ✅ Create Article (if Writer/Admin)
- ✅ Create Course (if Course Admin/Admin)
- ✅ Add Comments
- ✅ Admin Dashboard

## 📱 Step 7: Production Build (Optional)

Test production build locally:

```bash
# Build for production
npm run build

# Start production server
npm start
```

**Expected build output:**
```
Route (app)                              Size     First Load JS
┌ ○ /                                    5.2 kB         95 kB
├ ○ /articles                            3.8 kB         93 kB
├ ○ /articles/[slug]                     4.1 kB         94 kB
└ ○ /courses                             3.9 kB         93 kB

○  (Static)  prerendered as static content
```

## 🐛 Troubleshooting

### Problem: MongoDB Connection Failed

**Error:** `MongoServerError: Authentication failed`

**Solution:**
```bash
# Check MongoDB is running
mongosh

# For Atlas: verify username/password
# Check Network Access allows your IP
```

### Problem: Email Not Sending

**Error:** `Invalid login: 535-5.7.8 Username and Password not accepted`

**Solution:**
1. Verify 2FA is enabled
2. Generate new App Password
3. Use App Password (16 chars), NOT regular password
4. Check SMTP_USER is correct email

### Problem: Port 3000 Already in Use

**Solution:**
```bash
# Kill process on port 3000
# macOS/Linux:
lsof -ti:3000 | xargs kill

# Windows:
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Or use different port:
npm run dev -- -p 3001
```

### Problem: npm install fails

**Solution:**
```bash
# Clear cache
npm cache clean --force

# Delete and reinstall
rm -rf node_modules package-lock.json
npm install

# If still fails, try:
npm install --legacy-peer-deps
```

### Problem: TypeScript Errors

**Solution:**
```bash
# Rebuild TypeScript
npm run build

# Or delete .next folder
rm -rf .next
npm run dev
```

## 📚 Next Steps

After successful installation:

1. ✅ Read `README.md` for features overview
2. ✅ Read `MIGRATION_NOTES.md` for Next.js 15 changes
3. ✅ Explore the code structure
4. ✅ Customize styling (Tailwind CSS)
5. ✅ Add more features!

## 🔒 Security Checklist (Production)

Before deploying to production:

- [ ] Change `JWT_SECRET` to strong random string
- [ ] Use MongoDB Atlas with IP whitelist
- [ ] Enable MongoDB authentication
- [ ] Use HTTPS (SSL/TLS)
- [ ] Set proper CORS policies
- [ ] Use environment variables, never commit `.env.local`
- [ ] Enable rate limiting
- [ ] Regular security updates

## 💡 Tips

- Use `npm run dev --turbopack` for faster development
- Check MongoDB Compass for database GUI
- Use Postman/Insomnia to test APIs
- Enable React DevTools for debugging
- Use VS Code extensions:
  - ESLint
  - Prettier
  - Tailwind CSS IntelliSense
  - MongoDB for VS Code

## 📞 Need Help?

If you encounter issues:
1. Check this guide again
2. Check `README.md` and `MIGRATION_NOTES.md`
3. Search error message on Google
4. Contact development team

---

**Installation Guide Version:** 1.0  
**Last Updated:** January 2026  
**Project:** SIJA Learn - Kelompok 5