/*
 * app.js – Ablauf, Zustände, Speichern und Rücksprung der Intervention (boost-v7, 18.10.2026).
 * Texte stehen in content.js (Schulung) und content-pw.js (Placebo).
 *
 * Aufruf (vom Router in study.js): index.html?code=…&apps=ig,tt&return=…[&pilot=1][&dry=1][&nach=1]
 * Was gezeigt wird, entscheidet die Gruppe aus progress() – die Adresse verrät sie nicht:
 *   G3 → Schulung (Welle BOOST), rein erklärend                  → mark_done BOOST + INTERVENTION
 *   G4 → dieselbe Schulung, je Erklärung zusätzlich „So kannst du gegensteuern“ (Wenn-dann-Regel)
 *        und die vier Regeln in der Zusammenfassung              → mark_done BOOST + INTERVENTION
 *        (seit 18.10.: Plan-Modul PLAN und Quiz FILLER gestrichen)
 *   G2 → Passwort-Schulung (Welle PLACEBO)                       → mark_done INTERVENTION
 *   nach=1 (G1/G2 nach T2) → Schulung freiwillig (Welle POST)    → mark_done POST
 *   G1 ohne nach=1 → sofort zurück (keine Intervention)
 * Schulung abgeschlossen = mark_done BOOST, dann INTERVENTION (beides bei „Fertig“ in der Zusammenfassung).
 *
 * Ablauf je Muster (state.sub): ask (Antwort) → try (Ausprobieren, vor dem Tippen)
 * → react (Ausprobieren, App hat reagiert) → explain (Erklärung).
 * Übungen: ask → react.
 *
 * Vorschau (preview.html): index.html?preview=<seite>[&modus=g3|g4|g2|post][&apps=…][&variant=<app>]
 *   <seite> = start, p1A/p1T/p1B/p1E … (A Frage, T Ausprobieren, B Reaktion, E Erklärung),
 *   W1A/W1B, W2A/W2B, einordnung, zusammenfassung
 */
(function () {
  "use strict";

  var CT = window.CONTENT;      // Schulung
  var CP = window.CONTENT_PW;   // Placebo (Passwörter)
  var app = document.getElementById("app");

  // ── Aufrufparameter ────────────────────────────────────
  var params = new URLSearchParams(location.search);
  var urlCode = (params.get("code") || "").trim();
  var returnUrl = safeUrl(params.get("return"));
  var pilotFlag = params.get("pilot") === "1";
  var urlApps = parseApps(params.get("apps"));
  var previewKey = params.get("preview");
  var exportMode = params.get("export") === "1";
  var postFlag = params.get("nach") === "1";

  function parseApps(raw) {
    var got = String(raw || "").toLowerCase().split(",").map(function (s) { return s.trim(); });
    return CT.appOrder.filter(function (k) { return got.indexOf(k) >= 0; });
  }
  function safeUrl(raw) {
    if (!raw) return null;
    try {
      var u = new URL(raw, location.href);
      return (u.protocol === "https:" || u.protocol === "http:") ? u.href : null;
    } catch (e) { return null; }
  }

  // ── Modus und Inhalt ───────────────────────────────────
  // mode: g3 | g4 | g2 | post | demo (ohne Code: nur ansehen, nichts speichern)
  var mode = null, C = CT, UI = CT.ui, WAVE = "BOOST";
  function setMode(m) {
    mode = m;
    C = m === "g2" ? CP : CT;
    UI = Object.assign({}, CT.ui, m === "g2" ? CP.ui : {});
    WAVE = m === "g2" ? "PLACEBO" : (m === "post" ? "POST" : "BOOST");
  }
  function patternDef(id) { return C.patterns.filter(function (p) { return p.id === id; })[0]; }
  function appLabel(key) { return (CT.apps[key] || {}).label || key; }

  // ── Speichern (db.js aus ../db.js) ─────────────────────
  function dbSaveWave(wave, page, key, value, seconds) {
    if (previewKey || !window.DB || !state.code || mode === "demo") return;
    window.DB.saveEvent(state.code, wave, page, key, value, seconds, pilotFlag, C.version);
  }
  function dbSave(page, key, value, seconds) { dbSaveWave(WAVE, page, key, value, seconds); }
  function markDone(wave) {
    if (previewKey || !window.DB || !state.code || mode === "demo") return Promise.resolve();
    return window.DB.markDone(state.code, wave);
  }
  function backToStudy() {
    var back = returnUrl || ("../index.html" + (state.code ? "?c=" + encodeURIComponent(state.code) + (pilotFlag ? "&pilot=1" : "") : ""));
    location.href = back;
  }

  // ── Zuordnung Muster × App ─────────────────────────────
  // Je Muster die erste App aus order, die die Person nutzt. Ist dafür kein Screen gebaut
  // (Snapchat), kommt der Instagram-Screen mit Hinweis. Placebo: immer die eine Variante „web“.
  function entryFor(p, target) {
    if (p.variants[target]) return { id: p.id, app: target, screen: target };
    var fb = p.variants.ig ? "ig" : Object.keys(p.variants)[0];
    return { id: p.id, app: target, fallback: true, screen: fb };
  }
  function assignPatterns(apps) {
    return C.patterns.map(function (p) {
      if (p.always) { var v = Object.keys(p.variants)[0]; return { id: p.id, app: v, screen: v }; }
      var target = p.order.filter(function (a) { return apps.indexOf(a) >= 0; })[0] || "ig";
      return entryFor(p, target);
    });
  }
  // Übung mit Varianten je App (Übung 1): dieselbe App wie bei Muster 3 (Instagram oder TikTok;
  // nur Snapchat → Instagram). So sieht niemand eine App, die er nicht nutzt (seit 18.10.).
  function recItem(r) {
    if (!r.variants) return r;
    var m3 = (state.shown || []).filter(function (e) { return e.id === 3; })[0];
    var v = m3 && r.variants[m3.screen] ? m3.screen : (r.variants.ig ? "ig" : Object.keys(r.variants)[0]);
    var it = Object.assign({}, r, r.variants[v], { variant: v });
    delete it.variants;
    return it;
  }
  function recItems() { return pages.filter(function (pg) { return pg.type === "recognition"; }).map(function (pg) { return pg.item; }); }
  function resolvePattern(s) {
    var def = patternDef(s.id);
    var v = def.variants[s.screen];
    var p = Object.assign({}, def, v, { screenApp: s.screen, targetApp: s.app, fallback: !!s.fallback });
    delete p.variants; delete p.pools;
    if (def.pools) p.data = Object.assign({}, v.data, { items: composeLock(def, state.apps, state.code) });
    return p;
  }

  // Fester Zufall je Code (FNV-1a + mulberry32)
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
  // Sperrbildschirm (Muster 6): 2 Meldungen von Menschen, 5 von der App, nur aus genutzten Apps
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
    pages = [{ type: "start", key: "start" }];
    var shown = state.shown || [];
    shown.forEach(function (s, i) {
      pages.push({ type: "pattern", key: "p" + s.id, shown: s, pattern: resolvePattern(s), index: i + 1, total: shown.length });
    });
    C.recognition.forEach(function (r, i) { pages.push({ type: "recognition", key: r.id, item: recItem(r), index: i + 1 }); });
    pages.push({ type: "einordnung", key: "einordnung" });
    pages.push({ type: "zusammenfassung", key: "zusammenfassung" });
  }

  // ── Zustand ────────────────────────────────────────────
  var state = null;
  var picks = [];   // laufende Mehrfachauswahl (Muster 6, Übung 1) vor dem Festlegen

  function storeKey() { return "boost-state-" + CT.version + "-" + mode; }
  function fresh() {
    return {
      version: CT.version, mode: mode, code: urlCode || "",
      apps: null, shown: null, startedAt: null, finishedAt: null,
      page: 0, sub: "look", maxPage: 0, maxSub: "look",
      pageStart: Date.now(), bStart: null,
      patterns: {}, recognition: {}, pageSeconds: {}
    };
  }
  function load() {
    try { return JSON.parse(sessionStorage.getItem(storeKey())); } catch (e) { return null; }
  }
  function save() {
    if (previewKey) return;
    if (state.maxPage == null || state.page > state.maxPage) { state.maxPage = state.page; state.maxSub = state.sub; }
    else if (state.page === state.maxPage && stepIndex(state.page, state.sub) > stepIndex(state.page, state.maxSub)) state.maxSub = state.sub;
    try { sessionStorage.setItem(storeKey(), JSON.stringify(state)); } catch (e) { /* ohne Zwischenstand weiter */ }
  }

  function stepsOf(pg) {
    if (!pg) return ["look"];
    if (pg.type === "pattern") return ["ask", "try", "react", "explain"];
    if (pg.type === "recognition") return ["ask", "react"];
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
  function goto(i) { setStep(i, stepsOf(pages[Math.max(0, Math.min(i, pages.length - 1))])[0]); }
  function secondsSince(t) { return Math.max(0, Math.round((Date.now() - t) / 1000)); }
  function isoNow() { return new Date().toISOString().replace(/\.\d{3}Z$/, "Z"); }

  // ── Auswertung ─────────────────────────────────────────
  function multiResult(p, selected) {
    var humans = [];
    p.data.items.forEach(function (it, i) { if (it.human) humans.push(i + 1); });
    var hits = selected.filter(function (n) { return humans.indexOf(n) >= 0; }).length;
    return { selected: selected.slice().sort(num), humans: humans, hits: hits, falseAlarms: selected.length - hits };
  }
  function num(a, b) { return a - b; }
  function patternCorrect(r) {
    if (!r) return false;
    if (r.humans) return r.hits === r.humans.length && r.falseAlarms === 0;
    return !!r.isCorrect;
  }
  // Übung 1: Stellen, fortlaufend nummeriert (nur Muster, die gezeigt wurden, plus Ablenker)
  function w1Runtime(it) {
    var ids = shownIds();
    var active = it.spotDefs.filter(function (d) { return d.pattern == null || ids.indexOf(d.pattern) >= 0; });
    var spots = {}, meta = [];
    active.forEach(function (d, i) { spots[d.key] = i + 1; meta.push({ n: i + 1, key: d.key, pattern: d.pattern, label: d.label }); });
    return {
      data: Object.assign({}, it.data, { spots: spots }),
      meta: meta,
      targets: meta.filter(function (m) { return m.pattern != null; }).map(function (m) { return m.n; })
    };
  }
  function spotsResult(it, selected) {
    var rt = w1Runtime(it);
    var hits = selected.filter(function (n) { return rt.targets.indexOf(n) >= 0; }).length;
    var patterns = {};
    rt.meta.forEach(function (m) { if (m.pattern) patterns[m.n] = m.pattern; });
    return { id: it.id, variant: it.variant, selected: selected.slice().sort(num), targets: rt.targets,
             spotPatterns: patterns, hits: hits, falseAlarms: selected.length - hits, seconds: null };
  }
  function shownIds() { return (state.shown || []).map(function (s) { return s.id; }); }

  // ── Hilfen ─────────────────────────────────────────────
  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  function fill(tpl, vals) {
    return String(tpl).replace(/\{(\w+)\}/g, function (_, k) { return vals[k] != null ? vals[k] : ""; });
  }
  function rich(t) { return esc(t).replace(/\*\*(.+?)\*\*/g, "<b>$1</b>"); }
  function paras(list) { return list.map(function (t) { return "<p>" + rich(t) + "</p>"; }).join(""); }
  function assetAttr(id) {
    var g = (CT.assets || {})[id] || "#888";
    return ' data-asset="' + esc(id) + '" style="background:' + esc(g) + '"';
  }
  // Echte Bilder einhängen: assets/<kennung>.jpg oder .png, falls vorhanden
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
  // Alle Fotos gleich beim Start laden, damit nie ein leerer Farbverlauf zu sehen ist
  function preloadAssets() {
    Object.keys(CT.assets || {}).forEach(function (id) {
      if (assetCache[id]) return;
      assetCache[id] = "pending";
      tryImg(id, ["jpg", "png"], function (src) {
        assetCache[id] = src || false;
        if (src) document.querySelectorAll('[data-asset="' + id + '"]').forEach(function (e) { setBg(e, src); });
      });
    });
  }
  function setBg(el, src) {
    el.style.background = 'center / cover no-repeat url("' + src + '")';
    el.classList.add("asset-loaded");
  }
  function tryImg(id, exts, done) {
    if (!exts.length) return done(null);
    var src = "assets/" + id + "." + exts[0];
    var img = new Image();
    img.onload = function () { done(src); };
    img.onerror = function () { tryImg(id, exts.slice(1), done); };
    img.src = src;
  }
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
    lock: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 10V7a5 5 0 0110 0v3h1a1 1 0 011 1v9a1 1 0 01-1 1H6a1 1 0 01-1-1v-9a1 1 0 011-1zm2 0h6V7a3 3 0 00-6 0z"/></svg>',
    phone: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6.6 10.8a15.2 15.2 0 006.6 6.6l2.2-2.2a1 1 0 011-.25 11.4 11.4 0 003.6.57 1 1 0 011 1V20a1 1 0 01-1 1A17 17 0 013 4a1 1 0 011-1h3.5a1 1 0 011 1c0 1.25.2 2.45.57 3.57a1 1 0 01-.25 1z"/></svg>',
    warn: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2L1 21h22zm-1 7h2v6h-2zm0 8h2v2h-2z"/></svg>',
    status: '<svg viewBox="0 0 58 14" aria-hidden="true"><rect x="0" y="9" width="3" height="5" rx="1"/><rect x="5" y="6" width="3" height="8" rx="1"/><rect x="10" y="3" width="3" height="11" rx="1"/><rect x="15" y="0" width="3" height="14" rx="1"/><path d="M27 4.5a9 9 0 0112 0l-1.4 1.5a7 7 0 00-9.2 0zM29.4 7.2a5.5 5.5 0 017.2 0L35.2 8.7a3.5 3.5 0 00-4.4 0zM33 12.5l-1.7-1.8a2.4 2.4 0 013.4 0z"/><rect x="42" y="2" width="14" height="10" rx="3" fill="none" stroke="currentColor" stroke-width="1.4"/><rect x="44" y="4" width="9" height="6" rx="1.5"/></svg>'
  };
  function iconClass(key) { return (CT.apps[key] || {}).icon || ""; }
  function igHead() {
    return '<div class="ig-head"><span class="ig-plus" aria-hidden="true">' + ICON.plusThin + "</span>" +
      '<span class="ig-title"></span><span class="ig-icons">' + ICON.heartLine + "</span></div>";
  }
  function deNum(n) { return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, "."); }
  function stAv(user, i, own) {
    var slug = own ? "du" : String(user).toLowerCase().replace(/^@/, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    return '<span class="st-av av' + (i % 5) + '" data-asset="av-' + esc(slug) + '" aria-hidden="true">' +
      esc(String(user).charAt(0).toUpperCase()) + "</span>";
  }
  function igStoryBar(list) {
    list = list || ["Deine Story", "lena_k", "tom.reist", "jonas.r", "mia.kocht"];
    return '<div class="st-bar ig-stbar">' + list.map(function (u, i) {
      var own = i === 0;
      return '<div class="st"><span class="st-ring' + (own ? " own" : "") + '">' + stAv(u, i, own) +
        (own ? '<span class="st-plus" aria-hidden="true">+</span>' : "") + '</span><span class="st-name">' + esc(u) + "</span></div>";
    }).join("") + "</div>";
  }
  // Ein Instagram-Beitrag; tgt(key, html) umrahmt Stellen für Übung 1; headAttr markiert die Kopfzeile
  function igPostHtml(post, i, tgt, headAttr, postAttr) {
    tgt = tgt || function (k, h) { return h; };
    var m = /^♡\s*([^·]+?)\s*·\s*(.*)$/.exec(post.line || "");
    var likes = m ? m[1] : "", cap = m ? m[2] : (post.line || "");
    var n = Number(String(likes).replace(/\D/g, "")) || 0;
    var friend = post.user === "lena_k" ? "jonas.r" : "lena_k";
    var act = function (icon, count) { return '<span class="ig-act">' + icon + (count ? "<span>" + esc(count) + "</span>" : "") + "</span>"; };
    return '<div class="ig-post"' + (postAttr || "") + '><div class="ig-post-head"' + (headAttr || "") + ">" + avatar(post.user) +
      '<span class="ig-who">' + tgt("user-" + i, '<span class="user">' + esc(post.user) + "</span>") +
      (post.suggested ? tgt("sugg-" + i, '<span class="sugg">' + esc(post.suggested) + "</span>") : "") + "</span>" +
      '<span class="ig-dots" aria-hidden="true">⋯</span></div>' +
      '<div class="ig-img ig-sq"' + assetAttr(post.asset) + "></div>" +
      '<div class="ig-actions" aria-hidden="true">' +
      act(ICON.heartLine, likes) + act(ICON.commentLine, n ? deNum(Math.round(n / 23) + 2) : "") +
      act(ICON.repostLine, n ? deNum(Math.round(n / 61) + 1) : "") + act(ICON.send, n ? deNum(Math.round(n / 40) + 1) : "") +
      '<span class="ig-save">' + tgt("save-" + i, ICON.bookmark, "w1t-left") + "</span></div>" +
      (n ? '<div class="ig-line"><span class="ig-likes">Gefällt <b>' + esc(friend) + "</b> und <b>" + deNum(n - 1) + " weiteren Personen</b></span></div>" : "") +
      (cap ? '<div class="ig-cap"><b>' + esc(post.user) + "</b> " + esc(cap) + "</div>" : "") +
      '<div class="ig-time">Vor ' + (i + 2) + " Stunden</div></div>";
  }
  function igNavHtml() {
    return '<div class="ig-nav" aria-hidden="true">' + ICON.homeLine + ICON.searchLine + ICON.plusSquare + ICON.reels +
      avatar("du", "ig-nav-av") + "</div>";
  }
  function ttNav(d) {
    var navIcons = [ICON.home, ICON.search, ICON.plus, ICON.inbox, ICON.profile];
    return '<div class="nav" aria-hidden="true">' + d.nav.map(function (n, i) {
      return '<span class="' + (i === 2 ? "plus" : "") + '">' + navIcons[i] + (i === 2 ? "" : esc(n)) + "</span>";
    }).join("") + "</div>";
  }
  function todayDe() {
    try { return new Intl.DateTimeFormat("de-DE", { weekday: "long", day: "numeric", month: "long" }).format(new Date()); }
    catch (e) { return ""; }
  }

  // ── Vorlagen der nachgestellten Screens ────────────────
  // render(p, isB, opt) liefert HTML; toB(body, p) spielt die Reaktion ab (Zustand A → B).
  // Ein Element mit data-mark erhält in Zustand B die rote Umrandung.
  var SCREENS = {
    "tiktok-feed": {
      cls: "tt",
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
          return '<span class="' + (i === d.activeTab ? "on" : "") + '"' + (isB && d.mark === "tab-" + i ? ' data-mark="below"' : "") + ">" + esc(t) + "</span>";
        }).join("") + "</div>" : "";
        return '<div class="feed">' + tabs + '<div class="track' + (isB && !d.static ? " to-b still" : (!d.static ? " peek" : "")) + '">' + posts + "</div>" +
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
      render: function (p, isB, opt) {
        var d = p.data;
        var spot = (opt && opt.spot) || function () { return ""; };
        var tgt = function (key, inner, cls) {
          var s = spot(key);
          return s ? '<span class="w1t ' + (cls || "") + '">' + inner + s + "</span>" : inner;
        };
        var markAttr = function (key) { return isB && d.mark === key ? ' data-mark="' + (d.markPlace || "below") + '"' : ""; };
        var html = igHead();
        html += '<div class="ig-content">';
        if (d.stories !== false) html += igStoryBar(d.stories);
        d.posts.forEach(function (post, i) {
          if (d.scrollFeed && isB && i === 1) html += '<div class="ig-seam"' + markAttr("seam-1") + "></div>";
          html += igPostHtml(post, i, tgt, markAttr("head-" + i), markAttr("post-" + i));
        });
        if (d.loadMore) html += '<div class="ig-loadmore">' + tgt("load", '<span class="ig-spinner" aria-hidden="true"></span>') + "</div>";
        if (d.more) {
          html += tgt("edge", '<div class="ig-post ig-more"><div class="ig-post-head">' + avatar(d.more.user) + '<span class="user">' +
            esc(d.more.user) + '</span><span class="ig-dots" aria-hidden="true">⋯</span></div><div class="ig-img short"' +
            assetAttr(d.more.asset) + "></div></div>", "w1t-block");
        }
        html += "</div>" + igNavHtml();
        return html;
      },
      toB: function (body, p) {
        if (!p.data.scrollFeed) return Promise.resolve();
        var content = body.querySelector(".ig-content");
        var dy = feedScrollDy(body);
        content.style.transition = "transform " + ms(350) + "ms cubic-bezier(.2,.7,.2,1)";
        content.style.transform = "translateY(-" + Math.round(dy) + "px)";
        return wait(ms(360));
      },
      afterB: function (body, p) {
        if (!p.data.scrollFeed) return;
        var content = body.querySelector(".ig-content");
        content.style.transition = "none";
        content.style.marginTop = -feedScrollDy(body) + "px";
      }
    },

    // Übung 1 für TikTok (seit 18.10.): Reiter, laufendes Video, unten liegt das nächste schon bereit
    "tt-w1": {
      cls: "tt",
      render: function (p, isB, opt) {
        var d = p.data;
        var spot = (opt && opt.spot) || function () { return ""; };
        var tgt = function (key, inner, cls) {
          var s = spot(key);
          return s ? '<span class="w1t ' + (cls || "") + '">' + inner + s + "</span>" : inner;
        };
        var v = d.post, n = d.next;
        return '<div class="feed ttw1">' +
          '<div class="tt-tabs"><span>Folge ich</span>' + tgt("tab-1", '<span class="on">Für dich</span>') + "</div>" +
          '<div class="ttw1-post"><div class="post-bg"' + assetAttr(v.asset) + "></div>" +
          '<div class="meta"><div class="user">' + esc(v.user) + '</div><div class="cap">' + esc(v.caption) + "</div></div>" +
          '<div class="side"><span>' + ICON.heart + esc(v.likes) + "</span><span>" + ICON.comment + esc(v.comments) + "</span>" +
          tgt("share", "<span>" + ICON.share + esc(d.share) + "</span>") + "</div></div>" +
          tgt("peek", '<div class="ttw1-next"><div class="post-bg"' + assetAttr(n.asset) + '></div><div class="ttw1-next-user">' +
            esc(n.user) + "<span>" + esc(n.caption) + "</span></div></div>", "w1t-block") +
          "</div>" + ttNav(d);
      },
      toB: function () { return Promise.resolve(); }
    },

    "reels": {
      cls: "rl",
      // Video-Feed mit Sofortstart. Zustand B: Balken läuft und springt am Ende auf den Anfang (Schleife).
      render: function (p, isB) {
        var d = p.data;
        var loop = Number(d.loopSeconds || 4);
        var videos = d.videos.map(function (v, i) {
          var live = isB && i === 1;
          var hidden = (!isB && i > 0) || (isB && i === 0);
          return '<div class="post"' + (hidden ? ' aria-hidden="true"' : "") + "><div class=\"post-bg\"" + assetAttr(v.asset) + "></div>" +
            '<div class="meta"><div class="user">' + esc(v.user) + '</div><div class="cap">' + esc(v.caption) + "</div></div>" +
            '<div class="side"><span>' + ICON.heart + esc(v.likes || "") + "</span><span>" + ICON.comment + esc(v.comments || "") + "</span><span>" +
            (d.nav ? ICON.share + esc(d.share || "") : ICON.send) + "</span></div>" +
            '<div class="bar"><span class="' + (live ? "run" : "") + '" style="' +
            (live ? "animation-duration:" + loop + "s" : "width:" + Number(v.progress || 0) + "%") + '"></span></div>' +
            "</div>";
        }).join("");
        return '<div class="feed"><div class="track' + (isB ? " to-b still" : "") + '">' + videos + "</div></div>" +
          (d.nav ? ttNav(d) : '<div class="nav" aria-hidden="true"><span>' + ICON.home + "</span><span>" + ICON.search + "</span><span>" +
            ICON.play + "</span><span>" + ICON.send + "</span><span>" + ICON.profile + "</span></div>");
      },
      toB: function (body) {
        body.querySelector(".track").classList.add("to-b");
        return wait(ms(360));
      }
    },

    "lockscreen": {
      cls: "lock",
      scroll: function () { return true; },
      // opt.sel: Auswahl, die angezeigt wird (Schritt „Ausprobieren“ und Rückblick)
      render: function (p, isB, opt) {
        var d = p.data;
        var r = state.patterns[p.id];
        var sel = (opt && opt.sel) || picks;
        var html = isB ? "" : '<div class="lock-clock">' + esc(d.time) + '</div><div class="lock-date">' + esc(todayDe()) + "</div>";
        html += '<div class="lock-list">';
        d.items.forEach(function (it, i) {
          var n = i + 1;
          var inner = '<span class="app-icon ' + iconClass(it.app) + '" aria-hidden="true"></span>' +
            '<span class="note-main"><span class="note-top"><strong>' + esc(appLabel(it.app)) + "</strong><span>" + esc(it.time) + "</span></span>" +
            '<span class="note-text">' + esc(it.text) + "</span></span>";
          if (!isB) {
            html += '<button type="button" class="note" data-n="' + n + '" aria-pressed="' + (sel.indexOf(n) >= 0) + '">' + inner + "</button>";
          } else {
            var mine = r && r.selected.indexOf(n) >= 0 && !exportMode;
            html += '<div class="note ' + (it.human ? "human" : "app") + (opt && opt.animate ? " fade-in" : "") + '">' + inner +
              (mine ? '<span class="picked">' + ICON.check + '<span class="sr-only">' + esc(UI.selectedByYou) + "</span></span>" : "") +
              '<span class="note-tag">' + esc(it.human ? d.labelHuman : d.labelApp) + "</span></div>";
          }
        });
        return html + "</div>";
      },
      toB: function () { return Promise.resolve(); }
    },

    // ───────────── Placebo: nachgestellte Screens ohne echte Marken ─────────────
    "pw-reuse": {
      cls: "pw",
      scroll: function () { return true; },
      render: function (p, isB) {
        var d = p.data;
        return '<div class="pw-title">Meine Konten</div><div class="pw-list">' + d.accounts.map(function (a, i) {
          var flag = "";
          if (isB && a.leak) flag = '<span class="pw-flag leak">' + ICON.warn + esc(d.leakLabel) + "</span>";
          else if (isB) flag = '<span class="pw-flag alert">' + ICON.warn + esc(d.alertLabel) + "</span>";
          return '<div class="pw-acc' + (isB ? (a.leak ? " is-leak" : " is-alert") : "") + '"' + (isB && i === 1 ? ' data-mark="inside"' : "") + ">" +
            '<div class="pw-acc-top"><b>' + esc(a.name) + '</b><span class="pw-kind">' + esc(a.kind) + "</span></div>" +
            '<div class="pw-acc-row"><span>' + esc(d.email) + '</span><span class="pw-dots">●●●●●●●●●●●</span></div>' + flag + "</div>";
        }).join("") + '</div><p class="pw-same">Überall dasselbe Passwort</p>';
      },
      toB: function (body) {
        var rows = body.querySelectorAll(".pw-acc");
        if (rows[0]) rows[0].classList.add("is-leak");
        return wait(ms(500));
      },
      // Rahmen um alle drei übernommenen Konten
      markAll: ".pw-acc.is-alert"
    },

    "pw-phish": {
      cls: "pw",
      scroll: function () { return true; },
      render: function (p, isB, opt) {
        var d = p.data;
        var spot = (opt && opt.spot) || function () { return ""; };
        var tgt = function (key, inner, cls) { var s = spot(key); return s ? '<span class="w1t ' + (cls || "") + '">' + inner + s + "</span>" : inner; };
        var urlHtml = isB ? esc(d.url.replace(d.urlMain, "")) + "<b>" + esc(d.urlMain) + "</b>" + (d.url.indexOf("/") >= 0 ? "" : "")
          : esc(d.url);
        if (isB) urlHtml = esc(d.url.split(d.urlMain)[0]) + "<b>" + esc(d.urlMain) + "</b>" + esc(d.url.split(d.urlMain)[1] || "");
        return '<div class="pw-browser"><div class="pw-urlbar' + (isB ? " zoom" : "") + '"' + (isB ? ' data-mark="inside"' : "") + ">" +
          tgt("url", '<span class="pw-url">' + ICON.lock + "<span>" + urlHtml + "</span></span>", "w1t-block") + "</div></div>" +
          '<div class="pw-page">' +
          tgt("banner", '<div class="pw-banner">' + ICON.warn + "<span>" + esc(d.banner) + "</span></div>", "w1t-block") +
          '<div class="pw-logo"><span class="pw-logo-mark">M</span>' + esc(d.bank) + "</div>" +
          '<div class="pw-form"><label>Benutzername</label><div class="pw-input"></div><label>Passwort</label><div class="pw-input"></div>' +
          '<div class="pw-btn">Anmelden</div>' + tgt("forgot", '<span class="pw-link">Passwort vergessen?</span>') + "</div></div>";
      },
      toB: function () { return wait(ms(300)); }
    },

    "pw-2fa": {
      cls: "lock",
      scroll: function () { return true; },
      render: function (p, isB) {
        var d = p.data;
        var html = '<div class="lock-clock">' + esc(UI.statusTime) + '</div><div class="lock-date">' + esc(todayDe()) + "</div>" +
          '<div class="lock-list"><div class="note"><span class="app-icon ai-msg" aria-hidden="true"></span><span class="note-main">' +
          '<span class="note-top"><strong>Nachrichten</strong><span>jetzt</span></span><span class="note-text">' + esc(d.sms) + "</span></span></div>";
        if (isB) {
          html += '<div class="note pw-alert"' + ' data-mark="inside"><span class="app-icon pw-ai-bank" aria-hidden="true">M</span><span class="note-main">' +
            '<span class="note-top"><strong>Musterbank</strong><span>jetzt</span></span><span class="note-text">' + esc(d.loginAlert) + "</span></span></div>";
        }
        html += "</div>";
        html += '<div class="pw-call"><div class="pw-call-who">' + ICON.phone + "<b>" + esc(d.caller) + "</b><span>Anruf läuft · 0:42</span></div>" +
          '<p class="pw-call-text">' + esc(d.callText) + "</p></div>";
        return html;
      },
      toB: function () { return wait(ms(300)); }
    },

    "pw-strength": {
      cls: "pw",
      scroll: function () { return true; },
      render: function (p, isB) {
        var d = p.data;
        var html = '<div class="pw-browser"><div class="pw-urlbar"><span class="pw-url">' + ICON.lock + "<span>" +
          esc(d.site.toLowerCase()) + ".example/registrieren</span></span></div></div>" +
          '<div class="pw-page"><div class="pw-logo"><span class="pw-logo-mark">S</span>' + esc(d.site) + "</div>" +
          '<div class="pw-form"><label>Neues Passwort</label><div class="pw-input pw-filled">' + esc(d.password) + "</div>" +
          '<div class="pw-meter"><span></span><span></span><span></span><span></span></div><div class="pw-meter-label">Stärke: <b>' + esc(d.meterLabel) + "</b></div>" +
          '<div class="pw-btn">Konto anlegen</div></div>';
        if (isB) {
          html += '<div class="pw-cracker" data-mark="inside"><div class="pw-cracker-head">Angriffsprogramm</div>' +
            d.tries.map(function (t, i) {
              var hit = i === d.tries.length - 1;
              return '<div class="pw-try' + (hit ? " hit" : "") + '"><span>' + esc(t) + "</span><span>" + (hit ? "Treffer" : "falsch") + "</span></div>";
            }).join("") + "</div>";
        }
        return html + "</div>";
      },
      toB: function () { return wait(ms(300)); }
    }
  };

  // ── Handy-Rahmen ───────────────────────────────────────
  var DEVICE_W = 410, DEVICE_H = 800;
  function bodyOnly(html) {
    return html.replace(/^<div class="ig-head">[\s\S]*?<\/div>/, "").replace(/<div class="ig-nav"[\s\S]*?<\/div>$/, "");
  }
  function deviceHtml(cls, bodyHtml, scroll) {
    var head = "", foot = "";
    bodyHtml = bodyHtml.replace(/^<div class="ig-head">[\s\S]*?<\/div>/, function (m) { head = m; return ""; });
    bodyHtml = bodyHtml.replace(/<div class="ig-nav"[\s\S]*?<\/div>$/, function (m) { foot = m; return ""; });
    return '<div class="device-wrap" data-size="full"><div class="device ' + cls + '">' +
      '<div class="device-status"><span class="device-tag">' + esc(UI.screenTag) + '</span>' +
      '<span class="device-time">' + esc(UI.statusTime) + '</span><span class="device-icons">' + ICON.status + "</span></div>" +
      head + '<div class="screen-body' + (scroll ? " scroll" : "") + '">' + bodyHtml + "</div>" + foot + "</div></div>";
  }
  function fitDevice() {
    var wrap = app.querySelector(".lp-stage > .device-wrap");
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
    // Schritt „Antwort“ (ask): Screen in voller Breite, die Frage steht darunter (Seite scrollt)
    if (wrap.getAttribute("data-size") === "wide") s = Math.min(0.8, availW / DEVICE_W);
    // Ausprobieren/Ergebnis: nicht kleiner als 0.62, lieber scrollt die Seite ein Stück (18.10.)
    s = Math.max(small ? 0.2 : Math.min(0.62, availW / DEVICE_W), s);
    wrap.classList.add("no-anim");
    dev.style.transform = "scale(" + s.toFixed(4) + ")";
    wrap.style.width = Math.round(DEVICE_W * s) + "px";
    wrap.style.height = Math.round(DEVICE_H * s) + "px";
  }
  function feedScrollDy(body) {
    var content = body.querySelector(".ig-content"), img = body.querySelector(".ig-post .ig-img");
    if (!content || !img) return 0;
    var k = body.getBoundingClientRect().width / body.offsetWidth || 1;
    return Math.max(0, Math.round((img.getBoundingClientRect().bottom - content.getBoundingClientRect().top) / k - 150));
  }
  // Rote Umrandung um Elemente mit data-mark (bzw. alle Treffer von markAll), im unskalierten Screen
  function placeMark(body) {
    body.querySelectorAll(".mark").forEach(function (el) { el.remove(); });
    var pg = pages[state.page];
    if (!pg || !pg.pattern) return;
    var tpl = SCREENS[pg.pattern.screen];
    var targets = tpl.markAll ? body.querySelectorAll(tpl.markAll) : [body.querySelector("[data-mark]")];
    var br = body.getBoundingClientRect();
    var k = br.width / body.offsetWidth || 1;
    Array.prototype.forEach.call(targets, function (t) {
      if (!t) return;
      var r = t.getBoundingClientRect();
      var inside = t.getAttribute("data-mark") === "inside" || !!tpl.markAll;
      var pad = inside ? -2 : 4, W = body.clientWidth, H = body.scrollHeight;
      var left = Math.max(3, (r.left - br.left) / k - pad), right = Math.min(W - 3, (r.right - br.left) / k + pad);
      var top = Math.max(3, (r.top - br.top) / k + body.scrollTop - pad), bottom = Math.min(H - 3, (r.bottom - br.top) / k + body.scrollTop + pad);
      if (right - left < 44) { var cx = (left + right) / 2; left = Math.max(3, cx - 22); right = Math.min(W - 3, cx + 22); }
      if (bottom - top < 44) { var cy = (top + bottom) / 2; top = Math.max(3, cy - 22); bottom = Math.min(H - 3, cy + 22); }
      var mark = document.createElement("div");
      mark.className = "mark fade-in";
      mark.setAttribute("role", "img");
      mark.setAttribute("aria-label", UI.markPrefix + (pg.pattern.markLabel || ""));
      mark.style.cssText = "left:" + left + "px;top:" + top + "px;width:" + (right - left) + "px;height:" + (bottom - top) + "px";
      body.appendChild(mark);
    });
  }
  var resizeTimer;
  window.addEventListener("resize", function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function () {
      fitDevice();
      var body = app.querySelector(".lp-stage .screen-body");
      if (body && (state.sub === "react" || state.sub === "explain")) placeMark(body);
    }, 120);
  });

  // ── Rendern ────────────────────────────────────────────
  function render() {
    var pg = pages[state.page];
    if (!previewKey) window.scrollTo(0, 0);
    if (pg.type === "start") renderStart();
    else if (pg.type === "pattern") renderPattern(pg);
    else if (pg.type === "recognition") renderRecognition(pg);
    else if (pg.type === "einordnung") renderEinordnung();
    else renderSummary();
    applyAssets(app);
    addBackButton();
    addContactLine();
    updateProgress();
  }
  function addContactLine() {
    var mail = window.STUDY_CONFIG && window.STUDY_CONFIG.CONTACT_EMAIL;
    var foot = app.querySelector(".lp-foot");
    if (!mail || !foot || previewKey || foot.querySelector(".contact-line")) return;
    var p = document.createElement("p");
    p.className = "contact-line";
    p.innerHTML = 'Technische Probleme? Schreib an <a href="mailto:' + esc(mail) + '">' + esc(mail) + "</a>.";
    foot.appendChild(p);
  }
  // Nach JEDEM Neuzeichnen (auch Schrittwechsel innerhalb einer Seite) Fotos, Zurück, Kontaktzeile
  // und Fortschritt ergänzen (18.10.: vorher fehlte „Zurück“ z. B. nach „Antwort festlegen“)
  if (window.MutationObserver) {
    new MutationObserver(function () {
      if (!pages.length || !state) return;
      applyAssets(app); addBackButton(); addContactLine(); updateProgress();
    }).observe(app, { childList: true });
  }
  function addReviewNote() {
    var panel = app.querySelector(".lp-panel") || app.querySelector(".tp-body");
    if (!panel || panel.querySelector(".review-note")) return;
    var n = document.createElement("p");
    n.className = "review-note";
    n.textContent = UI.reviewNote;
    panel.insertBefore(n, panel.firstChild);
  }
  // „Zurück“: einen Schritt zurück; dort ist alles nur noch Ansicht. Auf der Startseite
  // gibt es kein Zurück (der Fragebogen davor ist abgeschlossen).
  function addBackButton() {
    if (previewKey || state.page === 0) return;
    var foot = app.querySelector(".lp-foot");
    if (!foot || foot.querySelector(".btn-back")) return;
    var b = document.createElement("button");
    b.type = "button";
    b.className = "btn secondary btn-back";
    b.textContent = UI.back;
    b.addEventListener("click", stepBack);
    foot.classList.add("with-back");
    foot.insertBefore(b, foot.firstChild);
  }
  function updateProgress() {
    var foot = app.querySelector(".lp-foot");
    if (!foot || !pages.length) return;
    var bar = foot.querySelector(".progress-track");
    if (!bar) {
      bar = document.createElement("div");
      bar.className = "progress-track";
      bar.setAttribute("aria-hidden", "true");
      bar.innerHTML = '<div class="progress-fill"></div>';
      foot.insertBefore(bar, foot.querySelector(".contact-line") || null);
    }
    var s = stepsOf(pages[state.page]);
    var done = state.page + (stepIndex(state.page, state.sub) + 1) / s.length;
    bar.firstChild.style.width = Math.round(100 * done / pages.length) + "%";
  }

  // Kopfzeile: „Muster x von 4“ (bzw. „Übung x von 2“), rechts die App; darunter die Schrittanzeige
  function lpHead(left, right) {
    return '<div class="lp-head"><span class="lp-step">' + esc(left) + "</span>" +
      (right ? '<span class="lp-app">' + esc(right) + "</span>" : "") + "</div>";
  }
  function stepperHtml(current) {
    return '<ol class="stepper" aria-label="Schritte">' + UI.steps.map(function (label, i) {
      var cls = i < current ? "done" : (i === current ? "now" : "todo");
      return '<li class="' + cls + '"' + (i === current ? ' aria-current="step"' : "") + '><span class="dot">' +
        (i < current ? ICON.check : String(i + 1)) + '</span><span class="lbl">' + esc(label) + "</span></li>";
    }).join('<li class="sep" aria-hidden="true"></li>') + "</ol>";
  }
  var STEP_OF = { ask: 0, try: 1, react: 1, explain: 2 };

  // ── Startseite ─────────────────────────────────────────
  function renderStart() {
    var S = C.start;
    app.innerHTML = '<div class="page tp"><div class="tp-body start-body">' +
      "<h1>" + esc(S.title) + "</h1><p>" + rich(S.lead) + "</p>" +
      '<ul class="start-list">' + S.points.map(function (t) { return "<li>" + rich(t) + "</li>"; }).join("") + "</ul>" +
      '<p class="start-note">' + esc(S.note) + "</p></div>" +
      '<div class="lp-foot"><button class="btn" id="next" type="button">' + esc(S.button) + "</button></div></div>";
    focusFirst("h1");
    app.querySelector("#next").addEventListener("click", function () {
      if (previewKey) return;
      if (!isReview()) state.pageSeconds.start = secondsSince(state.pageStart);
      if (!state.startedAt) state.startedAt = isoNow();
      goto(1);
    });
  }

  // ── Musterseiten ───────────────────────────────────────
  function renderPattern(pg) {
    var p = pg.pattern;
    var tpl = SCREENS[p.screen];
    if (stepsOf(pg).indexOf(state.sub) < 0) state.sub = "ask";
    var isB = state.sub === "react" || state.sub === "explain";
    var right = p.screenApp === "lock" ? UI.lockLabel : (mode === "g2" ? "" : appLabel(p.screenApp));
    var sel = state.patterns[p.id] && state.patterns[p.id].selected;
    app.innerHTML =
      '<div class="page lp">' + lpHead(fill(UI.unitOf, { x: pg.index, n: pg.total }), right) +
      '<div class="lp-steps">' + stepperHtml(STEP_OF[state.sub]) + "</div>" +
      (p.fallback ? '<div class="fallback-note">' + esc(fill(UI.fallbackNote, { app: appLabel(p.targetApp) })) + "</div>" : "") +
      '<main class="lp-stage"><p class="lp-ctx" id="ctx"></p>' +
      deviceHtml(tpl.cls, tpl.render(p, isB, { sel: state.sub === "ask" ? picks : (sel || picks) }), tpl.scroll && tpl.scroll()) +
      '<div class="lp-panel"></div></main>' +
      '<div class="lp-foot"><button class="btn" id="main" type="button"></button></div></div>';
    applyAssets(app); // Fotos bei JEDEM Neuzeichnen einsetzen (vorher fehlten sie nach „Antwort festlegen“)
    showPhase(pg, state.sub);
  }
  function sizeFor(p, phase) {
    if (phase === "explain") return "small";
    if (phase === "ask" && p.type !== "multi") return "wide"; // groß, Frage darunter (18.10.)
    return "full";
  }
  function ctxFor(p, phase) {
    if (phase === "ask") return p.ctxAsk || p.ctxA;
    if (phase === "try") return p.ctxA;
    var t = p.ctxB || p.ctxA;
    var r = state.patterns[p.id];
    if (p.ctxBYou && r && !exportMode) t += " " + fill(p.ctxBYou, { n: r.selected.length });
    return t;
  }
  function panelHtml(p, phase) {
    var r = state.patterns[p.id] || {};
    if (phase === "ask") {
      if (p.type === "multi") return '<p class="panel-hint">' + esc(UI.multiHint) + "</p>";
      return '<fieldset class="q-card"><legend class="q" id="q">' + esc(p.question) + "</legend>" +
        p.options.map(function (o, i) {
          return '<label class="opt"><input type="radio" name="ans" value="' + (i + 1) + '"' + (r.answer === i + 1 ? " checked" : "") + "><span>" + esc(o) + "</span></label>";
        }).join("") + "</fieldset>";
    }
    if (phase === "try") {
      var mine = p.type === "multi" ? fill(UI.yourSelection, { n: (r.selected || []).length })
        : fill(UI.yourPrediction, { a: p.options[(r.answer || 1) - 1] });
      return '<div class="try-card"><p class="try-mine">' + esc(mine) + '</p>' + (p.tryText ? '<p class="try-hint" id="callout">' + esc(p.tryText) + "</p>" : "") + "</div>";
    }
    if (phase === "react") {
      var text = p.type === "multi" ? (exportMode ? "" : fill(p.resultLine, { x: r.hits, y: r.falseAlarms })) : p.hint;
      return text ? '<div class="callout" id="callout" role="status">' + esc(text) + "</div>" : "";
    }
    if (phase === "explain") {
      var verdict = "";
      if (p.type !== "multi" && !exportMode && r.answer) {
        verdict = '<p class="verdict">' + esc(r.isCorrect ? UI.predictionRight
          : fill(UI.predictionWrong, { a: p.options[r.answer - 1] || "–", c: p.options[p.correct - 1] })) + "</p>";
      }
      return '<section class="ex-card"><h2 id="ex-title">' + esc(p.name) + "</h2>" + verdict +
        '<dl class="lines">' +
        "<div><dt>" + esc(UI.labelWas) + "</dt><dd>" + esc(p.was) + "</dd></div>" +
        "<div><dt>" + esc(UI.labelWirkung) + "</dt><dd>" + esc(p.wirkung) + "</dd></div>" +
        "<div><dt>" + esc(UI.labelZweck) + "</dt><dd>" + esc(p.zweck) + "</dd></div>" +
        (mode === "g4" && p.regel ? '<div class="regel"><dt>' + esc(UI.labelRegel) + "</dt><dd>" + esc(p.regel) + "</dd></div>" : "") +
        "</dl></section>";
    }
    return "";
  }
  function isLastUnit(pg) { return pg.index === pg.total; }

  function showPhase(pg, phase) {
    var p = pg.pattern;
    var tpl = SCREENS[p.screen];
    var isB = phase === "react" || phase === "explain";
    var stage = app.querySelector(".lp-stage");
    var ctx = app.querySelector("#ctx"), panel = app.querySelector(".lp-panel"), btn = app.querySelector("#main");
    var body = app.querySelector(".lp-stage .screen-body");
    ctx.textContent = ctxFor(p, phase);
    panel.innerHTML = panelHtml(p, phase);
    stage.setAttribute("data-phase", phase);
    app.querySelector(".lp-stage > .device-wrap").setAttribute("data-size", sizeFor(p, phase));
    fitDevice();
    if (isB && tpl.afterB) tpl.afterB(body, p);
    if (isB) placeMark(body);
    btn.disabled = false;
    btn.onclick = null;

    if (phase === "ask") {
      btn.textContent = UI.btnFix;
      btn.disabled = true;
      if (p.type === "multi") bindToggles(".lp-stage .note", function () { btn.disabled = picks.length === 0; });
      else app.querySelectorAll('input[name="ans"]').forEach(function (inp) {
        inp.addEventListener("change", function () { btn.disabled = false; });
      });
      if (p.type !== "multi" && app.querySelector('input[name="ans"]:checked')) btn.disabled = false;
      btn.onclick = function () { fixAnswer(pg); };
      addQuestionHint(app.querySelector(".lp-panel .q-card"));
      focusFirst("#ctx");
    } else if (phase === "try") {
      btn.textContent = UI.btnTry;
      app.querySelectorAll(".lp-stage .note").forEach(function (el) { el.disabled = true; });
      btn.onclick = function () { tryIt(pg); };
      focusFirst("#ctx");
    } else if (phase === "react") {
      btn.textContent = UI.btnExplain;
      btn.onclick = function () { state.sub = "explain"; state.pageStart = Date.now(); save(); renderPattern(pg); };
      focusFirst("#callout") || focusFirst("#ctx");
    } else {
      btn.textContent = isLastUnit(pg) ? UI.btnToExercises : UI.btnNextUnit;
      btn.onclick = function () {
        var r = state.patterns[p.id];
        if (r && !isReview()) {
          if (r.secondsB == null) r.secondsB = secondsSince(state.bStart || state.pageStart);
          r.secondsC = secondsSince(state.pageStart);
          var s = pg.shown || {};
          dbSave("p" + p.id, "P" + p.id,
            Object.assign({}, r, { app: s.app || p.targetApp, screen: s.screen || p.screenApp, fallback: !!(s.fallback || p.fallback) },
              mode === "g4" && p.regel ? { regel: true } : {}),
            (r.secondsA || 0) + (r.secondsB || 0) + (r.secondsC || 0));
        }
        goto(state.page + 1);
      };
      focusFirst("#ex-title");
    }
    if (isReview()) reviewPhase(pg, phase, btn);
  }

  // Frage unter dem großen Screen: schwebender Hinweis „↓ Zur Frage“, bis sie im Bild ist (18.10.)
  function addQuestionHint(q) {
    if (!q || previewKey || !window.IntersectionObserver) return;
    var pill = document.createElement("button");
    pill.type = "button";
    pill.className = "q-hint in-stage";
    pill.textContent = "↓ Zur Frage";
    pill.hidden = true;
    pill.addEventListener("click", function () { q.scrollIntoView({ behavior: "smooth", block: "start" }); });
    var stage = app.querySelector(".lp-stage"), wrap = stage && stage.querySelector(".device-wrap");
    if (!wrap) return;
    stage.insertBefore(pill, wrap.nextSibling); // klebt unten im scrollenden Bereich, über den Knöpfen
    var io = new IntersectionObserver(function (es) {
      if (es[0].isIntersecting) { pill.remove(); io.disconnect(); }
      else pill.hidden = false;
    }, { threshold: 0.6 });
    io.observe(q.querySelector("legend") || q);
  }

  // Zurückgegangen: frühere Antworten zeigen, nichts mehr änderbar, Weiter = nächster Schritt
  function reviewPhase(pg, phase, btn) {
    app.querySelectorAll(".lp-panel input, .lp-panel textarea, .lp-stage .note").forEach(function (el) { el.disabled = true; });
    btn.disabled = false;
    btn.onclick = stepForward;
    addReviewNote();
  }

  // Schritt 1 abschließen: Antwort festlegen
  function fixAnswer(pg) {
    var p = pg.pattern;
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
    state.sub = "try";
    state.pageStart = Date.now();
    save();
    renderPattern(pg);
  }

  // Schritt 2: Ausprobieren – die App reagiert, dann Markierung und Hinweis
  function tryIt(pg) {
    var p = pg.pattern, tpl = SCREENS[p.screen];
    var btn = app.querySelector("#main");
    if (btn.disabled) return;
    btn.disabled = true;
    var backBtn = app.querySelector(".btn-back");
    if (backBtn) backBtn.disabled = true;
    state.bStart = state.pageStart;
    var body = app.querySelector(".lp-stage .screen-body");
    var panel = app.querySelector(".lp-panel");
    panel.classList.add("reserved");
    Promise.resolve(tpl.toB(body, p)).then(function () {
      state.sub = "react";
      save();
      renderPattern(pg);
      var ctxEl = app.querySelector("#ctx");
      ctxEl.classList.remove("changed"); void ctxEl.offsetWidth; ctxEl.classList.add("changed");
      var pn = app.querySelector(".lp-panel");
      if (pn) pn.classList.add("fade-in");
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

  // ── Übungen ────────────────────────────────────────────
  function renderRecognition(pg) {
    var it = pg.item;
    if (stepsOf(pg).indexOf(state.sub) < 0) state.sub = "ask";
    var isB = state.sub === "react";
    var r = state.recognition[it.id];
    var head = lpHead(fill(UI.exerciseOf, { x: pg.index, n: C.recognition.length }), it.app);
    var middle, cards = null;
    if (it.type === "spots") {
      var rt = w1Runtime(it);
      var itR = Object.assign({}, it, { data: rt.data });
      var tpl = SCREENS[it.screen];
      middle = deviceHtml(tpl.cls + " w1", tpl.render(itR, false, { spot: function (key) { return spotHtml(itR, rt, key, isB, r); } }), true);
    } else {
      cards = w2Cards(it);
      middle = '<div class="cards-list">' + cards.map(function (c, i) {
        var n = i + 1;
        var lab = it.appLabels ? it.appLabels[c.app] : appLabel(c.app);
        var icon = it.appLabels ? (c.app === "sms" ? "ai-msg" : "ai-mail") : iconClass(c.app);
        var inner = '<div class="w2-top"><span class="app-icon ' + icon + '" aria-hidden="true"></span>' +
          '<span class="card-text"><strong>' + esc(lab) + "</strong><span>" + esc(c.text) + "</span></span></div>";
        if (!isB) {
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
        : '<p class="feedback ' + (!r || r.isCorrect || exportMode ? "good" : "neutral") + (previewKey ? "" : " fade-in") + '" id="fb">' +
          esc(exportMode || !r ? "" : fill(it.feedbackScore, { k: r.hits, n: r.answers.length })) + "</p>";
    }
    var ctxText = it.type === "cards" ? fill(it.ctx, { count: ({ 2: "Zwei", 3: "Drei" })[w2Cards(it).length] || "" }) : it.ctx;
    app.innerHTML = '<div class="page lp">' + head +
      '<main class="lp-stage" data-phase="' + (isB ? "react" : "ask") + '"><p class="lp-ctx" id="ctx">' + esc(ctxText) + "</p>" +
      middle + '<div class="lp-panel">' + panel + "</div></main>" +
      '<div class="lp-foot"><button class="btn" id="main" type="button"></button></div></div>';
    applyAssets(app);
    var wrap = app.querySelector(".lp-stage > .device-wrap");
    if (wrap) wrap.setAttribute("data-size", "full");
    fitDevice();

    var btn = app.querySelector("#main");
    var lastBeforeEnd = pg.index === C.recognition.length;
    if (isB) {
      btn.textContent = UI.next;
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
    btn.textContent = UI.btnCheck;
    focusFirst("#ctx");
    if (isReview()) {
      if (r && r.answers) r.answers.forEach(function (a, i) {
        var x = app.querySelector('input[name="w2-' + (i + 1) + '"][value="' + (a.saidHuman ? "human" : "app") + '"]');
        if (x) x.checked = true;
      });
      app.querySelectorAll(".spot, .w2-choice input").forEach(function (el) { el.disabled = true; });
      btn.textContent = UI.next;
      btn.onclick = stepForward;
      addReviewNote();
      return;
    }
    btn.disabled = true;
    if (it.type === "spots") {
      bindToggles(".spot", function () { btn.disabled = picks.length === 0; });
    } else {
      var allAnswered = function () {
        return cards.every(function (c, i) { return app.querySelector('input[name="w2-' + (i + 1) + '"]:checked'); });
      };
      app.querySelectorAll(".w2-choice input").forEach(function (inp) {
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
          var s = app.querySelector('input[name="w2-' + (i + 1) + '"]:checked');
          return s ? s.value : null;
        });
        if (choices.indexOf(null) >= 0) return;
        state.recognition[it.id] = w2Result(it, cards, choices);
      }
      state.sub = "react";
      save();
      renderRecognition(pg);
      applyAssets(app);
      addBackButton(); addContactLine(); updateProgress();
    };
    void lastBeforeEnd;
  }
  function spotHtml(it, rt, key, isB, r) {
    var n = rt.data.spots[key];
    if (!n) return "";
    var meta = rt.meta.filter(function (m) { return m.n === n; })[0] || {};
    var label = UI.spotPrefix + n + ": " + (meta.label || "");
    if (!isB) {
      return '<button type="button" class="spot spot-' + esc(key) + '" data-n="' + n + '" aria-pressed="' + (picks.indexOf(n) >= 0) +
        '" aria-label="' + esc(label) + '"><span>' + n + "</span></button>";
    }
    var target = rt.targets.indexOf(n) >= 0;
    var mine = r && r.selected.indexOf(n) >= 0 && !exportMode;
    return '<span class="spot spot-' + esc(key) + (target ? " target" : " miss") + (mine ? " mine" : "") + '" role="img" aria-label="' +
      esc(label + (mine ? ", " + UI.selectedByYou : "")) + '"><span>' + n + "</span></span>";
  }
  // Übung 2: zwei bis drei Karten – nur genutzte Apps, mindestens eine von jeder Sorte, fest je Code.
  // Placebo: Karten ohne App-Bezug (SMS, E-Mail), immer drei.
  function w2Cards(it) {
    var rnd = seededRandom(hashCode(String(state.code || "") + "w2"));
    function shuffled(list) {
      var l = list.slice();
      for (var i = l.length - 1; i > 0; i--) { var j = Math.floor(rnd() * (i + 1)); var t = l[i]; l[i] = l[j]; l[j] = t; }
      return l;
    }
    var pool = it.cardPool;
    if (!it.appLabels) {
      var used = (state.apps || []).filter(function (a) { return CT.appOrder.indexOf(a) >= 0; });
      if (!used.length) used = ["ig"];
      pool = it.cardPool.filter(function (c) { return used.indexOf(c.app) >= 0; });
    }
    var igOf = function (human) { return it.cardPool.filter(function (c) { return c.app === "ig" && !!c.human === human; }); };
    var humans = shuffled(pool.filter(function (c) { return c.human; }));
    var others = shuffled(pool.filter(function (c) { return !c.human; }));
    if (!humans.length) humans = shuffled(igOf(true));
    if (!others.length) others = shuffled(igOf(false));
    var out = [humans.shift(), others.shift()].filter(Boolean);
    while (out.length < 3 && others.length) out.push(others.shift());
    while (out.length < 3 && humans.length) out.push(humans.shift());
    return shuffled(out);
  }
  function w2Result(it, cards, choices) {
    var answers = cards.map(function (c, i) {
      var saidHuman = choices[i] === "human";
      return { app: c.app, text: c.text, isHuman: !!c.human, saidHuman: saidHuman, correct: saidHuman === !!c.human };
    });
    var hits = answers.filter(function (a) { return a.correct; }).length;
    return { id: it.id, answers: answers, hits: hits, isCorrect: hits === answers.length, seconds: null };
  }
  function spotsFeedbackHtml(it, r, rt) {
    var rows = rt.meta.map(function (m) {
      var name = m.pattern ? patternDef(m.pattern).short : it.noPatternLabel;
      var tapped = r && !exportMode && r.selected.indexOf(m.n) >= 0;
      var cls = m.pattern ? (tapped ? "hit" : "open") : (tapped ? "wrong" : "plain");
      return '<li class="' + cls + '"><b>' + m.n + "</b> " + esc(name) + "</li>";
    }).join("");
    var score = exportMode || !r ? "" : '<p class="fb-score">' + esc(fill(it.feedbackScore, { k: r.hits, n: rt.targets.length })) + "</p>";
    return '<ul class="fb-list">' + rows + "</ul>" + score;
  }

  // ── Einordnung und Zusammenfassung ─────────────────────
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
  function scores() {
    var x = 0, y = 0, max = 0, ids = shownIds();
    ids.forEach(function (id) { if (patternCorrect(state.patterns[id])) x++; });
    recItems().forEach(function (it) {
      max += it.type === "spots" ? w1Runtime(it).targets.length : w2Cards(it).length;
      var r = state.recognition[it.id];
      if (r) y += r.hits || 0;
    });
    return { x: x, n: ids.length, y: y, max: max };
  }
  function renderSummary() {
    var Z = C.zusammenfassung;
    var list = '<ul class="sum-list">' + shownIds().map(function (id) {
      var d = patternDef(id);
      return "<li><b>" + esc(d.short) + "</b><span>" + esc(d.satz) + "</span></li>";
    }).join("") + "</ul>";
    // G4: die vier Regeln noch einmal; G3 (und POST): Satz zur eigenen Entscheidung (seit 18.10.)
    var rules = mode === "g4" ? '<h2 class="sum-rules-title">' + esc(Z.rulesTitle) + '</h2><ul class="sum-list sum-rules">' +
      shownIds().map(function (id) {
        var d = patternDef(id);
        return d.regel ? "<li><b>" + esc(d.short) + "</b><span>" + esc(d.regel) + "</span></li>" : "";
      }).join("") + "</ul>" : "";
    var outro = (mode === "g3" || mode === "post") && Z.outroG3 ? Z.outroG3 + " " + Z.outroEnd : Z.outroEnd;
    app.innerHTML = '<div class="page tp"><div class="tp-body"><h1>' + esc(Z.title) + "</h1>" + list + rules +
      (exportMode ? "" : '<p class="tp-score">' + esc(fill(Z.scores, scores())) + "</p>") +
      "<p>" + esc(outro) + "</p></div>" +
      '<div class="lp-foot"><button class="btn" id="finish" type="button">' + esc(Z.buttonEnd) + "</button>" +
      '<p class="status-line" id="status" role="status"></p></div></div>';
    focusFirst("h1");
    if (previewKey) return;
    app.querySelector("#finish").addEventListener("click", function (e) {
      var btn = e.currentTarget;
      btn.disabled = true;
      if (isReview() && state.page < pages.length - 1) { goto(state.page + 1); return; }
      var result = finish();
      dbSave("zusammenfassung", "SUMMARY", result, state.pageSeconds.zusammenfassung);
      var wave = mode === "post" ? "POST" : "INTERVENTION";
      var pre = (mode === "g3" || mode === "g4") ? Promise.resolve(markDone("BOOST")).catch(function () {}) : Promise.resolve();
      pre.then(function () { return markDone(wave); }).then(backToStudy, backToStudy);
    });
  }
  function finish() {
    if (state.pageSeconds.zusammenfassung == null) state.pageSeconds.zusammenfassung = secondsSince(state.pageStart);
    if (!state.finishedAt) state.finishedAt = isoNow();
    save();
    return {
      version: C.version, mode: mode,
      startedAt: state.startedAt, finishedAt: state.finishedAt,
      apps: state.apps || [], shown: state.shown || [], scores: scores(),
      pageSeconds: { start: state.pageSeconds.start, einordnung: state.pageSeconds.einordnung, zusammenfassung: state.pageSeconds.zusammenfassung },
      regeln: mode === "g4" ? shownIds().filter(function (id) { return !!patternDef(id).regel; }) : [] // Muster, deren Regel G4 gesehen hat
    };
  }
  // ── Vorschau-Zustand ───────────────────────────────────
  function previewState(key) {
    var s = fresh();
    state = s;
    s.code = urlCode || "VORSCHAU";
    s.startedAt = "2026-10-18T10:31:04Z";
    s.apps = urlApps.length ? urlApps : ["ig", "tt", "sc"];
    s.shown = assignPatterns(s.apps);
    var variant = params.get("variant");
    var m = /^(p(\d+)|W\d)([ATBE])$/.exec(key);
    if (m && m[2] && variant) {
      s.shown = s.shown.map(function (e) {
        if (e.id !== Number(m[2])) return e;
        var def = patternDef(e.id);
        return def.always ? e : entryFor(def, variant);
      });
    }
    buildPages();
    pages.forEach(function (pg) {
      if (pg.type !== "pattern") return;
      var p = pg.pattern;
      if (p.type === "multi") {
        var sel = p.data.items.map(function (it, i) { return it.human ? i + 1 : 0; }).filter(Boolean);
        s.patterns[p.id] = Object.assign({ id: p.id, name: p.key }, multiResult(p, exportMode ? sel : [1, 2, 4]));
      } else {
        var ans = Number(params.get("answer")) || (p.correct === 1 ? 2 : 1);
        s.patterns[p.id] = { id: p.id, name: p.key, answer: ans, correct: p.correct, isCorrect: ans === p.correct };
      }
    });
    recItems().forEach(function (it) {
      if (it.type === "spots") s.recognition[it.id] = spotsResult(it, [1, 2]);
      else s.recognition[it.id] = w2Result(it, w2Cards(it), ["human", "app", "human"]);
    });
    var phaseOf = { A: "ask", T: "try", B: "react", E: "explain" };
    var pageKey = m ? m[1] : key;
    s.sub = m ? phaseOf[m[3]] : "look";
    if (m && /^W/.test(m[1])) s.sub = m[3] === "B" ? "react" : "ask";
    s.page = Math.max(0, pages.findIndex(function (pg) { return pg.key === pageKey; }));
    if (s.sub === "ask") {
      var pg = pages[s.page];
      if (pg.pattern) delete s.patterns[pg.pattern.id];
      if (pg.item && pg.type === "recognition") delete s.recognition[pg.item.id];
    }
    s.maxPage = s.page; s.maxSub = s.sub;
    return s;
  }

  // ── Start ──────────────────────────────────────────────
  function begin(m, progress) {
    setMode(m);
    state = load();
    if (!state || state.version !== CT.version || state.mode !== mode || (urlCode && state.code && state.code !== urlCode)) state = fresh();
    if (urlCode) state.code = urlCode;
    if (!state.shown) {
      state.apps = (urlApps.length ? urlApps : ((progress && progress.apps) || [])).slice();
      state.shown = assignPatterns(state.apps);
      state.startedAt = isoNow();
      buildPages();
      // Schulung schon abgeschlossen, Intervention aber nicht vermerkt (Abbruch genau dazwischen):
      // Zusammenfassung zeigen, „Fertig“ vermerkt die Intervention
      if (progress && progress.boost_done && (mode === "g3" || mode === "g4")) {
        state.page = state.maxPage = pages.length - 1;
        state.sub = state.maxSub = stepsOf(pages[state.page])[0];
      } else {
        dbSave("start", "APPS", { apps: state.apps, shown: state.shown, mode: mode }, null);
      }
    } else {
      buildPages();
    }
    save();
    render();
  }

  (async function init() {
    if (previewKey) {
      setMode(params.get("modus") || "g3");
      state = previewState(previewKey);
      document.documentElement.classList.add("is-preview");
      if (exportMode) document.documentElement.classList.add("is-export");
      render();
      return;
    }
    preloadAssets();
    if (postFlag) { begin("post", null); return; }
    if (!urlCode || !window.DB) { begin("demo", null); return; }
    app.innerHTML = '<div class="page tp"><div class="tp-body"><p>Einen Moment …</p></div></div>';
    var res = await window.DB.progress(urlCode);
    var p = res && res.ok ? res.data : null;
    if (!p || !p.exists) { backToStudy(); return; }
    pilotFlag = pilotFlag || p.pilot === true;
    var g = p.grp;
    if (g === "G3") begin("g3", p);
    else if (g === "G4") begin("g4", p);
    else if (g === "G2") begin("g2", p);
    else backToStudy(); // G1 oder noch keine Gruppe: keine Intervention
  })();

  // ── Offline nach dem ersten Laden ──────────────────────
  if (!previewKey && "serviceWorker" in navigator && location.protocol === "https:") {
    navigator.serviceWorker.register("sw.js").catch(function () {});
  }
})();
