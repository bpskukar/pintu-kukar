# PINTU Kukar — Pencarian Internal Terpadu

Mesin pencari berkas Google Drive untuk pegawai **BPS Kabupaten Kutai Kartanegara**.
Nama semua berkas dan folder di Drive kantor didaftar otomatis, lalu dicari langsung di
browser, jadi hasil muncul saat pegawai mengetik.

> Saudara internal dari **PINTAR Kukar** (layanan publik): PINTAR untuk masyarakat, PINTU untuk pegawai.

## Fitur

| Fitur | Keterangan |
|---|---|
| Pencarian instan | Nama berkas + nama folder, urutan kata bebas, cukup awal kata (`lap sak` → *Laporan Sakernas*), sorotan kata yang cocok. |
| Saringan | Jenis berkas, waktu diubah, kategori tim. Pilih hasil dengan panah dan buka dengan Enter; tekan `/` untuk langsung mengetik. |
| Cari di isi dokumen | Memakai pencarian teks penuh Google Drive (Docs, Sheets, Slides, PDF, Office). |
| Jelajah folder | Semua folder bisa dibuka di PINTU, dengan saringan isi folder beserta subfoldernya. |
| Kategori tim | Buat, ubah, hapus, urutkan; masing-masing punya folder Drive dan **link tujuan** yang bisa diedit. Kategori terhapus bisa dipulihkan 30 hari. |
| Berkas terbaru | Baru diubah / baru ditambahkan, dikelompokkan per hari, dengan saringan rentang, jenis, dan kategori. |
| Label & kata kunci | Pengelola menambah kata kunci (istilah lain), label, dan catatan pada berkas atau folder. |
| Akun pegawai | Login diperiksa di server. Tiga peran: pengguna, pengelola, admin. Admin mengelola akun dari website. |
| Otomatis | Daftar berkas diperbarui setiap 15 menit dan didaftar ulang penuh setiap malam pukul 02.00 WITA. |
| Pasang di HP | Bisa dipasang seperti aplikasi (PWA). |

## Cara kerja singkat

```
Google Drive kantor ──(Drive API)──► Apps Script (Gmail kantor)
                                      ├─ daftar berkas (gzip, di folder sistem)
                                      ├─ spreadsheet database (akun, kategori, label, riwayat)
                                      └─ Web App /exec ◄── website (GitHub Pages)
                                                             └─ daftar berkas disimpan di browser (IndexedDB)
```

Website hanya mengunduh **perubahan** sejak kunjungan terakhir, bukan daftar lengkap setiap kali.

## Pemasangan

### 1. Apps Script (di Gmail kantor)
1. Login ke Gmail kantor → buka <https://script.google.com> → **Proyek baru**. Ganti nama proyek menjadi `PINTU Kukar`.
2. Hapus isi `Kode.gs`, tempel isi `apps-script/Kode.gs`, lalu **Simpan**.
3. Di bilah atas pilih fungsi **`pasang`** → **Jalankan** → **Tinjau izin** → pilih Gmail kantor → **Lanjutan** → **Buka PINTU Kukar** → centang **semua** izin → **Izinkan**.
   Fungsi ini membuat folder `PINTU Kukar – Sistem (jangan dihapus)` berisi spreadsheet database, memasang jadwal otomatis, dan mulai mendaftar berkas.
   Kalau Drive sangat besar, pendaftaran dilanjutkan otomatis di latar belakang.
4. **Terapkan → Deployment baru** → ikon roda gigi → **Aplikasi web**.
   *Jalankan sebagai:* **Saya** · *Yang memiliki akses:* **Siapa saja** → **Terapkan** → salin URL yang berakhiran `/exec`.

### 2. Website (GitHub `bpskukar`)
1. Buat repositori baru `pintu-kukar` di akun/organisasi **bpskukar** (Public).
2. **Add file → Upload files** → seret semua isi folder PINTU (index.html, sw.js, manifest.webmanifest, folder `assets`, `apps-script`) → **Commit changes**.
3. Buka `assets/js/config.js` → ikon pensil → isi `backend: "…/exec"` dengan URL dari langkah 1.4 → **Commit changes**.
4. **Settings → Pages** → *Source:* **Deploy from a branch** → *Branch:* `main` / `(root)` → **Save**.
   Setelah 1–2 menit, PINTU terbuka di `https://bpskukar.github.io/pintu-kukar/`.

### 3. Akun
1. Buka alamat PINTU → isi **Penyiapan pertama** untuk membuat akun **admin**.
2. Menu akun (kanan atas) → **Akun pegawai** → **Tambah akun** untuk setiap pegawai (nama, email/ID, peran, kata sandi awal).
3. Menu akun → **Pengaturan & daftar berkas** → tempel link folder yang **tidak boleh** ikut dicari (misalnya kepegawaian).

## Memperbarui
- **Website:** ganti file di GitHub → *Commit changes* → tunggu build hijau → buka PINTU dengan `Ctrl/Cmd + Shift + R`.
- **Apps Script:** tempel `Kode.gs` baru → Simpan → **Terapkan → Kelola deployment → ikon pensil → Versi: Versi baru → Terapkan**.
  Tanpa *Versi baru*, website tetap memakai kode lama.

## Keamanan
- Daftar berkas, kategori, dan label hanya dikirim ke pegawai yang sudah masuk. Akun diperiksa di Apps Script.
- Kata sandi tidak pernah dikirim atau disimpan. Browser membuat sidik PBKDF2 (150.000 putaran); server menyimpan SHA-256 dari sidik itu.
- Setelah 8 kali salah sandi, akun dikunci 15 menit.
- Folder sistem PINTU dan spreadsheet database tidak pernah ikut dicari.
- Izin membuka berkas tetap mengikuti Google Drive. PINTU tidak mengubah izin berbagi.
- Saat pegawai keluar, daftar berkas yang tersimpan di perangkat ikut dihapus.

## Batas
- Hingga ±250.000 berkas. Untuk 60.000 berkas, unduhan pertama sekitar 2 MB (terkompresi).
- Berkas di *Drive bersama* (Shared drive) tidak ikut; PINTU membaca *Drive Saya* dan *Dibagikan dengan saya* milik Gmail kantor.
- Berkas yang tidak bisa dibuka Gmail kantor tidak bisa ditemukan PINTU.

## Struktur
```
index.html              halaman utama + panduan
assets/css/style.css    tampilan (tema terang & gelap)
assets/js/config.js     alamat Apps Script & nama kantor  ← diisi saat pemasangan
assets/js/cari.js       mesin pencari di browser
assets/js/app.js        aplikasi
sw.js, manifest.webmanifest, assets/img/   aplikasi terpasang (PWA)
apps-script/Kode.gs     backend Google Apps Script
```
