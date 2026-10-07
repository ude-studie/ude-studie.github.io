/*
 * db.js – alle Backend-Zugriffe (Supabase), Warteschlange, Wiederholungen.
 *
 * Regeln (Auftrag v3, Abschnitt 4.3):
 *  - jeder Schreibzugriff mit 3 Versuchen (1/3/9 Sekunden),
 *  - schlägt er endgültig fehl, landet die Zeile in einer Warteschlange im
 *    localStorage und wird beim nächsten erfolgreichen Zugriff nachgeschickt,
 *  - die Person arbeitet ungestört weiter (dezenter Hinweis über onStatus).
 *
 * Ohne ausgefüllte config.js (SUPABASE_URL leer) arbeitet db.js im
 * Trockenmodus: alles wandert in die Warteschlange, nichts geht verloren –
 * praktisch zum lokalen Durchklicken, bevor Supabase steht.
 */
(function () {
  "use strict";

  var CFG = window.STUDY_CONFIG;
  var QUEUE_KEY = "study-queue-v1";
  var sb = null;
  var statusCb = function () {};
  var flushing = false;

  if (CFG.SUPABASE_URL && CFG.SUPABASE_ANON_KEY && window.supabase) {
    // Robust gegen versehentlich angehängte Pfade (z. B. ".../rest/v1/")
    var baseUrl = CFG.SUPABASE_URL.replace(/\/(rest|auth|storage)\/v1\/?$/, "").replace(/\/+$/, "");
    sb = window.supabase.createClient(baseUrl, CFG.SUPABASE_ANON_KEY);
  }

  // ── Warteschlange ──────────────────────────────────────
  function readQueue() {
    try { return JSON.parse(localStorage.getItem(QUEUE_KEY)) || []; }
    catch (e) { return []; }
  }
  function writeQueue(q) {
    try { localStorage.setItem(QUEUE_KEY, JSON.stringify(q)); } catch (e) {}
  }
  function enqueue(job) {
    var q = readQueue();
    q.push(job);
    writeQueue(q);
    statusCb("offline", q.length);
  }

  async function flushQueue() {
    if (!sb || flushing) return;
    var q = readQueue();
    if (!q.length) return;
    flushing = true;
    try {
      while (q.length) {
        await runJob(q[0]); // wirft bei Fehler
        q.shift();
        writeQueue(q);
      }
      statusCb("online", 0);
    } catch (e) {
      /* beim nächsten Schreibzugriff oder online-Event erneut */
    } finally {
      flushing = false;
    }
  }
  window.addEventListener("online", function () { flushQueue(); });

  // ── Low-Level mit Wiederholung ─────────────────────────
  function sleep(ms) { return new Promise(function (r) { setTimeout(r, ms); }); }

  async function runJob(job) {
    if (!sb) throw new Error("keine Verbindung konfiguriert");
    var res;
    if (job.kind === "insert") {
      res = await sb.from(job.table).insert(job.row);
    } else if (job.kind === "rpc") {
      res = await sb.rpc(job.fn, job.args);
    } else {
      throw new Error("unbekannter Job");
    }
    if (res.error) throw res.error;
    return res.data;
  }

  // Versuche mit 1/3/9 s; bei endgültigem Scheitern optional in die Queue.
  async function withRetry(job, queueOnFail) {
    if (!sb) { // Trockenmodus: sofort in die Warteschlange, nicht warten
      if (queueOnFail) enqueue(job);
      return { ok: false, dry: true, error: new Error("keine Verbindung konfiguriert") };
    }
    var delays = CFG.RETRY_DELAYS_SECONDS || [1, 3, 9];
    var lastErr = null;
    for (var i = 0; i <= delays.length; i++) {
      try {
        var data = await runJob(job);
        statusCb("online", readQueue().length);
        flushQueue(); // Gelegenheit, Liegengebliebenes nachzuschicken
        return { ok: true, data: data };
      } catch (e) {
        lastErr = e;
        // Eindeutige Datenfehler (z. B. Code-Kollision) nicht wiederholen
        if (e && (e.code === "23505" || e.code === "409")) {
          return { ok: false, conflict: true, error: e };
        }
        if (i < delays.length) await sleep(delays[i] * 1000);
      }
    }
    if (queueOnFail) enqueue(job);
    return { ok: false, error: lastErr };
  }

  // ── Trockenmodus-Fortschritt ───────────────────────────
  // Ohne konfiguriertes Supabase simuliert db.js progress() lokal, damit die
  // ganze Strecke durchklickbar bleibt. Die Warteschlange füllt sich trotzdem
  // und wird nachgeschickt, sobald config.js ausgefüllt ist.
  var DRY_KEY = "study-dry-progress";
  function dryState() {
    try { return JSON.parse(localStorage.getItem(DRY_KEY)) || {}; }
    catch (e) { return {}; }
  }
  function drySave(s) {
    try { localStorage.setItem(DRY_KEY, JSON.stringify(s)); } catch (e) {}
  }

  // ── Öffentliche API ────────────────────────────────────

  function randomCode() {
    var a = CFG.CODE_ALPHABET, out = "";
    var buf = new Uint32Array(CFG.CODE_LENGTH);
    (window.crypto || {}).getRandomValues ? crypto.getRandomValues(buf)
      : buf.forEach(function (_, i) { buf[i] = Math.floor(Math.random() * 1e9); });
    for (var i = 0; i < CFG.CODE_LENGTH; i++) out += a[buf[i] % a.length];
    return out;
  }

  // Neue Person anlegen. Muss online klappen (sonst kennt das Backend den
  // Code nicht); bei Code-Kollision wird neu gewürfelt.
  async function createParticipant(pilot) {
    if (!sb) { // Trockenmodus: Code lokal vergeben, Anlage in die Warteschlange
      var dryCode = randomCode();
      enqueue({ kind: "insert", table: "participants", row: { code: dryCode, pilot: !!pilot } });
      return { ok: true, code: dryCode, dry: true };
    }
    for (var attempt = 0; attempt < 5; attempt++) {
      var code = randomCode();
      var res = await withRetry(
        { kind: "insert", table: "participants", row: { code: code, pilot: !!pilot } },
        false
      );
      if (res.ok) return { ok: true, code: code };
      if (!res.conflict) return { ok: false, error: res.error };
      /* Kollision → nächster Versuch mit neuem Code */
    }
    return { ok: false, error: new Error("Code-Erzeugung fehlgeschlagen") };
  }

  // Fortschritt eines Codes abfragen (einzige Lesefunktion).
  async function progress(code) {
    if (!sb) {
      var d = dryState();
      return { ok: true, dry: true, data: {
        exists: true, dry: true,
        os: d.os || null, apps: d.apps || [], pilot: !!d.pilot,
        r_done: d.r_done || null, t0_done: d.t0_done || null,
        boost_done: d.boost_done || null, t1_done: d.t1_done || null,
        t2_done: d.t2_done || null, last_pages: d.last_pages || {}
      } };
    }
    var res = await withRetry({ kind: "rpc", fn: "progress", args: { p_code: code } }, false);
    if (!res.ok) return { ok: false, error: res.error };
    return { ok: true, data: res.data };
  }

  // Eine Antwort = eine Zeile in events.
  // version: Fassung (Fragebogen survey-v…, Schulung boost-v…); nur mit CFG.SEND_VERSION
  function saveEvent(code, wave, page, key, value, pageSeconds, pilot, version) {
    if (!sb) {
      var d = dryState();
      d.last_pages = d.last_pages || {};
      d.last_pages[wave] = page;
      d.pilot = d.pilot || !!pilot;
      drySave(d);
    }
    var row = {
      code: code, wave: wave, page: page, key: key,
      value: value === undefined ? null : value,
      page_seconds: pageSeconds == null ? null : Math.round(pageSeconds),
      client_ts: new Date().toISOString(),
      pilot: !!pilot
    };
    if (CFG.SEND_VERSION) row.version = version || CFG.SURVEY_VERSION || null;
    return withRetry({ kind: "insert", table: "events", row: row }, true);
  }

  function saveEmail(code, email) {
    return withRetry({ kind: "rpc", fn: "save_email", args: { p_code: code, p_email: email } }, true);
  }

  function saveProfile(code, os, apps) {
    if (!sb) {
      var d = dryState();
      if (os) d.os = os;
      if (apps) d.apps = apps;
      drySave(d);
    }
    return withRetry({
      kind: "rpc", fn: "save_profile",
      args: { p_code: code, p_os: os || null, p_apps: apps || null }
    }, true);
  }

  function markDone(code, wave) {
    if (!sb) {
      var d = dryState();
      d[wave.toLowerCase() + "_done"] = new Date().toISOString();
      drySave(d);
    }
    return withRetry({ kind: "rpc", fn: "mark_done", args: { p_code: code, p_wave: wave } }, true);
  }

  // Screenshot hochladen: screenshots/CODE/WELLE/<zeit>-<name>
  // Pfad: [code]/[welle]/[zeitstempel]-[laufende Nummer].[endung] – ohne den
  // Original-Dateinamen (Rework 9.2), der persönliche Angaben enthalten kann
  async function uploadScreenshot(code, wave, file, nr) {
    if (!sb) return { ok: false, dry: true, error: new Error("keine Verbindung konfiguriert") };
    var m = /\.([A-Za-z0-9]{2,5})$/.exec(String(file.name || ""));
    var ext = m ? m[1].toLowerCase() : (String(file.type || "").split("/")[1] || "bin").replace(/[^a-z0-9]/g, "");
    var path = code + "/" + wave + "/" + Date.now() + "-" + (nr || 1) + "." + ext;
    var delays = CFG.RETRY_DELAYS_SECONDS || [1, 3, 9];
    var lastErr = null;
    for (var i = 0; i <= delays.length; i++) {
      var res = await sb.storage.from(CFG.STORAGE_BUCKET).upload(path, file, { upsert: false });
      if (!res.error) { statusCb("online", readQueue().length); return { ok: true, path: path }; }
      lastErr = res.error;
      // Endgültige Ablehnung (Regel, Dateityp, Größe) nicht wiederholen;
      // nur Netz-/Serverfehler, Timeout (408) und Drosselung (429) erneut versuchen
      var st = Number(res.error.status || res.error.statusCode) || 0;
      if (st >= 400 && st < 500 && st !== 408 && st !== 429) break;
      if (i < delays.length) await sleep(delays[i] * 1000);
    }
    return { ok: false, error: lastErr }; // Dateien werden NICHT gequeued (zu groß)
  }

  window.DB = {
    ready: !!sb,
    createParticipant: createParticipant,
    progress: progress,
    saveEvent: saveEvent,
    saveEmail: saveEmail,
    saveProfile: saveProfile,
    markDone: markDone,
    uploadScreenshot: uploadScreenshot,
    flushQueue: flushQueue,
    queueLength: function () { return readQueue().length; },
    onStatus: function (fn) { statusCb = fn || function () {}; }
  };
})();
