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
  version: "boost-v3", // v3 (06.10.): Überarbeitung nach Feedback-Call, neue Instagram-Optik, Zurück-Ansicht

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
    labelWas: "Was:",
    labelWirkung: "Wirkung:",
    labelZweck: "Zweck:",
    next: "Weiter",
    back: "Zurück",
    // Einschätzung und Bewertung je Screen (Rework 07.10., Abschnitt 4.1; gespeichert mit wave T0)
    estQ: "Versucht das rot umrahmte Element, dein Verhalten zu beeinflussen?",
    estOptions: [{ v: "ja", label: "Ja" }, { v: "nein", label: "Nein" }, { v: "weiss_nicht", label: "Weiß nicht" }],
    estB: "Wie? Beschreibe in einem Satz, was das Element macht und was die App damit erreichen will.",
    estBShort: "Bitte beschreib kurz, was das Element macht.",
    estC: "Was sind deine Gedanken dazu? (freiwillig)",
    estLabels: { ja: "Ja, beeinflusst", nein: "Nein", weiss_nicht: "Weiß nicht" },
    estSummary: "Deine Einschätzung: {x}",
    ak1: "Wie stark würde dich dieses Element beeinflussen, länger in der App zu bleiben oder öfter zurückzukommen?",
    ak1Options: [{ v: 1, label: "gar nicht" }, { v: 2, label: "kaum" }, { v: 3, label: "etwas" }, { v: 4, label: "stark" }, { v: 5, label: "sehr stark" }],
    ak2: "Findest du es in Ordnung, dass die App das so macht?",
    ak2Options: [{ v: 1, label: "gar nicht in Ordnung" }, { v: 2, label: "eher nicht in Ordnung" }, { v: 3, label: "teils, teils" }, { v: 4, label: "eher in Ordnung" }, { v: 5, label: "völlig in Ordnung" }],
    missing: "Bitte beantworte diese Frage.",
    missingN: "Es fehlen noch {n} Antworten.",
    noPattern: "Hier steckt kein Muster.",
    reviewNote: "Du siehst einen Schritt, den du schon abgeschlossen hast. Deine Antwort bleibt, wie sie war.",
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
      was: "Der Feed hat keine letzte Seite und keinen Weiter-Knopf. Sobald du dich beim Scrollen dem unteren Rand näherst, lädt die App im Hintergrund bereits die nächsten Beiträge und hängt sie nahtlos an. Technisch ist der Feed eine Liste ohne festgelegtes Ende.",
      wirkung: "Normalerweise beendet ein natürlicher Endpunkt eine Tätigkeit: Die Seite ist zu Ende, die Sendung vorbei. Ohne Endpunkt muss die Entscheidung aufzuhören aktiv gegen den nächsten Beitrag getroffen werden, der schon geladen ist. Diese Entscheidung wird verschoben, oft viele Male hintereinander, weil der nächste Beitrag immer etwas Neues verspricht.",
      zweck: "Je länger du scrollst, desto mehr Werbeanzeigen kann die App zwischen die Beiträge setzen. Die Verweildauer gehört zu den wichtigsten Größen, an denen der Erfolg eines Feeds gemessen wird.",
      variants: {
        tt: {
          screen: "tiktok-feed",
          ctxA: "Ein Video-Feed wie bei TikTok. Du bist bei Beitrag 40.",
          ctxB: "Beitrag 41 wurde gerade nachgeladen. Solange du weiter scrollst, lädt die App weitere Beiträge nach. Ein Ende ist nicht vorgesehen.",
          action: "Weiter scrollen ▼",
          hint: "An dieser Stelle könnte der Feed zu Ende sein. Stattdessen hat die App schon während des Scrollens die nächsten Beiträge geladen. Ein Ende ist technisch nicht vorgesehen.",
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
          ctxB: "Beitrag 41 wurde gerade nachgeladen. Solange du weiter scrollst, lädt die App weitere Beiträge nach. Ein Ende ist nicht vorgesehen.",
          action: "Weiter scrollen ▼",
          hint: "An dieser Stelle könnte der Feed zu Ende sein. Stattdessen hat die App schon während des Scrollens die nächsten Beiträge geladen. Ein Ende ist technisch nicht vorgesehen.",
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
      name: "Ziehen zum Aktualisieren (Pull-to-Refresh)",
      short: "Ziehen zum Aktualisieren (Pull-to-Refresh)",
      was: "Am oberen Rand des Feeds kannst du die Seite mit dem Finger nach unten ziehen. Ein Ladesymbol dreht sich, danach zeigt die App entweder neue Beiträge oder die Meldung, dass es nichts Neues gibt. Was von beidem eintritt, ist vorher nicht erkennbar.",
      wirkung: "Belohnungen, die unvorhersehbar eintreten, verstärken ein Verhalten stärker als vorhersehbare. Dieses Prinzip ist aus der Lernpsychologie bekannt; Spielautomaten sind nach demselben Prinzip gebaut. Weil mal etwas kommt und mal nicht, bleibt das Ziehen reizvoll, auch wenn beim letzten Mal nichts Neues da war.",
      zweck: "Jedes Ziehen ist ein weiterer Abruf und häufig der Beginn einer neuen Sitzung. Für die App ist jeder dieser Besuche eine Gelegenheit, Inhalte und Werbung zu zeigen.",
      variants: {
        ig: {
          screen: "ig-feed",
          ctxA: "Du siehst den Anfang deines Instagram-Feeds.",
          ctxB: "Du hast gezogen. Diesmal gab es keine neuen Beiträge.",
          action: "Ziehen ↓",
          hint: "Die Meldung „Keine neuen Beiträge“ zeigt: Das Ergebnis des Ziehens ist nicht vorhersehbar. Mal erscheinen neue Beiträge, mal nicht. Diese Ungewissheit macht die Geste anziehend.",
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
      name: "Empfehlungen nach Schwäche (Guilty-Pleasure Recommendations)",
      short: "Empfehlungen nach Schwäche (Guilty-Pleasure Recommendations)",
      was: "Zwischen den Beiträgen von Konten, denen du folgst, platziert die App Inhalte fremder Konten, gekennzeichnet nur durch einen kleinen Hinweis wie „Vorgeschlagen“. Ausgewählt werden sie nach deinem gemessenen Verhalten: Die App registriert bei jedem Beitrag, wie lange du bleibst und wo du hängen bleibst.",
      wirkung: "Die Auswahl richtet sich nicht danach, was du sehen möchtest, sondern danach, was dich nachweislich am längsten hält. Weil die Empfehlungen zum eigenen Verhalten passen, fühlen sie sich wie der eigene Geschmack an. Dass eine Messung dahintersteht, ist im Screen kaum zu erkennen.",
      zweck: "Passgenaue Empfehlungen verlängern die Sitzung. Bei TikTok besteht der gesamte Für-dich-Feed aus solchen Empfehlungen.",
      variants: {
        ig: {
          screen: "ig-feed",
          ctxA: "Dein Instagram-Feed. Du folgst tom.reist.",
          ctxB: "Der Beitrag von mia.kocht steht ganz oben, obwohl du ihr nicht folgst.",
          action: "Auflösen",
          hint: "Dieser Beitrag ist nicht abonniert, sondern ausgewählt: Die App hat gemessen, dass du bei Kochvideos am längsten bleibst, und zeigt dir deshalb mehr davon. Der kleine Hinweis „Vorgeschlagen“ ist die einzige Kennzeichnung.",
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
          ctxA: "TikTok, der Für-dich-Feed. Du folgst @mia.kocht nicht.",
          ctxB: "Das nächste Video stammt von einem Konto, dem du nicht folgst.",
          action: "Auflösen",
          hint: "Dieses Video ist ausgewählt, weil du bei ähnlichen Videos am längsten geblieben bist. Die App misst das bei jedem Video. Im Für-dich-Feed ist jedes Video auf diese Weise ausgewählt.",
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
      name: "Automatischer Start (Autoplay)",
      short: "Automatischer Start (Autoplay)",
      was: "Videos starten von selbst, sobald sie auf dem Bildschirm erscheinen, mit Ton und ohne Play-Knopf. Am Ende beginnt das Video von vorn und läuft in einer Schleife weiter.",
      wirkung: "Das Ansehen verlangt keine Entscheidung mehr, weil es ohne dein Zutun beginnt. Nur das Aufhören erfordert noch einen aktiven Schritt. Damit ist die bequemste Reaktion in jedem Moment, einfach weiterzusehen.",
      zweck: "Ein Video, das ohne deinen Startbefehl läuft, ist ein Video, das du nicht überspringst. Das erhöht die gesehene Zeit und damit die Fläche für Werbung.",
      variants: {
        ig: {
          screen: "reels",
          ctxA: "Instagram Reels. Du wischst gleich zum nächsten Video.",
          ctxB: "Das nächste Video ist angekommen und läuft bereits.",
          action: "Weiter wischen ▲",
          hint: "Das Video läuft, ohne dass du Play gedrückt hast, und beginnt am Ende von vorn. Einen vorgesehenen Schlusspunkt gibt es nicht.",
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
          ctxA: "TikTok, der Für-dich-Feed. Du wischst gleich zum nächsten Video.",
          ctxB: "Das nächste Video ist angekommen und läuft bereits.",
          action: "Weiter wischen ▲",
          hint: "Das Video läuft, ohne dass du Play gedrückt hast, und beginnt am Ende von vorn. Einen vorgesehenen Schlusspunkt gibt es nicht.",
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
      name: "Herzen und Zähler (Social Investment)",
      short: "Herzen und Zähler (Social Investment)",
      was: "Die App zählt sichtbar mit: Likes, Herzen, Follower, Aufrufe. Auch dein eigener Kommentar bekommt einen Zähler. Neue Reaktionen zeigt die App nicht sofort an, sondern gesammelt in Schüben.",
      wirkung: "Mit einem Kommentar hast du etwas von dir investiert, und es ist naheliegend, wissen zu wollen, wie er ankommt. Weil die Reaktionen in Schüben und zu unvorhersehbaren Zeitpunkten erscheinen, gibt es immer wieder einen neuen Anlass nachzusehen. Den Zeitpunkt bestimmen nicht die anderen Nutzer, sondern die App.",
      zweck: "Jedes Nachsehen ist eine Rückkehr in die App. Die Zähler machen aus einer einzelnen Handlung viele Besuche.",
      variants: {
        ig: {
          screen: "ig-comments",
          ctxA: "Instagram, die Kommentare unter einem Reel. Darunter ein Beispielkommentar von dir.",
          ctxB: "Eine Stunde später.",
          action: "Auflösen",
          hint: "Die Herzen auf deinen Kommentar kamen in Schüben: erst 1, dann 4, dann 9, mit Pausen dazwischen. Wann du sie zu sehen bekommst, entscheiden nicht die Leute, die getippt haben, sondern die App.",
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
          ctxA: "TikTok, die Kommentare unter einem Video. Darunter ein Beispielkommentar von dir.",
          ctxB: "Eine Stunde später.",
          action: "Auflösen",
          hint: "Die Herzen auf deinen Kommentar kamen in Schüben: erst 1, dann 4, dann 9, mit Pausen dazwischen. Wann du sie zu sehen bekommst, entscheiden nicht die Leute, die getippt haben, sondern die App.",
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
      was: "Auf dem Sperrbildschirm sehen alle Meldungen gleich aus: gleiches Format, gleicher Ton, gleiches App-Symbol. Tatsächlich stammen nur wenige davon von Menschen, die sich an dich wenden. Die übrigen erzeugt die App selbst, und diese Meldungen sind ab Werk eingeschaltet.",
      wirkung: "Eine Meldung, die wie eine persönliche Nachricht aussieht, ist schwer zu ignorieren, weil sie die Erwartung weckt, dass jemand etwas von dir will. Ob das stimmt, zeigt sich erst nach dem Entsperren. Zu diesem Zeitpunkt ist die App bereits geöffnet.",
      zweck: "Jede Benachrichtigung ist eine Einladung, eine neue Sitzung zu beginnen. Je mehr Meldungen die App erzeugt, desto öfter holt sie dich zurück.",
      variants: {
        lock: {
          screen: "lockscreen",
          ctxA: "Ein Sperrbildschirm am Abend. Tipp die Meldungen an, hinter denen ein Mensch steckt.",
          ctxB: "2 von 7 Meldungen kamen von einem Menschen.",
          ctxBYou: "Du hattest {n} getippt.",
          action: "Fertig",
          resultLine: "Richtig getippt: {x} von 2. Fälschlich getippt: {y}.",
          data: {
            time: "21:42",
            date: null, // null = heutiges Datum (app.js, todayDe)
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
      was: "Neben einem Chat zählt eine Flamme, an wie vielen Tagen in Folge ihr euch Snaps geschickt habt. Lässt einer von euch einen Tag aus, setzt die App den Zähler auf null. Kurz vor Ablauf der Frist erscheint eine Sanduhr als Warnung.",
      wirkung: "Aus einem freiwilligen Austausch wird eine tägliche Verpflichtung, weil der aufgebaute Zähler nicht verloren gehen soll. Drohende Verluste wiegen psychologisch schwerer als gleich große Gewinne. Dazu kommt die Rücksicht auf die andere Person, die den Streak sonst mit verliert.",
      zweck: "Die App setzt damit pro Kontakt einen festen Termin am Tag, an dem sie geöffnet wird.",
      variants: {
        sc: {
          screen: "snap-chats",
          ctxA: "Die Chatliste in Snapchat.",
          ctxB: "Die Frist hat die App gesetzt, nicht jonas.r.",
          action: "Auflösen",
          hint: "Die Regel und die Frist stammen von der App; jonas.r hat daran nichts eingestellt. Lasst ihr einen Tag aus, setzt die App den Zähler auf null. Die Sanduhr erinnert vorher daran.",
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
      question: "Du hast jetzt keine Zeit, sie zu Ende zu sehen. Was ist mit dieser Story in zwei Stunden?",
      options: ["Noch da, ich schaue sie dann", "Weg, für immer", "Im Archiv, wenn ich suche"],
      correct: 2,
      name: "Verfallende Inhalte (Ephemeral Content)",
      short: "Verfallende Inhalte (Ephemeral Content)",
      was: "Stories sind 24 Stunden lang sichtbar, danach löscht die App sie. Beim Ansehen zeigt Instagram oben neben dem Namen das Alter der Story an, zum Beispiel „23 Std.“. Ein Archiv gibt es nur für die eigene Story, nicht für die Stories anderer.",
      wirkung: "Was eine Frist hat, kann man verpassen. Aus dem Gedanken, sich etwas irgendwann anzusehen, wird die Entscheidung, es heute zu tun, und zwar jeden Tag neu, weil täglich neue Stories ablaufen. Das Bedürfnis, nichts zu verpassen, ist gut untersucht und wird hier gezielt angesprochen.",
      zweck: "Die Frist liefert jeden Tag aufs Neue einen Grund, die App zu öffnen.",
      variants: {
        ig: {
          screen: "story-view",
          question: "Du hast jetzt keine Zeit, sie zu Ende zu sehen. Was ist mit dieser Story in zwei Stunden?",
          ctxA: "Instagram, du hast die Story von lena_k geöffnet. Oben steht: 23 Stunden.",
          ctxB: "Zurück in der Story-Leiste. Der Ring von lena_k ist weg.",
          action: "Zwei Stunden später öffnen",
          statusTimeB: "23:45", // Uhrzeit in der Statusleiste nach dem Tipp
          hint: "Nach 24 Stunden löscht Instagram die Story. Wer sie bis dahin nicht gesehen hat, sieht sie nicht mehr. Die Anzeige „23 Std.“ ist die einzige Warnung.",
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
    "1:ig": { zone: "bottom" }, // unterer Rand: dort kommt der nächste Beitrag nach
    "2:ig": { sel: ".ig-refresh" },
    "3:ig": { sel: ".ig-post-head", n: 0 },
    "3:tt": { sel: ".tt-tabs span", n: 1 },
    "4:ig": { sel: ".feed", place: "inside" },
    "4:tt": { sel: ".feed", place: "inside" },
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
        why: "Mit dem Merken-Symbol speicherst du einen Beitrag, um ihn später wiederzufinden; es hält dich nicht länger in der App." },
      { id: "d-ig-menue", base: { pattern: 3, variant: "ig" }, markA: { sel: ".ig-dots", n: 1 },
        ctx: "Ein Beitrag in deinem Instagram-Feed.",
        why: "Über das Menü mit den drei Punkten kannst du einen Beitrag melden oder ausblenden; es hält dich nicht länger in der App." },
      { id: "d-ig-profilbild", base: { pattern: 2, variant: "ig" }, markA: { sel: ".ig-post-head .avatar", n: 0 },
        ctx: "Ein Beitrag in deinem Instagram-Feed.",
        why: "Das Profilbild zeigt, wer den Beitrag geteilt hat; ein Tipp darauf öffnet das Profil. Es hält dich nicht länger in der App." }
    ],
    tt: [
      { id: "d-tt-name", base: { pattern: 3, variant: "tt" }, markA: { sel: ".post .user", n: 0 },
        ctx: "Ein Video in deinem TikTok-Feed.",
        why: "Der Name zeigt, wer das Video veröffentlicht hat; ein Tipp darauf öffnet das Profil. Es hält dich nicht länger in der App." },
      { id: "d-tt-suche", base: { pattern: 3, variant: "tt" }, markA: { sel: ".nav span", n: 1 },
        ctx: "Ein Video in deinem TikTok-Feed.",
        why: "Über die Suche findest du gezielt Videos und Profile; sie hält dich nicht länger in der App." },
      { id: "d-tt-start", base: { pattern: 3, variant: "tt" }, markA: { sel: ".nav span", n: 0 },
        ctx: "Ein Video in deinem TikTok-Feed.",
        why: "Mit dem Haus-Symbol kehrst du zur Startseite zurück; es hält dich nicht länger in der App." }
    ],
    sc: [
      { id: "d-sc-profilbild", base: { pattern: 7, variant: "sc" }, markA: { sel: ".snap-row .avatar", n: 0 },
        ctx: "Deine Chatliste in Snapchat.",
        why: "Das Profilbild zeigt, mit wem du schreibst; es hält dich nicht länger in der App." },
      { id: "d-sc-titel", base: { pattern: 7, variant: "sc" }, markA: { sel: ".snap-head" },
        ctx: "Deine Chatliste in Snapchat.",
        why: "Die Überschrift zeigt nur, in welchem Bereich der App du gerade bist; sie hält dich nicht länger in der App." },
      { id: "d-sc-name", base: { pattern: 7, variant: "sc" }, markA: { sel: ".snap-text .user", n: 1 },
        ctx: "Deine Chatliste in Snapchat.",
        why: "Der Name zeigt, mit wem du chattest; er hält dich nicht länger in der App." }
    ]
  },

  recognition: [
    // ───────────── Wiedererkennen 1: Instagram-Startseite ─────────────
    // Ziele (bei allen Mustern gezeigt): 1 Lade-Rad, 2 „Vorgeschlagen", 4 Gefällt-Zähler,
    // 5 Kante (offenes Ende). 3 (Nutzername tom.reist) ist ein Ablenker.
    {
      id: "W1",
      type: "spots",
      app: "Instagram",
      screen: "ig-feed",
      ctx: "Ein Screen, den du in der Schulung nicht gesehen hast. Tipp die Nummern an, hinter denen ein Muster aus der Schulung steckt.",
      action: "Fertig",
      // Stellen in visueller Reihenfolge. pattern = Muster-ID, null = Ablenker.
      // Die Nummern vergibt die App zur Laufzeit: nur Stellen zu GEZEIGTEN
      // Mustern (plus Ablenker) erscheinen; Elemente nicht gezeigter Muster
      // werden aus dem Screen entfernt (Feedback-Call 05.10.).
      spotDefs: [
        { key: "refresh", pattern: 2, label: "Lade-Rad oben" },
        { key: "sugg-0", pattern: 3, label: "„Vorgeschlagen“ neben mia.kocht" },
        { key: "user-1", pattern: null, label: "Nutzername tom.reist" },
        { key: "likes-1", pattern: 5, label: "Gefällt-Zähler unter dem zweiten Beitrag" },
        { key: "edge", pattern: 1, label: "Unterer Rand des Feeds, der Feed geht ohne Ende weiter" }
      ],
      noPatternLabel: "kein Muster",
      feedbackScore: "{k} von {n} gefunden.",
      data: {
        title: "", // kein App-Name im Screen
        refresh: "Aktualisieren",
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
      ctx: "{count} Meldungen, wie sie auf deinem Sperrbildschirm stehen könnten. Entscheide bei jeder, ob sie von einem Menschen kommt oder von der App.",
      action: "Auflösen",
      labelHuman: "Von einem Menschen",
      labelApp: "Von der App",
      feedbackScore: "{k} von {n} richtig eingeordnet.",
      verdictRight: "Richtig",
      verdictWrong: "Nicht ganz",
      cardPool: [
        { app: "ig", human: true, pattern: null, text: "anna.s hat auf deine Story reagiert",
          why: "Eine echte Person hat reagiert; die Meldung nennt sie beim Namen." },
        { app: "tt", human: false, pattern: 6, text: "Jemand, dem du folgst, hat etwas Neues gepostet. Sieh es dir an.",
          why: "Diese Meldung hat die App geschrieben; sie sagt nicht einmal, wer gepostet hat." },
        { app: "sc", human: false, pattern: 7, text: "🔥 Dein Streak mit anna.s läuft in 2 Stunden ab",
          why: "Die Frist stammt von der App; anna.s weiß nichts davon." },
        { app: "ig", human: false, pattern: 6, text: "Du hast heute noch nicht in deinen Feed geschaut. Sieh nach, was neu ist.",
          why: "Die App erinnert dich daran, sie zu öffnen; eine Person steckt nicht dahinter." },
        { app: "x", human: true, pattern: null, text: "ben_h hat auf deinen Post geantwortet",
          why: "Eine echte Person hat geantwortet; die Meldung nennt sie beim Namen." },
        { app: "fb", human: false, pattern: 6, text: "Du hast neue Benachrichtigungen verpasst",
          why: "Die App erinnert an sich selbst; einen Absender gibt es nicht." },
        { app: "sc", human: true, pattern: null, text: "mara.w hat dir einen Snap gesendet",
          why: "Eine echte Person hat dir direkt etwas geschickt." },
        { app: "tt", human: true, pattern: null, text: "mara.w hat auf deinen Kommentar geantwortet",
          why: "Eine echte Person hat dir geantwortet; die Meldung nennt sie beim Namen." },
        { app: "tt", human: false, pattern: 6, text: "Dein Für-dich-Feed wurde aktualisiert. Schau dir die neuen Videos an.",
          why: "Die App meldet sich von selbst, um dich zurückzuholen; eine Person steckt nicht dahinter." }
      ]
    }
  ],

  einordnung: {
    title: "Warum diese Funktionen eingebaut sind",
    // Überarbeitet nach Feedback-Call 05.10.: sachlich, keine Slogans; letzter
    // Absatz bewusst ohne Empfehlung (Grenze aus Research Design, Abschnitt 4.5)
    text: [
      "Die Apps kosten kein Geld. Ihr Geschäftsmodell ist Aufmerksamkeit: Je länger du in der App bist, desto mehr Werbung kannst du sehen, und desto mehr verdient der Anbieter. Die Funktionen aus dieser Schulung sind deshalb kein Zufall und keine Nebenwirkung, sondern Absicht, und sie stecken in dieser oder ähnlicher Form in allen großen Social-Media-Apps.",
      "Auch die EU-Kommission beschäftigt sich damit. In vorläufigen Feststellungen gegen TikTok (Februar 2026) sowie gegen Instagram und Facebook (Juli 2026) nennt sie unter anderem endloses Scrollen, Autoplay, Push-Benachrichtigungen und personalisierte Empfehlungen als Gestaltung, die abhängig machen kann.",
      "Diese Funktionen setzen an bekannten Mechanismen der menschlichen Psychologie an, zum Beispiel an der Reaktion auf unvorhersehbare Belohnungen und am Bedürfnis, nichts zu verpassen. Dass sie wirken, liegt nicht an mangelnder Selbstdisziplin, sondern daran, dass sie genau dafür gebaut sind.",
      "Wer diese Mechanismen kennt, kann sie im Alltag erkennen und bewusst entscheiden, wie er damit umgehen will. Diese Entscheidung liegt bei dir; die Schulung gibt dazu bewusst keine Empfehlung."
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
    outro: "Was du damit machst, ist deine Sache. In etwa zwei Wochen fragen wir dich noch einmal kurz. Danke!",
    button: "Weiter zum Fragebogen"
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
