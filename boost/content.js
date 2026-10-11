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
  version: "boost-v6", // v5 (11.10.): Texte gestrafft, Erklärung neu gegliedert, Muster 1/4/6 überarbeitet, überall „Weiter“

  // Apps, die beim Aufruf übergeben (apps=ig,tt,…) oder auf dem zweiten Einleitungsbildschirm gewählt werden.
  // Reihenfolge = Reihenfolge der Kacheln.
  appOrder: ["ig", "tt", "sc"], // Facebook und X entfallen (Rework 07.10.); ihre Varianten bleiben im Code, sind aber nicht erreichbar
  apps: {
    ig: { label: "Instagram", icon: "ai-ig" },
    tt: { label: "TikTok", icon: "ai-tt" },
    sc: { label: "Snapchat", icon: "ai-sc" },
    fb: { label: "Facebook", icon: "ai-fb" },
    x: { label: "X", icon: "ai-x" }
  },

  ui: {
    patternOf: "Screen {x} von {n}", // Rework 07.10.: Ablenker in der Reihe, daher nicht „Muster"
    recognitionOf: "Wiederfinden {x} von {n}",
    screenTag: "Screen",
    fallbackNote: "Bei {app} funktioniert das genauso.",
    lockLabel: "Sperrbildschirm",
    predictionRight: "Deine Antwort: richtig.",
    predictionWrong: "Deine Antwort: {a}. Richtig wäre: {c}.",
    statusTime: "21:42", // Uhrzeit in der Statusleiste der nachgestellten Screens
    labelWas: "So funktioniert es",
    labelWirkung: "Warum es wirkt",
    labelZweck: "Wozu es dient",
    next: "Weiter",
    back: "Zurück",
    // Einschätzung und Bewertung je Screen (Rework 07.10., Abschnitt 4.1; gespeichert mit wave T0)
    estQ: "Versucht das rot umrahmte Element, dein Verhalten zu beeinflussen?",
    estOptions: [{ v: "ja", label: "Ja" }, { v: "nein", label: "Nein" }, { v: "weiss_nicht", label: "Weiß nicht" }],
    estB: "Wie? Beschreibe in einem Satz, was das Element macht und wozu es dient.",
    estC: "Was sind deine Gedanken dazu?",
    estLabels: { ja: "Ja, beeinflusst", nein: "Nein", weiss_nicht: "Weiß nicht" },
    estSummary: "Deine Einschätzung: {x}",
    relook: "Bild vergrößern",
    missing: "Bitte beantworte diese Frage.",
    missingN: "Es fehlen noch {n} Antworten.",
    noPattern: "Hier steckt kein bekanntes Muster.",
    reviewNote: "Diesen Schritt hast du schon abgeschlossen. Deine Antwort bleibt gespeichert.",
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
    head: "Schulung · 15 bis 20 Minuten",
    title: "Wie Social-Media-Apps gebaut sind",
    text: [
      "Diese Schulung gehört zu einer Studie der Universität Duisburg-Essen (Wirtschaftsinformatik). Es geht darum, wie Social-Media-Apps gebaut sind: Viele ihrer Funktionen sind darauf ausgelegt, dass man länger bleibt und öfter zurückkommt als geplant. Diese Funktionen zeigen wir dir an nachgestellten Screens aus Apps, die du selbst nutzt.",
      "So läuft es ab: Du siehst bis zu acht Screens. Vor jedem Screen schätzt du zuerst ein, was passieren wird. Das ist kein Test. Wer vorher eine Erwartung hat, merkt sich die Auflösung besser. Nach jeder Einschätzung siehst du, was in dem Screen steckt und warum es eingebaut ist. Zum Schluss suchst du auf zwei weiteren Screens selbst nach den Mustern.",
      "Die Schulung dauert 15 bis 20 Minuten. Gespeichert werden nur deine Antworten, keine Nutzungs- und keine Gerätedaten. Die Screens sind nachgestellt; du bist nicht in der echten App."
    ],
    codeLabel: "Dein Teilnehmercode",
    button: "Weiter"
  },

  // ───────────── Einleitung, Bildschirm 2: Deine Apps ─────────────
  appsPage: {
    head: "Schulung · 15 bis 20 Minuten",
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
      name: "Endloses Scrollen (Infinite Scroll)",
      short: "Endloses Scrollen (Infinite Scroll)",
      was: "Der Feed hat kein Ende und keine Seitenzahlen. Während du scrollst, lädt die App im Hintergrund schon die nächsten Beiträge nach.",
      wirkung: "Ohne Ende fehlt ein Signal zum Aufhören (Stopping Cue), wie das Ende eines Kapitels oder einer Folge. Aufhören wird so zu einer aktiven Entscheidung, und die schiebt man leicht immer weiter auf.",
      zweck: "Mehr Zeit im Feed heißt mehr Platz für Werbung zwischen den Beiträgen.",
      variants: {
        tt: {
          screen: "tiktok-feed",
          ctxA: "TikTok, Für-dich-Feed. Du bist bei Video 40.",
          ctxB: "Du hast weitergewischt. Das nächste Video war schon geladen.",
          hint: "Hier könnte der Feed enden. Stattdessen lädt die App beim Scrollen immer neue Beiträge nach.",
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
          ctxB: "Du hast weitergescrollt. Der nächste Beitrag war schon geladen.",
          hint: "Hier könnte der Feed enden. Stattdessen lädt die App beim Scrollen immer neue Beiträge nach.",
          markLabel: "Der nächste Beitrag, den die App schon nachgeladen hat",
          data: {
            title: "",
            stories: false, // bei Beitrag 40 ist die Story-Leiste längst weggescrollt
            scrollFeed: true, // Weiter scrollt; der unten hereinragende Beitrag ist vor und nach dem Scrollen umrahmt
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
      question: "Was kommt gleich?",
      options: ["Immer neue Beiträge", "Mal etwas, mal nichts", "Nie etwas, der Feed ist voll"],
      correct: 2,
      name: "Ziehen zum Aktualisieren (Pull-to-Refresh)",
      short: "Ziehen zum Aktualisieren (Pull-to-Refresh)",
      was: "Du ziehst den Feed nach unten, ein Ladesymbol dreht sich. Danach kommen neue Beiträge oder nichts. Was passiert, weißt du vorher nicht.",
      wirkung: "Unvorhersehbare Belohnungen festigen ein Verhalten stärker als verlässliche (variable Belohnung). Spielautomaten funktionieren genauso: Weil manchmal etwas kommt, zieht man immer wieder.",
      zweck: "Jedes Ziehen startet oft eine neue Runde im Feed, mit neuen Inhalten und neuer Werbung.",
      variants: {
        ig: {
          screen: "ig-feed",
          ctxA: "Du ziehst deinen Instagram-Feed gerade nach unten.",
          ctxB: "Du hast gezogen. Diesmal kam nichts Neues.",
          hint: "Ob beim Ziehen etwas Neues kommt, weißt du vorher nie. Genau diese Ungewissheit macht die Geste reizvoll.",
          markLabel: "Lade-Rad oben im Feed",
          data: {
            title: "", // kein App-Name im Screen
            refresh: " ", // nur das Lade-Rad; die Beschriftung gab es in der echten App nicht
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
      name: "Empfehlungen nach Schwäche (Guilty-Pleasure Recommendations)",
      short: "Empfehlungen nach Schwäche (Guilty-Pleasure Recommendations)",
      was: "Zwischen Beiträgen von Konten, denen du folgst, zeigt die App Inhalte fremder Konten, nur mit „Vorgeschlagen“ markiert. Ausgewählt werden sie danach, wie lange du bei ähnlichen Inhalten hängen bleibst.",
      wirkung: "Die Auswahl folgt deinem Verhalten, nicht deinen Absichten: Was dich kurz fesselt, bekommst du öfter, auch wenn du es eigentlich nicht sehen willst. Weil die Vorschläge so gut passen, halten wir sie für unseren eigenen Geschmack.",
      zweck: "Passende Vorschläge halten dich länger im Feed. Der Für-dich-Feed bei TikTok besteht nur daraus.",
      variants: {
        ig: {
          screen: "ig-feed",
          ctxA: "Dein Instagram-Feed. Du folgst tom.reist.",
          ctxB: "mia.kocht steht ganz oben, obwohl du ihr nicht folgst.",
          hint: "Du folgst mia.kocht nicht. Die App zeigt dir den Beitrag, weil du bei Kochvideos lange hängen bleibst. Einziger Hinweis: das kleine „Vorgeschlagen“.",
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
          ctxA: "TikTok, Für-dich-Feed. Du folgst @mia.kocht nicht.",
          ctxB: "Das Video stammt von einem Konto, dem du nicht folgst.",
          hint: "Im Für-dich-Feed wählt die App jedes Video danach aus, wie lange du bei ähnlichen Videos geblieben bist.",
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
      noEst: true, // Autoplay hat kein Element, das man sinnvoll umrahmen kann: direkt die Frage (Daniel 11.10.)
      order: ["ig", "tt", "fb", "x", "sc"],
      question: "Was passiert mit dem nächsten Video, wenn du weiterscrollst?",
      options: ["Es bleibt stehen, bis du auf Play tippst", "Es läuft sofort los, mit Ton", "Die App fragt, ob du es sehen willst"],
      correct: 2,
      name: "Automatischer Start (Autoplay)",
      short: "Automatischer Start (Autoplay)",
      was: "Videos starten von selbst, sobald sie im Bild sind, und laufen in Schleife. Einen Play-Knopf gibt es nicht.",
      wirkung: "Die App macht Weiterschauen zur Voreinstellung. Menschen bleiben meist bei der Voreinstellung (Default-Effekt): Anfangen kostet nichts, nur Aufhören braucht eine Entscheidung.",
      zweck: "Videos, die von selbst starten, werden seltener übersprungen. Das bringt mehr Sehzeit und mehr Werbung.",
      variants: {
        ig: {
          screen: "reels",
          ctxA: "Instagram Reels. Ein Video läuft gerade.",
          ctxB: "Du hast weitergescrollt. Das nächste Video läuft schon.",
          hint: "Das Video ist von selbst gestartet und beginnt am Ende von vorn. Du musst nichts tun, damit es weiterläuft.",
          markLabel: "Fortschrittsbalken des Videos, es läuft bereits",
          data: {
            videos: [
              { user: "@tom.reist", caption: "Lissabon im Oktober, 24 Grad. #reisen", asset: "video-tom-lissabon", progress: 60 },
              { user: "@kochen.mit.mia", caption: "Pasta in 10 Minuten. #rezept", asset: "video-mia-pasta" }
            ],
            time: "0:02 · läuft",
            loopSeconds: 4, // Länge des Videos: Balken läuft durch und springt auf den Anfang (Schleife sichtbar)
          }
        },
        // TikTok, abgenommen 03.10.2026. Andere Videos als Muster 1; Schleife im Balken sichtbar.
        tt: {
          screen: "reels",
          ctxA: "TikTok, Für-dich-Feed. Ein Video läuft gerade.",
          ctxB: "Du hast weitergescrollt. Das nächste Video läuft schon.",
          hint: "Das Video ist von selbst gestartet und beginnt am Ende von vorn. Du musst nichts tun, damit es weiterläuft.",
          markLabel: "Fortschrittsbalken des Videos, es läuft bereits",
          data: {
            videos: [
              { user: "@tom.reist", caption: "Lissabon im Oktober, 24 Grad. #reisen", asset: "video-tom-lissabon", progress: 60, likes: "8.911", comments: "204" },
              { user: "@mia.kocht", caption: "Pasta in 10 Minuten. #rezept", asset: "video-mia-pasta", likes: "12,4K", comments: "318" }
            ],
            time: "0:02 · läuft",
            loopSeconds: 4,
            share: "Teilen",
            nav: ["Start", "Suche", "Plus", "Inbox", "Profil"],
          }
        }
      }
    },

    // ───────────── Muster 5: Herzen und Zähler ─────────────
    // Richtige Antwort: 2 „Gebündelt, zu einem Zeitpunkt, den die App bestimmt"
    // Der Kommentar ist vorgegeben; niemand tippt etwas Eigenes ein.
    {
      id: 5,
      key: "herzen-und-zaehler",
      order: ["ig", "tt", "fb", "x", "sc"],
      question: "Wann zeigt dir die App neue Herzen auf deinen Kommentar?",
      options: ["Sofort, wenn jemand tippt", "Gebündelt, zu einem Zeitpunkt, den die App bestimmt", "Nur wenn du nachsiehst"],
      correct: 2,
      name: "Herzen und Zähler (Social Investment)",
      short: "Herzen und Zähler (Social Investment)",
      was: "Likes, Herzen und Aufrufe werden sichtbar gezählt, auch bei deinen eigenen Kommentaren. Neue Reaktionen zeigt die App oft nicht sofort, sondern gebündelt.",
      wirkung: "Likes sind soziale Bestätigung. Wer etwas gepostet hat, will wissen, wie es ankommt. Kommen die Reaktionen unregelmäßig, gibt es immer wieder einen Grund nachzusehen (variable Belohnung).",
      zweck: "Aus einem Kommentar werden viele Besuche: Jedes Nachsehen holt dich zurück in die App.",
      variants: {
        ig: {
          screen: "ig-comments",
          ctxA: "Instagram, Kommentare unter einem Reel. Einer davon ist von dir.",
          ctxB: "Eine Stunde später.",
          hint: "Die Herzen kamen gebündelt: erst 1, dann 4, dann 9. Wann du sie siehst, bestimmt die App, nicht die Leute, die getippt haben.",
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
          ctxA: "TikTok, Kommentare unter einem Video. Einer davon ist von dir.",
          ctxB: "Eine Stunde später.",
          hint: "Die Herzen kamen gebündelt: erst 1, dann 4, dann 9. Wann du sie siehst, bestimmt die App, nicht die Leute, die getippt haben.",
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
      name: "Rückhol-Benachrichtigungen (Recapture Notifications)",
      short: "Rückhol-Benachrichtigungen (Recapture Notifications)",
      was: "Auf dem Sperrbildschirm sehen alle Meldungen gleich aus. Nur wenige kommen von Menschen. Die meisten verschickt die App von sich aus, und das ist ab Werk eingeschaltet.",
      wirkung: "Eine Meldung, die nach einer persönlichen Nachricht aussieht, weckt Neugier und die Sorge, etwas zu verpassen (Fear of Missing Out). Ob wirklich jemand etwas von dir will, siehst du erst, wenn die App schon offen ist.",
      zweck: "Jede Meldung ist ein Anlass, die App wieder zu öffnen. Mehr Meldungen, mehr Besuche.",
      variants: {
        lock: {
          screen: "lockscreen",
          ctxA: "Dein Sperrbildschirm am Abend mit sieben Meldungen.",
          ctxAsk: "Tipp die Meldungen an, die von einer Person kommen.", // erst im Schritt „Vorhersagen“ antippbar
          ctxB: "2 von 7 Meldungen kamen von einer Person.",
          ctxBYou: "Du hast {n} angetippt.",
          resultLine: "Richtig angetippt: {x} von 2. Falsch angetippt: {y}.",
          data: {
            time: "21:42",
            date: null, // null = heutiges Datum (app.js, todayDe)
            labelHuman: "von einer Person",
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
      question: "Neben jonas.r stehen 12 Tage in Folge und eine Sanduhr. Wer hat diese Frist gesetzt?",
      options: ["jonas.r", "Die App", "Niemand, das ist nur ein Zähler"],
      correct: 2,
      name: "Streaks",
      short: "Streaks",
      was: "Eine Flamme zählt, an wie vielen Tagen in Folge ihr euch Snaps geschickt habt. Fällt ein Tag aus, setzt die App den Zähler auf null. Kurz vorher erscheint eine Sanduhr.",
      wirkung: "Verluste wiegen schwerer als gleich große Gewinne (Verlustaversion). Je länger der Streak, desto mehr steht auf dem Spiel. Dazu kommt sozialer Druck: Reißt der Streak, verliert ihn die andere Person auch.",
      zweck: "Für jeden Kontakt gibt es einen festen Grund, die App jeden Tag zu öffnen.",
      variants: {
        sc: {
          screen: "snap-chats",
          ctxA: "Die Chatliste in Snapchat.",
          ctxB: "Die Frist hat Snapchat gesetzt, nicht jonas.r.",
          hint: "Regel und Frist kommen von der App, nicht von jonas.r. Fällt ein Tag aus, ist der Zähler weg.",
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
      question: "Du hast gerade keine Zeit, die Story anzusehen. Ist sie in zwei Stunden noch da?",
      options: ["Ja, ich kann sie dann ansehen", "Nein, sie ist weg", "Nur noch im Archiv"],
      correct: 2,
      name: "Verfallende Inhalte (Ephemeral Content)",
      short: "Verfallende Inhalte (Ephemeral Content)",
      was: "Stories verschwinden nach 24 Stunden. Die Stories anderer kannst du danach nicht mehr ansehen. Oben steht nur, wie alt die Story ist, zum Beispiel „23 Std.“.",
      wirkung: "Was knapp ist, wirkt wertvoller (Knappheitseffekt). Die Frist macht aus „irgendwann ansehen“ ein „jetzt oder nie“. Weil jeden Tag neue Stories ablaufen, wiederholt sich das täglich.",
      zweck: "Die Frist gibt dir jeden Tag einen Grund, die App zu öffnen.",
      variants: {
        ig: {
          screen: "story-view",
          question: "Du hast gerade keine Zeit, die Story anzusehen. Ist sie in zwei Stunden noch da?",
          ctxA: "Instagram, die Story von lena_k. Oben steht: 23 Std.",
          ctxB: "Zwei Stunden später: Die Story von lena_k ist weg.",
          statusTimeB: "23:45", // Uhrzeit in der Statusleiste nach dem Tipp
          hint: "Nach 24 Stunden löscht Instagram die Story. Die Angabe „23 Std.“ war der einzige Hinweis darauf.",
          markLabel: "Der Platz von lena_ks Story in der Leiste, der farbige Ring ist weg",
          data: {
            title: "", // kein App-Name im Screen
            story: {
              user: "lena_k",
              age: "23 Std.",
              asset: "foto-hund",
              replyField: "Nachricht senden …"
            },
            stories: [
              { user: "Du", own: true },
              { user: "lena_k", expiring: true },
              { user: "jonas.r" },
              { user: "mia.kocht" },
              { user: "tom.reist" }
            ],
            post: { user: "tom.reist", line: "♡ 856 · Lissabon im Oktober", asset: "foto-tom-lissabon" },
            markPlace: "below"
          }
        }
      }
    }
  ],

  // Zielelement je Muster im Ausgangszustand (Einschätzung vor der Auflösung).
  // Schlüssel „Muster-ID:Variante"; sel = CSS-Selektor im Screen, n = welcher Treffer,
  // zone = eigene Zone (bottom = unterer Rand des Feeds), place wie markPlace.
  markA: {
    "1:tt": { zone: "bottom" },
    "1:ig": { sel: ".ig-post-head", n: 1 }, // der nächste Beitrag ragt unten herein (11.10.)
    "2:ig": { sel: ".ig-refresh" },
    "3:ig": { sel: ".ig-post-head", n: 0 },
    "3:tt": { sel: ".tt-tabs span", n: 1 },
    "5:ig": { sel: ".igc-row.mine .igc-like" },
    "5:tt": { sel: ".igc-row.mine .igc-like" },
    "6:lock": { sel: ".lock-list" },
    "7:sc": { sel: ".streak.is-target" },
    "8:ig": { sel: ".story-head" }
  },

  // Ablenker (Rework 4.2): harmlose Elemente aus den Apps der Person, drei in der
  // Reihe nach dem 2., 4. und 6. Muster. Andere Elemente als in den Sets T1/T2.
  // base = Screen eines Musters, dessen Daten wiederverwendet werden (ohne Markierung).
  distractors: {
    ig: [
      { id: "d-ig-merken", base: { pattern: 3, variant: "ig" }, markA: { sel: ".ig-save", n: 0 },
        ctx: "Ein Beitrag in deinem Instagram-Feed.",
        why: "Mit dem Merken-Symbol speicherst du einen Beitrag, um ihn später wiederzufinden." },
      { id: "d-ig-menue", base: { pattern: 3, variant: "ig" }, markA: { sel: ".ig-dots", n: 0 } /* erster, sichtbarer Beitrag (11.10.: vorher außerhalb des Bildes) */,
        ctx: "Ein Beitrag in deinem Instagram-Feed.",
        why: "Über die drei Punkte kannst du einen Beitrag melden oder ausblenden." },
      { id: "d-ig-profilbild", base: { pattern: 2, variant: "ig" }, markA: { sel: ".ig-post-head .avatar", n: 0 },
        ctx: "Ein Beitrag in deinem Instagram-Feed.",
        why: "Das Profilbild zeigt, wer den Beitrag geteilt hat. Ein Tipp darauf öffnet das Profil." }
    ],
    tt: [
      { id: "d-tt-name", base: { pattern: 3, variant: "tt" }, markA: { sel: ".post .user", n: 0 },
        ctx: "Ein Video in deinem TikTok-Feed.",
        why: "Der Name zeigt, wer das Video veröffentlicht hat. Ein Tipp darauf öffnet das Profil." },
      { id: "d-tt-suche", base: { pattern: 3, variant: "tt" }, markA: { sel: ".nav span", n: 1 },
        ctx: "Ein Video in deinem TikTok-Feed.",
        why: "Über die Suche findest du gezielt Videos und Profile." },
      { id: "d-tt-start", base: { pattern: 3, variant: "tt" }, markA: { sel: ".nav span", n: 0 },
        ctx: "Ein Video in deinem TikTok-Feed.",
        why: "Mit dem Haus-Symbol kommst du zurück zur Startseite." }
    ],
    sc: [
      { id: "d-sc-profilbild", base: { pattern: 7, variant: "sc" }, markA: { sel: ".snap-row .avatar", n: 0 },
        ctx: "Deine Chatliste in Snapchat.",
        why: "Das Profilbild zeigt, mit wem du schreibst." },
      { id: "d-sc-titel", base: { pattern: 7, variant: "sc" }, markA: { sel: ".snap-head" },
        ctx: "Deine Chatliste in Snapchat.",
        why: "Die Überschrift zeigt nur, in welchem Bereich der App du gerade bist." },
      { id: "d-sc-name", base: { pattern: 7, variant: "sc" }, markA: { sel: ".snap-text .user", n: 1 },
        ctx: "Deine Chatliste in Snapchat.",
        why: "Der Name zeigt, mit wem du chattest." }
    ]
  },

  recognition: [
    // ───────────── Wiedererkennen 1: Instagram-Startseite ─────────────
    // Ziele: „Vorgeschlagen" (Muster 3), Gefällt-Zähler (Muster 5); Nutzername als Ablenker (Stand 11.10.)
    {
      id: "W1",
      type: "spots",
      app: "Instagram",
      screen: "ig-feed",
      ctx: "Ein neuer Screen. Tipp die Nummern an, hinter denen ein Muster aus der Schulung steckt.",
      // Stellen in visueller Reihenfolge. pattern = Muster-ID, null = Ablenker.
      // Die Nummern vergibt die App zur Laufzeit: nur Stellen zu GEZEIGTEN
      // Mustern (plus Ablenker) erscheinen; Elemente nicht gezeigter Muster
      // werden aus dem Screen entfernt (Feedback-Call 05.10.).
      spotDefs: [
        // Lade-Rad entfernt (11.10.): im stehenden Feed nicht als Muster erkennbar
        { key: "sugg-0", pattern: 3, label: "„Vorgeschlagen“ neben mia.kocht" },
        { key: "user-1", pattern: null, label: "Nutzername tom.reist" },
        { key: "likes-1", pattern: 5, label: "Gefällt-Zähler unter dem zweiten Beitrag" }
      ],
      noPatternLabel: "kein bekanntes Muster",
      feedbackScore: "{k} von {n} gefunden.",
      data: {
        title: "", // kein App-Name im Screen
        refresh: null,
        posts: [
          { user: "mia.kocht", suggested: "Vorgeschlagen", line: "♡ 1.204 · Pasta in 10 Minuten", asset: "foto-mia-pasta" },
          { user: "tom.reist", line: "♡ 856 · Lissabon im Oktober", asset: "foto-tom-lissabon" }
        ],
        more: { user: "lena_k", asset: "foto-weiter" }
      }
    },

    // ───────────── Wiedererkennen 2: drei Meldungen, je Mensch oder App ─────────────
    // Multiple Choice (Feedback-Call 05.10.): je Meldung „Von einem Menschen" /
    // „Von der App", darunter Auflösen, Rückmeldung je Meldung mit Begründung.
    // Die drei Meldungen wählt die App zur Laufzeit: nur genutzte Apps, nur
    // gezeigte Muster (die Streak-Karte setzt Muster 7 voraus), mindestens
    // eine Meldung von einem Menschen, fest je Teilnehmercode.
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
        { app: "ig", human: true, pattern: null, text: "anna.s hat auf deine Story reagiert",
          why: "anna.s hat selbst reagiert." },
        { app: "tt", human: false, pattern: 6, text: "Jemand, dem du folgst, hat etwas Neues gepostet. Sieh es dir an.",
          why: "Die App schreibt sie selbst. Sie sagt nicht einmal, wer gepostet hat." },
        { app: "sc", human: false, pattern: 7, text: "🔥 Dein Streak mit anna.s läuft in 2 Stunden ab",
          why: "Die Frist setzt Snapchat, nicht anna.s." },
        { app: "ig", human: false, pattern: 6, text: "Du hast heute noch nicht in deinen Feed geschaut. Sieh nach, was neu ist.",
          why: "Die App erinnert dich daran, sie zu öffnen." },
        { app: "x", human: true, pattern: null, text: "ben_h hat auf deinen Post geantwortet",
          why: "ben_h hat selbst geantwortet." },
        { app: "fb", human: false, pattern: 6, text: "Du hast neue Benachrichtigungen verpasst",
          why: "Die App erinnert an sich selbst. Einen Absender gibt es nicht." },
        { app: "sc", human: true, pattern: null, text: "mara.w hat dir einen Snap gesendet",
          why: "mara.w hat dir selbst einen Snap geschickt." },
        { app: "tt", human: true, pattern: null, text: "mara.w hat auf deinen Kommentar geantwortet",
          why: "mara.w hat dir selbst geantwortet." },
        { app: "tt", human: false, pattern: 6, text: "Dein Für-dich-Feed wurde aktualisiert. Schau dir die neuen Videos an.",
          why: "Die App meldet sich von selbst, um dich zurückzuholen." }
      ]
    }
  ],

  einordnung: {
    title: "Warum diese Funktionen eingebaut sind",
    // Überarbeitet nach Feedback-Call 05.10.: sachlich, keine Slogans; letzter
    // Absatz bewusst ohne Empfehlung (Grenze aus Research Design, Abschnitt 4.5)
    text: [
      "**Das Geschäftsmodell:** Die Apps sind kostenlos und verdienen an Werbung. Je mehr Zeit du dort verbringst, desto mehr Werbung siehst du. Die Funktionen aus der Schulung sind deshalb Absicht und stecken in ähnlicher Form in allen großen Social-Media-Apps.",
      "**Auch die EU sieht das kritisch:** In vorläufigen Feststellungen gegen TikTok (Februar 2026) sowie Instagram und Facebook (Juli 2026) nennt die EU-Kommission unter anderem endloses Scrollen, Autoplay, Push-Benachrichtigungen und personalisierte Empfehlungen als Gestaltung, die abhängig machen kann.",
      "**Es liegt nicht an dir:** Die Funktionen nutzen bekannte psychologische Mechanismen, etwa unvorhersehbare Belohnungen oder die Sorge, etwas zu verpassen. Dass sie wirken, hat nichts mit fehlender Selbstdisziplin zu tun.",
      "Wer die Mechanismen kennt, erkennt sie leichter im Alltag."
    ],
    button: "Weiter"
  },

  zusammenfassung: {
    // {count} = Zahl der gezeigten Muster als Wort (siehe numberWords)
    title: "Die {count} Muster aus deiner Schulung",
    numberWords: { 1: "eine", 2: "zwei", 3: "drei", 4: "vier", 5: "fünf", 6: "sechs", 7: "sieben", 8: "acht" },
    // Gruppen; gezeigt werden nur Gruppen und Muster, die die Person gesehen hat
    groups: [
      { label: "Kein Ende", ids: [1, 2, 4] },
      { label: "Nach Maß", ids: [3] },
      { label: "Zurückholen", ids: [5, 6, 7, 8] }
    ],
    scores: "Deine Antworten: {x} von {n} richtig. Beim Wiederfinden: {y} von {max} Stellen.",
    outro: "Was du daraus machst, entscheidest du selbst. Zum Schluss noch ein paar kurze Fragen zur Schulung.",
    button: "Weiter"
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
