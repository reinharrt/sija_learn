# 📝 Articles API Routes

Folder ini menangani data Blog / Perpustakaan Artikel.

---

## 📂 Sub-Routes Documentation

### 1. `route.ts` (List & Create)
*   **Method**: `GET`
    *   **Fungsi**: Ambil daftar artikel terbaru.
    *   **Pagination**: Mendukung `?page=1&limit=10` biar tidak berat ambil semua.
*   **Method**: `POST` (Writer/Admin)
    *   **Fungsi**: Kirim draft artikel baru.
    *   **Input**: Judul, Slug, Isi konten, Kategori, Tags.

### 2. `[id]/route.ts` (Detail & Edit)
*   **ID**: Bisa berupa MongoDB ID (`65a...`) atau Slug url (`cara-install-linux`).
*   **Method**: `GET`
    *   **Fungsi**: Baca isi artikel lengkap.
    *   **Side Effect**: Tidak menambah View Count (itu tugas file `view-tracker.ts` / API gamification).
*   **Method**: `PUT` (Author/Admin)
    *   **Fungsi**: Revisi artikel.
*   **Method**: `DELETE` (Author/Admin)
    *   **Fungsi**: Tarik artikel (Hapus).

---

## 💡 Konsep Penting
*   **Slug**: Alamat URL yang bisa dibaca manusia. API ini otomatis generate slug dari judul jika tidak diisi.
    *   Judul: "Belajar 101" -> Slug: "belajar-101".
*   **Sanitization**: API membersihkan HTML dari input user untuk mencegah script jahat (XSS), meskipun Block Editor biasanya sudah aman.
