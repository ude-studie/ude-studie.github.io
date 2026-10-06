/*
 * pages/r.js – Seitendefinitionen Block R (Registrierung) als Datenstruktur.
 * Texte kommen aus items.js, die Logik (Rendern, Speichern) aus study.js.
 *
 * Seitenformat:
 *   id        Seitenkennung (wird als events.page gespeichert)
 *   items     Liste der Elemente; Elemente mit key werden gespeichert
 *   next      function(answers, ctx) → nächste Seiten-ID oder "END"
 *   after     optionale Zusatzaktionen beim Verlassen (Profil, E-Mail …)
 *   terminal  true = Endseite ohne Weiter-Knopf
 */
(function () {
  "use strict";
  var T = window.ITEMS.R;
  var S = window.ITEMS.scales;

  window.PAGES_R = {
    wave: "R",
    start: "R-01",
    pages: [
      {
        id: "R-01",
        items: [
          { type: "title", text: T.r01.title },
          { type: "text", text: T.r01.text },
          { type: "doclink", label: T.r01.infoLink, href: T.r01.infoHref },
          { type: "check", key: "EW01", label: T.r01.EW01, required: true },
          { type: "check", key: "EW02", label: T.r01.EW02, required: true }
        ],
        next: function () { return "R-02"; }
      },
      {
        id: "R-02",
        items: [
          { type: "title", text: T.r02.title },
          { type: "radio", key: "SC01", label: T.r02.SC01, options: S.janein, required: true },
          { type: "radio", key: "SC02", label: T.r02.SC02, options: S.janein, required: true },
          { type: "multi", key: "SC03", label: T.r02.SC03, options: T.r02.SC03_options, required: true },
          { type: "radio", key: "SC04", label: T.r02.SC04, options: T.r02.SC04_options, required: true }
          // SC05 (Teilnahme an allen drei Terminen) auf Daniels Wunsch am 06.10. entfernt
        ],
        after: function (answers, ctx) {
          // Betriebssystem an der Person speichern (nur ios/android)
          var os = answers.SC04;
          if (os === "ios" || os === "android") {
            ctx.os = os;
            window.DB.saveProfile(ctx.code, os, null);
          }
        },
        next: function (answers) {
          var apps = answers.SC03 || [];
          var out = answers.SC01 === "nein" || answers.SC02 === "nein" ||
                    (apps.length === 1 && apps[0] === "keine") || apps.length === 0 ||
                    answers.SC04 === "anderes";
          return out ? "R-X" : "R-03";
        }
      },
      {
        id: "R-X",
        terminal: true,
        onEnter: function (ctx) {
          window.DB.saveEvent(ctx.code, "R", "R-X", "SCREEN_OUT", true, null, ctx.pilot);
        },
        items: [
          { type: "title", text: T.rx.title },
          { type: "text", text: T.rx.text }
        ]
      },
      {
        id: "R-03",
        items: [
          { type: "title", text: T.r03.title },
          { type: "email", key: "EM01", label: T.r03.EM01, required: true, error: T.r03.error }
        ],
        after: function (answers, ctx) {
          // E-Mail getrennt von den Antworten (contacts), in events nur ein Marker
          window.DB.saveEmail(ctx.code, answers.EM01);
        },
        // EM01 selbst wird NICHT als Event gespeichert:
        skipEventKeys: ["EM01"],
        extraEvents: [{ key: "EM_SAVED", value: true }],
        next: function () { return "R-04"; }
      },
      {
        id: "R-04",
        items: [
          { type: "title", text: T.r04.title },
          { type: "text", byOs: { ios: T.r04.intro_ios, android: T.r04.intro_android } },
          { type: "radio", key: "BZ01", label: T.r04.BZ01, options: T.r04.BZ01_options, required: true },
          { type: "notice", byOs: { ios: T.r04.findehilfe_ios, android: T.r04.findehilfe_android },
            visibleIf: { key: "BZ01", equals: "finde_ich_nicht" } }
        ],
        next: function () { return "R-05"; }
      },
      {
        id: "R-05",
        items: [
          { type: "title", text: T.r05.title },
          { type: "text", text: T.r05.text },
          { type: "linkbox" },  // persönlicher Link + Kopieren/Startbildschirm/Mail (study.js)
          { type: "text", text: T.r05.abschied }
        ],
        finishWave: true,  // markDone('R') beim Weiter
        next: function () { return "END"; }
      }
    ]
  };
})();
