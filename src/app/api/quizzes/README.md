# 🧠 Quizzes API Routes (Pelaksanaan Ujian)

Folder ini menangani proses **PENGERJAAN** kuis oleh siswa.
(Bedakan dengan `api/admin/quizzes` yang menangani **PEMBUATAN** kuis).

---

## 📂 Sub-Routes Documentation

### 1. `[id]/route.ts` (Ambil Soal)
*   **Method**: `GET`
*   **Fungsi**: Mengambil data soal untuk ditampilkan di browser.
*   **KEAMANAN**: API ini secara otomatis **MEMBUANG** kunci jawaban (`isCorrect`) dari setiap opsi sebelum dikirim ke browser. Ini mencegah siswa curang dengan cara "Inspect Element" untuk melihat jawaban benar.

### 2. `[id]/submit` (Kirim Jawaban)
*   **Path**: `/api/quizzes/[id]/submit/route.ts`
*   **Method**: `POST`
*   **Fungsi**: Menilai pekerjaan siswa.
*   **Proses**:
    1.  Terima jawaban siswa `{ 1: 'A', 2: 'C' }`.
    2.  Ambil kunci jawaban asli dari Database (Server).
    3.  Bandingkan dan hitung Nilai.
    4.  Simpan hasil ke `QuizAttempt`.
    5.  Kembalikan Nilai ke siswa.

### 3. `[id]/attempts` (Riwayat)
*   **Method**: `GET`
*   **Fungsi**: Mengecek sejarah. "User ini sudah mencoba kuis ini berapa kali?".
*   **Penggunaan**: Untuk membatasi "Maksimal 3x percobaan".

---

## 🔒 Cheat Prevention
Logika penilaian 100% terjadi di Server (`submit` route). Browser hanya bertugas menampilkan soal dan mengirim pilihan user. Tidak ada kalkulasi nilai di sisi client yang bisa dimanipulasi.
