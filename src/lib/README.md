# 📚 Library & Utilities (Otak & Fungsi Bantu)

Folder ini berisi kumpulan fungsi logika utama (Business Logic) yang menjalankan 'kecerdasan' aplikasi ini. File di sini tidak punya tampilan (UI), hanya kode pemrograman murni.

## 🌟 Peran dalam Sistem
Layer ini bertugas untuk:
1.  **Sentralisasi Logika**: Supaya kode hitung-hitungan tidak berceceran di halaman.
2.  **Helper/Bantuan**: Fungsi kecil yang dipakai berulang kali (seperti format tanggal).
3.  **Konektor Eksternal**: Menghubungkan aplikasi dengan Database, Email Server, dll.

## 📂 Dokumentasi File

### `mongodb.ts` (Koneksi Database)
*   **Tanggung Jawab**: Membuka dan menjaga hubungan telepon dengan database MongoDB.
*   **Kenapa Penting**: Tanpa ini, aplikasi tidak bisa simpan atau ambil data.
*   **Cara Kerja**: Memastikan hanya ada 1 koneksi yang terbuka agar server tidak keberatan beban (Singleton Pattern).

### `auth.ts` (Keamanan & Sesi)
*   **Tanggung Jawab**: Polisi lalu lintas akses. Mengecek token JWT, membuat password jadi acak (hashing), dan validasi sesi login.
*   **Interaksi**: Dipanggil hampir di setiap API untuk memastikan "Siapa yang akses ini?".

### `email.ts` (Layanan Email)
*   **Tanggung Jawab**: Mengirim email otomatis (Nodemailer).
*   **Penggunaan**: Mengirim OTP saat register, mengirim link reset password.

### `gamification.ts` (Logika Game)
*   **Tanggung Jawab**: Wasit permainan. Menentukan aturan main XP dan Level.
*   **Logika**:
    *   Fungsi `addXP`: Menambah poin ke user.
    *   Fungsi `checkLevelUp`: Mengecek apakah XP sudah cukup untuk naik level.
    *   Fungsi `awardBadge`: Memberikan lencana jika syarat terpenuhi.

### `badge-definitions.ts` (Kamus Badge)
*   **Tanggung Jawab**: Daftar statis semua badge yang ada di game.
*   **Isi**: ID Badge, Nama Badge, Gambar Icon, dan Deskripsi syarat mendapatkannya (misal: "Si Kutu Buku" - Baca 5 Artikel").

### `xp-calculator.ts` (Kalkulator XP)
*   **Tanggung Jawab**: Rumus matematika kurva level.
*   **Fungsi**: Menghitung "Butuh berapa XP lagi untuk ke level 10?". Kurvanya biasanya makin tinggi level makin susah.

### `gamification-client.ts` (Gamifikasi Frontend)
*   **Tanggung Jawab**: Versi ringan dari logika gamifikasi untuk dipakai di browser (tampilan).
*   **Beda**: `gamification.ts` untuk server (update database), file ini untuk tampilan (misal: hitung % progress bar level).

### `view-tracker.ts` (Penghitung Pembaca)
*   **Tanggung Jawab**: Menghitung jumlah view artikel secara cerdas.
*   **Fitur**: Mencegah spam klik. 1 user refresh 100x tetap dihitung 1 view dalam jangka waktu tertentu (Debouncing/Unique tracking).

### `id-utils.ts` (Generator ID)
*   **Tanggung Jawab**: Membuat ID unik yang rapi (bukan acak jelek).
*   **Contoh**: Membuat slug URL ramah baca dari judul artikel ("Cara Masak" -> "cara-masak").

### `utils.ts` (Perkakas Umum)
*   **Tanggung Jawab**: Fungsi serba guna "Palugada".
*   **Isi**: Format tanggal Indonesia, menggabungkan nama class CSS (`cn`), format angka ribuan.

## 📝 Catatan Penting
*   Jika ada bug perhitungan XP atau Level, cek di `gamification.ts`.
*   Jika ada masalah koneksi database putus-nyambung, cek `mongodb.ts`.
