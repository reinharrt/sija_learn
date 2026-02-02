# ⚙️ Core System Logic (Logika Inti Sistem)

Dokumen ini menjelaskan bagaimana fitur-fitur rumit di "Sistem Otak" aplikasi bekerja. Baca ini untuk memahami alur data yang tidak terlihat di layar.

---

## 1. 🔐 Authentication Flow (Sistem Login)

Kita menggunakan **JWT (JSON Web Token)** tanpa session database. Artinya: Server tidak mencatat "Siapa yang sedang online" di RAM, tapi memberi "KTP Sementara" (Token) ke user.

### Alur Kerja:
1.  **Login**:
    *   User kirim Email & Password.
    *   Server cek di DB.
    *   Jika benar, Server membuat **Token** berisi: `{ id, role, email }`.
    *   Token ditandatangani dengan `JWT_SECRET` (rahasia dapur).
    *   Token dikirim ke Browser dan disimpan di **Cookies**.

2.  **Request Data** (Misal: Buka Profil):
    *   Setiap kali Browser minta data, dia menyisipkan Token di amplop request.
    *   **Middleware** (Satpam) mencegat request.
    *   Satpam mengecek tanda tangan Token. Asli atau Palsu? Kadaluarsa tidak?
    *   Jika valid, request diteruskan.

3.  **Role Protection** (Hak Akses):
    *   Di dalam halaman Admin, ada pengecekan ganda: `if (token.role !== 'admin') throw Error`.
    *   Ini memastikan siswa biasa tidak bisa menembus halaman guru meskipun punya token valid.

---

## 2. 📈 Progress Tracking System (Pelacakan Belajar)

Bagaimana sistem tahu user sudah baca Bab 1 tapi belum baca Bab 2?

### Struktur Data:
Kita tidak menggunakan check-list sederhana array `[true, false]`. Kita menggunakan model **Enrollment**.

*   SATU **Enrollment** mewakili SATU User di SATU Course.
*   Di dalam Enrollment, ada field `completedLessons` berisi array ID Lesson yang sudah selesai `['lesson_A_id', 'lesson_B_id']`.
*   Ada juga `progress` (angka 0-100%).

### Alur Update:
1.  User klik **"Mark as Complete"** di materi `lesson_A`.
2.  API `/enrollments/[courseId]/progress` dipanggil.
3.  Server memasukkan `lesson_A` ke array `completedLessons` (jika belum ada).
4.  **Hitung Ulang**:
    *   `Total Lessons` = 10. `Completed` = 5.
    *   `Progress` = 50%.
5.  Server update angka progress di DB.
6.  **Cek Selesai**:
    *   Jika progress sudah 100%, server menandai `completedAt = Now`.
    *   **Bonus**: Trigger fungsi Gamifikasi "Course Completion" (+500 XP).

---

## 3. 🧠 Quiz Assignment Logic (Logika Kuis)

Kuis di sistem ini bersifat fleksibel (Reusable). Satu soal kuis bisa dipakai di mana saja.

### Relasi Data:
*   **Quiz** berdiri sendiri (Bank Soal).
*   **Course** atau **Article** "meminjam" kuis dengan menyimpan `quizId`.

### Alur Pengerjaan:
1.  **Assign**: Admin mengaitkan Kuis Matematika (ID: 101) ke Bab 1.
2.  **Start**: Saat siswa buka Bab 1 dan klik "Mulai Kuis", sistem mengambil soal dari Kuis 101.
3.  **Submit**:
    *   Jawaban siswa dinilai satu per satu.
    *   Hasilnya disimpan di model baru bernama **QuizAttempt**.
    *   Ini membuat user bisa mengerjakan berkali-kali, dan kita punya sejarah nilai (Percobaan 1: 50, Percobaan 2: 90).

### Syarat Lulus (Passing Grade):
*   Setiap kuis punya `minScore` (KKM).
*   Jika `score >= minScore`, status `passed = true`.
*   Status `passed` ini menjadi kunci untuk membuka gembok bab selanjutnya jika fitur "Prerequisite" diaktifkan.

---

## 4. 🎮 Context vs Database (Manajemen Data)

Kapan data disimpan di Context (Browser) vs Database (Server)?

### Context (AuthContext & GamificationContext)
*   Menyimpan data yang **sering dilihat** user (Nama, Avatar, Level bar).
*   Di-load **sekali** saat web dibuka.
*   Di-refresh hanya jika ada kejadian penting (Naik Level, Update Profil).
*   Tujuannya: Biar web terasa cepat, gak loading terus tiap pindah halaman.

### Database
*   Menyimpan **Kebenaran Mutlak**.
*   Login, Register, Submit Kuis, dan Update Progress **WAJIB** lapor ke Database.
*   Context hanyalah "Bayangan" dari data Database. Jika internet putus, Context mungkin tidak akurat, tapi Database selalu benar.

---

## 5. 🏆 Gamification Logic (XP & Level)

*   **XP Calculator**: Kenaikan level tidak linear (Garis lurus).
    *   Level 1 -> 2 butuh 100 XP.
    *   Level 9 -> 10 mungkin butuh 1000 XP.
    *   Rumus ada di `src/lib/xp-calculator.ts`.
*   **Trigger**:
    *   Baca Artikel: +10 XP (Debounced, dijaga timer biar gak spam).
    *   Kuis Lulus: +50 XP.
    *   Course Selesai: +500 XP.
