/*
 * recognition/sets.js – Screen-Sets der Wiedererkennung (survey-v4, Umbau-Auftrag Etappe 4).
 *
 * Gemessen werden nur noch vier Kernmuster plus drei Ablenker je Welle:
 *   m1 Endloses Scrollen · m4 Autoplay · m3 Empfehlungen nach Schwäche · m6 Rückhol-Benachrichtigungen
 * Muster 2, 5, 7 und 8 werden nicht mehr gemessen.
 *
 * Drei getrennte Sets (T0, T1, T2): Kein Screen kommt in zwei Wellen vor, keiner
 * gleicht einem Schulungs-Screen (andere Konten, Inhalte, Fotos). Die Inhalte
 * baut recognition/render.js (CONTENT je Screen-ID).
 *
 * Welche App je Muster: die erste genutzte App aus APP_PREF (gleiche Reihe wie in
 * der Schulung), in allen drei Wellen dieselbe – so ändert sich zwischen T0, T1
 * und T2 nur der Inhalt, nicht die App. Für Snapchat gibt es bei m1, m3 und m4
 * keine Variante; wer nur Snapchat nutzt, sieht dort die Instagram-Variante
 * (fallback: true wird mitgespeichert). m6 zeigt einen Sperrbildschirm mit einer
 * Meldung einer App der Person.
 *
 * Ablenker: drei je Welle, reihum über die Apps der Person, in jeder Welle andere
 * Elemente. Reihenfolge der sieben Screens je Person und Welle zufällig, aber fest
 * (aus Code und Welle berechnet, damit ein Neuladen nichts verschiebt).
 */
(function () {
  "use strict";

  // Muster-Namen (für Auswertung und Vorschau, nicht für Teilnehmende sichtbar)
  var MUSTER = {
    m1: "Endloses Scrollen", m4: "Autoplay",
    m3: "Empfehlungen nach Schwäche", m6: "Rückhol-Benachrichtigungen"
  };
  var CORE = ["m1", "m4", "m3", "m6"];
  var STUDY_APPS = ["ig", "tt", "sc"];
  var APP_PREF = { m1: ["tt", "ig"], m4: ["ig", "tt"], m3: ["ig", "tt"], m6: ["ig", "tt", "sc"] };
  var FALLBACK_APP = "ig";

  // Screen-IDs je Welle, Muster und App (Inhalte in render.js)
  var SETS = {
    T0: {
      m1: { ig: "T0-m1-ig", tt: "T0-m1-tt" },
      m4: { ig: "T0-m4-ig", tt: "T0-m4-tt" },
      m3: { ig: "T0-m3-ig", tt: "T0-m3-tt" },
      m6: { ig: "T0-m6-ig", tt: "T0-m6-tt", sc: "T0-m6-sc" }
    },
    T1: {
      m1: { ig: "T1-m1-ig", tt: "T1-m1-tt" },
      m4: { ig: "T1-m4-ig", tt: "T1-m4-tt" },
      m3: { ig: "T1-m3-ig", tt: "T1-m3-tt" },
      m6: { ig: "T1-m6-ig", tt: "T1-m6-tt", sc: "T1-m6-sc" }
    },
    T2: {
      m1: { ig: "T2-m1-ig", tt: "T2-m1-tt" },
      m4: { ig: "T2-m4-ig", tt: "T2-m4-tt" },
      m3: { ig: "T2-m3-ig", tt: "T2-m3-tt" },
      m6: { ig: "T2-m6-ig", tt: "T2-m6-tt", sc: "T2-m6-sc" }
    }
  };

  // Ablenker je Welle und App: harmlose Bedienelemente, in jeder Welle andere
  var DISTRACTORS = {
    T0: {
      ig: [{ id: "T0-d-ig-1", name: "Profilbild" }, { id: "T0-d-ig-2", name: "Suchfeld (Nachrichten)" }, { id: "T0-d-ig-3", name: "Menü (Profil)" }],
      tt: [{ id: "T0-d-tt-1", name: "Lupe (Suche)" }, { id: "T0-d-tt-2", name: "Posteingang-Symbol" }, { id: "T0-d-tt-3", name: "Profil bearbeiten" }],
      sc: [{ id: "T0-d-sc-1", name: "Zahnrad (Einstellungen)" }, { id: "T0-d-sc-2", name: "Kamera-Symbol" }, { id: "T0-d-sc-3", name: "Profilbild" }]
    },
    T1: {
      ig: [{ id: "T1-d-ig-1", name: "Zurück-Pfeil" }, { id: "T1-d-ig-2", name: "Drei Punkte (Menü)" }, { id: "T1-d-ig-3", name: "Startseite-Symbol" }],
      tt: [{ id: "T1-d-tt-1", name: "Zahnrad (Einstellungen)" }, { id: "T1-d-tt-2", name: "Reiter „Folge ich“" }, { id: "T1-d-tt-3", name: "Teilen" }],
      sc: [{ id: "T1-d-sc-1", name: "Suchfeld" }, { id: "T1-d-sc-2", name: "Karte-Symbol" }, { id: "T1-d-sc-3", name: "Name im Chat" }]
    },
    T2: {
      ig: [{ id: "T2-d-ig-1", name: "Plus (neuer Beitrag)" }, { id: "T2-d-ig-2", name: "Merken-Symbol" }, { id: "T2-d-ig-3", name: "Profil bearbeiten" }],
      tt: [{ id: "T2-d-tt-1", name: "Profil-Symbol" }, { id: "T2-d-tt-2", name: "Name im Posteingang" }, { id: "T2-d-tt-3", name: "Start-Symbol" }],
      sc: [{ id: "T2-d-sc-1", name: "Überschrift „Chats“" }, { id: "T2-d-sc-2", name: "Chat-Symbol" }, { id: "T2-d-sc-3", name: "Freund hinzufügen" }]
    }
  };

  // Kontextsatz über dem Screen (nur Autoplay, Umbau-Auftrag Etappe 4)
  var CTX = { m4: "Du hast gerade weitergescrollt." }; // ENTWURF (Wortlaut aus dem Auftrag)

  // Fester Zufall je Code und Welle (FNV-1a + mulberry32)
  function hashCode(s) {
    var h = 2166136261;
    for (var i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
    return h >>> 0;
  }
  function seededRandom(seed) {
    return function () {
      seed = (seed + 0x6D2B79F5) >>> 0;
      var t = seed;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  // App, in der ein Muster für diese Person gemessen wird
  function appFor(muster, apps) {
    var pref = APP_PREF[muster];
    var hit = pref.filter(function (a) { return apps.indexOf(a) >= 0; })[0];
    return hit ? { app: hit, fallback: false } : { app: FALLBACK_APP, fallback: true };
  }

  // Set einer Welle für eine Person: 4 Kernmuster + 3 Ablenker, Reihenfolge zufällig (fest je Code)
  function waveSet(wave, appsIn, code) {
    var apps = STUDY_APPS.filter(function (a) { return (appsIn || []).indexOf(a) >= 0; });
    var list = [];
    CORE.forEach(function (m) {
      var a = appFor(m, apps);
      var e = { id: SETS[wave][m][a.app], muster: m, app: a.app, target: MUSTER[m] };
      if (a.fallback) e.fallback = true;
      if (CTX[m]) e.ctx = CTX[m];
      list.push(e);
    });
    var rot = apps.length ? apps : [FALLBACK_APP];
    for (var i = 0; i < 3; i++) {
      var a = rot[i % rot.length], j = Math.floor(i / rot.length);
      var d = DISTRACTORS[wave][a][j % 3];
      list.push({ id: d.id, muster: "d" + (i + 1), app: a, target: d.name, distraktor: true });
    }
    var rnd = seededRandom(hashCode(String(code || "") + "|" + wave));
    for (var k = list.length - 1; k > 0; k--) {
      var r = Math.floor(rnd() * (k + 1)); var t = list[k]; list[k] = list[r]; list[r] = t;
    }
    list.forEach(function (e, p) { e.position = p + 1; });
    return list;
  }

  window.RECOGNITION = {
    MUSTER: MUSTER, CORE: CORE, SETS: SETS, DISTRACTORS: DISTRACTORS, APP_PREF: APP_PREF,
    waveSet: waveSet, appFor: appFor
  };
})();
