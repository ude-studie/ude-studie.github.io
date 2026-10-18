/*
 * pages/t1t2.js – Folge-Fragebögen T1 und T2 (survey-v4, Umbau-Auftrag Etappe 7).
 * Wortlaut gruppenneutral: G1 hatte bis T2 keine Schulung.
 *
 *   T1: T1-01 Willkommen · T1-02 Screenshot · T1-03-1 … -7 Wiedererkennung (Set T1)
 *       T1-03-AK · T1-04 SMSCF + ATT02 · T1-05 Kontrollgefühl · T1-06 SH01/SH02 → fertig
 *   T2: wie T1 mit Set T2 und Kontrollfrage ATT03 statt ATT02 · T2-07 QU03/QU04 → fertig
 *
 * Gestrichen in v4: RE01 (Reue). QU03/QU04 nur noch in T2.
 */
(function () {
  "use strict";
  var T0 = window.ITEMS.T0;
  var T = window.ITEMS.T12;
  var K = window.PAGEKIT;

  function buildWave(wave) {
    return function (ctx) {
      var p = wave + "-";
      var pages = [];
      pages.push({ id: p + "01", items: [
        { type: "title", text: T.startTitle },
        { type: "text", text: wave === "T1" ? T.startT1 : T.startT2 }
      ] });
      pages.push(K.screenshotPage(p + "02", { letzteWoche: true }));
      K.recognitionPages(wave, p + "03", ctx).forEach(function (pg) { pages.push(pg); });
      var att = wave === "T1"
        ? { key: "ATT02", text: T0.smscf.ATT02, richtig: T0.smscf.ATT02_richtig, after: 2 }
        : { key: "ATT03", text: T0.smscf.ATT03, richtig: T0.smscf.ATT03_richtig, after: 2 };
      pages.push(K.smscfPage(p + "04", wave, att));
      pages.push(K.kgPage(p + "05"));
      pages.push({ id: p + "06", items: [
        { type: "title", text: T.shTitle },
        { type: "multi", key: "SH01", label: T.SH01, options: T.SH01_options, required: true },
        { type: "upload", key: "SH02", label: T.SH02,
          visibleIf: { key: "SH01", when: function (v) {
            return Array.isArray(v) && v.length > 0 && !(v.length === 1 && v[0] === "nichts");
          } } }
      ] });
      if (wave === "T2") {
        pages.push({ id: p + "07", items: [
          { type: "title", text: T.schlussTitle },
          { type: "hint", text: T0.offen.diktat, touchOnly: true },
          { type: "textarea", key: "QU03", label: T.QU03, rows: 5 },
          { type: "textarea", key: "QU04", label: T.QU04, rows: 5 }
        ] });
      }
      pages[pages.length - 1].finishWave = true; // danach entscheidet der Router (Warteseite bzw. Abschluss)
      K.chain(pages);
      return { wave: wave, start: pages[0].id, pages: pages };
    };
  }

  window.PAGES_T1 = { wave: "T1", build: buildWave("T1") };
  window.PAGES_T2 = { wave: "T2", build: buildWave("T2") };
})();
