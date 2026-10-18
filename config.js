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

  // --- Ablauf (v4, 18.10.: vier Gruppen, T0 / T1 / T2) ---
  // Anmeldung, T0 und die Intervention laufen direkt hintereinander, solange
  // die Anmeldung offen ist. Direkt nach T0 teilt der Server die Gruppe zu
  // (assign_group, MIGRATION-v4.sql). T1 und T2 öffnen je Person am Montag
  // nach der ersten bzw. vierten vollen Kalenderwoche nach der Intervention
  // und sind 7 Tage offen. Die Termine berechnet der Server (set_schedule);
  // die App liest sie über progress().
  TIMEZONE: "Europe/Berlin",
  WINDOWS: {
    R:  { from: "2026-10-01T00:00:00", to: "2026-12-31T23:59:59" },
    T0: { from: "2026-10-01T00:00:00", to: "2026-12-31T23:59:59" }
  },

  // Zeitangaben in den Texten (%dauer_t0%, %dauer_t1%, %dauer_t2%, %dauer_schulung%)
  // ENTWURF v4: Ziel aus dem Umbau-Auftrag (heute höchstens 25, T1/T2 je höchstens 10 Minuten)
  DAUER_T0_MIN: "25",       // Anmeldung + Fragebogen + Intervention
  DAUER_T0_FRAGEBOGEN_MIN: "12", // nur der erste Fragebogen (Startseite T0-01)
  DAUER_T1_MIN: "10",
  DAUER_T2_MIN: "10",
  DAUER_SCHULUNG_MIN: "10", // Startseite der Schulung

  // Fassung des Fragebogens; wird mit jedem Event gespeichert (Spalte events.version,
  // seit v4 auch in schema.sql).
  SURVEY_VERSION: "survey-v4", // v4 (18.10.): 4 Gruppen, Wiedererkennung T0/T1/T2, neue Skalen, T2
  SEND_VERSION: true,

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
