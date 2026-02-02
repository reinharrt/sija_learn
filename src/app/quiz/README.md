# 🧠 Quiz (Sistem Ujian & Evaluasi)

Folder ini menangani semua tampilan dan logika saat siswa sedang mengerjakan soal ujian atau kuis latihan.

## 🌟 Fungsi Utama
Bagian ini adalah "ruang ujian" digital.
1.  **Pengerjaan Soal**: Tampilan soal pilihan ganda dengan timer.
2.  **Penilaian Otomatis**: Menghitung skor langsung setelah selesai.
3.  **Riwayat Nilai**: Menyimpan sejarah berapa kali siswa mencoba dan nilainya.
4.  **Review**: Memperlihatkan mana jawaban benar dan salah (jika diizinkan).

## 🔄 Alur Pengguna (User Flow)

### 1. Persiapan
1.  User masuk ke halaman awal kuis (biasanya dari halaman Course).
2.  User melihat info: Jumlah soal, Durasi waktu, dan KKM (Nilai minimal).
3.  User klik **"Mulai Quiz"**.

### 2. Pengerjaan
1.  Soal muncul satu per satu atau langsung semua (tergantung desain).
2.  User memilih jawaban A, B, C, D, atau E.
3.  User bisa melewati soal ragu-ragu dan kembali lagi nanti.
4.  Jika waktu habis, jawaban tersimpan otomatis.

### 3. Hasil
1.  Setelah klik "Submit", user diarahkan ke halaman **Result**.
2.  Muncul Skor (misal: 80/100) dan status (Lulus/Gagal).
3.  Jika lulus, user dapat XP dan mungkin membuka bab materi selanjutnya.
4.  Jika gagal, user mungkin harus menunggu sebelum bisa mencoba lagi (Cooldown).

## ⚠️ Aturan Penting

*   **Timer Berjalan**: Waktu terus berjalan meskipun user menutup browser/tab (server-side tracking).
*   **Anti-Curang**: Sistem didesain simpel, tapi logikanya ada di server untuk mencegah user memanipulasi nilai dari browser.
*   **Sistem Percobaan**: Guru bisa mengatur user boleh mencoba berapa kali.

## 📝 Catatan untuk Tim
*   Kuis ini datanya terpisah dari Course, tapi biasanya dihubungkan lewat ID. Jadi satu kuis bisa dipakai di beberapa course kalau perlu.
*   Hati-hati mengubah logika penilaian di file `[id]/result/page.tsx` atau API-nya, pastikan hitungannya selalu akurat.
