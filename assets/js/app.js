/* =====================================================================
   PINTU Kukar — aplikasi
   ===================================================================== */
(function () {
  "use strict";
  var K = window.PINTU_KONFIG || {};
  var PC = window.PintuCari;
  var BACKEND = String(K.backend || "").trim();

  /* ---------------- ikon ---------------- */
  var ICONS = {
    arrow: '<path d="M5 12h14"/><path d="m13 6 6 6-6 6"/>',
    tag: '<path d="M12.6 2.6A2 2 0 0 0 11.2 2H4a2 2 0 0 0-2 2v7.2a2 2 0 0 0 .6 1.4l8.7 8.7a2.4 2.4 0 0 0 3.4 0l6.6-6.6a2.4 2.4 0 0 0 0-3.4z"/><circle cx="7.5" cy="7.5" r="1.5"/>',
    user: '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
    shield: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/>',
    eye: '<path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/>',
    eyeoff: '<path d="M9.9 4.2A10 10 0 0 1 12 4c6.4 0 10 8 10 8a17 17 0 0 1-2.2 3.2"/><path d="M6.6 6.6C3.8 8.4 2 12 2 12s3.6 8 10 8c1.9 0 3.6-.6 5-1.5"/><path d="M9.9 9.9a3 3 0 0 0 4.2 4.2"/><path d="m2 2 20 20"/>',
    up: '<path d="m18 15-6-6-6 6"/>',
    down: '<path d="m6 9 6 6 6-6"/>',
    left: '<path d="m15 18-6-6 6-6"/>',
    right: '<path d="m9 18 6-6-6-6"/>',
    textsearch: '<path d="M21 6H3"/><path d="M10 12H3"/><path d="M10 18H3"/><circle cx="17" cy="15" r="3"/><path d="m21 19-1.9-1.9"/>',
    door: '<path d="M4 21V5a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v16"/><path d="M2 21h20"/><path d="M14 12v.01"/>',
    search: '<circle cx="11" cy="11" r="7.5"/><path d="m20.5 20.5-4.2-4.2"/>',
    folder: '<path d="M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z"/>',
    file: '<path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M16 13H8"/><path d="M16 17H8"/><path d="M10 9H8"/>',
    sheet: '<path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M8 12h8v6H8z"/><path d="M12 12v6"/><path d="M8 15h8"/>',
    image: '<rect width="18" height="18" x="3" y="3" rx="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.1-3.1a2 2 0 0 0-2.8 0L6 21"/>',
    video: '<path d="m16 13 5.2 3.5a.5.5 0 0 0 .8-.4V7.9a.5.5 0 0 0-.8-.4L16 10.5"/><rect x="2" y="6" width="14" height="12" rx="2"/>',
    external: '<path d="M15 3h6v6"/><path d="M10 14 21 3"/><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>',
    copy: '<rect width="13" height="13" x="9" y="9" rx="2"/><path d="M5 15a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2"/>',
    check: '<path d="M20 6 9 17l-5-5"/>',
    lock: '<rect width="16" height="11" x="4" y="11" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>',
    users: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
    home: '<path d="M3 10a2 2 0 0 1 .7-1.5l7-6a2 2 0 0 1 2.6 0l7 6A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8"/>',
    store: '<path d="M3 9 5 3h14l2 6"/><path d="M3 9a3 3 0 0 0 6 0 3 3 0 0 0 6 0 3 3 0 0 0 6 0"/><path d="M5 12v9h14v-9"/><path d="M10 21v-5h4v5"/>',
    map: '<path d="M20 10c0 5-5.5 10.2-7.4 11.8a1 1 0 0 1-1.2 0C9.5 20.2 4 15 4 10a8 8 0 0 1 16 0"/><circle cx="12" cy="10" r="3"/>',
    heart: '<path d="M19 14c1.5-1.5 3-3.2 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.8 0-3 .5-4.5 2-1.5-1.5-2.7-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4 3 5.5l7 7Z"/><path d="M3.2 12h6.3l.5-1 2 4.5 2-7 1.5 3.5h5.3"/>',
    school: '<path d="M21.4 10.9a1 1 0 0 0 0-1.8l-8.6-3.9a2 2 0 0 0-1.6 0L2.6 9.1a1 1 0 0 0 0 1.8l8.6 3.9a2 2 0 0 0 1.6 0z"/><path d="M22 10v6"/><path d="M6 12.5V16a6 3 0 0 0 12 0v-3.5"/>',
    book: '<path d="M2 4h6a4 4 0 0 1 4 4v13a3 3 0 0 0-3-3H2z"/><path d="M22 4h-6a4 4 0 0 0-4 4v13a3 3 0 0 1 3-3h7z"/>',
    clipboard: '<rect width="8" height="4" x="8" y="2" rx="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><path d="M12 11h4"/><path d="M12 16h4"/><path d="M8 11h.01"/><path d="M8 16h.01"/>',
    landmark: '<path d="M3 22h18"/><path d="M6 18v-7"/><path d="M10 18v-7"/><path d="M14 18v-7"/><path d="M18 18v-7"/><path d="M12 2 20 7H4z"/>',
    layers: '<path d="M12.8 2.2a2 2 0 0 0-1.6 0L2.6 6.1a1 1 0 0 0 0 1.8l8.6 3.9a2 2 0 0 0 1.6 0l8.6-3.9a1 1 0 0 0 0-1.8Z"/><path d="m22 17.6-9.2 4.2a2 2 0 0 1-1.6 0L2 17.6"/><path d="m22 12.6-9.2 4.2a2 2 0 0 1-1.6 0L2 12.6"/>',
    camera: '<path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3z"/><circle cx="12" cy="13" r="3"/>',
    archive: '<rect width="20" height="5" x="2" y="3" rx="1"/><path d="M4 8v11a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8"/><path d="M10 12h4"/>',
    chart: '<path d="M3 3v16a2 2 0 0 0 2 2h16"/><path d="M18 17V9"/><path d="M13 17V5"/><path d="M8 17v-3"/>',
    leaf: '<path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.5 19 2c1 2 2 4.2 2 8 0 5.5-4.8 10-10 10Z"/><path d="M2 21c0-3 1.9-5.4 5.1-6C9.5 14.5 12 13 13 12"/>',
    fish: '<path d="M6.5 12c.9-3.5 4.9-6 8.5-6s6.1 2.5 7 6c-.9 3.5-3.4 6-7 6s-7.6-2.5-8.5-6Z"/><path d="M18 12v.5"/><path d="M7 10.7C7 8 5.6 6 2.7 5.5c-1 1.5-1 5 .2 6.5-1.2 1.5-1.2 5-.2 6.5C5.6 18 7 16 7 13.3"/>',
    briefcase: '<path d="M16 20V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/><rect width="20" height="14" x="2" y="6" rx="2"/>',
    wallet: '<path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1"/><path d="M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4"/>',
    star: '<path d="M12 2.5l2.9 5.9 6.5.9-4.7 4.6 1.1 6.5L12 17.3l-5.8 3.1 1.1-6.5-4.7-4.6 6.5-.9Z"/>',
    grid: '<rect width="7" height="7" x="3" y="3" rx="1"/><rect width="7" height="7" x="14" y="3" rx="1"/><rect width="7" height="7" x="14" y="14" rx="1"/><rect width="7" height="7" x="3" y="14" rx="1"/>',
    arrowR: '<path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>',
    sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M6.3 17.7l-1.4 1.4M19.1 4.9l-1.4 1.4"/>',
    moon: '<path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/>',
    menu: '<path d="M4 6h16M4 12h16M4 18h16"/>',
    x: '<path d="M18 6 6 18M6 6l12 12"/>',
    calendar: '<rect width="18" height="18" x="3" y="4" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>',
    link: '<path d="M10 13a5 5 0 0 0 7.5.5l3-3a5 5 0 0 0-7-7l-1.7 1.7"/><path d="M14 11a5 5 0 0 0-7.5-.5l-3 3a5 5 0 0 0 7 7l1.7-1.7"/>',
    cycle: '<path d="M21 12a9 9 0 0 1-15.4 6.4L3 16"/><path d="M3 21v-5h5"/><path d="M3 12a9 9 0 0 1 15.4-6.4L21 8"/><path d="M21 3v5h-5"/>',
    logout: '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="m16 17 5-5-5-5"/><path d="M21 12H9"/>',
    pencil: '<path d="M21.2 6.8a1 1 0 0 0-4-4L3.8 16.2a2 2 0 0 0-.5.8l-1.3 4.4a.5.5 0 0 0 .6.6l4.4-1.3a2 2 0 0 0 .8-.5z"/><path d="m15 5 4 4"/>',
    plus: '<path d="M5 12h14"/><path d="M12 5v14"/>',
    trash: '<path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>',
    database: '<ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M3 5v14a9 3 0 0 0 18 0V5"/><path d="M3 12a9 3 0 0 0 18 0"/>',
    upload: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="m17 8-5-5-5 5"/><path d="M12 3v12"/>',
    key: '<circle cx="7.5" cy="15.5" r="5.5"/><path d="m21 2-9.6 9.6"/><path d="m15.5 7.5 3 3L22 7l-3-3"/>',
    inbox: '<path d="M22 12h-6l-2 3h-4l-2-3H2"/><path d="M5.5 5.1 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.5-6.9A2 2 0 0 0 16.8 4H7.2a2 2 0 0 0-1.7 1.1"/>',
    alert: '<path d="m21.7 18-8-14a2 2 0 0 0-3.5 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.7-3"/><path d="M12 9v4"/><path d="M12 17h.01"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    history: '<path d="M3 12a9 9 0 1 0 9-9 9.7 9.7 0 0 0-6.7 2.7L3 8"/><path d="M3 3v5h5"/><path d="M12 7v5l4 2"/>',
    restore: '<path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5"/>',
    phone: '<rect width="14" height="20" x="5" y="2" rx="2"/><path d="M12 18h.01"/>',
    download: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="m7 10 5 5 5-5"/><path d="M12 15V3"/>',
    gear: '<path d="M12.2 2h-.4a2 2 0 0 0-2 2v.2a2 2 0 0 1-1 1.7l-.4.3a2 2 0 0 1-2 0l-.2-.1a2 2 0 0 0-2.7.7l-.2.4a2 2 0 0 0 .7 2.7l.2.1a2 2 0 0 1 1 1.7v.5a2 2 0 0 1-1 1.7l-.2.1a2 2 0 0 0-.7 2.7l.2.4a2 2 0 0 0 2.7.7l.2-.1a2 2 0 0 1 2 0l.4.3a2 2 0 0 1 1 1.7v.2a2 2 0 0 0 2 2h.4a2 2 0 0 0 2-2v-.2a2 2 0 0 1 1-1.7l.4-.3a2 2 0 0 1 2 0l.2.1a2 2 0 0 0 2.7-.7l.2-.4a2 2 0 0 0-.7-2.7l-.2-.1a2 2 0 0 1-1-1.7v-.5a2 2 0 0 1 1-1.7l.2-.1a2 2 0 0 0 .7-2.7l-.2-.4a2 2 0 0 0-2.7-.7l-.2.1a2 2 0 0 1-2 0l-.4-.3a2 2 0 0 1-1-1.7V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/>',
    dots: '<circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/>',
    globe: '<circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/>',
    table: '<rect width="18" height="18" x="3" y="3" rx="2"/><path d="M3 9h18M3 15h18M9 3v18"/>',
    info: '<circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/>'
  };
  function ic(nama) {
    return '<svg class="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + (ICONS[nama] || ICONS.file) + "</svg>";
  }

  /* ---------------- utilitas ---------------- */
  function $(s, r) { return (r || document).querySelector(s); }
  function $$(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }
  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; });
  }
  function angka(n) { return Number(n || 0).toLocaleString("id-ID"); }
  var BULAN = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];
  var BULAN_P = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
  var HARI = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
  function tglMenit(m) { return new Date(m * 60000); }
  function pad(n) { return n < 10 ? "0" + n : "" + n; }
  function awalHari(d) { var x = new Date(d); x.setHours(0, 0, 0, 0); return x.getTime(); }
  function waktuRingkas(menit) {
    if (!menit) return "";
    var d = tglMenit(menit), kini = new Date();
    var selisihHari = Math.round((awalHari(kini) - awalHari(d)) / 864e5);
    if (selisihHari === 0) return "Hari ini " + pad(d.getHours()) + "." + pad(d.getMinutes());
    if (selisihHari === 1) return "Kemarin";
    if (selisihHari > 1 && selisihHari < 7) return selisihHari + " hari lalu";
    return d.getDate() + " " + BULAN[d.getMonth()] + " " + d.getFullYear();
  }
  function waktuLengkap(menit) { var d = tglMenit(menit); return d.getDate() + " " + BULAN_P[d.getMonth()] + " " + d.getFullYear() + ", " + pad(d.getHours()) + "." + pad(d.getMinutes()); }
  function sejakMs(ms) {
    if (!ms) return "belum pernah";
    var menit = Math.round((Date.now() - ms) / 60000);
    if (menit < 1) return "baru saja";
    if (menit < 60) return menit + " menit lalu";
    var jam = Math.round(menit / 60);
    if (jam < 24) return jam + " jam lalu";
    return waktuRingkas(Math.round(ms / 60000));
  }
  function ukuran(kb) {
    if (!kb) return "";
    if (kb < 1024) return kb + " KB";
    return (kb / 1024).toFixed(kb < 10240 ? 1 : 0).replace(".", ",") + " MB";
  }
  function simpanLokal(k, v) {
    try {
      if (v === undefined) return localStorage.getItem(k);
      if (v === null) localStorage.removeItem(k); else localStorage.setItem(k, v);
    } catch (e) { return null; }
    return null;
  }
  function toast(pesan, ikon) {
    var t = $("#toast");
    t.innerHTML = (ikon ? ic(ikon) : "") + "<span>" + esc(pesan) + "</span>";
    t.hidden = false;
    clearTimeout(toast._t);
    toast._t = setTimeout(function () { t.hidden = true; }, 3200);
  }
  function salin(teks) {
    function berhasil() { toast("Link disalin", "check"); }
    function manual() {
      var ta = document.createElement("textarea");
      ta.value = teks; ta.setAttribute("readonly", ""); ta.style.position = "fixed"; ta.style.top = "-1000px";
      document.body.appendChild(ta); ta.select();
      var ok = false; try { ok = document.execCommand("copy"); } catch (e) { ok = false; }
      document.body.removeChild(ta);
      if (ok) berhasil(); else window.prompt("Salin link ini:", teks);
    }
    if (navigator.clipboard && window.isSecureContext) navigator.clipboard.writeText(teks).then(berhasil, manual); else manual();
  }

  /* ---------------- sesi & kata sandi ----------------
     Kata sandi tidak pernah dikirim. Browser membuat t = PBKDF2(sandi, "pintu-kukar|" + id). */
  var K_SESI = "pintu-sesi";
  function rapikanId(id) { return String(id || "").trim().toLowerCase(); }
  function buatToken(id, sandi) {
    if (!(window.crypto && crypto.subtle && window.TextEncoder)) return Promise.reject(new Error("Browser ini terlalu lama. Pakai Chrome, Edge, Firefox, atau Safari versi baru."));
    var enc = new TextEncoder();
    return crypto.subtle.importKey("raw", enc.encode(sandi), "PBKDF2", false, ["deriveBits"]).then(function (kunci) {
      return crypto.subtle.deriveBits({ name: "PBKDF2", salt: enc.encode("pintu-kukar|" + rapikanId(id)), iterations: 150000, hash: "SHA-256" }, kunci, 256);
    }).then(function (buf) {
      return Array.prototype.map.call(new Uint8Array(buf), function (b) { return ("0" + b.toString(16)).slice(-2); }).join("");
    });
  }
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
  function simpanSesi(s, ingat) {
    var v = JSON.stringify({ id: s.id, t: s.t, nama: s.nama, peran: s.peran, sampai: ingat ? Date.now() + 30 * 864e5 : 0 });
    try { (ingat ? localStorage : sessionStorage).setItem(K_SESI, v); } catch (e) { /* sesi hanya di memori */ }
  }
  function hapusSesi() {
    try { sessionStorage.removeItem(K_SESI); localStorage.removeItem(K_SESI); } catch (e) { /* abaikan */ }
  }

  /* ---------------- panggilan ke Apps Script ---------------- */
  var sesi = null;
  function panggil(aksi, data) {
    var badan = Object.assign({ aksi: aksi }, data || {});
    if (sesi) badan.sesi = { id: sesi.id, t: sesi.t };
    return fetch(BACKEND, { method: "POST", body: JSON.stringify(badan) })
      .then(function (r) { return r.text(); }, function () { throw new Error("Tidak terhubung ke server PINTU. Periksa internet lalu coba lagi."); })
      .then(function (teks) {
        var res;
        try { res = JSON.parse(teks); } catch (e) { throw new Error("Server PINTU belum siap (jawaban tidak terbaca). Pastikan Apps Script sudah diterbitkan sebagai Aplikasi web untuk Siapa saja."); }
        if (!res || !res.ok) {
          var err = new Error((res && res.pesan) || "Permintaan gagal.");
          err.kode = res && res.kode;
          if (err.kode === "sesi" && sesi) { sesiBerakhir(err.message); }
          throw err;
        }
        return res;
      });
  }

  /* ---------------- penyimpanan daftar berkas (IndexedDB) ---------------- */
  var Gudang = {
    db: null,
    buka: function () {
      var self = this;
      if (self.db) return Promise.resolve(self.db);
      return new Promise(function (ok, gagal) {
        try {
          var r = indexedDB.open("pintu-kukar", 1);
          r.onupgradeneeded = function () { r.result.createObjectStore("data"); };
          r.onsuccess = function () { self.db = r.result; ok(self.db); };
          r.onerror = function () { gagal(r.error); };
        } catch (e) { gagal(e); }
      });
    },
    ambil: function (k) {
      return this.buka().then(function (db) {
        return new Promise(function (ok) {
          try { var r = db.transaction("data").objectStore("data").get(k); r.onsuccess = function () { ok(r.result || null); }; r.onerror = function () { ok(null); }; }
          catch (e) { ok(null); }
        });
      }, function () { return null; });
    },
    taruh: function (k, v) {
      return this.buka().then(function (db) {
        return new Promise(function (ok) {
          try { var tx = db.transaction("data", "readwrite"); tx.objectStore("data").put(v, k); tx.oncomplete = function () { ok(true); }; tx.onerror = function () { ok(false); }; }
          catch (e) { ok(false); }
        });
      }, function () { return false; });
    },
    kosongkan: function () {
      return this.buka().then(function (db) {
        return new Promise(function (ok) {
          try { var tx = db.transaction("data", "readwrite"); tx.objectStore("data").clear(); tx.oncomplete = function () { ok(true); }; tx.onerror = function () { ok(false); }; }
          catch (e) { ok(false); }
        });
      }, function () { return false; });
    }
  };

  /* ---------------- keadaan aplikasi ---------------- */
  var S = {
    saya: null, kategori: [], label: {}, pengaturan: {}, info: {},
    versi: 0, akar: null, diubah: 0, muatIndeks: false, galatIndeks: "",
    kelola: false,
    q: "", grup: "semua", waktu: "", kat: "", urut: "cocok", tampil: 30,
    isi: null
  };
  var mesin = new PC.Mesin();
  function peranMin(p) { var urut = { pengguna: 1, pengelola: 2, admin: 3 }; return S.saya && (urut[S.saya.peran] || 0) >= urut[p]; }

  /* =================================================================
     GERBANG MASUK
     ================================================================= */
  var gerbangIsi = $("#gerbang-isi");
  function tampilGerbang(html) { $("#aplikasi").hidden = true; $("#gerbang").hidden = false; gerbangIsi.innerHTML = html; }
  function isianSandi(id, label, auto) {
    return '<div class="isian"><label for="' + id + '">' + label + '</label><div class="isian-sandi"><input id="' + id + '" type="password" autocomplete="' + auto + '" required>' +
      '<button class="ikon-kecil" type="button" data-intip="' + id + '" aria-label="Tampilkan kata sandi" aria-pressed="false">' + ic("eye") + "</button></div></div>";
  }
  function pasangIntip(akar) {
    $$("[data-intip]", akar).forEach(function (b) {
      b.addEventListener("click", function () {
        var inp = document.getElementById(b.getAttribute("data-intip"));
        var lihat = inp.type === "password";
        inp.type = lihat ? "text" : "password";
        b.setAttribute("aria-pressed", lihat ? "true" : "false");
        b.innerHTML = ic(lihat ? "eyeoff" : "eye");
      });
    });
  }
  function galatGerbang(pesan) {
    var g = $(".galat", gerbangIsi);
    if (g) { g.textContent = pesan; g.hidden = false; }
  }

  function mulai() {
    if (!BACKEND) {
      tampilGerbang('<h2>PINTU belum tersambung</h2><p class="gerbang-teks">Alamat Apps Script belum diisi. Admin perlu menempel URL Aplikasi web (berakhiran <b>/exec</b>) di file <b>assets/js/config.js</b>, bagian <b>backend</b>.</p>');
      return;
    }
    var s = bacaSesi();
    if (s) { sesi = s; S.saya = { id: s.id, nama: s.nama, peran: s.peran }; bukaAplikasi(); return; }
    fetch(BACKEND).then(function (r) { return r.json(); }).then(function (st) {
      if (!st.terpasang) {
        tampilGerbang('<h2>Apps Script belum dipasang</h2><p class="gerbang-teks">Buka proyek Apps Script di Gmail kantor, pilih fungsi <b>pasang</b>, lalu klik <b>Jalankan</b> dan izinkan semua akses. Setelah itu muat ulang halaman ini.</p><button class="tombol" type="button" onclick="location.reload()">Muat ulang</button>');
      } else if (!st.adaAkun) formSiapkan();
      else formMasuk();
    }).catch(function () {
      tampilGerbang('<h2>Server tidak bisa dihubungi</h2><p class="gerbang-teks">Periksa internet. Bila tetap gagal, pastikan Apps Script sudah diterbitkan sebagai <b>Aplikasi web</b> dengan akses <b>Siapa saja</b>.</p><button class="tombol" type="button" onclick="location.reload()">Coba lagi</button>');
    });
  }

  function formMasuk(pesan) {
    tampilGerbang(
      "<h2>Masuk</h2><p class=\"gerbang-teks\">Gunakan email/ID dan kata sandi PINTU dari admin kantor.</p>" +
      '<form id="form-masuk" novalidate>' +
      '<p class="galat"' + (pesan ? "" : " hidden") + ' role="alert">' + esc(pesan || "") + "</p>" +
      '<div class="isian"><label for="m-id">Email / ID</label><input id="m-id" type="text" autocomplete="username" autocapitalize="none" spellcheck="false" inputmode="email" required></div>' +
      isianSandi("m-sandi", "Kata sandi", "current-password") +
      '<label class="centang"><input type="checkbox" id="m-ingat"> Tetap masuk di perangkat ini (30 hari)</label>' +
      '<button class="tombol" type="submit" id="m-tombol">Masuk</button></form>' +
      '<p class="catatan-kecil" style="margin-top:14px">Lupa kata sandi atau belum punya akun? Hubungi admin PINTU' + (K.emailAdmin ? ' (<a href="mailto:' + esc(K.emailAdmin) + '">' + esc(K.emailAdmin) + "</a>)" : "") + ".</p>"
    );
    pasangIntip(gerbangIsi);
    var f = $("#form-masuk");
    $("#m-id").focus();
    f.addEventListener("submit", function (e) {
      e.preventDefault();
      var id = rapikanId($("#m-id").value), sandi = $("#m-sandi").value, b = $("#m-tombol");
      if (!id || !sandi) return galatGerbang("Isi email/ID dan kata sandi.");
      b.disabled = true; b.innerHTML = '<span class="putar"></span>Memeriksa…';
      buatToken(id, sandi).then(function (t) {
        return panggil("masuk", { id: id, t: t }).then(function (res) {
          sesi = { id: res.saya.id, t: t, nama: res.saya.nama, peran: res.saya.peran };
          simpanSesi(sesi, $("#m-ingat").checked);
          S.saya = res.saya;
          bukaAplikasi(true);
        });
      }).catch(function (err) {
        b.disabled = false; b.textContent = "Masuk";
        galatGerbang(err.message);
      });
    });
  }

  function formSiapkan() {
    tampilGerbang(
      "<h2>Penyiapan pertama</h2><p class=\"gerbang-teks\">PINTU belum punya akun. Buat akun <b>admin</b> pertama. Admin kemudian menambah akun pegawai lain dari dalam PINTU.</p>" +
      '<form id="form-siap" novalidate><p class="galat" hidden role="alert"></p>' +
      '<div class="isian"><label for="s-nama">Nama</label><input id="s-nama" type="text" autocomplete="name" required></div>' +
      '<div class="isian"><label for="s-id">Email / ID untuk masuk</label><input id="s-id" type="text" autocapitalize="none" spellcheck="false" autocomplete="username" required></div>' +
      isianSandi("s-sandi", "Kata sandi (minimal 8 karakter)", "new-password") +
      isianSandi("s-sandi2", "Ulangi kata sandi", "new-password") +
      '<button class="tombol" type="submit" id="s-tombol">Buat akun admin</button></form>'
    );
    pasangIntip(gerbangIsi);
    $("#s-nama").focus();
    $("#form-siap").addEventListener("submit", function (e) {
      e.preventDefault();
      var nama = $("#s-nama").value.trim(), id = rapikanId($("#s-id").value), p1 = $("#s-sandi").value, p2 = $("#s-sandi2").value, b = $("#s-tombol");
      if (!nama || !id) return galatGerbang("Isi nama dan email/ID.");
      if (p1.length < 8) return galatGerbang("Kata sandi minimal 8 karakter.");
      if (p1 !== p2) return galatGerbang("Kedua kata sandi belum sama.");
      b.disabled = true; b.innerHTML = '<span class="putar"></span>Membuat akun…';
      buatToken(id, p1).then(function (t) {
        return panggil("buatAdmin", { id: id, nama: nama, t: t }).then(function (res) {
          sesi = { id: id, t: t, nama: nama, peran: "admin" };
          simpanSesi(sesi, false);
          S.saya = res.saya;
          bukaAplikasi(true);
        });
      }).catch(function (err) { b.disabled = false; b.textContent = "Buat akun admin"; galatGerbang(err.message); });
    });
  }

  function sesiBerakhir(pesan) {
    if (!sesi) return;
    sesi = null; S.saya = null;
    hapusSesi();
    Gudang.kosongkan();
    formMasuk(pesan || "Sesi berakhir. Silakan masuk lagi.");
  }
  function keluar() {
    hapusSesi();
    Gudang.kosongkan().then(function () { location.replace(location.pathname); });
  }

  /* =================================================================
     MEMUAT DATA & DAFTAR BERKAS
     ================================================================= */
  var aplikasiTerbuka = false;
  function bukaAplikasi(baruMasuk) {
    $("#gerbang").hidden = true;
    $("#aplikasi").hidden = false;
    if (!aplikasiTerbuka) { aplikasiTerbuka = true; siapkanTampilan(); }
    renderKepala();
    if (baruMasuk) toast("Selamat datang, " + S.saya.nama, "check");
    // tampilkan daftar tersimpan dulu, lalu periksa pembaruan
    Gudang.ambil("indeks").then(function (simpan) {
      if (simpan && simpan.id === S.saya.id && simpan.item) {
        S.versi = simpan.versi; S.akar = simpan.akar; S.diubah = simpan.diubah;
        mesin.bangun(simpan.item, simpan.akar, S.label);
        renderSemua();
      }
      return muatData();
    }).then(function () { return sinkronIndeks(); }).catch(function (err) { if (err && err.kode !== "sesi") { S.galatIndeks = err.message; renderStatus(); } });
    if (!pemantau) pemantau = setInterval(function () { if (!document.hidden && sesi) muatData(true).then(function () { if (S.info.versi && S.info.versi !== S.versi) sinkronIndeks(); }).catch(function () {}); }, 5 * 60 * 1000);
  }
  var pemantau = null;

  function muatData(diam) {
    return panggil("data").then(function (res) {
      S.saya = res.saya;
      if (sesi) { sesi.nama = res.saya.nama; sesi.peran = res.saya.peran; }
      S.kategori = res.kategori || [];
      S.pengaturan = res.pengaturan || {};
      S.info = res.info || {};
      S.label = {};
      (res.label || []).forEach(function (l) { S.label[l.id] = l; });
      mesin.pasangLabel(S.label);
      hitungJumlahKategori();
      if (!peranMin("pengelola")) S.kelola = false;
      renderKepala();
      if (!diam || !S.q) renderSemua();
      else renderStatus();
    });
  }

  /* Hanya satu sinkron pada satu waktu, supaya jawaban lama tidak menimpa yang baru. */
  var sinkronBerjalan = null;
  function sinkronIndeks() {
    if (sinkronBerjalan) return sinkronBerjalan;
    S.muatIndeks = true; S.galatIndeks = ""; renderStatus();
    sinkronBerjalan = panggil("indeks", { dari: S.versi || 0 }).then(function (res) {
      var item = null;
      if (res.mode === "penuh") { item = res.item; S.akar = res.akar; }
      else if (res.mode === "delta") item = mesin.terapkanDelta(res.ubah, res.hapus);
      else if (res.mode === "kosong") { S.versi = 0; mesin.bangun([], null, S.label); }
      if (item) {
        S.versi = res.versi; S.diubah = res.diubah || Date.now();
        mesin.bangun(item, S.akar, S.label);
        hitungJumlahKategori();
        Gudang.taruh("indeks", { id: S.saya.id, versi: S.versi, akar: S.akar, diubah: S.diubah, item: item });
      } else if (res.mode === "sama") S.versi = res.versi;
      S.muatIndeks = false;
      sinkronBerjalan = null;
      renderSemua();
    }).catch(function (err) { S.muatIndeks = false; sinkronBerjalan = null; S.galatIndeks = err.message; renderStatus(); throw err; });
    return sinkronBerjalan;
  }

  function perbaruiSekarang(tombol) {
    if (tombol) { tombol.disabled = true; tombol.textContent = "Memperbarui…"; }
    return panggil("perbarui").then(function (res) {
      S.info = res.info || S.info;
      toast(res.pesan || "Diperbarui", "check");
      return sinkronIndeks();
    }).catch(function (err) { toast(err.message, "alert"); }).then(function () { renderStatus(); });
  }

  /* jumlah berkas per kategori (berdasarkan folder kategori) */
  var jumlahKat = {};
  function nomorFolderKategori(k) {
    var id = PC.idDrive(k.folder);
    return id ? mesin.idKeNomor[id] || 0 : 0;
  }
  function hitungJumlahKategori() {
    jumlahKat = {};
    S.kategori.forEach(function (k) {
      var n = nomorFolderKategori(k);
      if (!n) return;
      var dalam = mesin.pembatas(n), c = 0;
      mesin.item.forEach(function (it) { if (it[2] !== "f" && dalam(it[3])) c++; });
      jumlahKat[k.id] = c;
    });
  }

  /* =================================================================
     KEPALA, TEMA, AKUN
     ================================================================= */
  var root = document.documentElement;
  function temaGelap() {
    var t = root.getAttribute("data-theme");
    if (t) return t === "dark";
    return window.matchMedia && matchMedia("(prefers-color-scheme: dark)").matches;
  }
  function renderTema() {
    var b = $("#tombol-tema"), g = temaGelap();
    b.innerHTML = ic(g ? "sun" : "moon");
    b.setAttribute("aria-label", g ? "Pakai tema terang" : "Pakai tema gelap");
    b.title = b.getAttribute("aria-label");
  }
  function inisial(nama) { return String(nama || "?").trim().split(/\s+/).slice(0, 2).map(function (w) { return w.charAt(0); }).join("").toUpperCase(); }
  function renderKepala() {
    if (!S.saya) return;
    var ta = $("#tombol-akun");
    ta.innerHTML = '<span class="avatar" aria-hidden="true">' + esc(inisial(S.saya.nama)) + '</span><span class="akun-nama">' + esc(S.saya.nama) + "</span>";
    ta.setAttribute("aria-label", "Akun: " + S.saya.nama);
    var tk = $("#tombol-kelola");
    tk.hidden = !peranMin("pengelola");
    tk.classList.toggle("aktif", S.kelola);
    tk.setAttribute("aria-pressed", S.kelola ? "true" : "false");
    tk.innerHTML = ic("pencil");
    tk.title = S.kelola ? "Selesai mengelola" : "Kelola kategori, link tujuan, dan label";
    tk.setAttribute("aria-label", tk.title);
    document.body.classList.toggle("mode-kelola", S.kelola);
    $("#menu-akun").innerHTML =
      '<div class="akun-info"><b>' + esc(S.saya.nama) + "</b><span>" + esc(S.saya.id) + '</span> <span class="peran ' + esc(S.saya.peran) + '">' + esc(S.saya.peran) + "</span></div>" +
      '<button type="button" role="menuitem" data-aksi="ganti-sandi">' + ic("key") + "Ganti kata sandi</button>" +
      (peranMin("admin") ? '<button type="button" role="menuitem" data-aksi="akun">' + ic("users") + "Akun pegawai</button>" +
        '<button type="button" role="menuitem" data-aksi="pengaturan">' + ic("gear") + "Pengaturan &amp; daftar berkas</button>" : "") +
      (peranMin("pengelola") ? '<button type="button" role="menuitem" data-aksi="riwayat">' + ic("history") + "Riwayat &amp; sampah</button>" : "") +
      '<button type="button" role="menuitem" data-aksi="pasang">' + ic("phone") + "Pasang di HP</button>" +
      "<hr>" +
      '<button type="button" role="menuitem" data-aksi="keluar">' + ic("logout") + "Keluar</button>";
    $("#kaki-kantor").textContent = S.pengaturan.namaKantor || K.kantor || "BPS Kabupaten Kutai Kartanegara";
  }
  function menuAkun(buka) {
    var m = $("#menu-akun"), b = $("#tombol-akun");
    m.hidden = !buka;
    b.setAttribute("aria-expanded", buka ? "true" : "false");
  }

  /* =================================================================
     RUTE
     ================================================================= */
  var TAMPILAN = ["beranda", "kategori", "kategori-semua", "folder", "terbaru", "panduan"];
  var rute = { nama: "beranda", arg: "" };
  function tampilkan(nama) {
    TAMPILAN.forEach(function (t) { $("#v-" + t).hidden = t !== nama; });
    var navNama = nama === "kategori-semua" || nama === "kategori" ? "kategori" : nama === "folder" ? "" : nama;
    $$("[data-nav]").forEach(function (a) { a.classList.toggle("aktif", a.getAttribute("data-nav") === navNama); });
  }
  function bacaRute() {
    var h = location.hash || "#/";
    var m;
    if ((m = h.match(/^#\/k\/([\w-]+)/))) return { nama: "kategori", arg: m[1] };
    if ((m = h.match(/^#\/f\/(\d+)/))) return { nama: "folder", arg: +m[1] };
    if (/^#\/kategori/.test(h)) return { nama: "kategori-semua" };
    if (/^#\/terbaru/.test(h)) return { nama: "terbaru" };
    if (/^#\/panduan/.test(h)) return { nama: "panduan" };
    if (/^#pd-/.test(h)) return { nama: "panduan", gulir: h.slice(1) };
    if ((m = h.match(/^#\/cari\/(.*)$/))) return { nama: "beranda", q: decodeURIComponent(m[1]) };
    return { nama: "beranda" };
  }
  function keRute() {
    var lama = rute.nama + rute.arg;
    rute = bacaRute();
    tampilkan(rute.nama);
    if (rute.nama === "beranda" && rute.q != null && rute.q !== S.q) { $("#q").value = rute.q; S.q = rute.q; S.tampil = 30; }
    renderRute();
    if (rute.gulir) { var el = document.getElementById(rute.gulir); if (el) el.scrollIntoView(); }
    else if (lama !== rute.nama + rute.arg) window.scrollTo(0, 0);
  }
  function renderRute() {
    if (rute.nama === "beranda") renderBeranda();
    else if (rute.nama === "kategori") renderKategori(rute.arg);
    else if (rute.nama === "kategori-semua") renderSemuaKategori();
    else if (rute.nama === "folder") renderFolder(rute.arg);
    else if (rute.nama === "terbaru") renderTerbaru();
  }
  function renderSemua() { renderStatus(); isiPilihanKategori(); renderRute(); }

  /* =================================================================
     BARIS BERKAS
     ================================================================= */
  function jenis(it) { return PC.JENIS[it[2]] || PC.JENIS.n; }
  function ikonJenis(it) {
    var g = jenis(it).grup;
    return g === "folder" ? "folder" : g === "tabel" ? "sheet" : g === "media" ? (it[2] === "v" ? "video" : "image") : g === "slide" ? "chart" : "file";
  }
  function lencana(it) {
    var j = jenis(it), folder = it[2] === "f";
    return '<span class="lencana g-' + j.grup + (folder ? "" : " ada-teks") + '" title="' + esc(j.label) + '">' + ic(ikonJenis(it)) + (folder ? "" : "<small>" + esc(j.kode) + "</small>") + "</span>";
  }
  function namaTersorot(nama, token) {
    if (!token || !token.length) return esc(nama);
    var r = PC.sorot(nama, token), out = "", i = 0;
    r.forEach(function (x) { out += esc(nama.slice(i, x[0])) + "<mark>" + esc(nama.slice(x[0], x[1])) + "</mark>"; i = x[1]; });
    return out + esc(nama.slice(i));
  }
  function htmlJalur(nomor, sampai) {
    var j = mesin.jalur(nomor);
    if (sampai) { var idx = -1; j.forEach(function (x, i) { if (x[0] === sampai) idx = i; }); if (idx > -1) j = j.slice(idx + 1); }
    if (!j.length) return "";
    var potong = j.length > 4 ? [j[0], null].concat(j.slice(-2)) : j;
    return '<span class="jalur">' + potong.map(function (x) {
      if (!x) return '<span class="sep">…</span>';
      return '<a href="#/f/' + x[0] + '">' + esc(x[1]) + "</a>";
    }).join('<span class="sep">›</span>') + "</span>";
  }
  function nomorFolderItem(it) { return it[5] || (it[8] && mesin.idKeNomor[it[8]]) || 0; }
  function barisBerkas(it, opsi) {
    opsi = opsi || {};
    var folder = it[2] === "f", nf = folder ? nomorFolderItem(it) : 0;
    var href = folder && nf ? "#/f/" + nf : PC.urlDrive(it);
    var luar = !(folder && nf);
    var lb = S.label[it[8] || it[0]] || S.label[it[0]];
    var labelHtml = lb && lb.label ? lb.label.split(",").map(function (x) { x = x.trim(); return x ? '<span class="label-chip">' + esc(x) + "</span>" : ""; }).join("") : "";
    var meta = opsi.meta === "buat" ? it[7] : it[4];
    return '<li class="baris" data-k="' + esc(it[0]) + '">' + lencana(it) +
      '<div class="baris-teks"><a class="baris-nama" href="' + esc(href) + '"' + (luar ? ' target="_blank" rel="noopener"' : "") + ">" + namaTersorot(it[1], opsi.token) + "</a>" +
      '<div class="baris-bawah">' + (opsi.tanpaJalur ? "" : htmlJalur(it[3], opsi.sampai)) + labelHtml +
      (lb && lb.catatan ? '<span class="catatan">' + esc(lb.catatan) + "</span>" : "") + "</div></div>" +
      '<div class="baris-meta" title="' + (opsi.meta === "buat" ? "Ditambahkan " : "Diubah ") + esc(waktuLengkap(meta)) + '">' + esc(waktuRingkas(meta)) + (it[6] ? "<small>" + esc(ukuran(it[6])) + "</small>" : "") + "</div>" +
      '<div class="baris-aksi">' +
      (folder && nf ? '<a class="ikon-kecil" href="' + esc(PC.urlDrive(it)) + '" target="_blank" rel="noopener" title="Buka di Google Drive" aria-label="Buka ' + esc(it[1]) + ' di Google Drive">' + ic("external") + "</a>" :
        (it[3] > 2 ? '<a class="ikon-kecil" href="#/f/' + it[3] + '" title="Buka folder tempat berkas ini" aria-label="Buka folder tempat ' + esc(it[1]) + '">' + ic("folder") + "</a>" : "")) +
      '<button class="ikon-kecil" type="button" data-aksi="salin" data-url="' + esc(PC.urlDrive(it)) + '" title="Salin link" aria-label="Salin link ' + esc(it[1]) + '">' + ic("copy") + "</button>" +
      (S.kelola ? '<button class="ikon-kecil" type="button" data-aksi="label" data-k="' + esc(it[0]) + '" title="Label &amp; kata kunci" aria-label="Label untuk ' + esc(it[1]) + '">' + ic("tag") + "</button>" : "") +
      "</div></li>";
  }

  /* =================================================================
     BERANDA & PENCARIAN
     ================================================================= */
  function renderStatus() {
    var el = $("#status-indeks");
    if (!el) return;
    var nf = S.info || {}, isi = "";
    if (nf.bangun) isi = '<span><span class="titik muat"></span>Mendaftar berkas pertama kali… ' + angka(nf.bangun.n) + " sejauh ini.</span>";
    else if (S.muatIndeks && !mesin.item.length) isi = '<span><span class="titik muat"></span>Mengunduh daftar berkas…</span>';
    else if (!mesin.item.length && !S.muatIndeks) isi = "<span>Daftar berkas belum tersedia.</span>";
    else isi = '<span><span class="titik' + (S.muatIndeks ? " muat" : "") + '"></span>' + angka(mesin.item.length) + " berkas &amp; folder · diperbarui " + esc(sejakMs(nf.dicek || S.diubah)) + "</span>";
    if (S.galatIndeks) isi += '<span style="color:#F4B4AC">' + esc(S.galatIndeks) + "</span>";
    isi += '<button type="button" data-aksi="perbarui">Perbarui</button>';
    el.innerHTML = isi;
  }

  function renderChipsJenis() {
    $("#chips-jenis").innerHTML = PC.GRUP.map(function (g) {
      return '<button class="chip" type="button" data-grup="' + g.id + '" aria-pressed="' + (S.grup === g.id) + '">' + esc(g.label) + "</button>";
    }).join("");
  }
  function isiPilihanKategori() {
    var sel = $("#saring-kat");
    sel.innerHTML = '<option value="">Semua kategori</option>' + S.kategori.filter(function (k) { return nomorFolderKategori(k); }).map(function (k) {
      return '<option value="' + esc(k.id) + '"' + (S.kat === k.id ? " selected" : "") + ">" + esc(k.nama) + "</option>";
    }).join("");
    if (S.kat && !sel.value) S.kat = "";
  }
  function opsiCari() {
    var o = { grup: S.grup, urut: S.urut };
    if (S.waktu) o.sejakMenit = Math.round(Date.now() / 60000) - (+S.waktu) * 1440;
    if (S.kat) { var k = cariKategori(S.kat); var n = k ? nomorFolderKategori(k) : 0; if (n) o.dalam = n; }
    return o;
  }
  function adaSaring() { return S.grup !== "semua" || S.waktu || S.kat; }

  var hasilTerakhir = null, pilihKb = -1;
  function renderBeranda() {
    var q = S.q.trim();
    document.body.classList.toggle("ada-q", !!q || !!adaSaring());
    $("#hapus-q").hidden = !S.q;
    $("#hapus-q").innerHTML = ic("x");
    renderChipsJenis();
    $("#saring-waktu").value = S.waktu;
    var aktif = !!q || adaSaring();
    $("#hasil").hidden = !aktif;
    $("#beranda-isi").hidden = aktif;
    if (aktif) renderHasil(); else renderIsiBeranda();
  }
  function renderHasil() {
    var q = S.q.trim();
    var r = mesin.cari(q, opsiCari());
    hasilTerakhir = r;
    pilihKb = -1;
    var total = r.total;
    var teks = !mesin.item.length ? (S.muatIndeks ? "Mengunduh daftar berkas…" : "Daftar berkas belum tersedia.")
      : total ? "<b>" + angka(total) + "</b> hasil" + (q ? " untuk “" + esc(q) + "”" : "") : "";
    $("#hasil-jumlah").innerHTML = teks;
    $$(".hasil-urut button").forEach(function (b) { b.setAttribute("aria-pressed", b.getAttribute("data-urut") === S.urut ? "true" : "false"); });
    var tampil = r.hasil.slice(0, S.tampil);
    var daftar = $("#daftar-hasil");
    if (!total && mesin.item.length) {
      daftar.innerHTML = "";
      $("#hasil-jumlah").innerHTML = "";
      $("#tombol-lagi").hidden = true;
      $("#isi-dok").innerHTML = '<div class="kosong"><h3>Tidak ada nama berkas yang cocok</h3><p>Coba kata yang lebih pendek, periksa ejaannya, atau hapus saringan.</p>' +
        (adaSaring() ? '<p><button class="tombol hantu kecil" type="button" data-aksi="hapus-saring">Hapus saringan</button></p>' : "") + "</div>" + htmlIsiDok(q);
      return;
    }
    daftar.innerHTML = tampil.map(function (h) { return barisBerkas(h.it, { token: r.token }); }).join("");
    var lagi = $("#tombol-lagi");
    lagi.hidden = r.hasil.length <= S.tampil;
    lagi.textContent = "Tampilkan " + Math.min(30, r.hasil.length - S.tampil) + " hasil lagi";
    $("#isi-dok").innerHTML = htmlIsiDok(q);
  }
  function htmlIsiDok(q) {
    if (!q || q.length < 2) return "";
    if (S.isi && S.isi.q === q) {
      if (S.isi.muat) return '<div class="isi-dok-kotak"><p><span class="putar"></span> Mencari “' + esc(q) + '” di isi dokumen…</p></div>';
      if (S.isi.galat) return '<div class="isi-dok-kotak"><p>' + esc(S.isi.galat) + '</p><button class="tombol kecil" type="button" data-aksi="cari-isi">Coba lagi</button></div>';
      var h = S.isi.hasil || [];
      return "<h2>" + ic("textsearch") + "Ditemukan di isi dokumen (" + h.length + ")</h2>" +
        (h.length ? '<ul class="daftar">' + h.map(function (it) { return barisBerkas(it, { token: [] }); }).join("") + "</ul>"
          : '<div class="kosong"><p>Google Drive tidak menemukan “' + esc(q) + '” di isi dokumen kantor.</p></div>');
    }
    return '<div class="isi-dok-kotak"><p><b>Belum ketemu?</b> Cari kata ini di <b>isi</b> Docs, Sheets, Slides, PDF, dan berkas Office lewat pencarian Google Drive. Butuh beberapa detik.</p>' +
      '<button class="tombol" type="button" data-aksi="cari-isi">' + ic("textsearch") + "Cari di isi dokumen</button></div>";
  }
  function cariIsi() {
    var q = S.q.trim();
    if (q.length < 2) return;
    S.isi = { q: q, muat: true };
    $("#isi-dok").innerHTML = htmlIsiDok(q);
    panggil("cariIsi", { q: q }).then(function (res) {
      if (S.isi && S.isi.q === q) { S.isi = { q: q, hasil: res.hasil || [] }; $("#isi-dok").innerHTML = htmlIsiDok(q); }
    }).catch(function (err) {
      if (S.isi && S.isi.q === q) { S.isi = { q: q, galat: err.message }; $("#isi-dok").innerHTML = htmlIsiDok(q); }
    });
  }

  function renderIsiBeranda() {
    var p = S.pengaturan.pintasan || [];
    $("#bagian-pintasan").hidden = !p.length && !S.kelola;
    $("#pintasan").innerHTML = p.length ? p.map(function (t) { return '<a href="' + esc(t.url) + '" target="_blank" rel="noopener"' + (t.ket ? ' title="' + esc(t.ket) + '"' : "") + ">" + ic("link") + esc(t.label) + "</a>"; }).join("")
      : '<p class="catatan-kecil">Belum ada pintasan. Tambahkan link yang sering dipakai semua pegawai.</p>';
    $("#aksi-pintasan").innerHTML = S.kelola ? '<button class="tombol hantu kecil" type="button" data-aksi="ubah-pintasan">' + ic("pencil") + "Ubah pintasan</button>" : "";
    $("#aksi-kategori-beranda").innerHTML = S.kategori.length ? '<a class="tautan-panah" href="#/kategori">Semua kategori<span>' + ic("arrow") + "</span></a>" : "";
    $("#kategori-beranda").innerHTML = htmlGridKategori(S.kategori.slice(0, 8));
    var t = mesin.terbaru({ batas: 8 });
    $("#terbaru-beranda").innerHTML = t.map(function (it) { return barisBerkas(it); }).join("");
  }
  function htmlGridKategori(daftar) {
    var html = daftar.map(function (k, i) {
      var n = nomorFolderKategori(k);
      return '<a class="kartu-kat" href="#/k/' + esc(k.id) + '" style="--c:' + esc(k.warna || "#1C5AA3") + '">' +
        '<span class="kat-ikon">' + ic(k.ikon || "folder") + "</span><span><h3>" + esc(k.nama) + "</h3>" + (k.singkat ? "<p>" + esc(k.singkat) + "</p>" : "") +
        '<span class="jml">' + (n ? angka(jumlahKat[k.id] || 0) + " berkas" : k.tautan && k.tautan.length ? k.tautan.length + " link tujuan" : "belum ada folder") + "</span></span>" +
        (S.kelola ? '<span class="kartu-kat-edit">' +
          (i > 0 ? '<button class="ikon-kecil" type="button" data-aksi="kat-naik" data-id="' + esc(k.id) + '" title="Pindah ke kiri" aria-label="Geser ' + esc(k.nama) + ' ke depan">' + ic("left") + "</button>" : "") +
          (i < daftar.length - 1 ? '<button class="ikon-kecil" type="button" data-aksi="kat-turun" data-id="' + esc(k.id) + '" title="Pindah ke kanan" aria-label="Geser ' + esc(k.nama) + ' ke belakang">' + ic("right") + "</button>" : "") +
          '<button class="ikon-kecil" type="button" data-aksi="ubah-kategori" data-id="' + esc(k.id) + '" title="Ubah kategori" aria-label="Ubah kategori ' + esc(k.nama) + '">' + ic("pencil") + "</button></span>" : "") +
        "</a>";
    }).join("");
    if (S.kelola) html += '<button class="kartu-kat kartu-baru" type="button" data-aksi="tambah-kategori">' + ic("plus") + "&nbsp;Kategori baru</button>";
    if (!html) html = '<div class="kosong" style="grid-column:1/-1"><p>Belum ada kategori.' + (peranMin("pengelola") ? " Aktifkan <b>Kelola</b> (ikon pensil di kanan atas) lalu klik <b>Kategori baru</b>." : " Pengelola PINTU akan menambahkannya.") + "</p></div>";
    return html;
  }
  function cariKategori(id) { var h = null; S.kategori.forEach(function (k) { if (k.id === id) h = k; }); return h; }

  /* =================================================================
     HALAMAN KATEGORI
     ================================================================= */
  function renderSemuaKategori() {
    $("#v-kategori-semua").innerHTML =
      '<section class="kepala-halaman"><div class="bungkus"><p class="jejak"><a href="#/">Cari</a><span aria-hidden="true">/</span>Kategori</p>' +
      "<h1>Kategori tim &amp; fungsi</h1><p class=\"kepala-sub\">Pintasan ke folder dan link tujuan setiap tim. Pilih kategori untuk mencari hanya di foldernya.</p></div></section>" +
      '<div class="bungkus isi-halaman"><div class="grid-kategori">' + htmlGridKategori(S.kategori) + "</div></div>";
  }
  var katState = { id: "", q: "" };
  function renderKategori(id) {
    var k = cariKategori(id), v = $("#v-kategori");
    if (!k) {
      v.innerHTML = '<div class="bungkus isi-halaman"><div class="kosong"><h3>Kategori tidak ditemukan</h3><p>Mungkin sudah dihapus. <a href="#/kategori">Lihat semua kategori</a>.</p></div></div>';
      return;
    }
    if (katState.id !== id) katState = { id: id, q: "" };
    var n = nomorFolderKategori(k);
    var folderUrl = PC.idDrive(k.folder) ? "https://drive.google.com/drive/folders/" + PC.idDrive(k.folder) : "";
    v.innerHTML =
      '<section class="kepala-halaman" style="--c:' + esc(k.warna) + '"><div class="bungkus">' +
      '<p class="jejak"><a href="#/">Cari</a><span aria-hidden="true">/</span><a href="#/kategori">Kategori</a><span aria-hidden="true">/</span>' + esc(k.nama) + "</p>" +
      '<div class="judul-ikon"><span class="kat-ikon" style="--c:' + esc(k.warna) + '">' + ic(k.ikon || "folder") + "</span><div><h1>" + esc(k.nama) + "</h1>" + (k.singkat ? '<p class="kepala-sub" style="margin-top:2px">' + esc(k.singkat) + "</p>" : "") + "</div></div>" +
      (k.deskripsi ? '<p class="kepala-sub">' + esc(k.deskripsi) + "</p>" : "") +
      '<div class="kepala-aksi-hal">' +
      (n ? '<a class="tombol" href="#/f/' + n + '">' + ic("folder") + "Jelajahi folder</a>" : "") +
      (folderUrl ? '<a class="tombol hantu" href="' + esc(folderUrl) + '" target="_blank" rel="noopener">' + ic("external") + "Buka di Google Drive</a>" : "") +
      (S.kelola ? '<button class="tombol aksen" type="button" data-aksi="ubah-kategori" data-id="' + esc(k.id) + '">' + ic("pencil") + "Ubah kategori &amp; link tujuan</button>" : "") +
      "</div></div></section>" +
      '<div class="bungkus isi-halaman">' +
      ((k.tautan || []).length ? '<section><div class="bagian-kepala"><h2>Link tujuan</h2></div><div class="tujuan">' + k.tautan.map(function (t) {
        var host = ""; try { host = new URL(t.url).hostname.replace(/^www\./, ""); } catch (e) { host = ""; }
        return '<a href="' + esc(t.url) + '" target="_blank" rel="noopener">' + ic(/drive\.google\.com\/drive\/folders/.test(t.url) ? "folder" : "link") + "<span><b>" + esc(t.label) + "</b><small>" + esc(t.ket || host) + "</small></span></a>";
      }).join("") + "</div></section>" : "") +
      (n ? '<section><div class="bagian-kepala"><h2>Cari di ' + esc(k.nama) + '</h2></div><div class="kotak-saring">' + ic("search") + '<label class="sr" for="kat-q">Cari di kategori ini</label><input id="kat-q" type="search" placeholder="Cari berkas di folder ' + esc(k.nama) + '…" value="' + esc(katState.q) + '"></div></section>' +
        '<section id="kat-hasil"></section>'
        : '<div class="kosong"><p>Kategori ini belum punya folder Google Drive' + (S.kelola ? ", atau foldernya tidak ada di daftar berkas. Klik <b>Ubah kategori</b> lalu tempel link foldernya." : ".") + "</p></div>") +
      "</div>";
    if (n) {
      var inp = $("#kat-q"), tunda;
      inp.addEventListener("input", function () { clearTimeout(tunda); tunda = setTimeout(function () { katState.q = inp.value; renderKatHasil(k, n); }, 90); });
      renderKatHasil(k, n);
    }
  }
  function renderKatHasil(k, n) {
    var el = $("#kat-hasil"); if (!el) return;
    var q = katState.q.trim();
    if (q) {
      var r = mesin.cari(q, { dalam: n });
      el.innerHTML = '<p class="hasil-jumlah" style="margin-bottom:10px">' + (r.total ? "<b>" + angka(r.total) + "</b> hasil" : "Tidak ada yang cocok di kategori ini.") + "</p>" +
        '<ul class="daftar">' + r.hasil.slice(0, 60).map(function (h) { return barisBerkas(h.it, { token: r.token, sampai: n }); }).join("") + "</ul>";
      return;
    }
    var sub = mesin.isiFolder(n).filter(function (it) { return it[2] === "f"; });
    var baru = mesin.terbaru({ dalam: n, batas: 12 });
    el.innerHTML = (sub.length ? '<div class="bagian-kepala"><h2>Folder</h2></div><ul class="daftar">' + sub.map(function (it) { return barisBerkas(it, { tanpaJalur: true }); }).join("") + "</ul>" : "") +
      '<div class="bagian-kepala" style="margin-top:26px"><h2>Baru diubah</h2><a class="tautan-panah" href="#/terbaru" data-aksi="terbaru-kat" data-id="' + esc(k.id) + '">Lihat semua<span>' + ic("arrow") + "</span></a></div>" +
      (baru.length ? '<ul class="daftar">' + baru.map(function (it) { return barisBerkas(it, { sampai: n }); }).join("") + "</ul>" : '<div class="kosong"><p>Belum ada berkas.</p></div>');
  }

  /* =================================================================
     HALAMAN FOLDER
     ================================================================= */
  var folderState = { n: 0, q: "", urut: "nama" };
  function renderFolder(n) {
    var v = $("#v-folder"), f = mesin.folder[n], akar = mesin.akar[n] && !f;
    if (!f && !akar) {
      v.innerHTML = '<div class="bungkus isi-halaman"><div class="kosong"><h3>Folder tidak ditemukan</h3><p>' + (mesin.item.length ? "Folder ini mungkin sudah dipindah atau dihapus." : "Daftar berkas sedang dimuat…") + ' <a href="#/">Kembali ke pencarian</a>.</p></div></div>';
      return;
    }
    if (folderState.n !== n) folderState = { n: n, q: "", urut: "nama" };
    var nama = f ? f[1] : mesin.akar[n];
    var jejak = mesin.jalur(n);
    v.innerHTML =
      '<section class="kepala-halaman" style="--c:#C98A12"><div class="bungkus">' +
      '<p class="jejak"><a href="#/">Cari</a>' + jejak.slice(0, -1).map(function (x) { return '<span aria-hidden="true">/</span><a href="#/f/' + x[0] + '">' + esc(x[1]) + "</a>"; }).join("") + "</p>" +
      '<div class="judul-ikon"><span class="lencana g-folder">' + ic("folder") + "</span><h1>" + esc(nama) + "</h1></div>" +
      '<div class="kepala-aksi-hal">' +
      (f ? '<a class="tombol" href="' + esc(PC.urlDrive(f)) + '" target="_blank" rel="noopener">' + ic("external") + 'Buka di Google Drive</a><button class="tombol hantu" type="button" data-aksi="salin" data-url="' + esc(PC.urlDrive(f)) + '">' + ic("copy") + "Salin link</button>" : "") +
      (f && S.kelola ? '<button class="tombol hantu" type="button" data-aksi="label" data-k="' + esc(f[0]) + '">' + ic("tag") + "Label folder</button>" : "") +
      "</div></div></section>" +
      '<div class="bungkus isi-halaman"><div class="alat-baris"><div class="kotak-saring">' + ic("search") + '<label class="sr" for="folder-q">Saring isi folder</label><input id="folder-q" type="search" placeholder="Saring isi folder ini (termasuk subfolder)…" value="' + esc(folderState.q) + '"></div>' +
      '<div class="hasil-urut" role="group" aria-label="Urutkan"><button type="button" data-furut="nama" aria-pressed="' + (folderState.urut === "nama") + '">Nama</button><button type="button" data-furut="baru" aria-pressed="' + (folderState.urut === "baru") + '">Terbaru</button></div></div>' +
      '<div id="folder-isi"></div></div>';
    var inp = $("#folder-q"), tunda;
    inp.addEventListener("input", function () { clearTimeout(tunda); tunda = setTimeout(function () { folderState.q = inp.value; renderFolderIsi(n); }, 90); });
    renderFolderIsi(n);
  }
  function renderFolderIsi(n) {
    var el = $("#folder-isi"); if (!el) return;
    var q = folderState.q.trim();
    if (q) {
      var r = mesin.cari(q, { dalam: n, urut: folderState.urut === "baru" ? "baru" : "" });
      el.innerHTML = '<p class="hasil-jumlah" style="margin-bottom:10px">' + (r.total ? "<b>" + angka(r.total) + "</b> hasil di folder ini dan subfoldernya" : "Tidak ada yang cocok di folder ini.") + "</p>" +
        '<ul class="daftar">' + r.hasil.slice(0, 100).map(function (h) { return barisBerkas(h.it, { token: r.token, sampai: n }); }).join("") + "</ul>";
      return;
    }
    var isi = mesin.isiFolder(n);
    if (folderState.urut === "baru") isi.sort(function (a, b) { return b[4] - a[4]; });
    var nF = isi.filter(function (it) { return it[2] === "f"; }).length;
    el.innerHTML = '<p class="hasil-jumlah" style="margin-bottom:10px">' + (isi.length ? angka(nF) + " folder · " + angka(isi.length - nF) + " berkas" : "") + "</p>" +
      (isi.length ? '<ul class="daftar">' + isi.slice(0, 400).map(function (it) { return barisBerkas(it, { tanpaJalur: true }); }).join("") + "</ul>" +
        (isi.length > 400 ? '<p class="catatan-kecil" style="margin-top:10px">Menampilkan 400 dari ' + angka(isi.length) + ". Pakai kotak saring untuk mencari.</p>" : "")
        : '<div class="kosong"><p>Folder ini kosong.</p></div>');
  }

  /* =================================================================
     HALAMAN TERBARU
     ================================================================= */
  var baruState = { menurut: "ubah", hari: 30, grup: "semua", kat: "", tampil: 100 };
  function renderTerbaru() {
    var v = $("#v-terbaru");
    var rentang = [[1, "Hari ini"], [7, "7 hari"], [30, "30 hari"], [90, "3 bulan"], [365, "Setahun"]];
    v.innerHTML =
      '<section class="kepala-halaman"><div class="bungkus"><p class="jejak"><a href="#/">Cari</a><span aria-hidden="true">/</span>Terbaru</p>' +
      "<h1>Berkas terbaru</h1><p class=\"kepala-sub\">Berkas yang baru diubah atau baru ditambahkan di Google Drive kantor.</p></div></section>" +
      '<div class="bungkus isi-halaman"><div style="display:grid;gap:10px">' +
      '<div class="alat-baris"><div class="hasil-urut" role="group" aria-label="Urutkan menurut"><button type="button" data-bmenurut="ubah" aria-pressed="' + (baruState.menurut === "ubah") + '">Baru diubah</button><button type="button" data-bmenurut="buat" aria-pressed="' + (baruState.menurut === "buat") + '">Baru ditambahkan</button></div>' +
      '<label class="sr" for="baru-kat">Kategori</label><select class="pilih" id="baru-kat"><option value="">Semua kategori</option>' + S.kategori.filter(function (k) { return nomorFolderKategori(k); }).map(function (k) { return '<option value="' + esc(k.id) + '"' + (baruState.kat === k.id ? " selected" : "") + ">" + esc(k.nama) + "</option>"; }).join("") + "</select></div>" +
      '<div class="chips terang" role="group" aria-label="Rentang waktu">' + rentang.map(function (r) { return '<button class="chip" type="button" data-bhari="' + r[0] + '" aria-pressed="' + (baruState.hari === r[0]) + '">' + r[1] + "</button>"; }).join("") + "</div>" +
      '<div class="chips terang" role="group" aria-label="Jenis berkas">' + PC.GRUP.map(function (g) { return '<button class="chip" type="button" data-bgrup="' + g.id + '" aria-pressed="' + (baruState.grup === g.id) + '">' + esc(g.label) + "</button>"; }).join("") + "</div></div>" +
      '<div id="baru-isi"></div></div>';
    var kat = baruState.kat ? cariKategori(baruState.kat) : null;
    var idx = baruState.menurut === "buat" ? 7 : 4;
    var daftar = mesin.terbaru({ menurut: baruState.menurut, grup: baruState.grup, sejakMenit: Math.round(awalHari(Date.now() - (baruState.hari - 1) * 864e5) / 60000), dalam: kat ? nomorFolderKategori(kat) : 0, batas: 2000 });
    var tampil = daftar.slice(0, baruState.tampil), html = "", grupLama = "";
    var kini = awalHari(Date.now());
    tampil.forEach(function (it) {
      var h = awalHari(tglMenit(it[idx])), selisih = Math.round((kini - h) / 864e5), d = new Date(h);
      var g = selisih === 0 ? "Hari ini" : selisih === 1 ? "Kemarin" : HARI[d.getDay()] + ", " + d.getDate() + " " + BULAN_P[d.getMonth()] + " " + d.getFullYear();
      if (g !== grupLama) { html += (grupLama ? "</ul>" : "") + '<p class="grup-hari">' + esc(g) + '</p><ul class="daftar">'; grupLama = g; }
      html += barisBerkas(it, { meta: baruState.menurut });
    });
    if (grupLama) html += "</ul>";
    $("#baru-isi").innerHTML = (daftar.length ? '<p class="hasil-jumlah" style="margin-bottom:6px"><b>' + angka(daftar.length) + "</b> berkas" + (daftar.length >= 2000 ? " (2.000 terbaru)" : "") + "</p>" + html +
      (daftar.length > baruState.tampil ? '<div class="daftar-lagi"><button class="tombol hantu" type="button" data-aksi="baru-lagi">Tampilkan lebih banyak</button></div>' : "")
      : '<div class="kosong"><p>Tidak ada berkas pada rentang ini.</p></div>');
  }

  /* =================================================================
     DIALOG
     ================================================================= */
  var dlg = $("#dlg");
  function bukaDialog(html, lebar) {
    dlg.classList.toggle("lebar", !!lebar);
    dlg.innerHTML = '<div class="dlg-bingkai">' + html + "</div>";
    if (typeof dlg.showModal === "function") { if (!dlg.open) dlg.showModal(); } else dlg.setAttribute("open", "");
    var f = dlg.querySelector("input:not([type=hidden]):not([type=checkbox]), textarea, select");
    if (f) setTimeout(function () { f.focus(); }, 30);
  }
  function tutupDialog() { if (typeof dlg.close === "function") dlg.close(); else dlg.removeAttribute("open"); }
  dlg.addEventListener("click", function (e) { if (e.target === dlg) tutupDialog(); });
  function kepalaDlg(judul, sub) {
    return '<div class="dlg-kepala"><div><h2>' + esc(judul) + "</h2>" + (sub ? "<p>" + sub + "</p>" : "") + '</div><button class="ikon-kecil" type="button" data-aksi="tutup" aria-label="Tutup">' + ic("x") + "</button></div>";
  }
  function kakiDlg(kiri, labelSimpan) {
    return '<div class="dlg-kaki"><div>' + (kiri || "") + '</div><div class="dlg-kaki-kanan"><button class="tombol hantu" type="button" data-aksi="tutup">Batal</button>' +
      (labelSimpan ? '<button class="tombol" type="submit" data-simpan>' + esc(labelSimpan) + "</button>" : "") + "</div></div>";
  }
  function galatForm(form, pesan) { var g = $(".galat", form); if (g) { g.textContent = pesan; g.hidden = false; g.scrollIntoView({ block: "nearest" }); } }
  function prosesForm(form, kerja, pesanOk) {
    var b = $("[data-simpan]", form), label = b ? b.textContent : "";
    if (b) { b.disabled = true; b.textContent = "Menyimpan…"; }
    var g = $(".galat", form); if (g) g.hidden = true;
    return Promise.resolve().then(kerja).then(function (res) {
      tutupDialog();
      if (pesanOk) toast(pesanOk, "check");
      return res;
    }, function (err) {
      if (b) { b.disabled = false; b.textContent = label; }
      galatForm(form, (err && err.message) || "Gagal menyimpan.");
    });
  }
  function terapkanData(res) {
    var d = res && res.data;
    if (!d) return;
    S.kategori = d.kategori || []; S.pengaturan = d.pengaturan || {}; S.info = d.info || S.info;
    S.label = {}; (d.label || []).forEach(function (l) { S.label[l.id] = l; });
    mesin.pasangLabel(S.label);
    hitungJumlahKategori();
    renderKepala(); renderSemua();
  }
  function pasangHapus(tombol, teksYakin, kerja) {
    var siap = false;
    tombol.addEventListener("click", function () {
      if (!siap) { siap = true; tombol.classList.add("yakin"); tombol.textContent = teksYakin; return; }
      tombol.disabled = true; tombol.textContent = "Menghapus…";
      kerja().catch(function (err) { tombol.disabled = false; tombol.textContent = "Hapus"; siap = false; tombol.classList.remove("yakin"); toast(err.message, "alert"); });
    });
  }

  /* ---------- editor daftar link (dipakai kategori & pintasan) ---------- */
  function htmlDaftarTautan(daftar) {
    return '<div class="daftar-tautan" data-tautan>' + (daftar || []).map(barisTautan).join("") + "</div>" +
      '<button class="tombol hantu kecil" type="button" data-tambah-tautan style="margin-top:8px">' + ic("plus") + "Tambah link</button>";
  }
  function barisTautan(t) {
    t = t || {};
    return '<div class="baris-tautan"><input class="lbl" type="text" placeholder="Nama link, mis. Folder Susenas" value="' + esc(t.label || "") + '" aria-label="Nama link">' +
      '<input class="url" type="url" placeholder="https://drive.google.com/…" value="' + esc(t.url || "") + '" aria-label="Alamat link">' +
      '<input class="ket" type="text" placeholder="Keterangan singkat (opsional)" value="' + esc(t.ket || "") + '" aria-label="Keterangan link">' +
      '<div class="alat"><button class="ikon-kecil" type="button" data-naik aria-label="Naikkan">' + ic("up") + '</button><button class="ikon-kecil" type="button" data-turun aria-label="Turunkan">' + ic("down") + '</button><button class="ikon-kecil" type="button" data-buang aria-label="Hapus link ini">' + ic("trash") + "</button></div></div>";
  }
  function pasangEditorTautan(akar) {
    var wadah = $("[data-tautan]", akar);
    $("[data-tambah-tautan]", akar).addEventListener("click", function () { wadah.insertAdjacentHTML("beforeend", barisTautan()); $$(".baris-tautan", wadah).pop().querySelector("input").focus(); });
    wadah.addEventListener("click", function (e) {
      var b = e.target.closest("button"); if (!b) return;
      var baris = b.closest(".baris-tautan");
      if (b.hasAttribute("data-buang")) baris.remove();
      else if (b.hasAttribute("data-naik") && baris.previousElementSibling) wadah.insertBefore(baris, baris.previousElementSibling);
      else if (b.hasAttribute("data-turun") && baris.nextElementSibling) wadah.insertBefore(baris.nextElementSibling, baris);
    });
  }
  function bacaTautan(akar) {
    var hasil = [], salah = "";
    $$(".baris-tautan", akar).forEach(function (b) {
      var l = $(".lbl", b).value.trim(), u = $(".url", b).value.trim(), k = $(".ket", b).value.trim();
      if (!l && !u) return;
      if (!l) salah = salah || "Setiap link perlu nama.";
      else if (!/^https?:\/\//.test(u)) salah = salah || "Link “" + l + "” harus diawali https://";
      hasil.push({ label: l, url: u, ket: k });
    });
    if (salah) throw new Error(salah);
    return hasil;
  }

  /* ---------- kategori ---------- */
  var IKON_KAT = ["folder", "users", "home", "chart", "clipboard", "book", "briefcase", "wallet", "map", "landmark", "store", "leaf", "school", "heart", "layers", "camera", "archive", "database", "sheet", "star", "grid", "shield"];
  var WARNA_KAT = ["#1C5AA3", "#0F7B6C", "#2E8B57", "#C27C0E", "#C2410C", "#B42318", "#7A3FB0", "#0E7490", "#4A5566", "#9D174D"];
  function dialogKategori(k) {
    var baru = !k;
    k = k || { nama: "", singkat: "", ikon: "folder", warna: WARNA_KAT[S.kategori.length % WARNA_KAT.length], deskripsi: "", folder: "", tautan: [] };
    bukaDialog(
      '<form id="f-kat" novalidate>' + kepalaDlg(baru ? "Kategori baru" : "Ubah kategori", "Tim atau fungsi, beserta folder dan link tujuannya") +
      '<div class="dlg-isi"><p class="galat" hidden role="alert"></p>' +
      '<div class="dua-kolom"><div class="isian"><label for="fk-nama">Nama kategori</label><input id="fk-nama" type="text" maxlength="60" value="' + esc(k.nama) + '" placeholder="mis. Statistik Sosial"></div>' +
      '<div class="isian"><label for="fk-singkat">Subjudul (opsional)</label><input id="fk-singkat" type="text" maxlength="120" value="' + esc(k.singkat) + '" placeholder="mis. Susenas, Sakernas, Podes"></div></div>' +
      '<div class="isian"><span class="label">Ikon</span><div class="pilih-ikon" id="fk-ikon">' + IKON_KAT.map(function (i) { return '<button type="button" data-ikon-pilih="' + i + '" aria-pressed="' + (k.ikon === i) + '" aria-label="Ikon ' + i + '">' + ic(i) + "</button>"; }).join("") + "</div></div>" +
      '<div class="isian"><span class="label">Warna</span><div class="pilih-warna" id="fk-warna">' + WARNA_KAT.map(function (w) { return '<button type="button" data-warna="' + w + '" aria-pressed="' + (k.warna === w) + '" aria-label="Warna ' + w + '"><span style="background:' + w + '"></span></button>'; }).join("") + "</div></div>" +
      '<div class="isian"><label for="fk-desk">Deskripsi (opsional)</label><textarea id="fk-desk" maxlength="300" placeholder="Isi kategori ini, siapa penanggung jawabnya">' + esc(k.deskripsi) + "</textarea></div>" +
      '<div class="isian"><label for="fk-folder">Link folder Google Drive</label><input id="fk-folder" type="url" value="' + esc(k.folder) + '" placeholder="https://drive.google.com/drive/folders/…"><span class="petunjuk" id="fk-folder-info">Pencarian di kategori ini dibatasi ke folder ini dan semua subfoldernya.</span></div>' +
      '<div class="isian"><span class="label">Link tujuan</span><span class="petunjuk">Pintasan ke folder atau berkas yang paling sering dipakai tim ini.</span>' + htmlDaftarTautan(k.tautan) + "</div>" +
      "</div>" + kakiDlg(baru ? "" : '<button class="tombol bahaya" type="button" id="fk-hapus">' + ic("trash") + "Hapus</button>", baru ? "Buat kategori" : "Simpan") + "</form>", true);
    var f = $("#f-kat"), ikonPilih = k.ikon, warnaPilih = k.warna;
    $("#fk-ikon").addEventListener("click", function (e) { var b = e.target.closest("[data-ikon-pilih]"); if (!b) return; ikonPilih = b.getAttribute("data-ikon-pilih"); $$("#fk-ikon button").forEach(function (x) { x.setAttribute("aria-pressed", x === b ? "true" : "false"); }); });
    $("#fk-warna").addEventListener("click", function (e) { var b = e.target.closest("[data-warna]"); if (!b) return; warnaPilih = b.getAttribute("data-warna"); $$("#fk-warna button").forEach(function (x) { x.setAttribute("aria-pressed", x === b ? "true" : "false"); }); });
    function cekFolder() {
      var u = $("#fk-folder").value.trim(), info = $("#fk-folder-info"), id = PC.idDrive(u);
      if (!u) { info.textContent = "Pencarian di kategori ini dibatasi ke folder ini dan semua subfoldernya."; return; }
      if (!id) { info.textContent = "Ini bukan link folder Google Drive."; return; }
      var n = mesin.idKeNomor[id];
      info.innerHTML = n ? "Terbaca: " + esc(mesin.jalur(n).map(function (x) { return x[1]; }).join(" › ")) : "Folder belum ada di daftar berkas PINTU (belum dibagikan ke akun kantor, atau daftar belum diperbarui).";
    }
    $("#fk-folder").addEventListener("input", cekFolder); cekFolder();
    pasangEditorTautan(f);
    f.addEventListener("submit", function (e) {
      e.preventDefault();
      prosesForm(f, function () {
        var nama = $("#fk-nama").value.trim();
        if (!nama) throw new Error("Nama kategori wajib diisi.");
        var folder = $("#fk-folder").value.trim();
        if (folder && !PC.idDrive(folder)) throw new Error("Link folder Google Drive belum benar.");
        return panggil("simpanKategori", { kategori: { id: k.id || "", nama: nama, singkat: $("#fk-singkat").value.trim(), ikon: ikonPilih, warna: warnaPilih, deskripsi: $("#fk-desk").value.trim(), folder: folder, tautan: bacaTautan(f) } }).then(terapkanData);
      }, baru ? "Kategori dibuat" : "Kategori disimpan");
    });
    var h = $("#fk-hapus");
    if (h) pasangHapus(h, "Yakin hapus? Klik lagi", function () {
      return panggil("hapusKategori", { id: k.id }).then(function (res) {
        tutupDialog(); terapkanData(res); toast("Kategori dihapus (bisa dipulihkan dari Riwayat 30 hari)", "check");
        if (rute.nama === "kategori") location.hash = "#/kategori";
      });
    });
  }
  function geserKategori(id, arah) {
    var urut = S.kategori.map(function (k) { return k.id; }), i = urut.indexOf(id), j = i + arah;
    if (i < 0 || j < 0 || j >= urut.length) return;
    urut.splice(j, 0, urut.splice(i, 1)[0]);
    panggil("urutKategori", { urutan: urut }).then(terapkanData).catch(function (err) { toast(err.message, "alert"); });
  }

  /* ---------- label & kata kunci ---------- */
  function dialogLabel(kunci) {
    var it = mesin.perKunci[kunci] || (S.isi && (S.isi.hasil || []).filter(function (x) { return x[0] === kunci; })[0]);
    if (!it) return;
    var idB = it[8] || it[0], l = S.label[idB] || {};
    bukaDialog(
      '<form id="f-label" novalidate>' + kepalaDlg("Label & kata kunci", esc(it[1])) +
      '<div class="dlg-isi"><p class="galat" hidden role="alert"></p>' +
      '<div class="isian"><label for="fl-kata">Kata kunci tambahan</label><input id="fl-kata" type="text" maxlength="300" value="' + esc(l.kata || "") + '" placeholder="mis. rakor, rapat koordinasi, SE2026"><span class="petunjuk">Istilah lain yang mungkin diketik pegawai. Tidak tampil, hanya membantu pencarian.</span></div>' +
      '<div class="isian"><label for="fl-label">Label</label><input id="fl-label" type="text" maxlength="200" value="' + esc(l.label || "") + '" placeholder="mis. Penting, Final, Arsip"><span class="petunjuk">Pisahkan dengan koma. Tampil sebagai penanda di hasil pencarian.</span></div>' +
      '<div class="isian"><label for="fl-cat">Catatan singkat</label><input id="fl-cat" type="text" maxlength="300" value="' + esc(l.catatan || "") + '" placeholder="mis. Versi final yang sudah ditandatangani"></div>' +
      "</div>" + kakiDlg(l.id ? '<button class="tombol bahaya" type="button" id="fl-hapus">' + ic("trash") + "Hapus label</button>" : "", "Simpan") + "</form>");
    var f = $("#f-label");
    f.addEventListener("submit", function (e) {
      e.preventDefault();
      prosesForm(f, function () { return panggil("simpanLabel", { id: idB, nama: it[1], kata: $("#fl-kata").value, label: $("#fl-label").value, catatan: $("#fl-cat").value }).then(terapkanData); }, "Label disimpan");
    });
    var h = $("#fl-hapus");
    if (h) pasangHapus(h, "Yakin? Klik lagi", function () { return panggil("simpanLabel", { id: idB, nama: it[1], kata: "", label: "", catatan: "" }).then(function (res) { tutupDialog(); terapkanData(res); toast("Label dihapus", "check"); }); });
  }

  /* ---------- pintasan beranda ---------- */
  function dialogPintasan() {
    bukaDialog('<form id="f-pintas" novalidate>' + kepalaDlg("Pintasan beranda", "Link yang sering dipakai semua pegawai") +
      '<div class="dlg-isi"><p class="galat" hidden role="alert"></p>' + htmlDaftarTautan(S.pengaturan.pintasan || []) + "</div>" + kakiDlg("", "Simpan") + "</form>", true);
    var f = $("#f-pintas");
    pasangEditorTautan(f);
    if (!(S.pengaturan.pintasan || []).length) $("[data-tambah-tautan]", f).click();
    f.addEventListener("submit", function (e) { e.preventDefault(); prosesForm(f, function () { return panggil("simpanPintasan", { pintasan: bacaTautan(f) }).then(terapkanData); }, "Pintasan disimpan"); });
  }

  /* ---------- ganti kata sandi ---------- */
  function dialogGantiSandi() {
    bukaDialog('<form id="f-sandi" novalidate>' + kepalaDlg("Ganti kata sandi", esc(S.saya.nama) + " · " + esc(S.saya.id)) +
      '<div class="dlg-isi"><p class="galat" hidden role="alert"></p>' + isianSandi("gs-1", "Kata sandi baru (minimal 8 karakter)", "new-password") + isianSandi("gs-2", "Ulangi kata sandi baru", "new-password") +
      '<p class="catatan-kecil">Perangkat lain yang masih masuk dengan sandi lama akan diminta masuk lagi.</p></div>' + kakiDlg("", "Ganti sandi") + "</form>");
    var f = $("#f-sandi");
    pasangIntip(f);
    f.addEventListener("submit", function (e) {
      e.preventDefault();
      prosesForm(f, function () {
        var a = $("#gs-1").value, b = $("#gs-2").value;
        if (a.length < 8) throw new Error("Kata sandi minimal 8 karakter.");
        if (a !== b) throw new Error("Kedua kata sandi belum sama.");
        return buatToken(S.saya.id, a).then(function (t) {
          return panggil("gantiSandi", { tBaru: t }).then(function () {
            sesi.t = t;
            var ingat = false; try { ingat = !!localStorage.getItem(K_SESI); } catch (x) { ingat = false; }
            simpanSesi(sesi, ingat);
          });
        });
      }, "Kata sandi diganti");
    });
  }

  /* ---------- akun pegawai (admin) ---------- */
  var PERAN_LABEL = { pengguna: "Pengguna — mencari & membuka", pengelola: "Pengelola — kategori, link tujuan, label", admin: "Admin — akun & pengaturan" };
  function dialogAkun() {
    bukaDialog(kepalaDlg("Akun pegawai", "Siapa saja yang boleh masuk ke PINTU") + '<div class="dlg-isi" id="akun-isi"><p class="gerbang-muat"><span class="putar"></span>Memuat akun…</p></div>' +
      '<div class="dlg-kaki"><div></div><div class="dlg-kaki-kanan"><button class="tombol hantu" type="button" data-aksi="tutup">Tutup</button><button class="tombol" type="button" data-aksi="akun-baru">' + ic("plus") + "Tambah akun</button></div></div>", true);
    panggil("akun").then(function (res) {
      var a = res.akun || [];
      a.sort(function (x, y) { return (y.aktif - x.aktif) || x.nama.localeCompare(y.nama); });
      $("#akun-isi").innerHTML = '<div class="tabel-bungkus"><table class="tabel"><thead><tr><th>Nama</th><th>Email / ID</th><th>Peran</th><th>Terakhir masuk</th><th></th></tr></thead><tbody>' +
        a.map(function (x) {
          return "<tr" + (x.aktif ? "" : ' style="opacity:.55"') + "><td><b>" + esc(x.nama) + "</b>" + (x.aktif ? "" : " <small>(nonaktif)</small>") + "</td><td>" + esc(x.id) + '</td><td><span class="peran ' + esc(x.peran) + '">' + esc(x.peran) + "</span></td><td class=\"nomor\">" + esc(x.masuk || "–") + "</td>" +
            '<td><button class="tombol hantu kecil" type="button" data-aksi="akun-ubah" data-id="' + esc(x.id) + '">Ubah</button></td></tr>';
        }).join("") + "</tbody></table></div>" +
        '<p class="catatan-kecil" style="margin-top:12px">Kata sandi tidak disimpan di mana pun. Kalau pegawai lupa sandi, buka <b>Ubah</b> lalu isi kata sandi baru.</p>';
      dialogAkun.data = a;
    }).catch(function (err) { $("#akun-isi").innerHTML = '<p class="galat">' + esc(err.message) + "</p>"; });
  }
  function dialogAkunForm(a) {
    var baru = !a;
    a = a || { nama: "", id: "", peran: "pengguna", aktif: true };
    var diriSendiri = !baru && a.id === S.saya.id;
    bukaDialog('<form id="f-akun" novalidate>' + kepalaDlg(baru ? "Tambah akun" : "Ubah akun", baru ? "Berikan email/ID dan kata sandi awal ke pegawai yang bersangkutan" : esc(a.id)) +
      '<div class="dlg-isi"><p class="galat" hidden role="alert"></p>' +
      '<div class="isian"><label for="fa-nama">Nama</label><input id="fa-nama" type="text" maxlength="80" value="' + esc(a.nama) + '"></div>' +
      (baru ? '<div class="isian"><label for="fa-id">Email / ID untuk masuk</label><input id="fa-id" type="text" autocapitalize="none" spellcheck="false" placeholder="mis. nama@bps.go.id"></div>' : "") +
      '<div class="isian"><label for="fa-peran">Peran</label><select id="fa-peran"' + (diriSendiri ? " disabled" : "") + ">" + Object.keys(PERAN_LABEL).map(function (p) { return '<option value="' + p + '"' + (a.peran === p ? " selected" : "") + ">" + PERAN_LABEL[p] + "</option>"; }).join("") + "</select>" +
      (diriSendiri ? '<span class="petunjuk">Anda tidak bisa mengubah peran akun sendiri.</span>' : "") + "</div>" +
      isianSandi("fa-sandi", baru ? "Kata sandi awal (minimal 8 karakter)" : "Kata sandi baru (kosongkan bila tidak diganti)", "new-password") +
      (!baru && !diriSendiri ? '<label class="centang"><input type="checkbox" id="fa-aktif"' + (a.aktif ? " checked" : "") + "> Akun aktif (boleh masuk)</label>" : "") +
      "</div>" + kakiDlg(!baru && !diriSendiri ? '<button class="tombol bahaya" type="button" id="fa-hapus">' + ic("trash") + "Hapus</button>" : "", baru ? "Tambah akun" : "Simpan") + "</form>");
    var f = $("#f-akun");
    pasangIntip(f);
    f.addEventListener("submit", function (e) {
      e.preventDefault();
      prosesForm(f, function () {
        var id = baru ? rapikanId($("#fa-id").value) : a.id, sandi = $("#fa-sandi").value, nama = $("#fa-nama").value.trim();
        if (!nama) throw new Error("Nama wajib diisi.");
        if (baru && !id) throw new Error("Email/ID wajib diisi.");
        if ((baru || sandi) && sandi.length < 8) throw new Error("Kata sandi minimal 8 karakter.");
        var data = { baru: baru, id: id, nama: nama, peran: diriSendiri ? a.peran : $("#fa-peran").value, aktif: $("#fa-aktif") ? $("#fa-aktif").checked : true };
        return (sandi ? buatToken(id, sandi) : Promise.resolve("")).then(function (t) {
          if (t) data.t = t;
          return panggil("simpanAkun", { akun: data });
        }).then(function () { return "tersimpan"; });
      }, baru ? "Akun ditambahkan" : "Akun disimpan").then(function (r) { if (r === "tersimpan") dialogAkun(); });
    });
    var h = $("#fa-hapus");
    if (h) pasangHapus(h, "Yakin hapus akun? Klik lagi", function () { return panggil("hapusAkun", { id: a.id }).then(function () { toast("Akun dihapus", "check"); dialogAkun(); }); });
  }

  /* ---------- pengaturan & daftar berkas (admin) ---------- */
  function htmlStatusIndeks(nf) {
    return '<div class="status-baris">' +
      '<div class="status-kotak"><small>Terdaftar</small><b>' + angka(nf.jumlah) + "</b><span>berkas &amp; folder</span></div>" +
      '<div class="status-kotak"><small>Terakhir diperiksa</small><b>' + esc(sejakMs(nf.dicek)) + "</b><span>otomatis tiap 15 menit</span></div>" +
      '<div class="status-kotak"><small>Daftar ulang penuh</small><b>' + esc(sejakMs(nf.penuh)) + "</b><span>otomatis tiap malam</span></div>" +
      '<div class="status-kotak"><small>Jadwal otomatis</small><b>' + (nf.otomatis ? "Aktif" : "Mati") + "</b><span>" + (nf.otomatis ? "berjalan di Apps Script" : "jalankan fungsi pasang") + "</span></div></div>" +
      (nf.bangun ? '<p class="galat" style="background:var(--accent-soft);color:var(--warn)">Pendaftaran penuh sedang berjalan: ' + angka(nf.bangun.n) + " berkas sejauh ini.</p>" : "") +
      (nf.galat ? '<p class="galat">Galat terakhir: ' + esc(nf.galat) + "</p>" : "");
  }
  function dialogPengaturan() {
    var pg = S.pengaturan;
    bukaDialog('<form id="f-atur" novalidate>' + kepalaDlg("Pengaturan & daftar berkas", "Cakupan pencarian dan status pendaftaran berkas") +
      '<div class="dlg-isi"><p class="galat" hidden role="alert"></p><div id="atur-status">' + htmlStatusIndeks(S.info || {}) + "</div>" +
      '<div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:18px"><button class="tombol hantu kecil" type="button" id="atur-perbarui">' + ic("cycle") + 'Perbarui sekarang</button><button class="tombol hantu kecil" type="button" id="atur-ulang">' + ic("restore") + "Daftar ulang semua berkas</button></div>" +
      '<div class="isian"><label for="fp-kantor">Nama kantor</label><input id="fp-kantor" type="text" maxlength="120" value="' + esc(pg.namaKantor || "") + '"></div>' +
      '<label class="centang"><input type="checkbox" id="fp-bagi"' + (pg.sertakanDibagikan !== false ? " checked" : "") + "> <span><b>Ikutkan berkas yang dibagikan ke akun kantor</b><br>Berkas milik akun lain yang dibagikan ke Gmail kantor ikut dicari (tampil di bawah “Dibagikan ke akun ini”).</span></label>" +
      '<div class="isian"><label for="fp-abaikan">Folder yang tidak ikut dicari</label><textarea id="fp-abaikan" placeholder="Satu link folder Google Drive per baris">' + esc((pg.folderAbaikan || []).join("\n")) + '</textarea><span class="petunjuk">Folder ini dan seluruh isinya tidak akan muncul di PINTU, termasuk di pencarian isi dokumen. Cocok untuk folder kepegawaian atau data rahasia.</span></div>' +
      "</div>" + kakiDlg("", "Simpan pengaturan") + "</form>", true);
    var f = $("#f-atur");
    function tombolTugas(b, aksi) {
      b.addEventListener("click", function () {
        var label = b.innerHTML; b.disabled = true; b.innerHTML = '<span class="putar"></span>Berjalan…';
        panggil(aksi).then(function (res) { S.info = res.info || S.info; $("#atur-status").innerHTML = htmlStatusIndeks(S.info); toast(res.pesan, "check"); return sinkronIndeks(); })
          .catch(function (err) { toast(err.message, "alert"); })
          .then(function () { b.disabled = false; b.innerHTML = label; });
      });
    }
    tombolTugas($("#atur-perbarui"), "perbarui");
    tombolTugas($("#atur-ulang"), "bangunUlang");
    f.addEventListener("submit", function (e) {
      e.preventDefault();
      prosesForm(f, function () {
        var abaikan = $("#fp-abaikan").value.split(/\n+/).map(function (x) { return x.trim(); }).filter(Boolean);
        abaikan.forEach(function (x) { if (!PC.idDrive(x)) throw new Error("Baris “" + x.slice(0, 50) + "” bukan link folder Google Drive."); });
        return panggil("simpanPengaturan", { pengaturan: { namaKantor: $("#fp-kantor").value, sertakanDibagikan: $("#fp-bagi").checked, folderAbaikan: abaikan } })
          .then(function (res) { terapkanData(res); return sinkronIndeks(); });
      }, "Pengaturan disimpan");
    });
  }

  /* ---------- riwayat & sampah (pengelola) ---------- */
  var tabRiwayat = "riwayat";
  function dialogRiwayat() {
    bukaDialog(kepalaDlg("Riwayat & sampah", "Siapa mengubah apa, dan kategori yang dihapus") + '<div class="dlg-isi" id="rw-isi"><p class="gerbang-muat"><span class="putar"></span>Memuat…</p></div>' +
      '<div class="dlg-kaki"><div></div><div class="dlg-kaki-kanan"><button class="tombol hantu" type="button" data-aksi="tutup">Tutup</button></div></div>', true);
    panggil("riwayat").then(function (res) {
      function isi() {
        var tab = '<div class="tab" role="tablist"><button type="button" role="tab" data-tab="riwayat" aria-selected="' + (tabRiwayat === "riwayat") + '">Riwayat (' + res.riwayat.length + ')</button><button type="button" role="tab" data-tab="sampah" aria-selected="' + (tabRiwayat === "sampah") + '">Sampah (' + res.sampah.length + ")</button></div>";
        var badan = tabRiwayat === "riwayat"
          ? (res.riwayat.length ? res.riwayat.map(function (r) { return '<div class="riwayat-baris"><time>' + esc(r.waktu) + "</time><div><b>" + esc(r.aksi) + "</b> · " + esc(r.oleh) + (r.keterangan ? "<br><span>" + esc(r.keterangan) + "</span>" : "") + "</div></div>"; }).join("") : '<p class="catatan-kecil">Belum ada riwayat.</p>')
          : (res.sampah.length ? res.sampah.map(function (s) { return '<div class="riwayat-baris"><time>' + esc(s.waktu) + "</time><div style=\"display:flex;justify-content:space-between;gap:10px;align-items:center\"><span><b>" + esc(s.judul) + "</b> · " + esc(s.jenis) + " · dihapus " + esc(s.oleh) + '</span><button class="tombol hantu kecil" type="button" data-pulihkan="' + esc(s.sid) + '">' + ic("restore") + "Pulihkan</button></div></div>"; }).join("") : '<p class="catatan-kecil">Sampah kosong. Kategori yang dihapus bisa dipulihkan selama 30 hari.</p>');
        $("#rw-isi").innerHTML = tab + badan;
      }
      isi();
      $("#rw-isi").addEventListener("click", function (e) {
        var t = e.target.closest("[data-tab]");
        if (t) { tabRiwayat = t.getAttribute("data-tab"); isi(); return; }
        var p = e.target.closest("[data-pulihkan]");
        if (p) { p.disabled = true; panggil("pulihkan", { sid: p.getAttribute("data-pulihkan") }).then(function (r) { terapkanData(r); toast("Dipulihkan", "check"); dialogRiwayat(); }).catch(function (err) { p.disabled = false; toast(err.message, "alert"); }); }
      });
    }).catch(function (err) { $("#rw-isi").innerHTML = '<p class="galat">' + esc(err.message) + "</p>"; });
  }

  /* ---------- pasang di HP ---------- */
  function dialogPasang() {
    var ua = navigator.userAgent || "", ios = /iphone|ipad|ipod/i.test(ua), android = /android/i.test(ua), dalamApp = /FBAN|FBAV|Instagram|Line\/|WhatsApp|Telegram|; wv\)/i.test(ua);
    var ev = window.pintuPasang;
    if (ev && !dalamApp) { ev.prompt(); (ev.userChoice || Promise.resolve({})).then(function (r) { if (r && r.outcome === "accepted") toast("PINTU dipasang", "check"); window.pintuPasang = null; }); return; }
    var langkah = dalamApp ? "<p>Anda membuka PINTU dari dalam aplikasi lain (misalnya WhatsApp). Buka dulu di " + (android ? "<b>Chrome</b>: ketuk menu ⋮ → Buka di Chrome" : "<b>Safari</b>: ketuk ikon ⋯ atau kompas → Buka di Safari") + ", lalu pasang dari sana.</p>"
      : ios ? "<ol><li>Ketuk tombol <b>Bagikan</b> (kotak dengan panah ke atas).</li><li>Pilih <b>Tambah ke Layar Utama</b>, lalu <b>Tambah</b>.</li></ol>"
        : android ? "<ol><li>Ketuk menu <b>⋮</b> di kanan atas Chrome.</li><li>Pilih <b>Instal aplikasi</b> atau <b>Tambahkan ke layar utama</b>.</li></ol>"
          : "<ol><li>Di Chrome atau Edge, klik ikon <b>Instal</b> di ujung kanan kolom alamat.</li><li>Untuk HP: buka alamat PINTU di Chrome (Android) atau Safari (iPhone).</li></ol>";
    bukaDialog(kepalaDlg("Pasang PINTU di HP", "Buka lebih cepat dari layar utama, seperti aplikasi") + '<div class="dlg-isi panduan-teks">' + langkah + "</div>" +
      '<div class="dlg-kaki"><div><button class="tombol hantu" type="button" data-aksi="salin" data-url="' + esc(location.origin + location.pathname) + '">' + ic("copy") + 'Salin alamat PINTU</button></div><div class="dlg-kaki-kanan"><button class="tombol" type="button" data-aksi="tutup">Mengerti</button></div></div>');
  }

  /* =================================================================
     PERISTIWA
     ================================================================= */
  function siapkanTampilan() {
    $$("[data-ikon]").forEach(function (el) { el.innerHTML = ic(el.getAttribute("data-ikon")); });
    renderTema();
    $("#tombol-tema").addEventListener("click", function () {
      var gelap = !temaGelap();
      root.setAttribute("data-theme", gelap ? "dark" : "light");
      simpanLokal("pintu-tema", gelap ? "gelap" : "terang");
      renderTema();
    });
    if (window.matchMedia) { var mq = matchMedia("(prefers-color-scheme: dark)"); if (mq.addEventListener) mq.addEventListener("change", renderTema); }
    $("#tombol-akun").addEventListener("click", function (e) { e.stopPropagation(); menuAkun($("#menu-akun").hidden); });
    document.addEventListener("click", function (e) { if (!e.target.closest(".akun-bungkus")) menuAkun(false); });
    $("#tombol-kelola").addEventListener("click", function () { S.kelola = !S.kelola; renderKepala(); renderRute(); toast(S.kelola ? "Mode kelola aktif" : "Mode kelola selesai", "pencil"); });
    if (K.pintar) $("#tautan-pintar").href = K.pintar;
    if (K.peta) $$("#tautan-peta, #tautan-peta-hp, #tautan-peta-kaki").forEach(function (a) { a.href = K.peta; });

    /* pencarian utama */
    var q = $("#q"), tunda;
    q.addEventListener("input", function () {
      clearTimeout(tunda);
      tunda = setTimeout(function () {
        S.q = q.value; S.tampil = 30; S.isi = null;
        if (rute.nama !== "beranda") location.hash = "#/";
        renderBeranda();
      }, 60);
    });
    $("#form-cari").addEventListener("submit", function (e) { e.preventDefault(); var baris = $$("#daftar-hasil .baris"); if (baris.length) bukaBaris(baris[Math.max(pilihKb, 0)]); });
    $("#hapus-q").addEventListener("click", function () { q.value = ""; S.q = ""; S.isi = null; renderBeranda(); q.focus(); });
    $("#chips-jenis").addEventListener("click", function (e) { var b = e.target.closest("[data-grup]"); if (!b) return; S.grup = b.getAttribute("data-grup"); S.tampil = 30; renderBeranda(); });
    $("#saring-waktu").addEventListener("change", function () { S.waktu = this.value; S.tampil = 30; renderBeranda(); });
    $("#saring-kat").addEventListener("change", function () { S.kat = this.value; S.tampil = 30; renderBeranda(); });
    $(".hasil-urut").addEventListener("click", function (e) { var b = e.target.closest("[data-urut]"); if (!b) return; S.urut = b.getAttribute("data-urut"); renderHasil(); });
    $("#tombol-lagi").addEventListener("click", function () { S.tampil += 30; renderHasil(); });

    /* papan ketik: "/" untuk mencari, panah untuk memilih hasil */
    document.addEventListener("keydown", function (e) {
      if (dlg.open) return;
      var ketik = /^(INPUT|TEXTAREA|SELECT)$/.test((e.target || {}).tagName || "");
      if (e.key === "/" && !ketik && !e.ctrlKey && !e.metaKey) { e.preventDefault(); if (rute.nama !== "beranda") location.hash = "#/"; q.focus(); q.select(); return; }
      if (e.key === "Escape" && e.target === q && q.value) { q.value = ""; S.q = ""; S.isi = null; renderBeranda(); return; }
      if (rute.nama !== "beranda" || !S.q) return;
      if (e.key !== "ArrowDown" && e.key !== "ArrowUp") return;
      if (ketik && e.target !== q) return;
      var baris = $$("#daftar-hasil .baris");
      if (!baris.length) return;
      e.preventDefault();
      pilihKb = Math.max(-1, Math.min(baris.length - 1, pilihKb + (e.key === "ArrowDown" ? 1 : -1)));
      baris.forEach(function (b, i) { b.classList.toggle("pilih-kb", i === pilihKb); });
      if (pilihKb >= 0) baris[pilihKb].scrollIntoView({ block: "nearest" }); else q.focus();
    });

    /* aksi umum */
    document.addEventListener("click", function (e) {
      var t = e.target.closest("[data-aksi]");
      if (t) {
        var a = t.getAttribute("data-aksi");
        if (a === "tutup") { tutupDialog(); return; }
        e.preventDefault();
        if (t.closest(".akun-menu")) menuAkun(false);
        switch (a) {
          case "salin": salin(t.getAttribute("data-url")); return;
          case "perbarui": perbaruiSekarang(t); return;
          case "cari-isi": cariIsi(); return;
          case "hapus-saring": S.grup = "semua"; S.waktu = ""; S.kat = ""; $("#saring-kat").value = ""; renderBeranda(); return;
          case "label": dialogLabel(t.getAttribute("data-k")); return;
          case "tambah-kategori": dialogKategori(null); return;
          case "ubah-kategori": dialogKategori(cariKategori(t.getAttribute("data-id"))); return;
          case "kat-naik": geserKategori(t.getAttribute("data-id"), -1); return;
          case "kat-turun": geserKategori(t.getAttribute("data-id"), 1); return;
          case "ubah-pintasan": dialogPintasan(); return;
          case "ganti-sandi": dialogGantiSandi(); return;
          case "akun": dialogAkun(); return;
          case "akun-baru": dialogAkunForm(null); return;
          case "akun-ubah": dialogAkunForm((dialogAkun.data || []).filter(function (x) { return x.id === t.getAttribute("data-id"); })[0]); return;
          case "pengaturan": dialogPengaturan(); return;
          case "riwayat": tabRiwayat = "riwayat"; dialogRiwayat(); return;
          case "pasang": dialogPasang(); return;
          case "keluar": keluar(); return;
          case "baru-lagi": baruState.tampil += 150; renderTerbaru(); return;
          case "terbaru-kat": baruState.kat = t.getAttribute("data-id"); location.hash = "#/terbaru"; return;
        }
      }
      var b;
      if ((b = e.target.closest("[data-bmenurut]"))) { baruState.menurut = b.getAttribute("data-bmenurut"); baruState.tampil = 100; renderTerbaru(); }
      else if ((b = e.target.closest("[data-bhari]"))) { baruState.hari = +b.getAttribute("data-bhari"); baruState.tampil = 100; renderTerbaru(); }
      else if ((b = e.target.closest("[data-bgrup]"))) { baruState.grup = b.getAttribute("data-bgrup"); baruState.tampil = 100; renderTerbaru(); }
      else if ((b = e.target.closest("[data-furut]"))) { folderState.urut = b.getAttribute("data-furut"); renderFolder(folderState.n); }
    });
    document.addEventListener("change", function (e) { if (e.target.id === "baru-kat") { baruState.kat = e.target.value; baruState.tampil = 100; renderTerbaru(); } });
    window.addEventListener("hashchange", keRute);
    keRute();
  }
  function bukaBaris(li) {
    var a = li && li.querySelector(".baris-nama");
    if (!a) return;
    if (a.target === "_blank") window.open(a.href, "_blank", "noopener"); else location.hash = a.getAttribute("href");
  }

  /* =================================================================
     APLIKASI TERPASANG (PWA)
     ================================================================= */
  window.addEventListener("beforeinstallprompt", function (e) { e.preventDefault(); window.pintuPasang = e; });
  if ("serviceWorker" in navigator && window.isSecureContext) {
    window.addEventListener("load", function () { navigator.serviceWorker.register("sw.js").catch(function () { /* abaikan */ }); });
  }

  mulai();
})();
