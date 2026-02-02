# 🎓 Course Components (Fitur Kursus)

Folder ini berisi komponen komplek untuk menjalankan sistem E-Learning (LMS).

## 📂 Dokumentasi File

### `CourseCard.tsx` (Kartu Preview)
*   **Fungsi**: Tampilan ringkas kursus di halaman katalog.
*   **Isi**: Judul Kursus, Progress Bar (kalau sudah ikut), Jumlah Bab, dan Tingkat Kesulitan (Easy/Hard).

### `CourseDetail.tsx` (Halaman Utama Kursus)
*   **Fungsi**: Layout besar halaman belajar.
*   **Struktur**:
    *   Kiri/Atas: Video atau Teks Materi.
    *   Kanan: Daftar Isi (Sidebar) Bab 1, Bab 2, dst.

### `CourseSidebar.tsx` (Daftar Isi)
*   **Fungsi**: Navigasi pindah bab.
*   **Fitur**: Menandai materi mana yang "Sudah Selesai" (Centang Hijau), "Sedang Dibuka" (Highlight Biru), dan "Terkunci" (Gembok).

### `CourseArticleReader.tsx` (Area Baca Materi)
*   **Fungsi**: Penampil konten materi pelajaran.
*   **Beda dengan Article**: Ini versi khusus yang mungkin punya tombol "Mark as Complete" di bawahnya.

### `CourseCompletionHandler.tsx`
*   **Fungsi**: Komponen "Perayaan". Muncul saat user menyelesaikan materi terakhir.
*   **Tugas**: Memicu confetti (hujan kertas warna-warni) dan request ke server untuk update status kursus jadi "Completed".

### `XPPreview.tsx`
*   **Fungsi**: Teks kecil "Selesaikan ini dapet +50 XP".
*   **Tujuan**: Memotivasi siswa memencet tombol Enroll.

### `DifficultySelector.tsx`
*   **Fungsi**: Pilihan level kesulitan ("Pemula", "Menengah", "Mahir") saat Admin membuat kursus.
