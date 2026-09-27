/* =====================================================================
   PINTU Kukar — Pencarian Internal Terpadu
   BPS Kabupaten Kutai Kartanegara
   ---------------------------------------------------------------------
   Backend Google Apps Script. Dijalankan oleh Gmail kantor yang memiliki
   Google Drive berkas-berkas kantor.

   PEMASANGAN (sekali saja)
   1. Login ke Gmail kantor → buka script.google.com → Proyek baru.
      Hapus isi Kode.gs bawaan, tempel seluruh file ini, lalu Simpan.
   2. Di bilah atas pilih fungsi  pasang  → Jalankan → Tinjau izin →
      pilih Gmail kantor → centang SEMUA izin → Izinkan.
      Fungsi ini membuat spreadsheet database, folder sistem, jadwal
      otomatis, lalu mulai mendaftar semua berkas di Drive.
   3. Terapkan → Deployment baru → jenis: Aplikasi web.
      Jalankan sebagai: Saya · Yang memiliki akses: Siapa saja → Terapkan.
      Salin URL yang berakhiran /exec.
   4. Tempel URL itu di file assets/js/config.js (backend) di GitHub.
   5. Buka situs PINTU → buat akun admin pertama.

   MEMPERBARUI KODE
   Tempel versi baru → Simpan → Terapkan → Kelola deployment → ikon pensil
   → Versi: Versi baru → Terapkan. (Tanpa "Versi baru", situs tetap
   memakai kode lama.)

   KEAMANAN
   - Semua data (daftar berkas, kategori, label) hanya dikirim ke pegawai
     yang sudah masuk. Akun diperiksa di sini, bukan di browser.
   - Kata sandi tidak pernah disimpan: yang tersimpan hanya sidik (hash).
   - Folder sistem PINTU dan spreadsheet database tidak ikut dicari.
   ===================================================================== */

var VERSI = 1;
var NAMA_APLIKASI = 'PINTU Kukar';
var SITUS_URL = 'https://bpskukar.github.io/pintu-kukar/';
var BATAS_ITEM = 250000;          // pengaman: jumlah berkas maksimum yang didaftar
var LOG_MAKS = 60;                // paket perubahan yang disimpan untuk sinkron cepat
var LOG_MAKS_ITEM = 20000;        // di atas ini, perangkat pegawai mengunduh daftar penuh
var MENIT_PERBARUI = 15;          // jadwal pembaruan daftar berkas
var JAM_BANGUN_ULANG = 2;         // pendaftaran ulang penuh setiap malam
var HARI_SAMPAH = 30;
var ZONA = 'Asia/Makassar';        // WITA — Kutai Kartanegara

var KOLOM = {
  Akun: ['id', 'nama', 'peran', 'kode', 'aktif', 'dibuat', 'masuk'],
  Kategori: ['id', 'nama', 'singkat', 'ikon', 'warna', 'deskripsi', 'folder', 'tautan', 'urutan'],
  Label: ['id', 'nama', 'kata', 'label', 'catatan', 'oleh', 'diubah'],
  Pengaturan: ['kunci', 'nilai'],
  Riwayat: ['waktu', 'oleh', 'aksi', 'keterangan'],
  Sampah: ['sid', 'waktu', 'oleh', 'jenis', 'judul', 'isi']
};
var PERAN = { pengguna: 1, pengelola: 2, admin: 3 };
var PENGATURAN_AWAL = {
  namaKantor: 'BPS Kabupaten Kutai Kartanegara',
  sertakanDibagikan: true,
  folderAbaikan: [],
  pintasan: []
};
var FIELD_BERKAS = 'id,name,mimeType,parents,modifiedTime,createdTime,size,trashed,shortcutDetails(targetId,targetMimeType)';

/* =====================================================================
   PEMASANGAN & JADWAL
   ===================================================================== */
function pasang() {
  var t0 = Date.now();
  siapkanDb_();
  folderSistem_();
  ['jadwalPerbarui', 'jadwalMalam', 'lanjutkan'].forEach(hapusPemicu_);
  ScriptApp.newTrigger('jadwalPerbarui').timeBased().everyMinutes(MENIT_PERBARUI).create();
  ScriptApp.newTrigger('jadwalMalam').timeBased().everyDays(1).atHour(JAM_BANGUN_ULANG).inTimezone(ZONA).create();
  props_().setProperty('DIPASANG', String(Date.now()));
  props_().deleteProperty('SEDANG');
  var r = denganIndeks_(function () { return bangunPenuh_(230000 - (Date.now() - t0), true); }) || { selesai: false, n: 0 };
  if (!r.selesai) jadwalkanLanjutan_();
  pesan_(r.selesai
    ? NAMA_APLIKASI + ' siap. ' + r.jumlah + ' berkas & folder sudah terdaftar. Lanjutkan ke langkah Terapkan → Deployment baru.'
    : NAMA_APLIKASI + ' terpasang. Pendaftaran berkas masih berjalan (' + r.n + ' sejauh ini) dan akan dilanjutkan otomatis dalam beberapa menit. Sambil menunggu, lanjutkan ke langkah Terapkan → Deployment baru.');
}

/* Tiap 15 menit: lanjutkan pendaftaran penuh bila belum selesai, atau ambil perubahan terbaru. */
function jadwalPerbarui() {
  try {
    denganIndeks_(function () {
      if (props_().getProperty('BANGUN')) { var r = bangunPenuh_(270000, false); if (!r.selesai) jadwalkanLanjutan_(); return; }
      perbarui_(240000);
    });
  } catch (e) { catatGalat_(e); }
}

/* Setiap malam: daftar ulang semua berkas (membereskan hal yang terlewat oleh pembaruan cepat). */
function jadwalMalam() {
  try {
    denganIndeks_(function () { var r = bangunPenuh_(270000, true); if (!r.selesai) jadwalkanLanjutan_(); });
  } catch (e) { catatGalat_(e); }
}

function lanjutkan() {
  hapusPemicu_('lanjutkan');
  try {
    denganIndeks_(function () {
      if (props_().getProperty('BANGUN')) { var r = bangunPenuh_(270000, false); if (!r.selesai) jadwalkanLanjutan_(); }
    });
  } catch (e) { catatGalat_(e); }
}

/* Hanya satu proses pendaftaran berkas yang boleh berjalan pada satu waktu. */
function denganIndeks_(fn) {
  var p = props_(), lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    var s = +(p.getProperty('SEDANG') || 0);
    if (s && Date.now() - s < 420000) return null;
    p.setProperty('SEDANG', String(Date.now()));
  } finally { lock.releaseLock(); }
  try {
    var hasil = fn();
    var bendera = p.getProperty('PERLU_TERAPKAN');
    if (bendera && !p.getProperty('BANGUN')) {
      var st = bacaState_();
      if (st) terapkan_(st, 'Pengaturan cakupan diubah');
      if (p.getProperty('PERLU_TERAPKAN') === bendera) p.deleteProperty('PERLU_TERAPKAN');
    }
    return hasil;
  } finally { p.deleteProperty('SEDANG'); }
}

function jadwalkanLanjutan_() {
  var ada = ScriptApp.getProjectTriggers().some(function (t) { return t.getHandlerFunction() === 'lanjutkan'; });
  if (!ada) ScriptApp.newTrigger('lanjutkan').timeBased().after(60 * 1000).create();
}

function hapusPemicu_(nama) {
  ScriptApp.getProjectTriggers().forEach(function (t) { if (t.getHandlerFunction() === nama) ScriptApp.deleteTrigger(t); });
}

/* =====================================================================
   PINTU MASUK WEB
   ===================================================================== */
function doGet() {
  return json_(statusPublik_());
}

function doPost(e) {
  var b;
  try { b = JSON.parse((e && e.postData && e.postData.contents) || '{}'); }
  catch (err) { return json_({ ok: false, pesan: 'Permintaan tidak bisa dibaca.' }); }
  try {
    switch (b.aksi) {
      case 'status': return json_(statusPublik_());
      case 'buatAdmin': return json_(buatAdmin_(b));
      case 'masuk': return json_(masuk_(b));
    }
    var u = autentikasi_(b);
    switch (b.aksi) {
      case 'data': return json_(dataAwal_(u));
      case 'indeks': return teksJson_(ambilIndeks_(+b.dari || 0));
      case 'cariIsi': return json_(cariIsi_(b.q));
      case 'gantiSandi': return json_(gantiSandi_(u, b));
      case 'perbarui': return json_(perbaruiDariWeb_(u));
    }
    wajibPeran_(u, 'pengelola');
    if (b.aksi === 'riwayat') return json_(bacaRiwayat_(u));
    if (/^(akun|simpanAkun|hapusAkun|simpanPengaturan|bangunUlang)$/.test(b.aksi)) wajibPeran_(u, 'admin');
    if (b.aksi === 'akun') return json_({ ok: true, akun: daftarAkun_() });
    if (b.aksi === 'bangunUlang') return json_(bangunDariWeb_(u));
    return json_(denganKunci_(function () {
      ubah_(b, u);
      return { ok: true, data: dataAwal_(u) };
    }));
  } catch (err) {
    var p = pesanGalat_(err);
    return json_({ ok: false, pesan: p, kode: err && err.kode ? err.kode : undefined });
  }
}

function statusPublik_() {
  var dbAda = !!props_().getProperty('DB_ID');
  var adaAkun = false;
  if (dbAda) { try { adaAkun = baca_('Akun').some(function (a) { return a.aktif; }); } catch (e) { adaAkun = false; } }
  return { ok: true, aplikasi: NAMA_APLIKASI, versi: VERSI, terpasang: dbAda, adaAkun: adaAkun };
}

/* =====================================================================
   AKUN & MASUK
   Browser mengirim  t = PBKDF2(kata sandi, "pintu-kukar|" + id).
   Di sini hanya disimpan  kode = SHA-256("pintu|" + t).
   ===================================================================== */
function rapikanId_(id) { return String(id || '').trim().toLowerCase().slice(0, 80); }
function kodeDari_(t) { return hex_(Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, 'pintu|' + String(t || ''), Utilities.Charset.UTF_8)); }
function tokenSah_(t) { return /^[0-9a-f]{64}$/.test(String(t || '')); }

function buatAdmin_(b) {
  return denganKunci_(function () {
    if (baca_('Akun').some(function (a) { return a.aktif; })) throw new Error('Akun admin sudah ada. Silakan masuk.');
    var id = rapikanId_(b.id), nama = String(b.nama || '').trim().slice(0, 80);
    if (!id || !nama) throw new Error('Isi nama dan email/ID.');
    if (!tokenSah_(b.t)) throw new Error('Kata sandi tidak terbaca. Muat ulang halaman lalu coba lagi.');
    tulis_('Akun', [{ id: id, nama: nama, peran: 'admin', kode: kodeDari_(b.t), aktif: true, dibuat: sekarang_(), masuk: sekarang_() }]);
    catat_(nama, 'Buat akun admin pertama', id);
    return { ok: true, saya: { id: id, nama: nama, peran: 'admin' } };
  });
}

/* Batas percobaan: 8 kali salah dalam 15 menit → dikunci. Berlaku untuk masuk
   maupun setiap permintaan bersesi, supaya tebakan sandi tidak bisa lewat jalur lain. */
function cekKunciGagal_(id) {
  if (+(CacheService.getScriptCache().get('gagal:' + id) || 0) >= 8) {
    var e = new Error('Terlalu banyak percobaan masuk. Coba lagi 15 menit lagi.');
    e.kode = 'kunci';
    throw e;
  }
}
function tambahGagal_(id) {
  var lock = LockService.getScriptLock();
  try { lock.waitLock(5000); } catch (e) { return; }
  try {
    var c = CacheService.getScriptCache(), k = 'gagal:' + id;
    c.put(k, String(+(c.get(k) || 0) + 1), 900);
  } finally { lock.releaseLock(); }
}

function masuk_(b) {
  var id = rapikanId_(b.id);
  cekKunciGagal_(id);
  var a = cariAkun_(id);
  if (!a || !a.aktif || !tokenSah_(b.t) || kodeDari_(b.t) !== a.kode) {
    tambahGagal_(id);
    throw new Error('Email/ID atau kata sandi salah.');
  }
  CacheService.getScriptCache().remove('gagal:' + id);
  try {
    denganKunci_(function () {
      var semua = baca_('Akun');
      semua.forEach(function (x) { if (x.id === id) x.masuk = sekarang_(); });
      tulis_('Akun', semua);
    });
  } catch (e) { /* tidak penting */ }
  return { ok: true, saya: { id: a.id, nama: a.nama, peran: a.peran } };
}

function cariAkun_(id) {
  var cache = CacheService.getScriptCache(), k = 'akun:' + id;
  var c = cache.get(k);
  if (c) { try { return JSON.parse(c); } catch (e) { /* baca ulang */ } }
  var a = null;
  baca_('Akun').forEach(function (x) { if (x.id === id) a = x; });
  if (a) cache.put(k, JSON.stringify(a), 300);
  return a;
}

/* Setiap permintaan membawa  sesi: { id, t }  (terpisah dari parameter aksi seperti id berkas). */
function autentikasi_(b) {
  var sesi = b.sesi || {};
  var id = rapikanId_(sesi.id);
  if (id) cekKunciGagal_(id);
  var a = id ? cariAkun_(id) : null;
  if (!a || !a.aktif || !tokenSah_(sesi.t) || kodeDari_(sesi.t) !== a.kode) {
    if (id) tambahGagal_(id);
    var e = new Error('Sesi berakhir atau kata sandi sudah diganti. Silakan masuk lagi.');
    e.kode = 'sesi';
    throw e;
  }
  return a;
}

function peranSah_(p) { return Object.prototype.hasOwnProperty.call(PERAN, p); }
function wajibPeran_(u, peran) {
  if (!peranSah_(u.peran) || PERAN[u.peran] < PERAN[peran]) {
    var e = new Error(peran === 'admin' ? 'Hanya admin yang boleh melakukan ini.' : 'Hanya pengelola yang boleh melakukan ini.');
    e.kode = 'peran';
    throw e;
  }
}

function gantiSandi_(u, b) {
  if (!tokenSah_(b.tBaru)) throw new Error('Kata sandi baru tidak terbaca.');
  return denganKunci_(function () {
    var semua = baca_('Akun');
    semua.forEach(function (x) { if (x.id === u.id) x.kode = kodeDari_(b.tBaru); });
    tulis_('Akun', semua);
    CacheService.getScriptCache().remove('akun:' + u.id);
    catat_(u.nama, 'Ganti kata sandi', u.id);
    return { ok: true };
  });
}

function daftarAkun_() {
  return baca_('Akun').map(function (a) { return { id: a.id, nama: a.nama, peran: a.peran, aktif: a.aktif, dibuat: a.dibuat, masuk: a.masuk }; });
}

/* =====================================================================
   DATA UNTUK SITUS
   ===================================================================== */
function dataAwal_(u) {
  var pg = bacaPengaturan_();
  var kategori = baca_('Kategori').map(function (k) {
    var t = [];
    try { t = JSON.parse(k.tautan || '[]'); } catch (e) { t = []; }
    return { id: k.id, nama: k.nama, singkat: k.singkat, ikon: k.ikon, warna: k.warna, deskripsi: k.deskripsi, folder: k.folder, tautan: t, urutan: +k.urutan || 0 };
  }).sort(function (a, b) { return a.urutan - b.urutan || a.nama.localeCompare(b.nama); });
  var label = baca_('Label').map(function (l) { return { id: l.id, nama: l.nama, kata: l.kata, label: l.label, catatan: l.catatan, oleh: l.oleh, diubah: l.diubah }; });
  var pengaturan = { namaKantor: pg.namaKantor, pintasan: pg.pintasan || [] };
  if (u.peran === 'admin') { pengaturan.sertakanDibagikan = pg.sertakanDibagikan !== false; pengaturan.folderAbaikan = pg.folderAbaikan || []; }
  return { ok: true, versi: VERSI, saya: { id: u.id, nama: u.nama, peran: u.peran }, kategori: kategori, label: label, pengaturan: pengaturan, info: infoIndeks_() };
}

function infoIndeks_() {
  var p = props_().getProperties();
  var bangun = null;
  if (p.BANGUN) { try { var s = JSON.parse(p.BANGUN); bangun = { n: s.n || 0, mulai: s.mulai }; } catch (e) { bangun = { n: 0 }; } }
  return {
    versi: +(p.VERSI_INDEKS || 0),
    jumlah: +(p.JUMLAH || 0),
    diubah: +(p.DIUBAH || 0),
    dicek: +(p.DICEK || 0),
    penuh: +(p.PENUH || 0),
    bangun: bangun,
    galat: p.GALAT || '',
    otomatis: ScriptApp.getProjectTriggers().some(function (t) { return t.getHandlerFunction() === 'jadwalPerbarui'; })
  };
}

/* Daftar berkas untuk browser: penuh, atau hanya perubahan sejak versi yang dimiliki browser. */
function ambilIndeks_(dari) {
  var versi = +(props_().getProperty('VERSI_INDEKS') || 0);
  if (!versi) return JSON.stringify({ ok: true, mode: 'kosong', versi: 0, info: infoIndeks_() });
  if (dari === versi) return JSON.stringify({ ok: true, mode: 'sama', versi: versi });
  if (dari > 0 && dari < versi) {
    var log = [];
    try { log = JSON.parse(bacaBerkas_('log') || '[]'); } catch (e) { log = []; }
    var perlu = log.filter(function (p) { return p.versi > dari; });
    if (perlu.length && perlu[0].versi === dari + 1 && perlu[perlu.length - 1].versi === versi) {
      var ubah = {}, hapus = {};
      perlu.forEach(function (p) {
        (p.hapus || []).forEach(function (k) { delete ubah[k]; hapus[k] = 1; });
        (p.ubah || []).forEach(function (it) { ubah[it[0]] = it; delete hapus[it[0]]; });
      });
      return JSON.stringify({ ok: true, mode: 'delta', dari: dari, versi: versi, ubah: Object.keys(ubah).map(function (k) { return ubah[k]; }), hapus: Object.keys(hapus) });
    }
  }
  var isi = bacaBerkas_('klien');
  if (!isi) return JSON.stringify({ ok: true, mode: 'kosong', versi: 0, info: infoIndeks_() });
  return '{"ok":true,"mode":"penuh",' + isi.slice(1);
}

/* Cari kata di dalam isi dokumen memakai pencarian Google Drive. */
function cariIsi_(q) {
  q = String(q || '').replace(/[\\']/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 120);
  if (q.length < 2) return { ok: true, hasil: [] };
  var frasa = q.match(/^"(.+)"$/);
  var kata = frasa ? ['"' + frasa[1].replace(/"/g, '') + '"'] : q.replace(/"/g, '').split(' ').filter(function (w) { return w.length > 1; }).slice(0, 6);
  if (!kata.length) return { ok: true, hasil: [] };
  var syarat = kata.map(function (w) { return "fullText contains '" + w + "'"; }).join(' and ') + ' and trashed = false';
  var r = v3_('files', { q: syarat, corpora: 'user', spaces: 'drive', pageSize: 60, fields: 'files(' + FIELD_BERKAS + ')' });
  var klien = null;
  try { klien = JSON.parse(bacaBerkas_('klien') || 'null'); } catch (e) { klien = null; }
  var adaKunci = {}, nomorFolder = {};
  if (klien) klien.item.forEach(function (it) { adaKunci[it[0]] = it; if (it[5]) nomorFolder[it[0]] = it[5]; });
  var akar = props_().getProperty('AKAR') || '';
  var terlarang = idSistem_();
  (bacaPengaturan_().folderAbaikan || []).forEach(function (u) { var id = idDrive_(u); if (id) terlarang[id] = 1; });
  var hasil = [];
  (r.files || []).forEach(function (f) {
    if (adaKunci[f.id]) { hasil.push(adaKunci[f.id]); return; }
    if (terlarang[f.id] || (f.shortcutDetails && terlarang[f.shortcutDetails.targetId])) return;
    var induk = (f.parents || [])[0] || '';
    var nomor = induk === akar ? 1 : nomorFolder[induk];
    if (!nomor) return;   // di luar cakupan PINTU (mis. folder yang diabaikan)
    var k = kompak_(f);
    hasil.push(itemKlien_(f.id, k, nomor, 0));
  });
  return { ok: true, hasil: hasil };
}

/* =====================================================================
   PERUBAHAN DARI PENGELOLA / ADMIN
   ===================================================================== */
function ubah_(b, u) {
  var oleh = u.nama;
  switch (b.aksi) {
    case 'simpanKategori': {
      var k = rapikanKategori_(b.kategori || {});
      if (!k.nama) throw new Error('Nama kategori wajib diisi.');
      var semua = baca_('Kategori'), ada = false;
      semua = semua.map(function (x) { if (x.id === k.id) { ada = true; if (!b.kategori.urutan && x.urutan) k.urutan = x.urutan; return k; } return x; });
      if (!ada) { k.urutan = String(semua.length + 1); semua.push(k); }
      tulis_('Kategori', semua);
      catat_(oleh, ada ? 'Ubah kategori' : 'Tambah kategori', k.nama);
      return;
    }
    case 'hapusKategori': {
      var id = String(b.id || ''), dihapus = null;
      var sisa = baca_('Kategori').filter(function (x) { if (x.id === id) { dihapus = x; return false; } return true; });
      if (!dihapus) throw new Error('Kategori tidak ditemukan. Muat ulang halaman.');
      tulis_('Kategori', sisa);
      keSampah_(oleh, 'kategori', dihapus.nama, dihapus);
      catat_(oleh, 'Hapus kategori', dihapus.nama + ' (bisa dipulihkan ' + HARI_SAMPAH + ' hari)');
      return;
    }
    case 'urutKategori': {
      var urut = (b.urutan || []).map(String), peta = {};
      urut.forEach(function (id, i) { peta[id] = i + 1; });
      var daftar = baca_('Kategori');
      daftar.forEach(function (x) { if (peta[x.id]) x.urutan = String(peta[x.id]); });
      daftar.sort(function (a, c) { return (+a.urutan || 999) - (+c.urutan || 999); });
      tulis_('Kategori', daftar);
      catat_(oleh, 'Ubah urutan kategori', '');
      return;
    }
    case 'pulihkan': { pulihkan_(String(b.sid || ''), oleh); return; }
    case 'simpanLabel': {
      var l = {
        id: String(b.id || '').replace(/[^\w-]/g, '').slice(0, 80),
        nama: String(b.nama || '').slice(0, 200),
        kata: String(b.kata || '').replace(/\s+/g, ' ').trim().slice(0, 300),
        label: String(b.label || '').split(',').map(function (s) { return s.trim(); }).filter(String).slice(0, 8).join(', '),
        catatan: String(b.catatan || '').trim().slice(0, 300),
        oleh: oleh, diubah: sekarang_()
      };
      if (!l.id) throw new Error('Berkas tidak dikenali.');
      var daftarL = baca_('Label').filter(function (x) { return x.id !== l.id; });
      if (l.kata || l.label || l.catatan) daftarL.push(l);
      tulis_('Label', daftarL);
      catat_(oleh, l.kata || l.label || l.catatan ? 'Ubah label' : 'Hapus label', l.nama);
      return;
    }
    case 'simpanPintasan': {
      var pintas = rapikanTautan_(b.pintasan);
      setPengaturan_('pintasan', pintas);
      catat_(oleh, 'Ubah pintasan beranda', pintas.length + ' pintasan');
      return;
    }
    case 'simpanAkun': {
      var id2 = rapikanId_(b.akun && b.akun.id), baru = !!(b.akun && b.akun.baru);
      if (!id2) throw new Error('Email/ID wajib diisi.');
      var peran = peranSah_(b.akun.peran) ? b.akun.peran : 'pengguna';
      var akun = baca_('Akun'), lama = null;
      akun.forEach(function (x) { if (x.id === id2) lama = x; });
      if (baru && lama) throw new Error('Email/ID ' + id2 + ' sudah dipakai.');
      if (!baru && !lama) throw new Error('Akun tidak ditemukan.');
      if (baru && !tokenSah_(b.akun.t)) throw new Error('Isi kata sandi awal.');
      if (lama && lama.id === u.id && (peran !== 'admin' || b.akun.aktif === false)) throw new Error('Anda tidak bisa menurunkan peran atau menonaktifkan akun sendiri.');
      var obj = lama || { id: id2, dibuat: sekarang_(), masuk: '' };
      obj.nama = String(b.akun.nama || obj.nama || '').trim().slice(0, 80) || id2;
      obj.peran = peran;
      obj.aktif = b.akun.aktif !== false;
      if (tokenSah_(b.akun.t)) obj.kode = kodeDari_(b.akun.t);
      if (!lama) akun.push(obj);
      tulis_('Akun', akun);
      CacheService.getScriptCache().remove('akun:' + id2);
      catat_(oleh, baru ? 'Tambah akun' : (tokenSah_(b.akun.t) ? 'Atur ulang sandi akun' : 'Ubah akun'), obj.nama + ' (' + id2 + ', ' + peran + (obj.aktif ? '' : ', nonaktif') + ')');
      return;
    }
    case 'hapusAkun': {
      var id3 = rapikanId_(b.id);
      if (id3 === u.id) throw new Error('Anda tidak bisa menghapus akun sendiri.');
      var sisaA = baca_('Akun').filter(function (x) { return x.id !== id3; });
      tulis_('Akun', sisaA);
      CacheService.getScriptCache().remove('akun:' + id3);
      catat_(oleh, 'Hapus akun', id3);
      return;
    }
    case 'simpanPengaturan': {
      var pg = b.pengaturan || {};
      if (typeof pg.namaKantor === 'string') setPengaturan_('namaKantor', pg.namaKantor.trim().slice(0, 120) || PENGATURAN_AWAL.namaKantor);
      var ubahCakupan = false;
      if (typeof pg.sertakanDibagikan === 'boolean') { setPengaturan_('sertakanDibagikan', pg.sertakanDibagikan); ubahCakupan = true; }
      if (Array.isArray(pg.folderAbaikan)) {
        var fa = pg.folderAbaikan.map(function (x) { return String(x || '').trim(); }).filter(String).slice(0, 50);
        fa.forEach(function (x) { if (!idDrive_(x)) throw new Error('Baris "' + x.slice(0, 60) + '" bukan link folder Google Drive.'); });
        setPengaturan_('folderAbaikan', fa);
        ubahCakupan = true;
      }
      catat_(oleh, 'Ubah pengaturan', [typeof pg.sertakanDibagikan === 'boolean' ? 'berkas dibagikan: ' + (pg.sertakanDibagikan ? 'ikut' : 'tidak ikut') : '', Array.isArray(pg.folderAbaikan) ? pg.folderAbaikan.length + ' folder diabaikan' : ''].filter(String).join(' · '));
      if (ubahCakupan) {
        var sedang = +(props_().getProperty('SEDANG') || 0);
        if (sedang && Date.now() - sedang < 420000) props_().setProperty('PERLU_TERAPKAN', String(Date.now()));
        else { var st = bacaState_(); if (st) terapkan_(st, 'Pengaturan cakupan diubah'); }
      }
      return;
    }
    default:
      throw new Error('Aksi tidak dikenal: ' + b.aksi + '. Pastikan Apps Script sudah versi terbaru.');
  }
}

function rapikanKategori_(k) {
  var id = String(k.id || '').replace(/[^\w-]/g, '').slice(0, 40) || ('k' + Utilities.getUuid().replace(/-/g, '').slice(0, 8));
  return {
    id: id,
    nama: String(k.nama || '').trim().slice(0, 60),
    singkat: String(k.singkat || '').trim().slice(0, 120),
    ikon: String(k.ikon || 'folder').replace(/[^\w-]/g, '').slice(0, 20),
    warna: /^#[0-9a-fA-F]{6}$/.test(String(k.warna || '')) ? k.warna : '#1C5AA3',
    deskripsi: String(k.deskripsi || '').trim().slice(0, 300),
    folder: /^https?:\/\//.test(String(k.folder || '')) ? String(k.folder).trim().slice(0, 300) : '',
    tautan: JSON.stringify(rapikanTautan_(k.tautan)),
    urutan: String(+k.urutan || '')
  };
}

function rapikanTautan_(daftar) {
  return (Array.isArray(daftar) ? daftar : []).map(function (t) {
    return { label: String(t && t.label || '').trim().slice(0, 80), url: String(t && t.url || '').trim().slice(0, 500), ket: String(t && t.ket || '').trim().slice(0, 160) };
  }).filter(function (t) { return t.label && /^https?:\/\//.test(t.url); }).slice(0, 40);
}

function keSampah_(oleh, jenis, judul, isi) {
  var batas = Date.now() - HARI_SAMPAH * 864e5;
  var daftar = baca_('Sampah').filter(function (s) { var w = parseWaktu_(s.waktu); return !w || w.getTime() > batas; });
  daftar.push({ sid: 's' + Utilities.getUuid().replace(/-/g, '').slice(0, 10), waktu: sekarang_(), oleh: oleh, jenis: jenis, judul: judul, isi: JSON.stringify(isi) });
  tulis_('Sampah', daftar);
}

function pulihkan_(sid, oleh) {
  var s = null;
  var sisa = baca_('Sampah').filter(function (x) { if (x.sid === sid) { s = x; return false; } return true; });
  if (!s) throw new Error('Data di sampah tidak ditemukan (mungkin sudah lewat ' + HARI_SAMPAH + ' hari).');
  var isi = JSON.parse(s.isi || '{}');
  if (s.jenis === 'kategori') {
    var semua = baca_('Kategori');
    if (semua.some(function (x) { return x.id === isi.id; })) isi.id = isi.id + '-' + Utilities.getUuid().slice(0, 4);
    semua.push(isi);
    tulis_('Kategori', semua);
  }
  tulis_('Sampah', sisa);
  catat_(oleh, 'Pulihkan ' + s.jenis, s.judul);
}

function bacaRiwayat_(u) {
  var r = baca_('Riwayat');
  if (u.peran !== 'admin') r = r.map(function (x) { return /akun|sandi|pengaturan|admin/i.test(x.aksi) ? { waktu: x.waktu, oleh: x.oleh, aksi: x.aksi, keterangan: '' } : x; });
  var sampah = baca_('Sampah').map(function (s) { return { sid: s.sid, waktu: s.waktu, oleh: s.oleh, jenis: s.jenis, judul: s.judul }; });
  return { ok: true, riwayat: r.slice(-300).reverse(), sampah: sampah.reverse() };
}

function perbaruiDariWeb_(u) {
  var p = props_();
  if (!p.getProperty('BANGUN') && Date.now() - +(p.getProperty('DICEK') || 0) < 20000)
    return { ok: true, pesan: 'Daftar berkas baru saja diperbarui.', info: infoIndeks_() };
  var hasil = denganIndeks_(function () {
    if (p.getProperty('BANGUN')) {
      var r1 = bangunPenuh_(200000, false);
      if (!r1.selesai) jadwalkanLanjutan_();
      return r1.selesai ? 'Pendaftaran berkas selesai.' : 'Pendaftaran berkas masih berjalan (' + r1.n + ' sejauh ini).';
    }
    var r = perbarui_(200000);
    return r.berubah ? r.berubah + ' perubahan diambil dari Google Drive.' : 'Daftar berkas sudah terbaru.';
  });
  return { ok: true, pesan: hasil || 'Daftar berkas sedang diperbarui di latar belakang. Coba lagi sebentar lagi.', info: infoIndeks_() };
}

function bangunDariWeb_(u) {
  catat_(u.nama, 'Daftar ulang semua berkas', '');
  var hasil = denganIndeks_(function () {
    var r = bangunPenuh_(200000, true);
    if (!r.selesai) jadwalkanLanjutan_();
    return r.selesai ? 'Selesai: ' + r.jumlah + ' berkas & folder terdaftar.' : 'Berjalan: ' + r.n + ' berkas sejauh ini. Dilanjutkan otomatis di latar belakang.';
  });
  return { ok: true, pesan: hasil || 'Pendaftaran sedang berjalan di latar belakang.', info: infoIndeks_() };
}

/* =====================================================================
   PENDAFTARAN BERKAS (INDEKS)
   State di server (berkas "state"): { item: { kunci: [nama, jenis, induk(id), ubahMenit, buatMenit, kb, target] } }
   Untuk browser (berkas "klien"): item: [kunci, nama, jenis, nomorInduk, ubahMenit, nomorFolder, kb, buatMenit, target]
   nomorInduk 1 = Drive Saya, 2 = Dibagikan ke akun ini.
   ===================================================================== */
function kompak_(f) {
  var m = f.mimeType || '', target = '';
  if (m === 'application/vnd.google-apps.shortcut' && f.shortcutDetails) {
    target = f.shortcutDetails.targetId || '';
    m = f.shortcutDetails.targetMimeType || '';
  }
  return [
    String(f.name || '').slice(0, 300),
    jenisMime_(m, f.name || ''),
    (f.parents || [])[0] || '',
    Math.round((Date.parse(f.modifiedTime) || 0) / 60000),
    Math.round((Date.parse(f.createdTime) || 0) / 60000),
    Math.round((+f.size || 0) / 1024),
    target
  ];
}

function jenisMime_(m, nama) {
  if (m === 'application/vnd.google-apps.folder') return 'f';
  if (m === 'application/vnd.google-apps.document') return 'd';
  if (m === 'application/vnd.google-apps.spreadsheet') return 's';
  if (m === 'application/vnd.google-apps.presentation') return 'p';
  if (m === 'application/vnd.google-apps.form') return 'o';
  if (/^application\/vnd\.google-apps\./.test(m)) return 'g';
  if (m === 'application/pdf' || /\.pdf$/i.test(nama)) return 'a';
  if (/spreadsheetml|ms-excel|text\/csv|opendocument\.spreadsheet/.test(m) || /\.(xlsx?|xlsm|csv|ods)$/i.test(nama)) return 'x';
  if (/wordprocessingml|msword|opendocument\.text|rtf/.test(m) || /\.(docx?|odt|rtf)$/i.test(nama)) return 'w';
  if (/presentationml|ms-powerpoint|opendocument\.presentation/.test(m) || /\.(pptx?|odp)$/i.test(nama)) return 't';
  if (/^image\//.test(m)) return 'i';
  if (/^(video|audio)\//.test(m)) return 'v';
  if (/zip|rar|7z|x-tar|gzip/.test(m) || /\.(zip|rar|7z|gz)$/i.test(nama)) return 'z';
  if (/^text\//.test(m)) return 'c';
  return 'n';
}

function bangunPenuh_(batasMs, mulaiBaru) {
  var t0 = Date.now(), p = props_();
  var sesi = null;
  try { sesi = JSON.parse(p.getProperty('BANGUN') || 'null'); } catch (e) { sesi = null; }
  var kumpulan = {};
  if (!sesi || mulaiBaru) {
    sesi = { mulai: Date.now(), halaman: '', pt: v3_('changes/startPageToken', {}).startPageToken, n: 0 };
  } else if (sesi.n) {
    var sementara = bacaBerkas_('bangun');
    try { kumpulan = sementara ? JSON.parse(sementara) : null; } catch (e) { kumpulan = null; }
    if (!kumpulan) { kumpulan = {}; sesi.halaman = ''; sesi.n = 0; sesi.selesaiDaftar = false; }   // tak terbaca: daftar dari awal
  }
  p.setProperty('BANGUN', JSON.stringify(sesi));
  var sistem = idSistem_(), cadangan = 100000;   // sisakan ±100 detik untuk menyusun & menyimpan
  var berhenti = function () {
    simpanBerkas_('bangun', JSON.stringify(kumpulan));
    p.setProperty('BANGUN', JSON.stringify(sesi));
    return { selesai: false, n: sesi.n };
  };
  var halamanIni = 0;   // setiap jalankan dijamin maju minimal satu halaman
  while (!sesi.selesaiDaftar) {
    if (halamanIni > 0 && Date.now() - t0 > batasMs - cadangan) return berhenti();
    halamanIni++;
    var r = v3_('files', {
      q: 'trashed = false', corpora: 'user', spaces: 'drive', pageSize: 1000,
      fields: 'nextPageToken,files(' + FIELD_BERKAS + ')', pageToken: sesi.halaman || ''
    });
    (r.files || []).forEach(function (f) { if (!sistem[f.id] && !sistem[(f.parents || [])[0]]) kumpulan[f.id] = kompak_(f); });
    sesi.n = Object.keys(kumpulan).length;
    sesi.halaman = r.nextPageToken || '';
    if (!sesi.halaman || sesi.n >= BATAS_ITEM) sesi.selesaiDaftar = true;
  }
  if (halamanIni > 0 && Date.now() - t0 > batasMs - 60000) return berhenti();   // susun di jalankan berikutnya
  var st = bacaState_();
  if (!st && p.getProperty('F_state')) throw new Error('Daftar berkas lama tidak terbaca dari folder sistem. Coba lagi nanti.');
  st = st || { nomor: {}, nb: 3 };
  st.item = kumpulan;
  var hidup = {};
  Object.keys(st.nomor || {}).forEach(function (k) { if (kumpulan[k] && kumpulan[k][1] === 'f' && !kumpulan[k][6]) hidup[k] = st.nomor[k]; });
  st.nomor = hidup;
  st.nb = Math.max(st.nb || 3, 3);
  p.setProperty('PT', sesi.pt);
  p.setProperty('AKAR', DriveApp.getRootFolder().getId());
  var hasil = terapkan_(st, 'Pendaftaran penuh');
  p.deleteProperty('BANGUN');
  p.setProperty('PENUH', String(Date.now()));
  p.setProperty('DICEK', String(Date.now()));
  hapusBerkas_('bangun');
  return { selesai: true, n: sesi.n, jumlah: hasil.jumlah };
}

/* Ambil perubahan terbaru dari Google Drive (Changes API).
   Daftar lengkap baru dibuka bila memang ada perubahan, supaya pemeriksaan rutin tetap ringan. */
function perbarui_(batasMs) {
  var t0 = Date.now(), p = props_();
  var pt = p.getProperty('PT');
  if (!pt || !p.getProperty('F_state')) { var rb = bangunPenuh_(batasMs, true); if (!rb.selesai) jadwalkanLanjutan_(); return { berubah: rb.n }; }
  var perubahan = [], sistem = idSistem_();
  while (true) {
    var r = v3_('changes', {
      pageToken: pt, pageSize: 1000, includeRemoved: 'true', spaces: 'drive', restrictToMyDrive: 'false',
      fields: 'nextPageToken,newStartPageToken,changes(changeType,fileId,removed,file(' + FIELD_BERKAS + '))'
    });
    (r.changes || []).forEach(function (c) {
      if (c.changeType && c.changeType !== 'file') return;
      if (sistem[c.fileId] || (c.file && sistem[(c.file.parents || [])[0]])) return;   // berkas PINTU sendiri
      perubahan.push(c);
    });
    if (r.nextPageToken) { pt = r.nextPageToken; if (Date.now() - t0 > batasMs) break; continue; }
    pt = r.newStartPageToken || pt;
    break;
  }
  var berubah = 0;
  if (perubahan.length) {
    var st = bacaState_();
    if (!st) { var rb2 = bangunPenuh_(batasMs - (Date.now() - t0), true); if (!rb2.selesai) jadwalkanLanjutan_(); return { berubah: rb2.n }; }
    var hapusFolder = [];
    perubahan.forEach(function (c) {
      var k = c.fileId;
      if (c.removed || !c.file || c.file.trashed) {
        if (st.item[k]) { if (st.item[k][1] === 'f' && !st.item[k][6]) hapusFolder.push(k); delete st.item[k]; berubah++; }
      } else {
        var baru = kompak_(c.file);
        if (JSON.stringify(st.item[k]) !== JSON.stringify(baru)) { st.item[k] = baru; berubah++; }
      }
    });
    if (hapusFolder.length) hapusTurunan_(st, hapusFolder);
    if (berubah) terapkan_(st, 'Pembaruan');
  }
  p.setProperty('PT', pt);
  p.setProperty('DICEK', String(Date.now()));
  return { berubah: berubah };
}

/* Folder yang dihapus: buang juga semua isinya. */
function hapusTurunan_(st, akarHapus) {
  var anak = {};
  Object.keys(st.item).forEach(function (k) { var pa = st.item[k][2]; (anak[pa] = anak[pa] || []).push(k); });
  var antre = akarHapus.slice();
  while (antre.length) {
    var f = antre.pop();
    (anak[f] || []).forEach(function (k) {
      if (!st.item[k]) return;
      if (st.item[k][1] === 'f' && !st.item[k][6]) antre.push(k);
      delete st.item[k];
    });
  }
}

/* Susun daftar untuk browser dari state, bandingkan dengan versi sebelumnya, simpan. */
function terapkan_(st, alasan) {
  var p = props_(), pg = bacaPengaturan_();
  var akar = p.getProperty('AKAR') || '';
  var abaikan = {};
  (pg.folderAbaikan || []).forEach(function (u) { var id = idDrive_(u) || String(u || '').trim(); if (id) abaikan[id] = 1; });
  ['FOLDER_SISTEM', 'DB_ID'].forEach(function (k) { var v = p.getProperty(k); if (v) abaikan[v] = 1; });
  var item = st.item, memo = {};
  function isFolderAsli(k) { return item[k] && item[k][1] === 'f' && !item[k][6]; }
  function cakupan(induk, dalam) {
    if (!induk) return 2;
    if (induk === akar) return 1;
    if (abaikan[induk]) return 0;
    if (memo[induk] !== undefined) return memo[induk];
    if (!isFolderAsli(induk) || dalam > 80) { memo[induk] = 2; return 2; }
    memo[induk] = 0;   // pengaman siklus
    memo[induk] = cakupan(item[induk][2], dalam + 1);
    return memo[induk];
  }
  st.nomor = st.nomor || {};
  st.nb = Math.max(st.nb || 3, 3);
  var keluar = [];
  Object.keys(item).forEach(function (k) {
    if (abaikan[k]) return;
    var it = item[k];
    if (it[6] && abaikan[it[6]]) return;
    var c = cakupan(it[2], 0);
    if (c === 0) return;
    if (c === 2 && pg.sertakanDibagikan === false) return;
    var nomor = 0;
    if (isFolderAsli(k)) { nomor = st.nomor[k] || (st.nomor[k] = st.nb++); }
    var induk = it[2] === akar ? 1 : (isFolderAsli(it[2]) && cakupan(it[2], 0) !== 0 ? 0 : 2);
    keluar.push([k, it, nomor, induk]);
  });
  var baris = keluar.map(function (x) {
    var nomorInduk = x[3] || st.nomor[x[1][2]] || 2;
    return itemKlien_(x[0], x[1], nomorInduk, x[2]);
  });

  // bandingkan dengan daftar lama untuk sinkron cepat
  var lama = {}, versiKlien = 0;
  try { var kl = JSON.parse(bacaBerkas_('klien') || 'null'); if (kl) { versiKlien = +kl.versi || 0; kl.item.forEach(function (it) { lama[it[0]] = JSON.stringify(it); }); } } catch (e) { lama = {}; }
  var ubah = [], hapus = [], ada = {};
  baris.forEach(function (it) { ada[it[0]] = 1; if (lama[it[0]] !== JSON.stringify(it)) ubah.push(it); });
  Object.keys(lama).forEach(function (k) { if (!ada[k]) hapus.push(k); });
  var versiTercatat = +(p.getProperty('VERSI_INDEKS') || 0);
  var putus = !!versiKlien && versiKlien !== versiTercatat;   // proses sebelumnya terhenti di tengah penyimpanan
  var versi = Math.max(versiTercatat, versiKlien);
  if (!ubah.length && !hapus.length && versi && !putus) {
    simpanBerkas_('state', JSON.stringify(st));
    return { jumlah: baris.length, berubah: 0 };
  }
  versi += 1;
  var sekarang = Date.now();
  var klien = { v: 1, versi: versi, diubah: sekarang, akar: [[1, 'Drive Saya'], [2, 'Dibagikan ke akun ini']], item: baris };
  simpanBerkas_('state', JSON.stringify(st));
  simpanBerkas_('klien', JSON.stringify(klien));
  var log = [];
  try { log = JSON.parse(bacaBerkas_('log') || '[]'); } catch (e) { log = []; }
  if (putus || ubah.length + hapus.length > LOG_MAKS_ITEM || !Object.keys(lama).length) log = [];
  else log.push({ versi: versi, waktu: sekarang, ubah: ubah, hapus: hapus });
  var total = 0;
  for (var i = log.length - 1; i >= 0; i--) { total += log[i].ubah.length + log[i].hapus.length; if (total > LOG_MAKS_ITEM || log.length - i > LOG_MAKS) { log = log.slice(i + 1); break; } }
  simpanBerkas_('log', JSON.stringify(log));
  p.setProperties({ VERSI_INDEKS: String(versi), JUMLAH: String(baris.length), DIUBAH: String(sekarang), GALAT: '' });
  console.log(alasan + ': versi ' + versi + ', ' + baris.length + ' item, ' + ubah.length + ' diubah, ' + hapus.length + ' dihapus');
  return { jumlah: baris.length, berubah: ubah.length + hapus.length };
}

function itemKlien_(k, it, nomorInduk, nomor) {
  var a = [k, it[0], it[1], nomorInduk, it[3], nomor, it[5], it[4]];
  if (it[6]) a.push(it[6]);
  return a;
}

/* Berkas milik PINTU sendiri (folder sistem, database, berkas indeks) tidak didaftar. */
function idSistem_() {
  var p = props_().getProperties(), o = {};
  Object.keys(p).forEach(function (k) { if (/^(FOLDER_SISTEM|DB_ID|F_\w+)$/.test(k) && p[k]) o[p[k]] = 1; });
  return o;
}

function bacaState_() {
  try { var s = bacaBerkas_('state'); return s ? JSON.parse(s) : null; } catch (e) { return null; }
}

/* ---------------- Google Drive API v3 lewat UrlFetch ---------------- */
function v3_(jalur, param) {
  var qs = Object.keys(param).filter(function (k) { return param[k] !== undefined && param[k] !== ''; })
    .map(function (k) { return encodeURIComponent(k) + '=' + encodeURIComponent(param[k]); }).join('&');
  var url = 'https://www.googleapis.com/drive/v3/' + jalur + (qs ? '?' + qs : '');
  var r = null;
  for (var coba = 0; coba < 3; coba++) {
    r = UrlFetchApp.fetch(url, { headers: { Authorization: 'Bearer ' + ScriptApp.getOAuthToken() }, muteHttpExceptions: true });
    var kode = r.getResponseCode();
    if (kode === 200) return JSON.parse(r.getContentText());
    var batasLaju = kode === 403 && /rateLimitExceeded|userRateLimitExceeded/.test(r.getContentText());
    if (kode !== 429 && kode < 500 && !batasLaju) break;
    Utilities.sleep(1500 * (coba + 1));
  }
  throw new Error('Google Drive menolak permintaan (' + r.getResponseCode() + '): ' + String(r.getContentText()).slice(0, 180));
}

/* ---------------- berkas sistem (dikompres gzip) ---------------- */
function folderSistem_() {
  var p = props_(), id = p.getProperty('FOLDER_SISTEM');
  if (id) { try { var f = DriveApp.getFolderById(id); if (!f.isTrashed()) return f; } catch (e) { /* buat baru */ } }
  var baru = DriveApp.createFolder('PINTU Kukar – Sistem (jangan dihapus)');
  baru.setDescription('Berisi database dan daftar berkas untuk PINTU Kukar. Jangan dihapus atau dipindah.');
  p.setProperty('FOLDER_SISTEM', baru.getId());
  return baru;
}

function simpanBerkas_(nama, teks) {
  var p = props_(), kunci = 'F_' + nama, id = p.getProperty(kunci);
  var gz = Utilities.gzip(Utilities.newBlob(teks, 'application/json', nama + '.json'), nama + '.json.gz');
  if (id) {
    try {
      var r = UrlFetchApp.fetch('https://www.googleapis.com/upload/drive/v3/files/' + id + '?uploadType=media', {
        method: 'patch', contentType: 'application/gzip', payload: gz.getBytes(),
        headers: { Authorization: 'Bearer ' + ScriptApp.getOAuthToken() }, muteHttpExceptions: true
      });
      if (r.getResponseCode() === 200) return;
    } catch (e) { /* buat baru */ }
  }
  var f = folderSistem_().createFile(gz);
  p.setProperty(kunci, f.getId());
}

function bacaBerkas_(nama) {
  var id = props_().getProperty('F_' + nama);
  if (!id) return null;
  try {
    var b = DriveApp.getFileById(id).getBlob();
    b.setContentType('application/x-gzip');
    return Utilities.ungzip(b).getDataAsString('UTF-8');
  } catch (e) { return null; }
}

function hapusBerkas_(nama) {
  var p = props_(), id = p.getProperty('F_' + nama);
  if (!id) return;
  try { DriveApp.getFileById(id).setTrashed(true); } catch (e) { /* abaikan */ }
  p.deleteProperty('F_' + nama);
}

/* =====================================================================
   SPREADSHEET DATABASE
   ===================================================================== */
function siapkanDb_() {
  var p = props_(), id = p.getProperty('DB_ID'), ss = null;
  if (id) { try { ss = SpreadsheetApp.openById(id); } catch (e) { ss = null; } }
  if (!ss) {
    ss = SpreadsheetApp.create('PINTU Kukar – Database');
    p.setProperty('DB_ID', ss.getId());
    try { DriveApp.getFileById(ss.getId()).moveTo(folderSistem_()); } catch (e) { /* biarkan di Drive Saya */ }
  }
  Object.keys(KOLOM).forEach(function (n) { sheet_(n, ss); });
  ss.getSheets().forEach(function (sh) { if (!KOLOM[sh.getName()] && ss.getSheets().length > 1 && sh.getLastRow() === 0) { try { ss.deleteSheet(sh); } catch (e) { /* abaikan */ } } });
  var pg = baca_('Pengaturan'), ada = {};
  pg.forEach(function (r) { ada[r.kunci] = 1; });
  Object.keys(PENGATURAN_AWAL).forEach(function (k) { if (!ada[k]) pg.push({ kunci: k, nilai: JSON.stringify(PENGATURAN_AWAL[k]) }); });
  tulis_('Pengaturan', pg);
  return ss;
}

function ss_() {
  var id = props_().getProperty('DB_ID');
  if (!id) { var e = new Error('PINTU belum dipasang. Jalankan fungsi pasang di editor Apps Script.'); e.kode = 'belum'; throw e; }
  return SpreadsheetApp.openById(id);
}

function sheet_(nama, ss) {
  ss = ss || ss_();
  var sh = ss.getSheetByName(nama);
  if (!sh) {
    sh = ss.insertSheet(nama);
    var kol = KOLOM[nama];
    if (sh.getMaxColumns() < kol.length) sh.insertColumnsAfter(sh.getMaxColumns(), kol.length - sh.getMaxColumns());
    sh.getRange(1, 1, 1, kol.length).setValues([kol]).setFontWeight('bold');
    sh.setFrozenRows(1);
    sh.getRange(1, 1, sh.getMaxRows(), kol.length).setNumberFormat('@');
  }
  return sh;
}

function baca_(nama) {
  var sh = sheet_(nama), kol = KOLOM[nama];
  var n = sh.getLastRow() - 1;
  if (n < 1) return [];
  var header = sh.getRange(1, 1, 1, Math.max(sh.getLastColumn(), 1)).getValues()[0].map(String);
  var nilai = sh.getRange(2, 1, n, header.length).getValues();
  return nilai.map(function (baris) {
    var o = {};
    kol.forEach(function (k) {
      var i = header.indexOf(k), v = i > -1 ? baris[i] : '';
      if (k === 'aktif') o[k] = v === true || /^(true|ya|y|1|x)$/i.test(String(v).trim());
      else o[k] = v instanceof Date ? Utilities.formatDate(v, zona_(), 'yyyy-MM-dd HH:mm') : String(v == null ? '' : v).trim();
    });
    return o;
  }).filter(function (o) {
    if (nama === 'Riwayat' || nama === 'Pengaturan') return !!(o.waktu || o.kunci);
    if (nama === 'Sampah') return !!o.sid;
    return !!o.id;
  });
}

function tulis_(nama, daftar) {
  var sh = sheet_(nama), kol = KOLOM[nama];
  var lebar = Math.max(sh.getLastColumn(), kol.length);
  if (sh.getMaxColumns() < kol.length) sh.insertColumnsAfter(sh.getMaxColumns(), kol.length - sh.getMaxColumns());
  var lama = Math.max(sh.getLastRow() - 1, 0);
  if (lama > 0) sh.getRange(2, 1, lama, lebar).clearContent();
  sh.getRange(1, 1, 1, kol.length).setValues([kol]);
  if (!daftar.length) return;
  var perlu = daftar.length + 1;
  if (sh.getMaxRows() < perlu) sh.insertRowsAfter(sh.getMaxRows(), perlu - sh.getMaxRows());
  var rng = sh.getRange(2, 1, daftar.length, kol.length);
  rng.setNumberFormat('@');
  rng.setValues(daftar.map(function (o) {
    return kol.map(function (k) { var v = o[k]; if (k === 'aktif') return v ? 'TRUE' : 'FALSE'; return v == null ? '' : String(v); });
  }));
}

function tambahBaris_(nama, daftar) {
  if (!daftar.length) return;
  var sh = sheet_(nama), kol = KOLOM[nama];
  var awal = sh.getLastRow() + 1, perlu = awal + daftar.length - 1;
  if (sh.getMaxRows() < perlu) sh.insertRowsAfter(sh.getMaxRows(), perlu - sh.getMaxRows());
  var rng = sh.getRange(awal, 1, daftar.length, kol.length);
  rng.setNumberFormat('@');
  rng.setValues(daftar.map(function (o) { return kol.map(function (k) { return o[k] == null ? '' : String(o[k]); }); }));
}

function bacaPengaturan_() {
  var hasil = {};
  Object.keys(PENGATURAN_AWAL).forEach(function (k) { hasil[k] = PENGATURAN_AWAL[k]; });
  try {
    baca_('Pengaturan').forEach(function (r) { try { hasil[r.kunci] = JSON.parse(r.nilai); } catch (e) { hasil[r.kunci] = r.nilai; } });
  } catch (e) { /* database belum ada */ }
  return hasil;
}

function setPengaturan_(kunci, nilai) {
  var daftar = baca_('Pengaturan').filter(function (r) { return r.kunci !== kunci; });
  daftar.push({ kunci: kunci, nilai: JSON.stringify(nilai) });
  tulis_('Pengaturan', daftar);
}

function catat_(oleh, aksi, ket) {
  try { tambahBaris_('Riwayat', [{ waktu: sekarang_(), oleh: oleh, aksi: aksi, keterangan: String(ket || '').slice(0, 500) }]); } catch (e) { /* abaikan */ }
}

function catatGalat_(e) {
  var t = String(e && e.message || e).slice(0, 300);
  console.error(t);
  try { props_().setProperty('GALAT', sekarang_() + ' · ' + t); } catch (x) { /* abaikan */ }
}

/* =====================================================================
   UTILITAS
   ===================================================================== */
function props_() { return PropertiesService.getScriptProperties(); }
function zona_() { return ZONA; }
function sekarang_() { return Utilities.formatDate(new Date(), zona_(), 'yyyy-MM-dd HH:mm'); }
function parseWaktu_(s) {
  var m = String(s || '').match(/(\d{4})-(\d{2})-(\d{2})(?:[ T](\d{2}):(\d{2}))?/);
  return m ? new Date(+m[1], +m[2] - 1, +m[3], +(m[4] || 0), +(m[5] || 0)) : null;
}
function idDrive_(url) {
  var u = String(url || '').trim();
  var m = u.match(/\/folders\/([\w-]{15,})/) || u.match(/\/d\/([\w-]{15,})/) || u.match(/[?&]id=([\w-]{15,})/);
  if (m) return m[1];
  return /^[\w-]{20,}$/.test(u) ? u : '';
}
function hex_(bytes) { return bytes.map(function (x) { return ('0' + (x & 0xff).toString(16)).slice(-2); }).join(''); }

function denganKunci_(fn) {
  var lock = LockService.getScriptLock();
  lock.waitLock(25000);
  try { return fn(); } finally { lock.releaseLock(); }
}

function pesan_(t) { console.log(t); }

function pesanGalat_(err) {
  var t = String(err && err.message || err);
  if (/permission|authoriz|izin/i.test(t) && /Drive|UrlFetch|ScriptApp|Spreadsheet/i.test(t))
    return 'Apps Script belum diberi izin. Buka editor Apps Script, jalankan fungsi pasang, lalu klik Izinkan.';
  if (/Lock|timed out waiting/i.test(t)) return 'Server sedang sibuk. Coba lagi beberapa detik lagi.';
  return t;
}

function json_(o) { return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON); }
function teksJson_(s) { return ContentService.createTextOutput(s).setMimeType(ContentService.MimeType.JSON); }
