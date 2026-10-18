/*
 * study.js – Router und Seitenlogik der Studie (Auftrag v3).
 *
 * Aufgaben:
 *  - Code NUR aus ?c= in der Adresse oder aus der Eingabe „Ich habe schon einen Code“
 *    (seit 18.10.: nichts mehr im Browser gemerkt; ohne ?c= beginnt immer eine neue Anmeldung)
 *  - progress() fragen und entscheiden, welcher Block/welche Seite dran ist
 *  - Seiten aus pages/*.js rendern, validieren, je "Weiter" alle Variablen
 *    der Seite plus page_seconds als Events speichern
 *  - Zeitfenster (Europe/Berlin) und Pilotmodus (?pilot=1)
 *
 * Stand v4 (18.10.2026): vier Gruppen. Ablauf je Person:
 *   R → T0 → Zuteilung (assign_group) → G1: Warteseite
 *                                      → G2: Übergang → Passwort-Schulung (boost/, Welle PLACEBO)
 *                                      → G3: Übergang → Schulung + neutraler Teil (BOOST, FILLER)
 *                                      → G4: Übergang → Schulung + Wenn-Dann-Plan (BOOST, PLAN)
 *   → [nur Pilot: Rückmeldung FB] → Warteseite → T1 (7 Tage offen) → Warteseite
 *   → T2 (7 Tage offen) → Abschluss; G1/G2 bekommen dort die Schulung freiwillig (POST).
 * Testschalter: ?pilot=1 (Wartezeiten aufheben, &group=G3 erzwingt eine Gruppe),
 * ?dry=1 (ohne Supabase, siehe db.js), &jetzt=… (gespielte Uhrzeit, nur mit dry=1).
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

  // Früher im Browser gemerkt (bis v4 vor dem 18.10.): Code und Antworten je Welle.
  // Wird beim Start gelöscht, damit alte Einträge niemanden mehr automatisch „wiedererkennen“.
  var OLD_KEYS = /^study-(code|answers-)/;
  var MISSING = "Bitte beantworte diese Frage."; // Rework 6.1
  var forceGroup = (params.get("group") || "").toUpperCase(); // nur Pilot: ?pilot=1&group=G3

  // Platzhalter in Texten ersetzen; [App] ersetzt pages/*.js selbst
  function tpl(s) {
    if (s == null) return s;
    return String(s)
      .replace(/%dauer_t0_fragebogen%/g, CFG.DAUER_T0_FRAGEBOGEN_MIN || "12")
      .replace(/%dauer_t0%/g, CFG.DAUER_T0_MIN || "25").replace(/%dauer_t1%/g, CFG.DAUER_T1_MIN || "10")
      .replace(/%dauer_t2%/g, CFG.DAUER_T2_MIN || "10").replace(/%dauer_schulung%/g, CFG.DAUER_SCHULUNG_MIN || "10");
  }
  // Tag als „Montag, 16. November“ (Zeitzone Berlin)
  function dayDe(iso) {
    try {
      return new Intl.DateTimeFormat("de-DE", { timeZone: CFG.TIMEZONE, weekday: "long", day: "numeric", month: "long" })
        .format(new Date(iso));
    } catch (e) { return ""; }
  }
  // Touch-Gerät (Handy, Tablet): Diktier-Hinweis ja, QR-Code nein
  function isTouch() {
    return (navigator.maxTouchPoints || 0) > 0 || !!(window.matchMedia && matchMedia("(pointer: coarse)").matches);
  }

  // ── Hilfen ─────────────────────────────────────────────
  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }
  function esc(s) { return String(s == null ? "" : s); }
  function clearOldStorage() {
    try {
      Object.keys(localStorage).forEach(function (k) { if (OLD_KEYS.test(k)) localStorage.removeItem(k); });
    } catch (e) {}
  }

  function personalLink(code) {
    return location.origin + location.pathname + "?c=" + encodeURIComponent(code);
  }
  // Test-Schalter, die beim Weiterleiten erhalten bleiben (Pilot, Trockenmodus, gespielte Uhrzeit)
  function testFlags() {
    var s = ctx.pilot ? "&pilot=1" : "";
    if (ctx.pilot && /^G[1-4]$/.test(forceGroup)) s += "&group=" + forceGroup;
    if (window.DB.dry && params.get("dry") === "1") s += "&dry=1";
    if (window.DB.dry && params.get("jetzt")) s += "&jetzt=" + encodeURIComponent(params.get("jetzt"));
    return s;
  }

  // Jetzt-Zeit als "YYYY-MM-DDTHH:mm:ss" in Europe/Berlin (lexikalisch vergleichbar)
  function nowBerlin() {
    var s = new Intl.DateTimeFormat("sv-SE", {
      timeZone: CFG.TIMEZONE, year: "numeric", month: "2-digit", day: "2-digit",
      hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false
    }).format(new Date());
    return s.replace(" ", "T");
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
  // Seitengerüst: scrollender Inhalt, darunter fest am Kartenrand der schmale
  // Fortschrittsbalken (ohne Text, Rework 6.2) und die Kontaktzeile (6.3)
  function shell(progress) {
    app.innerHTML = "";
    var wrap = el("div", "study");
    statusBar = el("div", "offline-bar");
    statusBar.hidden = true;
    wrap.appendChild(statusBar);
    var page = el("div", "page study-page");
    wrap.appendChild(page);
    app.appendChild(wrap);
    app.appendChild(studyFoot(progress));
    window.scrollTo(0, 0);
    return page;
  }
  function studyFoot(progress) {
    var foot = el("div", "study-foot");
    if (progress) {
      var bar = el("div", "progress-track");
      bar.setAttribute("aria-hidden", "true");
      var fillEl = el("div", "progress-fill");
      fillEl.style.width = Math.round(progress * 100) + "%";
      bar.appendChild(fillEl);
      foot.appendChild(bar);
    }
    var mail = CFG.CONTACT_EMAIL;
    if (mail) {
      var line = el("p", "contact-line");
      line.appendChild(document.createTextNode("Technische Probleme? Schreib an "));
      var a = el("a", null, mail); a.href = "mailto:" + mail;
      line.appendChild(a); line.appendChild(document.createTextNode("."));
      foot.appendChild(line);
    }
    if (ctx.pilot) foot.appendChild(el("p", "pilot-line", "Pilotmodus: Antworten werden als Test gespeichert."));
    return foot;
  }

  function simplePage(title, text, extra) {
    var page = shell(null);
    page.appendChild(el("h1", "tp-h1", title));
    if (text) { var t = el("div", "tp-rich"); t.innerHTML = richHtml(tpl(text)); page.appendChild(t); }
    if (extra) page.appendChild(extra);
  }
  // Knopfzeile für Rahmenseiten (ein Hauptknopf)
  function buttonRow(label, onClick) {
    var row = el("div", "nav-row");
    var b = el("button", "btn", label);
    b.type = "button";
    b.addEventListener("click", function () { b.disabled = true; onClick(); });
    row.appendChild(b);
    return row;
  }

  // ── Statische Ansichten ────────────────────────────────
  // Warteseite mit Termin des nächsten Fragebogens. Im Pilotmodus mit Knopf zum Überspringen.
  function showWait(title, text, opens, closes, wave) {
    var t = String(text).replace(/%datum%/g, dayDe(opens)).replace(/%ende%/g, dayDe(closes));
    var extra = ctx.pilot ? buttonRow(F.pilotSkip, function () { pilotSkip[wave] = true; start(ctx.code); }) : null;
    simplePage(title, t, extra);
  }
  // Abschluss; G1/G2 bekommen die Schulung freiwillig angeboten (Welle POST)
  function showDone(title, text) {
    var p = ctx.progress || {};
    var offer = (p.grp === "G1" || p.grp === "G2") && !p.post_done;
    var body = text + (p.post_done ? "\n\n" + F.postDoneText : "") + (offer ? "\n\n" + F.offerText : "");
    simplePage(title, body, offer ? buttonRow(F.offerButton, function () { handoff(true); }) : null);
  }
  function showRegistrationClosed() { simplePage(F.waitTitle, F.registrationClosed); }
  // Übergang nach T0 für G2–G4: gruppenneutral, ohne Zurück (T0 ist abgeschlossen)
  function showTransition() {
    simplePage(F.transitionTitle, F.transitionText, buttonRow(F.transitionButton, function () { handoff(false); }));
  }

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
        history.replaceState(null, "", personalLink(code) + testFlags());
        start(code);
      } else {
        err.textContent = F.unknownCodeText;
      }
    });
    box.appendChild(label); box.appendChild(input); box.appendChild(err);
    // Zurück zur Anmeldung, z. B. wenn „Ich habe schon einen Code" versehentlich angetippt wurde
    var wrapC = el("div");
    wrapC.appendChild(box);
    var navC = el("div", "nav-row");
    var back = el("button", "btn secondary", "Zurück");
    back.type = "button";
    back.addEventListener("click", backToRegistration);
    navC.appendChild(back); navC.appendChild(btn);
    wrapC.appendChild(navC);
    simplePage(introTitle, introText, wrapC);
  }
  // Ohne gültigen Code von vorn mit der Anmeldung beginnen
  function backToRegistration() {
    ctx.code = null;
    history.replaceState(null, "", location.pathname + testFlags().replace(/^&/, "?"));
    if (afterWindow("R")) { showRegistrationClosed(); return; }
    runBlock(window.PAGES_R, window.PAGES_R.start);
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
    history.replaceState(null, "", personalLink(res.code) + testFlags()); // Code steht ab jetzt nur in der Adresse
    return true;
  }

  // ── Seiten-Engine ──────────────────────────────────────
  function waveAnswers(wave) {
    return memAnswers[wave] || (memAnswers[wave] = {});
  }
  // Antworten nur für die laufende Sitzung im Speicher (für „Zurück“); gesichert wird über den Code in Supabase
  var memAnswers = {};
  function saveWaveAnswers(wave, a) { memAnswers[wave] = a; }

  function runBlock(def, startId) {
    // Blöcke mit dynamischen Seiten (T1/T2: Erkennen nur gezeigte Muster)
    if (typeof def.build === "function") def = def.build(ctx);
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


  function pageById(def, id) {
    return def.pages.filter(function (p) { return p.id === id; })[0];
  }

  // Einfache Auszeichnung in Texten: **fett**, Leerzeile = neuer Absatz,
  // Zeilen mit „• “ = Aufzählung. Alles andere wird als Text maskiert.
  function richHtml(s) {
    var esc = function (t) { return String(t).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); };
    var inline = function (t) { return esc(t).replace(/\*\*(.+?)\*\*/g, "<b>$1</b>"); };
    return String(s).split(/\n\s*\n/).map(function (block) {
      var lines = block.split("\n");
      var head = [], items = [];
      lines.forEach(function (l) { (/^•\s/.test(l.trim()) ? items : head).push(l); });
      return (head.length ? '<p class="tp-p">' + head.map(inline).join("<br>") + "</p>" : "") +
        (items.length ? '<ul class="tp-list">' + items.map(function (l) { return "<li>" + inline(l.trim().replace(/^•\s*/, "")) + "</li>"; }).join("") + "</ul>" : "");
    }).join("");
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
    var page = shell(idx > 0 ? (idx + 1) / def.pages.length : null);
    var started = Date.now();
    var fields = {}; // key → {get, validate, errEl}

    if (p.onEnter) p.onEnter(ctx);

    var itemList = (typeof p.items === "function") ? p.items(ctx, answers) : p.items;
    itemList.forEach(function (item) {
      var node = renderItem(item, answers, fields, page);
      if (!node) return;
      if (item.key && fields[item.key]) { fields[item.key].wrapper = node; fields[item.key].item = item; node.setAttribute("data-key", item.key); }
      if (item.visibleIf) {
        var upd = function () {
          var v = currentValue(fields, answers, item.visibleIf.key);
          var show;
          if (typeof item.visibleIf.when === "function") show = item.visibleIf.when(v);
          else {
            var want = item.visibleIf.equals;
            show = Array.isArray(want) ? want.indexOf(v) >= 0 : v === want;
          }
          var appeared = node.hidden && show;
          node.hidden = !show;
          if (appeared && page.__ready) setTimeout(function () { node.scrollIntoView({ block: "nearest", behavior: "smooth" }); }, 30);
        };
        page.addEventListener("study:answer", upd);
      }
      page.appendChild(node);
    });

    // Prüft alle sichtbaren Felder. scroll=true beim Weiter: markieren und springen;
    // sonst nur Markierungen entfernen, die inzwischen erledigt sind.
    var missNote = null;
    function checkPage(scroll) {
      var bad = [];
      Object.keys(fields).forEach(function (k) {
        var f = fields[k];
        var box = f.wrapper || (f.errEl && f.errEl.parentNode);
        var isHidden = f.wrapper && f.wrapper.hidden;
        var msg = isHidden ? "" : f.validate();
        if (scroll) {
          f.errEl.textContent = msg || "";
          if (box && box.classList) box.classList.toggle("missing", !!msg);
        } else if (box && box.classList && box.classList.contains("missing") && !msg) {
          box.classList.remove("missing"); f.errEl.textContent = "";
        }
        if (msg && box) bad.push(box);
      });
      var shown = page.querySelectorAll(".field.missing").length;
      if (scroll || missNote) {
        if (!missNote) { missNote = el("div", "miss-note"); missNote.setAttribute("role", "alert"); page.insertBefore(missNote, page.firstChild.nextSibling); }
        missNote.hidden = shown < 2;
        missNote.textContent = shown === 1 ? "Es fehlt noch eine Antwort." : "Es fehlen noch " + shown + " Antworten.";
      }
      if (scroll && bad.length) bad[0].scrollIntoView({ block: "center", behavior: "smooth" });
      return bad.length === 0;
    }
    page.addEventListener("study:answer", function () { checkPage(false); });
    page.addEventListener("input", function () { checkPage(false); });

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

        // Validierung (Rework 6.1): Frage rot umrahmen, Meldung darunter,
        // oben die Zahl der fehlenden Antworten, zur ersten fehlenden springen
        if (!checkPage(true)) return;

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
            var res = await window.DB.uploadScreenshot(ctx.code, def.wave, list[fi], fi + 1);
            if (res.ok) paths.push(res.path); else failed++;
          }
          btn.disabled = false;
          btn.textContent = prevLabel;
          answers[uploadKeys[u]] = { hochgeladen: paths, fehlgeschlagen: failed };
          if (failed > 0) {
            f.errEl.textContent = "Mindestens eine Datei konnte nicht hochgeladen werden. Du kannst ohne Screenshot weitermachen.";
          }
        }

        var keepHidden = function (f) { return f.item && f.item.saveHidden; };
        Object.keys(fields).forEach(function (k) {
          if (fields[k].upload || (hidden(fields[k]) && !keepHidden(fields[k]))) return;
          answers[k] = fields[k].get();
        });
        saveWaveAnswers(def.wave, answers);

        var secs = (Date.now() - started) / 1000;
        var skip = p.skipEventKeys || [];
        Object.keys(fields).forEach(function (k) {
          var f = fields[k];
          if (skip.indexOf(k) >= 0) return;
          // ausgeblendet: nur speichern, wenn das Feld Text behalten soll und welchen hat
          if (hidden(f) && !(keepHidden(f) && answers[k])) return;
          if (answers[k] === undefined) return;
          // Zusatzangaben (Muster, App, Bild, Position) mit in die Zeile
          var val = f.item && f.item.meta ? Object.assign({ wert: answers[k] }, f.item.meta) : answers[k];
          window.DB.saveEvent(ctx.code, def.wave, p.id, k, val, secs, ctx.pilot);
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
    page.__ready = true; // ab jetzt: neu eingeblendete Felder ins Bild scrollen
    addQuestionHint(page);
  }

  // Seiten mit großem Screen: Solange die erste Frage darunter nicht zu sehen ist, schwebt unten
  // ein Hinweis „↓ Zur Frage“ (Tippen scrollt hin). Er verschwindet, sobald die Frage im Bild ist (18.10.).
  function addQuestionHint(page) {
    var scr = page.querySelector(".rec-stage");
    if (!scr || !window.IntersectionObserver) return;
    var q = Array.prototype.filter.call(page.querySelectorAll(".field"), function (f) {
      return !f.hidden && (scr.compareDocumentPosition(f) & 4);
    })[0];
    if (!q) return;
    var pill = el("button", "q-hint", "↓ Zur Frage");
    pill.type = "button";
    pill.hidden = true;
    pill.addEventListener("click", function () { q.scrollIntoView({ behavior: "smooth", block: "start" }); });
    app.appendChild(pill);
    var io = new IntersectionObserver(function (es) {
      if (es[0].isIntersecting) { pill.remove(); io.disconnect(); }
      else pill.hidden = false;
    }, { threshold: 0.6 });
    io.observe(q.firstElementChild || q);
  }

  // ── Element-Renderer ───────────────────────────────────
  function renderItem(item, answers, fields, page) {
    switch (item.type) {

      case "title": return el("h1", "tp-h1", tpl(byOsText(item)));
      case "text": { var t = el("div", "tp-rich"); t.innerHTML = richHtml(tpl(byOsText(item))); return t; }
      case "subtitle": return el("h2", "tp-h2", tpl(byOsText(item)));

      case "steps": {
        var list = item.byOs ? (item.byOs[ctx.os || "ios"] || item.byOs.ios) : item.steps;
        var ol = el("ol", "steps");
        (list || []).forEach(function (s) { var li = el("li"); li.innerHTML = richHtml(tpl(s)).replace(/^<p class="tp-p">|<\/p>$/g, ""); ol.appendChild(li); });
        return ol;
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
            return item.required && val.v == null ? MISSING : "";
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
            return item.required && sel.length === 0 ? MISSING : "";
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
            if (v === "") return item.required ? MISSING : "";
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
            return item.required && !ti.value.trim() ? MISSING : "";
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
            var v = ta.value.trim();
            if (item.required && !v) return MISSING;
            if (v && item.minWords && v.split(/\s+/).length < item.minWords) return item.minWordsMsg || MISSING;
            return "";
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
            if (item.required && !v) return MISSING;
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
            if (item.required && !sel.value) return MISSING;
            if (otherS && !otherS.hidden && item.textRequired && !otherS.value.trim()) return "Bitte gib an, welche.";
            return "";
          }
        };
        return boxS;
      }

      case "hint": {
        // kleiner grauer Hinweis, z. B. zum Einsprechen langer Antworten (touchOnly: nur auf Touch-Geräten)
        if (item.touchOnly && !isTouch()) return null;
        return el("p", "tp-hint", tpl(item.text));
      }

      case "desktopqr": {
        // Nur am Computer (kein Touch, Fenster breiter als 700 px): Hinweis und QR-Code
        // mit dem persönlichen Link, damit der Screenshot am Handy hochgeladen werden kann
        if (isTouch() || window.innerWidth <= 700 || !ctx.code) return null;
        var boxQ = el("div", "desk-qr");
        var tq = el("div", "tp-rich"); tq.innerHTML = richHtml(tpl(item.text)); boxQ.appendChild(tq);
        var link = personalLink(ctx.code) + testFlags();
        if (window.QR) {
          var qr = el("div", "desk-qr-code");
          qr.innerHTML = window.QR.svg(link, { label: item.linkLabel });
          boxQ.appendChild(qr);
        }
        boxQ.appendChild(el("div", "desk-qr-label", item.linkLabel));
        boxQ.appendChild(el("div", "linkbox-url", link));
        return boxQ;
      }

      case "screen": {
        var entry = item.entry || {};
        if (window.RECOGNITION.render) {
          var stage = window.RECOGNITION.render(entry, { mini: !!item.mini });
          if (!item.mini) {
            if (!entry.ctx) return stage;
            // Kontextsatz über dem Screen (v4: Autoplay „Du hast gerade weitergescrollt.“)
            var wrapC2 = el("div", "rec-with-ctx");
            wrapC2.appendChild(el("p", "rec-ctx", entry.ctx));
            wrapC2.appendChild(stage);
            return wrapC2;
          }
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

  function fire(page) {
    page.dispatchEvent(new CustomEvent("study:answer"));
  }
  function currentValue(fields, answers, key) {
    return fields[key] ? fields[key].get() : answers[key];
  }

  // ── Router ─────────────────────────────────────────────
  // Statische Fortsetzungs-Zuordnung: letzte gespeicherte Seite → nächste Seite
  var RESUME_R = { "R-01": "R-02", "R-02": "R-03", "R-03": "R-04", "R-04": "R-05", "R-05": "R-05", "R-X": "R-X" };
  var pilotSkip = {}; // Pilot: übersprungene Wartezeiten (nur in dieser Sitzung)

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
  function built(def) { return typeof def.build === "function" ? def.build(ctx) : def; }

  // Übergabe an die Intervention (boost/): Welche Teile gezeigt werden (Schulung,
  // neutraler Teil, Plan, Passwort-Schulung), entscheidet boost/app.js anhand der
  // Gruppe aus progress() – die Adresse verrät die Gruppe nicht. nach=1: die
  // freiwillige Schulung nach T2 (Welle POST). replace(), damit „Zurück“ im
  // Browser nicht auf eine leere Übergabe führt.
  function handoff(post) {
    var ret = personalLink(ctx.code) + testFlags();
    location.replace("boost/index.html?code=" + encodeURIComponent(ctx.code) +
      "&apps=" + encodeURIComponent((ctx.apps || []).join(",")) + testFlags() + (post ? "&nach=1" : "") +
      "&return=" + encodeURIComponent(ret));
  }

  function ms(iso) { return iso ? Date.parse(iso) : NaN; }

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
    updatePilotBar();

    var last = (p.last_pages || {});
    var now = window.DB.now();

    // Block R
    if (!p.r_done) {
      if (last.R === "R-X") { runBlock(window.PAGES_R, "R-X"); return; }
      if (afterWindow("R")) { showRegistrationClosed(); return; }
      var resumeAt = last.R ? (RESUME_R[last.R] || window.PAGES_R.start) : window.PAGES_R.start;
      runBlock(window.PAGES_R, resumeAt);
      return;
    }

    // T0: direkt nach der Anmeldung
    if (!p.t0_done) {
      if (afterWindow("T0")) { simplePage(F.t0MissedTitle, F.t0MissedText); return; }
      var d0 = built(window.PAGES_T0);
      runBlock(d0, resumeNext(d0, last.T0));
      return;
    }

    // Zuteilung direkt nach T0 (serverseitig, idempotent)
    if (!p.grp) {
      var ag = await window.DB.assignGroup(code, ctx.pilot && /^G[1-4]$/.test(forceGroup) ? forceGroup : null);
      if (!ag.ok) { simplePage("Keine Verbindung", F.noConnectionRegister); return; }
      start(code); // Zeitplan und Gruppe neu laden
      return;
    }

    // Intervention (G2–G4), am selben Tag. Wer sie abbricht und erst wiederkommt,
    // wenn T1 schon offen ist, macht mit T1 weiter (Zeitplan ab der Zuteilung).
    var needsIntervention = p.grp !== "G1" && !p.intervention_at;
    if (needsIntervention && (ctx.pilot || !(now >= ms(p.t1_opens)))) {
      if (p.boost_done) { handoff(false); return; } // Schulung fertig, neutraler Teil bzw. Plan fehlt noch
      showTransition();
      return;
    }

    // Nur Pilot: Rückmeldung der Testpersonen direkt nach der Intervention
    if (ctx.pilot && p.grp !== "G1" && !last.FB) {
      runBlock(window.PAGES_FB, window.PAGES_FB.start);
      return;
    }

    // T1: Montag nach der ersten vollen Woche, 7 Tage offen
    var t1Missed = !p.t1_done && !ctx.pilot && now > ms(p.t1_closes);
    if (!p.t1_done && !t1Missed) {
      if (now < ms(p.t1_opens) && !(ctx.pilot && pilotSkip.T1)) {
        showWait(F.waitTitle, F.waitT1Text, p.t1_opens, p.t1_closes, "T1");
        return;
      }
      var d1 = built(window.PAGES_T1);
      runBlock(d1, resumeNext(d1, last.T1));
      return;
    }
    if (t1Missed && last.T1 !== "T1-VERPASST") {
      // als verpasst markieren (einmal), T2 bleibt erreichbar
      window.DB.saveEvent(code, "T1", "T1-VERPASST", "T1_VERPASST", true, null, ctx.pilot);
    }

    // T2: Montag nach der vierten vollen Woche, 7 Tage offen
    if (!p.t2_done) {
      var t2Missed = !ctx.pilot && now > ms(p.t2_closes);
      if (t2Missed) { showDone(F.t2MissedTitle, F.t2MissedText); return; }
      if (now < ms(p.t2_opens) && !(ctx.pilot && pilotSkip.T2)) {
        if (t1Missed) showWait(F.t1MissedTitle, F.t1MissedText, p.t2_opens, p.t2_closes, "T2");
        else showWait(F.waitTitle, F.waitT2Text, p.t2_opens, p.t2_closes, "T2");
        return;
      }
      var d2 = built(window.PAGES_T2);
      runBlock(d2, resumeNext(d2, last.T2));
      return;
    }

    showDone(F.doneTitle, F.doneText);
  }

  // ── Nur Pilot: Testgruppe vor dem Start wählen ─────────
  // Leiste über der App, solange noch keine Gruppe zugeteilt ist. Die Wahl landet als
  // &group= in der Adresse und wird bei der Zuteilung nach T0 an assign_group übergeben
  // (p_force, nur für Pilot-Codes). „Zufall“ = normale Blockrandomisierung.
  function updatePilotBar() {
    var bar = document.getElementById("pilot-group-bar");
    var show = ctx.pilot && !(ctx.progress && ctx.progress.grp);
    if (!show) { if (bar) bar.remove(); return; }
    if (!bar) {
      bar = el("div", "pilot-group-bar");
      bar.id = "pilot-group-bar";
      app.parentNode.insertBefore(bar, app);
    }
    bar.innerHTML = "";
    bar.appendChild(el("span", "pilot-group-label", "Test: Gruppe"));
    ["", "G1", "G2", "G3", "G4"].forEach(function (g) {
      var b = el("button", "pilot-group-btn" + (forceGroup === g || (!g && !/^G[1-4]$/.test(forceGroup)) ? " active" : ""), g || "Zufall");
      b.type = "button";
      b.addEventListener("click", function () {
        forceGroup = g;
        var q = new URLSearchParams(location.search);
        if (g) q.set("group", g); else q.delete("group");
        history.replaceState(null, "", location.pathname + "?" + q.toString());
        updatePilotBar();
      });
      bar.appendChild(b);
    });
  }

  // ── Einstieg (Abschnitt 3 des Auftrags) ────────────────
  function boot() {
    clearOldStorage();
    updatePilotBar();
    var urlCode = (params.get("c") || "").trim().toUpperCase();

    if (urlCode) {           // persönlicher Link: dort weiter, wo die Person ist
      start(urlCode);
    } else {                 // kein Code in der Adresse → neue Anmeldung
      if (afterWindow("R")) { showRegistrationClosed(); return; }
      runBlock(window.PAGES_R, window.PAGES_R.start);
    }
  }

  boot();
})();
