/* =====================================================================
   MONEV Kukar — Cleaning Data Anomali SE2026
   Rekap "sudah / belum dilakukan" per pegawai untuk setiap sheet Verif.
   Sumber: server PINTU (Apps Script membaca spreadsheet tindak lanjut)
   atau berkas Excel yang dipilih pengguna (diolah di browser saja).
   ===================================================================== */
(function () {
  "use strict";
  var M = window.Monev, $ = M.$, $$ = M.$$, esc = M.esc, angka = M.angka, ic = M.ic;
  var KF = (window.MONEV_KONFIG || {}).cleaning || {};
  var KEG = KF.id || "cleaning-se2026";
  var POLA = new RegExp(KF.polaSheet || "^verif\\s*\\d", "i");
  var KOSONG = KF.kosong || "(Belum ditugaskan)";
  var XLSX_URL = "https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js";

  var S = { mentah: null, olah: null, pilih: "semua", q: "", urut: "pct-asc", admin: false, lokal: false };

  /* ---------------------------------------------------------------
     HITUNG DARI BARIS (sama dengan hitungSheetMonev_ di Monev.gs)
     --------------------------------------------------------------- */
  var RE_PEG = /nama\s+organik/i;
  var RE_STATUS = [/^status\s+tindak\s+lanjut$/i, /^tindak\s+lanjut\s+(oleh\s+)?kab/i, /apakah\s+status\s+keberadaan.*sesuai/i, /apakah\s+sudah\s+dilakukan\s+tindak\s+lanjut/i];
  var RE_ABAIKAN = /feedback|keterangan|rekomendasi/i;
  function bersih(x) { return String(x == null ? "" : x).replace(/\s+/g, " ").trim(); }
  function hitungSheet(nama, nilai) {
    var h = -1;
    for (var r = 0; r < Math.min(6, nilai.length); r++) {
      if ((nilai[r] || []).some(function (x) { return RE_PEG.test(String(x)); })) { h = r; break; }
    }
    if (h < 0) return { nama: nama, galat: 'Kolom "Nama Organik yang Ditugaskan" tidak ditemukan', baris: 0, hitung: [] };
    var kepala = nilai[h].map(bersih);
    var iP = -1;
    kepala.forEach(function (x, i) { if (iP < 0 && RE_PEG.test(x)) iP = i; });
    var iS = [];
    RE_STATUS.forEach(function (re) { kepala.forEach(function (x, i) { if (re.test(x) && iS.indexOf(i) < 0) iS.push(i); }); });
    iS.sort(function (a, b) { return a - b; });
    var abaikan = {};
    abaikan[iP] = 1;
    iS.forEach(function (i) { abaikan[i] = 1; });
    kepala.forEach(function (x, i) { if (RE_ABAIKAN.test(x)) abaikan[i] = 1; });
    var hit = {}, n = 0;
    for (var b = h + 1; b < nilai.length; b++) {
      var row = nilai[b] || [], isi = false;
      for (var j = 0; j < row.length; j++) {
        if (abaikan[j]) continue;
        var v = String(row[j] == null ? "" : row[j]).trim();
        if (v !== "" && !/^(true|false)$/i.test(v)) { isi = true; break; }
      }
      if (!isi) continue;
      var k = bersih(row[iP]) + "\u0001" + iS.map(function (i) { return bersih(row[i]); }).join(" | ");
      hit[k] = (hit[k] || 0) + 1;
      n++;
    }
    return { nama: nama, kolomStatus: iS.map(function (i) { return kepala[i]; }), baris: n, hitung: Object.keys(hit).map(function (k) { var p = k.split("\u0001"); return [p[0], p[1], hit[k]]; }) };
  }

  /* ---------------------------------------------------------------
     NAMA PEGAWAI: samakan nama panggilan dengan nama lengkap
     --------------------------------------------------------------- */
  function kunciNama(n) {
    return String(n || "").split(",")[0].normalize("NFKD").replace(/[̀-ͯ]/g, "").replace(/[^a-zA-Z0-9 ]+/g, " ").replace(/\s+/g, " ").trim().toLowerCase();
  }
  function rapikanTampil(n) {
    n = bersih(n);
    if (n && n === n.toUpperCase() && /[A-Z]/.test(n)) n = n.toLowerCase().replace(/(^|[\s.'(-])([a-z])/g, function (m, a, c) { return a + c.toUpperCase(); });
    return n;
  }
  function buatPemeta(semua) {
    var alias = {};
    Object.keys(KF.alias || {}).forEach(function (k) { alias[kunciNama(k)] = KF.alias[k]; });
    var kanon = {};
    semua.concat(Object.keys(alias).map(function (k) { return alias[k]; })).forEach(function (n) {
      n = bersih(n);
      if (!/,/.test(n)) return;                       // nama bergelar dianggap nama lengkap
      var k = kunciNama(n);
      if (!kanon[k] || n.length > kanon[k].length) kanon[k] = n;
    });
    var daftar = Object.keys(kanon);
    var cache = {};
    return function (raw) {
      raw = bersih(raw);
      if (!raw) return KOSONG;
      if (cache[raw]) return cache[raw];
      var k = kunciNama(raw), hasil;
      if (alias[k]) hasil = alias[k];
      else if (kanon[k]) hasil = kanon[k];
      else {
        var t = k.split(" ");
        var cocok = daftar.filter(function (c) {
          var ct = c.split(" ");
          return t.length <= ct.length && t.every(function (w, i) { return ct[i].indexOf(w) === 0; });
        });
        hasil = cocok.length === 1 ? kanon[cocok[0]] : rapikanTampil(raw);
      }
      cache[raw] = hasil;
      return hasil;
    };
  }

  /* ---------------------------------------------------------------
     STATUS: sudah / belum dilakukan
     --------------------------------------------------------------- */
  function penilai(kolom) {
    var iK = -1, iL = -1;
    (kolom || []).forEach(function (c, i) {
      if (/apakah\s+status\s+keberadaan/i.test(c)) iK = i;
      if (/apakah\s+sudah\s+dilakukan/i.test(c)) iL = i;
    });
    if (iK > -1 || iL > -1) {
      return function (st) {
        var p = st.split(" | ");
        var k = bersih(p[iK]), l = bersih(p[iL]);
        if (/^ya$/i.test(k)) return { sudah: true, label: "Status sudah sesuai (K = Ya)" };
        if (/^(true|ya|sudah|1|✓)$/i.test(l)) return { sudah: true, label: "Sudah ditindaklanjuti (L dicentang)" };
        return { sudah: false, label: k ? "Belum ditindaklanjuti (K = " + k + ")" : "Belum dicek" };
      };
    }
    return function (st) {
      var v = bersih(st.split(" | ")[0]);
      if (!v) return { sudah: false, label: "(kosong)" };
      if (/^belum/i.test(v)) return { sudah: false, label: v };
      return { sudah: true, label: v.replace(/\s*\(tuliskan.*$/i, "").replace(/,\s*isi penjelasan.*$/i, "") };
    };
  }

  function kodeVerif(nama) {
    var m = String(nama).match(/^verif\s*([\d.]+)/i);
    return m ? m[1].replace(/\.$/, "") : nama;
  }
  function urutKode(a, b) {
    var pa = String(a).split(".").map(Number), pb = String(b).split(".").map(Number);
    return (pa[0] - pb[0]) || ((pa[1] || 0) - (pb[1] || 0));
  }

  function olah(data) {
    var semuaNama = [];
    (data.sheet || []).forEach(function (s) { (s.hitung || []).forEach(function (h) { semuaNama.push(h[0]); }); });
    var peta = buatPemeta(semuaNama);
    var verif = [], peg = {};
    (data.sheet || []).filter(function (s) { return POLA.test(s.nama); }).forEach(function (s) {
      var kode = kodeVerif(s.nama);
      var v = { kode: kode, nama: s.nama, judul: (KF.judulVerif || {})[kode] || s.nama, total: 0, sudah: 0, per: {}, galat: s.galat || "" };
      if (!v.galat && !(s.kolomStatus || []).length) v.galat = "Kolom status tindak lanjut tidak ditemukan";
      var nilai = penilai(s.kolomStatus);
      (s.hitung || []).forEach(function (h) {
        var nm = peta(h[0]), n = +h[2] || 0, st = nilai(h[1] || "");
        var pv = v.per[nm] || (v.per[nm] = { t: 0, s: 0, rincian: {} });
        pv.t += n; if (st.sudah) pv.s += n;
        pv.rincian[st.label] = (pv.rincian[st.label] || 0) + n;
        if (v.galat) return;
        v.total += n; if (st.sudah) v.sudah += n;
        var pg = peg[nm] || (peg[nm] = { t: 0, s: 0, per: {} });
        pg.t += n; if (st.sudah) pg.s += n;
        var x = pg.per[kode] || (pg.per[kode] = { t: 0, s: 0 });
        x.t += n; if (st.sudah) x.s += n;
      });
      verif.push(v);
    });
    verif.sort(function (a, b) { return urutKode(a.kode, b.kode); });
    var total = 0, sudah = 0;
    verif.forEach(function (v) { if (!v.galat) { total += v.total; sudah += v.sudah; } });
    return { verif: verif, peg: peg, total: total, sudah: sudah };
  }

  /* ---------------------------------------------------------------
     TAMPILAN
     --------------------------------------------------------------- */
  function kelasP(p) { return p >= 100 ? "" : p >= 50 ? " p-sedang" : " p-rendah"; }
  function bilah(s, t) {
    var p = M.persen(s, t);
    return '<div class="bilah' + kelasP(p) + '" role="img" aria-label="' + M.teksPersen(p) + '"><i style="width:' + Math.min(100, p) + '%"></i></div>';
  }
  function progresSel(s, t) { return '<div class="progres-sel">' + bilah(s, t) + "<b>" + M.teksPersen(M.persen(s, t)) + "</b></div>"; }

  function tglIndo(x) {
    if (!x) return "";
    var d = typeof x === "number" ? new Date(x) : new Date(String(x).replace(" ", "T"));
    if (isNaN(d)) return String(x);
    var B = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];
    var p = function (n) { return n < 10 ? "0" + n : n; };
    return d.getDate() + " " + B[d.getMonth()] + " " + d.getFullYear() + ", " + p(d.getHours()) + "." + p(d.getMinutes());
  }

  function renderSumber() {
    var d = S.mentah, el = $("#sumber");
    if (!d) { el.innerHTML = ""; return; }
    el.innerHTML = '<span><span class="titik' + (S.lokal ? " lokal" : "") + '"></span><b>' + (S.lokal ? "File di perangkat ini" : "Spreadsheet tindak lanjut") + "</b></span>" +
      "<span>" + esc((d.sumber || {}).nama || "") + "</span>" +
      ((d.sumber || {}).diubah ? "<span>diubah " + esc(tglIndo(d.sumber.diubah)) + "</span>" : "") +
      (d.diambil ? "<span>dibaca " + esc(tglIndo(d.diambil)) + (d.dariCache ? " (cache, diperbarui tiap 10 menit)" : "") + "</span>" : "");
  }

  function renderKpi() {
    var o = S.olah, nPeg = Object.keys(o.peg).filter(function (n) { return n !== KOSONG; }).length;
    var p = M.persen(o.sudah, o.total);
    $("#kpi").innerHTML =
      '<div class="kpi-kotak utama"><small>Progres keseluruhan</small><b>' + M.teksPersen(p) + "</b>" + bilah(o.sudah, o.total) + "<span>" + angka(o.sudah) + " dari " + angka(o.total) + " tugas</span></div>" +
      '<div class="kpi-kotak"><small>Total tugas</small><b>' + angka(o.total) + "</b><span>" + o.verif.filter(function (v) { return !v.galat; }).length + " sheet verifikasi</span></div>" +
      '<div class="kpi-kotak sudah"><small>Sudah dilakukan</small><b>' + angka(o.sudah) + "</b><span>" + M.teksPersen(p) + "</span></div>" +
      '<div class="kpi-kotak belum"><small>Belum dilakukan</small><b>' + angka(o.total - o.sudah) + "</b><span>" + M.teksPersen(Math.round((100 - p) * 10) / 10) + "</span></div>" +
      '<div class="kpi-kotak"><small>Pegawai</small><b>' + angka(nPeg) + "</b><span>" + (o.peg[KOSONG] ? angka(o.peg[KOSONG].t) + " tugas belum ditugaskan" : "semua tugas sudah ditugaskan") + "</span></div>";
  }

  function renderVerif() {
    $("#grid-verif").innerHTML = S.olah.verif.map(function (v) {
      var p = M.persen(v.sudah, v.total);
      return '<button type="button" class="kartu-verif' + (v.galat ? " galat" : p >= 100 ? " selesai" : "") + '" data-v="' + esc(v.kode) + '" aria-pressed="' + (S.pilih === v.kode) + '">' +
        '<span class="kv-atas"><span class="kv-kode">Verif ' + esc(v.kode) + '</span><span class="kv-pct">' + (v.galat ? "–" : M.teksPersen(p)) + "</span></span>" +
        '<span class="kv-judul">' + esc(v.judul) + "</span>" +
        (v.galat ? '<span class="kv-angka">' + esc(v.galat) + "</span>" : bilah(v.sudah, v.total) + '<span class="kv-angka">' + angka(v.sudah) + " / " + angka(v.total) + " sudah · " + angka(v.total - v.sudah) + " belum</span>") +
        "</button>";
    }).join("");
  }

  function renderChips() {
    var h = '<button type="button" class="chip" data-v="semua" aria-pressed="' + (S.pilih === "semua") + '">Semua verifikasi</button>';
    S.olah.verif.forEach(function (v) {
      if (v.galat) return;
      h += '<button type="button" class="chip" data-v="' + esc(v.kode) + '" aria-pressed="' + (S.pilih === v.kode) + '">Verif ' + esc(v.kode) + "</button>";
    });
    $("#chips-verif").innerHTML = h;
  }

  function barisData() {
    var o = S.olah, rows = [];
    if (S.pilih === "semua") {
      Object.keys(o.peg).forEach(function (n) { var p = o.peg[n]; rows.push({ nama: n, t: p.t, s: p.s, per: p.per }); });
    } else {
      var v = o.verif.filter(function (x) { return x.kode === S.pilih; })[0];
      if (v) Object.keys(v.per).forEach(function (n) { var p = v.per[n]; rows.push({ nama: n, t: p.t, s: p.s, rincian: p.rincian }); });
    }
    var q = kunciNama(S.q);
    if (q) rows = rows.filter(function (r) { return kunciNama(r.nama).indexOf(q) > -1 || r.nama.toLowerCase().indexOf(S.q.toLowerCase()) > -1; });
    var pct = function (r) { return r.t ? r.s / r.t : 0; };
    var cmp = {
      "pct-asc": function (a, b) { return pct(a) - pct(b) || (b.t - b.s) - (a.t - a.s); },
      "pct-desc": function (a, b) { return pct(b) - pct(a) || b.s - a.s; },
      "belum": function (a, b) { return (b.t - b.s) - (a.t - a.s); },
      "tugas": function (a, b) { return b.t - a.t; },
      "nama": function (a, b) { return a.nama.localeCompare(b.nama, "id"); }
    }[S.urut];
    rows.sort(function (a, b) {
      if (a.nama === KOSONG) return 1;
      if (b.nama === KOSONG) return -1;
      return cmp(a, b) || a.nama.localeCompare(b.nama, "id");
    });
    return rows;
  }

  function selV(x) {
    if (!x || !x.t) return '<td class="sel-v"><span class="v-kosong">–</span></td>';
    var k = x.s >= x.t ? "v-penuh" : x.s > 0 ? "v-sebagian" : "v-nol";
    return '<td class="sel-v"><span class="' + k + '" title="' + x.s + " sudah dari " + x.t + ' tugas">' + x.s + "/" + x.t + "</span></td>";
  }

  function renderTabel() {
    var o = S.olah, rows = barisData(), semua = S.pilih === "semua";
    var vs = o.verif.filter(function (v) { return !v.galat; });
    var v1 = semua ? null : vs.filter(function (v) { return v.kode === S.pilih; })[0];
    $("#judul-tabel").textContent = semua ? "Semua verifikasi" : "Verif " + S.pilih + " · " + (v1 ? v1.judul : "");
    var head = "<tr><th>No</th><th>Pegawai</th><th class=\"angka\">Tugas</th><th class=\"angka\">Sudah</th><th class=\"angka\">Belum</th><th>Progres</th>" +
      (semua ? vs.map(function (v) { return '<th class="sel-v" title="' + esc(v.judul) + '">V' + esc(v.kode) + "</th>"; }).join("") : "<th>Rincian status</th>") + "</tr>";
    var tt = 0, ts = 0, perT = {};
    var body = rows.map(function (r, i) {
      tt += r.t; ts += r.s;
      if (semua) vs.forEach(function (v) { var x = r.per[v.kode]; if (x) { var a = perT[v.kode] || (perT[v.kode] = { t: 0, s: 0 }); a.t += x.t; a.s += x.s; } });
      var b = r.t - r.s;
      return "<tr><td class=\"nomor\">" + (i + 1) + '</td><td class="nama">' + esc(r.nama) + "</td>" +
        '<td class="angka">' + angka(r.t) + '</td><td class="angka sudah">' + angka(r.s) + '</td><td class="angka belum' + (b ? "" : " nol") + '">' + angka(b) + "</td>" +
        "<td>" + progresSel(r.s, r.t) + "</td>" +
        (semua ? vs.map(function (v) { return selV(r.per[v.kode]); }).join("")
          : '<td class="rincian">' + Object.keys(r.rincian).sort(function (a, c) { return r.rincian[c] - r.rincian[a]; }).map(function (k) { return esc(k) + ": <b>" + angka(r.rincian[k]) + "</b>"; }).join(" · ") + "</td>") +
        "</tr>";
    }).join("");
    if (!rows.length) body = '<tr><td colspan="' + (semua ? 6 + vs.length : 7) + '"><div class="kosong"><h3>Tidak ada pegawai yang cocok</h3><p>Coba kata kunci lain.</p></div></td></tr>';
    else body += '<tr class="total"><td></td><td>Total' + (S.q ? " (hasil saring)" : "") + '</td><td class="angka">' + angka(tt) + '</td><td class="angka sudah">' + angka(ts) + '</td><td class="angka belum">' + angka(tt - ts) + "</td><td>" + progresSel(ts, tt) + "</td>" +
      (semua ? vs.map(function (v) { return selV(perT[v.kode]); }).join("") : "<td></td>") + "</tr>";
    $("#tabel-rekap").innerHTML = "<thead>" + head + "</thead><tbody>" + body + "</tbody>";
    $("#jumlah-tabel").textContent = rows.filter(function (r) { return r.nama !== KOSONG; }).length + " pegawai";
  }

  function renderCara() {
    var A = KF.aturanVerif || {};
    var kode = S.olah ? S.olah.verif.map(function (v) { return v.kode; }) : Object.keys(KF.judulVerif || {}).sort(urutKode);
    $("#cara-aturan").innerHTML = kode.map(function (k) { return "<dt>Verif " + esc(k) + "</dt><dd>" + esc(A[k] || "Kolom status tindak lanjut terisi selain \"Belum\".") + "</dd>"; }).join("");
  }

  function renderSemua() {
    S.olah = olah(S.mentah);
    ["#bag-kpi", "#bag-verif", "#bag-rekap"].forEach(function (s) { $(s).hidden = false; });
    if (S.pilih !== "semua" && !S.olah.verif.some(function (v) { return v.kode === S.pilih && !v.galat; })) S.pilih = "semua";
    renderSumber(); renderKpi(); renderVerif(); renderChips(); renderTabel(); renderCara();
    $("#tombol-csv").disabled = false;
    $("#tombol-cetak").disabled = false;
  }

  function pilihVerif(kode) {
    S.pilih = kode;
    try { history.replaceState(null, "", kode === "semua" ? location.pathname : "#v=" + encodeURIComponent(kode)); } catch (e) { /* abaikan */ }
    renderVerif(); renderChips(); renderTabel();
  }

  /* ---------------- pesan & panel admin ---------------- */
  function pesan(jenis, ikon, judul, isi, aksi) {
    $("#pesan").innerHTML = '<section class="kotak-info ' + (jenis || "") + '">' + ic(ikon || "info") + "<div><h3>" + esc(judul) + "</h3>" + isi + (aksi ? '<div class="aksi">' + aksi + "</div>" : "") + "</div></section>";
  }
  var AKSI_FILE = '<button class="tombol hantu" type="button" data-aksi="file">' + ic("upload") + "Pakai file Excel</button>";
  var AKSI_MASUK = '<a class="tombol" href="../#/">Masuk di PINTU</a>';

  function renderAdmin(siap) {
    var p = $("#panel-admin");
    if (!S.admin) { p.hidden = true; return; }
    p.hidden = false;
    var sm = S.mentah && S.mentah.sumber ? S.mentah.sumber.nama : "";
    $("#admin-isi").innerHTML = "<p>" + (siap ? "Sumber saat ini: <b>" + esc(sm) + "</b>. Ganti bila Provinsi membuat berkas baru." : "Sumber data belum diatur.") +
      " Tempel link Google Sheets, berkas Excel di Drive, folder Drive tindak lanjut, atau link <b>s.bps.go.id/tindaklanjutse64</b>. Gmail kantor PINTU harus bisa membuka berkas tersebut.</p>";
  }

  /* ---------------- muat data ---------------- */
  function muatServer(segar) {
    var sesi = M.sesi();
    if (!sesi) {
      pesan("", "lock", "Masuk dengan akun PINTU", "<p>Data monev hanya untuk pegawai BPS Kukar. Masuk dulu di PINTU, lalu buka menu <b>Monev</b> lagi.</p><p>Bisa juga memakai file Excel tindak lanjut (diolah di perangkat ini saja, tidak diunggah).</p>", AKSI_MASUK + AKSI_FILE);
      return Promise.resolve();
    }
    $("#tombol-segar").disabled = true;
    if (!S.mentah) $("#pesan").innerHTML = '<p class="muat-baris"><span class="putar" aria-hidden="true"></span>Mengambil data dari spreadsheet tindak lanjut…</p>';
    var pr = sesi.peran === "pengelola" || sesi.peran === "admin";
    return M.panggil("monev", { kegiatan: KEG, segar: !!(segar && pr) }).then(function (res) {
      S.admin = !!res.admin;
      if (!res.siap) {
        S.mentah = null;
        pesan("peringatan", "gear", "Sumber data belum diatur", S.admin ? "<p>Tempel link sumber data di panel <b>Sumber data</b> di bawah.</p>" : "<p>Admin PINTU perlu menempel link spreadsheet tindak lanjut di halaman ini. Sementara itu, gunakan file Excel.</p>", S.admin ? "" : AKSI_FILE);
        renderAdmin(false);
        return;
      }
      S.mentah = res; S.lokal = false;
      $("#pesan").innerHTML = "";
      renderSemua(); renderAdmin(true);
      if (segar) M.toast("Data diperbarui");
    }).catch(function (err) {
      if (err.kode === "sesi") pesan("peringatan", "lock", "Sesi PINTU berakhir", "<p>" + esc(err.message) + "</p>", AKSI_MASUK + AKSI_FILE);
      else if (err.kode === "belum-monev") pesan("peringatan", "gear", "Server PINTU belum memasang modul Monev", "<p>Admin perlu menambahkan <b>Monev.gs</b> ke Apps Script PINTU lalu menerbitkan versi baru (lihat README bagian Monev). Sementara itu, gunakan file Excel.</p>", AKSI_FILE);
      else if (S.mentah) M.toast(err.message, "alert");
      else pesan("bahaya", "alert", "Data belum bisa diambil", "<p>" + esc(err.message) + "</p>", '<button class="tombol" type="button" data-aksi="ulang">' + ic("cycle") + "Coba lagi</button>" + AKSI_FILE);
    }).then(function () { $("#tombol-segar").disabled = false; });
  }

  var xlsxSiap = null;
  function muatXlsx() {
    if (window.XLSX) return Promise.resolve(window.XLSX);
    if (xlsxSiap) return xlsxSiap;
    xlsxSiap = new Promise(function (ok, gagal) {
      var s = document.createElement("script");
      s.src = XLSX_URL; s.onload = function () { ok(window.XLSX); };
      s.onerror = function () { xlsxSiap = null; gagal(new Error("Pembaca Excel gagal dimuat. Periksa internet.")); };
      document.head.appendChild(s);
    });
    return xlsxSiap;
  }
  function bacaFile(file) {
    if (!file) return;
    $("#pesan").innerHTML = '<p class="muat-baris"><span class="putar" aria-hidden="true"></span>Membaca ' + esc(file.name) + "…</p>";
    muatXlsx().then(function (X) {
      return file.arrayBuffer().then(function (buf) {
        var wb = X.read(buf, { type: "array", cellDates: false });
        var sheet = wb.SheetNames.filter(function (n) { return POLA.test(n); }).map(function (n) {
          return hitungSheet(n, X.utils.sheet_to_json(wb.Sheets[n], { header: 1, raw: false, defval: "" }));
        });
        if (!sheet.length) throw new Error("Tidak ada sheet bernama Verif… di file ini. Pilih file tindak lanjut Kab/Kota (mis. 6403_Kukar.xlsx).");
        S.mentah = { ok: true, siap: true, sumber: { nama: file.name, diubah: file.lastModified }, diambil: Date.now(), sheet: sheet };
        S.lokal = true;
        $("#pesan").innerHTML = "";
        renderSemua();
        M.toast("File dibaca: " + sheet.length + " sheet verifikasi");
      });
    }).catch(function (err) {
      pesan("bahaya", "alert", "File tidak bisa dibaca", "<p>" + esc(err.message) + "</p>", AKSI_FILE);
    });
  }

  /* ---------------- CSV ---------------- */
  function csv() {
    if (!S.olah) return;
    var o = S.olah, semua = S.pilih === "semua", vs = o.verif.filter(function (v) { return !v.galat; });
    var sel = function (x) { x = String(x == null ? "" : x); return /[";\n]/.test(x) ? '"' + x.replace(/"/g, '""') + '"' : x; };
    var kepala = ["No", "Pegawai", "Tugas", "Sudah dilakukan", "Belum dilakukan", "Progres (%)"];
    if (semua) vs.forEach(function (v) { kepala.push("Verif " + v.kode + " sudah", "Verif " + v.kode + " tugas"); });
    var baris = [kepala];
    barisData().forEach(function (r, i) {
      var b = [i + 1, r.nama, r.t, r.s, r.t - r.s, String(M.persen(r.s, r.t)).replace(".", ",")];
      if (semua) vs.forEach(function (v) { var x = r.per[v.kode]; b.push(x ? x.s : "", x ? x.t : ""); });
      baris.push(b);
    });
    var d = new Date(), p = function (n) { return n < 10 ? "0" + n : n; };
    var nama = "rekap_cleaning_SE2026_" + (semua ? "semua" : "verif" + S.pilih) + "_" + d.getFullYear() + p(d.getMonth() + 1) + p(d.getDate()) + ".csv";
    M.unduh(nama, "﻿" + baris.map(function (b) { return b.map(sel).join(";"); }).join("\r\n"));
  }

  /* ---------------- mulai ---------------- */
  function mulai() {
    M.siapkanKepala();
    var m = location.hash.match(/^#v=([\d.]+)/);
    if (m) S.pilih = decodeURIComponent(m[1]);
    renderCara();
    document.addEventListener("click", function (e) {
      var t = e.target.closest("[data-v],[data-aksi]");
      if (!t) return;
      if (t.hasAttribute("data-v")) { var k = t.getAttribute("data-v"); pilihVerif(S.pilih === k && t.classList.contains("kartu-verif") ? "semua" : k); if (t.classList.contains("kartu-verif")) $("#bag-rekap").scrollIntoView({ behavior: "smooth", block: "start" }); return; }
      var a = t.getAttribute("data-aksi");
      if (a === "file") $("#input-file").click();
      if (a === "ulang") muatServer(false);
    });
    $("#input-file").addEventListener("change", function () { bacaFile(this.files[0]); this.value = ""; });
    $("#tombol-file").addEventListener("click", function () { $("#input-file").click(); });
    $("#tombol-segar").addEventListener("click", function () { if (S.lokal) { S.lokal = false; S.mentah = null; } muatServer(true); });
    $("#tombol-csv").addEventListener("click", csv);
    $("#tombol-cetak").addEventListener("click", function () { window.print(); });
    $("#q").addEventListener("input", function () { S.q = this.value; renderTabel(); });
    $("#urut").addEventListener("change", function () { S.urut = this.value; renderTabel(); });
    $("#form-sumber").addEventListener("submit", function (e) {
      e.preventDefault();
      var inp = $("#input-sumber"), btn = $("#simpan-sumber");
      if (!inp.value.trim()) { inp.focus(); return; }
      btn.disabled = true; btn.textContent = "Memeriksa…";
      M.panggil("monevAtur", { kegiatan: KEG, sumber: inp.value.trim() }).then(function (res) {
        S.mentah = res; S.lokal = false; S.admin = true; inp.value = "";
        $("#pesan").innerHTML = "";
        renderSemua(); renderAdmin(true);
        M.toast("Sumber data disimpan");
      }).catch(function (err) { M.toast(err.message, "alert"); }).then(function () { btn.disabled = false; btn.textContent = "Simpan"; });
    });
    var drop = document.body;
    drop.addEventListener("dragover", function (e) { if (e.dataTransfer && Array.prototype.indexOf.call(e.dataTransfer.types || [], "Files") > -1) e.preventDefault(); });
    drop.addEventListener("drop", function (e) { var f = e.dataTransfer && e.dataTransfer.files[0]; if (f && /\.xlsx?$/i.test(f.name)) { e.preventDefault(); bacaFile(f); } });
    muatServer(false);
  }

  window.MonevCleaning = { hitungSheet: hitungSheet, olah: olah, buatPemeta: buatPemeta };
  mulai();
})();
