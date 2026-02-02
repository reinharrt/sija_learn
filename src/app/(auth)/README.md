# 🔐 Authentication (Sistem Masuk & Daftar Akun)

Folder ini berisi semua halaman yang berhubungan dengan pintu masuk pengguna ke dalam aplikasi SIJA Learn.

## 🌟 Fungsi Utama
Bagian ini bertanggung jawab untuk memastikan bahwa yang masuk ke dalam sistem adalah siswa atau guru yang terdaftar. Fitur utamanya meliputi:
1.  **Login**: Masuk untuk pengguna yang sudah punya akun.
2.  **Register**: Pendaftaran untuk pengguna baru.
3.  **Verifikasi Email**: Memastikan email yang didaftarkan adalah asli.
4.  **Lupa Password**: Membantu pengguna yang kehilangan akses ke akunnya.

## 🔄 Alur Pengguna (User Flow)

### 1. Pendaftaran Siswa Baru
1.  User membuka halaman **Register**.
2.  User mengisi Nama, Username, Email, dan Password.
3.  Sistem mengirimkan **Kode OTP** ke email user.
4.  User diarahkan ke halaman **Verifikasi Email**.
5.  User memasukkan kode OTP dari email.
6.  **Sukses!** Akun aktif dan user bisa login.

### 2. Proses Login
1.  User membuka halaman **Login**.
2.  Memasukkan Email/Username dan Password.
3.  Jika benar, user masuk ke halaman utama.
4.  Jika salah, muncul pesan error.

### 3. Lupa Password
1.  User klik "Lupa Password" di halaman login.
2.  User memasukkan email yang terdaftar.
3.  Sistem mengirim link/kode ke email.
4.  User membuat password baru.

## ⚠️ Aturan Penting

*   **Wajib Verifikasi**: Akun yang baru dibuat **TIDAK BISA** digunakan untuk login sebelum emailnya diverifikasi. Ini untuk mencegah akun palsu (bot).
*   **Password Aman**: Password di database disandikan (diacak) sehingga admin pun tidak bisa melihat password asli user.
*   **Username Unik**: Tidak boleh ada dua user dengan username atau email yang sama.

## 📝 Catatan untuk Tim
*   Alur ini menggunakan keamanan standar JWT. Artinya, setelah login, user diberi "tiket" digital yang berlaku selama 7 hari. User tidak perlu login ulang setiap kali buka web kecuali tiketnya habis atau dia klik Logout.
