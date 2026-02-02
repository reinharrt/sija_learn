# 🧩 Common Components (Komponen Umum)

Folder ini berisi elemen tampilan "batu bata" yang paling dasar. Komponen di sini **TIDAK BOLEH** mengandung logika bisnis yang rumit (seperti fetch data API). Isinya murni hanya urusan tampilan dan interaksi simpel.

## 📂 Dokumentasi File

### `Button.tsx` (Tombol)
*   **Fungsi**: Tombol standar yang konsisten di seluruh aplikasi.
*   **Varian**: Bisa jadi tombol biasa (Primary), tombol bahaya (Danger - Merah), atau tombol transparan (Ghost).
*   **Fitur**: Bisa menampilkan icon di kiri/kanan teks, dan berubah jadi icon loading kalau sedang diproses.

### `Input.tsx` (Kolom Teks)
*   **Fungsi**: Kotak isian untuk form (Login, Search, Edit Profil).
*   **Fitur**: Memiliki label judul, placeholder, dan pesan error warna merah di bawahnya jika salah isi.

### `Card.tsx` (Kartu Konten)
*   **Fungsi**: Kotak putih dengan bayangan (shadow) untuk membungkus konten agar terlihat rapi.
*   **Penggunaan**: Dipakai sebagai wadah artikel, profil, atau info dashboard.

### `Badge.tsx` (Label/Tag)
*   **Fungsi**: Stiker kecil untuk menandai status.
*   **Contoh**: Label "New", "Admin", "Draft", atau Kategori "Networking". Warnanya bisa berubah-ubah sesuai jenis labelnya.

### `Spinner.tsx` (Loading)
*   **Fungsi**: Ikon berputar-putar.
*   **Penggunaan**: Muncul di tengah tombol saat diklik, atau di tengah layar saat data belum siap.

### `Modal.tsx` & `ConfirmModal.tsx` (Jendela Pop-up)
*   **Fungsi `Modal`**: Jendela kosong yang muncul menutupi layar (Overlay). Bisa diisi apa saja.
*   **Fungsi `ConfirmModal`**: Versi khusus dari Modal bertanya "Yakin?". Ada tombol "Yes" dan "No".
    *   *Dipakai saat*: Mau hapus user, mau submit kuis, mau logout.

### `Breadcrumb.tsx` (Jejak Navigasi)
*   **Fungsi**: Teks kecil di atas halaman seperti "Home > Course > Jaringan Dasar > Bab 1".
*   **Tujuan**: Supaya user tidak tersesat dan bisa balik ke halaman sebelumnya dengan mudah.

### `DataTable.tsx` (Tabel Sakti)
*   **Fungsi**: Tabel canggih untuk menampilkan data baris-berbaris (User List, Article List).
*   **Fitur**: Biasanya sudah include fitur Pagination (Halaman 1, 2, 3) dan Sorting (Urutkan A-Z).

### `ImageUpload.tsx` (Upload Gambar)
*   **Fungsi**: Area khusus untuk drag-and-drop atau pilih gambar dari komputer.
*   **Fitur**: Menampilkan preview gambar sebelum di-upload, dan tombol "X" untuk membatalkan.

### `TagInput.tsx` (Input Label)
*   **Fungsi**: Input khusus dimana user bisa mengetik lalu tekan Enter untuk membuat tag.
*   **Penggunaan**: Saat menulis artikel, penulis mengetik "Mikrotik [Enter]", "Server [Enter]".

### `PageHeader.tsx` (Judul Halaman)
*   **Fungsi**: Standar judul besar di setiap halaman.
*   **Isi**: Judul Halaman (H1) + Deskripsi singkat di bawahnya.
