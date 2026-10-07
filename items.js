/*
 * items.js – alle Fragetexte, Skalen und Anker der Studie.
 * Nichts davon steht hartcodiert in der Logik. Wortlaute aus Auftrag v3.
 * Keine festen Termine (seit 06.10.): Folge-Fragebogen etwa zwei Wochen nach T0.
 *
 * Stand: survey-v2 (Rework 07.10.): Blöcke R, T0, FB und ein Folge-Fragebogen T1.
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
    waitTitle: "Vielen Dank",
    waitText: "Dein zweiter Fragebogen wird in etwa zwei Wochen für dich freigeschaltet. Du bekommst dann eine Erinnerung per Mail.",
    doneTitle: "Vielen Dank für deine Teilnahme",
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
    offlineHint: "Die Verbindung ist schwach. Deine Antworten werden gespeichert, sobald sie wieder besteht.",
    noConnectionRegister: "Gerade besteht keine Verbindung zum Server. Bitte öffne die Seite später noch einmal; für die Anmeldung wird eine Internetverbindung benötigt.",
    registrationClosed: "Die Anmeldung zur Studie ist leider geschlossen."
  },

  // ── Block R: Registrierung (Rework 07.10., survey-v2) ───
  R: {
    r01: {
      title: "Willkommen zur Studie",
      // ENTWURF Zeitangabe: wird nach der Zeitmessung (Rework Abschnitt 10) gesetzt
      text: "Diese Studie der Universität Duisburg-Essen (Wirtschaftsinformatik) untersucht, wie Social-Media-Apps gestaltet sind, damit man länger in ihnen bleibt und öfter zurückkommt. Was auf dich zukommt: Nach der Anmeldung beantwortest du einen Fragebogen und siehst eine Schulung mit nachgestellten Screens aus deinen Apps; zusammen dauert das etwa %dauer_t0% Minuten. Etwa zwei Wochen später folgt ein zweiter, kürzerer Fragebogen. Am Ende bekommst du deine eigene Bildschirmzeit als Auswertung per Mail.",
      infoLink: "Teilnahmeinformation und Datenschutz",
      infoHref: "teilnahme.html",
      EW01: "Ich habe die Teilnahmeinformation gelesen und willige ein, an der Studie teilzunehmen.",
      EW02: "Ich habe die Datenschutzinformation gelesen und willige in die beschriebene Verarbeitung meiner Daten ein. Ich kann das jederzeit widerrufen."
    },
    r02: {
      title: "Teilnahmevoraussetzungen",
      SC01: "Bist du 18 Jahre alt oder älter?",
      SC03: "Welche dieser Apps nutzt du an einem normalen Tag mindestens einmal?",
      SC03_options: [
        { v: "ig", label: "Instagram" },
        { v: "tt", label: "TikTok" },
        { v: "sc", label: "Snapchat" },
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
      title: "Vielen Dank für dein Interesse",
      text: "Für diese Studie suchen wir Personen ab 18 Jahren, die Instagram, TikTok oder Snapchat täglich auf einem iPhone oder Android-Smartphone nutzen. Das trifft bei dir nicht zu, deshalb endet die Teilnahme an dieser Stelle. Vielen Dank für dein Interesse."
    },
    r03: {
      title: "Angaben zu dir",
      DE01: "Alter",
      DE02: "Geschlecht",
      DE02_options: [
        { v: "weiblich", label: "weiblich" }, { v: "maennlich", label: "männlich" },
        { v: "divers", label: "divers" }, { v: "keine_angabe", label: "keine Angabe" }
      ],
      DE06: "Was ist deine hauptsächliche Tätigkeit?",
      DE06_options: [
        { v: "studium", label: "Studium" },
        { v: "ausbildung", label: "Ausbildung" },
        { v: "vollzeit", label: "Angestellt in Vollzeit" },
        { v: "teilzeit", label: "Angestellt in Teilzeit" },
        { v: "selbststaendig", label: "Selbstständig" },
        { v: "arbeitssuche", label: "Auf Arbeitssuche" },
        { v: "sonstiges", label: "Sonstiges", text: true }
      ],
      DE06_text: "Welche?",
      DE03: "Studiengang",
      DE04: "Fachsemester",
      DE05: "Hochschule",
      DE05_options: [
        { v: "ude", label: "Universität Duisburg-Essen" },
        { v: "andere", label: "andere, nämlich", text: true }
      ]
    },
    r04: {
      title: "Deine E-Mail-Adresse",
      text: "Deine E-Mail-Adresse brauchen wir, um dir den Link zum zweiten Fragebogen, eine Erinnerung und am Ende deine Auswertung zu schicken. Sie wird getrennt von deinen Antworten gespeichert, nur für die Kontaktaufnahme im Rahmen dieser Studie verwendet, nicht weitergegeben und nach Abschluss der Studie gelöscht.",
      EM01: "E-Mail-Adresse",
      EM02: "E-Mail-Adresse wiederholen",
      error: "Das sieht nicht nach einer E-Mail-Adresse aus. Bitte prüfe die Eingabe.",
      mismatch: "Die beiden Adressen stimmen nicht überein."
    },
    r05: {
      title: "Anmeldung abgeschlossen",
      text: "Du bist angemeldet. Es geht jetzt mit dem ersten Fragebogen weiter.",
      button: "Zum Fragebogen"
    }
  }
};

// ── Block T0: Fragebogen (Wortlaute aus Auftrag v3, Abschnitt 5) ──────────
window.ITEMS.T0 = {
  t01: {
    title: "Der erste Fragebogen",
    // ENTWURF Zeitangabe (%dauer_t0%, config.js): Rework Abschnitt 10 misst sie
    text: "Heute beantwortest du einige Fragen zu deiner Social-Media-Nutzung und siehst danach nachgestellte Screens aus deinen Apps. Bei jedem Screen schätzt du zuerst ein, ob ein markiertes Element dein Verhalten beeinflussen soll, danach erklären wir, was dahintersteckt. Das ist kein Test. Insgesamt dauert es etwa %dauer_t0% Minuten. Gespeichert werden nur deine Antworten, keine Nutzungs- oder Gerätedaten."
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
    SU02_hinweis_leer: "Ohne Screenshot fehlt uns der wichtigste Wert. Falls das Hochladen gerade nicht möglich ist, kannst du trotzdem weitermachen.",
    SU03: "Warum nicht?",
    SU03_options: [
      { v: "aus", label: "Die Bildschirmzeit war bei mir ausgeschaltet." },
      { v: "finde_nicht", label: "Ich finde die Ansicht nicht." },
      { v: "upload", label: "Das Hochladen funktioniert nicht." },
      { v: "moechte_nicht", label: "Ich möchte keinen Screenshot hochladen." },
      { v: "anderes", label: "Anderer Grund:", text: true }
    ]
  },
  // Erkennen im Folge-Fragebogen: gleiches Format wie in der Schulung (Rework 07.10., 4.1 und 8)
  erkennen: {
    instruktion: "Du siehst jetzt {n} nachgestellte Screens aus Social-Media-Apps. In jedem ist ein Element rot umrahmt. Sag uns, ob dieses Element aus deiner Sicht versucht, dein Verhalten zu beeinflussen. Nicht jeder Screen enthält so ein Element.",
    ERa: "Versucht das rot umrahmte Element, dein Verhalten zu beeinflussen?",
    ERa_options: [
      { v: "ja", label: "Ja" },
      { v: "nein", label: "Nein" },
      { v: "weiss_nicht", label: "Weiß nicht" }
    ],
    ERb: "Wie? Beschreibe in einem Satz, was das Element macht und was die App damit erreichen will.",
    ERb_short: "Bitte beschreib kurz, was das Element macht.",
    ERc: "Was sind deine Gedanken dazu? (freiwillig)",
    screenOf: "Screen {x} von {n}"
  },
  t17: {
    intro: "Die Elemente mit Muster noch einmal. Unter jedem Bild kannst du es vergrößern.",
    AK01: "Wie stark würde dich dieses Element beeinflussen, länger in der App zu bleiben oder öfter zurückzukommen?",
    AK01_skala: [
      { v: 1, label: "gar nicht" }, { v: 2, label: "kaum" }, { v: 3, label: "etwas" },
      { v: 4, label: "stark" }, { v: 5, label: "sehr stark" }
    ],
    AK02: "Findest du es in Ordnung, dass die App das so macht?",
    AK02_skala: [
      { v: 1, label: "gar nicht in Ordnung" }, { v: 2, label: "eher nicht in Ordnung" }, { v: 3, label: "teils, teils" },
      { v: 4, label: "eher in Ordnung" }, { v: 5, label: "völlig in Ordnung" }
    ]
  },
  smscf: {
    instruktion: "Mit Social Media meinen wir hier deine Apps aus der Liste. Wie oft gibst du dem Verlangen nach, sie zu nutzen, obwohl deine Nutzung in diesem Moment …",
    skala: [
      { v: 1, label: "fast nie" }, { v: 2, label: "selten" }, { v: 3, label: "manchmal" },
      { v: 4, label: "oft" }, { v: 5, label: "sehr oft" }
    ],
    // Kontrollfrage im Folge-Fragebogen (Rework 07.10., 8); richtig ist Stufe 2. Nur markieren.
    ATT02: "Dies ist eine Kontrollfrage. Bitte wähle hier „selten“.",
    ATT02_richtig: 2,
    SF01_01: "… mit anderen Zielen in Konflikt steht (zum Beispiel: etwas für Uni oder Arbeit erledigen)?",
    SF01_02: "… dazu führt, dass du deine Zeit weniger effizient nutzt?",
    SF01_03: "… dazu führt, dass du andere Dinge aufschiebst, die du tun willst oder musst?"
  },
  kgre: {
    KG01: "Wie sehr hattest du in der letzten Woche das Gefühl, selbst zu bestimmen, wie du deine Zeit in [App] verbringst?",
    KG01_skala: [
      { v: 1, label: "überhaupt nicht" }, { v: 2, label: "wenig" }, { v: 3, label: "teilweise" },
      { v: 4, label: "überwiegend" }, { v: 5, label: "völlig" }
    ],
    RE01: "Wie oft hast du in der letzten Woche die Zeit bereut, die du in [App] verbracht hast?",
    RE01_skala: [
      { v: 1, label: "nie" }, { v: 2, label: "selten" }, { v: 3, label: "manchmal" },
      { v: 4, label: "oft" }, { v: 5, label: "sehr oft" }
    ]
  },
  bscs: {
    // ENTWURF: Platzhalter-Übersetzungen aus Dokument 03 (Tangney et al. 2004,
    // eigene Übersetzung). Daniel ersetzt sie durch die SCS-K-D, sobald verfügbar.
    instruktion: "Wie sehr treffen die folgenden Aussagen auf dich zu?",
    skala: [
      { v: 1, label: "trifft überhaupt nicht zu" }, { v: 2, label: "trifft eher nicht zu" },
      { v: 3, label: "teils, teils" }, { v: 4, label: "trifft eher zu" }, { v: 5, label: "trifft voll zu" }
    ],
    // Kontrollfrage zwischen Item 7 und 8; richtig ist Stufe 2. Nur markieren, kein Ausschluss.
    ATT01: "Dies ist eine Kontrollfrage. Bitte wähle hier „trifft eher nicht zu“.",
    ATT01_richtig: 2,
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
    title: "Zwei offene Fragen",
    diktat: "Tipp: Du kannst deine Antworten auch einsprechen. Tippe dazu auf das Mikrofon-Symbol deiner Tastatur.",
    QU01: "Welche Funktionen in deinen Apps sind deiner Meinung nach so gebaut, dass du länger bleibst oder öfter zurückkommst? Nenne alles, was dir einfällt.",
    QU02: "Wie gehst du damit um? Und unterscheidet sich das davon, wie du gern damit umgehen würdest?"
  }
};

// ── Block FB: Feedback zur Schulung (Auftrag v3, Abschnitt 5) ─────────────
window.ITEMS.FB = {
  title: "Rückmeldung zur Schulung",
  FB01: "Hattest du während der Schulung ein Aha-Erlebnis? Gemeint ist ein Moment, in dem dir plötzlich etwas klar wurde, das du vorher nicht gesehen hattest.",
  FB01_options: [
    { v: "ja_deutlich", label: "Ja, deutlich" },
    { v: "ja_ansatzweise", label: "Ja, ansatzweise" },
    { v: "nein", label: "Nein" }
  ],
  FB02: "Bei welchem Muster oder an welcher Stelle?",
  FB03: "Was davon war neu für dich?",
  FB04: "Was war unklar oder überflüssig?",
  FB05: "Wie willst du jetzt damit umgehen?",
  endTitle: "Vielen Dank",
  endText: "In etwa zwei Wochen folgt der zweite und letzte Fragebogen (etwa %dauer_t1% Minuten). Mach dann bitte wieder einen Screenshot deiner Bildschirmzeit für die letzte Woche. Du bekommst dazu eine Erinnerung per Mail."
};

// ── Folge-Fragebogen T1 (Rework 07.10., Abschnitt 8) ────────────────────────────────
window.ITEMS.T12 = {
  start: "Willkommen zurück. Das ist der zweite und letzte Fragebogen; er dauert etwa %dauer_t1% Minuten.",
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
  t1EndTitle: "Vielen Dank für deine Teilnahme",
  t1EndText: "Deine persönliche Auswertung bekommst du nach dem Ende der Studie per Mail.",
  QU03: "Hat sich in den letzten zwei Wochen etwas daran verändert, wie du deine Apps nutzt oder wie du sie wahrnimmst? Was, und woran lag es?",
  QU04: "Was glaubst du, wollte diese Studie herausfinden?"
};
