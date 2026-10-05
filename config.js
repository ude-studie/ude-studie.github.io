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

  // --- Zeitfenster, jeweils einschließlich, Ortszeit Europe/Berlin ---
  TIMEZONE: "Europe/Berlin",
  WINDOWS: {
    R:  { from: "2026-10-01T00:00:00", to: "2026-10-14T23:59:59" }, // "ab sofort"
    T0: { from: "2026-10-12T00:00:00", to: "2026-10-14T23:59:59" },
    T1: { from: "2026-10-19T00:00:00", to: "2026-10-21T23:59:59" },
    T2: { from: "2026-10-26T00:00:00", to: "2026-10-28T23:59:59" }
  },

  // %woche% je Welle (T0-03, Screenshot-Seiten, KG/RE-Items)
  WEEKS: {
    T0: "05. bis 11.10.",
    T1: "12. bis 18.10.",
    T2: "19. bis 25.10."
  },

  // Für Wartesite und Abschlusstexte
  NEXT_DATES: {
    T0: "Montag, 12.10.",
    T1: "Montag, 19.10.",
    T2: "Montag, 26.10."
  },

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
