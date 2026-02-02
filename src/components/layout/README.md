# 📐 Layout Components (Kerangka Tampilan)

Folder ini berisi komponen utama yang menyusun struktur "Tulang Punggung" setiap halaman website.

## 📂 Dokumentasi File

### `Header.tsx` (Navigasi Atas)
*   **Fungsi**: Bagian paling atas yang selalu nempel (Sticky) saat di-scroll.
*   **Isi**:
    1.  **Logo**: Klik untuk balik ke Home.
    2.  **Menu Utama**: Link ke Course, Article, Leaderboard.
    3.  **User Menu**:
        *   *Jika Belum Login*: Tombol "Masuk" & "Daftar".
        *   *Jika Sudah Login*: Foto Profil kecil (Avatar) yang kalau diklik muncul menu dropdown (Profil, Keluar).
*   **Logic**: Komponen ini "bertanya" ke `AuthContext` untuk tahu status login user.

### `Footer.tsx` (Kaki Halaman)
*   **Fungsi**: Bagian penutup di paling bawah website.
*   **Isi**: Copyright tahun, Link ke sosial media sekolah, dan link navigasi cepat.
*   **Sifat**: Statis, jarang berubah isinya.
