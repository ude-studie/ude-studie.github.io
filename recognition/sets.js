/*
 * recognition/sets.js – Definition der Erkennens-Sets T0/T1/T2
 * (Auftrag v3, Tabelle in Abschnitt 5, Seiten T0-06 bis T0-16).
 *
 * Jeder Eintrag: muster (m1..m8 oder d1..d3 für Distraktoren), app,
 * beschreibung (was der Screen zeigt), target (was rot umrahmt ist).
 * Die Reihenfolge je Set ist fest gemischt und für alle gleich.
 *
 * Die eigentlichen HTML/CSS-Screens (im Browser gerendert, keine PNGs)
 * liefert recognition/render.js – bis dahin zeigt study.js einen
 * beschrifteten Platzhalter, damit der Ablauf komplett testbar ist.
 */
(function () {
  "use strict";

  // Muster-Namen (für Admin/Preview, nicht für Teilnehmende sichtbar)
  var MUSTER = {
    m1: "Endloses Scrollen", m2: "Ziehen zum Aktualisieren",
    m3: "Empfehlungen nach Schwäche", m4: "Autoplay",
    m5: "Herzen und Zähler", m6: "Rückhol-Benachrichtigungen",
    m7: "Streaks", m8: "Verfallende Inhalte"
  };

  // Feste, für alle gleiche Reihenfolge je Set (Ziel + 3 Distraktoren gemischt)
  var SETS = {
    T0: [
      { id: "T0-1",  muster: "m2", app: "fb", target: "Lade-Spinner beim Herunterziehen des Feeds" },
      { id: "T0-2",  muster: "d1", app: "ig", target: "Profilbild oben links", distraktor: true },
      { id: "T0-3",  muster: "m5", app: "tt", target: "Herz- und Kommentarzähler neben einem Kommentar" },
      { id: "T0-4",  muster: "m1", app: "ig", target: "nahtlos nachladende Reels ohne Ende-Markierung" },
      { id: "T0-5",  muster: "m6", app: "lock", target: "TikTok-Meldung auf dem Sperrbildschirm" },
      { id: "T0-6",  muster: "d2", app: "tt", target: "Suchleiste oben", distraktor: true },
      { id: "T0-7",  muster: "m4", app: "tt", target: "automatisch startendes nächstes Video" },
      { id: "T0-8",  muster: "m8", app: "sc", target: "Story-Ring mit Ablauf-Hinweis (24 Stunden)" },
      { id: "T0-9",  muster: "m3", app: "tt", target: "Für-dich-Empfehlung passend zum bisherigen Verhalten" },
      { id: "T0-10", muster: "d3", app: "sc", target: "Einstellungs-Zahnrad", distraktor: true },
      { id: "T0-11", muster: "m7", app: "sc", target: "Streak-Flamme mit Tageszähler in der Chatliste" }
    ],
    T1: [
      { id: "T1-1",  muster: "m4", app: "fb", target: "automatisch startendes Video im Feed" },
      { id: "T1-2",  muster: "d1", app: "fb", target: "Suchfeld oben", distraktor: true },
      { id: "T1-3",  muster: "m1", app: "x", target: "endlos nachladende Timeline" },
      { id: "T1-4",  muster: "m6", app: "lock", target: "Snapchat-Meldung auf dem Sperrbildschirm" },
      { id: "T1-5",  muster: "m2", app: "tt", target: "Aktualisieren-Geste im Posteingang" },
      { id: "T1-6",  muster: "d2", app: "x", target: "Profilbild", distraktor: true },
      { id: "T1-7",  muster: "m8", app: "fb", target: "Stories-Leiste mit Ablauf-Hinweis" },
      { id: "T1-8",  muster: "m5", app: "x", target: "Like- und Repost-Zähler unter einem Beitrag" },
      { id: "T1-9",  muster: "d3", app: "ig", target: "Zurück-Pfeil", distraktor: true },
      { id: "T1-10", muster: "m3", app: "fb", target: "Vorschläge-für-dich-Kachel" },
      { id: "T1-11", muster: "m7", app: "sc", target: "Streak-Flamme mit Tageszähler" }
    ],
    T2: [
      { id: "T2-1",  muster: "m3", app: "ig", target: "Explore-Kacheln passend zum bisherigen Verhalten" },
      { id: "T2-2",  muster: "d1", app: "tt", target: "Einstellungs-Zahnrad", distraktor: true },
      { id: "T2-3",  muster: "m6", app: "lock", target: "Instagram-Meldung auf dem Sperrbildschirm" },
      { id: "T2-4",  muster: "m1", app: "tt", target: "nahtlos nachladende Videos ohne Ende" },
      { id: "T2-5",  muster: "m8", app: "ig", target: "Story-Ring mit Ablauf-Hinweis" },
      { id: "T2-6",  muster: "d2", app: "sc", target: "Suchleiste", distraktor: true },
      { id: "T2-7",  muster: "m5", app: "ig", target: "Gefällt-mir-Zähler unter einem Beitrag" },
      { id: "T2-8",  muster: "m2", app: "ig", target: "Ziehen zum Aktualisieren im Feed" },
      { id: "T2-9",  muster: "m7", app: "sc", target: "Streak-Flamme mit Tageszähler" },
      { id: "T2-10", muster: "d3", app: "fb", target: "Menü-Knopf", distraktor: true },
      { id: "T2-11", muster: "m4", app: "ig", target: "automatisch startendes nächstes Reel" }
    ]
  };

  // Zu T1/T2: nur Bilder der Muster, die die Person in der Schulung gesehen
  // hat (gezeigte Muster aus events wave=BOOST), plus die 3 Distraktoren.
  function filterForShown(setName, shownMuster) {
    return SETS[setName].filter(function (e) {
      return e.distraktor || shownMuster.indexOf(e.muster) >= 0;
    });
  }

  window.RECOGNITION = { SETS: SETS, MUSTER: MUSTER, filterForShown: filterForShown };
})();
