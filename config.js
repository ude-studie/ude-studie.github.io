/* Zentrale Konfiguration der Studie.
 * Die beiden Supabase-Werte trägt Daniel nach der Einrichtung ein
 * (SETUP-SUPABASE.md, Schritt 6). Alles andere ist ohne Codeänderung
 * verschiebbar; Zeitangaben gelten in Ortszeit Europe/Berlin.
 */
window.STUDY_CONFIG = {
  // --- Supabase (aus dem Dashboard, Schritt 6 der Anleitung) ---
  SUPABASE_URL: "https://khobsolpzqiwuzicqfuw.supabase.co",  // nur die Basis-URL, ohne /rest/v1/
  SUPABASE_ANON_KEY: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtob2Jzb2xwenFpd3V6aWNxZnV3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTExMzYxNDAsImV4cCI6MjEwNjcxMjE0MH0.G8FbIAkNdSk5HtCoogDFyALaiBYNFTKhGvyubbUjSTU",  // der lange "anon public"-Schlüssel

  STORAGE_BUCKET: "screenshots",

  // --- Ablauf (seit 06.10.: keine festen Termine mehr) ---
  // Anmeldung, Fragebogen T0, Schulung und Feedback laufen direkt
  // hintereinander, solange die Anmeldung offen ist. Es gibt EINEN
  // Folge-Fragebogen (gespeichert als Welle T1), der sich für jede Person
  // FOLLOWUP_AFTER_DAYS Tage nach ihrem T0 öffnet (ab 0:00 Uhr Berlin).
  TIMEZONE: "Europe/Berlin",
  WINDOWS: {
    R:  { from: "2026-10-01T00:00:00", to: "2026-12-31T23:59:59" },
    T0: { from: "2026-10-01T00:00:00", to: "2026-12-31T23:59:59" }
  },
  FOLLOWUP_AFTER_DAYS: 14,

  // Zeitangaben in den Texten (%dauer_t0%, %dauer_t1%). T0 = 20 Minuten (Entscheidung Daniel 07.10.)
  DAUER_T0_MIN: "20",
  DAUER_T1_MIN: "15",

  // Fassung des Fragebogens; wird mit jedem Event gespeichert (Spalte events.version).
  // SEND_VERSION erst auf true setzen, wenn ADD-VERSION-SPALTE.sql in Supabase gelaufen ist –
  // sonst lehnt die Datenbank jede Zeile mit unbekannter Spalte ab.
  SURVEY_VERSION: "survey-v2",
  SEND_VERSION: true, // Spalte events.version existiert seit 07.10.

  // Kontaktzeile unter jeder Seite (Rework 6.3)
  CONTACT_EMAIL: "daniel.davydov@stud.uni-due.de",

  // --- Code-System ---
  CODE_ALPHABET: "23456789ABCDEFGHJKLMNPQRSTUVWXYZ", // keine 0/O/1/I
  CODE_LENGTH: 6,

  // --- Uploads ---
  MAX_UPLOAD_MB: 10,
  MAX_FILES_PER_UPLOAD: 3,
  ALLOWED_UPLOAD_TYPES: ["image/jpeg", "image/png", "image/heic", "image/heif", "image/webp"],

  // --- Speichern mit Wiederholung (Abschnitt 4.3 des Auftrags) ---
  RETRY_DELAYS_SECONDS: [1, 3, 9]
};
