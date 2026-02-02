# 📝 Articles (Perpustakaan Artikel)

Folder ini adalah tempat siswa mengakses materi bacaan lepas atau artikel umum yang tidak terikat dalam kurikulum kursus.

## 🌟 Fungsi Utama
Bagian ini berfungsi sebagai perpustakaan digital. Fitur utamanya:
1.  **Daftar Artikel**: Menampilkan semua artikel yang ada dengan pencarian dan filter kategori.
2.  **Baca Artikel**: Tampilan nyaman untuk membaca satu artikel penuh.
3.  **Komentar**: Tempat diskusi dan tanya jawab di bawah artikel.

## 🔄 Alur Pengguna (User Flow)

### 1. Mencari Bacaan
1.  User masuk ke menu "Artikel".
2.  User melihat daftar kartu artikel (Judul, Ringkasan, Penulis).
3.  User bisa mencari judul tertentu di kolom pencarian.
4.  User bisa filter berdasarkan kategori (misal: "Jaringan", "Pemrograman").

### 2. Membaca
1.  User klik salah satu artikel.
2.  Halaman detail terbuka menampilkan isi lengkap dan gambar.
3.  Sistem otomatis menghitung **Waktu Baca** untuk memberikan poin (XP) jika user membaca sampai selesai (biasanya ada timer minimal baca).

### 3. Berdiskusi
1.  Setelah membaca, user scroll ke bawah.
2.  User menulis pertanyaan atau tanggapan di kolom komentar.
3.  User lain atau penulis bisa membalas komentar tersebut.

## ⚠️ Aturan Penting

*   **Publik & Privat**: Artikel bisa diatur statusnya. Artikel "Draft" tidak akan muncul di sini, hanya artikel "Published" yang bisa dibaca semua orang.
*   **XP Reading**: Poin XP hanya diberikan jika user membaca selama durasi tertentu (tidak cuma buka langsung tutup).
*   **View Count**: Jumlah pembaca dihitung unik. Jika satu orang refresh halaman 10 kali, hitungan pembaca tetap tambah 1 (dalam periode waktu tertentu).

## 📝 Catatan untuk Tim
*   Konten artikel dibuat menggunakan *Rich Text Editor* (seperti Microsoft Word versi mini), jadi bisa ada huruf tebal, miring, list, dan gambar di dalamnya.
*   Fitur ini didesain agar siswa mau membaca (literasi) dengan iming-iming gamifikasi (XP).
