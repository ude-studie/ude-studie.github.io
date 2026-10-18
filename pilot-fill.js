/*
 * pilot-fill.js – nur zum Testen (seit 18.10.2026): Knöpfe „Ausfüllen“ und „Ausfüllen + Weiter“
 * unten links. Erscheinen NUR mit ?pilot=1 in der Adresse; Teilnehmende sehen sie nie.
 * Füllt die sichtbaren Fragen der aktuellen Seite mit zufälligen, gültigen Antworten
 * (Fragebogen und Schulung). Schon Ausgewähltes bleibt stehen – so kann man z. B. die Apps
 * selbst wählen und den Rest ausfüllen lassen. Kontrollfragen werden richtig beantwortet,
 * Ein- und Ausschlussfragen so, dass man in der Studie bleibt.
 */
(function () {
  "use strict";
  if (!/[?&]pilot=1(&|$)/.test(location.search)) return;

  var APP_DEFAULT = ["Instagram", "TikTok"];
  function rnd(n) { return Math.floor(Math.random() * n); }
  function visible(e) { return !!(e && (e.offsetWidth || e.offsetHeight || e.getClientRects().length)) && !e.closest("[hidden]"); }
  function setVal(el, v) {
    var proto = el.tagName === "TEXTAREA" ? HTMLTextAreaElement.prototype : (el.tagName === "SELECT" ? HTMLSelectElement.prototype : HTMLInputElement.prototype);
    Object.getOwnPropertyDescriptor(proto, "value").set.call(el, v);
    el.dispatchEvent(new Event("input", { bubbles: true }));
    el.dispatchEvent(new Event("change", { bubbles: true }));
  }

  // ── Fragebogen (study.js) ──
  function fillStudyOnce() {
    document.querySelectorAll(".field[data-key]").forEach(function (box) {
      if (!visible(box)) return;
      var key = box.getAttribute("data-key");
      var btns = Array.prototype.slice.call(box.querySelectorAll(".opt-btn"));
      var any = btns.some(function (b) { return b.classList.contains("selected"); });
      var byText = function (t) { return btns.filter(function (b) { return b.textContent.trim().indexOf(t) === 0; })[0]; };
      var cb = box.querySelector('input[type="checkbox"]');
      if (cb) { if (!cb.checked) cb.click(); return; }
      if (btns.length) {
        if (any) return;
        var fixed = { SC01: "Ja", SC04: "iPhone", SU01: "Nein", SH01: "nichts davon" }[key];
        if (fixed && byText(fixed)) { byText(fixed).click(); return; }
        if (key === "ATT01" || key === "ATT02") { btns[1].click(); return; } // richtige Stufe
        if (key === "ATT03") { btns[3].click(); return; }
        if (key === "SC03") { APP_DEFAULT.forEach(function (t) { if (byText(t)) byText(t).click(); }); return; }
        if (box.querySelector(".opt-col")) { // Mehrfachauswahl: eine nicht-exklusive Option
          btns[rnd(Math.max(1, btns.length - 1))].click(); return;
        }
        btns[rnd(btns.length)].click();
        return;
      }
      var sel = box.querySelector("select");
      if (sel) { if (!sel.value) setVal(sel, sel.options[1 + rnd(sel.options.length - 1)].value); return; }
      var inp = box.querySelector("input:not([type=file]):not([type=checkbox]), textarea");
      if (!inp || inp.value) return;
      if (inp.type === "email") { // Wiederholung (EM02) muss gleich sein: vorhandene Adresse übernehmen
        var prev = Array.prototype.filter.call(document.querySelectorAll('input[type="email"]'), function (x) { return x.value; })[0];
        setVal(inp, prev ? prev.value : "pilot-" + Date.now().toString(36) + "@example.org");
      }
      else if (inp.type === "number" || inp.inputMode === "numeric") setVal(inp, key === "DE01" ? String(18 + rnd(12)) : String(1 + rnd(5)));
      else if (inp.tagName === "TEXTAREA") setVal(inp, "Testantwort (Pilot).");
      else setVal(inp, "Wirtschaftsinformatik");
    });
  }
  function fillStudy() { fillStudyOnce(); setTimeout(fillStudyOnce, 60); setTimeout(fillStudyOnce, 160); } // bedingte Felder erscheinen erst danach

  // ── Schulung (boost/app.js) ──
  function fillBoost() {
    var radios = Array.prototype.slice.call(document.querySelectorAll('.lp-panel input[name="ans"]:not([disabled])'));
    if (radios.length && !radios.some(function (r) { return r.checked; })) radios[rnd(radios.length)].click();
    var notes = Array.prototype.slice.call(document.querySelectorAll(".lp-stage button.note:not([disabled])"));
    if (notes.length && !document.querySelector('button.note[aria-pressed="true"]')) {
      notes[rnd(notes.length)].click();
      var other = notes[rnd(notes.length)];
      if (other.getAttribute("aria-pressed") !== "true") other.click();
    }
    var spots = Array.prototype.slice.call(document.querySelectorAll("button.spot"));
    if (spots.length && !document.querySelector('button.spot[aria-pressed="true"]')) {
      spots[rnd(spots.length)].click();
    }
    for (var i = 1; i <= 5; i++) {
      var opts = document.querySelectorAll('input[name="w2-' + i + '"]');
      if (opts.length && !document.querySelector('input[name="w2-' + i + '"]:checked')) opts[rnd(opts.length)].click();
    }
  }

  function mainButton() {
    var b = document.querySelector(".lp-foot .btn:not(.btn-back):not(.secondary)");
    if (b) return b;
    var all = Array.prototype.slice.call(document.querySelectorAll(".nav-row .btn:not(.secondary), .study .btn:not(.secondary)"));
    return all.filter(visible).pop();
  }
  function fill() { if (document.querySelector(".lp-stage, .tp-body")) fillBoost(); else fillStudy(); }
  function fillNext() {
    fill();
    setTimeout(function () { var b = mainButton(); if (b && !b.disabled) b.click(); }, 250);
  }

  function addBar() {
    if (document.getElementById("pilot-fill")) return;
    var bar = document.createElement("div");
    bar.id = "pilot-fill";
    bar.innerHTML = '<button type="button" data-a="fill">⚡ Ausfüllen</button><button type="button" data-a="next">⚡ Ausfüllen + Weiter</button>';
    bar.addEventListener("click", function (e) {
      var a = e.target.getAttribute("data-a");
      if (a === "fill") fill(); else if (a === "next") fillNext();
    });
    var st = document.createElement("style");
    st.textContent = "#pilot-fill{position:fixed;left:8px;bottom:8px;z-index:9999;display:flex;gap:6px;flex-wrap:wrap}" +
      "#pilot-fill button{font:600 12px/1 system-ui,sans-serif;padding:7px 10px;border-radius:999px;border:1px dashed #c9a227;" +
      "background:#fff4d6;color:#3d2e00;cursor:pointer;box-shadow:0 2px 6px rgba(0,0,0,.15)}";
    document.head.appendChild(st);
    document.body.appendChild(bar);
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", addBar); else addBar();
})();
