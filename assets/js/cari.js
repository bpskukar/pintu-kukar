/* =====================================================================
   PINTU — mesin pencari di browser
   Item: [kunci, nama, jenis, nomorInduk, ubahMenit, nomorFolder, kb, buatMenit, target]
   nomorInduk 1 = Drive Saya, 2 = Dibagikan ke akun ini.
   ===================================================================== */
(function (global) {
  "use strict";

  function norm(s) {
    return String(s == null ? "" : s).toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "")
      .replace(/[^a-z0-9]+/g, " ").trim();
  }
  function pecah(s) { return s.replace(/([a-z])(\d)/g, "$1 $2").replace(/(\d)([a-z])/g, "$1 $2"); }
  function teksCari(s) { var n = norm(s), p = pecah(n); return " " + n + " " + (p !== n ? p + " " : ""); }

  var JENIS = {
    f: { label: "Folder", kode: "DIR", grup: "folder" },
    d: { label: "Google Docs", kode: "DOC", grup: "dok" },
    w: { label: "Word", kode: "DOC", grup: "dok" },
    c: { label: "Teks", kode: "TXT", grup: "dok" },
    s: { label: "Google Sheets", kode: "SHEET", grup: "tabel" },
    x: { label: "Excel / CSV", kode: "XLS", grup: "tabel" },
    p: { label: "Google Slides", kode: "SLIDE", grup: "slide" },
    t: { label: "PowerPoint", kode: "PPT", grup: "slide" },
    a: { label: "PDF", kode: "PDF", grup: "pdf" },
    i: { label: "Gambar", kode: "IMG", grup: "media" },
    v: { label: "Video / audio", kode: "VID", grup: "media" },
    z: { label: "Arsip ZIP/RAR", kode: "ZIP", grup: "lain" },
    o: { label: "Google Forms", kode: "FORM", grup: "lain" },
    g: { label: "Google lainnya", kode: "GAPP", grup: "lain" },
    n: { label: "Berkas lain", kode: "FILE", grup: "lain" }
  };
  var GRUP = [
    { id: "semua", label: "Semua" }, { id: "folder", label: "Folder" }, { id: "dok", label: "Dokumen" },
    { id: "tabel", label: "Spreadsheet" }, { id: "pdf", label: "PDF" }, { id: "slide", label: "Presentasi" },
    { id: "media", label: "Gambar & video" }, { id: "lain", label: "Lainnya" }
  ];

  function Mesin() { this.kosongkan(); }
  Mesin.prototype.kosongkan = function () {
    this.item = []; this.perKunci = {}; this.folder = {}; this.anak = {}; this.idKeNomor = {};
    this.teks = []; this.jalurTeks = {}; this.jalurNama = {}; this.kataKunci = {}; this.labelPeta = {};
    this.akar = { 1: "Drive Saya", 2: "Dibagikan ke akun ini" };
  };

  /* labelPeta: { idBerkas: { kata, label, catatan } } */
  Mesin.prototype.bangun = function (item, akar, labelPeta) {
    this.kosongkan();
    var self = this;
    if (akar) akar.forEach(function (a) { self.akar[a[0]] = a[1]; });
    this.item = item;
    item.forEach(function (it) {
      self.perKunci[it[0]] = it;
      if (it[5]) { self.folder[it[5]] = it; self.idKeNomor[it[0]] = it[5]; }
      (self.anak[it[3]] = self.anak[it[3]] || []).push(it);
    });
    this.teks = item.map(function (it) { return teksCari(it[1]); });
    this.pasangLabel(labelPeta || {});
  };
  Mesin.prototype.pasangLabel = function (labelPeta) {
    var self = this;
    this.labelPeta = labelPeta || {};
    this.kataKunci = {};
    Object.keys(this.labelPeta).forEach(function (id) {
      var l = self.labelPeta[id];
      self.kataKunci[id] = teksCari([l.kata, l.label, l.catatan].join(" "));
    });
  };
  Mesin.prototype.terapkanDelta = function (ubah, hapus) {
    var peta = {};
    this.item.forEach(function (it) { peta[it[0]] = it; });
    (hapus || []).forEach(function (k) { delete peta[k]; });
    (ubah || []).forEach(function (it) { peta[it[0]] = it; });
    return Object.keys(peta).map(function (k) { return peta[k]; });
  };

  /* Jalur folder: daftar [nomor, nama] dari akar sampai folder itu. */
  Mesin.prototype.jalur = function (nomor) {
    if (this.jalurNama[nomor]) return this.jalurNama[nomor];
    var hasil = [], n = nomor, jaga = 0;
    while (n && jaga++ < 80) {
      if (this.akar[n] && !this.folder[n]) { hasil.unshift([n, this.akar[n]]); break; }
      var f = this.folder[n];
      if (!f) { hasil.unshift([2, this.akar[2]]); break; }
      hasil.unshift([n, f[1]]);
      n = f[3];
    }
    this.jalurNama[nomor] = hasil;
    return hasil;
  };
  Mesin.prototype.teksJalur = function (nomor) {
    if (this.jalurTeks[nomor] != null) return this.jalurTeks[nomor];
    var t = teksCari(this.jalur(nomor).map(function (x) { return x[1]; }).join(" "));
    this.jalurTeks[nomor] = t;
    return t;
  };
  /* Apakah item/folder berada di dalam folder `akarNomor` (berapa pun dalamnya)? */
  Mesin.prototype.pembatas = function (akarNomor) {
    var self = this, memo = {};
    memo[akarNomor] = true;
    return function (nomorInduk) {
      var rantai = [], n = nomorInduk, jaga = 0, hasil = false;
      while (n && jaga++ < 80) {
        if (memo[n] !== undefined) { hasil = memo[n]; break; }
        rantai.push(n);
        var f = self.folder[n];
        if (!f) { hasil = false; break; }
        n = f[3];
      }
      rantai.forEach(function (x) { memo[x] = hasil; });
      return hasil;
    };
  };

  /* Pencarian utama.
     opsi: { grup, sejakMenit, dalam (nomor folder), batas } */
  Mesin.prototype.cari = function (q, opsi) {
    opsi = opsi || {};
    var token = norm(q).split(" ").filter(Boolean);
    var seen = {};
    token = token.filter(function (t) { if (seen[t]) return false; seen[t] = 1; return true; }).slice(0, 8);
    var grup = opsi.grup && opsi.grup !== "semua" ? opsi.grup : null;
    var dalam = opsi.dalam ? this.pembatas(opsi.dalam) : null;
    var sejak = opsi.sejakMenit || 0;
    var nq = norm(q);
    var sekarang = Date.now() / 60000;
    var hasil = [];
    var item = this.item, teks = this.teks, self = this;
    for (var i = 0; i < item.length; i++) {
      var it = item[i];
      if (grup && (JENIS[it[2]] || JENIS.n).grup !== grup) continue;
      if (sejak && it[4] < sejak) continue;
      if (dalam && !dalam(it[3])) continue;
      var nama = teks[i], skor = 0, semuaDiNama = true, kw = self.kataKunci[it[8] || it[0]] || self.kataKunci[it[0]] || "";
      var jalurT = null, ok = true;
      for (var j = 0; j < token.length; j++) {
        var t = token[j];
        if (nama.indexOf(" " + t + " ") > -1) skor += 12;
        else if (nama.indexOf(" " + t) > -1) skor += 9;
        else if (t.length > 2 && nama.indexOf(t) > -1) skor += 5;
        else {
          semuaDiNama = false;
          if (kw && kw.indexOf(" " + t) > -1) skor += 8;
          else {
            if (jalurT === null) jalurT = self.teksJalur(it[3]);
            if (jalurT.indexOf(" " + t) > -1) skor += 2;
            else { ok = false; break; }
          }
        }
      }
      if (!ok) continue;
      if (token.length) {
        if (semuaDiNama) skor += 6;
        var nn = nama.trim();
        if (nn === nq || nn.replace(/ (pdf|docx?|xlsx?|pptx?|csv|jpe?g|png|zip)$/, "") === nq) skor += 15;
        else if (nama.indexOf(" " + token[0]) === 0) skor += 3;
      }
      if (kw) skor += 2;
      if (it[2] === "f") skor += 1;
      var umurHari = (sekarang - it[4]) / 1440;
      skor += umurHari < 30 ? 3 : umurHari < 180 ? 2 : umurHari < 400 ? 1 : 0;
      hasil.push({ it: it, skor: skor });
    }
    if (opsi.urut === "baru" || !token.length) hasil.sort(function (a, b) { return b.it[4] - a.it[4]; });
    else hasil.sort(function (a, b) { return b.skor - a.skor || b.it[4] - a.it[4]; });
    return { total: hasil.length, hasil: hasil.slice(0, opsi.batas || 500), token: token };
  };

  /* Berkas terbaru. opsi: { menurut: "ubah"|"buat", sejakMenit, grup, dalam, folder (ikutkan folder?) } */
  Mesin.prototype.terbaru = function (opsi) {
    opsi = opsi || {};
    var idx = opsi.menurut === "buat" ? 7 : 4;
    var grup = opsi.grup && opsi.grup !== "semua" ? opsi.grup : null;
    var dalam = opsi.dalam ? this.pembatas(opsi.dalam) : null;
    var sejak = opsi.sejakMenit || 0;
    var hasil = this.item.filter(function (it) {
      if (it[2] === "f" && !opsi.folder && grup !== "folder") return false;
      if (grup && (JENIS[it[2]] || JENIS.n).grup !== grup) return false;
      if (sejak && (it[idx] || 0) < sejak) return false;
      if (dalam && !dalam(it[3])) return false;
      return true;
    });
    hasil.sort(function (a, b) { return (b[idx] || 0) - (a[idx] || 0); });
    return hasil.slice(0, opsi.batas || 400);
  };

  Mesin.prototype.isiFolder = function (nomor) {
    var daftar = (this.anak[nomor] || []).slice();
    daftar.sort(function (a, b) {
      var fa = a[2] === "f" ? 0 : 1, fb = b[2] === "f" ? 0 : 1;
      return fa - fb || a[1].localeCompare(b[1], "id", { numeric: true, sensitivity: "base" });
    });
    return daftar;
  };

  /* Bagian nama yang cocok dengan kata kunci → [[awal, akhir], ...] */
  function sorot(nama, token) {
    var rendah = String(nama).toLowerCase(), rentang = [];
    token.forEach(function (t) {
      if (!t) return;
      var dari = 0, pos;
      while ((pos = rendah.indexOf(t, dari)) > -1) {
        var sebelum = pos === 0 ? "" : rendah.charAt(pos - 1);
        var batas = !sebelum || !/[a-z0-9]/.test(sebelum) || (/\d/.test(t.charAt(0)) !== /\d/.test(sebelum));
        if (batas || t.length > 2) { rentang.push([pos, pos + t.length]); }
        dari = pos + t.length;
      }
    });
    rentang.sort(function (a, b) { return a[0] - b[0]; });
    var gabung = [];
    rentang.forEach(function (r) { var l = gabung[gabung.length - 1]; if (l && r[0] <= l[1]) l[1] = Math.max(l[1], r[1]); else gabung.push(r.slice()); });
    return gabung;
  }

  function urlDrive(it) {
    var id = it[8] || it[0], j = it[2];
    if (j === "f") return "https://drive.google.com/drive/folders/" + id;
    if (j === "d") return "https://docs.google.com/document/d/" + id + "/edit";
    if (j === "s") return "https://docs.google.com/spreadsheets/d/" + id + "/edit";
    if (j === "p") return "https://docs.google.com/presentation/d/" + id + "/edit";
    if (j === "o") return "https://docs.google.com/forms/d/" + id + "/edit";
    return "https://drive.google.com/file/d/" + id + "/view";
  }
  function idDrive(url) {
    var u = String(url || "").trim();
    var m = u.match(/\/folders\/([\w-]{15,})/) || u.match(/\/d\/([\w-]{15,})/) || u.match(/[?&]id=([\w-]{15,})/);
    if (m) return m[1];
    return /^[\w-]{20,}$/.test(u) ? u : "";
  }

  global.PintuCari = { Mesin: Mesin, norm: norm, JENIS: JENIS, GRUP: GRUP, sorot: sorot, urlDrive: urlDrive, idDrive: idDrive };
})(typeof window !== "undefined" ? window : globalThis);
