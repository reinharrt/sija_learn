# 🎓 Courses API Routes

Folder ini menangani data Kursus & Kurikulum. Ingat, API ini mengurus DATA MENTAH kursus, bukan progress siswa (itu di folder `enrollments`).

---

## 📂 Sub-Routes Documentation

### 1. `route.ts` (Katalog)
*   **Method**: `GET`
    *   **Fungsi**: Ambil semua daftar kursus.
    *   **Fitur**: Bisa difilter `?category=programming` atau `?search=react`.
*   **Method**: `POST` (Admin)
    *   **Fungsi**: Bikin kursus baru (Draft).

### 2. `[id]/route.ts` (Detail Kursus)
*   **Method**: `GET`
    *   **Fungsi**: Ambil seluruh isi kursus (Judul, Deskripsi, Daftar Bab, Daftar Materi).
    *   **Penting**: Jika user belum login, kunci jawaban kuis atau link download materi mungkin disembunyikan.
*   **Method**: `PUT` (Admin)
    *   **Fungsi**: Update info kursus atau susunan bab.
*   **Method**: `DELETE` (Admin)
    *   **Fungsi**: Hapus kursus selamanya.

### 3. `[id]/quiz-status`
*   **Path**: `/api/courses/[id]/quiz-status/route.ts`
*   **Method**: `GET`
*   **Fungsi**: Pengecekan Syarat Lulus.
*   **Logika**: API ini mengecek "Apakah user X sudah lulus semua kuis yang wajib di course ini?".
*   **Output**: `{ allPassed: true/false, failedQuizzes: [...] }`.

### 4. `[id]/quizzes`
*   **Path**: `/api/courses/[id]/quizzes/route.ts`
*   **Method**: `GET`
*   **Fungsi**: Mengambil daftar ID kuis yang terhubung ke course ini.

---

## 🔗 Hubungan Data
*   **Course** memiliki banyak **Chapter**.
*   **Chapter** memiliki banyak **Lesson**.
*   **Lesson** bisa berupa Teks, Video, atau Kuis.
API ini merangkai semua potongan itu menjadi satu objek JSON yang rapi saat di-`GET`.
