/*
 * db.js – alle Backend-Zugriffe (Supabase), Warteschlange, Wiederholungen.
 *
 * Regeln (Auftrag v3, Abschnitt 4.3):
 *  - jeder Schreibzugriff mit 3 Versuchen (1/3/9 Sekunden),
 *  - schlägt er endgültig fehl, landet die Zeile in einer Warteschlange im
 *    localStorage und wird beim nächsten erfolgreichen Zugriff nachgeschickt,
 *  - die Person arbeitet ungestört weiter (dezenter Hinweis über onStatus).
 *
 * Ohne ausgefüllte config.js (SUPABASE_URL leer) oder mit ?dry=1 in der
 * Adresse arbeitet db.js im Trockenmodus: nichts geht an Supabase; Fortschritt,
 * Zuteilung und Zeitplan werden im Browser nachgebildet (localStorage) –
 * zum lokalen Durchklicken ohne Datenbank. Nur im Trockenmodus wirkt
 * ?jetzt=2026-11-23T10:00 (gespielte Uhrzeit, Ortszeit Berlin).
 */
(function () {
  "use strict";

  var CFG = window.STUDY_CONFIG;
  var QUEUE_KEY = "study-queue-v1";
  var sb = null;
  var statusCb = function () {};
  var flushing = false;
  var urlParams = new URLSearchParams(location.search);
  var dryParam = urlParams.get("dry") === "1"; // Testschalter (v4): ohne Supabase durchklicken

  if (!dryParam && CFG.SUPABASE_URL && CFG.SUPABASE_ANON_KEY && window.supabase) {
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
  // Ohne konfiguriertes Supabase (oder mit ?dry=1) bildet db.js progress(),
  // assign_group() und mark_done() lokal nach, damit die ganze Strecke
  // durchklickbar bleibt. Im Trockenmodus wird nichts an Supabase geschickt.
  var DRY_KEY = "study-dry-progress";
  var DRY_ALLOC = "study-dry-allocation";
  var DRY_LOG = "study-dry-events";
  function dryState() {
    try { return JSON.parse(localStorage.getItem(DRY_KEY)) || {}; }
    catch (e) { return {}; }
  }
  function drySave(s) {
    try { localStorage.setItem(DRY_KEY, JSON.stringify(s)); } catch (e) {}
  }

  // ── Zeitplan (gleiche Regel wie set_schedule() in MIGRATION-v4.sql) ──
  // T1: Montag nach der ersten vollen Kalenderwoche (Mo–So) nach dem Tag „from“
  // (Berlin), T2: Montag nach der vierten vollen Woche; je 7 Tage offen.
  function berlinParts(d) {
    var p = {};
    new Intl.DateTimeFormat("en-GB", { timeZone: CFG.TIMEZONE, year: "numeric", month: "2-digit", day: "2-digit",
      hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false, weekday: "short" })
      .formatToParts(d).forEach(function (x) { p[x.type] = x.value; });
    return p;
  }
  // Mitternacht (Berlin) eines Kalendertags als Zeitpunkt
  function berlinMidnight(y, m, d) {
    var t = Date.UTC(y, m - 1, d);
    var p = berlinParts(new Date(t));
    var wall = Date.UTC(+p.year, +p.month - 1, +p.day, +p.hour % 24, +p.minute, +p.second);
    return new Date(t - (wall - t));
  }
  function schedule(from) {
    var p = berlinParts(new Date(from));
    var dow = { Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6, Sun: 7 }[p.weekday];
    var y = +p.year, mo = +p.month, d = +p.day + (8 - dow); // Montag der ersten vollen Woche
    var at = function (plus) { return berlinMidnight(y, mo, d + plus); };
    var end = function (plus) { return new Date(at(plus).getTime() - 1000); };
    return {
      t1_opens: at(7).toISOString(), t1_closes: end(14).toISOString(),
      t2_opens: at(28).toISOString(), t2_closes: end(35).toISOString()
    };
  }
  // Gespielte Uhrzeit, nur im Trockenmodus (?jetzt=2026-11-23T10:00, Ortszeit Berlin)
  var fakeNow = null;
  (function () {
    var m = /^(\d{4})-(\d{2})-(\d{2})(?:T(\d{2}):(\d{2}))?/.exec(urlParams.get("jetzt") || "");
    if (m) fakeNow = berlinMidnight(+m[1], +m[2], +m[3]).getTime() + ((+m[4] || 0) * 60 + (+m[5] || 0)) * 60000;
  })();
  function now() { return (!sb && fakeNow) ? fakeNow : Date.now(); }

  // Zuteilung im Trockenmodus: gleiche Regel wie assign_group() (Blöcke à 20, 3:7:7:3)
  var BAG = ["G1", "G1", "G1", "G2", "G2", "G2", "G2", "G2", "G2", "G2",
    "G3", "G3", "G3", "G3", "G3", "G3", "G3", "G4", "G4", "G4"];
  function dryAssign(d, force) {
    if (d.grp) return d.grp;
    if (d.pilot) {
      d.grp = ["G1", "G2", "G3", "G4"].indexOf(force) >= 0 ? force : BAG[Math.floor(Math.random() * 20)];
    } else {
      var a; try { a = JSON.parse(localStorage.getItem(DRY_ALLOC)) || []; } catch (e) { a = []; }
      if (!a.length) {
        a = BAG.slice();
        for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; }
      }
      d.grp = a.shift();
      try { localStorage.setItem(DRY_ALLOC, JSON.stringify(a)); } catch (e) {}
    }
    d.assigned_at = new Date(now()).toISOString();
    Object.assign(d, schedule(now()));
    if (d.grp === "G1") d.intervention_at = d.assigned_at;
    return d.grp;
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
    if (!sb) { // Trockenmodus: Code lokal vergeben, Fortschritt beginnt neu
      var dryCode = randomCode();
      drySave({ pilot: !!pilot });
      try { localStorage.removeItem(DRY_LOG); } catch (e) {}
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
      var out = { exists: true, dry: true, os: d.os || null, apps: d.apps || [], pilot: !!d.pilot, last_pages: d.last_pages || {} };
      ["r_done", "t0_done", "boost_done", "t1_done", "t2_done", "post_done", "grp", "assigned_at",
        "intervention_at", "t1_opens", "t1_closes", "t2_opens", "t2_closes"].forEach(function (k) { out[k] = d[k] || null; });
      return { ok: true, dry: true, data: out };
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
      // Protokoll zum Nachsehen: JSON.parse(localStorage["study-dry-events"])
      try {
        var log = JSON.parse(localStorage.getItem(DRY_LOG)) || [];
        log.push({ wave: wave, page: page, key: key, value: value === undefined ? null : value,
          secs: pageSeconds == null ? null : Math.round(pageSeconds), version: version || CFG.SURVEY_VERSION });
        localStorage.setItem(DRY_LOG, JSON.stringify(log));
      } catch (e) {}
      return Promise.resolve({ ok: true, dry: true });
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
    if (!sb) return Promise.resolve({ ok: true, dry: true });
    return withRetry({ kind: "rpc", fn: "save_email", args: { p_code: code, p_email: email } }, true);
  }

  function saveProfile(code, os, apps) {
    if (!sb) {
      var d = dryState();
      if (os) d.os = os;
      if (apps) d.apps = apps;
      drySave(d);
      return Promise.resolve({ ok: true, dry: true });
    }
    return withRetry({
      kind: "rpc", fn: "save_profile",
      args: { p_code: code, p_os: os || null, p_apps: apps || null }
    }, true);
  }

  // wave: R, T0, BOOST, T1, T2, POST oder INTERVENTION (setzt intervention_at
  // und den Zeitplan neu; nur G2–G4, nur beim ersten Mal)
  function markDone(code, wave) {
    if (!sb) {
      var d = dryState();
      if (wave === "INTERVENTION") {
        if (["G2", "G3", "G4"].indexOf(d.grp) >= 0 && !d.intervention_at) {
          d.intervention_at = new Date(now()).toISOString();
          Object.assign(d, schedule(now()));
        }
      } else if (!d[wave.toLowerCase() + "_done"]) {
        d[wave.toLowerCase() + "_done"] = new Date(now()).toISOString();
      }
      drySave(d);
      return Promise.resolve({ ok: true, dry: true });
    }
    return withRetry({ kind: "rpc", fn: "mark_done", args: { p_code: code, p_wave: wave } }, true);
  }

  // Zuteilung direkt nach T0 (serverseitig, assign_group in MIGRATION-v4.sql).
  // force wirkt nur bei Pilot-Codes (?pilot=1&group=G3); das prüft der Server.
  async function assignGroup(code, force) {
    if (!sb) {
      var d = dryState();
      var g = dryAssign(d, force);
      drySave(d);
      return { ok: true, dry: true, grp: g };
    }
    var res = await withRetry({ kind: "rpc", fn: "assign_group", args: { p_code: code, p_force: force || null } }, false);
    if (!res.ok) return { ok: false, error: res.error };
    return { ok: true, grp: res.data };
  }

  // Screenshot hochladen: screenshots/CODE/WELLE/<zeit>-<name>
  // Pfad: [code]/[welle]/[zeitstempel]-[laufende Nummer].[endung] – ohne den
  // Original-Dateinamen (Rework 9.2), der persönliche Angaben enthalten kann
  async function uploadScreenshot(code, wave, file, nr) {
    if (!sb) return { ok: true, dry: true, path: code + "/" + wave + "/trocken-" + (nr || 1) }; // Trockenmodus
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
    dry: !sb,
    now: now,
    schedule: schedule,
    assignGroup: assignGroup,
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
