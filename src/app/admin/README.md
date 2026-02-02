# 🛡️ Admin Dashboard (Panel Kontrol Guru)

Folder ini adalah area terlarang untuk siswa. Hanya Guru dan Admin yang punya akses ke sini untuk mengelola seluruh isi website.

## 🌟 Fungsi Utama
Bagian ini adalah pusat komando.
1.  **Manajemen User**: Melihat daftar semua siswa, blokir siswa nakal, reset password siswa.
2.  **Manajemen Konten**:
    *   **Artikel**: Menyetujui artikel yang ditulis siswa (Moderasi).
    *   **Course**: Membuat materi pelajaran baru, bikin soal kuis.
3.  **Laporan**: Melihat statistik siapa siswa paling rajin, materi mana yang paling populer.

## 🔄 Alur Pengguna (User Flow)

### 1. Moderasi User
1.  Admin masuk ke menu **Users**.
2.  Melihat tabel daftar siswa.
3.  Bisa cari nama siswa, lalu klik "Edit" untuk ganti role (misal dari Siswa jadi Penulis).
4.  Bisa "Ban" (Blokir) kalau siswa melanggar aturan.

### 2. Membuat Kursus Baru
1.  Admin ke menu **Courses** -> "Create New".
2.  Isi Judul, Deskripsi, dan Cover Gambar.
3.  Tambah "Bab" baru, lalu isi materinya.
4.  Tambah "Kuis" di akhir bab.
5.  Klik **Publish** supaya muncul di halaman siswa.

### 3. Validasi Artikel
1.  Siswa kirim artikel -> statusnya "Pending".
2.  Admin buka menu **Articles**.
3.  Baca artikel siswa.
4.  Klik **Approve** (Terima) atau **Reject** (Tolak).
5.  Kalau diterima, artikel langsung muncul di halaman publik.

## ⚠️ Aturan Penting

*   **Role Based Access**: Halaman ini diproteksi ketat. Jika user biasa coba buka link `/admin`, mereka akan langsung ditendang ke halaman utama atau error 403.
*   **Hati-hati Menghapus**: Di sini fitur Delete bersifat permanen. Menghapus user atau course akan menghilangkan data selamanya.

## 📝 Catatan untuk Tim
*   Tampilan admin fokus ke fungsionalitas dan data (tabel, form), beda dengan halaman siswa yang fokus ke estetika dan kenyamanan baca.
*   Fitur ini yang membuat website bisa berjalan mandiri tanpa perlu programmer setiap mau tambah materi.
