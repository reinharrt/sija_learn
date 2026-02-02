# 🔌 REST API Documentation

Dokumen ini berisi daftar lengkap endpoint API yang tersedia di aplikasi SIJA Learn.
API ini digunakan oleh Frontend (React Components) untuk mengambil dan mengirim data ke Server.

---

## 🔐 Authentication & Users

### 1. Login
*   **Path**: `/api/auth/login`
*   **Method**: `POST`
*   **Tujuan**: Memverifikasi email/password dan membuat sesi login (JWT).
*   **Dipanggil Saat**: User klik tombol "Masuk" di halaman Login.
*   **Data Input**: `{ email, password }`
*   **Data Output**: `{ user, token }` atau Error.

### 2. Register
*   **Path**: `/api/auth/register`
*   **Method**: `POST`
*   **Tujuan**: Mendaftarkan akun siswa baru.
*   **Dipanggil Saat**: User submit form di halaman Daftar.
*   **Data Input**: `{ name, username, email, password }`
*   **Data Output**: `{ message: "OTP sent" }`

### 3. Verify Email
*   **Path**: `/api/auth/verify-email`
*   **Method**: `POST`
*   **Tujuan**: Memvalidasi kode OTP yang dikirim ke email.
*   **Dipanggil Saat**: User memasukkan 6 digit kode OTP.
*   **Data Input**: `{ email, otp }`

### 4. Change Password (Request OTP)
*   **Path**: `/api/auth/change-password/request-otp`
*   **Method**: `POST`
*   **Tujuan**: Minta kode OTP untuk ganti password (lupa password).
*   **Dipanggil Saat**: User klik "Lupa Password" dan masukin email.

### 5. Change Password (Verify OTP)
*   **Path**: `/api/auth/change-password/verify-otp`
*   **Method**: `POST`
*   **Tujuan**: Cek OTP + Ganti Password Baru.
*   **Data Input**: `{ email, otp, newPassword }`

### 6. Get Current User (Me)
*   **Path**: `/api/auth/me` (Biasanya pakai `/api/users/[id]` atau context)
*   **Tujuan**: Mendapatkan profil user yang sedang login dari Token yang dikirim.
*   **Catatan**: Sering digantikan oleh decode token di sisi client.

---

## 📝 Articles (Artikel)

### 7. Get All Articles
*   **Path**: `/api/articles`
*   **Method**: `GET`
*   **Tujuan**: Mengambil daftar artikel (mendukung filter search & category).
*   **Dipanggil Saat**: Halaman `/articles` dibuka.
*   **Output**: Array object Artikel.

### 8. Create Article
*   **Path**: `/api/articles`
*   **Method**: `POST`
*   **Tujuan**: Penulis mengirim artikel baru.
*   **Dipanggil Saat**: Writer klik "Publish" di halaman editor.

### 9. Get One Article / Update / Delete
*   **Path**: `/api/articles/[slug]`
*   **Method**: `GET`, `PUT`, `DELETE`
*   **Tujuan**:
    *   `GET`: Baca detail artikel.
    *   `PUT`: Update isi artikel (oleh penulis/admin).
    *   `DELETE`: Hapus artikel.
*   **Data Input (PUT)**: `{ title, content, ... }`

### 10. Comments
*   **Path**: `/api/comments`
*   **Method**: `GET`, `POST`
*   **Tujuan**: Mengambil komentar artikel atau memposting komentar baru.
*   **Data Input (POST)**: `{ articleId, content }`

---

## 🎓 Courses & Enrollments (Kursus)

### 11. Get Courses
*   **Path**: `/api/courses`
*   **Method**: `GET`, `POST` (Create - Admin only)
*   **Tujuan**: List katalog kursus.

### 12. Course Detail
*   **Path**: `/api/courses/[id]`
*   **Method**: `GET`, `PUT`, `DELETE`
*   **Tujuan**: Mengelola satu data kursus spesifik (termasuk bab dan materinya).

### 13. Enroll Course (Daftar)
*   **Path**: `/api/enrollments` (atau `/api/enrollments/[courseId]`)
*   **Method**: `POST`
*   **Tujuan**: Mencatat bahwa User X mulai belajar Course Y.
*   **Dipanggil Saat**: Klik tombol "Ikuti Kursus".

### 14. Update Learning Progress
*   **Path**: `/api/enrollments/[courseId]/progress`
*   **Method**: `POST`
*   **Tujuan**: Menandai materi (lesson) tertentu sudah selesai dibaca.
*   **Dipanggil Saat**: Klik "Mark as Complete" atau "Next Lesson".
*   **Data Input**: `{ lessonId, completed: true }`

### 15. Check Quiz Status in Course
*   **Path**: `/api/courses/[id]/quiz-status`
*   **Method**: `GET`
*   **Tujuan**: Cek apakah user sudah lulus kuis di course ini? (Syarat untuk tombol "Ambil Sertifikat").

---

## 🧠 Quiz & Assessments

### 16. Get Quiz Detail
*   **Path**: `/api/quizzes/[id]`
*   **Method**: `GET`
*   **Tujuan**: Mengambil soal-soal kuis (tanpa kunci jawaban di sisi client).
*   **Dipanggil Saat**: Masuk halaman ujian.

### 17. Submit Quiz Answers
*   **Path**: `/api/quizzes/[id]/submit`
*   **Method**: `POST`
*   **Tujuan**: Mengirim jawaban user -> Server menilai -> Simpan Nilai -> Return Skor.
*   **Dipanggil Saat**: Klik tombol "Submit Jawaban".
*   **Data Input**: `{ answers: { q1: 'A', q2: 'B', ... } }`
*   **Data Output**: `{ score: 80, passed: true }`

### 18. Get My Attempts
*   **Path**: `/api/quizzes/[id]/attempts`
*   **Method**: `GET`
*   **Tujuan**: Melihat riwayat "Saya sudah coba kuis ini berapa kali?".

### 19. Review Quiz
*   **Path**: `/api/quiz/[id]/review`
*   **Method**: `GET`
*   **Tujuan**: Melihat pembahasan soal (mana yang benar/salah) setelah ujian selesai.

---

## 🎮 Gamification (Sistem Game)

### 20. Get Leaderboard
*   **Path**: `/api/gamification/leaderboard`
*   **Method**: `GET`
*   **Tujuan**: Top 50 User dengan XP tertinggi.

### 21. Get User Progress (XP & Level)
*   **Path**: `/api/gamification/progress/[userId]`
*   **Method**: `GET`
*   **Tujuan**: Data level user untuk ditampilkan di Header/Profil.

### 22. Get Badges
*   **Path**: `/api/gamification/badges/[userId]`
*   **Method**: `GET`
*   **Tujuan**: Koleksi lencana yang dimiliki user.

### 23. Add XP (Manual/Event)
*   **Path**: `/api/gamification/progress`
*   **Method**: `POST`
*   **Tujuan**: Trigger tambah XP (misal: "User baru saja membaca artikel").
*   **System Only**: Biasanya dipanggil otomatis oleh sistem lain, bukan user langsung.

---

## 👮 Admin & Management

### 24. Manage Users
*   **Path**: `/api/users`
*   **Method**: `GET` (List all), `DELETE` (Hapus user).

### 25. Ban User
*   **Path**: `/api/users/[id]/ban` (implied in `users/[id]`)
*   **Tujuan**: Memblokir akses user nakal.

### 26. Manage Tags
*   **Path**: `/api/tags`
*   **Method**: `GET`, `POST`, `DELETE`
*   **Tujuan**: Mengelola label kategori artikel.

### 27. Quiz Analytics
*   **Path**: `/api/admin/quizzes/[id]/analytics`
*   **Tujuan**: Laporan "Soal mana yang paling susah?" (Banyak user salah jawab).

### 28. Assign Quiz
*   **Path**: `/api/admin/quizzes/[id]/assign`
*   **Tujuan**: Menghubungkan Kuis dengan Artikel atau Course tertentu.

---

## ☁️ Lain-lain

### 29. Upload Image
*   **Path**: `/api/upload`
*   **Method**: `POST`
*   **Tujuan**: Mengupload file gambar ke server.
*   **Dipanggil Saat**: Ganti foto profil atau insert gambar di editor artikel.

### 30. Init View Tracking
*   **Path**: `/api/admin/init-view-tracking`
*   **Tujuan**: Script perbaikan data view count (Maintenance).
