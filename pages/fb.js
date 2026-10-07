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
        items: [
          { type: "title", text: T.title },
          { type: "hint", text: window.ITEMS.T0.offen.diktat },
          { type: "radio", key: "FB01", label: T.FB01, options: T.FB01_options, required: true },
          { type: "textarea", key: "FB02", label: T.FB02, rows: 3,
            visibleIf: { key: "FB01", equals: ["ja_deutlich", "ja_ansatzweise"] } },
          { type: "textarea", key: "FB03", label: T.FB03, rows: 3 },
          { type: "textarea", key: "FB04", label: T.FB04, rows: 3 },
          { type: "textarea", key: "FB05", label: T.FB05, rows: 3 }
        ],
        // Eine Seite; danach zeigt der Router die eine Abschlussseite (Wartesite)
        extraEvents: [{ key: "FB_DONE", value: true }],
        next: function () { return "END"; }
      }
    ]
  };
})();
