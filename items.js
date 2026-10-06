/*
 * items.js – alle Fragetexte, Skalen und Anker der Studie.
 * Nichts davon steht hartcodiert in der Logik. Wortlaute aus Auftrag v3.
 * Keine festen Termine (seit 06.10.): Folge-Fragebogen etwa zwei Wochen nach T0.
 *
 * Stand: Block R komplett (Abnahme 1). T0/FB/T1/T2 folgen in Abnahme 2/3.
 */
window.ITEMS = {

  // ── Wiederkehrende Skalen ──────────────────────────────
  scales: {
    janein: [
      { v: "ja", label: "Ja" },
      { v: "nein", label: "Nein" }
    ]
  },

  // ── Rahmentexte (Router, Wartesite, Code-Seiten) ───────
  frame: {
    waitTitle: "Danke!",
    // %datum% wird je Person ersetzt (T0-Abschluss + 14 Tage), z. B. "Dienstag, 20.10."
    waitText: "Danke! Dein zweiter Fragebogen ist ab %datum% für dich freigeschaltet, etwa zwei Wochen nach deinem ersten. Du bekommst dann eine Erinnerung per Mail.",
    doneTitle: "Das war's.",
    doneText: "Du hast alles geschafft. Deine persönliche Auswertung kommt nach dem Ende der Studie per Mail.",
    unknownCodeTitle: "Code unbekannt",
    unknownCodeText: "Diesen Code kennen wir nicht. Prüfe den Link aus deiner Mail oder gib deinen Code ein.",
    codeInputLabel: "Dein Code (6 Zeichen)",
    codeInputButton: "Weiter",
    startTitle: "Studie Social-Media-Schulung",
    startNew: "Ich bin neu",
    startHaveCode: "Ich habe schon einen Code",
    t0MissedTitle: "Danke für dein Interesse",
    t0MissedText: "Die Anmeldung zur Studie ist inzwischen geschlossen. Danke trotzdem für dein Interesse.",
    offlineHint: "Verbindung schwach, deine Antworten werden gespeichert, sobald sie wieder da ist.",
    noConnectionRegister: "Gerade besteht keine Verbindung zum Server. Bitte öffne die Seite später noch einmal – die Anmeldung braucht einmal kurz Internet.",
    registrationClosed: "Die Anmeldung zur Studie ist leider geschlossen."
  },

  // ── Block R: Registrierung ─────────────────────────────
  R: {
    r01: {
      title: "Schön, dass du da bist",
      text: "Danke, dass du dabei bist. Diese Studie untersucht eine kurze Online-Schulung darüber, wie Social-Media-Apps gebaut sind. Was auf dich zukommt: jetzt eine kurze Anmeldung, ein Fragebogen und die Schulung (zusammen etwa 40 Minuten, am besten am Stück). Etwa zwei Wochen später ein zweiter, kürzerer Fragebogen (10 bis 15 Minuten). Alles am Handy. Am Ende bekommst du deine eigene Bildschirmzeit als kleine Auswertung.",
      infoLink: "Teilnahmeinformation und Datenschutz",
      infoHref: "teilnahme.html",
      EW01: "Ich habe die Teilnahmeinformation gelesen und willige ein, an der Studie teilzunehmen.",
      EW02: "Ich habe die Datenschutzinformation gelesen und willige in die beschriebene Verarbeitung meiner Daten ein. Ich kann das jederzeit widerrufen."
    },
    r02: {
      title: "Kurz vier Fragen",
      SC01: "Bist du 18 Jahre alt oder älter?",
      SC02: "Studierst du zurzeit an einer Hochschule?",
      SC03: "Welche dieser Apps nutzt du an einem normalen Tag mindestens einmal?",
      SC03_options: [
        { v: "ig", label: "Instagram" },
        { v: "tt", label: "TikTok" },
        { v: "sc", label: "Snapchat" },
        { v: "fb", label: "Facebook" },
        { v: "x",  label: "X" },
        { v: "keine", label: "keine davon täglich", exclusive: true }
      ],
      SC04: "Welches Smartphone hast du?",
      SC04_options: [
        { v: "ios", label: "iPhone" },
        { v: "android", label: "Android" },
        { v: "anderes", label: "anderes" }
      ]
    },
    rx: {
      title: "Danke für dein Interesse",
      text: "Danke für dein Interesse. Für diese Studie suchen wir Studierende ab 18, die mindestens eine der genannten Apps täglich auf einem iPhone oder Android-Handy nutzen. Das trifft bei dir nicht zu, deshalb endet es hier."
    },
    r03: {
      title: "Deine E-Mail",
      EM01: "Deine E-Mail-Adresse. Wir nutzen sie nur für die Erinnerung an den zweiten Fragebogen und die Auswertung am Ende, getrennt von deinen Antworten.",
      error: "Das sieht nicht nach einer E-Mail-Adresse aus. Bitte prüfe die Eingabe."
    },
    r04: {
      title: "Bildschirmzeit prüfen",
      intro_ios: "Einstellungen → Bildschirmzeit. Steht dort eine Übersicht mit Balken? Dann ist alles an.",
      intro_android: "Einstellungen → Digitales Wohlbefinden (bei Samsung: Digitales Wohlbefinden und Kindersicherung). Siehst du einen Kreis mit deiner Nutzungszeit? Dann ist alles an.",
      BZ01: "Ist die Bildschirmzeit bei dir an?",
      BZ01_options: [
        { v: "ja", label: "Ja" },
        { v: "jetzt_eingeschaltet", label: "Jetzt eingeschaltet" },
        { v: "finde_ich_nicht", label: "Finde ich nicht" }
      ],
      findehilfe_ios: "Kein Problem. Öffne die Einstellungen-App (graues Zahnrad) und tippe in der Liste auf „Bildschirmzeit“. Wenn dort „Bildschirmzeit aktivieren“ steht, tippe darauf und bestätige. Falls du es jetzt nicht findest, mach einfach weiter.",
      findehilfe_android: "Kein Problem. Öffne die Einstellungen-App und tippe oben in die Suche. Such nach „Wohlbefinden“ (Samsung) oder „Digital Wellbeing“. Öffne den Eintrag einmal, dann beginnt dein Handy zu zählen. Falls du es jetzt nicht findest, mach einfach weiter."
    },
    r05: {
      title: "Dein Link",
      text: "Das ist dein persönlicher Link. Speichere ihn dir: In etwa zwei Wochen öffnest du damit den zweiten Fragebogen. Er enthält deinen Code, du musst dir nichts merken.",
      copy: "Link kopieren",
      copied: "Kopiert!",
      homescreen: "Zum Startbildschirm hinzufügen",
      homescreen_ios: "Öffne diesen Link in Safari und tippe unten auf das Teilen-Symbol (Viereck mit Pfeil). Wähle „Zum Home-Bildschirm“, dann liegt die Studie wie eine App auf deinem Startbildschirm.",
      homescreen_android: "Tippe in Chrome oben rechts auf die drei Punkte. Wähle „Zum Startbildschirm hinzufügen“, dann liegt die Studie wie eine App auf deinem Startbildschirm.",
      mail: "Ich habe den Link per Mail bekommen",
      mail_hinweis: "Gut – die Erinnerungsmail enthält genau diesen Link. Du kannst ihn einfach aus der Mail öffnen.",
      abschied: "Jetzt geht es direkt weiter mit dem ersten Fragebogen."
    }
  }
};

// ── Block T0: Fragebogen (Wortlaute aus Auftrag v3, Abschnitt 5) ──────────
window.ITEMS.T0 = {
  t01: {
    title: "Der erste Fragebogen",
    text: "Jetzt kommt der erste Fragebogen (etwa 15 Minuten) und direkt danach die Schulung (15 bis 20 Minuten). Bitte am Stück."
  },
  t02: {
    AP01: "Welche dieser Apps nutzt du? Wähl alle aus, die du mindestens ab und zu öffnest.",
    options: [
      { v: "ig", label: "Instagram" },
      { v: "tt", label: "TikTok" },
      { v: "sc", label: "Snapchat" },
      { v: "fb", label: "Facebook" },
      { v: "x",  label: "X" },
      { v: "andere", label: "andere, nämlich", text: true }
    ]
  },
  t03: {
    NU01: "Wie viele Minuten pro Tag hast du in der letzten Woche ungefähr in diesen Apps zusammen verbracht? Bitte schätze, ohne nachzusehen."
  },
  t04: {
    schritte_ios: [
      "Einstellungen → Bildschirmzeit",
      "Alle Aktivitäten anzeigen",
      "Oben „Woche“ wählen und mit dem Pfeil zur letzten Woche zurückblättern",
      "Screenshot, auf dem die App-Liste mit Minuten zu sehen ist"
    ],
    zusatz_ios: "Wenn nicht alle deine Apps sichtbar sind, scrolle und mache einen zweiten Screenshot.",
    schritte_android: [
      "Einstellungen → Digitales Wohlbefinden",
      "Auf den Kreis tippen",
      "Oben Tag auf Woche umstellen (falls vorhanden)",
      "Screenshot der App-Liste"
    ],
    // ENTWURF: nach dem Pilot an die Geräte der Pilotpersonen anpassen
    zusatz_android: "Wenn dein Handy nur Tageswerte zeigt: je ein Screenshot pro Tag ist zu viel, mach nur den der Wochenansicht, falls es sie gibt, sonst den der letzten 7 Tage im Akku- oder Nutzungsmenü.",
    SU01: "Konntest du den Screenshot machen?",
    SU02_label: "Screenshot hochladen (bis 3 Dateien, je 10 MB)",
    SU02_hinweis_leer: "Ohne Screenshot fehlt uns der wichtigste Wert. Wenn es gerade nicht klappt, kannst du trotzdem weitermachen.",
    SU03: "Warum nicht?",
    SU03_options: [
      { v: "aus", label: "Bildschirmzeit ist aus" },
      { v: "finde_nicht", label: "finde die Ansicht nicht" },
      { v: "upload", label: "Upload klappt nicht" },
      { v: "moechte_nicht", label: "möchte ich nicht" },
      { v: "anderes", label: "anderes", text: true }
    ]
  },
  t05: {
    intro: "Tipp bitte die Wochenwerte aus deinem Bericht ab, für jede deiner Apps.",
    MI01: "Minuten in der letzten Woche",
    MI01_hinweis: "Stunden und Minuten? Rechne um: 5 Std 12 Min = 312",
    OE01: "Öffnungen (falls angezeigt)",
    MI01_total: "Gesamt-Bildschirmzeit der Woche, falls angezeigt"
  },
  erkennen: {
    instruktion: "Du siehst jetzt 11 Bildschirmfotos aus Social-Media-Apps. In jedem ist ein Element rot umrahmt. Sag uns, ob dieses Element aus deiner Sicht versucht, dein Verhalten zu beeinflussen. Nicht jedes Bild enthält so ein Element.",
    ERa: "Versucht das rot umrahmte Element, dein Verhalten zu beeinflussen?",
    ERa_options: [
      { v: "ja", label: "Ja" },
      { v: "nein", label: "Nein" },
      { v: "weiss_nicht", label: "Weiß nicht" }
    ],
    ERb: "Wie? Beschreibe in einem Satz, was das Element macht und was die App damit erreichen will."
  },
  t17: {
    intro: "Zum Abschluss dieses Teils: die Elemente noch einmal.",
    AK01: "Wie stark würde dich dieses Element beeinflussen, länger in der App zu bleiben oder öfter zurückzukommen?",
    AK01_anker: ["gar nicht", "sehr stark"],
    AK02: "Findest du es in Ordnung, dass die App das so macht?",
    AK02_anker: ["gar nicht in Ordnung", "völlig in Ordnung"]
  },
  smscf: {
    instruktion: "Mit Social Media meinen wir hier deine Apps aus der Liste. Wie oft gibst du dem Verlangen nach, sie zu nutzen, obwohl deine Nutzung in diesem Moment …",
    skala: [
      { v: 1, label: "1 – fast nie" }, { v: 2, label: "2 – selten" },
      { v: 3, label: "3 – manchmal" }, { v: 4, label: "4 – oft" },
      { v: 5, label: "5 – sehr oft" }
    ],
    SF01_01: "… mit anderen Zielen in Konflikt steht (zum Beispiel: etwas für Uni oder Arbeit erledigen)?",
    SF01_02: "… dazu führt, dass du deine Zeit weniger effizient nutzt?",
    SF01_03: "… dazu führt, dass du andere Dinge aufschiebst, die du tun willst oder musst?"
  },
  kgre: {
    KG01: "Wie sehr hattest du in der letzten Woche das Gefühl, selbst zu bestimmen, wie du deine Zeit in [App] verbringst?",
    KG01_anker: ["überhaupt nicht", "völlig"],
    RE01: "Wie oft hast du in der letzten Woche die Zeit bereut, die du in [App] verbracht hast?",
    RE01_skala: [
      { v: 1, label: "1 – nie" }, { v: 2, label: "2 – selten" },
      { v: 3, label: "3 – manchmal" }, { v: 4, label: "4 – oft" },
      { v: 5, label: "5 – sehr oft" }
    ]
  },
  bscs: {
    // ENTWURF: Platzhalter-Übersetzungen aus Dokument 03 (Tangney et al. 2004,
    // eigene Übersetzung). Daniel ersetzt sie durch die SCS-K-D, sobald verfügbar.
    instruktion: "Wie sehr treffen die folgenden Aussagen auf dich zu?",
    skala: [
      { v: 1, label: "1 – trifft überhaupt nicht auf mich zu" },
      { v: 2, label: "2" }, { v: 3, label: "3" }, { v: 4, label: "4" },
      { v: 5, label: "5 – trifft voll auf mich zu" }
    ],
    items: [
      "Ich kann Versuchungen gut widerstehen.",
      "Es fällt mir schwer, schlechte Gewohnheiten abzulegen.",
      "Ich tue bestimmte Dinge, die schlecht für mich sind, wenn sie Spaß machen.",
      "Ich lehne Dinge ab, die schlecht für mich sind.",
      "Manchmal kann ich mich nicht davon abhalten, etwas zu tun, obwohl ich weiß, dass es falsch ist.",
      "Vergnügen und Spaß halten mich manchmal davon ab, meine Arbeit zu erledigen.",
      "Ich bin faul.",
      "Ich habe Schwierigkeiten, mich zu konzentrieren.",
      "Ich kann effektiv auf langfristige Ziele hinarbeiten.",
      "Ich handle oft, ohne alle Alternativen durchdacht zu haben.",
      "Ich sage unpassende Dinge.",
      "Ich wünschte, ich hätte mehr Selbstdisziplin.",
      "Andere würden sagen, ich habe eine eiserne Selbstdisziplin."
    ]
  },
  offen: {
    QU01: "Welche Funktionen in deinen Apps sind deiner Meinung nach so gebaut, dass du länger bleibst oder öfter zurückkommst? Nenne alles, was dir einfällt.",
    QU02: "Wie gehst du damit um? Und unterscheidet sich das davon, wie du gern damit umgehen würdest?"
  },
  demo: {
    title: "Angaben zu dir",
    DE01: "Alter",
    DE02: "Geschlecht",
    DE02_options: [
      { v: "weiblich", label: "weiblich" }, { v: "maennlich", label: "männlich" },
      { v: "divers", label: "divers" }, { v: "keine_angabe", label: "keine Angabe" }
    ],
    DE03: "Studiengang",
    DE04: "Fachsemester",
    DE05: "Hochschule",
    DE05_options: [
      { v: "ude", label: "Universität Duisburg-Essen" },
      { v: "andere", label: "andere, nämlich", text: true }
    ]
  },
  t23: {
    text: "Danke. Jetzt kommt die Schulung, etwa 15 bis 20 Minuten. Bitte direkt weiter.",
    button: "Schulung starten"
  }
};

// ── Block FB: Feedback zur Schulung (Auftrag v3, Abschnitt 5) ─────────────
window.ITEMS.FB = {
  title: "Kurz zur Schulung",
  FB01: "Gab es während der Schulung einen Moment, in dem dir plötzlich etwas klar wurde, so ein Aha-Erlebnis?",
  FB01_options: [
    { v: "ja_deutlich", label: "Ja, deutlich" },
    { v: "ja_bisschen", label: "Ja, ein bisschen" },
    { v: "nein", label: "Nein" }
  ],
  FB02: "Bei welchem Muster oder an welcher Stelle?",
  FB03: "Was davon war neu für dich?",
  FB04: "Was war unklar oder überflüssig?",
  FB05: "Wie willst du jetzt damit umgehen?",
  endTitle: "Danke!",
  endText: "Danke! In etwa zwei Wochen kommt der zweite und letzte Fragebogen (10 bis 15 Minuten). Mach dann bitte wieder einen Screenshot deiner Bildschirmzeit für die letzte Woche. Du bekommst eine Erinnerung per Mail."
};

// ── Blöcke T1/T2 (Auftrag v3, Abschnitt 5) ────────────────────────────────
window.ITEMS.T12 = {
  start: "Willkommen zurück. Das ist der zweite und letzte Fragebogen, etwa 10 bis 15 Minuten.",
  startTitle: "Willkommen zurück",
  SH01: "Hast du seit der Schulung etwas an deinem Handy oder in deinen Apps geändert?",
  SH01_options: [
    { v: "zeitlimit", label: "Zeitlimit für eine App gesetzt" },
    { v: "benachrichtigungen", label: "Benachrichtigungen einer App ausgeschaltet" },
    { v: "geloescht", label: "eine App gelöscht" },
    { v: "startbildschirm", label: "eine App vom Startbildschirm entfernt" },
    { v: "autoplay", label: "Autoplay oder Ähnliches in den App-Einstellungen geändert" },
    { v: "nichts", label: "nichts davon", exclusive: true },
    { v: "anderes", label: "anderes", text: true }
  ],
  SH02: "Magst du einen Screenshot davon hochladen?",
  t1EndTitle: "Das war's.",
  t1EndText: "Das war's. Danke fürs Mitmachen. Deine persönliche Auswertung kommt nach dem Ende der Studie per Mail.",
  QU03: "Hat sich in den letzten zwei Wochen etwas daran verändert, wie du deine Apps nutzt oder wie du sie wahrnimmst? Was, und woran lag es?",
  QU04: "Was glaubst du, wollte diese Studie herausfinden?"
};
