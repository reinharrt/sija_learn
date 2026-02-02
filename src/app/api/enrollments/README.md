# 📚 Enrollments API Routes (Progres Belajar)

Folder ini adalah **Jembatan** antara Siswa (User) dan Materi (Course).
Di sinilah data "Siswa A sudah sampai halaman berapa" disimpan.

---

## 📂 Sub-Routes Documentation

### 1. `route.ts` (Daftar & Cek)
*   **Method**: `GET`
    *   **Fungsi**: "Saya sedang ikut kursus apa saja?". Mengambil daftar kursus aktif user login.
*   **Method**: `POST`
    *   **Fungsi**: Tombol "Enroll Now". Mendaftarkan diri ke kursus baru.
    *   **Cek**: Kalau sudah daftar, jangan daftar dua kali (Return existing).

### 2. `[courseId]/route.ts` (Detail Progres)
*   **Method**: `GET`
    *   **Fungsi**: Mengambil detail status belajar di satu kursus spesifik.
    *   **Output**: `{ completedLessons: ['lesson1', 'lesson2'], progress: 35% }`.

### 3. `[courseId]/progress` (Update Materi)
*   **Path**: `/api/enrollments/[courseId]/progress/route.ts`
*   **Method**: `POST`
*   **Fungsi**: Menandai materi selesai.
*   **Logika PINTAR**:
    1.  Terima ID materi (`lessonId`).
    2.  Tambahkan ke list `completedLessons`.
    3.  Hitung ulang total progress `(jumlah_selesai / total_materi) * 100`.
    4.  Update angka di database.
    5.  Jika 100%, tandai `completedAt` (Lulus).

---

## ⚠️ Logika Bisnis
*   Data di sini bersifat **Privat**. User A tidak bisa mengintip progress User B lewat API ini (terproteksi `auth.ts`).
*   Penghapusan Enrollment (Un-enroll) jarang dilakukan agar history belajar siswa tidak hilang.
