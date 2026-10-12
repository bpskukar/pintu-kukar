/* =====================================================================
   MONEV Kukar — pengaturan
   Menambah kegiatan baru: tambah satu objek di "kegiatan" (halaman
   monev akan menampilkan kartunya). Halaman kegiatan baru dibuat dengan
   menyalin cleaning-se2026.html.
   ===================================================================== */
window.MONEV_KONFIG = {
  kegiatan: [
    {
      id: "cleaning-se2026",
      judul: "Cleaning Data Anomali SE2026",
      ket: "Progres tindak lanjut verifikasi 1 sampai 10 per pegawai, dari spreadsheet tindak lanjut Kab/Kota.",
      url: "cleaning-se2026.html",
      ikon: "clipboard",
      warna: "#1C5AA3",
      status: "Berjalan"
    }
  ],

  /* ---------- Cleaning Data Anomali SE2026 ---------- */
  cleaning: {
    id: "cleaning-se2026",
    polaSheet: "^verif\\s*\\d",
    /* judul singkat tiap verifikasi (sumber: sheet "Keterangan Anomali") */
    judulVerif: {
      "1": "BKU berkode selain BKU",
      "1.1": "Non respon BKU → force submit BKU",
      "2": "Usaha keluarga belum ditambahkan (profesi)",
      "3": "Tautan OSS perorangan ke keluarga",
      "4": "KKD Pusat bukan kode 7 (UM) / 9 (UB)",
      "5": "Sampel Survei Konstruksi belum di SE2026",
      "6": "Perusahaan Disnaker belum di SE2026",
      "7": "Kesesuaian KBLI kategori B, C, U",
      "8": "Ketidakwajaran indikator ekonomi",
      "9": "Sampel IBS belum ada di FASIH",
      "10": "Sampel SHPB belum ada di FASIH"
    },
    /* cara menghitung "sudah dilakukan", ditampilkan di bagian Cara menghitung */
    aturanVerif: {
      "1": "Kolom K = Ya (status sudah sesuai), atau kolom L (sudah dilakukan tindak lanjut) dicentang.",
      "4": "Kolom K = Ya (status sudah sesuai), atau kolom L (sudah dilakukan tindak lanjut) dicentang.",
      "1.1": "Kolom Tindak Lanjut Kab/Kota terisi selain \"Belum dilakukan\".",
      "5": "Kolom Tindak Lanjut oleh Kab/Kota terisi selain \"Belum dilakukan\".",
      "6": "Kolom Tindak Lanjut oleh Kab/Kota terisi selain \"Belum dilakukan\".",
      "9": "Kolom Tindak Lanjut oleh Kab/Kota terisi selain \"Belum dilakukan\".",
      "10": "Kolom Tindak Lanjut Kab/Kota terisi selain \"Belum dilakukan\".",
      "2": "Status Tindak Lanjut = Sudah Diperbaiki atau Sudah Sesuai.",
      "3": "Status Tindak Lanjut = Sudah Diperbaiki atau Sudah Sesuai.",
      "7": "Status Tindak Lanjut = Sudah Diperbaiki atau Sudah Sesuai.",
      "8": "Status Tindak Lanjut = Sudah Diperbaiki atau Sudah Sesuai."
    },
    /* nama panggilan di spreadsheet → nama lengkap pegawai.
       Nama yang merupakan awal kata dari satu nama lengkap (mis. "Tiara", "Nugroho Dwi P")
       sudah dicocokkan otomatis; yang di bawah ini untuk ejaan berbeda. */
    alias: {
      "fadila": "Fadilla Zahra Amalia, A.Md.Stat.",
      "fani": "Fania Pratiwi, SST",
      "okti": "Oktia Shafira, A.Md.Stat."
    },
    kosong: "(Belum ditugaskan)",
    /* halaman yang sedang dibuka memeriksa data baru tiap sekian detik (minimal 30) */
    pantauDetik: 120
  }
};
