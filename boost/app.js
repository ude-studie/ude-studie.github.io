/*
 * app.js – Ablauf, Zustände, Speichern und Rücksprung der Schulung.
 * Texte stehen in content.js.
 *
 * Aufruf: index.html?code=…&apps=ig,tt,sc,fb,x&return=…[&pilot=1]
 * Antworten gehen als events (wave=BOOST) ins Studien-Backend (../db.js);
 * „Weiter zum Fragebogen" setzt boost_done und springt zu return zurück.
 *
 * Ablauf je Muster in vier Schritten (state.sub):
 *   look     nur der Screen
 *   ask      Screen klein, darunter die Frage; der Button ist die Handlung
 *   react    Screen groß, die App reagiert, rote Umrandung, Hinweis darunter
 *   explain  Erklärung (Was, Wirkung, Zweck)
 * Muster 6 beginnt direkt mit ask (die Auswahl im Screen ist die Antwort).
 *
 * Vorschau (preview.html): index.html?preview=<seite>[&apps=…][&variant=<app>][&export=1]
 *   <seite> = intro, apps, p1L/p1A/p1B/p1E … p8E, W1A, W1B, W2A, W2B, einordnung, zusammenfassung
 *   (L = ansehen, A = Frage, B = Reaktion mit Markierung, E = Erklärung)
 *   variant=<app> zeigt das Muster in dieser App (oder deren Fallback).
 *   export=1 blendet alles Persönliche aus (für statische Ersatzbilder).
 */
(function () {
  "use strict";

  var C = window.CONTENT;
  var STUDY_APPS = C.appOrder; // Instagram, TikTok, Snapchat
  var STORE_KEY = "boost-state-" + C.version; // boost-v4: Schritt-Navigation, ohne Bewertung (08.10.)
  var app = document.getElementById("app");

  // ── Aufrufparameter ────────────────────────────────────
  var params = new URLSearchParams(location.search);
  var urlCode = (params.get("code") || "").trim();
  var returnUrl = safeUrl(params.get("return"));
  var pilotFlag = params.get("pilot") === "1";
  var urlApps = parseApps(params.get("apps"));
  var previewKey = params.get("preview");
  var exportMode = params.get("export") === "1";

  // apps=ig,tt,… → bekannte Kürzel in fester Reihenfolge, Unbekanntes wird ignoriert
  function parseApps(raw) {
    var got = String(raw || "").toLowerCase().split(",").map(function (s) { return s.trim(); });
    return C.appOrder.filter(function (k) { return got.indexOf(k) >= 0; });
  }

  function safeUrl(raw) {
    if (!raw) return null;
    try {
      var u = new URL(raw, location.href);
      return (u.protocol === "https:" || u.protocol === "http:") ? u.href : null;
    } catch (e) { return null; }
  }

  function patternDef(id) { return C.patterns.filter(function (p) { return p.id === id; })[0]; }
  function appLabel(key) { return (C.apps[key] || {}).label || key; }

  // ── Speichern ins Studien-Backend (db.js, geladen aus ../db.js) ────────
  // Eine Zeile je abgeschlossener Seite, wave=BOOST. In der Vorschau oder
  // ohne db.js (eigenständiger Aufruf) passiert nichts.
  function dbSave(page, key, value, seconds) {
    if (previewKey || !window.DB || !state.code) return;
    window.DB.saveEvent(state.code, "BOOST", page, key, value, seconds, pilotFlag, C.version);
  }

  // ── Zuordnung Muster × App ─────────────────────────────
  // Je Muster die erste App aus order, die die Person nutzt. Ist dafür kein Screen gebaut,
  // greift ein Fallback: immer der Instagram-Screen; nur falls es keinen gibt, die nächste gebaute App in der Reihe.
  function fallbackFor(p, target) {
    if (p.variants.ig) return "ig";
    var o = p.order, i = o.indexOf(target);
    for (var k = 1; k <= o.length; k++) {
      var a = o[(i + k) % o.length];
      if (p.variants[a]) return a;
    }
    return Object.keys(p.variants)[0];
  }
  // screen = ID der gezeigten Variante (bei Fallback eine andere App als app)
  function entryFor(p, target) {
    if (p.variants[target]) return { id: p.id, app: target, screen: target };
    return { id: p.id, app: target, fallback: true, screen: fallbackFor(p, target) };
  }
  function assignPatterns(apps) {
    var shown = [];
    C.patterns.forEach(function (p) {
      if (p.always) { shown.push({ id: p.id, app: "lock", screen: "lock" }); return; }
      var target = p.order.filter(function (a) { return apps.indexOf(a) >= 0; })[0];
      if (target) shown.push(entryFor(p, target));
    });
    return shown;
  }

  // Ablenker für die Apps der Person: reihum über die Apps, je App bis zu drei Elemente
  function distractorList(apps) {
    var list = STUDY_APPS.filter(function (a) { return apps.indexOf(a) >= 0; });
    if (!list.length) list = ["ig"];
    var out = [];
    for (var i = 0; i < 3; i++) {
      var a = list[i % list.length], pool = C.distractors[a], j = Math.floor(i / list.length);
      out.push({ k: i + 1, app: a, def: pool[j % pool.length] });
    }
    return out;
  }
  // Screen eines Ablenkers: Daten eines Muster-Screens, ohne dessen Markierung
  function resolveDistractor(d) {
    var base = resolvePattern({ id: d.def.base.pattern, app: d.app, screen: d.def.base.variant });
    var p = Object.assign({}, base, {
      isDistractor: true, ctxA: d.def.ctx, ctxB: d.def.ctx, markLabel: "Element", fallback: false,
      data: JSON.parse(JSON.stringify(base.data))
    });
    p.data.mark = null;
    (p.data.rows || []).forEach(function (r) { r.mark = false; });
    return p;
  }
  // Zielelement im Ausgangszustand: aus C.markA (Muster) bzw. dem Ablenker
  function markSpec(pg) {
    if (pg.type === "distractor") return pg.dist.markA;
    return C.markA[pg.pattern.id + ":" + pg.pattern.screenApp] || null;
  }
  function clearMarkA(body) {
    body.querySelectorAll(".mark").forEach(function (el) { el.remove(); });
    body.querySelectorAll(".mark-a-target").forEach(function (el) { el.removeAttribute("data-mark"); el.classList.remove("mark-a-target"); });
    body.querySelectorAll(".mark-zone-bottom").forEach(function (el) { el.remove(); });
  }
  function applyMarkA(body, pg) {
    clearMarkA(body);
    var sp = markSpec(pg), t = null;
    if (!sp) return;
    if (sp.zone === "bottom") {
      t = document.createElement("div");
      t.className = "mark-zone-bottom";
      (body.querySelector(".feed") || body).appendChild(t);
    } else {
      t = body.querySelectorAll(sp.sel)[sp.n || 0];
    }
    if (!t) return;
    t.classList.add("mark-a-target");
    t.setAttribute("data-mark", sp.place || "below");
  }

  // Muster mit der gewählten Variante zusammensetzen
  function resolvePattern(s) {
    var def = patternDef(s.id);
    var screenApp = s.screen || s.app;
    var v = def.variants[screenApp];
    var p = Object.assign({}, def, v, { screenApp: screenApp, targetApp: s.app, fallback: !!s.fallback });
    delete p.variants; delete p.pools;
    if (def.always) {
      p.data = Object.assign({}, v.data, { items: composeLock(def, state.apps, state.code) });
    }
    return p;
  }

  // Sperrbildschirm: 2 Meldungen von Menschen, 5 von der App, nur aus genutzten Apps, fest nach Code
  function hashCode(s) {
    var h = 2166136261;
    for (var i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
    return h >>> 0;
  }
  function seededRandom(seed) {
    return function () {
      seed = (seed + 0x6D2B79F5) >>> 0;
      var t = seed;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  function composeLock(def, apps, code) {
    var v = def.variants.lock.data;
    var rnd = seededRandom(hashCode(String(code || "")));
    var used = (apps || []).filter(function (a) { return def.pools[a]; });
    if (!used.length) used = ["ig"];
    function shuffled(list) {
      var l = list.slice();
      for (var i = l.length - 1; i > 0; i--) { var j = Math.floor(rnd() * (i + 1)); var t = l[i]; l[i] = l[j]; l[j] = t; }
      return l;
    }
    function pick(kind, count) {
      var bags = {}, out = [], start = Math.floor(rnd() * used.length), k = 0;
      used.forEach(function (a) { bags[a] = shuffled(def.pools[a][kind]); });
      while (out.length < count && k < count * used.length * 4) {
        var a = used[(start + k) % used.length];
        k++;
        if (bags[a].length) out.push({ app: a, text: bags[a].shift() });
      }
      return out;
    }
    var humans = pick("human", v.humanPositions.length);
    var others = pick("app", v.times.length - v.humanPositions.length);
    return v.times.map(function (time, i) {
      var isHuman = v.humanPositions.indexOf(i + 1) >= 0;
      var m = isHuman ? humans.shift() : others.shift();
      return { app: m.app, text: m.text, time: time, human: isHuman };
    });
  }

  // ── Seitenfolge ────────────────────────────────────────
  var pages = [];
  function buildPages() {
    // Einleitung und App-Abfrage nur noch, wenn die Schulung ohne Apps aufgerufen wird
    pages = state.appsSource === "param" ? [] : [{ type: "intro", key: "intro" }, { type: "apps", key: "apps" }];
    var shown = state.shown || [];
    // Drei Ablenker nach dem 2., 4. und 6. Muster; bei weniger Mustern gleichmäßig verteilt, nie an erster Stelle
    var n = shown.length, dists = distractorList(state.apps || []);
    var after = n >= 6 ? [2, 4, 6] : [1, 2, 3].map(function (k) { return Math.max(1, Math.round(k * n / 4)); });
    var seq = [], di = 0;
    shown.forEach(function (s, i) {
      seq.push({ type: "pattern", key: "p" + s.id, shown: s, pattern: resolvePattern(s) });
      while (di < dists.length && after[di] === i + 1) {
        var d = dists[di];
        seq.push({ type: "distractor", key: "d" + d.k, k: d.k, dist: d.def, distApp: d.app, pattern: resolveDistractor(d) });
        di++;
      }
    });
    seq.forEach(function (pg, j) { pg.pos = j + 1; pg.index = j + 1; pg.total = seq.length; });
    pages = pages.concat(seq);
    C.recognition.forEach(function (r, i) { pages.push({ type: "recognition", key: r.id, item: r, index: i + 1 }); });
    pages.push({ type: "einordnung", key: "einordnung" });
    pages.push({ type: "zusammenfassung", key: "zusammenfassung" });
  }

  // ── Zustand ────────────────────────────────────────────
  var state;
  if (previewKey) {
    state = previewState(previewKey);
  } else {
    state = load();
    if (!state || state.version !== C.version || (urlCode && state.code && state.code !== urlCode)) state = fresh();
    if (urlCode) state.code = urlCode;
    if (state.page > 0 && !state.code) state = fresh();
    if (state.page > 1 && !state.shown) state = fresh();
    if (state.sub === "A") state.sub = "look";
    if (state.sub === "B") state.sub = "react";
    if (!state.shown && urlApps.length) {
      // Apps stehen seit der Anmeldung fest (Rework 07.10.): Schulung beginnt direkt mit dem ersten Screen
      state.apps = urlApps.slice();
      state.appsSource = "param";
      state.shown = assignPatterns(state.apps);
      state.startedAt = isoNow();
      dbSave("start", "APPS", { apps: state.apps, source: state.appsSource, shown: state.shown }, null);
    }
    buildPages();
  }
  var picks = [];   // laufende Mehrfachauswahl (Apps, Muster 6, W1) vor dem Tipp

  function fresh() {
    return {
      version: C.version,
      code: urlCode || "",
      apps: null,        // genutzte Apps (Kürzel), nach Bildschirm 2
      appsSource: null,  // "param" oder "asked"
      shown: null,       // gezeigte Muster: [{ id, app, fallback?, screen? }]
      startedAt: null,
      finishedAt: null,
      page: 0,
      sub: "look",       // Schritt auf der Seite: look, ask, react, explain
      maxPage: 0,        // weiteste erreichte Seite; davor nur Ansicht (Zurück, Antworten gesperrt)
      maxSub: "look",    // Schritt auf der weitesten Seite, um dorthin zurückzukehren
      pageStart: Date.now(),
      bStart: null,
      patterns: {},      // id -> Ergebnis
      est: {},           // Seiten-Key -> Einschätzung { a, b, c } (gespeichert mit wave T0)
      recognition: {},   // id -> Ergebnis
      pageSeconds: {}
    };
  }
  function load() {
    try { return JSON.parse(sessionStorage.getItem(STORE_KEY)); } catch (e) { return null; }
  }
  function save() {
    if (previewKey) return;
    if (state.maxPage == null || state.page > state.maxPage) { state.maxPage = state.page; state.maxSub = state.sub; }
    else if (state.page === state.maxPage && stepIndex(state.page, state.sub) > stepIndex(state.page, state.maxSub)) state.maxSub = state.sub;
    try { sessionStorage.setItem(STORE_KEY, JSON.stringify(state)); } catch (e) { /* ohne Zwischenstand weiter */ }
  }
  // Schritte je Seite (Rework 08.10.): Zurück geht immer genau einen Schritt zurück,
  // auch innerhalb eines Screens; Weiter führt Schritt für Schritt bis zur aktuellen Stelle
  function stepsOf(pg) {
    if (!pg) return ["look"];
    if (pg.type === "pattern") return ["est", "ask", "react", "explain"];
    if (pg.type === "distractor") return ["est", "dres"];
    if (pg.type === "recognition") return ["look", "react"];
    return ["look"];
  }
  function stepIndex(page, sub) {
    var i = stepsOf(pages[page]).indexOf(sub || "look");
    return i < 0 ? 0 : i;
  }
  // Ansichtsmodus: ein schon abgeschlossener Schritt, zu dem man zurückgegangen ist
  function isReview() {
    if (previewKey || state.maxPage == null) return false;
    return state.page < state.maxPage ||
      (state.page === state.maxPage && stepIndex(state.page, state.sub) < stepIndex(state.page, state.maxSub));
  }
  function setStep(page, sub) {
    state.page = Math.max(0, Math.min(page, pages.length - 1));
    state.sub = sub;
    state.pageStart = Date.now();
    state.bStart = null;
    // Ansicht einer früheren Auswahl (Muster 6, Wiederfinden 1): die damalige Auswahl zeigen
    var pg = pages[state.page], r = null;
    if (pg.type === "pattern" && pg.pattern.type === "multi") r = state.patterns[pg.pattern.id];
    if (pg.type === "recognition") r = state.recognition[pg.item.id];
    picks = isReview() && r && r.selected ? r.selected.slice() : [];
    save();
    render();
  }
  function stepForward() {
    var s = stepsOf(pages[state.page]), i = stepIndex(state.page, state.sub);
    if (i < s.length - 1) setStep(state.page, s[i + 1]);
    else setStep(state.page + 1, stepsOf(pages[state.page + 1])[0]);
  }
  function stepBack() {
    var s = stepsOf(pages[state.page]), i = stepIndex(state.page, state.sub);
    if (i > 0) { setStep(state.page, s[i - 1]); return; }
    var ps = stepsOf(pages[state.page - 1]);
    setStep(state.page - 1, ps[ps.length - 1]);
  }
  function secondsSince(t) { return Math.max(0, Math.round((Date.now() - t) / 1000)); }
  function isoNow() { return new Date().toISOString().replace(/\.\d{3}Z$/, "Z"); }

  function goto(i) {
    state.page = Math.max(0, Math.min(i, pages.length - 1));
    var max = state.maxPage == null ? state.page : state.maxPage;
    if (state.page === max && state.maxSub) state.sub = state.maxSub; // zurück an der aktuellen Stelle
    else state.sub = stepsOf(pages[state.page])[0];
    state.pageStart = Date.now();
    state.bStart = null;
    picks = [];
    save();
    render();
  }

  // ── Auswertung einzelner Antworten ─────────────────────
  function multiResult(p, selected) {
    var humans = [];
    p.data.items.forEach(function (it, i) { if (it.human) humans.push(i + 1); });
    var hits = selected.filter(function (n) { return humans.indexOf(n) >= 0; }).length;
    return { selected: selected.slice().sort(num), humans: humans, hits: hits, falseAlarms: selected.length - hits };
  }
  // Wiederfinden 1 zur Laufzeit: nur Stellen zu gezeigten Mustern (plus
  // Ablenker), fortlaufend nummeriert; Elemente nicht gezeigter Muster
  // verschwinden aus dem Screen (d.refresh entfällt z. B. ohne Muster 2).
  function w1Runtime(it) {
    var ids = (state.shown || []).map(function (s) { return s.id; });
    var active = it.spotDefs.filter(function (d) { return d.pattern == null || ids.indexOf(d.pattern) >= 0; });
    var spots = {}, meta = [];
    active.forEach(function (d, i) {
      spots[d.key] = i + 1;
      meta.push({ n: i + 1, key: d.key, pattern: d.pattern, label: d.label });
    });
    var data = Object.assign({}, it.data, { spots: spots });
    if (ids.indexOf(2) < 0) data.refresh = null;
    return {
      data: data,
      meta: meta,
      targets: meta.filter(function (m) { return m.pattern != null; }).map(function (m) { return m.n; })
    };
  }
  function spotsResult(it, selected) {
    var rt = w1Runtime(it);
    var hits = selected.filter(function (n) { return rt.targets.indexOf(n) >= 0; }).length;
    var falseAlarms = selected.length - hits;
    var patterns = {};
    rt.meta.forEach(function (m) { if (m.pattern) patterns[m.n] = m.pattern; });
    return { id: it.id, selected: selected.slice().sort(num), targets: rt.targets,
             spotPatterns: patterns, hits: hits, falseAlarms: falseAlarms, seconds: null };
  }
  function num(a, b) { return a - b; }
  function patternCorrect(r) {
    if (!r) return false;
    if (r.humans) return r.hits === r.humans.length && r.falseAlarms === 0;
    return !!r.isCorrect;
  }

  // ── Vorschau-Zustand ───────────────────────────────────
  function previewState(key) {
    var s = fresh();
    state = s;
    s.code = urlCode || "VORSCHAU";
    s.startedAt = "2026-10-12T10:31:04Z";
    s.apps = urlApps.length ? urlApps : ["ig", "tt", "sc"];
    s.appsSource = "param";
    s.shown = assignPatterns(s.apps);
    var m = /^(p(\d+)|W\d+|d\d)([LKABER])$/.exec(key);
    var pageKey = m ? m[1] : key;
    var variant = params.get("variant");
    if (m && m[2]) {
      // gewünschtes Muster in gewünschter App erzwingen (auch wenn es für diese Apps sonst entfiele)
      var def = patternDef(Number(m[2]));
      if (def) {
        var current = s.shown.filter(function (e) { return e.id === def.id; })[0];
        var entry = def.always ? { id: def.id, app: "lock", screen: "lock" } : entryFor(def, variant || (current && current.app) || def.order[0]);
        s.shown = s.shown.filter(function (e) { return e.id !== def.id; });
        s.shown.push(entry);
        s.shown.sort(function (x, y) { return x.id - y.id; });
      }
    }
    buildPages();
    var forced = Number(params.get("answer")) || 0;
    pages.forEach(function (pg) {
      if (pg.type !== "pattern") return;
      var p = pg.pattern;
      if (p.type === "multi") {
        var sel = exportMode ? p.data.items.map(function (it, i) { return it.human ? i + 1 : 0; }).filter(Boolean) : [1, 2, 4];
        s.patterns[p.id] = Object.assign({ id: p.id, name: p.key }, multiResult(p, sel), { secondsA: 0, secondsB: 0 });
      } else {
        var ans = forced || (p.correct === 1 ? 2 : 1);
        s.patterns[p.id] = { id: p.id, name: p.key, answer: ans, correct: p.correct, isCorrect: ans === p.correct, secondsA: 0, secondsB: 0 };
      }
    });
    C.recognition.forEach(function (it) {
      if (it.type === "spots") s.recognition[it.id] = spotsResult(it, [1, 2, 4]);
      else s.recognition[it.id] = w2Result(it, w2Cards(it), ["human", "app", "human"]);
    });
    var phaseOf = { L: "est", K: "ak", A: "ask", B: "react", E: "explain", R: "dres" };
    s.sub = m ? phaseOf[m[3]] : "look";
    if (m && /^W/.test(m[1])) s.sub = m[3] === "B" ? "react" : "ask"; // Wiedererkennen: A Frage, B Rückmeldung
    s.page = Math.max(0, pages.findIndex(function (pg) { return pg.key === pageKey; }));
    if (s.sub === "look" || s.sub === "ask" || s.sub === "est" || s.sub === "ak") {
      // Zustand A: noch keine Antwort auf dieser Seite
      var pg = pages[s.page];
      if (pg.pattern) delete s.patterns[pg.pattern.id];
      if (pg.item) delete s.recognition[pg.item.id];
    }
    return s;
  }

  // ── Hilfen ─────────────────────────────────────────────
  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  function fill(tpl, vals) {
    return String(tpl).replace(/\{(\w+)\}/g, function (_, k) { return vals[k] != null ? vals[k] : ""; });
  }
  function paras(list) {
    return list.map(function (t) { return "<p>" + esc(t) + "</p>"; }).join("");
  }
  function joinList(nums) {
    if (nums.length <= 1) return nums.join("");
    return nums.slice(0, -1).join(", ") + C.ui.listAnd + nums[nums.length - 1];
  }
  function assetAttr(id) {
    var g = C.assets[id] || "#888";
    return ' data-asset="' + esc(id) + '" style="background:' + esc(g) + '"';
  }
  // Echte Bilder einhängen: assets/<kennung>.jpg oder .png, falls vorhanden.
  var assetCache = {};
  function applyAssets(root) {
    root.querySelectorAll("[data-asset]").forEach(function (el) {
      var id = el.getAttribute("data-asset");
      if (assetCache[id] === false || assetCache[id] === "pending") return;
      if (assetCache[id]) { setBg(el, assetCache[id]); return; }
      assetCache[id] = "pending";
      tryImg(id, ["jpg", "png"], function (src) {
        assetCache[id] = src || false;
        if (src) document.querySelectorAll('[data-asset="' + id + '"]').forEach(function (e) { setBg(e, src); });
      });
    });
  }
  function setBg(el, src) {
    el.style.background = 'center / cover no-repeat url("' + src + '")';
    el.classList.add("asset-loaded"); // Avatare: Initiale ausblenden, Foto zeigen
  }
  function tryImg(id, exts, done) {
    if (!exts.length) return done(null);
    var src = "assets/" + id + "." + exts[0];
    var img = new Image();
    img.onload = function () { done(src); };
    img.onerror = function () { tryImg(id, exts.slice(1), done); };
    img.src = src;
  }
  // Profilbild: rundes Foto (assets/av-<name>.jpg, CC0), sonst farbiger
  // Kreis mit Anfangsbuchstabe als Rückfall (z. B. Gruppen, Nebenfiguren)
  function avatar(name, extra) {
    var clean = String(name || "").replace(/^@/, "").replace(/\s*·.*$/, "");
    var slug = clean.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    var n = hashCode(clean) % 6;
    return '<span class="avatar avc' + n + (extra ? " " + extra : "") +
      '" data-asset="av-' + esc(slug) + '" aria-hidden="true">' + esc(clean.charAt(0).toUpperCase()) + "</span>";
  }

  function focusFirst(sel) {
    if (previewKey) return true;
    var el = app.querySelector(sel);
    if (el) { el.setAttribute("tabindex", "-1"); el.focus({ preventScroll: true }); }
    return !!el;
  }
  function wait(ms) { return new Promise(function (r) { setTimeout(r, ms); }); }
  var reduced = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  function ms(n) { return reduced ? 0 : n; }

  // ── Symbole (neutral, keine Markenzeichen) ─────────────
  var ICON = {
    heart: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 21s-7.5-4.6-9.6-9.2C.9 8.4 3 4.5 6.7 4.5c2.1 0 3.6 1.1 5.3 3 1.7-1.9 3.2-3 5.3-3 3.7 0 5.8 3.9 4.3 7.3C19.5 16.4 12 21 12 21z"/></svg>',
    heartLine: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="none" stroke="currentColor" stroke-width="2" d="M12 20s-7-4.3-8.9-8.6C1.8 8.3 3.7 5 6.8 5c1.9 0 3.3 1 5.2 3 1.9-2 3.3-3 5.2-3 3.1 0 5 3.3 3.7 6.4C19 15.7 12 20 12 20z"/></svg>',
    comment: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 4h18v12H8l-5 4z"/></svg>',
    share: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M14 4l8 7-8 7v-4c-6 0-9 2-12 6 1-6 4-11 12-12z"/></svg>',
    send: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round" d="M21 3L3 10l7 3 3 7z"/></svg>',
    home: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 11l9-8 9 8v10h-6v-6H9v6H3z"/></svg>',
    search: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M10 3a7 7 0 015.6 11.2l5.1 5.1-1.4 1.4-5.1-5.1A7 7 0 1110 3zm0 2a5 5 0 100 10 5 5 0 000-10z"/></svg>',
    plus: '<svg viewBox="0 0 34 24" aria-hidden="true"><rect x="1" y="1" width="32" height="22" rx="6" fill="none" stroke="currentColor" stroke-width="2"/><path d="M16 6h2v5h5v2h-5v5h-2v-5h-5v-2h5z"/></svg>',
    inbox: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 5h18v14H3zm2 2v.5l7 5 7-5V7zm0 3v7h14v-7l-7 5z"/></svg>',
    profile: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3a4.5 4.5 0 110 9 4.5 4.5 0 010-9zm0 11c5 0 8 2.5 8 6v1H4v-1c0-3.5 3-6 8-6z"/></svg>',
    play: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="4" fill="none" stroke="currentColor" stroke-width="2"/><path d="M10 8l6 4-6 4z"/></svg>',
    check: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9.5 16.2L5.3 12l-1.4 1.4 5.6 5.6L20.1 8.4 18.7 7z"/></svg>',
    plusThin: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" d="M12 4v16M4 12h16"/></svg>',
    repostLine: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" d="M4 11V9a3 3 0 013-3h12l-3-3M20 13v2a3 3 0 01-3 3H5l3 3"/></svg>',
    commentLine: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round" d="M20.5 11.5a8.5 8.5 0 01-12.4 7.6L3.5 20.5l1.4-4.4A8.5 8.5 0 1120.5 11.5z"/></svg>',
    bookmark: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round" d="M6 3h12v18l-6-5-6 5z"/></svg>',
    reels: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5" fill="none" stroke="currentColor" stroke-width="2"/><path fill="none" stroke="currentColor" stroke-width="2" d="M3 8.5h18M8 3l3 5.5M14 3l3 5.5"/><path d="M10 12l5 3-5 3z"/></svg>',
    plusSquare: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5" fill="none" stroke="currentColor" stroke-width="2"/><path fill="none" stroke="currentColor" stroke-width="2" d="M12 7.5v9M7.5 12h9"/></svg>',
    homeLine: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round" d="M3.5 10.5L12 3.5l8.5 7V20.5h-6v-6h-5v6h-6z"/></svg>',
    searchLine: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6.5" fill="none" stroke="currentColor" stroke-width="2"/><path stroke="currentColor" stroke-width="2" stroke-linecap="round" d="M15.5 15.5l5 5"/></svg>',
    status: '<svg viewBox="0 0 58 14" aria-hidden="true"><rect x="0" y="9" width="3" height="5" rx="1"/><rect x="5" y="6" width="3" height="8" rx="1"/><rect x="10" y="3" width="3" height="11" rx="1"/><rect x="15" y="0" width="3" height="14" rx="1"/><path d="M27 4.5a9 9 0 0112 0l-1.4 1.5a7 7 0 00-9.2 0zM29.4 7.2a5.5 5.5 0 017.2 0L35.2 8.7a3.5 3.5 0 00-4.4 0zM33 12.5l-1.7-1.8a2.4 2.4 0 013.4 0z"/><rect x="42" y="2" width="14" height="10" rx="3" fill="none" stroke="currentColor" stroke-width="1.4"/><rect x="44" y="4" width="9" height="6" rx="1.5"/></svg>'
  };
  function iconClass(key) { return (C.apps[key] || {}).icon || ""; }

  // Kopf der Instagram-artigen Screens: ohne App-Namen (keine Wortmarke), nur neutrale Symbole
  // Aufbau wie die aktuelle Instagram-Startseite: schlichtes „+" links, Herz rechts
  function igHead(d) {
    return '<div class="ig-head"><span class="ig-plus" aria-hidden="true">' + ICON.plusThin + "</span>" +
      '<span class="ig-title">' + (d.title ? esc(d.title) : "") + "</span>" +
      '<span class="ig-icons">' + ICON.heartLine + "</span></div>";
  }

  // 1204 → „1.204"
  function deNum(n) { return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, "."); }

  // Profilbild in der Story-Leiste: Foto (assets/av-<name>.jpg), sonst Initiale
  function stAv(user, i, own) {
    var slug = own ? "du" : String(user).toLowerCase().replace(/^@/, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    return '<span class="st-av av' + (i % 5) + '" data-asset="av-' + esc(slug) + '" aria-hidden="true">' +
      esc(String(user).charAt(0).toUpperCase()) + "</span>";
  }
  // Story-Leiste oben im Instagram-Feed: eigene Story + Kontakte mit Farbring und Foto
  function igStoryBar(list) {
    list = list || ["Deine Story", "lena_k", "tom.reist", "jonas.r", "mia.kocht"];
    return '<div class="st-bar ig-stbar">' + list.map(function (u, i) {
      var own = i === 0;
      return '<div class="st"><span class="st-ring' + (own ? " own" : "") + '">' + stAv(u, i, own) +
        (own ? '<span class="st-plus" aria-hidden="true">+</span>' : "") + '</span><span class="st-name">' + esc(u) + "</span></div>";
    }).join("") + "</div>";
  }
  // Ein Instagram-Beitrag. „♡ 1.204 · Pasta in 10 Minuten" → Zähler an den Symbolen,
  // „Gefällt … und N weiteren Personen", Bildunterschrift, Zeitangabe.
  // tgt(key, html) umrahmt Stellen für Wiederfinden 1; headAttr markiert die Kopfzeile.
  function igPostHtml(post, i, tgt, headAttr, imgCls) {
    tgt = tgt || function (k, h) { return h; };
    var m = /^♡\s*([^·]+?)\s*·\s*(.*)$/.exec(post.line || "");
    var likes = m ? m[1] : "", cap = m ? m[2] : (post.line || "");
    var n = Number(String(likes).replace(/\D/g, "")) || 0;
    var friend = post.user === "lena_k" ? "jonas.r" : "lena_k";
    var act = function (icon, count) { return '<span class="ig-act">' + icon + (count ? "<span>" + esc(count) + "</span>" : "") + "</span>"; };
    return '<div class="ig-post"><div class="ig-post-head"' + (headAttr || "") + ">" + avatar(post.user) +
      '<span class="ig-who">' + tgt("user-" + i, '<span class="user">' + esc(post.user) + "</span>") +
      (post.suggested ? tgt("sugg-" + i, '<span class="sugg">' + esc(post.suggested) + "</span>") : "") + "</span>" +
      '<span class="ig-dots" aria-hidden="true">⋯</span></div>' +
      '<div class="ig-img ' + (imgCls || "ig-sq") + '"' + assetAttr(post.asset) + "></div>" +
      '<div class="ig-actions" aria-hidden="true">' +
      act(ICON.heartLine, likes) + act(ICON.commentLine, n ? deNum(Math.round(n / 23) + 2) : "") +
      act(ICON.repostLine, n ? deNum(Math.round(n / 61) + 1) : "") + act(ICON.send, n ? deNum(Math.round(n / 40) + 1) : "") +
      '<span class="ig-save">' + ICON.bookmark + "</span></div>" +
      (n ? '<div class="ig-line">' + tgt("likes-" + i, '<span class="ig-likes">Gefällt <b>' + esc(friend) + "</b> und <b>" +
        deNum(n - 1) + " weiteren Personen</b></span>") + "</div>" : "") +
      (cap ? '<div class="ig-cap"><b>' + esc(post.user) + "</b> " + esc(cap) + "</div>" : "") +
      '<div class="ig-time">Vor ' + (i + 2) + " Stunden</div></div>";
  }
  // Untere Leiste wie bei Instagram (nur Symbole)
  function igNavHtml() {
    return '<div class="ig-nav" aria-hidden="true">' + ICON.homeLine + ICON.searchLine + ICON.plusSquare + ICON.reels +
      avatar("du", "ig-nav-av") + "</div>";
  }

  // Untere Leiste im TikTok-Stil (Start, Suche, Plus, Inbox, Profil)
  function ttNav(d) {
    var navIcons = [ICON.home, ICON.search, ICON.plus, ICON.inbox, ICON.profile];
    return '<div class="nav" aria-hidden="true">' + d.nav.map(function (n, i) {
      return '<span class="' + (i === 2 ? "plus" : "") + '">' + navIcons[i] + (i === 2 ? "" : esc(n)) + "</span>";
    }).join("") + "</div>";
  }

  // Datum des Sperrbildschirms: immer heute, z. B. „Dienstag, 6. Oktober"
  function todayDe() {
    try { return new Intl.DateTimeFormat("de-DE", { weekday: "long", day: "numeric", month: "long" }).format(new Date()); }
    catch (e) { return ""; }
  }

  // „0:02 · läuft" → 2 Sekunden
  function timeSeconds(t) {
    var m = /(\d+):(\d+)/.exec(String(t || ""));
    return m ? Number(m[1]) * 60 + Number(m[2]) : 0;
  }
  // Laufende Zeitangabe im Video (Muster 4, Zustand B), passend zum Balken; springt mit der Schleife auf 0:00
  setInterval(function () {
    if (previewKey && exportMode) return;
    document.querySelectorAll(".time[data-loop]").forEach(function (el) {
      if (!el.dataset.t0) el.dataset.t0 = String(Date.now());
      var loop = Number(el.dataset.loop), start = Number(el.dataset.start);
      var sec = Math.floor(((Date.now() - Number(el.dataset.t0)) / 1000 + start) % loop);
      el.textContent = el.dataset.tpl.replace(/\d+:\d+/, "0:" + (sec < 10 ? "0" : "") + sec);
    });
  }, 200);

  // ── Vorlagen der nachgestellten Screens ────────────────
  // render(p, isB, opt) liefert HTML. opt.animate: Zustand B wird gerade erreicht.
  // toB(body, p) spielt die Reaktion der App auf den Tipp ab (Zustand A → B).
  // Ein Element mit data-mark erhält in Zustand B die rote Umrandung.
  var SCREENS = {
    "tiktok-feed": {
      cls: "tt",
      // d.static: ein Video, das stehen bleibt (Muster 3); sonst wischt der Tipp zum nächsten (Muster 1)
      render: function (p, isB) {
        var d = p.data;
        var list = d.static ? d.posts.slice(0, 1) : d.posts;
        var posts = list.map(function (post, i) {
          var hidden = !d.static && ((!isB && i > 0) || (isB && i === 0));
          return '<div class="post"' + (hidden ? ' aria-hidden="true"' : "") + "><div class=\"post-bg\"" + assetAttr(post.asset) + "></div>" +
            (post.user ? '<div class="meta"><div class="user">' + esc(post.user) + '</div><div class="cap">' + esc(post.caption) + "</div></div>" +
              '<div class="side">' + (post.followPlus ? '<span class="tt-av">' + avatar(post.user) + '<i aria-hidden="true">+</i></span>' : "") +
              "<span>" + ICON.heart + esc(post.likes) + "</span><span>" + ICON.comment + esc(post.comments) +
              "</span><span>" + ICON.share + esc(d.share) + "</span></div>" : "") +
            "</div>";
        }).join("");
        var tabs = d.tabs ? '<div class="tt-tabs">' + d.tabs.map(function (t, i) {
          var on = i === d.activeTab;
          return '<span class="' + (on ? "on" : "") + '"' + (isB && d.mark === "tab-" + i ? ' data-mark="below"' : "") + ">" + esc(t) + "</span>";
        }).join("") + "</div>" : "";
        return '<div class="feed">' + tabs + '<div class="track' + (isB && !d.static ? " to-b still" : "") + '">' + posts + "</div>" +
          (isB && !d.static ? '<div class="seam-zone" data-mark="above"></div>' : "") + "</div>" + ttNav(d);
      },
      toB: function (body, p) {
        if (p.data.static) return Promise.resolve();
        body.querySelector(".track").classList.add("to-b");
        return wait(ms(360));
      }
    },

    "ig-feed": {
      cls: "ig",
      scroll: function (item) { return !!(item && item.type === "spots"); },
      // opt.spot(key) liefert die nummerierte Stelle (nur Wiedererkennen 1)
      render: function (p, isB, opt) {
        var d = p.data;
        var spot = (opt && opt.spot) || function () { return ""; };
        // Wiederfinden 1: Element gestrichelt umrahmen, Nummer sitzt auf der Ecke des Rahmens
        var tgt = function (key, inner, cls) {
          var s = spot(key);
          return s ? '<span class="w1t ' + (cls || "") + '">' + inner + s + "</span>" : inner;
        };
        var markAttr = function (key) { return isB && d.mark === key ? ' data-mark="' + (d.markPlace || "below") + '"' : ""; };
        var html = igHead(d);
        html += '<div class="ig-content' + (opt && opt.animate && d.toast ? " settle" : "") + '">';
        if (d.refresh) {
          html += '<div class="ig-refresh"' + markAttr("refresh") + ">" +
            tgt("refresh", '<span class="ig-refresh-in"><span class="spinner" aria-hidden="true"></span><span>' + esc(d.refresh) + "</span></span>") +
            (isB && d.toast ? '<span class="toast' + (opt && opt.animate ? " fade-in" : "") + '">' + esc(d.toast) + "</span>" : "") +
            "</div>";
        }
        // Story-Leiste oben im Feed (nicht mehr sichtbar, sobald weitergescrollt ist)
        if (d.stories !== false && !(d.scrollFeed && isB)) html += igStoryBar(d.stories);
        var posts = d.scrollFeed && isB ? d.posts.slice(1) : d.posts;
        posts.forEach(function (post, j) {
          var i = d.scrollFeed && isB ? j + 1 : j;
          if (d.scrollFeed && isB && i === 2) html += '<div class="ig-seam"' + markAttr("seam-1") + "></div>";
          html += igPostHtml(post, i, tgt, markAttr("head-" + i));
        });
        if (d.more) {
          html += tgt("edge", '<div class="ig-post ig-more"><div class="ig-post-head">' + avatar(d.more.user) + '<span class="user">' +
            esc(d.more.user) + '</span><span class="ig-dots" aria-hidden="true">⋯</span></div><div class="ig-img short"' +
            assetAttr(d.more.asset) + "></div></div>", "w1t-block");
        }
        html += "</div>" + igNavHtml();
        return html;
      },
      toB: function (body, p) {
        if (p.data.scrollFeed) {
          // Weiter scrollen: der Feed rückt um Story-Leiste + ersten Beitrag nach oben
          var content = body.querySelector(".ig-content"), first = body.querySelector(".ig-post");
          var k = body.getBoundingClientRect().width / body.offsetWidth || 1; // aktuelle Skalierung
          var dy = (first.getBoundingClientRect().bottom - content.getBoundingClientRect().top) / k;
          content.style.transition = "transform " + ms(350) + "ms cubic-bezier(.2,.7,.2,1)";
          content.style.transform = "translateY(-" + Math.round(dy) + "px)";
          return wait(ms(360));
        }
        if (!p.data.toast) return Promise.resolve();
        // Ziehen: Inhalt rutscht nach unten, das Rad dreht sich etwa 1 Sekunde
        body.querySelector(".ig-content").classList.add("pulled");
        body.querySelector(".spinner").classList.add("spin");
        return wait(ms(1000));
      }
    },

    "reels": {
      cls: "rl",
      // Video-Feed mit Sofortstart. Zustand B: Balken läuft, springt am Ende auf den Anfang (Schleife),
      // die Zeitangabe läuft mit. d.nav vorhanden = TikTok-Leiste mit Beschriftung, sonst Reels-Leiste.
      render: function (p, isB) {
        var d = p.data;
        var loop = Number(d.loopSeconds || 4), start = timeSeconds(d.time);
        var videos = d.videos.map(function (v, i) {
          var live = isB && i === 1;
          var hidden = (!isB && i > 0) || (isB && i === 0);
          return '<div class="post"' + (hidden ? ' aria-hidden="true"' : "") + "><div class=\"post-bg\"" + assetAttr(v.asset) + "></div>" +
            '<div class="meta"><div class="user">' + esc(v.user) + '</div><div class="cap">' + esc(v.caption) + "</div>" +
            (live ? '<div class="time" data-loop="' + loop + '" data-start="' + start + '" data-tpl="' + esc(d.time) + '">' + esc(d.time) + "</div>" : "") + "</div>" +
            '<div class="side"><span>' + ICON.heart + esc(v.likes || "") + "</span><span>" + ICON.comment + esc(v.comments || "") + "</span><span>" +
            (d.nav ? ICON.share + esc(d.share || "") : ICON.send) + "</span></div>" +
            '<div class="bar"><span class="' + (live ? "run" : "") + '" style="' +
            (live ? "animation-duration:" + loop + "s;animation-delay:-" + start + "s" : "width:" + Number(v.progress || 0) + "%") + '"></span></div>' +
            "</div>";
        }).join("");
        return '<div class="feed"' + (isB ? ' data-mark="' + (d.markPlace || "inside") + '"' : "") + '><div class="track' +
          (isB ? " to-b still" : "") + '">' + videos + "</div></div>" +
          (d.nav ? ttNav(d) : '<div class="nav" aria-hidden="true"><span>' + ICON.home + "</span><span>" + ICON.search + "</span><span>" +
            ICON.play + "</span><span>" + ICON.send + "</span><span>" + ICON.profile + "</span></div>");
      },
      toB: function (body) {
        body.querySelector(".track").classList.add("to-b");
        return wait(ms(360));
      }
    },

    "ig-comments": {
      cls: "igc",
      render: function (p, isB) {
        var d = p.data;
        return (d.reel ? '<div class="igc-reel"' + assetAttr(d.reel) + "></div>" : "") +
          '<div class="igc-sheet"><div class="igc-grip" aria-hidden="true"></div><div class="igc-head">' + esc(d.title) + "</div>" + d.comments.map(function (c) {
          var n = isB && c.likesB ? c.likesB : c.likes;
          return '<div class="igc-row' + (c.mine ? " mine" : "") + '">' + avatar(c.mine ? "du" : c.user) +
            '<div class="igc-text"><div class="user">' + esc(c.user) + "</div><div>" + esc(c.text) + "</div></div>" +
            '<div class="igc-like"' + (isB && c.mine ? ' data-mark="' + (d.markPlace || "below") + '"' : "") + ">" +
            (c.mine ? ICON.heart : ICON.heartLine) + '<span class="n">' + esc(n) + "</span></div></div>";
        }).join("") + "</div>";
      },
      toB: function (body, p) {
        // Der Zähler springt sichtbar auf den neuen Wert
        var mine = p.data.comments.filter(function (c) { return c.mine; })[0];
        var n = body.querySelector(".igc-row.mine .n");
        n.textContent = mine.likesB;
        n.parentNode.classList.add("pop");
        return wait(ms(320));
      }
    },

    "lockscreen": {
      cls: "lock",
      scroll: function () { return true; },
      render: function (p, isB, opt) {
        var d = p.data;
        var r = state.patterns[p.id];
        var html = isB ? "" : '<div class="lock-clock">' + esc(d.time) + '</div><div class="lock-date">' + esc(d.date || todayDe()) + "</div>";
        html += '<div class="lock-list">';
        d.items.forEach(function (it, i) {
          var n = i + 1;
          var inner = '<span class="app-icon ' + iconClass(it.app) + '" aria-hidden="true"></span>' +
            '<span class="note-main"><span class="note-top"><strong>' + esc(appLabel(it.app)) + "</strong><span>" + esc(it.time) + "</span></span>" +
            '<span class="note-text">' + esc(it.text) + "</span></span>";
          if (!isB) {
            html += '<button type="button" class="note" data-n="' + n + '" aria-pressed="' + (picks.indexOf(n) >= 0) + '">' + inner + "</button>";
          } else {
            var mine = r && r.selected.indexOf(n) >= 0 && !exportMode;
            html += '<div class="note ' + (it.human ? "human" : "app") + (opt && opt.animate ? " fade-in" : "") + '">' + inner +
              (mine ? '<span class="picked">' + ICON.check + '<span class="sr-only">' + esc(C.ui.selectedByYou) + "</span></span>" : "") +
              '<span class="note-tag">' + esc(it.human ? d.labelHuman : d.labelApp) + "</span></div>";
          }
        });
        html += "</div>";
        return html;
      },
      toB: function () { return Promise.resolve(); }
    },

    "ig-stories": {
      cls: "ig igs",
      render: function (p, isB, opt) {
        var d = p.data;
        var html = igHead(d);
        html += '<div class="st-bar ig-stbar">' + d.stories.map(function (st, i) {
          var cls = "st-ring" + (st.own ? " own" : "") + (st.expiring && isB ? " expired" : "");
          return '<div class="st"><span class="' + cls + '"' + (st.expiring && isB ? ' data-mark="' + (d.markPlace || "below") + '"' : "") +
            (st.expiring ? ' data-expiring="1"' : "") + ">" + stAv(st.user, i, st.own) +
            (st.own ? '<span class="st-plus" aria-hidden="true">+</span>' : "") + '</span><span class="st-name">' + esc(st.user) + "</span></div>";
        }).join("") + "</div>";
        if (!isB) html += '<div class="st-expiry">' + esc(d.expiry) + "</div>";
        html += '<div class="ig-content">' + igPostHtml(d.post, 0) + "</div>" + igNavHtml();
        return html;
      },
      toB: function (body) {
        // Der Ring blendet in 300 ms aus, die Zeile „noch 1 Std." verschwindet
        body.querySelector("[data-expiring]").classList.add("expire");
        var line = body.querySelector(".st-expiry");
        if (line) line.classList.add("fade-out");
        return wait(ms(300));
      }
    },

    "story-view": {
      cls: "ig",
      // Zustand A: die geöffnete Story von lena_k, oben Name und Alter ("23 Std.").
      // Zustand B: zurück in der Story-Leiste, der Ring von lena_k ist weg.
      render: function (p, isB, opt) {
        var d = p.data;
        if (!isB) {
          return '<div class="story-full">' +
            '<div class="story-bars"><span class="done"></span><span class="done"></span><span></span></div>' +
            '<div class="story-head">' + avatar(d.story.user) + '<span class="user">' + esc(d.story.user) + "</span>" +
            '<span class="story-age">' + esc(d.story.age) + "</span></div>" +
            '<div class="story-img"' + assetAttr(d.story.asset) + "></div>" +
            '<div class="story-reply"><span class="story-field">' + esc(d.story.replyField) + "</span>" + ICON.heartLine + ICON.send + "</div>" +
            "</div>";
        }
        var html = igHead(d);
        html += '<div class="st-bar ig-stbar">' + d.stories.map(function (st, i) {
          if (st.expiring) {
            // Der Platz, an dem lena_ks Ring war: Kreis ohne Ring, markiert
            return '<div class="st"><span class="st-ring expired"' + (' data-mark="' + (d.markPlace || "below") + '"') +
              ">" + stAv(st.user, i, false) + "</span>" +
              '<span class="st-name">' + esc(st.user) + "</span></div>";
          }
          return '<div class="st"><span class="st-ring' + (st.own ? " own" : "") + '">' + stAv(st.user, i, st.own) +
            (st.own ? '<span class="st-plus" aria-hidden="true">+</span>' : "") +
            '</span><span class="st-name">' + esc(st.user) + "</span></div>";
        }).join("") + "</div>";
        html += '<div class="ig-content">' + igPostHtml(d.post, 0) + "</div>" + igNavHtml();
        return html;
      },
      toB: function () { return Promise.resolve(); }
    },

    "snap-chats": {
      cls: "snap",
      render: function (p, isB) {
        var d = p.data;
        return '<div class="snap-head">' + esc(d.title) + "</div>" + d.rows.map(function (row) {
          return '<div class="snap-row">' + avatar(row.user, "bitmoji") + '<div class="snap-text"><div class="user">' + esc(row.user) +
            '</div><div class="status">' + esc(row.status) + "</div></div>" +
            (row.streak ? '<span class="streak' + (row.mark ? " is-target" : "") + '"' + (isB && row.mark ? ' data-mark="' + (d.markPlace || "below") + '"' : "") + ">" + esc(row.streak) + "</span>" : "") +
            "</div>";
        }).join("");
      },
      toB: function () { return Promise.resolve(); }
    }
  };

  // ── Handy-Rahmen ───────────────────────────────────────
  // Der nachgestellte Screen wird immer in fester Größe gezeichnet (DEVICE_W × DEVICE_H, inklusive Rahmen)
  // und dann passend skaliert: groß zum Ansehen, klein über der Frage.
  var DEVICE_W = 410, DEVICE_H = 800;

  // Nur der scrollbare Inhalt (ohne Kopf- und Fußleiste), für Neuzeichnen im Rahmen
  function bodyOnly(html) {
    return html.replace(/^<div class="ig-head">[\s\S]*?<\/div>/, "").replace(/<div class="ig-nav"[\s\S]*?<\/div>$/, "");
  }
  // Handy-Rahmen als feste Spalte: Statusleiste, Kopfzeile, Inhalt (scrollt allein),
  // Fußleiste. Kopf- und Fußleiste der Instagram-Screens werden aus dem Inhalt
  // herausgelöst, damit sie beim Scrollen fest oben bzw. unten bleiben.
  function deviceHtml(cls, bodyHtml, scroll, time) {
    var head = "", foot = "";
    bodyHtml = bodyHtml.replace(/^<div class="ig-head">[\s\S]*?<\/div>/, function (m) { head = m; return ""; });
    bodyHtml = bodyHtml.replace(/<div class="ig-nav"[\s\S]*?<\/div>$/, function (m) { foot = m; return ""; });
    return '<div class="device-wrap" data-size="full"><div class="device ' + cls + '">' +
      '<div class="device-status"><span class="device-tag">' + esc(C.ui.screenTag) + '</span>' +
      '<span class="device-time">' + esc(time || C.ui.statusTime) + '</span><span class="device-icons">' + ICON.status + "</span></div>" +
      head + '<div class="screen-body' + (scroll ? " scroll" : "") + '">' + bodyHtml + "</div>" + foot + "</div></div>";
  }

  // Größe des Handys an den freien Platz anpassen. size: "full" | "small"
  function fitDevice(animate) {
    var wrap = app.querySelector(".device-wrap");
    if (!wrap) return;
    var dev = wrap.firstChild, stage = wrap.parentNode;
    var cs = getComputedStyle(stage);
    var used = parseFloat(cs.paddingTop) + parseFloat(cs.paddingBottom), gap = parseFloat(cs.rowGap) || 0, kids = 0;
    Array.prototype.forEach.call(stage.children, function (el) {
      if (el === wrap || el.hidden || getComputedStyle(el).display === "none") return;
      used += el.offsetHeight; kids++;
    });
    used += gap * kids;
    var availH = stage.clientHeight - used;
    var availW = stage.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
    var small = wrap.getAttribute("data-size") === "small";
    var maxH = small ? Math.min(availH, Math.max(170, window.innerHeight * 0.3)) : availH;
    var s = Math.min(1, availW / DEVICE_W, maxH / DEVICE_H);
    s = Math.max(small ? 0.2 : 0.42, s);
    // Kein Zoom-Effekt mehr (Feedback-Call 05.10.): Größenwechsel ohne Animation
    wrap.classList.add("no-anim");
    dev.style.transform = "scale(" + s.toFixed(4) + ")";
    wrap.style.width = Math.round(DEVICE_W * s) + "px";
    wrap.style.height = Math.round(DEVICE_H * s) + "px";
    wrap.setAttribute("data-scale", s.toFixed(4));
  }

  // Rote Umrandung um das Element mit data-mark (Koordinaten im unskalierten Screen)
  function placeMark(body) {
    body.querySelectorAll(".mark").forEach(function (el) { el.remove(); });
    var t = body.querySelector("[data-mark]");
    var pg = pages[state.page];
    if (!t || !pg.pattern) return;
    var p = pg.pattern;
    var br = body.getBoundingClientRect(), r = t.getBoundingClientRect();
    var k = br.width / body.offsetWidth || 1; // aktuelle Skalierung, auch mitten in einer Animation
    var inside = t.getAttribute("data-mark") === "inside";
    var pad = inside ? -6 : 4, W = body.clientWidth, H = body.scrollHeight;
    var left = Math.max(3, (r.left - br.left) / k - pad), right = Math.min(W - 3, (r.right - br.left) / k + pad);
    var top = Math.max(3, (r.top - br.top) / k + body.scrollTop - pad), bottom = Math.min(H - 3, (r.bottom - br.top) / k + body.scrollTop + pad);
    // Mindestgröße der Markierung 36 x 36 px (Rework 4.6: Ziel mindestens 32 x 32 px)
    if (right - left < 36) { var cx = (left + right) / 2; left = Math.max(3, cx - 18); right = Math.min(W - 3, cx + 18); }
    if (bottom - top < 36) { var cy = (top + bottom) / 2; top = Math.max(3, cy - 18); bottom = Math.min(H - 3, cy + 18); }
    var mark = document.createElement("div");
    mark.className = "mark fade-in";
    mark.setAttribute("role", "img");
    mark.setAttribute("aria-label", C.ui.markPrefix + p.markLabel);
    mark.style.cssText = "left:" + left + "px;top:" + top + "px;width:" + (right - left) + "px;height:" + (bottom - top) + "px";
    body.appendChild(mark);
  }

  var resizeTimer;
  window.addEventListener("resize", function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function () {
      fitDevice(false);
      var body = app.querySelector(".screen-body");
      if (body && (state.sub === "react" || state.sub === "explain")) placeMark(body);
    }, 120);
  });

  // ── Rendern ────────────────────────────────────────────
  function render() {
    var pg = pages[state.page];
    if (!previewKey) window.scrollTo(0, 0);
    if (pg.type === "intro") renderIntro();
    else if (pg.type === "apps") renderApps();
    else if (pg.type === "pattern" || pg.type === "distractor") renderPattern(pg);
    else if (pg.type === "recognition") renderRecognition(pg);
    else if (pg.type === "einordnung") renderEinordnung();
    else renderSummary();
    applyAssets(app);
    addBackButton();
    addContactLine();
    updateProgress();
  }
  // Kontaktzeile unter dem Knopf (Rework 6.3), Adresse aus ../config.js
  function addContactLine() {
    var mail = window.STUDY_CONFIG && window.STUDY_CONFIG.CONTACT_EMAIL;
    var foot = app.querySelector(".lp-foot");
    if (!mail || !foot || previewKey || foot.querySelector(".contact-line")) return;
    var p = document.createElement("p");
    p.className = "contact-line";
    p.innerHTML = 'Technische Probleme? Schreib an <a href="mailto:' + esc(mail) + '">' + esc(mail) + "</a>.";
    foot.appendChild(p);
  }

  // ── Einschätzung und Bewertung: Prüfen und Speichern (Rework 4.1, 4.3, 6.1) ──
  function bindEst(panel) {
    var b = panel.querySelector(".est-b"), c = panel.querySelector(".est-c");
    panel.querySelectorAll('input[name="est"]').forEach(function (inp) {
      inp.addEventListener("change", function () {
        // Text im jeweils anderen Feld bleibt erhalten, das Feld wird nur ausgeblendet
        b.hidden = inp.value !== "ja";
        c.hidden = inp.value === "ja";
      });
    });
    bindLiveCheck(panel);
  }
  function bindLiveCheck(panel) {
    var recheck = function () { if (panel.querySelector(".q-card.missing")) checkPanel(panel, true); };
    panel.addEventListener("change", recheck);
    panel.addEventListener("input", recheck);
  }
  // Pflichtfragen prüfen: rot umrahmen, Meldung, oben die Zahl, zur ersten springen.
  // quiet=true: nur erledigte Markierungen entfernen (beim Antworten).
  function checkPanel(panel, quiet) {
    var bad = [];
    panel.querySelectorAll("[data-req]").forEach(function (q) {
      if (q.hidden) { q.classList.remove("missing"); return; }
      var msg = "";
      if (q.getAttribute("data-req") === "radio") {
        if (!q.querySelector("input:checked")) msg = C.ui.missing;
      } else {
        if (!q.querySelector("textarea").value.trim()) msg = C.ui.missing;
      }
      if (quiet && !q.classList.contains("missing")) return;
      q.classList.toggle("missing", !!msg);
      q.querySelector(".q-err").textContent = msg;
      if (msg) bad.push(q);
    });
    var note = panel.querySelector(".miss-note");
    if (note) { note.hidden = bad.length < 2; note.textContent = fill(C.ui.missingN, { n: bad.length }); }
    if (!quiet && bad.length) bad[0].scrollIntoView({ block: "center", behavior: "smooth" });
    return bad.length === 0;
  }
  // Muster-/Ablenker-Angaben, die jede ER- und AK-Zeile mitbekommt
  function estMeta(pg) {
    var p = pg.pattern;
    return pg.type === "distractor"
      ? { muster: "d" + pg.k, ablenker: pg.dist.id, app: pg.distApp, variante: pg.dist.id, position: pg.pos }
      : { muster: "m" + p.id, app: p.targetApp, variante: p.screen + ":" + p.screenApp, fallback: !!p.fallback, position: pg.pos };
  }
  function dbSaveWave(wave, page, key, value, seconds) {
    if (previewKey || !window.DB || !state.code) return;
    window.DB.saveEvent(state.code, wave, page, key, value, seconds, pilotFlag, wave === "BOOST" ? C.version : undefined);
  }
  function saveEst(pg, panel) {
    var a = (panel.querySelector('input[name="est"]:checked') || {}).value;
    var b = panel.querySelector("#estb").value.trim(), c = panel.querySelector("#estc").value.trim();
    var key = pg.type === "distractor" ? "ER_d" + pg.k : "ER_m" + pg.pattern.id;
    var meta = estMeta(pg), secs = secondsSince(state.pageStart), page = "s" + pg.pos;
    dbSaveWave("T0", page, key + "a", Object.assign({ wert: a }, meta), secs);
    if (b) dbSaveWave("T0", page, key + "b", Object.assign({ wert: b }, meta), secs);
    if (c) dbSaveWave("T0", page, key + "c", Object.assign({ wert: c }, meta), secs);
    state.est[pg.key] = { a: a, b: b, c: c };
  }

  // Hinweis über dem Inhalt einer zurückgeblätterten Seite
  function addReviewNote() {
    var panel = app.querySelector(".lp-panel");
    if (!panel || panel.querySelector(".review-note")) return;
    var n = document.createElement("p");
    n.className = "review-note";
    n.textContent = C.ui.reviewNote;
    panel.insertBefore(n, panel.firstChild);
  }

  // „Zurück": blättert eine Seite zurück; dort ist alles nur noch Ansicht
  // (Antworten gesperrt). Weiter führt bis zur aktuellen Stelle zurück.
  function addBackButton() {
    if (previewKey) return;
    // Erster Screen: zurück auf die letzte Seite des Fragebogens (noch vor der Schulung)
    var first = state.page === 0 && stepIndex(0, state.sub) === 0;
    var toSurvey = first && returnUrl;
    if (first && !toSurvey) return;
    var foot = app.querySelector(".lp-foot");
    if (!foot || foot.querySelector(".btn-back")) return;
    var b = document.createElement("button");
    b.type = "button";
    b.className = "btn secondary btn-back";
    b.textContent = C.ui.back;
    b.addEventListener("click", function () {
      if (toSurvey) { location.href = returnUrl + (returnUrl.indexOf("?") >= 0 ? "&" : "?") + "zurueck=1"; return; }
      stepBack();
    });
    foot.classList.add("with-back");
    foot.insertBefore(b, foot.firstChild);
  }

  function lpHead(left, right) {
    return '<div class="lp-head"><span class="lp-step">' + esc(left) + "</span>" +
      (right ? '<span class="lp-app">' + esc(right) + "</span>" : "") + "</div>";
  }

  // ── Einleitung, Bildschirm 1 ───────────────────────────
  function renderIntro() {
    var I = C.intro;
    var needCode = !urlCode;
    app.innerHTML =
      '<form class="page tp" novalidate><div class="tp-body">' +
      '<p class="tp-kicker">' + esc(I.head) + "</p>" +
      "<h1>" + esc(I.title) + "</h1>" + paras(I.text) +
      (needCode ? '<div class="field"><label for="code">' + esc(I.codeLabel) + '</label>' +
        '<input id="code" name="code" autocomplete="off" autocapitalize="characters" spellcheck="false" required value="' +
        esc(previewKey ? "" : state.code) + '">' +
        '<div class="error" id="code-err" role="alert"></div></div>' : "") +
      '</div><div class="lp-foot"><button class="btn" type="submit">' + esc(I.button) + "</button></div></form>";
    focusFirst("h1");
    app.querySelector("form").addEventListener("submit", function (e) {
      e.preventDefault();
      if (needCode) {
        var v = app.querySelector("#code").value.trim();
        if (!v) { app.querySelector("#code-err").textContent = C.ui.codeMissing; app.querySelector("#code").focus(); return; }
        state.code = v;
      }
      if (previewKey) return;
      if (isReview()) { goto(1); return; }
      state.pageSeconds.intro = secondsSince(state.pageStart);
      if (!state.startedAt) state.startedAt = isoNow();
      goto(1);
    });
  }

  // ── Einleitung, Bildschirm 2: Deine Apps ───────────────
  function renderApps() {
    var A = C.appsPage;
    var known = urlApps.length > 0;
    if (!picks.length) picks = (previewKey ? urlApps : (state.apps || urlApps)).slice();
    var tiles = C.appOrder.map(function (k) {
      return '<button type="button" class="app-tile" data-app="' + k + '" aria-pressed="' + (picks.indexOf(k) >= 0) + '">' +
        '<span class="app-icon ' + iconClass(k) + '" aria-hidden="true"></span><span class="app-name">' + esc(appLabel(k)) + "</span>" +
        '<span class="tile-check" aria-hidden="true">' + ICON.check + "</span></button>";
    }).join("");
    app.innerHTML =
      '<div class="page tp"><div class="tp-body">' +
      '<p class="tp-kicker">' + esc(A.head) + "</p>" +
      "<h1>" + esc(A.title) + "</h1>" +
      '<p id="apps-lead">' + esc(known ? A.knownLead : A.askLead) + "</p>" +
      '<div class="app-tiles" role="group" aria-labelledby="apps-lead">' + tiles + "</div>" +
      (known ? "<p>" + esc(A.knownAfter) + "</p>" : "") +
      '</div><div class="lp-foot"><button class="btn" id="go" type="button">' + esc(known ? A.knownButton : A.askButton) + "</button></div></div>";
    focusFirst("h1");
    var go = app.querySelector("#go");
    if (isReview()) {
      // Apps nicht mehr änderbar: davon hängt ab, welche Muster gezeigt wurden
      app.querySelectorAll(".app-tile").forEach(function (btn) {
        var on = (state.apps || []).indexOf(btn.getAttribute("data-app")) >= 0;
        btn.setAttribute("aria-pressed", String(on));
        btn.disabled = true;
      });
      go.textContent = C.ui.next;
      go.addEventListener("click", function () { goto(state.page + 1); });
      return;
    }
    go.disabled = picks.length === 0;
    app.querySelectorAll(".app-tile").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var k = btn.getAttribute("data-app"), i = picks.indexOf(k);
        if (i >= 0) picks.splice(i, 1); else picks.push(k);
        btn.setAttribute("aria-pressed", String(i < 0));
        go.disabled = picks.length === 0;
      });
    });
    go.addEventListener("click", function () {
      if (!picks.length || previewKey) return;
      state.apps = C.appOrder.filter(function (k) { return picks.indexOf(k) >= 0; });
      state.appsSource = known ? "param" : "asked";
      state.shown = assignPatterns(state.apps);
      state.pageSeconds.apps = secondsSince(state.pageStart);
      dbSave("apps", "APPS", { apps: state.apps, source: state.appsSource,
        shown: state.shown }, state.pageSeconds.apps);
      if (!previewKey && window.DB && state.code) {
        // Profil immer aktualisieren: T1/T2 leiten die gezeigten Muster aus
        // den Apps im Profil ab, also muss hier der letzte Stand hinein.
        window.DB.saveProfile(state.code, null, state.apps);
      }
      buildPages();
      goto(2);
    });
  }

  function ctxFor(p, isB) {
    if (!isB) return p.ctxA;
    var t = p.ctxB || p.ctxA;
    var r = state.patterns[p.id];
    if (p.ctxBYou && r && !exportMode) t += " " + fill(p.ctxBYou, { n: r.selected.length });
    return t;
  }

  // ── Musterseiten ───────────────────────────────────────
  function renderPattern(pg) {
    var p = pg.pattern;
    var tpl = SCREENS[p.screen];
    if (state.sub === "look") state.sub = "est"; // jeder Screen beginnt mit der Einschätzung
    var isB = state.sub === "react" || state.sub === "explain";
    var right = p.screenApp === "lock" ? C.ui.lockLabel : appLabel(p.screenApp);
    app.innerHTML =
      '<div class="page lp">' + lpHead(fill(C.ui.patternOf, { x: pg.index, n: pg.total }), right) +
      (p.fallback && !p.isDistractor ? '<div class="fallback-note">' + esc(fill(C.ui.fallbackNote, { app: appLabel(p.targetApp) })) + "</div>" : "") +
      '<main class="lp-stage"><p class="lp-ctx" id="ctx"></p>' +
      deviceHtml(tpl.cls, tpl.render(p, isB, {}), tpl.scroll && tpl.scroll(), isB && p.statusTimeB) +
      '<div class="lp-panel"></div></main>' +
      '<div class="lp-foot"><button class="btn" id="main" type="button"></button></div></div>';
    showPhase(pg, state.sub, false);
  }

  function sizeFor(p, phase) {
    if (phase === "explain" || phase === "ak") return "small";
    if (phase === "est" || phase === "dres") return "full";
    if (phase === "ask" && p.type !== "multi") return "small";
    return "full";
  }

  function radioGroup(name, options) {
    return options.map(function (o) {
      return '<label class="opt"><input type="radio" name="' + name + '" value="' + esc(o.v) + '"><span>' + esc(o.label) + "</span></label>";
    }).join("");
  }
  function panelHtml(p, phase) {
    var r = state.patterns[p.id] || {};
    var U = C.ui;
    if (phase === "est") {
      return '<p class="miss-note" hidden role="alert"></p>' +
        '<fieldset class="q-card" data-req="radio"><legend class="q" id="q">' + esc(U.estQ) + "</legend>" +
        radioGroup("est", U.estOptions) + '<p class="q-err"></p></fieldset>' +
        '<div class="q-card est-b" hidden><label class="q" for="estb">' + esc(U.estB) + "</label>" +
        '<textarea id="estb" rows="3"></textarea><p class="q-err"></p></div>' +
        '<div class="q-card est-c" hidden><label class="q" for="estc">' + esc(U.estC) + "</label>" +
        '<textarea id="estc" rows="3"></textarea></div>';
    }
    if (phase === "dres") {
      var pg0 = pages[state.page];
      return '<section class="ex-card"><h2 id="ex-title">' + esc(U.noPattern) + "</h2><p>" + esc(pg0.dist.why) + "</p></section>";
    }
    if (phase === "ask" && p.type !== "multi") {
      return '<fieldset class="q-card"><legend class="q" id="q">' + esc(p.question) + "</legend>" +
        p.options.map(function (o, i) {
          return '<label class="opt"><input type="radio" name="ans" value="' + (i + 1) + '"><span>' + esc(o) + "</span></label>";
        }).join("") + "</fieldset>";
    }
    if (phase === "react") {
      var text = p.type === "multi" ? (exportMode ? "" : fill(p.resultLine, { x: r.hits, y: r.falseAlarms })) : p.hint;
      return text ? '<div class="callout" id="callout" role="status">' + esc(text) + "</div>" : "";
    }
    if (phase === "explain") {
      var verdict = "";
      if (p.type !== "multi" && !exportMode && r.answer) {
        verdict = '<p class="verdict">' + esc(r.isCorrect ? C.ui.predictionRight
          : fill(C.ui.predictionWrong, { a: p.options[r.answer - 1] || "–", c: p.options[p.correct - 1] })) + "</p>";
      }
      return '<section class="ex-card"><h2 id="ex-title">' + esc(p.name) + "</h2>" + verdict +
        '<dl class="lines">' +
        "<div><dt>" + esc(C.ui.labelWas) + "</dt><dd>" + esc(p.was) + "</dd></div>" +
        "<div><dt>" + esc(C.ui.labelWirkung) + "</dt><dd>" + esc(p.wirkung) + "</dd></div>" +
        "<div><dt>" + esc(C.ui.labelZweck) + "</dt><dd>" + esc(p.zweck) + "</dd></div></dl></section>";
    }
    return "";
  }

  // Einen Schritt der Musterseite zeigen (ohne die Seite neu aufzubauen, damit Übergänge weich bleiben)
  function showPhase(pg, phase, animate) {
    var p = pg.pattern;
    var tpl = SCREENS[p.screen];
    var isB = phase === "react" || phase === "explain";
    var stage = app.querySelector(".lp-stage");
    var ctx = app.querySelector("#ctx"), panel = app.querySelector(".lp-panel"), btn = app.querySelector("#main");
    var body = app.querySelector(".screen-body");
    ctx.textContent = ctxFor(p, isB);
    ctx.hidden = phase === "explain";
    panel.innerHTML = panelHtml(p, phase);
    if (animate) panel.classList.add("fade-in");
    stage.setAttribute("data-phase", phase);
    app.querySelector(".device-wrap").setAttribute("data-size", sizeFor(p, phase));
    fitDevice(animate);
    if (phase === "est" || phase === "ak" || phase === "dres") { applyMarkA(body, pg); placeMark(body); }
    else if (!isB) clearMarkA(body);
    if (isB) placeMark(body);
    btn.disabled = false;
    btn.onclick = null;
    var backBtn = app.querySelector(".btn-back");
    if (backBtn) backBtn.disabled = false;

    if (phase === "est") {
      btn.textContent = C.ui.next;
      bindEst(panel);
      btn.onclick = function () {
        if (!checkPanel(panel)) return;
        saveEst(pg, panel);
        state.sub = pg.type === "distractor" ? "dres" : "ask";
        state.pageStart = Date.now();
        save(); showPhase(pg, state.sub, true);
      };
      addRelookButton(pg, phase);
      focusFirst("#ctx");
    } else if (phase === "dres") {
      btn.textContent = C.ui.next;
      btn.onclick = function () { goto(state.page + 1); };
      if (isReview()) addReviewNote();
      focusFirst("#ex-title");
    } else if (phase === "look") {
      btn.textContent = C.ui.next;
      btn.onclick = function () { state.sub = "ask"; save(); showPhase(pg, "ask", true); };
      focusFirst("#ctx");
    } else if (phase === "ask") {
      btn.textContent = p.action;
      btn.disabled = true;
      if (p.type === "multi") bindToggles(".note", function () { btn.disabled = picks.length === 0; });
      else app.querySelectorAll('input[name="ans"]').forEach(function (inp) {
        inp.addEventListener("change", function () { btn.disabled = false; });
      });
      btn.onclick = function () { tapToReact(pg); };
      addRelookButton(pg, phase);
      focusFirst(p.type === "multi" ? "#ctx" : "#q");
    } else if (phase === "react") {
      btn.textContent = C.ui.next;
      btn.onclick = function () { state.sub = "explain"; save(); showPhase(pg, "explain", true); };
      focusFirst("#callout") || focusFirst("#ctx");
    } else {
      btn.textContent = C.ui.next;
      btn.onclick = function () {
        var r = state.patterns[p.id];
        if (r && r.secondsB == null) r.secondsB = secondsSince(state.bStart || state.pageStart);
        if (r) {
          var s = pg.shown || {};
          dbSave("p" + p.id, "P" + p.id,
            Object.assign({}, r, { app: s.app || p.targetApp, screen: s.screen || p.screenApp,
              fallback: !!(s.fallback || p.fallback) }),
            (r.secondsA || 0) + (r.secondsB || 0));
        }
        goto(state.page + 1);
      };
      if (isReview()) addReviewNote();
      focusFirst("#ex-title");
    }
    if (isReview()) reviewPhase(pg, phase, panel, btn);
    updateProgress();
  }

  // Zurückgegangen: frühere Antworten zeigen, nichts mehr änderbar, Weiter = nächster Schritt
  function reviewPhase(pg, phase, panel, btn) {
    var p = pg.pattern;
    if (phase === "est") {
      var e = state.est[pg.key] || {};
      var radio = panel.querySelector('input[name="est"][value="' + e.a + '"]');
      if (radio) radio.checked = true;
      panel.querySelector("#estb").value = e.b || "";
      panel.querySelector("#estc").value = e.c || "";
      panel.querySelector(".est-b").hidden = e.a !== "ja";
      panel.querySelector(".est-c").hidden = !e.a || e.a === "ja";
    }
    if (phase === "ask" && p.type !== "multi") {
      var r = state.patterns[p.id] || {};
      var ans = panel.querySelector('input[name="ans"][value="' + r.answer + '"]');
      if (ans) ans.checked = true;
    }
    app.querySelectorAll(".lp-panel input, .lp-panel textarea, .screen-body .note").forEach(function (el) { el.disabled = true; });
    btn.disabled = false;
    btn.textContent = C.ui.next;
    btn.onclick = stepForward;
    addReviewNote();
  }

  // Fortschrittsbalken der Schulung (Rework 08.10.): Seiten und Schritte, ohne Text
  function updateProgress() {
    var foot = app.querySelector(".lp-foot");
    if (!foot || !pages.length) return;
    var bar = foot.querySelector(".progress-track");
    if (!bar) {
      bar = document.createElement("div");
      bar.className = "progress-track";
      bar.setAttribute("aria-hidden", "true");
      bar.innerHTML = '<div class="progress-fill"></div>';
      var line = foot.querySelector(".contact-line");
      foot.insertBefore(bar, line || null);
    }
    var s = stepsOf(pages[state.page]);
    var done = state.page + (stepIndex(state.page, state.sub) + 1) / s.length;
    bar.firstChild.style.width = Math.round(100 * done / pages.length) + "%";
  }

  // „Screen noch einmal ansehen": zeigt den Screen (Zustand A) in voller Größe
  // über der Frage; ein Tipp führt zurück. Die Antwort bleibt unverändert.
  function addRelookButton(pg, phase) {
    var p = pg.pattern;
    if (p.type === "multi" && phase === "ask") return; // Muster 6: der Screen ist ohnehin groß zu sehen
    var withMark = phase === "est";
    var panel = app.querySelector(".lp-panel");
    if (!panel || panel.querySelector(".relook")) return;
    var tpl = SCREENS[p.screen];
    var b = document.createElement("button");
    b.type = "button";
    b.className = "relook";
    b.textContent = C.ui.relook;
    b.addEventListener("click", function () {
      var ov = document.createElement("div");
      ov.className = "relook-overlay";
      ov.setAttribute("role", "dialog");
      ov.setAttribute("aria-label", "Screen in voller Größe. Tippen zum Schließen.");
      ov.innerHTML = '<div class="relook-stage">' +
        deviceHtml(tpl.cls, tpl.render(p, false, {}), tpl.scroll && tpl.scroll(), null) +
        '</div><p class="relook-hint">Tippen, um zur Frage zurückzukehren</p>';
      document.body.appendChild(ov);
      applyAssets(ov);
      if (withMark) { var ovBody = ov.querySelector(".screen-body"); applyMarkA(ovBody, pg); setTimeout(function () { placeMark(ovBody); }, 0); }
      // Gerät in den verfügbaren Platz einpassen
      var wrap = ov.querySelector(".device-wrap"), dev = wrap.firstChild;
      var s = Math.min(1, (window.innerWidth - 32) / DEVICE_W, (window.innerHeight - 90) / DEVICE_H);
      dev.style.transform = "scale(" + s.toFixed(4) + ")";
      wrap.classList.add("no-anim");
      wrap.style.width = Math.round(DEVICE_W * s) + "px";
      wrap.style.height = Math.round(DEVICE_H * s) + "px";
      ov.addEventListener("click", function () { ov.remove(); });
    });
    // Direkt unter dem Handy, über der Frage – sonst verschwindet er im Scrollbereich
    panel.insertBefore(b, panel.firstChild);
  }

  // Der eine Tipp: Antwort speichern, Handy groß, App reagiert, dann Markierung und Hinweis
  function tapToReact(pg) {
    var p = pg.pattern, tpl = SCREENS[p.screen];
    var btn = app.querySelector("#main");
    if (btn.disabled) return;
    var result = { id: p.id, name: p.key };
    if (p.type === "multi") {
      if (!picks.length) return;
      Object.assign(result, multiResult(p, picks));
    } else {
      var sel = app.querySelector('input[name="ans"]:checked');
      if (!sel) return;
      var ans = Number(sel.value);
      Object.assign(result, { answer: ans, correct: p.correct, isCorrect: ans === p.correct });
    }
    result.secondsA = secondsSince(state.pageStart);
    result.secondsB = null;
    state.patterns[p.id] = result;
    state.sub = "react";
    state.bStart = Date.now();
    save();

    btn.disabled = true;
    var backBtn = app.querySelector(".btn-back");
    if (backBtn) backBtn.disabled = true; // nicht mitten in die Reaktion der App zurückspringen
    app.querySelectorAll(".lp-panel input, .note").forEach(function (el) { el.disabled = true; });
    var stage = app.querySelector(".lp-stage"), panel = app.querySelector(".lp-panel");
    var body = app.querySelector(".screen-body");
    // Platz für den Hinweis reservieren, damit das Handy nach der Reaktion nicht mehr springt
    panel.innerHTML = panelHtml(p, "react");
    panel.classList.remove("fade-in");
    panel.classList.add("reserved");
    stage.setAttribute("data-phase", "react");
    app.querySelector(".device-wrap").setAttribute("data-size", "full");
    var grow = 0; // kein Zoom mehr, die Reaktion der App beginnt sofort
    fitDevice(false);
    wait(ms(grow)).then(function () {
      var ctxEl = app.querySelector("#ctx");
      if (ctxEl.textContent !== ctxFor(p, true)) {
        ctxEl.textContent = ctxFor(p, true);
        ctxEl.classList.remove("changed"); void ctxEl.offsetWidth; ctxEl.classList.add("changed");
      }
      if (p.statusTimeB) app.querySelector(".device-time").textContent = p.statusTimeB;
      return tpl.toB(body, p);
    }).then(function () {
      // Endzustand zeichnen, dann Markierung und Hinweis zusammen einblenden (< 400 ms)
      body.innerHTML = bodyOnly(tpl.render(p, true, { animate: true }));
      applyAssets(body);
      placeMark(body);
      panel.classList.remove("reserved");
      panel.classList.add("fade-in");
      showPhase(pg, "react", false);
    });
  }

  function bindToggles(sel, onChange) {
    app.querySelectorAll(sel).forEach(function (btn) {
      btn.addEventListener("click", function () {
        var n = Number(btn.getAttribute("data-n"));
        var i = picks.indexOf(n);
        if (i >= 0) picks.splice(i, 1); else picks.push(n);
        btn.setAttribute("aria-pressed", String(i < 0));
        onChange();
      });
    });
  }

  // ── Wiedererkennen ─────────────────────────────────────
  function renderRecognition(pg) {
    var it = pg.item;
    var isB = state.sub === "react" || state.sub === "explain";
    var r = state.recognition[it.id];
    var head = lpHead(fill(C.ui.recognitionOf, { x: pg.index, n: C.recognition.length }), it.app);
    var middle;

    if (it.type === "spots") {
      var rt = w1Runtime(it);
      var itR = Object.assign({}, it, { data: rt.data });
      var tpl = SCREENS[it.screen];
      middle = deviceHtml(tpl.cls + " w1", tpl.render(itR, false, { spot: function (key) { return spotHtml(itR, rt, key, isB, r); } }), true);
    } else {
      var cards = w2Cards(it);
      middle = '<div class="cards-list">' + cards.map(function (c, i) {
        var n = i + 1;
        // Kopf (App-Symbol + Meldung) über die volle Breite, darunter Auswahl bzw. Auflösung
        var inner = '<div class="w2-top"><span class="app-icon ' + iconClass(c.app) + '" aria-hidden="true"></span>' +
          '<span class="card-text"><strong>' + esc(appLabel(c.app)) + "</strong><span>" + esc(c.text) + "</span></span></div>";
        if (!isB) {
          // je Meldung zwei gleich breite Optionen: Von einem Menschen / Von der App
          return '<fieldset class="w2-card"><legend class="sr-only">' + esc(c.text) + "</legend>" + inner +
            '<div class="w2-choice" role="radiogroup">' +
            '<label><input type="radio" name="w2-' + n + '" value="human"><span>' + esc(it.labelHuman) + "</span></label>" +
            '<label><input type="radio" name="w2-' + n + '" value="app"><span>' + esc(it.labelApp) + "</span></label>" +
            "</div></fieldset>";
        }
        var a = r && r.answers ? r.answers[i] : null;
        var ok = a && a.correct;
        var verdict = exportMode || !a ? "" :
          '<span class="w2-verdict ' + (ok ? "good" : "neutral") + '">' + esc(ok ? it.verdictRight : it.verdictWrong) + "</span>";
        return '<div class="w2-card solved' + (a && !exportMode ? (ok ? " is-good" : " is-wrong") : "") + '">' + inner +
          '<div class="w2-why">' + verdict + esc((a && !exportMode ? (c.human ? it.labelHuman : it.labelApp) + ". " : "") + c.why) + "</div></div>";
      }).join("") + "</div>";
    }

    var panel = "";
    if (isB) {
      panel = it.type === "spots"
        ? '<div class="feedback' + (previewKey ? "" : " fade-in") + '" id="fb">' + spotsFeedbackHtml(it, r, w1Runtime(it)) + "</div>"
        : '<p class="feedback' + feedbackClass(it, r) + (previewKey ? "" : " fade-in") + '" id="fb">' + esc(feedbackText(it, r)) + "</p>";
    }
    app.innerHTML = '<div class="page lp">' + head +
      '<main class="lp-stage" data-phase="' + (isB ? "react" : "ask") + '"><p class="lp-ctx" id="ctx">' + esc(recCtx(it)) + "</p>" +
      middle + '<div class="lp-panel">' + panel + "</div></main>" +
      '<div class="lp-foot"><button class="btn" id="main" type="button">' + esc(isB ? C.ui.next : it.action) + "</button></div></div>";
    var wrap = app.querySelector(".device-wrap");
    if (wrap) wrap.setAttribute("data-size", "full");
    fitDevice(false);

    var btn = app.querySelector("#main");
    if (isB) {
      focusFirst("#fb");
      btn.onclick = function () {
        if (isReview()) { stepForward(); return; }
        if (r && r.seconds == null) r.seconds = secondsSince(state.pageStart);
        if (r) dbSave(it.id, it.id, r, r.seconds);
        goto(state.page + 1);
      };
      if (isReview()) addReviewNote();
      return;
    }
    focusFirst("#ctx");
    if (isReview()) {
      if (r && r.answers) r.answers.forEach(function (a, i) {
        var x = app.querySelector('input[name="w2-' + (i + 1) + '"][value="' + (a.saidHuman ? "human" : "app") + '"]');
        if (x) x.checked = true;
      });
      app.querySelectorAll(".spot, .w2-choice input").forEach(function (el) { el.disabled = true; });
      btn.textContent = C.ui.next;
      btn.onclick = stepForward;
      addReviewNote();
      return;
    }
    btn.disabled = true;
    if (it.type === "spots") {
      bindToggles(".spot", function () { btn.disabled = picks.length === 0; });
    } else {
      // „Auflösen" erst, wenn alle drei Meldungen eingeordnet sind
      var allAnswered = function () {
        return cards.every(function (c, i) { return app.querySelector('input[name="w2-' + (i + 1) + '"]:checked'); });
      };
      app.querySelectorAll('.w2-choice input').forEach(function (inp) {
        inp.addEventListener("change", function () { btn.disabled = !allAnswered(); });
      });
    }
    btn.onclick = function () {
      if (btn.disabled) return;
      if (it.type === "spots") {
        if (!picks.length) return;
        state.recognition[it.id] = spotsResult(it, picks);
      } else {
        var choices = cards.map(function (c, i) {
          var sel = app.querySelector('input[name="w2-' + (i + 1) + '"]:checked');
          return sel ? sel.value : null;
        });
        if (choices.indexOf(null) >= 0) return;
        state.recognition[it.id] = w2Result(it, cards, choices);
      }
      state.sub = "react";
      save();
      renderRecognition(pg);
      applyAssets(app);
    };
  }

  function spotHtml(it, rt, key, isB, r) {
    var n = rt.data.spots[key];
    if (!n) return "";
    var meta = rt.meta.filter(function (m) { return m.n === n; })[0] || {};
    var label = C.ui.spotPrefix + n + ": " + (meta.label || "");
    if (!isB) {
      return '<button type="button" class="spot spot-' + esc(key) + '" data-n="' + n + '" aria-pressed="' + (picks.indexOf(n) >= 0) +
        '" aria-label="' + esc(label) + '"><span>' + n + "</span></button>";
    }
    var target = rt.targets.indexOf(n) >= 0;
    var mine = r && r.selected.indexOf(n) >= 0 && !exportMode;
    return '<span class="spot spot-' + esc(key) + (target ? " target" : " miss") + (mine ? " mine" : "") + '" role="img" aria-label="' +
      esc(label + (mine ? ", " + C.ui.selectedByYou : "")) + '"><span>' + n + "</span></span>";
  }

  // Wiederfinden 2: zwei bis drei Karten aus dem Pool – nur genutzte Apps
  // (Instagram, TikTok, Snapchat), nur gezeigte Muster, immer mindestens eine
  // Meldung von einem Menschen und eine von der App, fest je Teilnehmercode.
  // Fehlt für die Apps der Person eine Sorte, kommt die Instagram-Variante.
  function w2Cards(it) {
    var ids = shownIds();
    var used = (state.apps || []).filter(function (a) { return STUDY_APPS.indexOf(a) >= 0; });
    if (!used.length) used = ["ig"];
    var fits = function (c) { return c.pattern == null || ids.indexOf(c.pattern) >= 0; };
    var pool = it.cardPool.filter(function (c) { return used.indexOf(c.app) >= 0 && fits(c); });
    var rnd = seededRandom(hashCode(String(state.code || "") + "w2"));
    function shuffled(list) {
      var l = list.slice();
      for (var i = l.length - 1; i > 0; i--) { var j = Math.floor(rnd() * (i + 1)); var t = l[i]; l[i] = l[j]; l[j] = t; }
      return l;
    }
    var igOf = function (human) {
      return it.cardPool.filter(function (c) { return c.app === "ig" && !!c.human === human && fits(c); });
    };
    var humans = shuffled(pool.filter(function (c) { return c.human; }));
    var apps = shuffled(pool.filter(function (c) { return !c.human; }));
    if (!humans.length) humans = shuffled(igOf(true));
    if (!apps.length) apps = shuffled(igOf(false));
    var out = [humans.shift(), apps.shift()].filter(Boolean);
    while (out.length < 3 && apps.length) out.push(apps.shift());
    while (out.length < 3 && humans.length) out.push(humans.shift());
    return shuffled(out);
  }
  // Einleitungssatz einer Wiederfinden-Seite; {count} = Zahl der angezeigten Meldungen als Wort
  function recCtx(it) {
    if (it.type !== "cards") return it.ctx;
    var n = w2Cards(it).length;
    var word = { 2: "Zwei", 3: "Drei" }[n] || String(n);
    return fill(it.ctx, { count: word });
  }
  function w2Result(it, cards, choices) {
    var answers = cards.map(function (c, i) {
      var saidHuman = choices[i] === "human";
      return { app: c.app, text: c.text, isHuman: !!c.human, saidHuman: saidHuman, correct: saidHuman === !!c.human };
    });
    var hits = answers.filter(function (a) { return a.correct; }).length;
    return { id: it.id, answers: answers, hits: hits, isCorrect: hits === answers.length, seconds: null };
  }

  // Rückmeldung je Nummer: Name des Musters oder „kein Muster" (Feedback-Call 05.10.)
  function spotsFeedbackHtml(it, r, rt) {
    var rows = rt.meta.map(function (m) {
      var name = m.pattern ? patternDef(m.pattern).name : it.noPatternLabel;
      var tapped = r && !exportMode && r.selected.indexOf(m.n) >= 0;
      var cls = m.pattern ? (tapped ? "hit" : "open") : (tapped ? "wrong" : "plain");
      return '<li class="' + cls + '"><b>' + m.n + "</b> " + esc(name) + "</li>";
    }).join("");
    var score = exportMode || !r ? "" :
      '<p class="fb-score">' + esc(fill(it.feedbackScore, { k: r.hits, n: rt.targets.length })) + "</p>";
    return '<ul class="fb-list">' + rows + "</ul>" + score;
  }

  function feedbackText(it, r) {
    if (it.type === "cards") {
      // Begründungen stehen an den Karten; hier nur noch die Bilanz
      return exportMode || !r ? "" : fill(it.feedbackScore, { k: r.hits, n: r.answers.length });
    }
    var lead = exportMode || !r ? "" : (r.isCorrect ? it.feedbackRight : it.feedbackWrong);
    return lead + (it.feedbackText || "");
  }
  function feedbackClass(it, r) {
    if (it.type !== "cards") return "";
    return (!r || r.isCorrect || exportMode) ? " good" : " neutral";
  }

  // ── Rahmenseiten ───────────────────────────────────────
  function renderEinordnung() {
    var E = C.einordnung;
    app.innerHTML = '<div class="page tp"><div class="tp-body"><h1>' + esc(E.title) + "</h1>" + paras(E.text) + "</div>" +
      '<div class="lp-foot"><button class="btn" id="next" type="button">' + esc(E.button) + "</button></div></div>";
    focusFirst("h1");
    app.querySelector("#next").addEventListener("click", function () {
      if (!isReview()) state.pageSeconds.einordnung = secondsSince(state.pageStart);
      goto(state.page + 1);
    });
  }

  function shownIds() { return (state.shown || []).map(function (s) { return s.id; }); }

  function scores() {
    var x = 0, y = 0, max = 0, ids = shownIds();
    ids.forEach(function (id) { if (patternCorrect(state.patterns[id])) x++; });
    C.recognition.forEach(function (it) {
      max += it.type === "spots" ? w1Runtime(it).targets.length : w2Cards(it).length;
      var r = state.recognition[it.id];
      if (!r) return;
      y += r.hits || 0; // W1: gefundene Stellen, W2: richtig eingeordnete Meldungen (je 1 Punkt)
    });
    return { x: x, n: ids.length, y: y, max: max };
  }

  // „Kein Ende: … Nach Maß: … Zurückholen: …" nur mit gezeigten Mustern
  function groupText() {
    var ids = shownIds();
    return C.zusammenfassung.groups.map(function (g) {
      var names = g.ids.filter(function (id) { return ids.indexOf(id) >= 0; }).map(function (id) { return patternDef(id).short; });
      return names.length ? g.label + ": " + names.join(", ") + "." : "";
    }).filter(Boolean).join(" ");
  }

  function renderSummary() {
    var Z = C.zusammenfassung;
    var count = shownIds().length;
    var title = fill(Z.title, { count: Z.numberWords[count] || count });
    var estList = '<ul class="est-list">' + shownIds().map(function (id) {
      var e = state.est["p" + id] || {};
      return "<li><b>" + esc(patternDef(id).short) + "</b><span>" + esc(fill(C.ui.estSummary, { x: C.ui.estLabels[e.a] || "–" })) + "</span></li>";
    }).join("") + "</ul>";
    app.innerHTML = '<div class="page tp"><div class="tp-body"><h1>' + esc(title) + "</h1>" + paras([groupText()]) + (exportMode ? "" : estList) +
      (exportMode ? "" : '<p class="tp-score">' + esc(fill(Z.scores, scores())) + "</p>") +
      "<p>" + esc(Z.outro) + "</p></div>" +
      '<div class="lp-foot"><button class="btn" id="finish" type="button">' + esc(Z.button) + "</button>" +
      '<p class="status-line" id="status" role="status"></p></div></div>';
    focusFirst("h1");
    if (previewKey) return;

    app.querySelector("#finish").addEventListener("click", function (e) {
      var btn = e.currentTarget;
      btn.disabled = true;
      var result = finish();
      dbSave("zusammenfassung", "SUMMARY", result, state.pageSeconds.zusammenfassung);
      var back = returnUrl || ("../index.html" + (state.code ? "?c=" + encodeURIComponent(state.code) +
        (pilotFlag ? "&pilot=1" : "") : ""));
      var done = (previewKey || !window.DB || !state.code)
        ? Promise.resolve()
        : window.DB.markDone(state.code, "BOOST");
      Promise.resolve(done).then(function () { location.href = back; },
        function () { location.href = back; });
    });
  }

  // Übersichtszeile für das SUMMARY-Ereignis (die Einzelantworten stehen
  // bereits als eigene Zeilen APPS, P1–P8, W1, W2 in events)
  function finish() {
    if (state.pageSeconds.zusammenfassung == null) state.pageSeconds.zusammenfassung = secondsSince(state.pageStart);
    if (!state.finishedAt) state.finishedAt = isoNow();
    save();
    return {
      version: C.version,
      startedAt: state.startedAt,
      finishedAt: state.finishedAt,
      apps: state.apps || [],
      appsSource: state.appsSource,
      shown: state.shown || [],
      scores: scores(),
      pageSeconds: {
        intro: state.pageSeconds.intro,
        apps: state.pageSeconds.apps,
        einordnung: state.pageSeconds.einordnung,
        zusammenfassung: state.pageSeconds.zusammenfassung
      }
    };
  }

  // ── Offline nach dem ersten Laden ──────────────────────
  if (!previewKey && "serviceWorker" in navigator && location.protocol === "https:") {
    navigator.serviceWorker.register("sw.js").catch(function () {});
  }

  if (previewKey) document.documentElement.classList.add("is-preview");
  if (previewKey && exportMode) document.documentElement.classList.add("is-export");
  save();
  render();
})();
