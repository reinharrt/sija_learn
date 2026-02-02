# 👥 Users API Routes (Manajemen Pengguna)

Folder ini menangani data profil, edit akun, dan administrasi user.

---

## 📂 Sub-Routes Documentation

### 1. `route.ts` (Admin List)
*   **Method**: `GET`
    *   **Akses**: ADMIN Only.
    *   **Fungsi**: Mengambil daftar semua user terdaftar di aplikasi.
    *   **Filter**: Bisa cari by nama atau email.

### 2. `[id]/route.ts` (Detail & Edit)
*   **Method**: `GET`
    *   **Fungsi**: Ambil data profil publik user lain (untuk halaman Profil Teman).
    *   **Sensor**: Password dan Email orang lain tidak ditampilkan.
*   **Method**: `PUT` (Owner/Admin)
    *   **Fungsi**: Edit data diri (Ganti Nama, Bio, Jurusan).
    *   **Validasi**: Tidak boleh ganti `role` sendiri jadi Admin (Bahaya!).
*   **Method**: `DELETE` (Admin)
    *   **Fungsi**: Hapus user (Ban Permanen).

---

## 🛡️ Security Note
*   API ini sangat ketat membedakan:
    *   "Saya edit profil saya" (Boleh).
    *   "Saya edit profil orang lain" (Ditolak).
    *   "Admin edit profil orang lain" (Boleh).
