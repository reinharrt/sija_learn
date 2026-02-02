# 🎮 Gamification API Routes

Folder ini berisi logika "Back-end" untuk sistem permainan (XP, Level, Badges).
API ini sering dipanggil secara otomatis (background) saat user melakukan aktivitas belajar.

---

## 📂 Sub-Routes Documentation

### 1. `progress` (Tambah XP)
*   **Path**: `/api/gamification/progress/route.ts`
*   **Method**: `POST`
*   **Fungsi**: Menambah XP user.
*   **Trigger**:
    *   User baca artikel > Client lapor ke sini.
    *   User lulus kuis > Server kuis lapor ke sini.
*   **Logika**:
    1.  Cek kapan terakhir user dapat XP (Anti-Spam).
    2.  Tambah XP ke database user.
    3.  Cek apa XP cukup untuk naik level? Kalau ya, update Level.

### 2. `badges/[userId]` (Koleksi Lencana)
*   **Path**: `/api/gamification/badges/[userId]/route.ts`
*   **Method**: `GET`
*   **Fungsi**: Mengambil daftar badge milik user tertentu.
*   **Output**: List badge ID dan tanggal didapatkannya.

### 3. `leaderboard` (Papan Peringkat)
*   **Path**: `/api/gamification/leaderboard/route.ts`
*   **Method**: `GET`
*   **Fungsi**: Mengambil Top 50 User.
*   **Query**: `?period=weekly` atau `?period=all_time`.
*   **Logika**: Sort User collection berdasarkan field `xp` secara descending (besar ke kecil).

### 4. `read-article` (XP Baca)
*   **Path**: `/api/gamification/read-article/route.ts`
*   **Method**: `POST`
*   **Fungsi**: Spesifik untuk event membaca artikel.
*   **Beda dengan `progress`**: Endpoint ini punya validasi tambahan khusus artikel (misal: cek durasi baca).

### 5. `stats` (Statistik Global)
*   **Path**: `/api/gamification/stats/route.ts`
*   **Method**: `GET`
*   **Fungsi**: Data untuk dashboard admin.
*   **Output**: "Total XP seluruh siswa hari ini", "Badge paling langka", dll.

### 6. `rank/[userId]` (Cek Ranking Sendiri)
*   **Path**: `/api/gamification/rank/[userId]/route.ts`
*   **Method**: `GET`
*   **Fungsi**: Mengetahui posisi user. "Saya ranking berapa dari 500 siswa?".
*   **Logika**: Hitung berapa orang yang XP-nya lebih tinggi dari user ini.

### 7. `sync` & `sync-progress` (Data Integrity)
*   **Path**: `/api/gamification/sync/...`
*   **Fungsi**: Kadang data di frontend (browser) beda sama database. API ini dipanggil untuk "Jabat Tangan" ulang biar datanya sama persis.

---

## ⚠️ Rules of Game
*   **Daily Cap**: Ada batasan maksimum XP per hari untuk mencegah siswa "gb" (bermain curang/berlebihan). Logic ini ada di file `xp-calculator.ts` yang dipanggil oleh API ini.
*   **Server Authority**: Client tidak boleh kirim "Saya mau level 100". Client cuma boleh kirim "Saya baru baca artikel A". Server yang menentukan poinnya.
