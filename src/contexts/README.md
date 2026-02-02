# 🌐 Contexts (State Global)

Folder ini berisi "Penyiar Radio" aplikasi. Data yang disimpan di sini bisa didengar dan diakses oleh SEMUA komponen di aplikasi tanpa perlu oper-operan data manual.

## 🌟 Peran dalam Sistem Architecture
*   **State Management**: Mengelola data yang sifatnya global (dibutuhkan di banyak tempat sekaligus).
*   **Menghindari Prop Drilling**: Mencegah keruwetan kode dimana data harus dioper dari Kakek -> Ayah -> Anak -> Cucu komponen.

## 📂 Dokumentasi File

### `AuthContext.tsx` (Data Login User)
*   **Tanggung Jawab**: Menyimpan status "Siapa yang sedang login sekarang?".
*   **Data yang Disimpan**: Informasi user (nama, email, role, avatar).
*   **Fungsi**: `login()`, `logout()`, `updateProfile()`.
*   **Interaksi**:
    *   Header butuh ini untuk menampilkan foto profil di pojok kanan.
    *   Halaman Admin butuh ini untuk menendang user yang bukan admin.
    *   Halaman Kuis butuh ini untuk catat siapa yang mengerjakan.

### `GamificationContext.tsx` (Data Game User)
*   **Tanggung Jawab**: Menyimpan status XP, Level, dan Badge user secara realtime.
*   **Keunikan**: Punya sistem "Notifikasi Naik Level". Jika di tengah jalan user naik level, context ini yang memicu munculnya animasi/popup selamat.
*   **Interaksi**:
    *   Sidebar butuh ini untuk show level bar.
    *   Profile page butuh ini untuk show koleksi badge.

## 📝 Kapan Menggunakan Context?
*   Gunakan Context untuk data yang "abadi" selama user membuka aplikasi (User Info, Theme, Language).
*   JANGAN gunakan Context untuk data sesaat (isian form, timer kuis), gunakan State biasa (`useState`) untuk itu.
