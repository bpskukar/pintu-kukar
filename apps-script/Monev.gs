/* =====================================================================
   PINTU Kukar — MONEV (monitoring & evaluasi kegiatan)
   ---------------------------------------------------------------------
   PEMASANGAN (sekali saja, di proyek Apps Script PINTU yang sama)
   1. Editor Apps Script → ikon + di samping "Berkas" → Skrip → beri nama
      Monev → hapus isinya → tempel seluruh file ini → Simpan.
   2. Tempel juga Kode.gs versi terbaru (ada dua baris tambahan untuk
      aksi monev di doPost) → Simpan.
   3. Terapkan → Kelola deployment → ikon pensil → Versi: Versi baru →
      Terapkan. Alamat /exec tidak berubah.
   4. Buka https://bpskukar.github.io/pintu-kukar/monev/ sebagai admin →
      halaman kegiatan → tempel link spreadsheet/folder sumber → Simpan.

   KEAMANAN
   - Hanya pegawai yang sudah masuk PINTU yang bisa melihat monev.
   - Link sumber data disimpan di database PINTU, tidak di GitHub.
   - Isi baris (nama responden, NIK, alamat, dll.) tidak pernah dikirim
     ke browser. Yang dikirim hanya jumlah tugas per pegawai per sheet
     per status tindak lanjut.
   - Sumber berupa Excel (.xlsx) dibaca lewat salinan Google Sheets di
     folder sistem PINTU (tidak ikut dicari, dibuat ulang bila sumber
     berubah).
   ===================================================================== */

var MONEV = {
  'cleaning-se2026': {
    judul: 'Cleaning Data Anomali SE2026',
    polaSheet: /^verif\s*\d/i,          // sheet yang dihitung
    polaBerkas: /6403|kukar/i,          // bila sumber berupa folder: pilih berkas yang namanya cocok
    menitCache: 10
  }
};
var MONEV_KOLOM_PEGAWAI = /nama\s+organik/i;
var MONEV_KOLOM_STATUS = [
  /^status\s+tindak\s+lanjut$/i,                     // Verif 2, 3, 7, 8
  /^tindak\s+lanjut\s+(oleh\s+)?kab/i,               // Verif 1.1, 5, 6, 9, 10
  /apakah\s+status\s+keberadaan.*sesuai/i,          // Verif 1, 4 (kolom K)
  /apakah\s+sudah\s+dilakukan\s+tindak\s+lanjut/i    // Verif 1, 4 (kolom L)
];
var MONEV_KOLOM_ABAIKAN = /feedback|keterangan|rekomendasi/i;
var MIME_SHEET = 'application/vnd.google-apps.spreadsheet';
var MIME_XLSX = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

/* ---------- aksi web: monev (semua pegawai yang sudah masuk) ---------- */
function monev_(u, b) {
  var id = String(b.kegiatan || '');
  var keg = MONEV[id];
  if (!keg) throw new Error('Kegiatan monev tidak dikenal: ' + id);
  var atur = bacaPengaturan_()['monev:' + id] || null;
  var admin = u.peran === 'admin';
  if (!atur || !atur.sumber) return { ok: true, siap: false, judul: keg.judul, admin: admin };
  var cache = CacheService.getScriptCache(), kunci = 'monev:' + id;
  var segar = !!b.segar && PERAN[u.peran] >= PERAN.pengelola;
  if (!segar) {
    var c = cache.get(kunci);
    if (c) { var o = JSON.parse(c); o.dariCache = true; o.admin = admin; return o; }
  }
  var hasil = satuPenghitung_(kunci, function () { return hitungMonev_(id, keg, atur); });
  try { cache.put(kunci, JSON.stringify(hasil), keg.menitCache * 60); } catch (e) { /* terlalu besar: tanpa cache */ }
  hasil.admin = admin;
  return hasil;
}

/* ---------- aksi web: monevAtur (admin) ---------- */
function monevAtur_(u, b) {
  wajibPeran_(u, 'admin');
  var id = String(b.kegiatan || '');
  var keg = MONEV[id];
  if (!keg) throw new Error('Kegiatan monev tidak dikenal: ' + id);
  var sumber = String(b.sumber || '').trim();
  if (!sumber) throw new Error('Tempel link spreadsheet atau folder sumber data.');
  var f = cariSumberMonev_(sumber, keg);           // gagal di sini = Gmail kantor tidak punya akses
  denganKunci_(function () {
    setPengaturan_('monev:' + id, { sumber: sumber, berkas: f.name, oleh: u.nama, waktu: sekarang_() });
  });
  catat_(u.nama, 'Atur sumber monev', keg.judul + ' → ' + f.name);
  CacheService.getScriptCache().remove('monev:' + id);
  return monev_(u, { kegiatan: id, segar: true });
}

/* ---------- hitung: kelompokkan per pegawai × status ---------- */
function hitungMonev_(id, keg, atur) {
  var src = cariSumberMonev_(atur.sumber, keg);
  var ssId = src.mimeType === MIME_SHEET ? src.id : salinanSheetMonev_(id, src);
  var ss = SpreadsheetApp.openById(ssId);
  var daftar = [];
  ss.getSheets().forEach(function (sh) {
    var nama = sh.getName();
    if (!keg.polaSheet.test(nama)) return;
    daftar.push(hitungSheetMonev_(nama, sh.getDataRange().getDisplayValues()));
  });
  return {
    ok: true, siap: true, kegiatan: id, judul: keg.judul,
    sumber: { nama: src.name, diubah: src.modifiedTime },
    diambil: sekarang_(), sheet: daftar
  };
}

function hitungSheetMonev_(nama, nilai) {
  var h = -1;
  for (var r = 0; r < Math.min(6, nilai.length); r++) {
    if (nilai[r].some(function (x) { return MONEV_KOLOM_PEGAWAI.test(String(x)); })) { h = r; break; }
  }
  if (h < 0) return { nama: nama, galat: 'Kolom "Nama Organik yang Ditugaskan" tidak ditemukan', baris: 0, hitung: [] };
  var kepala = nilai[h].map(function (x) { return String(x).replace(/\s+/g, ' ').trim(); });
  var iP = -1;
  kepala.forEach(function (x, i) { if (iP < 0 && MONEV_KOLOM_PEGAWAI.test(x)) iP = i; });
  var iS = [];
  MONEV_KOLOM_STATUS.forEach(function (re) { kepala.forEach(function (x, i) { if (re.test(x) && iS.indexOf(i) < 0) iS.push(i); }); });
  iS.sort(function (a, c) { return a - c; });
  var abaikan = {};
  abaikan[iP] = 1;
  iS.forEach(function (i) { abaikan[i] = 1; });
  kepala.forEach(function (x, i) { if (MONEV_KOLOM_ABAIKAN.test(x)) abaikan[i] = 1; });
  var hit = {}, n = 0;
  for (var b = h + 1; b < nilai.length; b++) {
    var row = nilai[b], isi = false;
    for (var j = 0; j < row.length; j++) {
      if (abaikan[j]) continue;
      var v = String(row[j]).trim();
      if (v !== '' && !/^(true|false)$/i.test(v)) { isi = true; break; }
    }
    if (!isi) continue;                                   // baris kosong / hanya kotak centang
    var peg = String(row[iP] || '').replace(/\s+/g, ' ').trim();
    var st = iS.map(function (i) { return String(row[i] || '').replace(/\s+/g, ' ').trim(); }).join(' | ');
    var k = peg + '\u0001' + st;
    hit[k] = (hit[k] || 0) + 1;
    n++;
  }
  return {
    nama: nama,
    kolomStatus: iS.map(function (i) { return kepala[i]; }),
    baris: n,
    hitung: Object.keys(hit).map(function (k) { var p = k.split('\u0001'); return [p[0], p[1], hit[k]]; })
  };
}

/* ---------- sumber data: link berkas, link folder, atau s.bps.go.id ---------- */
function cariSumberMonev_(sumber, keg) {
  var url = String(sumber || '').trim();
  if (/^(https?:\/\/)?s\.bps\.go\.id\//i.test(url)) url = bukaTautanPendek_(url);
  var id = idDrive_(url);
  if (!id) throw new Error('Link sumber tidak dikenali. Tempel link Google Sheets, berkas Excel di Drive, folder Drive, atau s.bps.go.id.');
  var f;
  try {
    f = v3_('files/' + id, { fields: 'id,name,mimeType,modifiedTime,trashed', supportsAllDrives: 'true' });
  } catch (e) {
    throw new Error('Gmail kantor PINTU tidak bisa membuka sumber data. Minta pemilik membagikan berkas/folder ke Gmail kantor (minimal Lihat), lalu coba lagi.');
  }
  if (f.mimeType === 'application/vnd.google-apps.folder') {
    var q = "'" + id + "' in parents and trashed = false and (mimeType = '" + MIME_SHEET + "' or mimeType = '" + MIME_XLSX + "')";
    var r = v3_('files', { q: q, fields: 'files(id,name,mimeType,modifiedTime)', orderBy: 'modifiedTime desc', pageSize: 200, supportsAllDrives: 'true', includeItemsFromAllDrives: 'true' });
    var cocok = (r.files || []).filter(function (x) { return keg.polaBerkas.test(x.name); });
    if (!cocok.length) throw new Error('Di folder sumber tidak ada spreadsheet yang namanya memuat 6403 atau Kukar.');
    f = cocok[0];
  }
  if (f.trashed) throw new Error('Berkas sumber sudah dihapus pemiliknya.');
  if (f.mimeType !== MIME_SHEET && f.mimeType !== MIME_XLSX) throw new Error('Sumber bukan Google Sheets atau Excel (.xlsx).');
  return f;
}

function bukaTautanPendek_(url) {
  var u = /^https?:\/\//i.test(url) ? url : 'https://' + url;
  for (var i = 0; i < 6; i++) {
    if (/(drive|docs)\.google\.com/i.test(u)) return u;
    var r = UrlFetchApp.fetch(u, { followRedirects: false, muteHttpExceptions: true });
    var hd = r.getAllHeaders(), lok = hd.Location || hd.location;
    if (Array.isArray(lok)) lok = lok[0];
    if (!lok) break;
    u = /^https?:\/\//i.test(lok) ? lok : u.replace(/^(https?:\/\/[^\/]+).*$/, '$1') + lok;
  }
  if (/(drive|docs)\.google\.com/i.test(u)) return u;
  throw new Error('Link pendek tidak mengarah ke Google Drive. Tempel link Drive-nya langsung.');
}

/* Excel (.xlsx) tidak bisa dibaca SpreadsheetApp: buat salinan Google Sheets di folder sistem.
   Salinan dipakai ulang selama berkas sumber belum berubah. */
function salinanSheetMonev_(id, src) {
  var p = props_(), kunci = 'MONEV_SALIN_' + id.replace(/\W/g, '_');
  var lama = null;
  try { lama = JSON.parse(p.getProperty(kunci) || 'null'); } catch (e) { lama = null; }
  if (lama && lama.src === src.id && lama.diubah === src.modifiedTime) {
    try { SpreadsheetApp.openById(lama.id); return lama.id; } catch (e) { /* buat ulang */ }
  }
  var r = UrlFetchApp.fetch('https://www.googleapis.com/drive/v3/files/' + src.id + '/copy?supportsAllDrives=true&fields=id', {
    method: 'post', contentType: 'application/json',
    payload: JSON.stringify({ name: 'Monev – salinan ' + src.name, mimeType: MIME_SHEET, parents: [folderSistem_().getId()] }),
    headers: { Authorization: 'Bearer ' + ScriptApp.getOAuthToken() }, muteHttpExceptions: true
  });
  if (r.getResponseCode() !== 200) throw new Error('Berkas Excel sumber gagal dibaca (' + r.getResponseCode() + '). Coba lagi beberapa menit lagi.');
  var baru = JSON.parse(r.getContentText()).id;
  if (lama && lama.id && lama.id !== baru) { try { DriveApp.getFileById(lama.id).setTrashed(true); } catch (e) { /* abaikan */ } }
  p.setProperty(kunci, JSON.stringify({ src: src.id, diubah: src.modifiedTime, id: baru }));
  return baru;
}

/* Satu penghitungan sekaligus per kegiatan; permintaan lain menunggu hasil di cache. */
function satuPenghitung_(kunci, fn) {
  var cache = CacheService.getScriptCache(), bendera = kunci + ':sedang';
  for (var i = 0; i < 20 && cache.get(bendera); i++) {
    Utilities.sleep(1500);
    var c = cache.get(kunci);
    if (c) return JSON.parse(c);
  }
  cache.put(bendera, '1', 90);
  try { return fn(); } finally { cache.remove(bendera); }
}

/* Uji dari editor: pilih fungsi ini → Jalankan → lihat Log eksekusi. */
function ujiMonev() {
  var atur = bacaPengaturan_()['monev:cleaning-se2026'];
  if (!atur) { console.log('Sumber belum diatur. Atur dari halaman monev (admin).'); return; }
  var h = hitungMonev_('cleaning-se2026', MONEV['cleaning-se2026'], atur);
  h.sheet.forEach(function (s) { console.log(s.nama + ': ' + s.baris + ' baris, status = ' + (s.kolomStatus || []).join(' + ')); });
}
