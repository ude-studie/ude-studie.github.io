/*
 * pages/t0.js – Seitendefinitionen Block T0 (Rework 07.10., survey-v2).
 * Texte aus items.js (window.ITEMS.T0). Die Erkennen- und Akzeptanz-Fragen
 * zu T0 stecken seit dem Rework in der Schulung (boost/), nicht mehr hier.
 *
 *   T0-01 Start · T0-02 Screenshot · T0-03 SMSCF · T0-04 Kontrollgefühl/Reue
 *   T0-05 Selbstkontrolle mit Kontrollfrage · T0-06 Zwei offene Fragen → Schulung
 */
(function () {
  "use strict";
  var T = window.ITEMS.T0;

  var APP_LABEL = { ig: "Instagram", tt: "TikTok", sc: "Snapchat" };
  var APP_ORDER = ["ig", "tt", "sc"];

  // Apps aus der Anmeldung (SC03, im Profil gespeichert)
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

  // ── T0-02 Screenshot der Bildschirmzeit ────────────────
  pages.push({
    id: "T0-02",
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
    next: function () { return "T0-03"; }
  });

  // ── T0-03 Social-Media-Nutzung (SMSCF) ─────────────────
  pages.push({
    id: "T0-03",
    items: [
      { type: "title", text: "Deine Social-Media-Nutzung" },
      { type: "text", text: T.smscf.instruktion },
      { type: "radio", key: "SF01_01", label: T.smscf.SF01_01, options: T.smscf.skala, required: true },
      { type: "radio", key: "SF01_02", label: T.smscf.SF01_02, options: T.smscf.skala, required: true },
      { type: "radio", key: "SF01_03", label: T.smscf.SF01_03, options: T.smscf.skala, required: true }
    ],
    next: function () { return "T0-04"; }
  });

  // ── T0-04 Kontrollgefühl und Reue je App ───────────────
  pages.push({
    id: "T0-04",
    items: function (ctx) {
      var out = [{ type: "title", text: "Deine Apps in der letzten Woche" }];
      knownApps(ctx).forEach(function (app) {
        out.push({ type: "subtitle", text: APP_LABEL[app] });
        out.push({ type: "radio", key: "KG01_" + app,
                   label: T.kgre.KG01.replace(/\[App\]/g, APP_LABEL[app]),
                   options: T.kgre.KG01_skala, required: true });
        out.push({ type: "radio", key: "RE01_" + app,
                   label: T.kgre.RE01.replace(/\[App\]/g, APP_LABEL[app]),
                   options: T.kgre.RE01_skala, required: true });
      });
      return out;
    },
    next: function () { return "T0-05"; }
  });

  // ── T0-05 Selbstkontrolle mit Kontrollfrage ────────────
  pages.push({
    id: "T0-05",
    items: function () {
      var out = [
        { type: "title", text: "Über dich" },
        { type: "text", text: T.bscs.instruktion }
      ];
      T.bscs.items.forEach(function (text, i) {
        var nr = String(i + 1).padStart(2, "0");
        out.push({ type: "radio", key: "BS01_" + nr, label: text, options: T.bscs.skala, required: true });
        // Kontrollfrage zwischen Item 7 und 8, im selben Format
        if (i === 6) out.push({ type: "radio", key: "ATT01", label: T.bscs.ATT01, options: T.bscs.skala, required: true });
      });
      return out;
    },
    after: function (answers, ctx) {
      // nur markieren, kein Ausschluss und keine Meldung
      window.DB.saveEvent(ctx.code, "T0", "T0-05", "ATT01_pass", answers.ATT01 === T.bscs.ATT01_richtig, null, ctx.pilot);
    },
    next: function () { return "T0-06"; }
  });

  // ── T0-06 Zwei offene Fragen → danach die Schulung ─────
  pages.push({
    id: "T0-06",
    items: [
      { type: "title", text: T.offen.title },
      { type: "hint", text: T.offen.diktat },
      { type: "textarea", key: "QU01", label: T.offen.QU01, rows: 5 },
      { type: "textarea", key: "QU02", label: T.offen.QU02, rows: 5 }
    ],
    finishWave: true,
    nextLabel: "Weiter zur Schulung",
    next: function () { return "END"; }
  });

  // Zurück von T0-01 führt auf die letzte Seite der Anmeldung (R-05)
  window.PAGES_T0 = { wave: "T0", start: "T0-01", pages: pages, backTo: { def: "PAGES_R", page: "R-05" } };
})();
