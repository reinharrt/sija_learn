# 🎮 Gamification Components (Fitur Game)

Folder ini berisi elemen-elemen visual yang membuat user merasa seperti main game RPG.

## 📂 Dokumentasi File

### `XPProgressBar.tsx`
*   **Fungsi**: Batang panjang yang terisi warna sesuai XP.
*   **Tampilan**: "Level 5 [=====----] Level 6". Menunjukkan seberapa jauh lagi naik level.

### `LevelBadge.tsx`
*   **Fungsi**: Ikon kecil penunjuk level. Biasanya angka di dalam lingkaran atau perisai.
*   **Penggunaan**: Di sebelah nama user di komentar atau leaderboard.

### `BadgeGrid.tsx` & `BadgeCard.tsx`
*   **Fungsi Grid**: Rak lemari yang menampilkan BANYAK badge sekaligus.
*   **Fungsi Card**: Tampilan SATU badge secara detail (Gambar besar + Nama + Deskripsi "Dapat dari mana").
*   **Visual**: Badge yang belum didapat biasanya warnanya jadi hitam putih (Greyscale).

### `LeaderboardTable.tsx`
*   **Fungsi**: Tabel peringkat user.
*   **Fitur**: Menandai user dengan warna emas (Juara 1), perak (2), perunggu (3).

### `LevelUpModal.tsx`
*   **Fungsi**: Jendela pop-up "CONGRATULATIONS!" yang muncul tiba-tiba saat user naik level.
*   **Efek**: Biasanya ada animasi confetti atau suara ting-tung.

### `RewardToast.tsx`
*   **Fungsi**: Notifikasi kecil melayang di pojok layar. "Kamu dapat +10 XP!".
*   **Tujuan**: Memberi feedback instan setiap kali user baca artikel.
