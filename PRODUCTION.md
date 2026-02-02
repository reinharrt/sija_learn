# 🚀 SIJA Learn - Production Deployment Guide

Panduan deploy SIJA Learn ke production server dengan Docker Compose.

---

## 📋 Prerequisites

- Ubuntu Server 20.04+ atau Debian
- Docker & Docker Compose installed
- Domain sudah pointing ke server
- Port 80, 443, 3000, 27017 terbuka (konfigurasi firewall)

---

## 🔧 Setup Server (First Time)

### 1. Install Docker & Docker Compose

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Add user ke docker group (supaya ga perlu sudo)
sudo usermod -aG docker $USER

# Logout dan login lagi, lalu test
docker --version

# Install Docker Compose
sudo apt install docker-compose-plugin -y
docker compose version
```

### 2. Install Git (kalau belum)

```bash
sudo apt install git -y
```

---

## 📂 Setup Project di Server

### 1. Clone Project

```bash
# Bikin folder
sudo mkdir -p /var/www/sija-learn
sudo chown $USER:$USER /var/www/sija-learn

# Clone dari Git
cd /var/www/sija-learn
git clone https://github.com/username/sija-learn.git .

# Atau upload manual via SCP/FTP
```

### 2. Setup File-file Docker

Pastikan file-file ini ada di root project:

```
/var/www/sija-learn/
├── Dockerfile              # ← Upload file ini
├── .dockerignore           # ← Upload file ini
├── docker-compose.yml      # ← Upload file ini
├── .env.local              # ← Buat manual (copy dari .env.example)
├── src/
├── package.json
└── ...
```

### 3. Konfigurasi Environment Variables

```bash
cd /var/www/sija-learn

# Copy .env.example ke .env.local
cp .env.example .env.local

# Edit .env.local
nano .env.local
```

**Important Settings untuk Production:**

```env
# MongoDB (Docker internal network)
MONGODB_URI=mongodb://mongodb:27017/sija-learn

# JWT Secret (WAJIB GANTI!)
JWT_SECRET=your-super-secure-random-string-here-minimum-32-characters

# SMTP (pilih provider production)
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=SG.your-sendgrid-api-key

# App URL (ganti dengan domain kamu)
NEXT_PUBLIC_APP_URL=https://learn.yourdomain.com

# Environment
NODE_ENV=production

# Email Verification
ENABLE_EMAIL_VERIFICATION=true
```

### 4. Update next.config.js

Tambahkan `output: 'standalone'` di `next.config.js`:

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone', // ← Tambahkan ini untuk Docker
  // ... config lainnya
}

module.exports = nextConfig
```

---

## 🐳 Build & Deploy

### Build dan Jalankan

```bash
cd /var/www/sija-learn

# Build images (pertama kali atau setelah update code)
docker compose build

# Start semua services
docker compose up -d

# Cek status
docker compose ps
```

**Expected Output:**
```
NAME                        STATUS
sija-learn-app              Up
sija-learn-mongodb          Up
sija-cloudflare-tunnel      Up
```

### Lihat Logs

```bash
# Semua logs
docker compose logs -f

# Logs specific service
docker compose logs -f app
docker compose logs -f mongodb
docker compose logs -f cloudflared
```

---

## 🌐 Setup Cloudflare Tunnel

### 1. Konfigurasi di Dashboard

1. Buka https://one.dash.cloudflare.com/
2. **Zero Trust** → **Networks** → **Tunnels**
3. Pilih tunnel kamu
4. **Public Hostname** → **Add a public hostname**
5. Setup:
   - **Subdomain**: `learn` (atau `dev`)
   - **Domain**: `yourdomain.com`
   - **Type**: HTTP
   - **URL**: `app:3000` ← (nama container, bukan localhost!)

### 2. Update docker-compose.yml

Cloudflare tunnel sekarang konek ke container `app`, bukan `host.docker.internal`:

```yaml
cloudflared:
  # ...
  depends_on:
    - app
  # tidak perlu extra_hosts lagi
```

---

## 🔄 Update Aplikasi (Setelah Push Code Baru)

```bash
cd /var/www/sija-learn

# Pull code terbaru
git pull

# Rebuild dan restart
docker compose down
docker compose build --no-cache
docker compose up -d

# Cek logs
docker compose logs -f app
```

---

## 🗄️ Database Management

### Backup MongoDB

```bash
# Backup
docker exec sija-learn-mongodb mongodump --db sija-learn --out /data/backup

# Copy ke host
docker cp sija-learn-mongodb:/data/backup ./mongodb-backup-$(date +%Y%m%d)

# Compress
tar -czf mongodb-backup-$(date +%Y%m%d).tar.gz ./mongodb-backup-$(date +%Y%m%d)
```

### Restore MongoDB

```bash
# Upload backup ke server
scp mongodb-backup.tar.gz user@server:/var/www/sija-learn/

# Extract
tar -xzf mongodb-backup.tar.gz

# Copy ke container
docker cp ./mongodb-backup sija-learn-mongodb:/data/backup

# Restore
docker exec sija-learn-mongodb mongorestore /data/backup
```

### Akses MongoDB Shell

```bash
docker exec -it sija-learn-mongodb mongosh

# Di dalam mongosh:
use sija-learn
show collections
db.users.find().limit(5)
exit
```

---

## 🛠️ Troubleshooting

### Container Gagal Start

```bash
# Lihat error detail
docker compose logs

# Check health
docker compose ps

# Restart specific service
docker compose restart app
```

### MongoDB Connection Error

Pastikan `MONGODB_URI` menggunakan **nama service**, bukan `localhost`:

```env
# ✅ BENAR (untuk Docker)
MONGODB_URI=mongodb://mongodb:27017/sija-learn

# ❌ SALAH
MONGODB_URI=mongodb://localhost:27017/sija-learn
```

### Build Error - Module Not Found

```bash
# Clear cache dan rebuild
docker compose down
docker system prune -a
docker compose build --no-cache
docker compose up -d
```

### Port Already in Use

```bash
# Cek apa yang pakai port 3000
sudo netstat -tulpn | grep :3000

# Kill process
sudo kill -9 <PID>

# Atau ganti port di docker-compose.yml
ports:
  - "3001:3000"  # Host:Container
```

---

## 🔐 Security Checklist

- [ ] Ganti `JWT_SECRET` dengan random string (min 32 chars)
- [ ] Set `NODE_ENV=production`
- [ ] Enable MongoDB authentication (optional tapi recommended)
- [ ] Setup firewall (UFW):
  ```bash
  sudo ufw allow 22/tcp     # SSH
  sudo ufw allow 80/tcp     # HTTP
  sudo ufw allow 443/tcp    # HTTPS
  sudo ufw enable
  ```
- [ ] Regular backup database
- [ ] Enable HTTPS di Cloudflare (Full/Strict)
- [ ] Monitor logs secara berkala

---

## 📊 Monitoring

### Resource Usage

```bash
# CPU & Memory usage
docker stats

# Disk usage
docker system df
```

### Clean Up Old Images

```bash
# Remove unused images
docker image prune -a

# Remove stopped containers
docker container prune
```

---

## 🚨 Emergency Commands

```bash
# Stop everything
docker compose down

# Nuclear option (hapus SEMUA termasuk data!)
docker compose down -v
docker system prune -a --volumes

# Restart dari awal
docker compose up -d --build
```

---

**Production Checklist:**
- ✅ MongoDB menggunakan Docker volume (data persistent)
- ✅ Next.js di-build dalam mode production
- ✅ Cloudflare Tunnel untuk public access
- ✅ Environment variables aman (tidak di-commit ke Git)
- ✅ Auto-restart enabled (`restart: unless-stopped`)

**Happy Deploying! 🚀**