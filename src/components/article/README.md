# 📰 Article Components (Fitur Artikel)

Folder ini berisi komponen-komponen khusus untuk menampilkan daftar artikel dan halaman baca artikel.

## 📂 Dokumentasi File

### `ArticleCard.tsx` (Kartu Preview)
*   **Fungsi**: Tampilan ringkas sebuah artikel di halaman daftar (List).
*   **Isi**: Gambar cover (thumbnail), Judul (dipotong kalau kepanjang), Penulis, Tanggal, dan Kategori.
*   **Interaksi**: Seluruh kartu bisa diklik untuk membuka halaman detail artikel.

### `ArticleDetail.tsx` (Halaman Baca)
*   **Fungsi**: Wadah utama saat user sedang membaca.
*   **Tanggung Jawab**: Menyusun layout Judul Besar di atas, Gambar Cover lebar, Info Penulis, lalu Isi Artikel di bawahnya.

### `BlockEditor.tsx` (Editor Penulisan)
*   **Fungsi**: Alat untuk MENULIS artikel (mirip MS Word mini).
*   **Fitur**: Bold, Italic, Heading 1/2/3, Upload Gambar, Quote.
*   **Pengguna**: Hanya dipakai oleh Penulis (Writer) dan Admin saat membuat konten.
*   **Teknis**: Menggunakan library `EditorJS` atau `Tiptap` (cek kodingan).

### `ArticleSelector.tsx`
*   **Fungsi**: Dropdown atau Modal untuk memilih artikel.
*   **Penggunaan**: Biasanya dipakai oleh Admin saat mau "Attach" artikel ke dalam sebuah Course. "Materi Bab 1 ambil dari artikel mana?".

### `CategoryFilter.tsx` & `CategorySelector.tsx`
*   **Fungsi Filter**: Deretan tombol kategori di halaman list. User klik "Jaringan", list artikel tersaring.
*   **Fungsi Selector**: Dropdown pilihan kategori saat penulis membuat artikel baru. "Artikel ini masuk kategori apa?".

### `ArticleAccessLoader.tsx` (Pengecek Akses)
*   **Fungsi**: Komponen tak terlihat (Logic Wrapper) yang mengecek "Bolehkah user ini baca artikel ini?".
*   **Contoh**: Kalau artikel statusnya "Premium" atau "Draft", komponen ini akan menendang user yang tidak berhak.
