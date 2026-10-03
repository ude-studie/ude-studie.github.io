/*
 * content.js – alle Texte und Screen-Definitionen der Schulung.
 * Wortlaute hier ändern, nicht in app.js.
 *
 * Aufbau je Muster:
 *   id, key          Nummer und Name im Datenformat (nicht ändern)
 *   order            Vorrang der Apps: Das Muster wird in der ersten App dieser Reihe gezeigt,
 *                    die die Person nutzt. Nutzt sie keine davon, entfällt das Muster.
 *   question, options, correct   Vorhersagefrage, drei Antworten (Nummern 1–3), richtige Nummer.
 *                    Eine Variante darf eine eigene question haben; options, correct und das
 *                    Sheet (name, was, wirkung, zweck) bleiben für alle Varianten gleich.
 *   name, was, wirkung, zweck    Bottom-Sheet in Zustand B
 *   short            Name in der Zusammenfassung
 *   variants         die gebauten Screens je App (ig, tt, sc, fb, x). Fehlt die Variante der
 *                    gewünschten App, zeigt die App die nächste gebaute in der Reihe (Fallback)
 *                    mit dem Hinweis „Bei … funktioniert das genauso."
 *
 * Je Variante:
 *   screen           welcher nachgestellte Screen gezeichnet wird (Vorlage in app.js)
 *   ctxA / ctxB      Kopfzeilentext neben dem Etikett „Screen" in Zustand A / B
 *                    (ctxB leer = Text aus Zustand A bleibt stehen)
 *   action           Beschriftung des Tipp-Buttons
 *   hint             roter Hinweiskasten in Zustand B
 *   markLabel        Vorlesetext der roten Umrandung für Screenreader
 *   data             Inhalte des nachgestellten Screens (Namen, Zahlen, Bild-Kennungen)
 *
 * Platzhalter in geschweiften Klammern ({n}, {x}, {app} …) setzt die App ein.
 *
 * Bild-Kennungen (asset): siehe assets/README.md. Liegt eine Datei
 * assets/<kennung>.jpg oder .png vor, wird sie statt des Farbverlaufs gezeigt.
 */
window.CONTENT = {
  version: "boost-v2",

  // Apps, die beim Aufruf übergeben (apps=ig,tt,…) oder auf dem zweiten Einleitungsbildschirm gewählt werden.
  // Reihenfolge = Reihenfolge der Kacheln.
  appOrder: ["ig", "tt", "sc", "fb", "x"],
  apps: {
    ig: { label: "Instagram", icon: "ai-ig" },
    tt: { label: "TikTok", icon: "ai-tt" },
    sc: { label: "Snapchat", icon: "ai-sc" },
    fb: { label: "Facebook", icon: "ai-fb" },
    x: { label: "X", icon: "ai-x" }
  },

  ui: {
    patternOf: "Muster {x} von {n}",
    recognitionOf: "Wiederfinden {x} von {n}",
    screenTag: "Screen",
    fallbackNote: "Bei {app} funktioniert das genauso.",
    lockLabel: "Sperrbildschirm",
    predictionRight: "Deine Antwort: richtig.",
    predictionWrong: "Deine Antwort: {a}. Richtig wäre: {c}.",
    statusTime: "21:42", // Uhrzeit in der Statusleiste der nachgestellten Screens
    labelWas: "Was:",
    labelWirkung: "Wirkung:",
    labelZweck: "Zweck:",
    next: "Weiter",
    copy: "Antworten kopieren",
    copied: "Kopiert.",
    copyFailed: "Kopieren ging nicht. Nutze den Download-Link.",
    download: "Antworten herunterladen",
    codeMissing: "Bitte gib deinen Teilnehmercode ein.",
    markPrefix: "Markierung: ",
    spotPrefix: "Stelle ",
    selectedByYou: "von dir getippt",
    listAnd: " und "
  },

  // ───────────── Einleitung, Bildschirm 1 ─────────────
  intro: {
    head: "Schulung · etwa 15 Minuten",
    title: "Wie Social-Media-Apps gebaut sind",
    text: [
      "Social-Media-Apps sind so gebaut, dass man länger bleibt und öfter zurückkommt, als man eigentlich wollte. Das ist kein Zufall, sondern Design. Wir zeigen dir, wie das funktioniert, an Screens aus Apps, die du selbst nutzt.",
      "So läuft es: Du siehst einen Screen, so wie du ihn kennst. Wir stellen dir eine Frage dazu, und du rätst. Dann tippst du einmal, und du siehst, was in dem Screen steckt und warum es drin ist. Das machen wir mit bis zu acht Screens, danach kommen zwei Screens, in denen du selbst suchst.",
      "Dauer etwa 15 Minuten. Gespeichert werden nur deine Antworten, sonst nichts: keine Nutzungsdaten, keine Gerätedaten. Die Screens sind nachgestellt, du bist nicht in der echten App. Es gibt nichts zu gewinnen und nichts falsch zu machen. Die Fragen sind dafür da, dass du vorher rätst; genau das hilft beim Merken."
    ],
    codeLabel: "Dein Teilnehmercode",
    button: "Weiter"
  },

  // ───────────── Einleitung, Bildschirm 2: Deine Apps ─────────────
  appsPage: {
    head: "Schulung · etwa 15 Minuten",
    title: "Deine Apps",
    // mit übergebenen Apps (apps=…)
    knownLead: "Du hast angegeben, dass du diese Apps nutzt:",
    knownAfter: "Stimmt das? Du kannst es hier noch ändern.",
    knownButton: "Stimmt, los geht's",
    // ohne übergebene Apps
    askLead: "Welche dieser Apps nutzt du? Wähl alle aus, die du mindestens ab und zu öffnest.",
    askButton: "Weiter" // im Auftrag nicht vorgegeben
  },

  patterns: [
    // ───────────── Muster 1: Endloses Scrollen ─────────────
    // Richtige Antwort: 3 „Es gibt kein Ende"
    {
      id: 1,
      key: "endloses-scrollen",
      order: ["tt", "ig", "fb", "x", "sc"],
      question: "Wie viele Beiträge kommen noch, bis der Feed zu Ende ist?",
      options: ["Ungefähr 20", "Ungefähr 200", "Es gibt kein Ende"],
      correct: 3,
      name: "Endloses Scrollen",
      short: "endloses Scrollen",
      was: "Der Feed lädt immer nach. Keine letzte Seite, kein Weiter-Knopf.",
      wirkung: "Das Ende war früher das Signal zum Aufhören. Hier fehlt es.",
      zweck: "Jeder weitere Beitrag ist Werbezeit.",
      variants: {
        tt: {
          screen: "tiktok-feed",
          ctxA: "Ein Feed wie bei TikTok. Du bist bei Beitrag 40.",
          ctxB: "Beitrag 41. Und 42. Und …",
          action: "Weiter scrollen ▼",
          hint: "Hier wäre die letzte Seite. Es gibt keine. Die App lädt nach, solange du scrollst.",
          markLabel: "Unterkante des Beitrags, der Übergang zum nächsten Beitrag",
          data: {
            posts: [
              { user: "@lauf.mit.jonas", caption: "Morgenrunde am Rhein, 7 km. #laufen", likes: "12,4K", comments: "318", asset: "video-jonas-lauf" },
              { user: "@kochen.mit.mia", caption: "Pasta in 10 Minuten. #rezept", likes: "12,4K", comments: "318", asset: "video-mia-pasta" },
              { user: "", caption: "", likes: "", comments: "", asset: "video-weiter" }
            ],
            share: "Teilen",
            nav: ["Start", "Suche", "Plus", "Inbox", "Profil"]
          }
        },
        // ENTWURF 02.10.2026, zur Abnahme: Instagram-Feed statt TikTok
        ig: {
          screen: "ig-feed",
          ctxA: "Dein Instagram-Feed. Du bist bei Beitrag 40.",
          ctxB: "Beitrag 41. Und 42. Und …",
          action: "Weiter scrollen ▼",
          hint: "Hier wäre die letzte Seite. Es gibt keine. Die App lädt nach, solange du scrollst.",
          markLabel: "Übergang vom Beitrag zum nächsten Beitrag",
          data: {
            title: "",
            scrollFeed: true, // Tipp scrollt um einen Beitrag weiter; Markierung am Übergang zum übernächsten
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

    // ───────────── Muster 2: Ziehen zum Aktualisieren ─────────────
    // Richtige Antwort: 2 „Mal etwas, mal nichts"
    {
      id: 2,
      key: "ziehen-zum-aktualisieren",
      order: ["ig", "fb", "x", "tt"],
      question: "Was kommt, wenn du jetzt nach unten ziehst?",
      options: ["Immer neue Beiträge", "Mal etwas, mal nichts", "Nie etwas, der Feed ist voll"],
      correct: 2,
      name: "Ziehen zum Aktualisieren",
      short: "Ziehen zum Aktualisieren",
      was: "Du ziehst, es dreht sich, mal kommt etwas, mal nicht.",
      wirkung: "Die Ungewissheit macht das Ziehen anziehend. Wie am Spielautomaten.",
      zweck: "Noch ein Versuch, noch ein Besuch.",
      variants: {
        ig: {
          screen: "ig-feed",
          ctxA: "Instagram, der Anfang deines Feeds.",
          ctxB: "Gezogen. Diesmal kam nichts.",
          action: "Ziehen ↓",
          hint: "Mal etwas, mal nichts. Das Rad ist der Hebel am Automaten: Man zieht, weil man nicht weiß, ob was kommt.",
          markLabel: "Lade-Rad und die Meldung „Keine neuen Beiträge“",
          data: {
            title: "", // kein App-Name im Screen
            refresh: "Nach unten ziehen zum Aktualisieren",
            toast: "Keine neuen Beiträge",
            posts: [
              { user: "tom.reist", line: "♡ 856 · Lissabon im Oktober", asset: "foto-tom-lissabon" },
              { user: "mia.kocht", line: "♡ 1.204 · Pasta in 10 Minuten", asset: "foto-mia-pasta" },
              { user: "lena_k", line: "♡ 92 · Sonntag am Meer", asset: "foto-hund" } // Beispielbeitrag, Wortlaut frei
            ],
            mark: "refresh",
            markPlace: "below"
          }
        }
      }
    },

    // ───────────── Muster 3: Empfehlungen nach Schwäche ─────────────
    // Richtige Antwort: 2 „Weil du bei so etwas länger hängen bleibst"
    {
      id: 3,
      key: "empfehlungen-nach-schwaeche",
      order: ["ig", "tt", "fb", "x", "sc"],
      question: "Warum siehst du mia.kocht ganz oben, obwohl du ihr nicht folgst?",
      options: ["Weil viele sie mögen", "Weil du bei so etwas länger hängen bleibst", "Zufall"],
      correct: 2,
      name: "Empfehlungen nach Schwäche",
      short: "Empfehlungen nach Schwäche",
      was: "Die App misst, wo du hängen bleibst, und liefert mehr davon.",
      wirkung: "Nicht was du willst, sondern was dich hält. Es fühlt sich an wie dein Geschmack.",
      zweck: "Länger bleiben. Bei TikTok ist das der ganze Feed.",
      variants: {
        ig: {
          screen: "ig-feed",
          ctxA: "Dein Feed. Du folgst tom.reist.",
          ctxB: "Nicht abonniert, trotzdem ganz oben.",
          action: "Auflösen",
          hint: "Nicht abonniert. Ausgewählt, weil du bei Kochen am längsten hängen bleibst. Das misst die App bei jedem Beitrag, und es steht nur klein dran.",
          markLabel: "Kopfzeile des Beitrags von mia.kocht mit dem Hinweis „Vorgeschlagen“",
          data: {
            title: "", // kein App-Name im Screen
            posts: [
              { user: "mia.kocht", suggested: "Vorgeschlagen", line: "♡ 1.204 · Pasta in 10 Minuten", asset: "foto-mia-pasta" },
              { user: "tom.reist", line: "♡ 856 · Lissabon im Oktober", asset: "foto-tom-lissabon" },
              { user: "jonas.r", line: "♡ 41 · Erste Vorlesung im Semester", asset: "foto-hoersaal" } // Beispielbeitrag, Wortlaut frei
            ],
            mark: "head-0",
            markPlace: "below"
          }
        },
        // TikTok, abgenommen 03.10.2026. Eigene Frage; Antworten, richtige Antwort und Sheet wie oben.
        tt: {
          screen: "tiktok-feed",
          question: "Warum zeigt dir die App gerade dieses Video, obwohl du ihr nicht folgst?",
          ctxA: "TikTok, Für dich. Du folgst @mia.kocht nicht.",
          ctxB: "Nicht abonniert, trotzdem als Nächstes.",
          action: "Auflösen",
          hint: "Nicht abonniert. Ausgewählt, weil du bei Kochen am längsten hängen bleibst. Das misst die App bei jedem Video. Auf „Für dich“ ist jedes Video so ausgewählt.",
          markLabel: "Reiter „Für dich“ oben im Screen",
          data: {
            static: true,
            tabs: ["Folge ich", "Für dich"],
            activeTab: 1,
            mark: "tab-1", // nur der Reiter, nicht das Folgen-Plus
            posts: [
              { user: "@mia.kocht", caption: "Pasta in 10 Minuten. #rezept", likes: "12,4K", comments: "318", asset: "video-mia-pasta", followPlus: true }
            ],
            share: "Teilen",
            nav: ["Start", "Suche", "Plus", "Inbox", "Profil"]
          }
        }
      }
    },

    // ───────────── Muster 4: Autoplay ─────────────
    // Richtige Antwort: 2 „Es läuft sofort los, mit Ton"
    // Kein automatisches Weiterspringen zeigen: Das Muster ist Sofortstart plus Schleife.
    {
      id: 4,
      key: "autoplay",
      order: ["ig", "tt", "fb", "x", "sc"],
      question: "Was passiert, wenn das nächste Video oben ankommt?",
      options: ["Ein Standbild, bis du auf Play tippst", "Es läuft sofort los, mit Ton", "Die App fragt, ob du es sehen willst"],
      correct: 2,
      name: "Autoplay",
      short: "Autoplay",
      was: "Videos starten von selbst, sobald sie auf dem Bildschirm sind, und laufen am Ende in Schleife weiter.",
      wirkung: "Kein Startknopf, kein Ende. Anfangen kostet nichts, Aufhören eine Entscheidung.",
      zweck: "Jedes Video, das du nicht starten musst, ist eins, das du nicht überspringst.",
      variants: {
        ig: {
          screen: "reels",
          ctxA: "Reels. Du wischst gleich zum nächsten Video.",
          ctxB: "Angekommen. Es läuft schon.",
          action: "Weiter wischen ▲",
          hint: "Läuft sofort, ohne dass du Play gedrückt hast. Und am Ende beginnt es von vorn. Einen Schluss gibt es nicht.",
          markLabel: "Die Videofläche, das Video läuft bereits",
          data: {
            videos: [
              { user: "@tom.reist", caption: "Lissabon im Oktober, 24 Grad. #reisen", asset: "video-tom-lissabon", progress: 60 },
              { user: "@kochen.mit.mia", caption: "Pasta in 10 Minuten. #rezept", asset: "video-mia-pasta" }
            ],
            time: "0:02 · läuft",
            loopSeconds: 4, // Länge des Videos: Balken läuft durch und springt auf den Anfang (Schleife sichtbar)
            markPlace: "inside"
          }
        },
        // TikTok, abgenommen 03.10.2026. Andere Videos als Muster 1; Schleife im Balken sichtbar.
        tt: {
          screen: "reels",
          ctxA: "TikTok, Für dich. Du wischst gleich zum nächsten Video.",
          ctxB: "Angekommen. Es läuft schon.",
          action: "Weiter wischen ▲",
          hint: "Läuft sofort, ohne dass du Play gedrückt hast. Und am Ende beginnt es von vorn. Einen Schluss gibt es nicht.",
          markLabel: "Die Videofläche, das Video läuft bereits",
          data: {
            videos: [
              { user: "@tom.reist", caption: "Lissabon im Oktober, 24 Grad. #reisen", asset: "video-tom-lissabon", progress: 60, likes: "8.911", comments: "204" },
              { user: "@mia.kocht", caption: "Pasta in 10 Minuten. #rezept", asset: "video-mia-pasta", likes: "12,4K", comments: "318" }
            ],
            time: "0:02 · läuft",
            loopSeconds: 4,
            share: "Teilen",
            nav: ["Start", "Suche", "Plus", "Inbox", "Profil"],
            markPlace: "inside"
          }
        }
      }
    },

    // ───────────── Muster 5: Herzen und Zähler ─────────────
    // Richtige Antwort: 2 „Wann die App will, in Schüben"
    // Der Kommentar ist vorgegeben; niemand tippt etwas Eigenes ein.
    {
      id: 5,
      key: "herzen-und-zaehler",
      order: ["ig", "tt", "fb", "x", "sc"],
      question: "Wann zeigt dir die App neue Herzen auf deinen Kommentar?",
      options: ["Sofort, wenn jemand tippt", "Wann die App will, in Schüben", "Nur wenn du nachsiehst"],
      correct: 2,
      name: "Herzen und Zähler",
      short: "Herzen und Zähler",
      was: "Likes, Follower, Aufrufe: Zahlen für alles, was du tust.",
      wirkung: "Du hast etwas investiert und willst wissen, was es bringt. Die App zeigt es in Schüben; jeder Schub ist ein Grund, nachzusehen.",
      zweck: "Nachsehen heißt zurückkommen.",
      variants: {
        ig: {
          screen: "ig-comments",
          ctxA: "Instagram, Kommentare unter einem Reel. Ein Beispielkommentar von dir.",
          ctxB: "Eine Stunde später.",
          action: "Auflösen",
          hint: "1 · 4 · 4 · 9. Die Herzen kamen in Schüben, mit Pause dazwischen. Nicht die Leute entscheiden, wann du sie siehst. Die App entscheidet.",
          markLabel: "Herz-Zähler an deinem Kommentar, jetzt 9",
          data: {
            title: "Kommentare · 1.207",
            reel: "video-tom-lissabon", // das Reel im Hintergrund, über dem die Kommentare liegen
            comments: [
              { user: "lena_k", text: "Da will ich auch hin", likes: "31" },
              { user: "du · Beispiel", text: "Sieht mega aus", likes: "4", likesB: "9", mine: true },
              { user: "jonas.r", text: "Welcher Stadtteil?", likes: "4" }
            ],
            markPlace: "below"
          }
        },
        // TikTok, abgenommen 03.10.2026
        tt: {
          screen: "ig-comments",
          ctxA: "TikTok, Kommentare unter einem Video. Ein Beispielkommentar von dir.",
          ctxB: "Eine Stunde später.",
          action: "Auflösen",
          hint: "1 · 4 · 4 · 9. Die Herzen kamen in Schüben, mit Pause dazwischen. Nicht die Leute entscheiden, wann du sie siehst. Die App entscheidet.",
          markLabel: "Herz-Zähler an deinem Kommentar, jetzt 9",
          data: {
            title: "1.207 Kommentare",
            reel: "video-tom-lissabon",
            comments: [
              { user: "lena_k", text: "Da will ich auch hin", likes: "31" },
              { user: "du · Beispiel", text: "Sieht mega aus", likes: "4", likesB: "9", mine: true },
              { user: "jonas.r", text: "Welcher Stadtteil?", likes: "4" }
            ],
            markPlace: "below"
          }
        }
      }
    },

    // ───────────── Muster 6: Rückhol-Benachrichtigungen (Sperrbildschirm) ─────────────
    // Wird immer gezeigt. Keine Radio-Frage: Die Auswahl per Antippen ist die Vorhersage.
    // Sieben Meldungen, zwei von Menschen (an den Stellen humanPositions), fünf von der App,
    // zusammengestellt nur aus den Pools der genutzten Apps, fest nach Teilnehmercode (nicht zufällig).
    // Richtig (für „x von n") nur, wenn genau die beiden Meldungen von Menschen getippt sind.
    {
      id: 6,
      key: "rueckhol-benachrichtigungen",
      always: true,
      type: "multi",
      name: "Rückhol-Benachrichtigungen",
      short: "Rückhol-Benachrichtigungen",
      was: "Meldungen von der App, nicht von Menschen. Ab Werk an, in jeder App.",
      wirkung: "Sehen aus wie eine Nachricht, gleiches Symbol, gleicher Ton. Du entsperrst und bist drin.",
      zweck: "Jede Rückkehr ist ein neuer Anfang.",
      variants: {
        lock: {
          screen: "lockscreen",
          ctxA: "Sperrbildschirm am Abend. Tipp die an, hinter denen ein Mensch steckt.",
          ctxB: "2 von 7 kamen von einem Menschen.",
          ctxBYou: "Du hattest {n} getippt.",
          action: "Fertig",
          resultLine: "Richtig getippt: {x} von 2. Fälschlich getippt: {y}.",
          data: {
            time: "21:42",
            date: "Dienstag, 13. Oktober",
            labelHuman: "von einem Menschen",
            labelApp: "von der App",
            times: ["21:40", "21:36", "21:31", "21:12", "20:55", "20:20", "19:48"],
            humanPositions: [1, 4]
          }
        }
      },
      // Pools je App. Jede App braucht mindestens 2 Meldungen von Menschen und 5 von der App,
      // damit der Sperrbildschirm auch bei nur einer genutzten App voll wird. Abgenommen am 02.10.2026.
      //
      // REGEL für die Einteilung (so beibehalten, auch bei neuen Meldungen):
      //   human = „von einem Menschen": Jemand hat sich direkt an mich gewandt –
      //           Nachricht, Snap, Erwähnung, Kommentar, Antwort, Markierung.
      //   app   = „von der App": alles andere, auch wenn ein Name drinsteht
      //           (z. B. „lena_k hat zum ersten Mal seit Langem etwas gepostet",
      //           „jonas.r hat eine neue Story gepostet").
      pools: {
        ig: {
          human: [
            "lena_k hat dir eine Nachricht gesendet",          // v1
            "jonas.r hat dich in einem Kommentar erwähnt",     // v1
            "tom.reist hat dir ein Reel geschickt"
          ],
          app: [
            "mia.kocht hat 3 neue Reels gepostet, die du verpasst hast", // v1
            "Angesagt bei dir: Beiträge, die dir gefallen könnten",     // v1
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
            "Neue Videos für dich: Das könnte dir gefallen",            // v1
            "Du hast 12 Videos von Konten verpasst, denen du folgst",   // v1
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
            "Sieh dir an, was heute in deiner Story-Übersicht ist",     // v1
            "Neue Spotlight-Videos für dich",
            "Deine Erinnerungen von heute vor 2 Jahren",
            "jonas.r hat eine neue Story gepostet",
            "Schau dir an, was deine Freunde heute posten"
          ]
        },
        fb: {
          human: [
            "jonas.r hat dich in einem Beitrag markiert",
            "lena_k hat deinen Beitrag kommentiert"
          ],
          app: [
            "Du hast neue Benachrichtigungen verpasst",
            "Erinnerungen: Sieh dir deinen Beitrag von vor 3 Jahren an",
            "mia.kocht hat ein neues Foto gepostet",
            "Beliebt in deinen Gruppen: Beiträge, die dir gefallen könnten",
            "Personen, die du vielleicht kennst"
          ]
        },
        x: {
          human: [
            "jonas.r hat auf deinen Post geantwortet",
            "lena_k hat dir eine Direktnachricht geschickt"
          ],
          app: [
            "Angesagt in Deutschland: Das wird gerade diskutiert",
            "Neue Posts von Konten, denen du folgst",
            "tom.reist hat nach längerer Zeit wieder gepostet",
            "Für dich: Posts, die dir gefallen könnten",
            "Gerade passiert: Live-Updates zu einem Thema, dem du folgst"
          ]
        }
      }
    },

    // ───────────── Muster 7: Streaks ─────────────
    // Richtige Antwort: 2 „Die App"
    {
      id: 7,
      key: "streaks",
      order: ["sc"], // nur Snapchat, kein Fallback (Research Design, Tabelle 3)
      question: "Neben jonas.r: 12 Tage in Folge und eine Sanduhr. Wer hat diese Frist gesetzt?",
      options: ["jonas.r", "Die App", "Niemand, das ist nur ein Zähler"],
      correct: 2,
      name: "Streaks",
      short: "Streaks",
      was: "Ein Zähler für Tage in Folge, mit Frist. Verpasst du einen Tag, ist er weg.",
      wirkung: "Aus »ich will« wird »ich muss«, und der Freund wird zum Grund.",
      zweck: "Ein Termin pro Tag, den die App setzt.",
      variants: {
        sc: {
          screen: "snap-chats",
          ctxA: "Snapchat-Chatliste.",
          ctxB: "Die App.",
          action: "Auflösen",
          hint: "Die App hat die Regel erfunden und die Frist gesetzt. jonas.r weiß nichts davon. Lasst ihr einen Tag aus, ist die 12 weg, und die Sanduhr erinnert dich vorher.",
          markLabel: "Flamme mit 12 und Sanduhr neben jonas.r",
          data: {
            title: "Chats",
            rows: [
              { user: "jonas.r", status: "Snap erhalten · 2 Std.", streak: "🔥 12 · ⌛", mark: true },
              { user: "lena_k", status: "Geöffnet · 5 Std.", streak: "🔥 41" },
              { user: "mia.kocht", status: "Gesendet · 1 Tag", streak: "" },
              // weitere Chats ohne Streak, nur damit die Liste voll aussieht (Wortlaut frei)
              { user: "tom.reist", status: "Geöffnet · 2 Tage", streak: "" },
              { user: "ole.b", status: "Chat erhalten · 3 Tage", streak: "" },
              { user: "Lerngruppe Statistik", status: "Neuer Chat · 4 Tage", streak: "" }
            ],
            markPlace: "below"
          }
        }
      }
    },

    // ───────────── Muster 8: Verfallende Inhalte ─────────────
    // Richtige Antwort: 2 „Weg, für immer"
    {
      id: 8,
      key: "verfallende-inhalte",
      order: ["ig", "sc", "fb", "tt"],
      question: "Du hast jetzt keine Zeit. Was ist mit lena_ks Story morgen früh?",
      options: ["Noch da, ich schaue sie dann", "Weg, für immer", "Im Archiv, wenn ich suche"],
      correct: 2,
      name: "Verfallende Inhalte",
      short: "verfallende Inhalte",
      was: "Stories verschwinden nach 24 Stunden. Kein Archiv für dich, kein Später.",
      wirkung: "Wer heute nicht reinschaut, verpasst es. Die Frist macht aus »irgendwann« ein »jetzt«, jeden Tag.",
      zweck: "Ein Grund pro Tag, die App zu öffnen.",
      variants: {
        ig: {
          screen: "ig-stories",
          ctxA: "Instagram, oben die Stories. Bei lena_k steht: noch 1 Stunde.",
          ctxB: "Morgen früh. Der Ring ist weg.",
          action: "Morgen früh öffnen",
          statusTimeB: "07:30", // Uhrzeit in der Statusleiste nach dem Tipp
          hint: "Weg. Nach 24 Stunden löscht die App sie. Wer gestern nicht reingeschaut hat, hat sie verpasst. Das weiß man, und deshalb schaut man täglich rein.",
          markLabel: "Story-Kreis von lena_k, jetzt grau und ohne farbigen Ring",
          data: {
            title: "", // kein App-Name im Screen
            stories: [
              { user: "Du", own: true },
              { user: "lena_k", expiring: true },
              { user: "jonas.r" },
              { user: "mia.kocht" },
              { user: "tom.reist" }
            ],
            expiry: "lena_k · noch 1 Std.",
            post: { user: "tom.reist", line: "♡ 856 · Lissabon im Oktober", asset: "foto-tom-lissabon" },
            markPlace: "below"
          }
        }
      }
    }
  ],

  recognition: [
    // ───────────── Wiedererkennen 1: Instagram-Startseite ─────────────
    // Ziele: 1 Lade-Rad, 2 „Vorgeschlagen", 3 Herz-Zähler, 5 Kante (offenes Ende).
    // 4 (Nutzername tom.reist) ist ein Ablenker.
    {
      id: "W1",
      type: "spots",
      app: "Instagram",
      screen: "ig-feed",
      ctx: "Ein Screen, den du in der Schulung nicht gesehen hast. Wo stecken Muster? Tipp auf die Stellen.",
      action: "Fertig",
      targets: [1, 2, 3, 5],
      // Zu welchem Muster jede Zielstelle gehört. Gezählt werden nur Stellen zu Mustern,
      // die die Person gesehen hat; die anderen sind weder Treffer noch Fehler.
      spotPatterns: { 1: 2, 2: 3, 3: 5, 5: 1 },
      // Rückmeldung = feedbackYou + feedbackText + feedbackScore
      feedbackYou: "Du hast {list} getippt. ",
      feedbackText: "1 Ziehen zum Aktualisieren, 2 Empfehlung (nicht abonniert), 3 Herzen-Zähler: richtig. 4, der Nutzername, ist keins. Nach unten geht es außerdem ohne Ende",
      feedbackScore: ": {k} von {n} gefunden.", // n = Zielstellen zu Mustern, die die Person gesehen hat
      spotLabels: {
        1: "Lade-Rad oben",
        2: "„Vorgeschlagen“ neben mia.kocht",
        3: "Herz-Zähler unter dem zweiten Beitrag",
        4: "Nutzername tom.reist",
        5: "Unterer Rand des Feeds"
      },
      data: {
        title: "", // kein App-Name im Screen
        refresh: "Aktualisieren",
        posts: [
          { user: "mia.kocht", suggested: "Vorgeschlagen", line: "♡ 1.204 · Pasta in 10 Minuten", asset: "foto-mia-pasta" },
          { user: "tom.reist", line: "♡ 856 · Lissabon im Oktober", asset: "foto-tom-lissabon" }
        ],
        more: { user: "lena_k", asset: "foto-weiter" },
        // Welche Stelle im Screen welche Nummer trägt (nicht ändern ohne targets anzupassen)
        spots: { refresh: 1, "sugg-0": 2, "likes-1": 3, "user-1": 4, edge: 5 }
      }
    },

    // ───────────── Wiedererkennen 2: drei Meldungen ─────────────
    // Richtige Antwort: 1 (Instagram, anna.s hat reagiert)
    {
      id: "W2",
      type: "cards",
      app: "",
      ctx: "Drei Meldungen. Hinter welcher steckt ein Mensch?",
      action: "Auflösen",
      correct: 1,
      maxPoints: 1,
      cards: [
        { app: "ig", text: "anna.s hat auf deine Story reagiert" },
        { app: "tt", text: "Jemand, dem du folgst, hat etwas Neues gepostet. Sieh es dir an." },
        { app: "sc", text: "🔥 Dein Streak mit anna.s läuft in 2 Stunden ab" }
      ],
      feedbackRight: "Richtig. ",
      feedbackWrong: "Nicht ganz. ",
      feedbackText: "Die zweite hat die App geschrieben, sie sagt nicht einmal, wer. Die dritte auch: anna.s weiß nichts von der Frist."
    }
  ],

  einordnung: {
    title: "Warum das alles drin ist",
    // Wortlaut nach Research Design v1, Abschnitt 4.4 (Stand 02.10.): „Diese Funktionen" statt „Die sieben Funktionen"
    text: [
      "Die Apps kosten nichts. Bezahlt wird mit Aufmerksamkeit: Je länger du drin bist, desto mehr Werbung siehst du, desto mehr verdient die App. Diese Funktionen sind kein Zufall und kein Fehler. Sie sind das Geschäftsmodell, und sie stecken in jeder Social-Media-App, egal welche. Das sagt inzwischen auch die EU-Kommission. Sie hat im Februar 2026 gegen TikTok und im Juli 2026 gegen Instagram vorläufig festgestellt, dass endloses Scrollen, Autoplay, Push-Benachrichtigungen und personalisierte Empfehlungen ein Design sind, das abhängig machen kann und gegen EU-Recht verstoßen könnte. Es geht also nicht um deine Willensstärke. Es geht um Design."
    ],
    button: "Weiter"
  },

  zusammenfassung: {
    // {count} = Zahl der gezeigten Muster als Wort (siehe numberWords). Titel im Auftrag nicht vorgegeben.
    title: "Die {count} auf einen Blick",
    numberWords: { 1: "eine", 2: "zwei", 3: "drei", 4: "vier", 5: "fünf", 6: "sechs", 7: "sieben", 8: "acht" },
    // Gruppen; gezeigt werden nur Gruppen und Muster, die die Person gesehen hat
    groups: [
      { label: "Kein Ende", ids: [1, 2, 4] },
      { label: "Nach Maß", ids: [3] },
      { label: "Zurückholen", ids: [5, 6, 7, 8] }
    ],
    scores: "Deine Antworten: {x} von {n} richtig. Beim Wiederfinden: {y} von {max} Stellen.",
    outro: "Was du damit machst, ist deine Sache. Am Montag, 19.10., fragen wir dich noch einmal kurz. Danke!",
    button: "Fertig"
  },

  // Farbverläufe als Platzhalter, je Bild-Kennung (Liste auch in assets/README.md).
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
