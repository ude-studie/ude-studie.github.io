/*
 * items.js – alle Fragetexte, Skalen und Anker der Studie.
 * Nichts davon steht hartcodiert in der Logik.
 * Texte mit Struktur: **fett**, Leerzeile = Absatz, Zeilen mit „• “ = Aufzählung (study.js, richHtml).
 * Platzhalter: %dauer_t0% … aus config.js, %datum% / %ende% setzt der Router ein.
 *
 * Stand: survey-v4 (18.10.2026): vier Gruppen, Fragebögen T0 / T1 / T2.
 * Alle neuen oder geänderten Texte sind mit „// ENTWURF“ markiert und in
 * TEXTAENDERUNGEN-v4.md gesammelt. Texte dürfen keine Gruppe, keine
 * Hypothese und keinen Unterschied zwischen den Schulungen verraten.
 */
window.ITEMS = {

  // ── Wiederkehrende Skalen ──────────────────────────────
  scales: {
    janein: [
      { v: "ja", label: "Ja" },
      { v: "nein", label: "Nein" }
    ]
  },

  // ── Rahmentexte (Router, Warteseite, Code-Seiten) ───────
  frame: {
    waitTitle: "Vielen Dank!",
    // ENTWURF: Warteseite nach T0 bzw. nach der Intervention (vor T1); gruppenneutral
    waitT1Text: "Danke, dass du dir die Zeit genommen hast. Deine Antworten helfen uns sehr.\n\n**Wie es weitergeht:** Am %datum%, schicken wir dir per Mail den Link zum nächsten Fragebogen (etwa %dauer_t1% Minuten). Er ist dann eine Woche lang offen, bis %ende%.\n\n**Warum er wichtig ist:** Erst mit deinen Antworten in den nächsten Fragebögen können wir die Studie auswerten. Wir freuen uns sehr, wenn du wieder dabei bist.",
    // ENTWURF: Warteseite nach T1 (vor T2)
    waitT2Text: "Danke für deine Antworten!\n\n**Wie es weitergeht:** Am %datum%, schicken wir dir per Mail den Link zum letzten Fragebogen (etwa %dauer_t2% Minuten). Er ist dann eine Woche lang offen, bis %ende%.",
    // ENTWURF: Warteseite, wenn T1 verpasst wurde (T2 bleibt erreichbar)
    t1MissedTitle: "Schön, dass du da bist",
    t1MissedText: "Der Zeitraum für den zweiten Fragebogen ist leider vorbei. Das ist nicht schlimm: Am %datum%, schicken wir dir den Link zum letzten Fragebogen (etwa %dauer_t2% Minuten). Er ist dann eine Woche lang offen, bis %ende%.",
    // nur im Pilotmodus: Knopf auf der Warteseite
    pilotSkip: "Pilot: Wartezeit überspringen",
    // ENTWURF: Übergang nach T0 für G2–G4 (G1 sieht direkt die Warteseite)
    transitionTitle: "Danke für deine Antworten!",
    transitionText: "Gleich startet eine kurze Schulung zu digitalen Themen.",
    transitionButton: "Weiter",
    doneTitle: "Vielen Dank für deine Teilnahme",
    doneText: "Du hast alles geschafft. Danke für deine Zeit und deine Unterstützung!",
    // ENTWURF: T2 verpasst (Wortlaut aus dem Umbau-Auftrag)
    t2MissedTitle: "Danke für deine Teilnahme",
    t2MissedText: "Der Zeitraum für diesen Fragebogen ist vorbei. Danke für deine Teilnahme.",
    // ENTWURF: Angebot am Ende für G1/G2 (freiwillige Schulung, Welle POST)
    offerText: "**Zum Schluss ein Angebot:** Wenn du magst, kannst du dir jetzt noch eine kurze Schulung ansehen: wie Social-Media-Apps gebaut sind, damit man sie länger und öfter nutzt. Sie dauert etwa %dauer_schulung% Minuten und ist freiwillig. Deine Antworten darin werten wir nicht aus.",
    offerButton: "Schulung ansehen",
    // ENTWURF: nach der freiwilligen Schulung
    postDoneText: "Danke, dass du dir auch die Schulung angesehen hast.",
    unknownCodeTitle: "Code unbekannt",
    unknownCodeText: "Diesen Code kennen wir nicht. Prüfe den Link aus deiner Mail oder gib deinen Code ein.",
    codeInputLabel: "Dein Code (6 Zeichen)",
    codeInputButton: "Weiter",
    startTitle: "Studie zu Social-Media-Apps", // ENTWURF (vorher „Studie Social-Media-Schulung“)
    startHaveCode: "Ich habe schon einen Code",
    t0MissedTitle: "Danke für dein Interesse",
    t0MissedText: "Die Anmeldung zur Studie ist inzwischen geschlossen. Danke trotzdem für dein Interesse.",
    offlineHint: "Die Verbindung ist schwach. Deine Antworten werden gespeichert, sobald sie wieder besteht.",
    noConnectionRegister: "Gerade besteht keine Verbindung zum Server. Bitte öffne die Seite später noch einmal; für die Anmeldung wird eine Internetverbindung benötigt.",
    registrationClosed: "Die Anmeldung zur Studie ist leider geschlossen."
  },

  // ── Block R: Registrierung ─────────────────────────────
  R: {
    r01: {
      title: "Willkommen zur Studie",
      // ENTWURF v4: neuer Ablauf, gruppenneutral (keine Schulung „mit Screens aus deinen Apps“ mehr versprochen)
      text: "**Worum es geht:** Wir untersuchen, wie Menschen Social-Media-Apps nutzen und wie sie deren Gestaltung wahrnehmen. Die Studie läuft an der Universität Duisburg-Essen (Wirtschaftsinformatik).\n\n**Ablauf:**\n• Heute: Anmeldung, ein Fragebogen und bei den meisten eine kurze Schulung zu digitalen Themen (zusammen etwa %dauer_t0% Minuten)\n• Nach etwa 2 und nach etwa 5 Wochen: je ein kurzer Fragebogen (etwa %dauer_t1% Minuten)\n\nWelche Schulung du bekommst und wann, entscheidet der Zufall. Manche bekommen ihre Schulung erst am Ende der Studie.\n\nDanke, dass du dir die Zeit nimmst und uns unterstützt!",
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
      // ENTWURF v4: zwei weitere Fragebögen und Erinnerungen
      text: "**Wofür:** Wir schicken dir die Links zu den beiden weiteren Fragebögen und, falls nötig, eine Erinnerung.\n\n**Datenschutz:** Deine Adresse wird getrennt von deinen Antworten gespeichert, nur für diese Studie genutzt, nicht weitergegeben und nach Studienende gelöscht.",
      EM01: "E-Mail-Adresse",
      EM02: "E-Mail-Adresse wiederholen",
      error: "Das sieht nicht nach einer E-Mail-Adresse aus. Bitte prüfe die Eingabe.",
      mismatch: "Die beiden Adressen stimmen nicht überein."
    },
    r05: {
      title: "Anmeldung abgeschlossen",
      text: "Du bist angemeldet. Es geht jetzt mit dem ersten Fragebogen weiter.",
      button: "Weiter"
    }
  }
};

// ── Fragebogen-Bausteine (T0, T1, T2) ────────────────────────────────────
window.ITEMS.T0 = {
  t01: {
    title: "Der erste Fragebogen",
    // ENTWURF v4: neue Reihenfolge, Dauer nur für den Fragebogen
    text: "**Was dich erwartet:**\n• ein Screenshot deiner Bildschirmzeit\n• nachgestellte Screens aus Social-Media-Apps, die du kurz einschätzt\n• Fragen zu deiner Social-Media-Nutzung und zu dir\n\n**Dauer:** etwa %dauer_t0_fragebogen% Minuten.\n\nEs gibt keine richtigen oder falschen Antworten. Antworte so, wie es für dich stimmt."
  },
  t04: {
    // Recherchiert 11.10. (Apple Support, Apple Community, deutsche Anleitungen). iOS: Wochenansicht,
    // nach rechts wischen = frühere Woche; Kategorien statt einzelner Apps. Android hat keine
    // Kategorie „Soziale Netzwerke“ und unterscheidet sich je Hersteller → allgemein formuliert.
    schritte_ios: [
      "Öffne **Einstellungen** → **Bildschirmzeit**.",
      "Tippe auf **Alle App- & Websiteaktivitäten anzeigen**.",
      "Wähle oben **Woche**. Wische über das Diagramm nach rechts, bis die **letzte Woche** angezeigt wird.",
      "Tippe unter „Meistgenutzt“ auf **Kategorien anzeigen** und dann auf **Soziale Netzwerke**.",
      "Mach einen **Screenshot**. Passt nicht alles auf einen, scroll weiter und mach einen zweiten."
    ],
    zusatz_ios: "Je nach iOS-Version heißt die Kategorie auch „Soziale Netze“.",
    schritte_android: [
      "Öffne **Einstellungen** → **Digital Wellbeing** (je nach Hersteller auch „Digitales Wohlbefinden“).",
      "Tippe auf das **Diagramm** mit deiner Bildschirmzeit.",
      "Stell auf die **Wochenansicht** um, falls es sie gibt, und wähle die **letzte Woche**.",
      "Mach einen **Screenshot** der App-Liste, auf dem deine Social-Media-Apps (**Instagram, TikTok, Snapchat**) mit ihren Zeiten zu sehen sind. Passt nicht alles auf einen, scroll weiter und mach einen zweiten."
    ],
    zusatz_android: "Android sortiert nicht nach Kategorien. Uns reichen die Zeiten dieser Apps.",
    // ENTWURF v4: nur in T1 und T2 (Umbau-Auftrag, Etappe 2)
    letzteWoche: "**Wichtig:** Mit „letzte Woche“ meinen wir die volle Woche von Montag bis Sonntag vor heute.",
    // ENTWURF v4: Hinweis am Computer (kein Touch, breiter als 700 px), dazu ein QR-Code
    desktopHinweis: "**Du bist gerade am Computer?** Den Screenshot machst du am Handy. Scanne dafür den QR-Code mit der Handy-Kamera: Er öffnet deinen persönlichen Link. Lade den Screenshot am Handy hoch und mach danach hier am Computer weiter – lade diese Seite dazu einmal neu.",
    desktopLinkLabel: "Dein persönlicher Link",
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
  // Wiedererkennung (v4: eigener Block in T0, T1 und T2; vier Kernmuster + drei Ablenker)
  erkennen: {
    title: "Nachgestellte Screens", // ENTWURF v4: Seitentitel
    instruktion: "Du siehst jetzt {n} nachgestellte Screens aus Social-Media-Apps. In jedem ist ein Element rot umrahmt. Sag uns, ob es aus deiner Sicht versucht, dein Verhalten zu beeinflussen. Nicht jedes umrahmte Element tut das.",
    ERa: "Versucht das rot umrahmte Element, dein Verhalten zu beeinflussen?",
    ERa_options: [
      { v: "ja", label: "Ja" },
      { v: "nein", label: "Nein" },
      { v: "weiss_nicht", label: "Weiß nicht" }
    ],
    ERb: "Wie? Beschreibe in einem Satz, was das Element macht und wozu es dient.",
    ERc: "Was sind deine Gedanken dazu?",
    screenOf: "Screen {x} von {n}"
  },
  t17: {
    title: "Die Elemente noch einmal",
    intro: "Zu jedem Element zwei kurze Fragen. Unter jedem Bild kannst du es vergrößern.",
    AK01: "Wie stark würde dich dieses Element dazu bringen, die App länger oder öfter zu nutzen?",
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
    title: "Deine Social-Media-Nutzung",
    instruktion: "Mit Social Media meinen wir hier Instagram, TikTok und Snapchat. Wie oft gibst du dem Verlangen nach, sie zu nutzen, obwohl deine Nutzung in diesem Moment …",
    skala: [
      { v: 1, label: "fast nie" }, { v: 2, label: "selten" }, { v: 3, label: "manchmal" },
      { v: 4, label: "oft" }, { v: 5, label: "sehr oft" }
    ],
    // Kontrollfrage in T1 (richtig: Stufe 2). Nur markieren, kein Ausschluss.
    ATT02: "Dies ist eine Kontrollfrage. Bitte wähle hier „selten“.",
    ATT02_richtig: 2,
    // ENTWURF v4: neue Kontrollfrage in T2 (statt ATT02, damit sie nicht wiedererkannt wird; [offen] siehe Bericht)
    ATT03: "Dies ist eine Kontrollfrage. Bitte wähle hier „oft“.",
    ATT03_richtig: 4,
    SF01_01: "… mit anderen Zielen in Konflikt steht (zum Beispiel: etwas für Uni oder Arbeit erledigen)?",
    SF01_02: "… dazu führt, dass du deine Zeit weniger effizient nutzt?",
    SF01_03: "… dazu führt, dass du andere Dinge aufschiebst, die du tun willst oder musst?"
  },
  kg: {
    title: "Deine Apps in der letzten Woche",
    KG01: "Wie sehr hattest du in der letzten Woche das Gefühl, selbst zu bestimmen, wie du deine Zeit in [App] verbringst?",
    KG01_skala: [
      { v: 1, label: "überhaupt nicht" }, { v: 2, label: "wenig" }, { v: 3, label: "teilweise" },
      { v: 4, label: "überwiegend" }, { v: 5, label: "völlig" }
    ]
    // RE01 (Reue) gestrichen in v4
  },
  // Selbstkontrolle, 8-Item-Fassung der SCS-K-D (Singh, 2022, Diagnostica 68(2), 76–87, Tab. 1;
  // Übersetzung Bertrams & Dickhäuser, 2009). Wortlaut aus „18 Skalen deutsch.md“, Block „App-Fassung“.
  // Ersetzt seit 18.10. BS01_01–13 (eigene Übersetzung). Umpolen: Items 2, 3, 4, 5, 7.
  // Stufen 1 und 5 wörtlich, 2–4 eigene Beschriftung.
  sk: {
    title: "Über dich",
    instruktion: "Wie sehr treffen die folgenden Aussagen auf dich zu?",
    skala: [
      { v: 1, label: "völlig unzutreffend" }, { v: 2, label: "eher unzutreffend" },
      { v: 3, label: "teils, teils" }, { v: 4, label: "eher zutreffend" }, { v: 5, label: "trifft ganz genau zu" }
    ],
    // Kontrollfrage nach Item 4; richtig ist Stufe 2. Nur markieren, kein Ausschluss.
    ATT01: "Dies ist eine Kontrollfrage. Bitte wähle hier „eher unzutreffend“.",
    ATT01_richtig: 2,
    umpolen: [2, 3, 4, 5, 7],
    items: [
      "Ich bin gut darin, Versuchungen zu widerstehen.",
      "Es fällt mir schwer, schlechte Gewohnheiten abzulegen.",
      "Ich bin faul.",
      "Ich wünschte, ich hätte mehr Selbstdisziplin.",
      "Angenehme Aktivitäten und Vergnügen hindern mich manchmal daran, meine Arbeit zu machen.",
      "Ich kann effektiv auf langfristige Ziele hinarbeiten.",
      "Manchmal kann ich mich selbst nicht daran hindern, etwas zu tun, obwohl ich weiß, dass es falsch ist.",
      "Andere würden sagen, dass ich eine eiserne Selbstdisziplin habe."
    ]
  },

  // ── Neue Skalen v4 ───────────────────────────────────────
  // ASRS-6 (Screener Teil A der WHO ASRS-v1.1, deutsche Fassung, ins Du übertragen; Kessler et al. 2005).
  // Wortlaut aus „18 Skalen deutsch.md“, Block „App-Fassung“. Kodierung 0–4.
  // Zusätzlich gespeichert: AS01_sum (0–24) und AS01_pos (auffällig: Items 1–3 ab Stufe 2, 4–6 ab Stufe 3).
  asrs: {
    title: "Konzentration im Alltag", // ENTWURF (Seitentitel)
    instruktion: "Wie oft traf das in den letzten 6 Monaten auf dich zu? Wähle jeweils die Antwort, die am besten beschreibt, wie du dich gefühlt und verhalten hast.",
    skala: [
      { v: 0, label: "Nie" }, { v: 1, label: "Selten" }, { v: 2, label: "Manchmal" },
      { v: 3, label: "Oft" }, { v: 4, label: "Sehr oft" }
    ],
    auffaelligAb: [2, 2, 2, 3, 3, 3],
    items: [
      "Wie oft hast du Probleme, die letzten Details eines Projekts abzuschließen, nachdem die schwierigen Teile abgeschlossen sind?",
      "Wie oft hast du Schwierigkeiten, Dinge zu ordnen, wenn du eine Aufgabe hast, die Organisation erfordert?",
      "Wie oft hast du Probleme, dich an Termine oder Verpflichtungen zu erinnern?",
      "Wie oft vermeidest oder verschiebst du es, eine Aufgabe zu beginnen, die viel Nachdenken erfordert?",
      "Wie oft bist du zappelig oder bewegst die Hände oder Füße, wenn du lange Zeit sitzen musst?",
      "Wie oft fühlst du dich übermäßig aktiv und unter dem Zwang, Dinge zu tun, als ob du von einem Motor angetrieben wärst?"
    ]
  },
  // FoMO (Przybylski et al., 2013), 10 Items. ENTWURF: eigene Übersetzung vom 18.10.
  // (Wortlaut aus „18 Skalen deutsch.md“, Block „App-Fassung FoMO“). Wird vor Studienstart
  // ersetzt durch die Fassung von Wegmann et al. (2017) oder eine rückübersetzte Fassung.
  // Pflicht, 1–5, keine Umpolung, Mittelwert.
  fomo: {
    title: "Freunde und Erlebnisse", // ENTWURF (Seitentitel)
    instruktion: "Wie sehr treffen die folgenden Aussagen auf dich und deinen Alltag zu? Antworte so, wie es wirklich ist, und nicht so, wie es sein sollte.", // ENTWURF
    skala: [ // ENTWURF
      { v: 1, label: "trifft überhaupt nicht auf mich zu" }, { v: 2, label: "trifft ein wenig auf mich zu" },
      { v: 3, label: "trifft teilweise auf mich zu" }, { v: 4, label: "trifft stark auf mich zu" },
      { v: 5, label: "trifft voll und ganz auf mich zu" }
    ],
    items: [ // ENTWURF
      "Ich befürchte, dass andere lohnendere Erlebnisse haben als ich.",
      "Ich befürchte, dass meine Freunde lohnendere Erlebnisse haben als ich.",
      "Ich mache mir Sorgen, wenn ich erfahre, dass meine Freunde ohne mich Spaß haben.",
      "Ich werde unruhig, wenn ich nicht weiß, was meine Freunde gerade machen.",
      "Es ist mir wichtig, die Insider-Witze meiner Freunde zu verstehen.",
      "Manchmal frage ich mich, ob ich zu viel Zeit damit verbringe, auf dem Laufenden zu bleiben.",
      "Es stört mich, wenn ich eine Gelegenheit verpasse, mich mit Freunden zu treffen.",
      "Wenn ich eine schöne Zeit habe, ist es mir wichtig, die Einzelheiten online zu teilen (z. B. in einer Story).",
      "Es stört mich, wenn ich ein geplantes Treffen verpasse.",
      "Wenn ich im Urlaub bin, verfolge ich weiter, was meine Freunde machen."
    ]
  },
  // SRBAI-G (Ljubic, Broda, Windmann & Englert, 2025, Tab. 2), Satzanfang auf App-Öffnen angepasst.
  // Wortlaut aus „18 Skalen deutsch.md“, Block „App-Fassung“. 5 Stufen wie in der deutschen Fassung;
  // Stufenbeschriftungen eigene Formulierung.
  srbai: {
    title: "Gewohnheiten", // ENTWURF (Seitentitel)
    instruktion: "Instagram, TikTok oder Snapchat zu öffnen ist für mich etwas, …",
    skala: [
      { v: 1, label: "stimme überhaupt nicht zu" }, { v: 2, label: "stimme eher nicht zu" },
      { v: 3, label: "teils, teils" }, { v: 4, label: "stimme eher zu" }, { v: 5, label: "stimme voll zu" }
    ],
    items: [
      "… das ich automatisch tue.",
      "… das ich tue, ohne mich bewusst daran erinnern zu müssen.",
      "… das ich tue, ohne nachzudenken.",
      "… mit dem ich anfange, ohne zu bemerken, dass ich es tue."
    ]
  },

  offen: {
    title: "Eine offene Frage", // ENTWURF v4 (QU02 gestrichen)
    diktat: "Tipp: Du kannst deine Antworten auch einsprechen. Tippe dazu auf das Mikrofon-Symbol deiner Tastatur.",
    QU01: "Welche Funktionen in deinen Apps sorgen deiner Meinung nach dafür, dass du sie länger oder öfter nutzt? Nenne alles, was dir einfällt."
  }
};

// ── Block FB: nur im Pilotmodus, direkt nach der Intervention (v4) ────────
// FB01, FB02, FB02b und FB05 sind gestrichen (FB05 regt Vorsätze an).
window.ITEMS.FB = {
  title: "Rückmeldung (nur Testpersonen)", // ENTWURF
  hinweis: "Diese Seite sehen nur Testpersonen im Pilotmodus.", // ENTWURF
  FB03: "Was davon war neu für dich?",
  FB04: "Was war unklar?",
  FB06: "Was war überflüssig?"
};

// ── Folge-Fragebögen T1 und T2 (v4, gruppenneutral) ───────────────────────
window.ITEMS.T12 = {
  startTitle: "Willkommen zurück",
  startT1: "Schön, dass du wieder dabei bist! Das ist der zweite Fragebogen. Er dauert etwa %dauer_t1% Minuten.", // ENTWURF
  startT2: "Schön, dass du wieder dabei bist! Das ist der letzte Fragebogen der Studie. Er dauert etwa %dauer_t2% Minuten.", // ENTWURF
  shTitle: "Geänderte Einstellungen",
  SH01: "Hast du in den letzten Wochen etwas an deinem Handy oder in deinen Apps geändert?", // ENTWURF (vorher „seit der Schulung“)
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
  schlussTitle: "Zwei Fragen zum Schluss",
  QU03: "Hat sich in den letzten Wochen etwas daran verändert, wie du deine Apps nutzt oder wie du sie wahrnimmst? Wenn ja, was und warum?", // ENTWURF (vorher „seit der Schulung“)
  QU04: "Was glaubst du, wollte diese Studie herausfinden?"
};
