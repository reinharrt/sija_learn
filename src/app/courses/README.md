# 🎓 Courses (Ruang Kelas & Kursus)

Folder ini adalah inti dari pembelajaran terstruktur di SIJA Learn. Di sini siswa belajar materi secara urut dari Bab 1 sampai selesai, lalu mengerjakan kuis.

## 🌟 Fungsi Utama
Bagian ini mensimulasikan ruang kelas online.
1.  **Katalog Kursus**: Menampilkan daftar pelajaran yang tersedia.
2.  **Enroll (Daftar Kelas)**: Siswa harus mendaftar dulu untuk mulai belajar.
3.  **Materi Belajar**: Konten pelajaran yang dibagi per bab.
4.  **Tracking Progress**: Menyimpan data sejauh mana siswa belajar (misal: 50% selesai).

## 🔄 Alur Pengguna (User Flow)

### 1. Memilih Kelas
1.  User membuka menu "Courses".
2.  User melihat daftar kursus (misal: "Dasar Mikrotik", "Belajar React").
3.  User klik salah satu kursus untuk melihat silabus (daftar isinya).

### 2. Mulai Belajar
1.  Jika belum ikut, user klik tombol **"Ambil Course"** (Enroll).
2.  User mulai membaca materi pertama.
3.  Setelah selesai satu materi, user klik "Next" atau "Mark as Complete".
4.  Progress bar bertambah (misal dari 0% jadi 10%).

### 3. Menyelesaikan Kursus
1.  User menyelesaikan semua materi bacaan.
2.  User mengerjakan Kuis Akhir (jika ada).
3.  Jika lulus, kursus dianggap **Selesai**.
4.  User mendapatkan XP besar dan Badge (Lencana) kelulusan.

## ⚠️ Aturan Penting

*   **Harus Enroll**: Siswa tidak bisa mencatat progress kalau belum klik tombol Enroll.
*   **Urutan Belajar**: Idealnya materi dipelajari berurutan, tapi sistem membolehkan akses acak jika diperlukan (tergantung settingan).
*   **Kuis Syarat Lulus**: Biasanya kursus tidak bisa 100% selesai kalau kuisnya belum lulus (nilai di atas KKM).

## 📝 Catatan untuk Tim
*   Struktur data Kursus itu seperti pohon: **Course -> Chapters -> Lessons**.
*   Sistem ini terhubung erat dengan `gamification`. Setiap proges kecil (baca 1 bab) bisa memberi sedikit XP, tapi selesaikan 1 course memberi banyak XP.
