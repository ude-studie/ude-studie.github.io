/*
 * content.js – Texte und Screen-Definitionen der Schulung (boost-v7, 18.10.2026).
 * Wortlaute hier ändern, nicht in app.js.
 *
 * v7 (Umbau-Auftrag Etappe 5):
 *  - nur noch die vier Kernmuster, in dieser Reihenfolge: 1 Endloses Scrollen →
 *    4 Autoplay → 3 Empfehlungen nach Schwäche → 6 Rückhol-Benachrichtigungen
 *  - je Muster drei Schritte: Antwort → Ausprobieren → Erklärung
 *    (Einschätzen und die Ablenker sind gestrichen; die Messung steckt jetzt im Fragebogen)
 *  - Startseite „So läuft die Schulung ab“, zwei Übungen, Einordnung, Zusammenfassung
 *  - danach je Gruppe: neutraler Teil (filler, nur G3) bzw. Wenn-Dann-Plan (plan, nur G4)
 *  - Muster 2, 5, 7, 8 sowie Facebook/X sind aus dem Code entfernt (Sicherung: _Sicherung_Schulung-App_v3_2026-10-18)
 *  - einheitliche Beispielkonten in allen Screens: jonas.r, mia.kocht, tom.reist, lena_k
 *
 * Aufbau je Muster:
 *   id, key          Nummer und Name im Datenformat (nicht ändern; P1, P4, P3, P6)
 *   order            Vorrang der Apps: gezeigt wird die erste App dieser Reihe, die die Person nutzt.
 *                    Gibt es für diese App keinen Screen (z. B. Snapchat), kommt der Instagram-Screen
 *                    mit dem Hinweis „Bei … funktioniert das genauso.“
 *   question, options, correct   Frage, drei Antworten (Nummern 1–3), richtige Nummer.
 *                    Eine Variante darf eine eigene question haben.
 *   name, was, wirkung, zweck    Erklärung (gleich für alle Varianten)
 *   short, satz      Name und ein Satz für die Zusammenfassung
 *   variants         gebaute Screens je App (Vorlage in app.js, SCREENS)
 *
 * Je Variante: screen (Vorlage), ctxA (Kontext vor dem Ausprobieren), ctxB (danach),
 * hint (Hinweis nach dem Ausprobieren), markLabel (Vorlesetext der Umrandung), data.
 * Texte mit „// ENTWURF“ sind neu in v7 und stehen in TEXTAENDERUNGEN-v4.md.
 */
window.CONTENT = {
  version: "boost-v7",

  appOrder: ["ig", "tt", "sc"],
  apps: {
    ig: { label: "Instagram", icon: "ai-ig" },
    tt: { label: "TikTok", icon: "ai-tt" },
    sc: { label: "Snapchat", icon: "ai-sc" }
  },

  ui: {
    unitOf: "Muster {x} von {n}",          // ENTWURF (Kopfzeile)
    exerciseOf: "Übung {x} von {n}",       // ENTWURF
    steps: ["Antwort", "Ausprobieren", "Erklärung"], // Schrittanzeige (18.10.: „Antwort“ statt „Vorhersagen“)
    screenTag: "Nachgestellt",             // v7: wie in den Fragebögen (vorher „Screen“)
    statusTime: "21:42",
    fallbackNote: "Bei {app} funktioniert das genauso.",
    lockLabel: "Sperrbildschirm",
    predictionRight: "Deine Antwort: richtig.",
    predictionWrong: "Deine Antwort: {a}. Richtig wäre: {c}.",
    labelWas: "So funktioniert es",
    labelWirkung: "Warum es wirkt",
    labelZweck: "Wozu es dient",
    // Knöpfe (ENTWURF, Wortlaut aus dem Umbau-Auftrag)
    btnFix: "Antwort festlegen",
    btnTry: "Ausprobieren",
    btnExplain: "Zur Erklärung",
    btnNextUnit: "Nächstes Muster",
    btnToExercises: "Zu den Übungen",
    btnCheck: "Auflösen",                   // ENTWURF (Übungen)
    next: "Weiter",
    back: "Zurück",
    // Schritt „Ausprobieren“, vor dem Tippen (ENTWURF)
    yourPrediction: "Deine Antwort: {a}",
    yourSelection: "Deine Auswahl: {n} Meldung(en)",  // ENTWURF
    multiHint: "Du kannst eine oder mehrere Meldungen antippen.", // ENTWURF
    reviewNote: "Diesen Schritt hast du schon abgeschlossen. Deine Antwort bleibt gespeichert.",
    markPrefix: "Markierung: ",
    spotPrefix: "Stelle ",
    selectedByYou: "von dir getippt",
    missing: "Bitte beantworte diese Frage.",
    missingOwn: "Bitte schreib deine eigene Formulierung auf." // ENTWURF (Plan)
  },

  // ───────────── Startseite (die frühere, unerreichbare Einleitung, neu und gekürzt) ─────────────
  // ENTWURF
  start: {
    title: "So läuft die Schulung ab",
    lead: "In dieser kurzen Schulung geht es darum, wie Social-Media-Apps gebaut sind.",
    points: [
      "Es kommen **4 Muster** aus deinen Apps.",
      "Jedes Muster hat **3 Schritte:** ① Antwort ② Ausprobieren ③ Erklärung",
      "Am Ende kommen **2 kurze Übungen**.",
      "Dauer: etwa **10 Minuten**."
    ],
    note: "Die Screens sind nachgestellt. Du bist nicht in der echten App.",
    button: "Zum ersten Muster"
  },

  patterns: [
    // ───────────── Muster 1: Endloses Scrollen ─────────────
    // Richtige Antwort: 3 „Es gibt kein Ende"
    {
      id: 1,
      key: "endloses-scrollen",
      order: ["tt", "ig", "sc"],
      question: "Wie viele Beiträge kommen noch, bis der Feed zu Ende ist?",
      options: ["Ungefähr 20", "Ungefähr 200", "Es gibt kein Ende"],
      correct: 3,
      name: "Endloses Scrollen (Infinite Scroll)",
      short: "Endloses Scrollen",
      satz: "Der Feed hat kein Ende, deshalb fehlt ein Signal zum Aufhören.", // ENTWURF
      was: "Der Feed hat kein Ende und keine Seitenzahlen. Während du scrollst, lädt die App im Hintergrund schon die nächsten Beiträge nach.",
      wirkung: "Ohne Ende fehlt ein Signal zum Aufhören (Stopping Cue), wie das Ende eines Kapitels oder einer Folge. Aufhören wird so zu einer aktiven Entscheidung, und die schiebt man leicht immer weiter auf.",
      zweck: "Mehr Zeit im Feed heißt mehr Platz für Werbung zwischen den Beiträgen.",
      variants: {
        tt: {
          screen: "tiktok-feed",
          ctxA: "TikTok, Für-dich-Feed. Du bist bei Video 40.",
          ctxB: "Du hast weitergewischt. Das nächste Video war schon geladen.",
          tryText: "„Ausprobieren“ wischt zum nächsten Video.",
          hint: "Hier könnte der Feed enden. Stattdessen lädt die App beim Scrollen immer neue Beiträge nach.",
          markLabel: "Unterkante des Beitrags, der Übergang zum nächsten Beitrag",
          data: {
            posts: [
              // v7: einheitliche Konten (vorher @lauf.mit.jonas / @kochen.mit.mia)
              { user: "@jonas.r", caption: "Morgenrunde am Rhein, 7 km. #laufen", likes: "12,4K", comments: "318", asset: "video-jonas-lauf" },
              { user: "@mia.kocht", caption: "Pasta in 10 Minuten. #rezept", likes: "12,4K", comments: "318", asset: "video-mia-pasta" },
              { user: "", caption: "", likes: "", comments: "", asset: "video-weiter" }
            ],
            share: "Teilen",
            nav: ["Start", "Suche", "Plus", "Inbox", "Profil"]
          }
        },
        ig: {
          screen: "ig-feed",
          ctxA: "Dein Instagram-Feed. Du bist bei Beitrag 40.",
          ctxB: "Du hast weitergescrollt. Der nächste Beitrag war schon geladen.",
          tryText: "„Ausprobieren“ scrollt im Feed weiter.",
          hint: "Hier könnte der Feed enden. Stattdessen lädt die App beim Scrollen immer neue Beiträge nach.",
          markLabel: "Der nächste Beitrag, den die App schon nachgeladen hat",
          data: {
            stories: false, // bei Beitrag 40 ist die Story-Leiste längst weggescrollt
            scrollFeed: true,
            posts: [
              { user: "lena_k", line: "♡ 92 · Sonntag am Meer", asset: "foto-hund" },
              { user: "mia.kocht", line: "♡ 1.204 · Pasta in 10 Minuten", asset: "foto-mia-pasta" },
              { user: "tom.reist", line: "♡ 856 · Lissabon im Oktober", asset: "foto-tom-lissabon" }
            ],
            mark: "seam-1"
          }
        }
      }
    },

    // ───────────── Muster 4: Autoplay ─────────────
    // Richtige Antwort: 2 „Es läuft sofort los, mit Ton". Sofortstart plus Schleife; keine rote Umrandung.
    {
      id: 4,
      key: "autoplay",
      order: ["ig", "tt", "sc"],
      question: "Was passiert mit dem nächsten Video, wenn du weiterscrollst?",
      options: ["Es bleibt stehen, bis du auf Play tippst", "Es läuft sofort los, mit Ton", "Die App fragt, ob du es sehen willst"],
      correct: 2,
      name: "Automatischer Start (Autoplay)",
      short: "Automatischer Start (Autoplay)",
      satz: "Videos laufen von selbst los, Weiterschauen ist die Voreinstellung.", // ENTWURF
      was: "Videos starten von selbst, sobald sie im Bild sind, und laufen in Schleife. Einen Play-Knopf gibt es nicht.",
      wirkung: "Die App macht Weiterschauen zur Voreinstellung. Menschen bleiben meist bei der Voreinstellung (Default-Effekt): Anfangen kostet nichts, nur Aufhören braucht eine Entscheidung.",
      zweck: "Videos, die von selbst starten, werden seltener übersprungen. Das bringt mehr Sehzeit und mehr Werbung.",
      variants: {
        ig: {
          screen: "reels",
          ctxA: "Instagram Reels. Ein Video läuft gerade.",
          ctxB: "Du hast weitergescrollt. Das nächste Video läuft schon.",
          tryText: "„Ausprobieren“ scrollt zum nächsten Video.",
          hint: "Das Video ist von selbst gestartet und beginnt am Ende von vorn. Du musst nichts tun, damit es weiterläuft.",
          markLabel: "Fortschrittsbalken des Videos, es läuft bereits",
          data: {
            videos: [
              { user: "@tom.reist", caption: "Lissabon im Oktober, 24 Grad. #reisen", asset: "video-tom-lissabon", progress: 60 },
              { user: "@mia.kocht", caption: "Pasta in 10 Minuten. #rezept", asset: "video-mia-pasta" } // v7: vorher @kochen.mit.mia
            ],
            loopSeconds: 4
          }
        },
        tt: {
          screen: "reels",
          ctxA: "TikTok, Für-dich-Feed. Ein Video läuft gerade.",
          ctxB: "Du hast weitergescrollt. Das nächste Video läuft schon.",
          tryText: "„Ausprobieren“ scrollt zum nächsten Video.",
          hint: "Das Video ist von selbst gestartet und beginnt am Ende von vorn. Du musst nichts tun, damit es weiterläuft.",
          markLabel: "Fortschrittsbalken des Videos, es läuft bereits",
          data: {
            videos: [
              { user: "@tom.reist", caption: "Lissabon im Oktober, 24 Grad. #reisen", asset: "video-tom-lissabon", progress: 60, likes: "8.911", comments: "204" },
              { user: "@mia.kocht", caption: "Pasta in 10 Minuten. #rezept", asset: "video-mia-pasta", likes: "12,4K", comments: "318" }
            ],
            loopSeconds: 4,
            share: "Teilen",
            nav: ["Start", "Suche", "Plus", "Inbox", "Profil"]
          }
        }
      }
    },

    // ───────────── Muster 3: Empfehlungen nach Schwäche ─────────────
    // Richtige Antwort: 2 „Weil du bei so etwas länger hängen bleibst"
    {
      id: 3,
      key: "empfehlungen-nach-schwaeche",
      order: ["ig", "tt", "sc"],
      question: "Warum siehst du mia.kocht ganz oben, obwohl du ihr nicht folgst?",
      options: ["Weil viele sie mögen", "Weil du bei so etwas länger hängen bleibst", "Zufall"],
      correct: 2,
      name: "Empfehlungen nach Schwäche (Guilty-Pleasure Recommendations)",
      short: "Empfehlungen nach Schwäche",
      satz: "Die App zeigt dir mehr von dem, wobei du hängen bleibst, auch wenn du es eigentlich nicht willst.", // ENTWURF
      was: "Zwischen Beiträgen von Konten, denen du folgst, zeigt die App Inhalte fremder Konten, nur mit „Vorgeschlagen“ markiert. Ausgewählt werden sie danach, wie lange du bei ähnlichen Inhalten hängen bleibst.",
      wirkung: "Die Auswahl folgt deinem Verhalten, nicht deinen Absichten: Was dich kurz fesselt, bekommst du öfter, auch wenn du es eigentlich nicht sehen willst. Weil die Vorschläge so gut passen, halten wir sie für unseren eigenen Geschmack.",
      zweck: "Passende Vorschläge halten dich länger im Feed. Der Für-dich-Feed bei TikTok besteht nur daraus.",
      variants: {
        ig: {
          screen: "ig-feed",
          ctxA: "Dein Instagram-Feed. Du folgst tom.reist.",
          ctxB: "mia.kocht steht ganz oben, obwohl du ihr nicht folgst.",
          tryText: "„Ausprobieren“ zeigt, warum der Beitrag von mia.kocht oben steht.",
          hint: "Du folgst mia.kocht nicht. Die App zeigt dir den Beitrag, weil du bei Kochvideos lange hängen bleibst. Einziger Hinweis: das kleine „Vorgeschlagen“.",
          markLabel: "Der vorgeschlagene Beitrag von mia.kocht",
          data: {
            posts: [
              { user: "mia.kocht", suggested: "Vorgeschlagen", line: "♡ 1.204 · Pasta in 10 Minuten", asset: "foto-mia-pasta" },
              { user: "tom.reist", line: "♡ 856 · Lissabon im Oktober", asset: "foto-tom-lissabon" },
              { user: "jonas.r", line: "♡ 41 · Erste Vorlesung im Semester", asset: "foto-hoersaal" }
            ],
            mark: "post-0",
            markPlace: "inside"
          }
        },
        tt: {
          screen: "tiktok-feed",
          question: "Warum zeigt dir die App gerade dieses Video, obwohl du ihr nicht folgst?",
          ctxA: "TikTok, Für-dich-Feed. Du folgst @mia.kocht nicht.",
          ctxB: "Das Video stammt von einem Konto, dem du nicht folgst.",
          tryText: "„Ausprobieren“ zeigt, warum die App dir dieses Video zeigt.",
          hint: "Im Für-dich-Feed wählt die App jedes Video danach aus, wie lange du bei ähnlichen Videos geblieben bist.",
          markLabel: "Reiter „Für dich“ oben im Screen",
          data: {
            static: true,
            tabs: ["Folge ich", "Für dich"],
            activeTab: 1,
            mark: "tab-1",
            posts: [
              { user: "@mia.kocht", caption: "Pasta in 10 Minuten. #rezept", likes: "12,4K", comments: "318", asset: "video-mia-pasta", followPlus: true }
            ],
            share: "Teilen",
            nav: ["Start", "Suche", "Plus", "Inbox", "Profil"]
          }
        }
      }
    },

    // ───────────── Muster 6: Rückhol-Benachrichtigungen (Sperrbildschirm) ─────────────
    // Immer gezeigt. Die Auswahl per Antippen ist die Antwort. Sieben Meldungen, zwei von
    // Menschen (humanPositions), fünf von der App, nur aus den Pools der genutzten Apps, fest
    // nach Teilnehmercode. Richtig nur, wenn genau die beiden Meldungen von Menschen getippt sind.
    {
      id: 6,
      key: "rueckhol-benachrichtigungen",
      always: true,
      type: "multi",
      name: "Rückhol-Benachrichtigungen (Recapture Notifications)",
      short: "Rückhol-Benachrichtigungen",
      satz: "Die meisten Meldungen schickt die App selbst, damit du sie wieder öffnest.", // ENTWURF
      was: "Auf dem Sperrbildschirm sehen alle Meldungen gleich aus. Nur wenige kommen von Menschen. Die meisten verschickt die App von sich aus, und das ist ab Werk eingeschaltet.",
      wirkung: "Eine Meldung, die nach einer persönlichen Nachricht aussieht, weckt Neugier und die Sorge, etwas zu verpassen (Fear of Missing Out). Ob wirklich jemand etwas von dir will, siehst du erst, wenn die App schon offen ist.",
      zweck: "Jede Meldung ist ein Anlass, die App wieder zu öffnen. Mehr Meldungen, mehr Besuche.",
      variants: {
        lock: {
          screen: "lockscreen",
          ctxA: "Dein Sperrbildschirm am Abend mit sieben Meldungen.",
          ctxAsk: "Tipp die Meldungen an, die von einer Person kommen.",
          ctxB: "2 von 7 Meldungen kamen von einer Person.",
          ctxBYou: "Du hast {n} angetippt.",
          tryText: "„Ausprobieren“ zeigt, welche Meldungen wirklich von einer Person kamen.",
          resultLine: "Richtig angetippt: {x} von 2. Falsch angetippt: {y}.",
          markLabel: "Meldungen mit Absender",
          data: {
            time: "21:42",
            labelHuman: "von einer Person",
            labelApp: "von der App",
            times: ["21:40", "21:36", "21:31", "21:12", "20:55", "20:20", "19:48"],
            humanPositions: [1, 4]
          }
        }
      },
      // Pools je App (mindestens 2 von Menschen, 5 von der App). Abgenommen am 02.10.2026.
      // REGEL: human = jemand hat sich direkt an mich gewandt (Nachricht, Snap, Erwähnung,
      // Kommentar, Antwort); app = alles andere, auch wenn ein Name drinsteht.
      pools: {
        ig: {
          human: [
            "lena_k hat dir eine Nachricht gesendet",
            "jonas.r hat dich in einem Kommentar erwähnt",
            "tom.reist hat dir ein Reel geschickt"
          ],
          app: [
            "mia.kocht hat 3 neue Reels gepostet, die du verpasst hast",
            "Angesagt bei dir: Beiträge, die dir gefallen könnten",
            "lena_k hat zum ersten Mal seit Langem etwas gepostet",
            "Sieh dir an, was jonas.r und 4 andere heute geteilt haben",
            "Deine Erinnerungen von vor einem Jahr warten auf dich"
          ]
        },
        tt: {
          human: [
            "jonas.r hat dein Video kommentiert",
            "mia.kocht hat dir eine Nachricht geschickt"
          ],
          app: [
            "Neue Videos für dich: Das könnte dir gefallen",
            "Du hast 12 Videos von Konten verpasst, denen du folgst",
            "Jemand, dem du folgst, ist gerade live",
            "Angesagt heute: Diese Sounds sind gerade beliebt",
            "Dein Video von gestern hat neue Aufrufe"
          ]
        },
        sc: {
          human: [
            "lena_k hat dir einen Snap gesendet",
            "tom.reist hat dir eine Nachricht geschickt"
          ],
          app: [
            "Sieh dir an, was heute in deiner Story-Übersicht ist",
            "Neue Spotlight-Videos für dich",
            "Deine Erinnerungen von heute vor 2 Jahren",
            "jonas.r hat eine neue Story gepostet",
            "Schau dir an, was deine Freunde heute posten"
          ]
        }
      }
    }
  ],

  // ───────────── Übungen ─────────────
  recognition: [
    // Übung 1: Instagram-Feed mit nummerierten Stellen. v7: Muster 3 („Vorgeschlagen“) und
    // Muster 1 (der nächste Beitrag ragt unten schon herein) plus ein Ablenker (Merken-Symbol);
    // Muster 5 entfällt. Ein Beitrag ohne Story-Leiste, damit alle drei Stellen ohne Scrollen sichtbar sind.
    {
      id: "W1",
      type: "spots",
      app: "Instagram",
      screen: "ig-feed",
      ctx: "Ein neuer Screen. Tipp die Nummern an, hinter denen ein Muster aus der Schulung steckt.",
      spotDefs: [
        { key: "sugg-0", pattern: 3, label: "„Vorgeschlagen“ neben mia.kocht" },
        { key: "save-0", pattern: null, label: "Merken-Symbol" }, // ENTWURF (vorher: Nutzername tom.reist)
        { key: "edge", pattern: 1, label: "der nächste Beitrag, der unten schon hereinragt" } // ENTWURF (Beschriftung)
      ],
      noPatternLabel: "kein bekanntes Muster",
      feedbackScore: "{k} von {n} gefunden.",
      data: {
        stories: false,
        posts: [
          { user: "mia.kocht", suggested: "Vorgeschlagen", line: "♡ 1.204 · Pasta in 10 Minuten", asset: "foto-mia-pasta" }
        ],
        more: { user: "tom.reist", asset: "foto-tom-lissabon" }
      }
    },
    // Übung 2: Meldungen, je Mensch oder App (Muster 6). v7: Streak-Karte (Muster 7) und
    // Facebook/X-Karten entfernt; neue Snapchat-Karte von der App (ENTWURF).
    {
      id: "W2",
      type: "cards",
      app: "",
      ctx: "{count} Meldungen von deinem Sperrbildschirm. Von wem kommt jede: von einer Person oder von der App?",
      labelHuman: "Von einer Person",
      labelApp: "Von der App",
      feedbackScore: "{k} von {n} richtig eingeordnet.",
      verdictRight: "Richtig",
      verdictWrong: "Falsch",
      cardPool: [
        { app: "ig", human: true, text: "anna.s hat auf deine Story reagiert", why: "anna.s hat selbst reagiert." },
        { app: "tt", human: false, text: "Jemand, dem du folgst, hat etwas Neues gepostet. Sieh es dir an.",
          why: "Die App schreibt sie selbst. Sie sagt nicht einmal, wer gepostet hat." },
        { app: "ig", human: false, text: "Du hast heute noch nicht in deinen Feed geschaut. Sieh nach, was neu ist.",
          why: "Die App erinnert dich daran, sie zu öffnen." },
        { app: "sc", human: true, text: "mara.w hat dir einen Snap gesendet", why: "mara.w hat dir selbst einen Snap geschickt." },
        { app: "sc", human: false, text: "Du hast neue Spotlight-Videos verpasst. Schau rein!", // ENTWURF
          why: "Die App meldet sich von selbst, um dich zurückzuholen." },
        { app: "tt", human: true, text: "mara.w hat auf deinen Kommentar geantwortet", why: "mara.w hat dir selbst geantwortet." },
        { app: "tt", human: false, text: "Dein Für-dich-Feed wurde aktualisiert. Schau dir die neuen Videos an.",
          why: "Die App meldet sich von selbst, um dich zurückzuholen." }
      ]
    }
  ],

  einordnung: {
    title: "Warum diese Funktionen eingebaut sind",
    // Sachlich, ohne Empfehlung (Grenze aus dem Research Design)
    text: [
      "**Das Geschäftsmodell:** Die Apps sind kostenlos und verdienen an Werbung. Je mehr Zeit du dort verbringst, desto mehr Werbung siehst du. Die Funktionen aus der Schulung sind deshalb Absicht und stecken in ähnlicher Form in allen großen Social-Media-Apps.",
      "**Auch die EU sieht das kritisch:** In vorläufigen Feststellungen gegen TikTok (Februar 2026) sowie Instagram und Facebook (Juli 2026) nennt die EU-Kommission unter anderem endloses Scrollen, Autoplay, Push-Benachrichtigungen und personalisierte Empfehlungen als Gestaltung, die abhängig machen kann.",
      "**Es liegt nicht an dir:** Die Funktionen nutzen bekannte psychologische Mechanismen, etwa unvorhersehbare Belohnungen oder die Sorge, etwas zu verpassen. Dass sie wirken, hat nichts mit fehlender Selbstdisziplin zu tun.",
      "Wer die Mechanismen kennt, erkennt sie leichter im Alltag."
    ],
    button: "Weiter"
  },

  zusammenfassung: {
    title: "Die vier Muster aus deiner Schulung", // ENTWURF
    scores: "Deine Antworten: {x} von {n} richtig. In den Übungen: {y} von {max} Punkten.", // ENTWURF
    // Schlusssatz je Fortsetzung (ENTWURF). v7 ohne „Was du daraus machst, entscheidest du selbst.“
    outroMore: "Gleich folgt noch ein kurzer Teil.",
    outroEnd: "Danke, dass du dir die Schulung angesehen hast.",
    button: "Weiter",
    buttonEnd: "Fertig"
  },

  // ───────────── Neutraler Teil (nur G3, Welle FILLER) ─────────────
  // ENTWURF. Kein Bezug zur eigenen Nutzung, keine Handlungsaufforderung, nichts über
  // Social-Media-Gestaltung, Bildschirmzeit, Aufmerksamkeit oder Selbstkontrolle.
  filler: {
    title: "Ein kurzes Quiz zur Geschichte des Handys",
    lead: "Zum Abschluss drei Fragen zur Geschichte des Handys und des Mobilfunks.",
    of: "Frage {x} von {n}",
    items: [
      {
        id: "Q1",
        question: "Wann wurde zum ersten Mal mit einem tragbaren Mobiltelefon telefoniert?",
        options: ["1953", "1973", "1993"],
        correct: 2,
        fact: "Am 3. April 1973 telefonierte der Motorola-Ingenieur Martin Cooper auf einer Straße in New York mit einem tragbaren Telefon. Sein Gerät war etwa so groß wie ein Ziegelstein und wog über ein Kilogramm. Zu kaufen gab es solche Handys erst zehn Jahre später, 1983."
      },
      {
        id: "Q2",
        question: "Wie lautete die erste SMS, die 1992 verschickt wurde?",
        options: ["„Hallo, wie geht's?“", "„Merry Christmas“", "„Test 1, 2, 3“"],
        correct: 2,
        fact: "Am 3. Dezember 1992 schickte der Ingenieur Neil Papworth in Großbritannien die erste SMS von einem Computer an ein Handy. Der Text lautete „Merry Christmas“. Eine SMS durfte bis zu 160 Zeichen lang sein."
      },
      {
        id: "Q3",
        question: "In welchem Jahr gingen in Deutschland die ersten digitalen Handynetze (D-Netze) an den Start?",
        options: ["1985", "1992", "2001"],
        correct: 2,
        fact: "1992 starteten in Deutschland die ersten digitalen Mobilfunknetze nach dem GSM-Standard, D1 und D2. Vorher gab es analoge Netze, deren Telefone groß und teuer waren und oft fest im Auto eingebaut wurden."
      }
    ],
    verdictRight: "Richtig.",
    verdictWrong: "Nicht ganz. Richtig ist: {c}.",
    buttonLast: "Fertig"
  },

  // ───────────── Wenn-Dann-Plan (nur G4, Welle PLAN) ─────────────
  // ENTWURF. Beispiel für Autoplay aus dem Umbau-Auftrag.
  plan: {
    title1: "Dein Plan, Schritt 1 von 3",
    q1: "Welches der vier Muster erwischt dich am häufigsten?",
    title2: "Dein Plan, Schritt 2 von 3",
    lead2: "Bau dir einen Plan für dieses Muster: eine Situation und was du dann tust.",
    qWenn: "Wenn …",
    qDann: "dann …",
    ownWenn: "eigene Situation",
    ownDann: "eigene Reaktion",
    ownWennPh: "Wenn …",
    ownDannPh: "dann …",
    title3: "Dein Plan, Schritt 3 von 3",
    lead3: "Ich nehme mir vor:",
    screenshotHint: "Tipp: Mach einen Screenshot davon, dann hast du deinen Plan immer dabei.",
    button3: "Plan speichern",
    byPattern: {
      1: {
        wenn: ["ich merke, dass ich schon länger scrolle, als ich wollte",
          "ich die App nur kurz für eine Sache geöffnet habe und danach weiterscrolle",
          "ich abends im Bett anfange zu scrollen"],
        dann: ["lege ich das Handy weg", "schließe ich die App und mache etwas anderes", "stelle ich mir einen Timer auf fünf Minuten"]
      },
      4: {
        wenn: ["ein Video von selbst startet, das ich nicht gesucht habe",
          "nach einem Video gleich das nächste läuft",
          "ich merke, dass ich nur noch zuschaue, weil es weiterläuft"],
        dann: ["schließe ich die App", "lege ich das Handy weg", "frage ich mich, ob ich das wirklich sehen will"]
      },
      3: {
        wenn: ["mir ein Beitrag von einem Konto gezeigt wird, dem ich nicht folge",
          "mich ein vorgeschlagenes Video länger festhält, als ich wollte",
          "ich im Für-dich-Feed lande, obwohl ich nur kurz etwas nachsehen wollte"],
        dann: ["scrolle ich nicht weiter und schließe die App", "tippe ich auf „Nicht interessiert“", "wechsle ich zu den Beiträgen von Leuten, denen ich folge"]
      },
      6: {
        wenn: ["eine Meldung kommt, die nicht von einer Person ist",
          "mein Handy beim Lernen oder Arbeiten eine Meldung zeigt",
          "eine Meldung mir sagt, dass ich etwas verpasst habe"],
        dann: ["wische ich sie weg, ohne die App zu öffnen", "schaue ich erst nach, wenn ich fertig bin", "schalte ich diese Art von Meldungen in den Einstellungen aus"]
      }
    }
  },

  // Farbverläufe als Platzhalter, je Bild-Kennung (Fotos in assets/, CC0)
  assets: {
    "video-jonas-lauf": "linear-gradient(180deg, #4f7ea3 0%, #8fb3cc 55%, #c9d3cf 100%)",
    "video-mia-pasta": "linear-gradient(160deg, #8a4a32 0%, #c9804f 50%, #e5b27c 100%)",
    "video-tom-lissabon": "linear-gradient(170deg, #1f4e6b 0%, #4c8fb0 45%, #e7c9a0 100%)",
    "video-weiter": "linear-gradient(180deg, #3c5a3f 0%, #6f9468 60%, #b9cf9f 100%)",
    "foto-tom-lissabon": "linear-gradient(160deg, #3f6b4d 0%, #7fa88a 55%, #d7e4c4 100%)",
    "foto-mia-pasta": "linear-gradient(135deg, #e3b07a 0%, #c9804f 55%, #8a4a32 100%)",
    "foto-weiter": "linear-gradient(135deg, #7b6aa8 0%, #a99bd0 60%, #d9d2ee 100%)",
    "foto-hund": "linear-gradient(135deg, #c9b58f 0%, #e3d6bd 60%, #f2ece0 100%)",
    "foto-hoersaal": "linear-gradient(135deg, #6b5a4a 0%, #9c8670 60%, #d5c6b2 100%)"
  }
};
