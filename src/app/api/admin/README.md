# 👮 Admin API Routes

Folder ini berisi endpoint-endpoint krusial yang **HANYA** boleh diakses oleh pengguna dengan role `ADMIN` atau `COURSE_ADMIN`.
Middleware otomatis memblokir akses jika user biasa mencoba membuka URL ini.

---

## 📂 Sub-Routes Documentation

### 1. `init-view-tracking` (System Maintenance)
*   **Path**: `/api/admin/init-view-tracking/route.ts`
*   **Method**: `GET`
*   **Fungsi**: Script perbaikan data (Utility).
*   **Penjelasan**: Kadang data jumlah pembaca (view count) di database bisa tidak sinkron atau hilang. Endpoint ini memaksa sistem untuk membuat ulang data tracking awal untuk semua artikel/course yang belum punya tracker.
*   **Kapan Dipanggil?**: Biasanya dipanggil manual oleh developer saat setup awal server atau migrasi data.

### 2. `quizzes/create` (Pembuatan Kuis)
*   **Path**: `/api/admin/quizzes/create/route.ts`
*   **Method**: `POST`
*   **Fungsi**: Membuat Bank Soal baru.
*   **Data Input**: Judul Kuis, Deskripsi, KKM (Minimum Score), dan Daftar Pertanyaan + Jawaban Benar.
*   **Note**: Kuis yang dibuat di sini belum nempel ke Course manapun ("Kuis Yatim Piatu") sampai di-assign.

### 3. `quizzes/[id]` (Manajemen Kuis Spesifik)
*   **Path**: `/api/admin/quizzes/[id]/route.ts`
*   **Method**: `GET` (Ambil kunci jawaban), `PUT` (Edit soal), `DELETE` (Hapus kuis).
*   **Fungsi**: Edit total kuis. Misal guru salah ketik soal atau salah kunci jawaban.

### 4. `quizzes/[id]/assign` (Penugasan Kuis)
*   **Path**: `/api/admin/quizzes/[id]/assign/route.ts`
*   **Method**: `POST`
*   **Fungsi**: Menempelkan Kuis ke Materi.
*   **Logika**: "Kuis Matematika (ID: 101) sekarang jadi ujian untuk Bab 1 (Lesson ID: 55)".
*   **Input**: `{ resourceType: 'course' | 'article', resourceId: '...' }`

### 5. `quizzes/[id]/analytics` (Analisa Nilai)
*   **Path**: `/api/admin/quizzes/[id]/analytics/route.ts`
*   **Method**: `GET`
*   **Fungsi**: Laporan Guru.
*   **Output**: "Berapa siswa yang lulus?", "Berapa rata-rata nilai kelas?", "Siapa siswa dengan nilai terendah?".

### 6. `courses/[id]/articles` (Manajemen Materi Bacaan)
*   **Path**: `/api/admin/courses/[id]/articles/route.ts`
*   **Method**: `POST`
*   **Fungsi**: Menambahkan artikel yang sudah ada ke dalam Course sebagai materi pelajaran.
*   **Logika**: Reuse Content. Artikel "Sejarah Linux" di perpustakaan bisa dicomot jadi "Bab 1: Pengenalan Linux" di dalam Course.

### 7. `courses/[id]/quizzes` (Manajemen Kuis Course)
*   **Path**: `/api/admin/courses/[id]/quizzes/route.ts`
*   **Method**: `POST`, `DELETE` (Unassign)
*   **Fungsi**: Mengatur kuis apa saja yang ada di dalam course ini. Bisa untuk mencopot kuis yang salah tempel.

---

## ⚠️ Developer Notes
*   **Keamanan**: Semua route di sini diawali dengan pengecekan `session.user.role === 'ADMIN'`. Jangan pernah menghapus blok kode `if (!isAdmin) return 403` di file-file ini.
*   **Destructive**: Endpoint `DELETE` di sini benar-benar menghapus data dari MongoDB. Hati-hati.
