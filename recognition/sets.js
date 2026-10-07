/*
 * recognition/sets.js – gebaute Erkennens-Screens und Zuordnung im Folge-Fragebogen
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

  // ── Folge-Fragebogen (Rework 07.10., Abschnitt 8) ─────────────────────────
  // Pro gezeigtem Muster ein Screen aus diesem Pool. Facebook und X entfallen.
  // Die Screen-Kennungen (T0-4 …) sind nur noch Namen der gebauten Screens in
  // render.js; die alten Erkennens-Sets T0/T1/T2 werden nicht mehr abgefragt.
  var FOLLOWUP_POOL = {
    m1: [{ id: "T0-4", app: "ig" }, { id: "T2-4", app: "tt" }],
    m2: [{ id: "T1-5", app: "tt" }, { id: "T2-8", app: "ig" }],
    m3: [{ id: "T0-9", app: "tt" }, { id: "T2-1", app: "ig" }],
    m4: [{ id: "T0-7", app: "tt" }, { id: "T2-11", app: "ig" }],
    m5: [{ id: "T0-3", app: "tt" }, { id: "T2-7", app: "ig" }],
    m6: [{ id: "T0-5", app: "tt" }, { id: "T1-4", app: "sc" }, { id: "T2-3", app: "ig" }], // Sperrbildschirm, Meldung dieser App
    m7: [{ id: "T1-11", app: "sc" }],
    m8: [{ id: "T0-8", app: "sc" }, { id: "T2-5", app: "ig" }]
  };
  // Ablenker im Folge-Fragebogen: alle verschieden von den Schulungs-Ablenkern
  // (Schulung: ig Merken/Menü/Profilbild, tt Name/Suche/Start, sc Profilbild/Titel/Name)
  var FOLLOWUP_DISTRACTORS = {
    ig: [{ id: "T1-9", name: "Zurück-Pfeil" }, { id: "FD-ig-suche", name: "Suchleiste" }, { id: "FD-ig-plus", name: "Plus (neuer Beitrag)" }],
    tt: [{ id: "T2-2", name: "Zahnrad (Einstellungen)" }, { id: "FD-tt-folgeich", name: "Reiter „Folge ich“" }, { id: "FD-tt-posteingang", name: "Posteingang-Symbol" }],
    sc: [{ id: "T2-6", name: "Suchleiste" }, { id: "FD-sc-kamera", name: "Kamera-Symbol" }, { id: "FD-sc-karte", name: "Karte-Symbol" }]
  };
  // Welche App die Schulung je Muster zeigt (Kopie der Regel aus boost/content.js:
  // erste genutzte App der Reihe; ist dafür kein Screen gebaut, die erste gebaute)
  var SCHULUNG = {
    m1: { order: ["tt", "ig", "sc"], built: ["tt", "ig"] },
    m2: { order: ["ig", "tt"], built: ["ig"] },
    m3: { order: ["ig", "tt", "sc"], built: ["ig", "tt"] },
    m4: { order: ["ig", "tt", "sc"], built: ["ig", "tt"] },
    m5: { order: ["ig", "tt", "sc"], built: ["ig", "tt"] },
    m6: { always: true },
    m7: { order: ["sc"], built: ["sc"] },
    m8: { order: ["ig", "sc", "tt"], built: ["ig"] }
  };
  var STUDY_APPS = ["ig", "tt", "sc"];

  // Muster der Schulung samt gezeigter App (Screen-App), in Schulungsreihenfolge
  function schulungShown(apps) {
    var out = [];
    Object.keys(SCHULUNG).forEach(function (m) {
      var d = SCHULUNG[m];
      if (d.always) { out.push({ muster: m, screenApp: "lock" }); return; }
      var target = d.order.filter(function (a) { return apps.indexOf(a) >= 0; })[0];
      if (!target) return;
      var screenApp = d.built.indexOf(target) >= 0 ? target
        : d.order.concat(d.built).filter(function (a) { return d.built.indexOf(a) >= 0; })[0];
      out.push({ muster: m, screenApp: screenApp });
    });
    return out;
  }

  // Screen je Muster: aus den Apps der Person, möglichst eine andere App als in
  // der Schulung. Vorrang: genutzt + andere App > genutzt > andere App > erster.
  function pickScreen(muster, apps, schulungApp) {
    var pool = FOLLOWUP_POOL[muster];
    var used = function (e) { return apps.indexOf(e.app) >= 0; };
    var other = function (e) { return e.app !== schulungApp; };
    return pool.filter(function (e) { return used(e) && other(e); })[0] ||
      pool.filter(used)[0] || pool.filter(other)[0] || pool[0];
  }

  // Komplettes Set des Folge-Fragebogens für eine Person: gezeigte Muster in
  // Schulungsreihenfolge, drei Ablenker nach dem 2., 4. und 6. Muster (gleiche
  // Regel wie in der Schulung), Ablenker reihum über die Apps der Person.
  function followupSet(appsIn) {
    var apps = STUDY_APPS.filter(function (a) { return (appsIn || []).indexOf(a) >= 0; });
    var shown = schulungShown(apps);
    var list = apps.length ? apps : ["ig"];
    var dists = [];
    for (var i = 0; i < 3; i++) {
      var a = list[i % list.length], pool = FOLLOWUP_DISTRACTORS[a], j = Math.floor(i / list.length);
      var d = pool[j % pool.length];
      dists.push({ id: d.id, muster: "d" + (i + 1), k: i + 1, app: a, target: d.name, distraktor: true });
    }
    var n = shown.length;
    var after = n >= 6 ? [2, 4, 6] : [1, 2, 3].map(function (k) { return Math.max(1, Math.round(k * n / 4)); });
    var seq = [], di = 0;
    shown.forEach(function (s, idx) {
      var e = pickScreen(s.muster, apps, s.screenApp);
      seq.push({ id: e.id, muster: s.muster, app: e.app, schulungApp: s.screenApp, target: MUSTER[s.muster] });
      while (di < dists.length && after[di] === idx + 1) { seq.push(dists[di]); di++; }
    });
    seq.forEach(function (e, p) { e.position = p + 1; });
    return seq;
  }

  window.RECOGNITION = {
    SETS: SETS, MUSTER: MUSTER, FOLLOWUP_POOL: FOLLOWUP_POOL, FOLLOWUP_DISTRACTORS: FOLLOWUP_DISTRACTORS,
    schulungShown: schulungShown, followupSet: followupSet
  };
})();
