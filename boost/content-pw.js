/*
 * content-pw.js – Placebo-Schulung „Sichere Passwörter“ (nur G2, Welle PLACEBO; boost-v7).
 * Umbau-Auftrag, Etappe 6. ALLE Texte ENTWURF (stehen in TEXTAENDERUNGEN-v4.md).
 *
 * Gleicher Aufbau und gleiche Optik wie die Schulung (content.js):
 *   Startseite → 4 Themen × 3 Schritte (Antwort → Ausprobieren → Erklärung)
 *   → 2 Übungen → Einordnung → Zusammenfassung
 * Nachgestellte Screens ohne echte Marken („Musterbank“, „Mustershop“ … sind erfunden).
 * Kein Bezug zu Social-Media-Gestaltung, Bildschirmzeit oder Aufmerksamkeit.
 * Die Erklärung nutzt dieselben drei Überschriften wie die Schulung; „Wozu es dient“
 * beschreibt hier, wozu die Masche den Angreifern dient. Keine Ratschläge
 * (wie in der Schulung), nur Erklärung.
 *
 * Datenformat analog zur Schulung: P1 … P4 (Themen), W1, W2, SUMMARY in Welle PLACEBO.
 */
window.CONTENT_PW = {
  version: "boost-v7-pw",

  ui: {
    unitOf: "Thema {x} von {n}",
    exerciseOf: "Übung {x} von {n}",
    btnNextUnit: "Nächstes Thema"
  },

  start: {
    title: "So läuft die Schulung ab",
    lead: "In dieser kurzen Schulung geht es darum, wie Angreifer an Passwörter und Konten kommen.",
    points: [
      "Es kommen **4 Themen** rund um sichere Passwörter.",
      "Jedes Thema hat **3 Schritte:** ① Antwort ② Ausprobieren ③ Erklärung",
      "Am Ende kommen **2 kurze Übungen**.",
      "Dauer: etwa **12 Minuten**."
    ],
    note: "Die Screens sind nachgestellt. Alle Namen von Banken, Shops und Diensten sind erfunden.",
    button: "Zum ersten Thema"
  },

  // „Muster“ heißen hier Themen; Datenformat wie in der Schulung (id = Nummer in P1 … P4)
  patterns: [
    {
      id: 1,
      key: "passwort-mehrfach",
      always: true,
      question: "Der Mustershop wird gehackt, Passwörter werden gestohlen. Was passiert mit deinen anderen Konten?",
      options: ["Nichts, die liegen ja bei anderen Anbietern", "Angreifer probieren dasselbe Passwort dort aus", "Die anderen Anbieter sperren sie sofort"],
      correct: 2,
      name: "Ein Passwort für alles (Passwort-Wiederverwendung)",
      short: "Ein Passwort für alles",
      satz: "Wird ein Dienst gehackt, probieren Angreifer dasselbe Passwort bei allen anderen aus.",
      was: "Wird ein Dienst gehackt, landen E-Mail-Adressen und Passwörter oft in Listen, die im Netz gehandelt werden. Programme probieren diese Kombinationen dann automatisch bei vielen anderen Diensten aus (Credential Stuffing).",
      wirkung: "Viele Menschen nutzen dasselbe Passwort für mehrere Konten. Dann reicht ein einziges Datenleck, um gleich mehrere Konten zu übernehmen, auch solche, die selbst nie gehackt wurden.",
      zweck: "Übernommene Konten lassen sich für Betrug nutzen: zum Einkaufen auf fremde Rechnung, für Spam oder um an weitere Daten zu kommen.",
      variants: {
        web: {
          screen: "pw-reuse",
          ctxA: "Deine Konten. Überall nutzt du dasselbe Passwort.",
          ctxB: "Der Mustershop wurde gehackt. Kurz danach melden sich Fremde bei deinen anderen Konten an.",
          tryText: "„Ausprobieren“ zeigt, was nach dem Hack beim Mustershop passiert.",
          hint: "Mit der gestohlenen Kombination aus E-Mail und Passwort kommen Angreifer überall hinein, wo du dasselbe Passwort nutzt.",
          markLabel: "Warnungen bei den anderen Konten",
          data: {
            email: "du@beispiel.de",
            accounts: [
              { name: "Mustershop", kind: "Onlineshop", leak: true },
              { name: "Postfach", kind: "E-Mail" },
              { name: "Filmabend+", kind: "Streaming" },
              { name: "Musterbank", kind: "Onlinebanking" }
            ],
            leakLabel: "Daten gestohlen",
            alertLabel: "Anmeldung von unbekanntem Gerät"
          }
        }
      }
    },
    {
      id: 2,
      key: "phishing-seite",
      always: true,
      question: "Woran erkennst du am sichersten, ob diese Anmeldeseite echt ist?",
      options: ["Am Logo und an den Farben", "An der Adresse oben im Browser", "Am Schloss-Symbol neben der Adresse"],
      correct: 2,
      name: "Gefälschte Anmeldeseiten (Phishing)",
      short: "Gefälschte Anmeldeseiten",
      satz: "Logo und Farben lassen sich kopieren; wem die Seite gehört, zeigt die Adresse.",
      was: "Angreifer bauen Anmeldeseiten bekannter Dienste nach und locken mit dringenden Mails oder SMS dorthin. Wer sich dort anmeldet, gibt Benutzername und Passwort direkt an die Angreifer.",
      wirkung: "Logo, Farben und sogar das Schloss-Symbol lassen sich leicht kopieren. Das Schloss zeigt nur, dass die Verbindung verschlüsselt ist, nicht, wem die Seite gehört. Dazu kommt Zeitdruck („Ihr Konto wird gesperrt“), der zum schnellen Klicken verleitet.",
      zweck: "Mit den Zugangsdaten können Angreifer Konten leerräumen oder für weiteren Betrug nutzen.",
      variants: {
        web: {
          screen: "pw-phish",
          ctxA: "Eine Mail sagt: „Ihr Konto wird gesperrt. Melden Sie sich an.“ Der Link führt hierher.",
          ctxB: "Die Adresse gehört nicht der Musterbank, sondern „konto-sicherheit.net“.",
          tryText: "„Ausprobieren“ zeigt, wem die Seite wirklich gehört.",
          hint: "Entscheidend ist, was direkt vor der Endung ganz rechts steht, hier „.net“: Die Seite gehört zu „konto-sicherheit.net“. Das „musterbank.de“ vorne ist nur Tarnung.",
          markLabel: "Adresszeile des Browsers",
          data: {
            url: "musterbank.de.konto-sicherheit.net/login",
            urlMain: "konto-sicherheit.net",
            bank: "Musterbank",
            banner: "Ihr Konto wird in 24 Stunden gesperrt. Bitte bestätigen Sie Ihre Daten."
          }
        }
      }
    },
    {
      id: 3,
      key: "zwei-faktor-code",
      always: true,
      question: "Der Anrufer sagt, er sei vom Support der Musterbank, und will den Code. Was stimmt?",
      options: ["Den Code nennen, er ist ja vom Support", "Echte Anbieter fragen nie nach diesem Code", "Den Code nur nennen, wenn er deinen Namen kennt"],
      correct: 2,
      name: "Der Bestätigungscode (Zwei-Faktor-Anmeldung)",
      short: "Der Bestätigungscode",
      satz: "Der Code ist der zweite Schlüssel zum Konto; wer danach fragt, will ihn missbrauchen.",
      was: "Bei der Zwei-Faktor-Anmeldung reicht das Passwort allein nicht. Zusätzlich braucht es einen Code, der zum Beispiel per SMS oder App kommt und nur kurz gilt.",
      wirkung: "Angreifer, die dein Passwort schon haben, lösen selbst eine Anmeldung aus und brauchen nur noch den Code. Sie rufen an oder schreiben, geben sich als Support aus und wirken freundlich und hilfsbereit.",
      zweck: "Mit dem Code umgehen sie den zweiten Schutz und übernehmen das Konto.",
      variants: {
        web: {
          screen: "pw-2fa",
          ctxA: "Eben kam eine SMS mit einem Code. Gleichzeitig ruft jemand an.",
          ctxB: "In dem Moment meldet sich jemand mit deinem Konto an. Er braucht nur noch den Code.",
          tryText: "„Ausprobieren“ zeigt, was in diesem Moment mit deinem Konto passiert.",
          hint: "Den Code hat die Musterbank geschickt, weil sich gerade jemand mit deinem Passwort anmeldet. Der Anrufer will genau diesen Code.",
          markLabel: "Hinweis: neue Anmeldung",
          data: {
            sms: "Musterbank: Dein Bestätigungscode lautet 482 913. Gib ihn niemals weiter.",
            caller: "Unbekannte Nummer",
            callText: "„Hier ist der Support der Musterbank. Zur Sicherheit brauche ich den Code, den Sie gerade bekommen haben.“",
            loginAlert: "Neue Anmeldung bei der Musterbank: Gerät „Laptop“, Ort unbekannt"
          }
        }
      }
    },
    {
      id: 4,
      key: "schwaches-passwort",
      always: true,
      question: "Die Seite zeigt bei „Sommer2024!“ die Stärke „stark“ an. Wie schnell könnte ein Programm es erraten?",
      options: ["Gar nicht, es hat Groß- und Kleinbuchstaben, Zahl und Sonderzeichen", "Sehr schnell, weil es einem bekannten Muster folgt", "Erst nach vielen Jahren"],
      correct: 2,
      name: "Schwache Passwörter, die stark aussehen",
      short: "Schwache Passwörter, die stark aussehen",
      satz: "Wort, Jahreszahl und Ausrufezeichen probieren Programme als Erstes aus.",
      was: "Angreifer raten Passwörter nicht zufällig. Ihre Programme beginnen mit Listen häufiger Passwörter und Wörter und hängen typische Muster an, etwa eine Jahreszahl oder ein Ausrufezeichen.",
      wirkung: "Viele Menschen erfüllen Vorgaben wie „Zahl und Sonderzeichen“ auf dieselbe vorhersehbare Weise. Manche Stärke-Anzeigen zählen nur die Zeichenarten und übersehen solche Muster.",
      zweck: "Je schneller ein Passwort erraten ist, desto mehr Konten können Angreifer in kurzer Zeit übernehmen.",
      variants: {
        web: {
          screen: "pw-strength",
          ctxA: "Du legst ein neues Konto an. Die Seite bewertet dein Passwort.",
          ctxB: "Ein Angriffsprogramm probiert typische Muster zuerst und ist schnell am Ziel.",
          tryText: "„Ausprobieren“ zeigt, wie ein Angriffsprogramm Passwörter errät.",
          hint: "Wörter aus dem Wörterbuch mit Jahreszahl und „!“ stehen weit oben auf den Listen solcher Angriffsprogramme. „Sommer2024!“ gehört dazu.",
          markLabel: "Liste der ausprobierten Passwörter",
          data: {
            site: "Mustershop",
            password: "Sommer2024!",
            meterLabel: "stark",
            tries: ["Passwort123", "Hallo2024!", "Winter2024!", "Sommer2023!", "Sommer2024!"]
          }
        }
      }
    }
  ],

  recognition: [
    // Übung 1: gefälschte Anmeldeseite, Stellen antippen, die auf eine Fälschung hinweisen
    {
      id: "W1",
      type: "spots",
      app: "",
      screen: "pw-phish",
      ctx: "Ein neuer Screen. Tipp die Nummern an, die auf eine gefälschte Seite hindeuten.",
      spotDefs: [
        { key: "url", pattern: 2, label: "die Adresse „musterbank-login.info“" },
        { key: "banner", pattern: 2, label: "der Zeitdruck „Letzte Warnung“" },
        { key: "forgot", pattern: null, label: "der Link „Passwort vergessen?“" }
      ],
      noPatternLabel: "kein Hinweis auf eine Fälschung",
      feedbackScore: "{k} von {n} gefunden.",
      data: {
        url: "musterbank-login.info/anmelden",
        urlMain: "musterbank-login.info",
        bank: "Musterbank",
        banner: "Letzte Warnung: Ohne Bestätigung wird Ihr Konto heute gesperrt."
      }
    },
    // Übung 2: Nachrichten einordnen – echt oder Betrug?
    {
      id: "W2",
      type: "cards",
      app: "",
      ctx: "{count} Nachrichten auf deinem Handy. Ist jede echt oder ein Betrugsversuch?",
      labelHuman: "Echt",
      labelApp: "Betrug",
      feedbackScore: "{k} von {n} richtig eingeordnet.",
      verdictRight: "Richtig",
      verdictWrong: "Falsch",
      // human = echt, false = Betrug (gleiches Datenformat wie in der Schulung)
      cardPool: [
        { app: "sms", human: true, text: "Musterbank: Dein Bestätigungscode lautet 194 552. Gib ihn niemals weiter.",
          why: "Ein Code, den du selbst angefordert hast, mit dem Hinweis, ihn nicht weiterzugeben." },
        { app: "sms", human: false, text: "Ihr Paket konnte nicht zugestellt werden. Bestätigen Sie Ihre Adresse: paket-info24.top/x7",
          why: "Fremde Adresse und Zeitdruck: ein typischer Lockvogel für eine gefälschte Seite." },
        { app: "sms", human: false, text: "Hier ist der Musterbank-Support. Senden Sie uns bitte Ihren Bestätigungscode zur Überprüfung.",
          why: "Echte Anbieter fragen nie nach dem Bestätigungscode." },
        { app: "mail", human: false, text: "Ihr Postfach ist voll. Melden Sie sich innerhalb von 2 Stunden an, sonst werden alle Mails gelöscht.",
          why: "Drohung und Zeitdruck sollen dich zum schnellen Klicken bringen." },
        { app: "mail", human: true, text: "Mustershop: Danke für deine Bestellung Nr. 4471. Den Stand findest du in deinem Kundenkonto.",
          why: "Keine Aufforderung, Daten einzugeben, und kein fremder Link." }
      ],
      appLabels: { sms: "SMS", mail: "E-Mail" }
    }
  ],

  einordnung: {
    title: "Warum Angreifer so vorgehen",
    text: [
      "**Ein Geschäft:** Gestohlene Zugangsdaten werden gehandelt. Je mehr Konten Angreifer übernehmen, desto mehr können sie verkaufen oder für Betrug nutzen. Die Maschen aus der Schulung sind deshalb verbreitet und werden ständig wiederholt.",
      "**Es trifft nicht nur Unvorsichtige:** Gefälschte Seiten und Anrufe wirken oft echt. Sie setzen auf Zeitdruck, Hilfsbereitschaft und Gewohnheiten, die fast alle Menschen haben.",
      "Wer die Maschen kennt, erkennt sie leichter im Alltag."
    ],
    button: "Weiter"
  },

  zusammenfassung: {
    title: "Die vier Themen aus deiner Schulung",
    scores: "Deine Antworten: {x} von {n} richtig. In den Übungen: {y} von {max} Punkten.",
    outroEnd: "Danke, dass du dir die Schulung angesehen hast.",
    buttonEnd: "Fertig"
  }
};
