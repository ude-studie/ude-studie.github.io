/*
 * pages/t1t2.js – Folge-Fragebogen (Welle T1, etwa zwei Wochen nach T0).
 * Rework 07.10., Abschnitt 8: kein „Werte abtippen“ mehr, Erkennen im Format
 * der Schulung (Ja → „Wie?“, Nein/Weiß nicht → „Gedanken“), danach Einfluss
 * und Akzeptanz je gezeigtem Muster. Welche Screens eine Person sieht,
 * berechnet recognition/sets.js (followupSet) aus ihren Apps.
 */
(function () {
  "use strict";
  var T0 = window.ITEMS.T0;
  var T = window.ITEMS.T12;
  var R = window.RECOGNITION;
  var E = T0.erkennen;

  var APP_LABEL = { ig: "Instagram", tt: "TikTok", sc: "Snapchat" };
  var APP_ORDER = ["ig", "tt", "sc"];

  function knownApps(ctx) {
    var a = ctx.apps || [];
    return APP_ORDER.filter(function (k) { return a.indexOf(k) >= 0; });
  }
  function fill(s, map) {
    return String(s).replace(/\{(\w+)\}/g, function (m, k) { return map[k] != null ? map[k] : m; });
  }

  function buildWave(wave) {
    return function (ctx) {
      var set = R.followupSet(knownApps(ctx));
      var pages = [];
      var id = function (n) { return wave + "-" + String(n).padStart(2, "0"); };
      var pageNo = 1;

      // Start
      pages.push({ id: id(pageNo++), items: [
        { type: "title", text: T.startTitle },
        { type: "text", text: T.start }
      ] });

      // Screenshot der Bildschirmzeit (wie T0-04, jeweils die letzte Woche)
      pages.push({ id: id(pageNo++), items: [
        { type: "title", text: "Screenshot deiner Bildschirmzeit" },
        { type: "steps", byOs: { ios: T0.t04.schritte_ios, android: T0.t04.schritte_android } },
        { type: "sketch", byOs: { ios: "ios", android: "android" } },
        { type: "text", byOs: { ios: T0.t04.zusatz_ios, android: T0.t04.zusatz_android } },
        { type: "radio", key: "SU01", label: T0.t04.SU01, required: true, options: [
          { v: "ja", label: "Ja" }, { v: "nein", label: "Nein" }
        ] },
        { type: "upload", key: "SU02", label: T0.t04.SU02_label,
          warnIfEmpty: T0.t04.SU02_hinweis_leer, visibleIf: { key: "SU01", equals: "ja" } },
        { type: "multi", key: "SU03", label: T0.t04.SU03, options: T0.t04.SU03_options,
          required: true, visibleIf: { key: "SU01", equals: "nein" } }
      ] });

      // Geänderte Einstellungen
      pages.push({ id: id(pageNo++), items: [
        { type: "title", text: "Geänderte Einstellungen" },
        { type: "multi", key: "SH01", label: T.SH01, options: T.SH01_options, required: true },
        { type: "upload", key: "SH02", label: T.SH02,
          visibleIf: { key: "SH01", when: function (v) {
            return Array.isArray(v) && v.length > 0 && !(v.length === 1 && v[0] === "nichts");
          } } }
      ] });

      // Erkennen: ein Screen je Seite, Muster und Ablenker gemischt
      set.forEach(function (entry, i) {
        var tag = entry.muster; // m1 … m8 bzw. d1 … d3
        var meta = { muster: tag, app: entry.app, variante: entry.id, position: entry.position };
        if (entry.distraktor) meta.ablenker = entry.target;
        var items = [];
        if (i === 0) items.push({ type: "text", text: fill(E.instruktion, { n: set.length }) });
        items.push({ type: "subtitle", text: fill(E.screenOf, { x: i + 1, n: set.length }) });
        items.push({ type: "screen", entry: entry });
        items.push({ type: "radio", key: "ER_" + tag + "a", label: E.ERa, options: E.ERa_options,
                     required: true, meta: meta });
        items.push({ type: "textarea", key: "ER_" + tag + "b", label: E.ERb, rows: 3, required: true,
                     minWords: 3, minWordsMsg: E.ERb_short, saveHidden: true, meta: meta,
                     visibleIf: { key: "ER_" + tag + "a", equals: "ja" } });
        items.push({ type: "textarea", key: "ER_" + tag + "c", label: E.ERc, rows: 3, saveHidden: true, meta: meta,
                     visibleIf: { key: "ER_" + tag + "a", equals: ["nein", "weiss_nicht"] } });
        pages.push({ id: id(pageNo++), items: items });
      });

      // Einfluss und Akzeptanz je gezeigtem Muster (kleine Bilder mit „Bild vergrößern“)
      pages.push({ id: id(pageNo++), items: function () {
        var out = [
          { type: "title", text: "Einfluss und Akzeptanz" },
          { type: "text", text: T0.t17.intro }
        ];
        set.forEach(function (entry) {
          if (entry.distraktor) return;
          var meta = { muster: entry.muster, app: entry.app, variante: entry.id, position: entry.position };
          out.push({ type: "screen", entry: entry, mini: true });
          out.push({ type: "radio", key: "AK01_" + entry.muster, label: T0.t17.AK01,
                     options: T0.t17.AK01_skala, required: true, meta: meta });
          out.push({ type: "radio", key: "AK02_" + entry.muster, label: T0.t17.AK02,
                     options: T0.t17.AK02_skala, required: true, meta: meta });
        });
        return out;
      } });

      // SMSCF mit Kontrollfrage ATT02 (nur markieren, kein Ausschluss)
      var smscf = { id: id(pageNo++), items: [
        { type: "title", text: "Deine Social-Media-Nutzung" },
        { type: "text", text: T0.smscf.instruktion },
        { type: "radio", key: "SF01_01", label: T0.smscf.SF01_01, options: T0.smscf.skala, required: true },
        { type: "radio", key: "SF01_02", label: T0.smscf.SF01_02, options: T0.smscf.skala, required: true },
        { type: "radio", key: "ATT02", label: T0.smscf.ATT02, options: T0.smscf.skala, required: true },
        { type: "radio", key: "SF01_03", label: T0.smscf.SF01_03, options: T0.smscf.skala, required: true }
      ] };
      smscf.after = function (answers, c) {
        window.DB.saveEvent(c.code, wave, smscf.id, "ATT02_pass", answers.ATT02 === T0.smscf.ATT02_richtig, null, c.pilot);
      };
      pages.push(smscf);

      // Kontrollgefühl und Reue je App
      pages.push({ id: id(pageNo++), items: function (c) {
        var out = [{ type: "title", text: "Deine Apps in der letzten Woche" }];
        knownApps(c).forEach(function (app) {
          out.push({ type: "subtitle", text: APP_LABEL[app] });
          out.push({ type: "radio", key: "KG01_" + app,
                     label: T0.kgre.KG01.replace(/\[App\]/g, APP_LABEL[app]),
                     options: T0.kgre.KG01_skala, required: true });
          out.push({ type: "radio", key: "RE01_" + app,
                     label: T0.kgre.RE01.replace(/\[App\]/g, APP_LABEL[app]),
                     options: T0.kgre.RE01_skala, required: true });
        });
        return out;
      } });

      // Zwei offene Fragen zum Schluss
      pages.push({ id: id(pageNo++), items: [
        { type: "title", text: "Zwei Fragen zum Schluss" },
        { type: "hint", text: T0.offen.diktat },
        { type: "textarea", key: "QU03", label: T.QU03, rows: 5 },
        { type: "textarea", key: "QU04", label: T.QU04, rows: 5 }
      ] });

      // Ende der Studie
      pages.push({ id: id(pageNo++), items: [
        { type: "title", text: T.t1EndTitle }, { type: "text", text: T.t1EndText }
      ], finishWave: true, next: function () { return "END"; } });

      // next = jeweils nächste Seite (Endseite behält END)
      pages.forEach(function (p, i) {
        if (p.finishWave) return;
        var nid = pages[i + 1] ? pages[i + 1].id : "END";
        p.next = function () { return nid; };
      });

      return { wave: wave, start: pages[0].id, pages: pages };
    };
  }

  // Seit 06.10. gibt es nur einen Folge-Fragebogen (Welle T1)
  window.PAGES_T1 = { wave: "T1", build: buildWave("T1") };
})();
