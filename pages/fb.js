/*
 * pages/fb.js – Feedback zur Schulung (direkt nach der Schulung, gleicher Tag).
 * Wortlaute aus Auftrag v3 (Instruktion FB01 angelehnt an Danek et al. 2013).
 */
(function () {
  "use strict";
  var T = window.ITEMS.FB;

  window.PAGES_FB = {
    wave: "FB",
    start: "FB-01",
    pages: [
      {
        id: "FB-01",
        items: function (ctx) {
          // Nur Muster, die die Person in der Schulung gesehen hat (gleiche Regel wie boost/)
          var apps = ["ig", "tt", "sc"].filter(function (a) { return (ctx.apps || []).indexOf(a) >= 0; });
          var shown = window.RECOGNITION.schulungShown(apps).map(function (e) { return e.muster; });
          var aha = { key: "FB01", equals: ["ja_deutlich", "ja_ansatzweise"] };
          return [
            { type: "title", text: T.title },
            { type: "radio", key: "FB01", label: T.FB01, options: T.FB01_options, required: true },
            { type: "multi", key: "FB02", label: T.FB02, visibleIf: aha,
              options: T.FB02_options.filter(function (o) { return shown.indexOf(o.v) >= 0; }) },
            { type: "multi", key: "FB02b", label: T.FB02b, options: T.FB02b_options, visibleIf: aha },
            { type: "hint", text: window.ITEMS.T0.offen.diktat },
            { type: "textarea", key: "FB03", label: T.FB03, rows: 3 },
            { type: "textarea", key: "FB04", label: T.FB04, rows: 3 },
            { type: "textarea", key: "FB06", label: T.FB06, rows: 3 },
            { type: "textarea", key: "FB05", label: T.FB05, rows: 3 }
          ];
        },
        // Eine Seite; danach zeigt der Router die eine Abschlussseite (Wartesite)
        extraEvents: [{ key: "FB_DONE", value: true }],
        next: function () { return "END"; }
      }
    ]
  };
})();
