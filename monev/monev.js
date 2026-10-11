/* =====================================================================
   MONEV Kukar — fungsi bersama (sesi PINTU, panggilan server, tampilan)
   Halaman monev memakai akun PINTU yang sama: masuk sekali di PINTU,
   lalu buka menu Monev.
   ===================================================================== */
(function () {
  "use strict";
  var K = window.PINTU_KONFIG || {};
  var BACKEND = String(K.backend || "").trim();
  var K_SESI = "pintu-sesi";

  var ICONS = {
    clipboard: '<rect width="8" height="4" x="8" y="2" rx="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><path d="M12 11h4"/><path d="M12 16h4"/><path d="M8 11h.01"/><path d="M8 16h.01"/>',
    chart: '<path d="M3 3v16a2 2 0 0 0 2 2h16"/><path d="M18 17V9"/><path d="M13 17V5"/><path d="M8 17v-3"/>',
    search: '<circle cx="11" cy="11" r="7.5"/><path d="m20.5 20.5-4.2-4.2"/>',
    book: '<path d="M2 4h6a4 4 0 0 1 4 4v13a3 3 0 0 0-3-3H2z"/><path d="M22 4h-6a4 4 0 0 0-4 4v13a3 3 0 0 1 3-3h7z"/>',
    map: '<path d="M20 10c0 5-5.5 10.2-7.4 11.8a1 1 0 0 1-1.2 0C9.5 20.2 4 15 4 10a8 8 0 0 1 16 0"/><circle cx="12" cy="10" r="3"/>',
    external: '<path d="M15 3h6v6"/><path d="M10 14 21 3"/><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>',
    sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M6.3 17.7l-1.4 1.4M19.1 4.9l-1.4 1.4"/>',
    moon: '<path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/>',
    cycle: '<path d="M21 12a9 9 0 0 1-15.4 6.4L3 16"/><path d="M3 21v-5h5"/><path d="M3 12a9 9 0 0 1 15.4-6.4L21 8"/><path d="M21 3v5h-5"/>',
    download: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="m7 10 5 5 5-5"/><path d="M12 15V3"/>',
    upload: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="m17 8-5-5-5 5"/><path d="M12 3v12"/>',
    printer: '<path d="M6 9V2h12v7"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect width="12" height="8" x="6" y="14" rx="1"/>',
    users: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
    check: '<path d="M20 6 9 17l-5-5"/>',
    alert: '<path d="m21.7 18-8-14a2 2 0 0 0-3.5 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.7-3"/><path d="M12 9v4"/><path d="M12 17h.01"/>',
    info: '<circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/>',
    lock: '<rect width="16" height="11" x="4" y="11" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>',
    gear: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1Z"/>',
    arrow: '<path d="M5 12h14"/><path d="m13 6 6 6-6 6"/>',
    door: '<path d="M4 21V5a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v16"/><path d="M2 21h20"/><path d="M14 12v.01"/>',
    table: '<rect width="18" height="18" x="3" y="3" rx="2"/><path d="M3 9h18M3 15h18M9 3v18"/>',
    plus: '<path d="M5 12h14"/><path d="M12 5v14"/>'
  };
  function ic(nama) {
    return '<svg class="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + (ICONS[nama] || ICONS.info) + "</svg>";
  }
  function $(s, r) { return (r || document).querySelector(s); }
  function $$(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }
  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; });
  }
  function angka(n) { return Number(n || 0).toLocaleString("id-ID"); }
  function persen(a, b) { return b ? Math.round((a / b) * 1000) / 10 : 0; }
  function teksPersen(p) { return String(p).replace(".", ",") + "%"; }

  /* ---------- tema (sama dengan PINTU) ---------- */
  function temaGelap() {
    var t = document.documentElement.getAttribute("data-theme");
    if (t) return t === "dark";
    return window.matchMedia && matchMedia("(prefers-color-scheme: dark)").matches;
  }
  function renderTema() {
    var b = $("#tombol-tema");
    if (!b) return;
    var g = temaGelap();
    b.innerHTML = ic(g ? "sun" : "moon");
    b.setAttribute("aria-label", g ? "Pakai tema terang" : "Pakai tema gelap");
  }
  function gantiTema() {
    var gelap = !temaGelap();
    document.documentElement.setAttribute("data-theme", gelap ? "dark" : "light");
    try { localStorage.setItem("pintu-tema", gelap ? "gelap" : "terang"); } catch (e) { /* abaikan */ }
    renderTema();
  }

  /* ---------- sesi PINTU ---------- */
  function bacaSesi() {
    var raw = null;
    try { raw = sessionStorage.getItem(K_SESI) || localStorage.getItem(K_SESI); } catch (e) { raw = null; }
    if (!raw) return null;
    try {
      var s = JSON.parse(raw);
      if (s && s.id && /^[0-9a-f]{64}$/.test(s.t) && (!s.sampai || s.sampai > Date.now())) return s;
    } catch (e) { /* abaikan */ }
    return null;
  }
  var sesi = bacaSesi();

  function panggil(aksi, data) {
    if (!BACKEND) return Promise.reject(Object.assign(new Error("Alamat server PINTU belum diisi di assets/js/config.js."), { kode: "server" }));
    if (!sesi) return Promise.reject(Object.assign(new Error("Masuk dulu di PINTU."), { kode: "sesi" }));
    var badan = Object.assign({ aksi: aksi, sesi: { id: sesi.id, t: sesi.t } }, data || {});
    return fetch(BACKEND, { method: "POST", body: JSON.stringify(badan) })
      .then(function (r) { return r.text(); }, function () { throw Object.assign(new Error("Tidak terhubung ke server PINTU. Periksa internet lalu coba lagi."), { kode: "jaringan" }); })
      .then(function (teks) {
        var res;
        try { res = JSON.parse(teks); } catch (e) { throw Object.assign(new Error("Jawaban server PINTU tidak terbaca."), { kode: "server" }); }
        if (!res || !res.ok) {
          var pesan = (res && res.pesan) || "Permintaan gagal.";
          var kode = res && res.kode;
          if (/Aksi tidak dikenal|monev_ is not defined|monevAtur_ is not defined|Hanya pengelola/.test(pesan)) { kode = "belum-monev"; }
          throw Object.assign(new Error(pesan), { kode: kode });
        }
        return res;
      });
  }

  /* ---------- kepala halaman ---------- */
  function inisial(nama) { return String(nama || "?").trim().split(/\s+/).slice(0, 2).map(function (w) { return w.charAt(0); }).join("").toUpperCase(); }
  function siapkanKepala() {
    $$("[data-ikon]").forEach(function (el) { el.innerHTML = ic(el.getAttribute("data-ikon")); });
    var tt = $("#tombol-tema");
    if (tt) tt.addEventListener("click", gantiTema);
    renderTema();
    var ak = $("#akun");
    if (ak) {
      ak.innerHTML = sesi
        ? '<span class="avatar" aria-hidden="true">' + esc(inisial(sesi.nama || sesi.id)) + '</span><span class="akun-nama">' + esc(sesi.nama || sesi.id) + "</span>"
        : '<a class="tombol kecil aksen" href="../#/">Masuk</a>';
    }
    if (K.peta) $$("[data-peta]").forEach(function (a) { a.href = K.peta; });
    if (K.pintar) $$("[data-pintar]").forEach(function (a) { a.href = K.pintar; });
  }

  var toastT = null;
  function toast(pesan, ikon) {
    var t = $("#toast");
    if (!t) return;
    t.innerHTML = ic(ikon || "check") + "<span>" + esc(pesan) + "</span>";
    t.hidden = false;
    clearTimeout(toastT);
    toastT = setTimeout(function () { t.hidden = true; }, 3200);
  }

  function unduh(nama, isi, tipe) {
    var blob = new Blob([isi], { type: tipe || "text/csv;charset=utf-8" });
    var a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = nama;
    document.body.appendChild(a);
    a.click();
    setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 500);
  }

  window.Monev = {
    K: K, ic: ic, $: $, $$: $$, esc: esc, angka: angka, persen: persen, teksPersen: teksPersen,
    sesi: function () { return sesi; }, panggil: panggil, siapkanKepala: siapkanKepala, toast: toast, unduh: unduh
  };
})();
