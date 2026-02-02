# 🛡️ Middleware & Konfigurasi Utama

Bagian ini menjelaskan "Satpam" dan "Aturan Dasar" dari aplikasi SIJA Learn. File-file ini bekerja sebelum halaman apapun dimuat oleh user.

## 🚧 `src/middleware.ts` (Satpam Aplikasi)

Bayangkan middleware sebagai pos satpam di gerbang sekolah. Sebelum siswa masuk ke kelas (halaman), satpam akan memeriksa kelengkapan seragam (token login) mereka.

### Fungsi Utama:
1.  **Proteksi Halaman (Route Protection)**:
    *   Mencegah orang asing (belum login) masuk ke halaman khusus seperti `/profile` atau `/dashboard`.
    *   Mencegah siswa biasa masuk ke ruang guru (`/admin`).
    *   Mencegah user yang sudah login balik lagi ke halaman login (`/login` & `/register`).
2.  **Verifikasi Token**: Memeriksa apakah tiket masuk (JWT Token) masih berlaku atau sudah kadaluarsa.
3.  **Pengalihan (Redirect)**:
    *   Kalau belum login mau buka Admin -> Tendang ke Login.
    *   Kalau Token habis -> Tendang ke Login.
    *   Kalau sudah Login tapi buka Login lagi -> Tendang ke Dashboard.

### Alur Kerja (Flow):
1.  User ketik alamat website.
2.  Middleware berjalan **duluan**.
3.  Cek: Apakah alamat ini butuh login?
    *   **Tidak (Public)**: Silakan lewat.
    *   **Ya (Protected)**: Cek punya token nggak?
        *   Ada: Silakan lewat.
        *   Tidak: Stop! Balik kanan ke halaman Login.

---

## ⚙️ Root Configuration (File Pengaturan Utama)

File-file ini ada di folder paling luar (root) dan mengatur cara kerja "mesin" aplikasi.

### `next.config.js`
*   **Fungsi**: Pengaturan inti framework Next.js.
*   **Isi Penting**:
    *   `images.remotePatterns`: Mengizinkan aplikasi menampilkan gambar dari website lain (misal: Google User content). Tanpa ini, gambar dari luar akan diblokir demi keamanan.
    *   `typescript.ignoreBuildErrors`: (Kadang dipakai) Menyuruh komputer tetap menjalankan web meskipun ada error kecil di codingan (Bahaya, jangan sering dipakai).

### `tailwind.config.js`
*   **Fungsi**: Kamus Desain (Style Guide).
*   **Isi Penting**:
    *   Menentukan warna resmi aplikasi (misal: Warna Biru SIJA itu kodenya `#007bff`).
    *   Menentukan font yang dipakai.
    *   Menentukan ukuran layar HP, Tablet, Laptop untuk desain responsif.

### `tsconfig.json`
*   **Fungsi**: Aturan bahasa TypeScript.
*   **Isi Penting**: Menentukan seberapa "ketat" aturan penulisan kode. Misal: Apakah variabel kosong boleh dibiarkan? Apakah tipe data harus ditulis jelas?

### `package.json`
*   **Fungsi**: Daftar Belanjaan (Dependencies).
*   **Isi Penting**:
    *   `dependencies`: Daftar plugin/library yang "dimasak" jadi satu dalam aplikasi (React, NextAuth, MongoDB, dll).
    *   `scripts`: Perintah jalan pintas. Misal saat kita ketik `npm run dev`, komputer sebenarnya menjalankan perintah panjang `next dev --turbopack`.

## 📝 Kenapa "Satpam" dan "Aturan" ini Penting?
Tanpa Middleware, siapa saja bisa masuk ke halaman Admin cuma dengan menebak URL-nya.
Tanpa Config, tampilan web bisa berantakan dan aplikasi tidak tahu cara memproses kode program.
