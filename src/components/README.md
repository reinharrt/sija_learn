# 🧩 Components (Komponen Tampilan)

Folder ini berisi semua elemen visual (UI) yang menyusun aplikasi. Kita menggunakan pendekatan **Modular**, artinya kita membuat bagian-bagian kecil (seperti tombol, kartu, input) lalu menyusunnya menjadi halaman utuh.

## 📂 Struktur Folder Komponen

### 1. `common/` (Komponen Dasar)
Komponen paling dasar, "batu bata" bangunan aplikasi. Bersifat umum dan tidak terikat fitur tertentu.
*   **`Button.tsx`**: Tombol standar dengan varian (Primary, Secondary, Danger).
*   **`Input.tsx`**: Kolom input teks yang konsisten.
*   **`Card.tsx`**: Kotak putih dengan shadow untuk membungkus konten.
*   **`Badge.tsx`**: Label kecil (misal: label kategori "Jaringan" warna biru).
*   **`Spinner.tsx`**: Ikon putar-putar untuk loading state.
*   **`Modal.tsx`**: Jendela pop-up dialog (alert/confirm).
*   **`Skeleton.tsx`**: Tampilan loading bayangan abu-abu sebelum data muncul.

### 2. `layout/` (Kerangka Halaman)
Komponen yang membentuk struktur utama website.
*   **`Header.tsx`**: Navigasi atas. Berisi Logo, Menu Link, dan Profil User.
    *   *Interaksi*: Mengecek `AuthContext` untuk menampilkan tombol Login atau Avatar User.
*   **`Footer.tsx`**: Kaki halaman berisi copyright dan link sosial media.
*   **`Sidebar.tsx`**: Menu samping (biasanya di Dashboard/Admin).

### 3. `article/` (Fitur Artikel)
Komponen spesifik untuk tampilan artikel.
*   **`ArticleCard.tsx`**: Kartu preview artikel di halaman list (Gambar + Judul + Summary).
*   **`ArticleContent.tsx`**: Penampil isi artikel. Mengubah teks HTML dari database menjadi tampilan yang enak dibaca (typography styling).
*   **`ArticleMeta.tsx`**: Info kecil di bawah judul (Penulis, Tanggal, Jumlah View).

### 4. `course/` (Fitur Kursus)
Komponen untuk E-Learning.
*   **`CourseCard.tsx`**: Kartu preview kursus.
*   **`ChapterList.tsx`**: Daftar isi bab di sebelah kiri materi (Accordion).
*   **`LessonNavigation.tsx`**: Tombol "Previous" dan "Next" di bawah materi.
*   **`CodeBlock.tsx`**: Tampilan khusus jika materi pelajaran berisi kode pemrograman (Syntax Highlighting).

### 5. `quiz/` (Fitur Kuis)
Komponen interaktif untuk ujian.
*   **`QuizTaker.tsx`**: "Mesin" utama pengerjaan kuis. Mengatur slide soal dan timer.
*   **`QuestionCard.tsx`**: Tampilan satu soal beserta pilihan gandanya.
*   **`QuizResult.tsx`**: Rapor nilai grafik skor setelah selesai.

### 6. `gamification/` (Fitur Game)
Komponen visual untuk level dan XP.
*   **`XPBar.tsx`**: Progress bar warna-warni penunjuk level.
*   **`BadgeList.tsx`**: Grid galeri lencana.
*   **`LevelUpModal.tsx`**: Pop-up animasi heboh saat user naik level.

### 7. `admin/` (Fitur Admin)
Komponen dashboard pengelola.
*   **`AdminTable.tsx`**: Tabel data yang bisa di-sort dan filter.
*   **`StatusBadge.tsx`**: Label status khusus admin (Approved/Pending/Rejected).

## 📝 Aturan Penggunaan
1.  **Reusability**: Cek dulu folder `common`, kalau sudah ada komponennya, JANGAN bikin baru. Pakai yang ada.
2.  **Props**: Semua komponen menerima data lewat `props`. Cek tipe datanya (interface) di bagian atas file untuk tahu data apa yang dibutuhkan.
3.  **Client Component**: Sebagian besar komponen di sini punya interaksi (klik, hover), jadi biasanya diawali dengan `'use client'`.
