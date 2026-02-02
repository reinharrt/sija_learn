# 🧠 Quiz Components (Fitur Ujian)

Folder ini berisi "Mesin Ujian" aplikasi. Ini adalah bagian yang paling banyak logika interaktifnya.

## 📂 Dokumentasi File

### `QuizTaker.tsx` (Mesin Penjawab)
*   **Status**: **Jantung Aplikasi Quiz**.
*   **Fungsi**: Menangani seluruh proses pengerjaan soal dari nomor 1 sampai selesai.
*   **Tugas**:
    1.  Menyimpan jawaban sementara user di memori.
    2.  Menjalankan Timer mundur.
    3.  Pindah halaman soal (Next/Prev).
    4.  Submit jawaban ke server saat selesai.

### `QuestionDisplay.tsx` (Penampil Soal)
*   **Fungsi**: Menampilkan SATU soal saja.
*   **Isi**: Teks pertanyaan + 5 Tombol Pilihan Ganda (A, B, C, D, E).
*   **Interaksi**: Saat tombol pilihan diklik, dia lapor ke `QuizTaker` -> "Eh, user pilih B nih buat soal ini".

### `QuizResults.tsx` (Rapor Nilai)
*   **Fungsi**: Halaman statis yang muncul setelah ujian kelar.
*   **Isi**:
    *   Skor Besar (misal "85").
    *   Status Lulus/Gagal.
    *   Tombol "Lihat Pembahasan" atau "Ulangi Kuis" (kalau boleh).
    *   XP yang didapat.

### `QuizCard.tsx`
*   **Fungsi**: Kartu kecil info kuis di dalam halaman Course. "Kuis Bab 1: 10 Soal, 15 Menit".
