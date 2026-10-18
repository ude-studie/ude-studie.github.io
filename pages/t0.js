/*
 * pages/t0.js – erster Fragebogen (Welle T0), survey-v4.
 * Reihenfolge (seit 18.10.: Wiedererkennung ans Ende, damit die Screens die Selbstauskünfte
 * und die offene Frage QU01 nicht beeinflussen):
 *
 *   T0-01 Einleitung · T0-02 Screenshot · T0-03 SMSCF · T0-04 Kontrollgefühl je App
 *   T0-05 Selbstkontrolle SK01 (8 Items) + ATT01 · T0-06 ASRS-6 · T0-07 FoMO · T0-08 SRBAI
 *   T0-09 offene Frage QU01 · T0-10-1 … T0-10-7 Wiedererkennung · T0-10-AK Einfluss/Akzeptanz
 *   → Welle fertig → Zuteilung (Router)
 *
 * Gestrichen in v4: RE01 (Reue), QU02, Übergangsseite „Gleich beginnt die Schulung“.
 * Die Seiten hängen von Apps und Code ab (Wiedererkennung), daher build(ctx).
 */
(function () {
  "use strict";
  var T = window.ITEMS.T0;
  var K = window.PAGEKIT;

  function build(ctx) {
    var pages = [];
    pages.push({ id: "T0-01", items: [
      { type: "title", text: T.t01.title },
      { type: "text", text: T.t01.text }
    ] });
    pages.push(K.screenshotPage("T0-02"));
    pages.push(K.smscfPage("T0-03", "T0", null));
    pages.push(K.kgPage("T0-04"));
    // Selbstkontrolle: 8-Item-Fassung der SCS-K-D (SK01_01–08), Kontrollfrage nach Item 4
    pages.push(K.scalePage("T0-05", "T0", T.sk, "SK01",
      { at: 4, key: "ATT01", text: T.sk.ATT01, richtig: T.sk.ATT01_richtig }));
    // ASRS-6 (0–4) mit Zusatzwerten AS01_sum (0–24) und AS01_pos (Zahl auffälliger Items)
    var asrs = K.scalePage("T0-06", "T0", T.asrs, "AS01");
    asrs.after = function (answers, c) {
      var sum = 0, pos = 0;
      T.asrs.items.forEach(function (_, i) {
        var v = answers["AS01_0" + (i + 1)];
        if (typeof v !== "number") return;
        sum += v;
        if (v >= T.asrs.auffaelligAb[i]) pos++;
      });
      window.DB.saveEvent(c.code, "T0", "T0-06", "AS01_sum", sum, null, c.pilot);
      window.DB.saveEvent(c.code, "T0", "T0-06", "AS01_pos", pos, null, c.pilot);
    };
    pages.push(asrs);
    pages.push(K.scalePage("T0-07", "T0", T.fomo, "FO01"));
    pages.push(K.scalePage("T0-08", "T0", T.srbai, "SR01"));
    pages.push({ id: "T0-09", items: [
      { type: "title", text: T.offen.title },
      { type: "hint", text: T.offen.diktat, touchOnly: true },
      { type: "textarea", key: "QU01", label: T.offen.QU01, rows: 5 }
    ] });
    K.recognitionPages("T0", "T0-10", ctx).forEach(function (p) { pages.push(p); });
    pages[pages.length - 1].finishWave = true;
    K.chain(pages);
    // Zurück von T0-01 führt auf die letzte Seite der Anmeldung (R-05)
    return { wave: "T0", start: "T0-01", pages: pages, backTo: { def: "PAGES_R", page: "R-05" } };
  }

  window.PAGES_T0 = { wave: "T0", build: build };
})();
