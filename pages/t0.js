/*
 * pages/t0.js – Seitendefinitionen Block T0 (Auftrag v3, Abschnitt 5).
 * Texte aus items.js (window.ITEMS.T0), Erkennens-Sets aus recognition/sets.js.
 */
(function () {
  "use strict";
  var T = window.ITEMS.T0;
  var R = window.RECOGNITION;

  var APP_LABEL = { ig: "Instagram", tt: "TikTok", sc: "Snapchat", fb: "Facebook", x: "X" };
  var APP_ORDER = ["ig", "tt", "sc", "fb", "x"];

  function scalePoints(n, low, high) {
    var out = [];
    for (var i = 1; i <= n; i++) {
      var label = String(i);
      if (i === 1) label += " – " + low;
      if (i === n) label += " – " + high;
      out.push({ v: i, label: label });
    }
    return out;
  }

  function knownApps(ctx) {
    var a = ctx.apps || [];
    return APP_ORDER.filter(function (k) { return a.indexOf(k) >= 0; });
  }

  var pages = [];

  // ── T0-01 Start ────────────────────────────────────────
  pages.push({
    id: "T0-01",
    items: [
      { type: "title", text: T.t01.title },
      { type: "text", text: T.t01.text }
    ],
    next: function () { return "T0-02"; }
  });

  // ── T0-02 Apps ─────────────────────────────────────────
  pages.push({
    id: "T0-02",
    items: [
      { type: "multi", key: "AP01", label: T.t02.AP01, options: T.t02.options,
        required: true,
        prefill: function () {
          // Vorbelegt mit SC03 aus der Registrierung (gleiches Gerät)
          try {
            var r = JSON.parse(localStorage.getItem("study-answers-R")) || {};
            return (r.SC03 || []).filter(function (v) { return v !== "keine"; });
          } catch (e) { return null; }
        } }
    ],
    after: function (answers, ctx) {
      var apps = APP_ORDER.filter(function (k) { return (answers.AP01 || []).indexOf(k) >= 0; });
      ctx.apps = apps;
      window.DB.saveProfile(ctx.code, null, apps);
    },
    next: function () { return "T0-03"; }
  });

  // ── T0-03 Schätzung ────────────────────────────────────
  pages.push({
    id: "T0-03",
    items: [
      { type: "number", key: "NU01", label: T.t03.NU01, min: 0, max: 1440, required: true }
    ],
    next: function () { return "T0-04"; }
  });

  // ── T0-04 Screenshot ───────────────────────────────────
  pages.push({
    id: "T0-04",
    items: [
      { type: "title", text: "Screenshot deiner Bildschirmzeit" },
      { type: "steps", byOs: { ios: T.t04.schritte_ios, android: T.t04.schritte_android } },
      { type: "sketch", byOs: { ios: "ios", android: "android" } },
      { type: "text", byOs: { ios: T.t04.zusatz_ios, android: T.t04.zusatz_android } },
      { type: "radio", key: "SU01", label: T.t04.SU01, required: true, options: [
        { v: "ja", label: "Ja" }, { v: "nein", label: "Nein" }
      ] },
      { type: "upload", key: "SU02", label: T.t04.SU02_label,
        warnIfEmpty: T.t04.SU02_hinweis_leer,
        visibleIf: { key: "SU01", equals: "ja" } },
      { type: "multi", key: "SU03", label: T.t04.SU03, options: T.t04.SU03_options,
        required: true, visibleIf: { key: "SU01", equals: "nein" } }
    ],
    next: function () { return "T0-05"; }
  });

  // ── T0-05 Werte abtippen ───────────────────────────────
  pages.push({
    id: "T0-05",
    items: function (ctx) {
      var out = [
        { type: "title", text: "Werte abtippen" },
        { type: "text", text: T.t05.intro }
      ];
      knownApps(ctx).forEach(function (app) {
        out.push({ type: "subtitle", text: APP_LABEL[app] });
        out.push({ type: "number", key: "MI01_" + app, label: T.t05.MI01,
                   hint: T.t05.MI01_hinweis, min: 0, max: 10080 });
        out.push({ type: "number", key: "OE01_" + app, label: T.t05.OE01, min: 0, max: 100000 });
      });
      out.push({ type: "subtitle", text: "Gesamt" });
      out.push({ type: "number", key: "MI01_total", label: T.t05.MI01_total, min: 0, max: 10080 });
      return out;
    },
    next: function () { return "T0-06"; }
  });

  // ── T0-06 bis T0-16: Erkennen, Set T0 ──────────────────
  R.SETS.T0.forEach(function (entry, i) {
    var n = i + 1;
    var pageId = "T0-" + String(n + 5).padStart(2, "0"); // T0-06 … T0-16
    var items = [];
    if (i === 0) items.push({ type: "text", text: T.erkennen.instruktion });
    items.push({ type: "text", text: "Bild " + n + " von " + R.SETS.T0.length });
    items.push({ type: "screen", set: "T0", index: i });
    items.push({ type: "radio", key: "ER" + n + "a", label: T.erkennen.ERa,
                 options: T.erkennen.ERa_options, required: true });
    items.push({ type: "textarea", key: "ER" + n + "b", label: T.erkennen.ERb,
                 rows: 3, visibleIf: { key: "ER" + n + "a", equals: "ja" } });
    pages.push({
      id: pageId,
      items: items,
      next: function () {
        return n < R.SETS.T0.length ? "T0-" + String(n + 6).padStart(2, "0") : "T0-17";
      }
    });
  });

  // ── T0-17 Einfluss und Akzeptanz ───────────────────────
  pages.push({
    id: "T0-17",
    items: function () {
      var out = [
        { type: "title", text: "Einfluss und Akzeptanz" },
        { type: "text", text: T.t17.intro }
      ];
      R.SETS.T0.forEach(function (entry, i) {
        if (entry.distraktor) return;
        out.push({ type: "screen", set: "T0", index: i, mini: true });
        out.push({ type: "radio", key: "AK01_" + entry.muster, label: T.t17.AK01,
                   options: scalePoints(5, T.t17.AK01_anker[0], T.t17.AK01_anker[1]), required: true });
        out.push({ type: "radio", key: "AK02_" + entry.muster, label: T.t17.AK02,
                   options: scalePoints(5, T.t17.AK02_anker[0], T.t17.AK02_anker[1]), required: true });
      });
      return out;
    },
    next: function () { return "T0-18"; }
  });

  // ── T0-18 SMSCF ────────────────────────────────────────
  pages.push({
    id: "T0-18",
    items: [
      { type: "title", text: "Deine Social-Media-Nutzung" },
      { type: "text", text: T.smscf.instruktion },
      { type: "radio", key: "SF01_01", label: T.smscf.SF01_01, options: T.smscf.skala, required: true },
      { type: "radio", key: "SF01_02", label: T.smscf.SF01_02, options: T.smscf.skala, required: true },
      { type: "radio", key: "SF01_03", label: T.smscf.SF01_03, options: T.smscf.skala, required: true }
    ],
    next: function () { return "T0-19"; }
  });

  // ── T0-19 Kontrollgefühl und Reue je App ───────────────
  pages.push({
    id: "T0-19",
    items: function (ctx) {
      var out = [{ type: "title", text: "Deine Apps in der letzten Woche" }];
      knownApps(ctx).forEach(function (app) {
        out.push({ type: "subtitle", text: APP_LABEL[app] });
        out.push({ type: "radio", key: "KG01_" + app,
                   label: T.kgre.KG01.replace(/\[App\]/g, APP_LABEL[app]),
                   options: scalePoints(7, T.kgre.KG01_anker[0], T.kgre.KG01_anker[1]), required: true });
        out.push({ type: "radio", key: "RE01_" + app,
                   label: T.kgre.RE01.replace(/\[App\]/g, APP_LABEL[app]),
                   options: T.kgre.RE01_skala, required: true });
      });
      return out;
    },
    next: function () { return "T0-20"; }
  });

  // ── T0-20 Selbstkontrolle (nur T0) ─────────────────────
  pages.push({
    id: "T0-20",
    items: function () {
      var out = [
        { type: "title", text: "Über dich" },
        { type: "text", text: T.bscs.instruktion }
      ];
      T.bscs.items.forEach(function (text, i) {
        var nr = String(i + 1).padStart(2, "0");
        out.push({ type: "radio", key: "BS01_" + nr, label: text,
                   options: T.bscs.skala, required: true });
      });
      return out;
    },
    next: function () { return "T0-21"; }
  });

  // ── T0-21 Zwei offene Fragen ───────────────────────────
  pages.push({
    id: "T0-21",
    items: [
      { type: "title", text: "Zwei offene Fragen" },
      { type: "textarea", key: "QU01", label: T.offen.QU01, rows: 5 },
      { type: "textarea", key: "QU02", label: T.offen.QU02, rows: 5 }
    ],
    next: function () { return "T0-22"; }
  });

  // ── T0-22 Angaben zu dir ───────────────────────────────
  pages.push({
    id: "T0-22",
    items: [
      { type: "title", text: T.demo.title },
      { type: "number", key: "DE01", label: T.demo.DE01, min: 18, max: 99, required: true },
      { type: "radio", key: "DE02", label: T.demo.DE02, options: T.demo.DE02_options, required: true },
      { type: "textinput", key: "DE03", label: T.demo.DE03, required: true },
      { type: "number", key: "DE04", label: T.demo.DE04, min: 1, max: 40, required: true },
      { type: "radio", key: "DE05", label: T.demo.DE05, options: T.demo.DE05_options, required: true }
    ],
    next: function () { return "T0-23"; }
  });

  // ── T0-23 Übergang zur Schulung ────────────────────────
  pages.push({
    id: "T0-23",
    items: [
      { type: "title", text: "Fast geschafft" },
      { type: "text", text: T.t23.text }
    ],
    finishWave: true,
    nextLabel: T.t23.button,
    next: function () { return "END"; }
  });

  // Zurück von T0-01 führt auf die Link-Seite der Anmeldung (R-05)
  window.PAGES_T0 = { wave: "T0", start: "T0-01", pages: pages, backTo: { def: "PAGES_R", page: "R-05" } };
})();
