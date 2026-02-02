# 🎣 Custom Hooks (Logika Reusable)

Folder ini berisi "Resep Logika" yang dibungkus rapi. Hooks adalah cara React memisahkan logika yang rumit dari tampilan agar kodenya lebih bersih.

## 🌟 Peran dalam Sistem
*   **Reusability**: Satu logika bisa dipakai di banyak komponen berbeda.
*   **Penyederhanaan**: Komponen tampilan (file `.tsx` di folder `app`) jadi bersih, tidak penuh dengan rumus-rumus.

## 📂 Dokumentasi File

### `useGamification.ts`
*   **Tanggung Jawab**: Paket lengkap logika gamifikasi di sisi klien.
*   **Fitur**:
    *   Menghitung persentase progress bar level.
    *   Memberikan notifikasi "XP Bertambah!".
    *   Mengambil data leaderboard terbaru.
*   **Digunakan di**: `Header`, `Sidebar`, `ProfilePage`, `QuizResult`.

### `useViewTracking.ts`
*   **Tanggung Jawab**: Logika "Stopwatch" pembaca.
*   **Cara Kerja**:
    1.  Mendeteksi saat user membuka artikel.
    2.  Menghitung durasi baca (time spent).
    3.  Kalau sudah baca > 30 detik (misal), hook ini lapor ke server "User ini sudah baca valid!".
    4.  Memicu penambahan XP baca.
*   **Digunakan di**: `ArticleDetail`, `CourseLesson`.

## 📝 Tips untuk Tim
*   Semua file di sini diawali kata `use` (aturan wajib React).
*   Jika kalian butuh logika yang dipakai di 2 tempat atau lebih, buatkan Hook-nya di sini jangan di-copy paste kodenya.
