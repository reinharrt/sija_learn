# 🗄️ Database Models ( Struktur Data)

Folder ini berisi "Cetak Biru" (Blueprint) dari semua data yang disimpan di dalam database. Bayangkan ini seperti formulir kosong yang menentukan data apa saja yang wajib diisi.

## 🌟 Peran dalam Sistem
Layer ini bertugas untuk:
1.  **Validasi Data**: Memastikan data yang masuk sesuai aturan (misal: email harus ada '@', harga tidak boleh minus).
2.  **Strukturisasi**: Menentukan hubungan antar data (misal: Komentar ini milik Artikel mana?).
3.  **Keamanan**: Memastikan password tersimpan dalam bentuk kode rahasia, bukan teks biasa.

## 📂 Dokumentasi File

### `User.ts` (Data Pengguna)
*   **Fungsi**: Menyimpan informasi profil pengguna.
*   **Kenapa ada?**: Untuk sistem login dan identitas siswa.
*   **Interaksi**: Digunakan oleh sistem Auth saat login dan Gamifikasi untuk simpan XP/Level.
*   **Data Penting**: `username`, `email` (unik), `password` (terenkripsi), `role` (user/admin), `xp`, `level`.

### `TempUser.ts` (User Sementara)
*   **Fungsi**: Tempat parkir sementara pendaftar baru yang belum verifikasi email.
*   **Kenapa ada?**: Supaya tabel `User` utama bersih dari akun spam/robot yang tidak pernah aktif.
*   **Interaksi**: Dibuat saat Register, dipindahkan ke `User` saat Verifikasi Email sukses.

### `Article.ts` (Data Artikel)
*   **Fungsi**: Menyimpan konten artikel bacaan.
*   **Kenapa ada?**: Inti dari fitur blog/perpustakaan.
*   **Data Penting**: `title`, `content` (HTML rich text), `slug` (untuk URL), `tags`, `author` (penulis).

### `Course.ts` (Data Kursus)
*   **Fungsi**: Menyimpan struktur pelajaran, termasuk bab-bab dan isinya.
*   **Kenapa ada?**: Inti dari fitur E-Learning.
*   **Data Penting**: `chapters` (daftar bab), `lessons` (isi materi per bab), `quiz` (id kuis terkait).

### `Enrollment.ts` (Data Pendaftaran Kursus)
*   **Fungsi**: Mencatat "Siapa ambil kursus apa".
*   **Kenapa ada?**: Untuk memisahkan progress belajar setiap siswa.
*   **Data Penting**: `user` (id siswa), `course` (id kursus), `progress` (persentase selesai).

### `UserProgress.ts` (Detail Jejak Belajar)
*   **Fungsi**: Mencatat materi mana saja yang SUDAH dibaca siswa secara spesifik.
*   **Kenapa ada?**: Kalau `Enrollment` cuma simpan persen total, ini simpan detail "Bab 1: Sudah, Bab 2: Belum".
*   **Interaksi**: Diupdate setiap kali siswa klik "Mark as Selesai".

### `Quiz.ts` (Data Soal)
*   **Fungsi**: Menyimpan bank soal ujian.
*   **Data Penting**: `questions` (array berisi teks soal, pilihan ganda A-E, dan kunci jawaban).

### `QuizAttempt.ts` (Lembar Jawaban Siswa)
*   **Fungsi**: Menyimpan sejarah setiap kali siswa mengerjakan kuis.
*   **Kenapa ada?**: Supaya guru bisa lihat riwayat nilai, bukan cuma nilai terakhir.
*   **Data Penting**: `answers` (jawaban siswa per soal), `score` (nilai akhir), `passed` (lulus/gagal).

### `Comment.ts` (Diskusi)
*   **Fungsi**: Menyimpan komentar dan balasan di artikel.
*   **Interaksi**: Terhubung ke `User` (siapa yang nulis) dan `Article` (di mana nulisnya).

### `Category.ts` & `Tag.ts` (Pengelompokan)
*   **Fungsi**: Label untuk mengelompokkan artikel atau kursus agar mudah dicari.
*   **Beda**: Kategori bersifat hierarki (Induk-Anak), Tag bersifat bebas (Label tempel).

## 📝 Catatan Tambahan
*   Semua file ini menggunakan **Mongoose Schema**.
*   Jika ingin menambah kolom baru (misal: tambah No HP user), edit file yang sesuai di sini.
