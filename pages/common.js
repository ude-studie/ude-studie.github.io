/*
 * pages/common.js – Bausteine, die T0, T1 und T2 gemeinsam nutzen (v4).
 * Texte aus items.js, Screens aus recognition/sets.js und render.js.
 *
 *   screenshotPage   Screenshot der Bildschirmzeit (mit QR-Code am Computer)
 *   recognitionPages Wiedererkennung: 7 Screens (4 Kernmuster + 3 Ablenker,
 *                    Reihenfolge je Person zufällig) und „Die Elemente noch einmal“
 *   smscfPage        SMSCF, optional mit Kontrollfrage (ATT02 in T1, ATT03 in T2)
 *   kgPage           Kontrollgefühl je App (ohne Reue, v4)
 *   scalePage        Likert-Seite für BSCS, ASRS, FoMO, SRBAI
 */
(function () {
  "use strict";
  var T0 = window.ITEMS.T0;
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
  function nr(i) { return String(i).padStart(2, "0"); }

  // Screenshot der Bildschirmzeit. opts.letzteWoche: Hinweis „volle Woche Mo–So“ (T1, T2)
  function screenshotPage(id, opts) {
    var items = [
      { type: "title", text: "Screenshot deiner Bildschirmzeit" },
      { type: "desktopqr", text: T0.t04.desktopHinweis, linkLabel: T0.t04.desktopLinkLabel },
      { type: "steps", byOs: { ios: T0.t04.schritte_ios, android: T0.t04.schritte_android } },
      { type: "text", byOs: { ios: T0.t04.zusatz_ios, android: T0.t04.zusatz_android } }
    ];
    if (opts && opts.letzteWoche) items.push({ type: "text", text: T0.t04.letzteWoche });
    items.push(
      { type: "radio", key: "SU01", label: T0.t04.SU01, required: true, options: [
        { v: "ja", label: "Ja" }, { v: "nein", label: "Nein" }
      ] },
      { type: "upload", key: "SU02", label: T0.t04.SU02_label,
        warnIfEmpty: T0.t04.SU02_hinweis_leer, visibleIf: { key: "SU01", equals: "ja" } },
      { type: "multi", key: "SU03", label: T0.t04.SU03, options: T0.t04.SU03_options,
        required: true, visibleIf: { key: "SU01", equals: "nein" } }
    );
    return { id: id, items: items };
  }

  // Wiedererkennung einer Welle: ein Screen je Seite, danach Einfluss und Akzeptanz
  // je Kernmuster. Seiten-IDs: <prefix>-1 … <prefix>-7, <prefix>-AK
  function recognitionPages(wave, prefix, ctx) {
    var set = R.waveSet(wave, knownApps(ctx), ctx.code);
    var pages = [];
    set.forEach(function (entry, i) {
      var tag = entry.muster; // m1, m3, m4, m6 bzw. d1 … d3
      var meta = { muster: tag, app: entry.app, screen: entry.id, position: entry.position, welle: wave };
      if (entry.fallback) meta.fallback = true;
      if (entry.distraktor) meta.ablenker = entry.target;
      var items = [];
      if (i === 0) {
        items.push({ type: "title", text: E.title });
        items.push({ type: "text", text: fill(E.instruktion, { n: set.length }) });
      }
      items.push({ type: "subtitle", text: fill(E.screenOf, { x: i + 1, n: set.length }) });
      items.push({ type: "screen", entry: entry });
      items.push({ type: "radio", key: "ER_" + tag + "a", label: E.ERa, options: E.ERa_options,
                   required: true, meta: meta });
      items.push({ type: "textarea", key: "ER_" + tag + "b", label: E.ERb, rows: 3, saveHidden: true, meta: meta,
                   visibleIf: { key: "ER_" + tag + "a", equals: "ja" } });
      items.push({ type: "textarea", key: "ER_" + tag + "c", label: E.ERc, rows: 3, saveHidden: true, meta: meta,
                   visibleIf: { key: "ER_" + tag + "a", equals: ["nein", "weiss_nicht"] } });
      pages.push({ id: prefix + "-" + (i + 1), items: items });
    });

    // Einfluss und Akzeptanz je Kernmuster (kleine Bilder mit „Bild vergrößern“), in der gezeigten Reihenfolge
    pages.push({ id: prefix + "-AK", items: function () {
      var out = [
        { type: "title", text: T0.t17.title },
        { type: "text", text: T0.t17.intro }
      ];
      set.forEach(function (entry) {
        if (entry.distraktor) return;
        var meta = { muster: entry.muster, app: entry.app, screen: entry.id, position: entry.position, welle: wave };
        if (entry.fallback) meta.fallback = true;
        out.push({ type: "screen", entry: entry, mini: true });
        out.push({ type: "radio", key: "AK01_" + entry.muster, label: T0.t17.AK01,
                   options: T0.t17.AK01_skala, required: true, meta: meta });
        out.push({ type: "radio", key: "AK02_" + entry.muster, label: T0.t17.AK02,
                   options: T0.t17.AK02_skala, required: true, meta: meta });
      });
      return out;
    } });
    return pages;
  }

  // SMSCF; att = { key: "ATT02", text, richtig, after: 2 } setzt eine Kontrollfrage nach Item „after“
  function smscfPage(id, wave, att) {
    var S = T0.smscf;
    var items = [
      { type: "title", text: S.title },
      { type: "text", text: S.instruktion }
    ];
    ["SF01_01", "SF01_02", "SF01_03"].forEach(function (k, i) {
      items.push({ type: "radio", key: k, label: S[k], options: S.skala, required: true });
      if (att && i + 1 === att.after) items.push({ type: "radio", key: att.key, label: att.text, options: S.skala, required: true });
    });
    var page = { id: id, items: items };
    if (att) {
      page.after = function (answers, c) {
        // nur markieren, kein Ausschluss und keine Meldung
        window.DB.saveEvent(c.code, wave, id, att.key + "_pass", answers[att.key] === att.richtig, null, c.pilot);
      };
    }
    return page;
  }

  // Kontrollgefühl je App (RE01 gestrichen in v4)
  function kgPage(id) {
    return { id: id, items: function (ctx) {
      var out = [{ type: "title", text: T0.kg.title }];
      knownApps(ctx).forEach(function (app) {
        out.push({ type: "subtitle", text: APP_LABEL[app] });
        out.push({ type: "radio", key: "KG01_" + app,
                   label: T0.kg.KG01.replace(/\[App\]/g, APP_LABEL[app]),
                   options: T0.kg.KG01_skala, required: true });
      });
      return out;
    } };
  }

  // Likert-Seite: Variablen <prefix>_01 …; att = { at: 7, key, text, richtig } setzt eine Kontrollfrage nach Item „at“
  function scalePage(id, wave, def, prefix, att) {
    var page = { id: id, items: function () {
      var out = [
        { type: "title", text: def.title },
        { type: "text", text: def.instruktion }
      ];
      def.items.forEach(function (text, i) {
        out.push({ type: "radio", key: prefix + "_" + nr(i + 1), label: text, options: def.skala, required: true });
        if (att && i + 1 === att.at) out.push({ type: "radio", key: att.key, label: att.text, options: def.skala, required: true });
      });
      return out;
    } };
    if (att) {
      page.after = function (answers, c) {
        window.DB.saveEvent(c.code, wave, id, att.key + "_pass", answers[att.key] === att.richtig, null, c.pilot);
      };
    }
    return page;
  }

  // Seitenfolge verketten: next = jeweils die nächste Seite, die letzte beendet die Welle
  function chain(pages) {
    pages.forEach(function (p, i) {
      if (p.next) return;
      var nid = pages[i + 1] ? pages[i + 1].id : "END";
      p.next = function () { return nid; };
    });
    return pages;
  }

  window.PAGEKIT = {
    APP_LABEL: APP_LABEL,
    knownApps: knownApps,
    fill: fill,
    screenshotPage: screenshotPage,
    recognitionPages: recognitionPages,
    smscfPage: smscfPage,
    kgPage: kgPage,
    scalePage: scalePage,
    chain: chain
  };
})();
