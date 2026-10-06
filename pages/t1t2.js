/*
 * pages/t1t2.js – Blöcke T1 und T2 (Auftrag v3, Abschnitt 5).
 * Gemeinsame Fabrik: T2 = T1 + zwei offene Fragen; Erkennen-Sets T1/T2 mit
 * nur den gezeigten Mustern (plus 3 Distraktoren), gezeigte Muster werden
 * deterministisch aus der App-Liste berechnet (window.STUDY_SHOWN_MUSTER).
 */
(function () {
  "use strict";
  var T0 = window.ITEMS.T0;
  var T = window.ITEMS.T12;
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

  function buildWave(wave) {
    return function (ctx) {
      var shown = window.STUDY_SHOWN_MUSTER(knownApps(ctx));
      var set = R.filterForShown(wave, shown);
      var pages = [];
      var id = function (n) { return wave + "-" + String(n).padStart(2, "0"); };
      var pageNo = 1;

      // Start
      pages.push({ id: id(pageNo++), items: [
        { type: "title", text: T.startTitle },
        { type: "text", text: T.start }
      ], next: null });

      // Screenshot (wie T0-04, jeweils die letzte Woche)
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
      ], next: null });

      // Werte abtippen (wie T0-05)
      pages.push({ id: id(pageNo++), items: function (c) {
        var out = [
          { type: "title", text: "Werte abtippen" },
          { type: "text", text: T0.t05.intro }
        ];
        knownApps(c).forEach(function (app) {
          out.push({ type: "subtitle", text: APP_LABEL[app] });
          out.push({ type: "number", key: "MI01_" + app, label: T0.t05.MI01,
                     hint: T0.t05.MI01_hinweis, min: 0, max: 10080 });
          out.push({ type: "number", key: "OE01_" + app, label: T0.t05.OE01, min: 0, max: 100000 });
        });
        out.push({ type: "subtitle", text: "Gesamt" });
        out.push({ type: "number", key: "MI01_total", label: T0.t05.MI01_total, min: 0, max: 10080 });
        return out;
      }, next: null });

      // Geänderte Einstellungen
      pages.push({ id: id(pageNo++), items: [
        { type: "title", text: "Geänderte Einstellungen" },
        { type: "multi", key: "SH01", label: T.SH01, options: T.SH01_options, required: true },
        { type: "upload", key: "SH02", label: T.SH02,
          visibleIf: { key: "SH01", when: function (v) {
            return Array.isArray(v) && v.length > 0 && !(v.length === 1 && v[0] === "nichts");
          } } }
      ], next: null });

      // Erkennen: gezeigte Muster + 3 Distraktoren
      set.forEach(function (entry, i) {
        var n = i + 1;
        var items = [];
        // Wortlaut wie T0, nur die Bildanzahl an das gefilterte Set angepasst
        if (i === 0) items.push({ type: "text",
          text: T0.erkennen.instruktion.replace("11", String(set.length)) });
        items.push({ type: "text", text: "Bild " + n + " von " + set.length });
        items.push({ type: "screen", entry: entry });
        items.push({ type: "radio", key: "ER" + n + "a", label: T0.erkennen.ERa,
                     options: T0.erkennen.ERa_options, required: true });
        items.push({ type: "textarea", key: "ER" + n + "b", label: T0.erkennen.ERb,
                     rows: 3, visibleIf: { key: "ER" + n + "a", equals: "ja" } });
        pages.push({ id: id(pageNo++), items: items,
          extraEvents: [{ key: "ER" + n + "_bild", value: entry.id }], // welches Bild Nummer n war
          next: null });
      });

      // Einfluss und Akzeptanz (nur gezeigte Muster)
      pages.push({ id: id(pageNo++), items: function () {
        var out = [
          { type: "title", text: "Einfluss und Akzeptanz" },
          { type: "text", text: T0.t17.intro }
        ];
        set.forEach(function (entry) {
          if (entry.distraktor) return;
          out.push({ type: "screen", entry: entry, mini: true });
          out.push({ type: "radio", key: "AK01_" + entry.muster, label: T0.t17.AK01,
                     options: scalePoints(5, T0.t17.AK01_anker[0], T0.t17.AK01_anker[1]), required: true });
          out.push({ type: "radio", key: "AK02_" + entry.muster, label: T0.t17.AK02,
                     options: scalePoints(5, T0.t17.AK02_anker[0], T0.t17.AK02_anker[1]), required: true });
        });
        return out;
      }, next: null });

      // SMSCF
      pages.push({ id: id(pageNo++), items: [
        { type: "title", text: "Deine Social-Media-Nutzung" },
        { type: "text", text: T0.smscf.instruktion },
        { type: "radio", key: "SF01_01", label: T0.smscf.SF01_01, options: T0.smscf.skala, required: true },
        { type: "radio", key: "SF01_02", label: T0.smscf.SF01_02, options: T0.smscf.skala, required: true },
        { type: "radio", key: "SF01_03", label: T0.smscf.SF01_03, options: T0.smscf.skala, required: true }
      ], next: null });

      // Kontrollgefühl und Reue je App
      pages.push({ id: id(pageNo++), items: function (c) {
        var out = [{ type: "title", text: "Deine Apps in der letzten Woche" }];
        knownApps(c).forEach(function (app) {
          out.push({ type: "subtitle", text: APP_LABEL[app] });
          out.push({ type: "radio", key: "KG01_" + app,
                     label: T0.kgre.KG01.replace(/\[App\]/g, APP_LABEL[app]),
                     options: scalePoints(7, T0.kgre.KG01_anker[0], T0.kgre.KG01_anker[1]), required: true });
          out.push({ type: "radio", key: "RE01_" + app,
                     label: T0.kgre.RE01.replace(/\[App\]/g, APP_LABEL[app]),
                     options: T0.kgre.RE01_skala, required: true });
        });
        return out;
      }, next: null });

      // Zwei offene Fragen zum Schluss (seit 06.10. im einzigen Folge-Fragebogen)
      pages.push({ id: id(pageNo++), items: [
        { type: "title", text: "Zwei Fragen zum Schluss" },
        { type: "textarea", key: "QU03", label: T.QU03, rows: 5 },
        { type: "textarea", key: "QU04", label: T.QU04, rows: 5 }
      ], next: null });

      // Ende der Studie
      pages.push({ id: id(pageNo++), items: [
        { type: "title", text: T.t1EndTitle }, { type: "text", text: T.t1EndText }
      ], finishWave: true, next: function () { return "END"; } });

      // next = jeweils nächste Seite in der Liste (Endseite behält END)
      pages.forEach(function (p, i) {
        if (p.finishWave) return;
        var nid = pages[i + 1] ? pages[i + 1].id : "END";
        p.next = (function (n) { return function () { return n; }; })(nid);
      });

      return { wave: wave, start: pages[0].id, pages: pages };
    };
  }

  // Seit 06.10. gibt es nur einen Folge-Fragebogen (Welle T1, Erkennens-Set T1).
  window.PAGES_T1 = { wave: "T1", build: buildWave("T1") };
})();
