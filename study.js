/*
 * study.js – Router und Seitenlogik der Studie (Auftrag v3).
 *
 * Aufgaben:
 *  - Code aus ?c=, localStorage oder Eingabe ermitteln (Abschnitt 3 des Auftrags)
 *  - progress() fragen und entscheiden, welcher Block/welche Seite dran ist
 *  - Seiten aus pages/*.js rendern, validieren, je "Weiter" alle Variablen
 *    der Seite plus page_seconds als Events speichern
 *  - Zeitfenster (Europe/Berlin) und Pilotmodus (?pilot=1)
 *
 * Stand Abnahme 1: Block R komplett; T0/T1/T2 zeigen Wartesite bzw. Platzhalter.
 */
(function () {
  "use strict";

  var CFG = window.STUDY_CONFIG;
  var F = window.ITEMS.frame;
  var app = document.getElementById("app");
  var params = new URLSearchParams(location.search);

  var ctx = {
    code: null,
    pilot: params.get("pilot") === "1",
    os: null,
    apps: [],
    progress: null
  };

  var LS_CODE = "study-code";
  var LS_ANSWERS = "study-answers-"; // + wave
  var currentWave = null;

  // Platzhalter in Texten ersetzen; %woche% gibt es seit 06.10. nicht mehr
  // (keine festen Termine), [App] ersetzt pages/*.js selbst
  function tpl(s) {
    if (s == null) return s;
    return String(s).replace(/\s*\(%woche%\)/g, "").replace(/%woche%/g, "letzte Woche")
      .replace(/%dauer_t0%/g, CFG.DAUER_T0_MIN || "30").replace(/%dauer_t1%/g, CFG.DAUER_T1_MIN || "10");
  }

  // ── Hilfen ─────────────────────────────────────────────
  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }
  function esc(s) { return String(s == null ? "" : s); }
  function lsGet(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
  function lsSet(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }

  function personalLink(code) {
    return location.origin + location.pathname + "?c=" + encodeURIComponent(code);
  }

  // Jetzt-Zeit als "YYYY-MM-DDTHH:mm:ss" in Europe/Berlin (lexikalisch vergleichbar)
  function nowBerlin() {
    var s = new Intl.DateTimeFormat("sv-SE", {
      timeZone: CFG.TIMEZONE, year: "numeric", month: "2-digit", day: "2-digit",
      hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false
    }).format(new Date());
    return s.replace(" ", "T");
  }
  function inWindow(w) {
    if (ctx.pilot) return true;
    var now = nowBerlin();
    return now >= CFG.WINDOWS[w].from && now <= CFG.WINDOWS[w].to;
  }
  function beforeWindow(w) {
    return !ctx.pilot && nowBerlin() < CFG.WINDOWS[w].from;
  }
  function afterWindow(w) {
    return !ctx.pilot && nowBerlin() > CFG.WINDOWS[w].to;
  }

  // ── Verbindungs-Hinweis (Abschnitt 4.3) ────────────────
  var statusBar = null;
  window.DB.onStatus(function (state) {
    if (!statusBar) return;
    statusBar.textContent = state === "offline" ? F.offlineHint : "";
    statusBar.hidden = state !== "offline";
  });

  // ── Grundgerüst je Ansicht ─────────────────────────────
  function shell(progress) {
    app.innerHTML = "";
    var wrap = el("div", "study");
    if (progress) {
      var bar = el("div", "progress-track");
      var fill = el("div", "progress-fill");
      fill.style.width = Math.round(progress * 100) + "%";
      bar.appendChild(fill);
      wrap.appendChild(bar);
    }
    statusBar = el("div", "offline-bar");
    statusBar.hidden = true;
    wrap.appendChild(statusBar);
    var page = el("div", "page study-page");
    wrap.appendChild(page);
    app.appendChild(wrap);
    window.scrollTo(0, 0);
    return page;
  }

  function simplePage(title, text, extra) {
    var page = shell(null);
    page.appendChild(el("h1", "tp-h1", title));
    if (text) page.appendChild(el("p", "tp-p", text));
    if (extra) page.appendChild(extra);
  }

  // ── Statische Ansichten ────────────────────────────────
  function showWait(dateText) {
    simplePage(F.waitTitle, F.waitText.replace("%datum%", dateText));
  }
  function showDone() { simplePage(F.doneTitle, F.doneText); }
  function showRegistrationClosed() { simplePage(F.waitTitle, F.registrationClosed); }

  function showCodeEntry(introTitle, introText) {
    var box = el("div", "field");
    var label = el("label", null, F.codeInputLabel);
    var input = el("input");
    input.type = "text";
    input.maxLength = CFG.CODE_LENGTH;
    input.autocapitalize = "characters";
    input.autocomplete = "off";
    var err = el("div", "error");
    var btn = el("button", "btn", F.codeInputButton);
    btn.addEventListener("click", async function () {
      var code = input.value.trim().toUpperCase();
      if (code.length !== CFG.CODE_LENGTH) { err.textContent = F.unknownCodeText; return; }
      btn.disabled = true;
      var res = await window.DB.progress(code);
      btn.disabled = false;
      if (res.ok && res.data && res.data.exists) {
        lsSet(LS_CODE, code);
        history.replaceState(null, "", personalLink(code) + (ctx.pilot ? "&pilot=1" : ""));
        start(code);
      } else {
        err.textContent = F.unknownCodeText;
      }
    });
    box.appendChild(label); box.appendChild(input); box.appendChild(err); box.appendChild(btn);
    simplePage(introTitle, introText, box);
  }

  // Erster Aufruf ohne Code: Person landet direkt auf R-01 (Abschnitt 3,
  // Punkt 1). Der Code wird erst beim ersten "Weiter" angelegt, damit bloßes
  // Vorbeischauen keine leeren Zeilen erzeugt. Wer schon einen Code hat
  // (anderes Gerät, privater Tab – Punkt 4), nimmt den Link unten.
  async function ensureParticipant() {
    if (ctx.code) return true;
    var res = await window.DB.createParticipant(ctx.pilot);
    if (!res.ok) return false;
    ctx.code = res.code;
    lsSet(LS_CODE, res.code);
    history.replaceState(null, "", personalLink(res.code) + (ctx.pilot ? "&pilot=1" : ""));
    return true;
  }

  // ── Seiten-Engine ──────────────────────────────────────
  function waveAnswers(wave) {
    try { return JSON.parse(lsGet(LS_ANSWERS + wave)) || {}; } catch (e) { return {}; }
  }
  function saveWaveAnswers(wave, a) { lsSet(LS_ANSWERS + wave, JSON.stringify(a)); }

  function runBlock(def, startId) {
    // Blöcke mit dynamischen Seiten (T1/T2: Erkennen nur gezeigte Muster)
    if (typeof def.build === "function") def = def.build(ctx);
    currentWave = def.wave;
    var answers = waveAnswers(def.wave);
    // „Zurück" auch nach Neuladen oder späterem Wiedereinstieg: Verlauf aus
    // der Seitenreihenfolge rekonstruieren (ohne Endseiten wie R-X)
    var first = startId || def.start;
    var idx = def.pages.map(function (p) { return p.id; }).indexOf(first);
    var history_ = def.pages.slice(0, Math.max(0, idx))
      .filter(function (p) { return !p.terminal; })
      .map(function (p) { return p.id; });
    renderPage(def, first, answers, history_);
  }

  // Gezeigte Muster deterministisch aus der App-Liste – exakt die Regel der
  // Schulung (Reihenfolgen aus boost/content.js, Tabelle 3 des Research
  // Designs). Abweichung vom Auftrag ("aus events, wave=BOOST") gemeldet:
  // das Ergebnis ist identisch, braucht aber keinen Lesezugriff.
  var MUSTER_ORDER = {
    m1: ["tt", "ig", "fb", "x", "sc"], m2: ["ig", "fb", "x", "tt"],
    m3: ["ig", "tt", "fb", "x", "sc"], m4: ["ig", "tt", "fb", "x", "sc"],
    m5: ["ig", "tt", "fb", "x", "sc"], m7: ["sc"], m8: ["ig", "sc", "fb", "tt"]
  };
  function shownMuster(apps) {
    var out = [];
    ["m1", "m2", "m3", "m4", "m5"].forEach(function (m) {
      if (MUSTER_ORDER[m].some(function (a) { return apps.indexOf(a) >= 0; })) out.push(m);
    });
    out.push("m6"); // Rückhol-Benachrichtigungen werden immer gezeigt
    if (MUSTER_ORDER.m7.some(function (a) { return apps.indexOf(a) >= 0; })) out.push("m7");
    if (MUSTER_ORDER.m8.some(function (a) { return apps.indexOf(a) >= 0; })) out.push("m8");
    return out;
  }
  window.STUDY_SHOWN_MUSTER = shownMuster;

  function pageById(def, id) {
    return def.pages.filter(function (p) { return p.id === id; })[0];
  }

  function byOsText(item) {
    if (item.text != null) return item.text;
    if (item.byOs) return item.byOs[ctx.os || "ios"] || item.byOs.ios;
    return "";
  }

  function renderPage(def, id, answers, hist) {
    var p = pageById(def, id);
    if (!p) { simplePage("Einen Moment …", "Bitte öffne deinen persönlichen Link noch einmal."); return; }
    var idx = def.pages.indexOf(p);
    var page = shell((idx + 1) / def.pages.length);
    var started = Date.now();
    var fields = {}; // key → {get, validate, errEl}

    if (p.onEnter) p.onEnter(ctx);

    var itemList = (typeof p.items === "function") ? p.items(ctx, answers) : p.items;
    itemList.forEach(function (item) {
      var node = renderItem(item, answers, fields, page);
      if (!node) return;
      if (item.key && fields[item.key]) fields[item.key].wrapper = node;
      if (item.visibleIf) {
        var upd = function () {
          var v = currentValue(fields, answers, item.visibleIf.key);
          var show;
          if (typeof item.visibleIf.when === "function") show = item.visibleIf.when(v);
          else {
            var want = item.visibleIf.equals;
            show = Array.isArray(want) ? want.indexOf(v) >= 0 : v === want;
          }
          node.hidden = !show;
        };
        page.addEventListener("study:answer", upd);
      }
      page.appendChild(node);
    });

    // Navigation
    var nav = el("div", "nav-row");
    // Auf der ersten Seite eines Blocks führt Zurück in den vorigen Block,
    // falls der Block das vorsieht (T0 → Link-Seite der Anmeldung)
    var backToBlock = !hist.length && p.id === def.start && def.backTo && window[def.backTo.def];
    if ((hist.length || backToBlock) && !p.terminal) {
      var back = el("button", "btn secondary", "Zurück");
      back.addEventListener("click", function () {
        if (!hist.length) { runBlock(window[def.backTo.def], def.backTo.page); return; }
        var prev = hist.pop();
        renderPage(def, prev, answers, hist);
      });
      nav.appendChild(back);
    }
    if (!p.terminal) {
      var btn = el("button", "btn", p.nextLabel || "Weiter");
      btn.addEventListener("click", async function () {
        // Versteckte Felder (visibleIf) zählen nicht
        function hidden(f) { return f.wrapper && f.wrapper.hidden; }

        // Validierung: Meldung unterm Feld, Knopf bleibt aktiv
        var ok = true;
        Object.keys(fields).forEach(function (k) {
          var f = fields[k];
          if (hidden(f)) { f.errEl.textContent = ""; return; }
          var msg = f.validate();
          f.errEl.textContent = msg || "";
          if (msg) ok = false;
        });
        if (!ok) return;

        // Upload-Felder: leerer Pflicht-nahe-Fall warnt einmal (SU02-Hinweis)
        var warned = false;
        Object.keys(fields).forEach(function (k) {
          var f = fields[k];
          if (!f.upload || hidden(f) || f.warnedOnce) return;
          if (f.files().length === 0 && f.warnIfEmpty) {
            f.errEl.textContent = f.warnIfEmpty;
            f.warnedOnce = true;
            warned = true;
          }
        });
        if (warned) return; // zweiter Klick geht weiter

        // Beim allerersten "Weiter" ohne Code: Person jetzt im Backend anlegen
        if (!ctx.code) {
          btn.disabled = true;
          var created = await ensureParticipant();
          btn.disabled = false;
          if (!created) {
            var errBox = page.querySelector(".page-error") || page.insertBefore(el("div", "error page-error"), nav);
            errBox.textContent = F.noConnectionRegister;
            return;
          }
        }

        // Uploads zuerst (brauchen await), Ergebnis wird wie eine Antwort gespeichert
        var uploadKeys = Object.keys(fields).filter(function (k) {
          return fields[k].upload && !hidden(fields[k]) && fields[k].files().length;
        });
        for (var u = 0; u < uploadKeys.length; u++) {
          var f = fields[uploadKeys[u]];
          btn.disabled = true;
          var prevLabel = btn.textContent;
          btn.textContent = "Lädt hoch …";
          var paths = [], failed = 0;
          var list = f.files();
          for (var fi = 0; fi < list.length; fi++) {
            var res = await window.DB.uploadScreenshot(ctx.code, def.wave, list[fi]);
            if (res.ok) paths.push(res.path); else failed++;
          }
          btn.disabled = false;
          btn.textContent = prevLabel;
          answers[uploadKeys[u]] = { hochgeladen: paths, fehlgeschlagen: failed };
          if (failed > 0) {
            f.errEl.textContent = "Mindestens eine Datei kam nicht durch. Du kannst ohne Screenshot weitermachen.";
          }
        }

        Object.keys(fields).forEach(function (k) {
          if (fields[k].upload || hidden(fields[k])) return;
          answers[k] = fields[k].get();
        });
        saveWaveAnswers(def.wave, answers);

        var secs = (Date.now() - started) / 1000;
        var skip = p.skipEventKeys || [];
        Object.keys(fields).forEach(function (k) {
          if (skip.indexOf(k) >= 0 || hidden(fields[k])) return;
          if (answers[k] === undefined) return;
          window.DB.saveEvent(ctx.code, def.wave, p.id, k, answers[k], secs, ctx.pilot);
        });
        (p.extraEvents || []).forEach(function (ev) {
          window.DB.saveEvent(ctx.code, def.wave, p.id, ev.key, ev.value, secs, ctx.pilot);
        });
        if (p.after) p.after(answers, ctx);

        if (p.finishWave) await window.DB.markDone(ctx.code, def.wave);

        var nextId = p.next ? p.next(answers, ctx) : "END";
        if (nextId === "END") {
          // Antworten bewusst behalten: T0-02 belegt z. B. mit SC03 aus R vor
          start(ctx.code); // Router entscheidet neu (zeigt z. B. die Wartesite)
          return;
        }
        hist.push(p.id);
        renderPage(def, nextId, answers, hist);
      });
      nav.appendChild(btn);
    }
    page.appendChild(nav);

    // Einstieg ohne Code: Hinweis für Personen, die schon registriert sind
    if (!ctx.code && p.id === def.start) {
      var have = el("button", "linklike", F.startHaveCode);
      have.type = "button";
      have.addEventListener("click", function () { showCodeEntry(F.startTitle, ""); });
      page.appendChild(have);
    }

    fire(page); // Notices mit gespeicherten Antworten sofort richtig anzeigen
  }

  // ── Element-Renderer ───────────────────────────────────
  function renderItem(item, answers, fields, page) {
    switch (item.type) {

      case "title": return el("h1", "tp-h1", tpl(byOsText(item)));
      case "text": { var t = el("p", "tp-p"); t.textContent = tpl(byOsText(item)); return t; }
      case "subtitle": return el("h2", "tp-h2", tpl(byOsText(item)));

      case "steps": {
        var list = item.byOs ? (item.byOs[ctx.os || "ios"] || item.byOs.ios) : item.steps;
        var ol = el("ol", "steps");
        (list || []).forEach(function (s) { ol.appendChild(el("li", null, tpl(s))); });
        return ol;
      }

      case "sketch": {
        // Schematische Skizze (eigene Zeichnung, keine System-Screenshots)
        var kind = item.byOs ? (item.byOs[ctx.os || "ios"] || "ios") : "ios";
        var wrapS = el("div", "sketch");
        wrapS.innerHTML = kind === "android"
          ? '<svg viewBox="0 0 260 120" role="img" aria-label="Skizze: Einstellungen, Kreis mit Nutzungszeit, Wochenansicht">' +
            '<rect x="6" y="8" width="70" height="104" rx="10" fill="#fff" stroke="#9aa6b4"/>' +
            '<rect x="14" y="20" width="54" height="8" rx="3" fill="#d4dbe3"/><rect x="14" y="34" width="54" height="8" rx="3" fill="#d4dbe3"/>' +
            '<rect x="14" y="48" width="54" height="10" rx="3" fill="#1f3a5f"/><text x="17" y="56" font-size="6.5" fill="#fff">Wohlbefinden</text>' +
            '<rect x="14" y="64" width="54" height="8" rx="3" fill="#d4dbe3"/>' +
            '<path d="M84 60h18" stroke="#6b7486" stroke-width="2" marker-end="url(#ar)"/>' +
            '<rect x="108" y="8" width="70" height="104" rx="10" fill="#fff" stroke="#9aa6b4"/>' +
            '<circle cx="143" cy="48" r="22" fill="none" stroke="#1f3a5f" stroke-width="6"/><text x="143" y="51" font-size="8" text-anchor="middle" fill="#1a2233">4 Std.</text>' +
            '<rect x="118" y="82" width="50" height="7" rx="3" fill="#d4dbe3"/><rect x="118" y="94" width="38" height="7" rx="3" fill="#d4dbe3"/>' +
            '<path d="M186 60h18" stroke="#6b7486" stroke-width="2" marker-end="url(#ar)"/>' +
            '<rect x="210" y="8" width="44" height="104" rx="8" fill="#fff" stroke="#d6342c" stroke-width="2"/>' +
            '<text x="232" y="22" font-size="7" text-anchor="middle" fill="#1a2233">Woche</text>' +
            '<rect x="216" y="30" width="32" height="6" rx="2" fill="#d4dbe3"/><rect x="216" y="42" width="26" height="6" rx="2" fill="#d4dbe3"/>' +
            '<rect x="216" y="54" width="30" height="6" rx="2" fill="#d4dbe3"/><text x="232" y="100" font-size="7" text-anchor="middle" fill="#d6342c">Screenshot</text>' +
            '<defs><marker id="ar" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto"><path d="M0 0l6 3-6 3z" fill="#6b7486"/></marker></defs></svg>'
          : '<svg viewBox="0 0 260 120" role="img" aria-label="Skizze: Einstellungen, Bildschirmzeit mit Balken, Wochenansicht">' +
            '<rect x="6" y="8" width="70" height="104" rx="10" fill="#fff" stroke="#9aa6b4"/>' +
            '<rect x="14" y="20" width="54" height="8" rx="3" fill="#d4dbe3"/><rect x="14" y="34" width="54" height="8" rx="3" fill="#d4dbe3"/>' +
            '<rect x="14" y="48" width="54" height="10" rx="3" fill="#1f3a5f"/><text x="17" y="56" font-size="6" fill="#fff">Bildschirmzeit</text>' +
            '<rect x="14" y="64" width="54" height="8" rx="3" fill="#d4dbe3"/>' +
            '<path d="M84 60h18" stroke="#6b7486" stroke-width="2" marker-end="url(#ai)"/>' +
            '<rect x="108" y="8" width="70" height="104" rx="10" fill="#fff" stroke="#9aa6b4"/>' +
            '<text x="143" y="24" font-size="7" text-anchor="middle" fill="#1a2233">Woche ◂ ▸</text>' +
            '<rect x="118" y="34" width="8" height="28" fill="#8fa3bb"/><rect x="130" y="42" width="8" height="20" fill="#8fa3bb"/>' +
            '<rect x="142" y="30" width="8" height="32" fill="#1f3a5f"/><rect x="154" y="46" width="8" height="16" fill="#8fa3bb"/>' +
            '<rect x="118" y="74" width="50" height="7" rx="3" fill="#d4dbe3"/><rect x="118" y="86" width="40" height="7" rx="3" fill="#d4dbe3"/><rect x="118" y="98" width="46" height="7" rx="3" fill="#d4dbe3"/>' +
            '<path d="M186 60h18" stroke="#6b7486" stroke-width="2" marker-end="url(#ai)"/>' +
            '<rect x="210" y="8" width="44" height="104" rx="8" fill="#fff" stroke="#d6342c" stroke-width="2"/>' +
            '<text x="232" y="22" font-size="7" text-anchor="middle" fill="#1a2233">App-Liste</text>' +
            '<rect x="216" y="30" width="32" height="6" rx="2" fill="#d4dbe3"/><rect x="216" y="42" width="26" height="6" rx="2" fill="#d4dbe3"/>' +
            '<rect x="216" y="54" width="30" height="6" rx="2" fill="#d4dbe3"/><text x="232" y="100" font-size="7" text-anchor="middle" fill="#d6342c">Screenshot</text>' +
            '<defs><marker id="ai" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto"><path d="M0 0l6 3-6 3z" fill="#6b7486"/></marker></defs></svg>';
        return wrapS;
      }

      case "doclink": {
        var a = el("a", "doclink", item.label);
        a.href = item.href; a.target = "_blank"; a.rel = "noopener";
        return a;
      }

      case "notice": {
        var n = el("div", "notice", tpl(byOsText(item)));
        n.hidden = !!item.visibleIf; // Sichtbarkeit regelt der visibleIf-Mechanismus
        return n;
      }

      case "check": {
        var wrap = el("label", "check-card");
        var cb = el("input"); cb.type = "checkbox";
        if (answers[item.key] === true) cb.checked = true;
        var span = el("span", null, item.label);
        var err = el("div", "error");
        wrap.appendChild(cb); wrap.appendChild(span);
        var box = el("div", "field");
        box.appendChild(wrap); box.appendChild(err);
        cb.addEventListener("change", function () { fire(page); });
        fields[item.key] = {
          errEl: err,
          get: function () { return cb.checked; },
          validate: function () {
            return item.required && !cb.checked ? "Bitte bestätige das, um weiterzumachen." : "";
          }
        };
        return box;
      }

      case "radio": {
        var box2 = el("div", "field");
        box2.appendChild(el("label", null, tpl(item.label)));
        var row = el("div", "opt-col");
        var val = { v: answers[item.key] != null ? answers[item.key] : null };
        item.options.forEach(function (o) {
          var b = el("button", "opt-btn" + (val.v === o.v ? " selected" : ""), o.label);
          b.type = "button";
          b.addEventListener("click", function () {
            val.v = o.v;
            row.querySelectorAll(".opt-btn").forEach(function (x) { x.classList.remove("selected"); });
            b.classList.add("selected");
            fire(page);
          });
          row.appendChild(b);
        });
        var err2 = el("div", "error");
        box2.appendChild(row);
        // "andere, nämlich"-Freitext auch bei Einfachauswahl (Option mit text: true)
        var textOpt2 = item.options.filter(function (o) { return o.text; })[0];
        if (textOpt2) {
          var other2 = el("input", "other-input");
          other2.type = "text";
          other2.placeholder = "…";
          if (answers[item.key + "_text"]) other2.value = answers[item.key + "_text"];
          other2.hidden = val.v !== textOpt2.v;
          page.addEventListener("study:answer", function () {
            other2.hidden = val.v !== textOpt2.v;
          });
          box2.appendChild(other2);
          fields[item.key + "_text"] = {
            errEl: el("div"),
            get: function () { return other2.hidden ? undefined : (other2.value.trim() || null); },
            validate: function () { return ""; }
          };
        }
        box2.appendChild(err2);
        fields[item.key] = {
          errEl: err2,
          get: function () { return val.v; },
          validate: function () {
            return item.required && val.v == null ? "Bitte wähle eine Antwort aus." : "";
          }
        };
        return box2;
      }

      case "multi": {
        var box3 = el("div", "field");
        box3.appendChild(el("label", null, tpl(item.label)));
        var col = el("div", "opt-col");
        var pre = answers[item.key] != null ? answers[item.key]
          : (item.prefill ? item.prefill(ctx) : null);
        var sel = (pre || []).slice();
        item.options.forEach(function (o) {
          var b = el("button", "opt-btn" + (sel.indexOf(o.v) >= 0 ? " selected" : ""), o.label);
          b.type = "button";
          b.addEventListener("click", function () {
            var i = sel.indexOf(o.v);
            if (i >= 0) { sel.splice(i, 1); b.classList.remove("selected"); }
            else {
              if (o.exclusive) {
                sel.length = 0;
                col.querySelectorAll(".opt-btn").forEach(function (x) { x.classList.remove("selected"); });
              } else {
                // exklusive Option abwählen, wenn etwas anderes gewählt wird
                item.options.forEach(function (oo, j) {
                  if (oo.exclusive) {
                    var k = sel.indexOf(oo.v);
                    if (k >= 0) { sel.splice(k, 1); col.children[j].classList.remove("selected"); }
                  }
                });
              }
              sel.push(o.v); b.classList.add("selected");
            }
            fire(page);
          });
          col.appendChild(b);
        });
        var err3 = el("div", "error");
        box3.appendChild(col);
        // "andere, nämlich"-Freitext (Option mit text: true)
        var textOpt = item.options.filter(function (o) { return o.text; })[0];
        if (textOpt) {
          var other = el("input", "other-input");
          other.type = "text";
          other.placeholder = "…";
          if (answers[item.key + "_text"]) other.value = answers[item.key + "_text"];
          other.hidden = sel.indexOf(textOpt.v) < 0;
          page.addEventListener("study:answer", function () {
            other.hidden = sel.indexOf(textOpt.v) < 0;
          });
          box3.appendChild(other);
          fields[item.key + "_text"] = {
            errEl: el("div"),
            get: function () { return other.hidden ? undefined : (other.value.trim() || null); },
            validate: function () { return ""; }
          };
        }
        box3.appendChild(err3);
        fields[item.key] = {
          errEl: err3,
          get: function () { return sel.slice(); },
          validate: function () {
            return item.required && sel.length === 0 ? "Bitte wähle mindestens eine Antwort aus." : "";
          }
        };
        return box3;
      }

      case "number": {
        var boxN = el("div", "field");
        boxN.appendChild(el("label", null, tpl(item.label)));
        if (item.hint) boxN.appendChild(el("div", "hint", tpl(item.hint)));
        var num = el("input");
        num.type = "number"; num.inputMode = "numeric";
        if (item.min != null) num.min = item.min;
        if (item.max != null) num.max = item.max;
        if (answers[item.key] != null) num.value = answers[item.key];
        var errN = el("div", "error");
        boxN.appendChild(num); boxN.appendChild(errN);
        fields[item.key] = {
          errEl: errN,
          get: function () {
            var v = num.value.trim();
            return v === "" ? null : Number(v);
          },
          validate: function () {
            var v = num.value.trim();
            if (v === "") return item.required ? "Bitte gib eine Zahl ein." : "";
            var n = Number(v);
            if (!isFinite(n)) return "Bitte gib eine Zahl ein.";
            if (item.min != null && n < item.min) return "Bitte eine Zahl ab " + item.min + ".";
            if (item.max != null && n > item.max) return "Bitte eine Zahl bis " + item.max + ".";
            return "";
          }
        };
        return boxN;
      }

      case "textinput": {
        var boxT = el("div", "field");
        boxT.appendChild(el("label", null, tpl(item.label)));
        var ti = el("input");
        ti.type = "text";
        if (answers[item.key]) ti.value = answers[item.key];
        var errT = el("div", "error");
        boxT.appendChild(ti); boxT.appendChild(errT);
        fields[item.key] = {
          errEl: errT,
          get: function () { return ti.value.trim(); },
          validate: function () {
            return item.required && !ti.value.trim() ? "Bitte fülle dieses Feld aus." : "";
          }
        };
        return boxT;
      }

      case "textarea": {
        var boxA = el("div", "field");
        boxA.appendChild(el("label", null, tpl(item.label)));
        var ta = el("textarea", "ta");
        ta.rows = item.rows || 4;
        if (answers[item.key]) ta.value = answers[item.key];
        var errA = el("div", "error");
        boxA.appendChild(ta); boxA.appendChild(errA);
        fields[item.key] = {
          errEl: errA,
          get: function () { return ta.value.trim() || null; },
          validate: function () {
            return item.required && !ta.value.trim() ? "Bitte fülle dieses Feld aus." : "";
          }
        };
        return boxA;
      }

      case "upload": {
        var boxU = el("div", "field");
        boxU.appendChild(el("label", null, tpl(item.label)));
        var fu = el("input", "file-input");
        fu.type = "file";
        fu.accept = "image/*,.heic,.heif";
        fu.multiple = true;
        var info = el("div", "hint");
        var errU = el("div", "error");
        fu.addEventListener("change", function () {
          var names = [...fu.files].map(function (f) { return f.name; });
          info.textContent = names.length ? names.join(", ") : "";
          errU.textContent = "";
          fire(page);
        });
        boxU.appendChild(fu); boxU.appendChild(info); boxU.appendChild(errU);
        fields[item.key] = {
          errEl: errU,
          upload: true,
          warnIfEmpty: item.warnIfEmpty ? tpl(item.warnIfEmpty) : null,
          files: function () { return [...fu.files]; },
          get: function () { return answers[item.key] || null; },
          validate: function () {
            var max = (CFG.MAX_FILES_PER_UPLOAD || 3);
            var maxMb = (CFG.MAX_UPLOAD_MB || 10);
            var list = [...fu.files];
            if (list.length > max) return "Bitte höchstens " + max + " Dateien.";
            for (var i = 0; i < list.length; i++) {
              if (list[i].size > maxMb * 1024 * 1024) {
                return "„" + list[i].name + "“ ist größer als " + maxMb + " MB.";
              }
            }
            return "";
          }
        };
        return boxU;
      }

      case "email": {
        var box4 = el("div", "field");
        box4.appendChild(el("label", null, item.label));
        var inp = el("input");
        inp.type = "email"; inp.autocomplete = "email"; inp.inputMode = "email";
        if (answers[item.key]) inp.value = answers[item.key];
        var err4 = el("div", "error");
        box4.appendChild(inp); box4.appendChild(err4);
        // item.sameAs: zweites Feld zur Kontrolle (EM02). Einfügen bleibt erlaubt.
        var mismatch = function () {
          var other = item.sameAs && fields[item.sameAs];
          var v = inp.value.trim();
          return other && v && other.get() && v.toLowerCase() !== other.get().toLowerCase();
        };
        inp.addEventListener("input", function () {
          if (item.sameAs) err4.textContent = mismatch() ? item.mismatch : "";
          fire(page);
        });
        fields[item.key] = {
          errEl: err4,
          get: function () { return inp.value.trim(); },
          validate: function () {
            var v = inp.value.trim();
            if (item.required && !v) return item.error;
            if (v && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)) return item.error;
            if (mismatch()) return item.mismatch;
            return "";
          }
        };
        return box4;
      }

      case "select": {
        // Auswahlmenü; Option mit text: true blendet ein Freitextfeld ein (key_text)
        var boxS = el("div", "field");
        var idS = "sel-" + item.key;
        var lab = el("label", null, tpl(item.label)); lab.htmlFor = idS;
        boxS.appendChild(lab);
        var sel = el("select", "select-input"); sel.id = idS;
        var ph = el("option", null, item.placeholder || "Bitte auswählen"); ph.value = ""; sel.appendChild(ph);
        item.options.forEach(function (o) {
          var op = el("option", null, o.label); op.value = o.v;
          if (answers[item.key] === o.v) op.selected = true;
          sel.appendChild(op);
        });
        boxS.appendChild(sel);
        var textOptS = item.options.filter(function (o) { return o.text; })[0];
        var otherS = null;
        if (textOptS) {
          otherS = el("input", "other-input"); otherS.type = "text";
          otherS.placeholder = item.textLabel || "…";
          otherS.setAttribute("aria-label", item.textLabel || textOptS.label);
          if (answers[item.key + "_text"]) otherS.value = answers[item.key + "_text"];
          otherS.hidden = sel.value !== textOptS.v;
          boxS.appendChild(otherS);
          fields[item.key + "_text"] = {
            errEl: el("div"),
            get: function () { return otherS.hidden ? undefined : (otherS.value.trim() || null); },
            validate: function () { return ""; }
          };
        }
        var errS = el("div", "error");
        boxS.appendChild(errS);
        sel.addEventListener("change", function () {
          if (otherS) otherS.hidden = sel.value !== textOptS.v;
          fire(page);
        });
        fields[item.key] = {
          errEl: errS,
          get: function () { return sel.value || null; },
          validate: function () {
            if (item.required && !sel.value) return "Bitte wähle eine Antwort aus.";
            if (otherS && !otherS.hidden && item.textRequired && !otherS.value.trim()) return "Bitte gib an, welche.";
            return "";
          }
        };
        return boxS;
      }

      case "hint": {
        // kleiner grauer Hinweis, z. B. zum Einsprechen langer Antworten
        return el("p", "tp-hint", tpl(item.text));
      }

      case "screen": {
        var entry = item.entry || (window.RECOGNITION.SETS[item.set] || [])[item.index] || {};
        if (window.RECOGNITION.render) {
          var stage = window.RECOGNITION.render(entry, { mini: !!item.mini });
          if (!item.mini) return stage;
          // Kleine Bilder (Bewertungsseiten): darunter „Bild vergrößern"
          var wrapM = el("div", "rec-mini-wrap");
          wrapM.appendChild(stage);
          var zoom = el("button", "rec-zoom", "Bild vergrößern");
          zoom.type = "button";
          zoom.addEventListener("click", function () { openScreenOverlay(entry); });
          wrapM.appendChild(zoom);
          return wrapM;
        }
        var ph = el("div", "screen-placeholder" + (item.mini ? " mini" : ""));
        var line1 = el("div", null, "📱 [Screen folgt: " + (entry.app || "?") + "]");
        var line2 = el("div");
        line2.innerHTML = "Rot umrahmt: <b>" + (entry.target || "?") + "</b>";
        ph.appendChild(line1); ph.appendChild(line2);
        return ph;
      }

      case "linkbox": {
        var T5 = window.ITEMS.R.r05;
        var box5 = el("div", "linkbox");
        var url = personalLink(ctx.code);
        var urlEl = el("div", "linkbox-url", url);
        box5.appendChild(urlEl);
        var copy = el("button", "btn", T5.copy);
        copy.type = "button";
        copy.addEventListener("click", function () {
          var done = function () { copy.textContent = T5.copied; setTimeout(function () { copy.textContent = T5.copy; }, 2000); };
          if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(url).then(done, function () { fallbackCopy(url); done(); });
          } else { fallbackCopy(url); done(); }
        });
        box5.appendChild(copy);
        box5.appendChild(foldout(T5.homescreen, ctx.os === "android" ? T5.homescreen_android : T5.homescreen_ios));
        return box5;
      }
    }
    return null;
  }

  // Bild in voller Größe über der Seite; Tippen oder Schließen führt zurück
  function openScreenOverlay(entry) {
    var ov = el("div", "rec-overlay");
    ov.setAttribute("role", "dialog");
    ov.setAttribute("aria-label", "Bild in voller Größe");
    var stage = window.RECOGNITION.render(entry, {});
    stage.classList.add("rec-overlay-stage");
    // Gerät (410 × 800) in den verfügbaren Platz einpassen
    var s = Math.min(1, (window.innerWidth - 24) / 410, (window.innerHeight - 90) / 800);
    var dev = stage.querySelector(".device-wrap");
    if (dev) dev.style.transform = "scale(" + s.toFixed(4) + ")";
    stage.style.height = Math.round(800 * s) + "px";
    stage.style.width = Math.round(410 * s) + "px";
    ov.appendChild(stage);
    var close = el("button", "btn rec-overlay-close", "Schließen");
    close.type = "button";
    ov.appendChild(close);
    var shut = function () { ov.remove(); document.removeEventListener("keydown", onKey); };
    var onKey = function (e) { if (e.key === "Escape") shut(); };
    ov.addEventListener("click", shut);
    document.addEventListener("keydown", onKey);
    document.body.appendChild(ov);
    close.focus();
  }

  function foldout(label, text) {
    var d = el("details", "foldout");
    var s = el("summary", null, label);
    d.appendChild(s);
    d.appendChild(el("p", "tp-p", text));
    return d;
  }
  function fallbackCopy(text) {
    var ta = el("textarea"); ta.value = text;
    document.body.appendChild(ta); ta.select();
    try { document.execCommand("copy"); } catch (e) {}
    document.body.removeChild(ta);
  }
  function fire(page) {
    page.dispatchEvent(new CustomEvent("study:answer"));
  }
  function currentValue(fields, answers, key) {
    return fields[key] ? fields[key].get() : answers[key];
  }

  // ── Router ─────────────────────────────────────────────
  // Statische Fortsetzungs-Zuordnung: letzte gespeicherte Seite → nächste Seite
  var RESUME_R = { "R-01": "R-02", "R-02": "R-03", "R-03": "R-04", "R-04": "R-05", "R-05": "R-05", "R-X": "R-X" };

  // Für lineare Blöcke (T0/T1/T2): Fortsetzen bei der Seite NACH der letzten
  // gespeicherten; Seiten ohne Variablen hinterlassen keine Spur und werden
  // dann einfach noch einmal gezeigt (ein Fingertipp, kein Datenverlust).
  function resumeNext(def, last) {
    if (!last) return def.start;
    var ids = def.pages.map(function (p) { return p.id; });
    var i = ids.indexOf(last);
    if (i < 0) return def.start;
    return ids[i + 1] || last;
  }

  // Übergabe an die Schulung: ohne Zwischenseite (Rework 07.10.). replace(),
  // damit „Zurück" im Browser nicht auf eine leere Übergabe führt.
  function showBoostHandoff() {
    var ret = personalLink(ctx.code) + (ctx.pilot ? "&pilot=1" : "");
    location.replace("boost/index.html?code=" + encodeURIComponent(ctx.code) +
      "&apps=" + encodeURIComponent((ctx.apps || []).join(",")) +
      (ctx.pilot ? "&pilot=1" : "") +
      "&return=" + encodeURIComponent(ret));
  }

  async function start(code) {
    ctx.code = code;
    simplePage("Einen Moment …", "");
    var res = await window.DB.progress(code);
    if (!res.ok) { simplePage("Keine Verbindung", F.noConnectionRegister); return; }
    var p = res.data || {};
    if (!p.exists) { showCodeEntry(F.unknownCodeTitle, F.unknownCodeText); return; }
    ctx.progress = p;
    ctx.pilot = ctx.pilot || p.pilot === true;
    ctx.os = p.os || ctx.os;
    ctx.apps = p.apps || [];

    var last = (p.last_pages || {});

    // Block R
    if (!p.r_done) {
      if (last.R === "R-X") { runBlock(window.PAGES_R, "R-X"); return; }
      if (afterWindow("R")) { showRegistrationClosed(); return; }
      var resumeAt = last.R ? (RESUME_R[last.R] || window.PAGES_R.start) : window.PAGES_R.start;
      runBlock(window.PAGES_R, resumeAt);
      return;
    }

    // Schulung: direkt nach T0, am selben Tag, unabhängig vom nächsten Fenster
    if (p.t0_done && !p.boost_done) { showBoostHandoff(); return; }

    // Feedback zur Schulung: direkt danach, am selben Tag. Es gibt keine
    // fb_done-Spalte; fertig ist, wer die Endseite FB-02 erreicht hat.
    if (p.boost_done && last.FB !== "FB-02") {
      runBlock(window.PAGES_FB, resumeNext(window.PAGES_FB, last.FB));
      return;
    }

    // T0: direkt nach der Anmeldung (keine festen Termine mehr, 06.10.)
    if (!p.t0_done) {
      if (afterWindow("T0")) { simplePage(F.t0MissedTitle, F.t0MissedText); return; }
      runBlock(window.PAGES_T0, resumeNext(window.PAGES_T0, last.T0));
      return;
    }

    // Ein Folge-Fragebogen (Welle T1), FOLLOWUP_AFTER_DAYS Tage nach dem
    // eigenen T0. T2 gibt es nicht mehr; die Spalte t2_done bleibt leer.
    if (p.t1_done) { showDone(); return; }
    var opens = followupOpensAt(p.t0_done);
    if (!ctx.pilot && nowBerlin() < opens) { showWait(dateDe(opens)); return; }
    var def = window.PAGES_T1.build(ctx);
    runBlock(def, resumeNext(def, last.T1));
  }

  // Öffnungszeitpunkt des Folge-Fragebogens: Kalendertag des T0-Abschlusses
  // (Berlin) plus FOLLOWUP_AFTER_DAYS, 0:00 Uhr – als "YYYY-MM-DDTHH:mm:ss"
  function followupOpensAt(t0done) {
    var day = new Intl.DateTimeFormat("sv-SE", { timeZone: CFG.TIMEZONE, year: "numeric", month: "2-digit", day: "2-digit" })
      .format(new Date(t0done)).split("-").map(Number);
    var d = new Date(Date.UTC(day[0], day[1] - 1, day[2] + (CFG.FOLLOWUP_AFTER_DAYS || 14)));
    return d.toISOString().slice(0, 10) + "T00:00:00";
  }
  // "2026-10-20T00:00:00" → "Dienstag, 20.10."
  function dateDe(berlinStr) {
    var p = berlinStr.slice(0, 10).split("-").map(Number);
    return new Intl.DateTimeFormat("de-DE", { timeZone: "UTC", weekday: "long", day: "2-digit", month: "2-digit" })
      .format(new Date(Date.UTC(p[0], p[1] - 1, p[2])));
  }

  // ── Einstieg (Abschnitt 3 des Auftrags) ────────────────
  function boot() {
    var urlCode = (params.get("c") || "").trim().toUpperCase();
    var lsCode = (lsGet(LS_CODE) || "").trim().toUpperCase();

    if (urlCode) {           // Punkt 3: ?c= gewinnt gegenüber localStorage
      lsSet(LS_CODE, urlCode);
      start(urlCode);
    } else if (lsCode) {     // Punkt 1: bekanntes Gerät
      history.replaceState(null, "", personalLink(lsCode) + (ctx.pilot ? "&pilot=1" : ""));
      start(lsCode);
    } else {                 // Punkt 1/4: kein Code bekannt → Registrierung
      if (afterWindow("R")) { showRegistrationClosed(); return; }
      runBlock(window.PAGES_R, window.PAGES_R.start);
    }
  }

  boot();
})();
