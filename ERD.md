# Penjelasan Teknis Entity Relationship Diagram (ERD)
Dokumen ini menjelaskan struktur database yang digunakan dalam aplikasi Sija Learn. Penjelasan ini disusun secara formal untuk keperluan presentasi teknis atau wawancara.
## I. Tinjauan Umum (Overview)
Sistem database dirancang menggunakan **MongoDB**, sebuah database NoSQL yang berorientasi dokumen. Pemilihan ini didasarkan pada kebutuhan akan fleksibilitas skema data, terutama untuk menyimpan konten artikel dan kuis yang strukturnya dapat berkembang.
Meskipun menggunakan NoSQL, sistem ini tetap mempertahankan integritas relasional antar data menggunakan referensi ID (ObjectId), yang menghubungkan antar koleksi (tables) secara logis.
## II. Entitas Utama dan Fungsinya
Berikut adalah penjelasan fungsi dan atribut kunci dari setiap entitas:
### 1. User (Pengguna)
Entitas sentral yang menyimpan data autentikasi dan profil pengguna.
*   **Peran (Role)**: Menggunakan sistem *Role-Based Access Control* (RBAC) dengan tingkatan: User, Writer, Course Admin, dan Admin.
*   **Fungsi**: Sebagai referensi utama bagi entitas lain (pemilik artikel, peserta kursus, penulis komentar).
### 2. Course (Kursus)
Merepresentasikan unit pembelajaran utama.
*   **Struktur**: Sebuah Course berisi kumpulan referensi ke entitas Article.
*   **Relasi**:
    *   *One-to-Many* dengan Enrollment (Satu kursus diikuti banyak siswa).
    *   *One-to-Many* dengan Article (Satu kursus memiliki banyak artikel).
*   **Atribut Kunci**: `finalQuizId` (referensi ke kuis akhir) dan `creator` (referensi ke instruktur).
### 3. Article (Artikel/Materi)
Unit pembelajaran terkecil yang dapat berdiri sendiri atau menjadi bagian dari Course.
*   **Fleksibilitas**: Konten disimpan dalam bentuk array blok (text, image, code) memungkinkan penyajian materi yang dinamis.
*   **Kategorisasi**: Menggunakan `slug` kategori untuk pengelompokan yang efisien.
*   **Relasi**: Terhubung dengan Quiz (sebagai kuis formatif di akhir materi).
### 4. Enrollment (Pendaftaran)
Entitas penghubung (*Pivot Table* dalam istilah SQL) yang mencatat hubungan antara User dan Course.
*   **Fungsi Utama**: Mencatat status keikutsertaan siswa dalam kursus.
*   **Tracking Progress**: Menyimpan array `completedArticles` yang berisi ID artikel yang telah diselesaikan siswa. Ini memungkinkan sistem melacak persentase kelulusan siswa secara akurat.
### 5. Quiz & QuizAttempt (Sistem Evaluasi)
Dua entitas yang bekerja sama untuk menangani evaluasi.
*   **Quiz**: Menyimpan bank soal, kunci jawaban, dan konfigurasi (waktu, nilai lulus).
*   **QuizAttempt**: Menyimpan riwayat pengerjaan siswa. Entitas ini memisahkan "soal" dari "jawaban siswa", sehingga sistem dapat menyimpan *history* percobaan berkali-kali tanpa menimpa data sebelumnya.
### 6. UserProgress (Gamifikasi)
Entitas khusus untuk menyimpan metrik pencapaian pengguna.
*   **Desain**: Dipisahkan dari tabel User untuk menjaga tabel User tetap ringan (*lightweight*) saat proses login.
*   **Data**: Menyimpan Total XP, Level saat ini, dan koleksi Badge yang dimiliki.
## III. Alur Relasi Data
1.  **Relasi User - Course (Enrollment)**:
    Hubungan *Many-to-Many* antara User dan Course difasilitasi oleh entitas Enrollment. Ketika siswa mendaftar kursus, sistem membuat satu dokumen Enrollment baru. Dokumen ini kemudian diperbarui setiap kali siswa menyelesaikan materi.
2.  **Relasi Course - Article**:
    Course menyimpan array `ObjectId` dari Article. Ini memungkinkan pengambilan urutan materi yang cepat tanpa perlu melakukan query berat ke seluruh tabel Article.
3.  **Relasi Quiz - Attempt**:
    Setiap kali User mengerjakan Quiz, sistem membuat dokumen QuizAttempt. Ini penting untuk audit dan analisis perkembangan siswa, karena semua riwayat nilai, waktu pengerjaan, dan jawaban tersimpan lengkap.
## IV. Alasan Desain Teknis (Technical Decisions)
1.  **Mengapa Denormalisasi?**
    Pada entitas Course, kami menyimpan `enrolledCount` (jumlah siswa). Meskipun data ini bisa dihitung dari jumlah Enrollment, kami menyimpannya langsung di Course agar saat menampilkan daftar kursus populer, sistem tidak perlu menghitung ulang ribuan data (agregasi) yang dapat memperlambat aplikasi.
2.  **Mengapa Referensi ID?**
    Meskipun MongoDB mendukung *Embedding* (menyimpan data di dalam data lain), kami memilih menggunakan *Referencing* (menyimpan ID saja) untuk entitas yang berhubungan banyak, seperti Artikel dalam Course. Ini mencegah ukuran dokumen Course menjadi terlalu besar yang dapat menurunkan performa database.