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
      ig: [{ id: "T0-d-ig-1", ctx: "Dein Instagram-Feed.", name: "Profilbild" }, { id: "T0-d-ig-2", ctx: "Deine Nachrichten in Instagram.", name: "Suchfeld (Nachrichten)" }, { id: "T0-d-ig-3", ctx: "Dein Profil in Instagram.", name: "Menü (Profil)" }],
      tt: [{ id: "T0-d-tt-1", ctx: "Dein TikTok-Feed.", name: "Lupe (Suche)" }, { id: "T0-d-tt-2", ctx: "Dein TikTok-Feed.", name: "Posteingang-Symbol" }, { id: "T0-d-tt-3", ctx: "Dein Profil in TikTok.", name: "Profil bearbeiten" }],
      sc: [{ id: "T0-d-sc-1", ctx: "Deine Chats in Snapchat.", name: "Zahnrad (Einstellungen)" }, { id: "T0-d-sc-2", ctx: "Deine Chats in Snapchat.", name: "Kamera-Symbol" }, { id: "T0-d-sc-3", ctx: "Deine Chats in Snapchat.", name: "Profilbild" }]
    },
    T1: {
      ig: [{ id: "T1-d-ig-1", ctx: "Ein Beitrag in Instagram.", name: "Zurück-Pfeil" }, { id: "T1-d-ig-2", ctx: "Dein Instagram-Feed.", name: "Drei Punkte (Menü)" }, { id: "T1-d-ig-3", ctx: "Dein Instagram-Feed.", name: "Startseite-Symbol" }],
      tt: [{ id: "T1-d-tt-1", ctx: "Ein Profil in TikTok.", name: "Zahnrad (Einstellungen)" }, { id: "T1-d-tt-2", ctx: "Dein TikTok-Feed.", name: "Reiter „Folge ich“" }, { id: "T1-d-tt-3", ctx: "Dein TikTok-Feed.", name: "Teilen" }],
      sc: [{ id: "T1-d-sc-1", ctx: "Deine Chats in Snapchat.", name: "Suchfeld" }, { id: "T1-d-sc-2", ctx: "Deine Chats in Snapchat.", name: "Karte-Symbol" }, { id: "T1-d-sc-3", ctx: "Deine Chats in Snapchat.", name: "Name im Chat" }]
    },
    T2: {
      ig: [{ id: "T2-d-ig-1", ctx: "Dein Instagram-Feed.", name: "Plus (neuer Beitrag)" }, { id: "T2-d-ig-2", ctx: "Dein Instagram-Feed.", name: "Merken-Symbol" }, { id: "T2-d-ig-3", ctx: "Dein Profil in Instagram.", name: "Profil bearbeiten" }],
      tt: [{ id: "T2-d-tt-1", ctx: "Dein TikTok-Feed.", name: "Profil-Symbol" }, { id: "T2-d-tt-2", ctx: "Dein Posteingang in TikTok.", name: "Name im Posteingang" }, { id: "T2-d-tt-3", ctx: "Dein TikTok-Feed.", name: "Start-Symbol" }],
      sc: [{ id: "T2-d-sc-1", ctx: "Deine Chats in Snapchat.", name: "Überschrift „Chats“" }, { id: "T2-d-sc-2", ctx: "Deine Chats in Snapchat.", name: "Chat-Symbol" }, { id: "T2-d-sc-3", ctx: "Deine Chats in Snapchat.", name: "Freund hinzufügen" }]
    }
  };

  // Kontextsatz über jedem Screen (seit 18.10.: alle Screens, damit klar ist, was zu sehen ist,
  // und Autoplay nicht als einziger Screen mit Satz auffällt). m4 Wortlaut aus dem Umbau-Auftrag, Rest ENTWURF.
  var CTX = {
    m1: { tt: "Du scrollst durch deinen TikTok-Feed. Unten beginnt schon das nächste Video.",
          ig: "Du scrollst durch die Reels. Unten beginnt schon das nächste Video." },
    m4: { tt: "Du hast gerade weitergescrollt.", ig: "Du hast gerade weitergescrollt." },
    m3: { tt: "Dein TikTok-Feed.", ig: "Dein Instagram-Feed." },
    m6: { ig: "Dein Sperrbildschirm.", tt: "Dein Sperrbildschirm.", sc: "Dein Sperrbildschirm." }
  };
  var CTX_SCREEN = { "T2-m3-ig": "Die Suche in Instagram." };

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
      e.ctx = CTX_SCREEN[e.id] || CTX[m][a.app];
      if (m === "m4") e.noFrame = true; // Autoplay: kein rot umrahmtes Element (seit 18.10.)
      list.push(e);
    });
    var rot = apps.length ? apps : [FALLBACK_APP];
    for (var i = 0; i < 3; i++) {
      var a = rot[i % rot.length], j = Math.floor(i / rot.length);
      var d = DISTRACTORS[wave][a][j % 3];
      list.push({ id: d.id, muster: "d" + (i + 1), app: a, target: d.name, distraktor: true, ctx: d.ctx });
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
