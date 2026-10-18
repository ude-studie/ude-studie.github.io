/*
 * recognition/render.js – baut die Screens der Wiedererkennung (Sets T0, T1, T2; survey-v4).
 *
 * Gleiche Optik wie die Schulung (nutzt deren CSS-Klassen aus boost/styles.css:
 * .device, .feed/.post, .ig-*, .lock/.note, .snap-*, .st-*), aber ANDERE Konten,
 * Inhalte und Fotos (CC0, recognition/assets/sources.json). Kein Screen kommt in
 * zwei Wellen vor. Das rot umrahmte Zielelement bekommt die Klasse .rec-mark
 * (bzw. .rec-mark-area als Zone, .rec-mark-abs direkt an absolut positionierten Elementen).
 *
 * Fotos: Innerhalb einer Welle kommt jedes Foto nur einmal vor. Über die Wellen
 * hinweg tauchen einzelne Fotos in Ablenker-Screens wieder auf (andere Screens,
 * andere Konten) – mehr CC0-Fotos gab es nicht; siehe Umbau-Bericht.
 *
 * Statusleiste überall gleich (v4): Etikett „Nachgestellt“, Uhrzeit 21:42 –
 * wie in der Schulung. Keine App-Namen oder Logos im Screen.
 *
 * window.RECOGNITION.render(entry, {mini}) → DOM-Knoten.
 */
(function () {
  "use strict";

  var R = window.RECOGNITION;
  var STATUS_TAG = "Nachgestellt";
  var STATUS_TIME = "21:42";

  // ── kleine Helfer (bewusst eigenständig, keine Abhängigkeit zu app.js) ──
  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c];
    });
  }
  function hashCode(s) {
    var h = 0;
    for (var i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) % 997;
    return h;
  }
  var BASE = ((document.currentScript && document.currentScript.src) || "").replace(/[^\/]*$/, "") + "assets/";
  var PHOTOS = ["fb-buch", "fb-fest", "fb-floh", "fb-garten", "fb-grill", "fb-meme", "fb-nachbar", "fb-theater", "fb-video",
    "ig-kaffee", "ig-kino", "ig-nebel", "ig-ramen", "ig-regal", "ig-see", "ig-wandern", "rl-backen", "rl-skate", "rl-skate-next",
    "tt-hund2", "tt-koch", "tt-reel-bg", "tt-sale", "tt-tanz", "tt-tanz-next", "x-stadt",
    "xp0a", "xp1b", "xp2c", "xp3d", "xp4e", "xp5f", "xp6g", "xp7h", "xp8i"];
  var AVATARS = ["alte-wg", "ayla-m", "aylin", "b-cherschrank-s-dviertel", "bahn-ansagen", "basti-baut", "ben", "ben-tanzt",
    "berg-und-tal", "cafe-eckhaus", "campus-garten", "can", "chris", "chris-89", "deals-daily", "deine-story", "deniz", "du",
    "elif", "essen-isst", "finn-ok", "flo-fotografiert", "flohmarkt-r-ttenscheid", "h-rsaal-memes", "hanna", "jonas-b", "jule",
    "jule-moves", "kochtmit", "kursgruppe-bwl", "lauftreff-essen", "lea", "lea-backt", "lena-unterwegs", "leyla", "mara", "mara-b",
    "marko", "mensa-update", "miri-zeichnet", "nachbarschaft-holsterhausen", "niko", "noa", "noa-zeigt", "nora-liest", "oma-gisela",
    "papa", "paula", "prokrastinations-memes", "ruhrpott-rezepte", "sam", "sam-skatet", "stadt-essen", "stadtfest-essen", "struppi-tv",
    "system", "theater-ag", "timo", "timo-rollt", "tonio-fit", "uni-duisburg-essen", "unikino-essen", "wg-rezepte"];
  function slug(s) { return String(s || "").toLowerCase().replace(/^@/, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""); }
  function photoStyle(file) { return "background:#ccc center / cover no-repeat url('" + BASE + file + ".jpg')"; }
  function avatarStyle(name) {
    var s = slug(name);
    return AVATARS.indexOf(s) >= 0 ? photoStyle("av-" + s) : "";
  }
  function avatar(name, extra) {
    var clean = String(name || "").replace(/^@/, "");
    var n = hashCode(clean) % 6;
    var st = avatarStyle(clean);
    return '<span class="avatar avc' + n + (extra ? " " + extra : "") + (st ? " has-photo" : "") + '"' +
      (st ? ' style="' + st + '"' : "") + ' aria-hidden="true">' + esc(clean.charAt(0).toUpperCase()) + "</span>";
  }
  var GRADS = [
    "linear-gradient(135deg,#b8c6d8,#8fa3bb)", "linear-gradient(135deg,#d8c6b8,#bba38f)",
    "linear-gradient(135deg,#c2d8b8,#9bbb8f)", "linear-gradient(135deg,#d8b8c9,#bb8fa7)",
    "linear-gradient(135deg,#b8d4d8,#8fb4bb)", "linear-gradient(135deg,#d8d2b8,#bbb28f)",
    "linear-gradient(135deg,#9aa7c4,#6f7fa3)", "linear-gradient(135deg,#c4b39a,#a38d6f)"
  ];
  function pic(id, cls) {
    var style = PHOTOS.indexOf(id) >= 0 ? photoStyle(id) : "background:" + GRADS[hashCode(String(id)) % GRADS.length];
    return '<div class="' + cls + '" style="' + style + '"></div>';
  }
  var ICON = {
    heart: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 21s-7.5-4.6-9.6-9.2C.9 8.4 3 4.5 6.7 4.5c2.1 0 3.6 1.1 5.3 3 1.7-1.9 3.2-3 5.3-3 3.7 0 5.8 3.9 4.3 7.3C19.5 16.4 12 21 12 21z"/></svg>',
    heartLine: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="none" stroke="currentColor" stroke-width="2" d="M12 20s-7-4.3-8.9-8.6C1.8 8.3 3.7 5 6.8 5c1.9 0 3.3 1 5.2 3 1.9-2 3.3-3 5.2-3 3.1 0 5 3.3 3.7 6.4C19 15.7 12 20 12 20z"/></svg>',
    comment: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 4h18v12H8l-5 4z"/></svg>',
    commentLine: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round" d="M20.5 11.5a8.5 8.5 0 01-12.4 7.6L3.5 20.5l1.4-4.4A8.5 8.5 0 1120.5 11.5z"/></svg>',
    share: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M14 4l8 7-8 7v-4c-6 0-9 2-12 6 1-6 4-11 12-12z"/></svg>',
    send: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round" d="M21 3L3 10l7 3 3 7z"/></svg>',
    bookmark: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round" d="M6 3h12v18l-6-5-6 5z"/></svg>',
    home: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 11l9-8 9 8v10h-6v-6H9v6H3z"/></svg>',
    search: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M10 3a7 7 0 015.6 11.2l5.1 5.1-1.4 1.4-5.1-5.1A7 7 0 1110 3zm0 2a5 5 0 100 10 5 5 0 000-10z"/></svg>',
    plus: '<svg viewBox="0 0 34 24" aria-hidden="true"><rect x="1" y="1" width="32" height="22" rx="6" fill="none" stroke="currentColor" stroke-width="2"/><path d="M16 6h2v5h5v2h-5v5h-2v-5h-5v-2h5z"/></svg>',
    inbox: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 5h18v14H3zm2 2v.5l7 5 7-5V7zm0 3v7h14v-7l-7 5z"/></svg>',
    profile: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3a4.5 4.5 0 110 9 4.5 4.5 0 010-9zm0 11c5 0 8 2.5 8 6v1H4v-1c0-3.5 3-6 8-6z"/></svg>',
    // Zahnrad: Material Icons „settings“ (Apache-2.0)
    gear: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58a.49.49 0 00.12-.61l-1.92-3.32a.49.49 0 00-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54a.48.48 0 00-.48-.41h-3.84a.47.47 0 00-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96a.48.48 0 00-.59.22L2.74 8.87a.47.47 0 00.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58a.49.49 0 00-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32a.49.49 0 00-.12-.61zM12 15.6A3.6 3.6 0 1112 8.4a3.6 3.6 0 010 7.2z"/></svg>',
    back: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" d="M15 4l-8 8 8 8"/></svg>',
    menu: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 6h16v2H4zm0 5h16v2H4zm0 5h16v2H4z"/></svg>',
    play: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="4" fill="none" stroke="currentColor" stroke-width="2"/><path d="M10 8l6 4-6 4z"/></svg>',
    plusThin: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" d="M12 4v16M4 12h16"/></svg>',
    pin: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2a7 7 0 017 7c0 5-7 13-7 13S5 14 5 9a7 7 0 017-7zm0 4.5a2.5 2.5 0 100 5 2.5 2.5 0 000-5z"/></svg>',
    chat: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3c5 0 9 3.4 9 7.6s-4 7.6-9 7.6c-1 0-2-.1-2.9-.4L4 20l1.3-4C4 14.6 3 12.7 3 10.6 3 6.4 7 3 12 3z"/></svg>',
    camera: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 4h6l1.6 2.2H20a2 2 0 012 2V18a2 2 0 01-2 2H4a2 2 0 01-2-2V8.2a2 2 0 012-2h3.4zm3 4.4a4.3 4.3 0 100 8.6 4.3 4.3 0 000-8.6z"/></svg>',
    friends: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 4a3.5 3.5 0 110 7 3.5 3.5 0 010-7zm7.5 1.5a3 3 0 110 6 3 3 0 010-6zM9 12.5c4 0 6.5 2 6.5 5V19h-13v-1.5c0-3 2.5-5 6.5-5zm7.8.3c3 .2 4.7 1.8 4.7 4.2V19h-4.5v-1.5c0-1.9-.7-3.5-1.9-4.7z"/></svg>',
    addFriend: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M10 4a3.8 3.8 0 110 7.6A3.8 3.8 0 0110 4zm0 9c4.2 0 7 2.1 7 5.3V20H3v-1.7C3 15.1 5.8 13 10 13zm9-6h1.6v2.4H23V11h-2.4v2.4H19V11h-2.4V9.4H19z"/></svg>',
    edit: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 17.2V20h2.8l8.3-8.3-2.8-2.8zM19.7 7.3a1 1 0 000-1.4l-1.6-1.6a1 1 0 00-1.4 0l-1.3 1.3 2.8 2.8z"/></svg>',
    reels: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5" fill="none" stroke="currentColor" stroke-width="2"/><path fill="none" stroke="currentColor" stroke-width="2" d="M3 8.5h18M8 3l3 5.5M14 3l3 5.5"/><path d="M10 12l5 3-5 3z"/></svg>',
    soundOn: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 9v6h4l5 4V5L7 9z"/><path fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" d="M15.5 8.5a5 5 0 010 7M18.5 5.5a9 9 0 010 13"/></svg>',
    status: '<svg viewBox="0 0 58 14" aria-hidden="true"><rect x="0" y="9" width="3" height="5" rx="1"/><rect x="5" y="6" width="3" height="8" rx="1"/><rect x="10" y="3" width="3" height="11" rx="1"/><rect x="15" y="0" width="3" height="14" rx="1"/><path d="M27 4.5a9 9 0 0112 0l-1.4 1.5a7 7 0 00-9.2 0zM29.4 7.2a5.5 5.5 0 017.2 0L35.2 8.7a3.5 3.5 0 00-4.4 0zM33 12.5l-1.7-1.8a2.4 2.4 0 013.4 0z"/><rect x="42" y="2" width="14" height="10" rx="3" fill="none" stroke="currentColor" stroke-width="1.4"/><rect x="44" y="4" width="9" height="6" rx="1.5"/></svg>'
  };
  function mark(html, area) {
    return '<span class="' + (area ? "rec-mark-area" : "rec-mark") + '">' + html + "</span>";
  }
  function markIf(on, html, area) { return on ? mark(html, area) : html; }
  // Für absolut positionierte Elemente: Rahmen direkt am Element, nicht an einer Hülle
  function markSelf(html) {
    return html.replace('class="', 'class="rec-mark-abs ');
  }
  // Datum auf nachgestellten Sperrbildschirmen: immer heute
  function todayDe() {
    try { return new Intl.DateTimeFormat("de-DE", { weekday: "long", day: "numeric", month: "long" }).format(new Date()); }
    catch (e) { return ""; }
  }

  // ── Leisten ────────────────────────────────────────────
  // Untere Leiste der Reels (Instagram): nur Symbole
  function igReelsNav() {
    return '<div class="nav ig-reels-nav" aria-hidden="true"><span>' + ICON.home + "</span><span>" + ICON.search +
      "</span><span>" + ICON.plus + "</span><span>" + ICON.play + "</span><span>" + ICON.profile + "</span></div>";
  }
  // Untere Leiste im hellen Instagram-Feed; markIdx 0 = Startseite
  function igLightNav(markIdx) {
    var items = [ICON.home, ICON.search, ICON.plusThin, ICON.reels, ICON.profile].map(function (ic, i) {
      var s = "<span>" + ic + "</span>";
      return i === markIdx ? mark(s) : s;
    });
    return '<div class="nav rec-ig-nav" aria-hidden="true">' + items.join("") + "</div>";
  }
  // Kopf: „+“ links, Herz und Senden rechts (ohne App-Namen, v4)
  function igHead(o) {
    o = o || {};
    var plus = '<span class="ig-plus" aria-hidden="true">' + ICON.plusThin + "</span>";
    return '<div class="ig-head">' + markIf(o.markPlus, plus) + '<span class="ig-title"></span>' +
      '<span class="ig-icons">' + ICON.heartLine + ICON.send + "</span></div>";
  }
  function ttNav(markIdx) {
    var items = ["<span>" + ICON.home + "Start</span>", "<span>" + ICON.search + "Entdecken</span>",
      '<span class="plus">' + ICON.plus + "</span>", "<span>" + ICON.inbox + "Posteingang</span>", "<span>" + ICON.profile + "Profil</span>"];
    return '<div class="nav" aria-hidden="true">' + items.map(function (it, i) { return i === markIdx ? mark(it) : it; }).join("") + "</div>";
  }
  // Untere Leiste von Snapchat: Karte, Chat, Kamera, Stories, Spotlight (Kamera in der Mitte)
  function snapNav(markIdx, active) {
    var items = [["pin", "Karte"], ["chat", "Chat"], ["camera", "Kamera"], ["friends", "Stories"], ["play", "Spotlight"]].map(function (d, i) {
      return '<span class="' + (i === active ? "on" : "") + (d[0] === "camera" ? " cam" : "") + '">' + ICON[d[0]] + esc(d[1]) + "</span>";
    });
    return '<div class="nav snap-nav" aria-hidden="true">' + items.map(function (it, i) { return i === markIdx ? mark(it) : it; }).join("") + "</div>";
  }
  // Ein Instagram-Beitrag; o.actions: Symbolleiste (Herz, Kommentar, Senden, Merken)
  function igPost(o) {
    var head = '<div class="ig-post-head">' + markIf(o.markAvatar, avatar(o.user)) +
      '<span class="ig-who"><span class="user">' + esc(o.user) + "</span>" +
      (o.suggested ? markIf(o.markSuggested, '<span class="sugg">' + esc(o.suggested) + "</span>") : "") + "</span>" +
      markIf(o.markDots, '<span class="ig-dots" aria-hidden="true">⋯</span>') + "</div>";
    var acts = o.actions ? '<div class="ig-actions" aria-hidden="true"><span class="ig-act">' + ICON.heartLine + '</span><span class="ig-act">' +
      ICON.commentLine + '</span><span class="ig-act">' + ICON.send + '</span><span class="ig-save">' + markIf(o.markSave, ICON.bookmark) + "</span></div>" : "";
    var post = '<div class="ig-post">' + (o.markHead ? mark(head, true) : head) +
      pic(o.picId, "ig-img" + (o.short ? " short" : "")) + acts +
      (o.line ? '<div class="ig-line">' + esc(o.line) + "</div>" : "") + "</div>";
    return o.markPost ? mark(post, true) : post; // markPost: ganzer Beitrag (Empfehlungen, seit 18.10.)
  }

  // ── Screen-Bauer ───────────────────────────────────────
  var B = {};

  // Heller Instagram-Feed; Kopf: Standard, Zurück-Leiste oder Suchfeld
  B.lightFeed = function (o) {
    var html = "";
    if (o.backBar) {
      html += '<div class="ig-head rec-backbar"><span class="rec-backwrap">' +
        markIf(o.markBack, '<span class="rec-back">' + ICON.back + "</span>") +
        '</span><span class="ig-title">' + esc(o.backBar) + '</span><span class="ig-icons"></span></div>';
    } else {
      html += igHead(o);
    }
    html += '<div class="ig-content">';
    (o.posts || []).forEach(function (p) { html += igPost(p); });
    html += "</div>";
    if (o.nav) html += igLightNav(o.markNav);
    return { cls: "ig", scroll: true, html: html };
  };

  // Dunkler Video-Feed (TikTok / Reels) mit stehendem Video
  //   peek: das nächste Video ragt unten herein (endloses Scrollen, markPeek)
  //   tabs: „Folge ich | Für dich“ (markTab), searchIcon (markSearch), markUser, markShare, markNav
  B.darkVideo = function (o) {
    var html = "";
    if (o.tabs) {
      html += '<div class="tt-tabs">' + o.tabs.map(function (t, i) {
        var s = "<span" + (i === o.activeTab ? ' class="on"' : "") + ">" + esc(t) + "</span>";
        return (o.markTab === i) ? mark(s) : s;
      }).join("") + (o.searchIcon ? markIf(o.markSearch, '<span class="rec-tt-search">' + ICON.search + "</span>") : "") + "</div>";
    }
    var shareSpan = "<span>" + ICON.share + esc(o.shares || "Teilen") + "</span>";
    html += '<div class="feed"><div class="track still"><div class="post">' + pic(o.picId, "post-bg") +
      '<div class="meta"><div class="user">' + markIf(o.markUser, "<span>" + esc(o.user) + "</span>") + '</div><div class="cap">' +
      esc(o.caption) + "</div></div>" +
      '<div class="side"><span>' + ICON.heart + esc(o.likes) + "</span>" +
      "<span>" + ICON.comment + esc(o.comments) + "</span>" + markIf(o.markShare, shareSpan) + "</div>" +
      "</div></div>";
    if (o.peek) {
      var peek = '<div class="rec-peek">' + pic(o.peek.picId, "rec-peek-bg") +
        '<div class="rec-peek-user">' + esc(o.peek.user) + (o.peek.caption ? '<span>' + esc(o.peek.caption) + "</span>" : "") + "</div></div>";
      html += o.markPeek ? markSelf(peek) : peek;
    }
    html += "</div>";
    html += o.nav === "ig" ? igReelsNav() : ttNav(o.markNav);
    return { cls: "tt", html: html };
  };

  // Autoplay: Video läuft sichtbar – Fortschrittsbalken bewegt sich, Ton-Symbol ist an.
  // Rot umrahmt (seit 18.10.): nur der laufende Fortschrittsbalken (vorher das ganze Video – zu unklar).
  B.autoplay = function (o) {
    var html = "";
    if (o.tabs) {
      html += '<div class="tt-tabs">' + o.tabs.map(function (t, i) {
        return "<span" + (i === o.activeTab ? ' class="on"' : "") + ">" + esc(t) + "</span>";
      }).join("") + "</div>";
    }
    html += '<div class="feed"><div class="track still"><div class="post">' + pic(o.picId, "post-bg") +
      '<span class="rec-sound" aria-hidden="true">' + ICON.soundOn + "</span>" +
      '<div class="meta"><div class="user">' + esc(o.user) + '</div><div class="cap">' + esc(o.caption) + "</div></div>" +
      '<div class="side"><span>' + ICON.heart + esc(o.likes) + "</span><span>" + ICON.comment + esc(o.comments) +
      "</span><span>" + ICON.share + esc(o.shares || "Teilen") + "</span></div>" +
      '<div class="rec-mark-abs bar rec-bar"><span class="run" style="animation-duration:' + (o.loop || 7) + "s;animation-delay:-" + (o.at || 1) + 's"></span></div>' +
      "</div></div></div>";
    html += o.nav === "ig" ? igReelsNav() : ttNav();
    return { cls: "rl", html: html };
  };

  // Dunkle Liste (TikTok-Posteingang); markUser = Index der Zeile mit markiertem Namen
  B.darkInbox = function (o) {
    var rows = o.rows.map(function (r, i) {
      return '<div class="rec-inbox-row">' + avatar(r.user) + '<div class="rec-inbox-text"><div class="user">' +
        markIf(o.markUser === i, "<span>" + esc(r.user) + "</span>") +
        "</div><div>" + esc(r.text) + "</div></div><span class='rec-inbox-time'>" + esc(r.time) + "</span></div>";
    }).join("");
    return { cls: "tt", html: '<div class="rec-inbox"><div class="rec-inbox-head">' + esc(o.title) + "</div>" + rows + "</div>" + ttNav(o.markNav) };
  };

  // Sperrbildschirm: eine markierte Meldung der App, daneben eine gewöhnliche Meldung
  // (Symbole ai-msg/ai-cal/ai-wx/ai-bahn: neutrale Platzhalter, keine fremden Marken; v4)
  B.lock = function (o) {
    var html = '<div class="lock-clock">' + esc(STATUS_TIME) + '</div><div class="lock-date">' + esc(todayDe()) + '</div><div class="lock-list">';
    o.items.forEach(function (it) {
      var inner = '<span class="app-icon ' + it.icon + '" aria-hidden="true"></span>' +
        '<span class="note-main"><span class="note-top"><strong>' + esc(it.app) + "</strong><span>" + esc(it.when) + "</span></span>" +
        '<span class="note-text">' + esc(it.text) + "</span></span>";
      var note = '<div class="note">' + inner + "</div>";
      html += it.marked ? mark(note, true) : note;
    });
    return { cls: "lock", scroll: true, html: html + "</div>" };
  };

  // Snapchat-Chatliste. Kopf: Titel (markTitle), Suche (markSearch), Zahnrad (markGear),
  // Freund hinzufügen (markAddFriend). Zeilen: markAvatar / markUser = Index der Zeile.
  B.snap = function (o) {
    var head = '<div class="snap-head">' + markIf(o.markTitle, "<span>" + esc(o.title) + "</span>") +
      (o.search != null ? markIf(o.markSearch, '<span class="rec-search dark">' + ICON.search + "<i>" + esc(o.search) + "</i></span>") : "") +
      '<span class="rec-snap-icons">' +
      (o.addFriend ? markIf(o.markAddFriend, '<span class="rec-gearicon">' + ICON.addFriend + "</span>") : "") +
      (o.gear ? markIf(o.markGear, '<span class="rec-gearicon">' + ICON.gear + "</span>") : "") +
      "</span></div>";
    var rows = (o.rows || []).map(function (row, i) {
      return '<div class="snap-row">' + markIf(o.markAvatar === i, avatar(row.user, "bitmoji")) +
        '<div class="snap-text"><div class="user">' + markIf(o.markUser === i, "<span>" + esc(row.user) + "</span>") +
        '</div><div class="status">' + esc(row.status) + "</div></div></div>";
    }).join("");
    return { cls: "snap", scroll: true, html: head + rows + snapNav(o.markNav, 1) };
  };

  // Instagram-Suche: Raster aus Vorschlägen (m3) – Rahmen um das ganze Raster
  B.explore = function (o) {
    var cells = o.cells.map(function (c) { return pic(c, "rec-explore-cell"); }).join("");
    var grid = '<div class="rec-explore">' + cells + "</div>";
    var head = '<div class="ig-head"><span class="rec-search">' + ICON.search + "<i>" + esc(o.search) + "</i></span></div>";
    return { cls: "ig", scroll: true, html: head + markIf(o.marked, grid, true) + igLightNav(-1) };
  };

  // Instagram-Nachrichten: Kopf mit Name, Suchfeld, Liste der Chats
  B.dmList = function (o) {
    var head = '<div class="ig-head rec-backbar"><span class="rec-backwrap"><span class="rec-back">' + ICON.back + "</span></span>" +
      '<span class="ig-title">' + esc(o.title) + '</span><span class="ig-icons">' + ICON.edit + "</span></div>";
    var sb = '<span class="rec-search">' + ICON.search + "<i>" + esc(o.search) + "</i></span>";
    var rows = o.rows.map(function (r) {
      return '<div class="rec-dm-row">' + avatar(r.user) + '<div class="rec-dm-text"><div class="user">' + esc(r.user) +
        '</div><div class="rec-dm-msg">' + esc(r.text) + '</div></div><span class="rec-dm-cam">' + ICON.camera + "</span></div>";
    }).join("");
    return { cls: "ig", scroll: true, html: head + '<div class="rec-dm-search">' + markIf(o.markSearch, sb) + "</div>" +
      '<div class="rec-dm-sub">Nachrichten</div>' + rows };
  };

  // Instagram-Profil: Kopf mit Name und Menü (markMenu), Zahlen, Knopf „Profil bearbeiten“ (markEdit), Raster
  B.igProfile = function (o) {
    var head = '<div class="ig-head rec-backbar"><span class="rec-backwrap"></span><span class="ig-title">' + esc(o.user) +
      '</span><span class="ig-icons">' + ICON.plusThin + markIf(o.markMenu, '<span class="rec-menuicon">' + ICON.menu + "</span>") + "</span></div>";
    var top = '<div class="rec-prof-top">' + avatar(o.user, "rec-prof-av") +
      '<div class="rec-prof-stats"><span><b>' + esc(o.posts) + "</b>Beiträge</span><span><b>" + esc(o.followers) +
      "</b>Follower</span><span><b>" + esc(o.following) + "</b>Gefolgt</span></div></div>" +
      '<div class="rec-prof-bio"><b>' + esc(o.name) + "</b><br>" + esc(o.bio) + "</div>" +
      '<div class="rec-prof-btns">' + markIf(o.markEdit, '<span class="rec-prof-btn">Profil bearbeiten</span>') +
      '<span class="rec-prof-btn">Profil teilen</span></div>';
    var grid = '<div class="rec-explore">' + o.tiles.map(function (t) { return pic(t, "rec-explore-cell"); }).join("") + "</div>";
    return { cls: "ig", scroll: true, html: head + top + grid + igLightNav(-1) };
  };

  // TikTok-Profil: Zahnrad (markGear) bzw. „Profil bearbeiten“ (markEdit), Raster
  B.ttProfile = function (o) {
    var html = '<div class="rec-tt-profile"><div class="rec-tt-profilehead"><span class="rec-backwrap"><span class="rec-back light">' + ICON.back + "</span></span>" +
      '<span class="rec-tt-profilename">' + esc(o.user) + "</span>" +
      markIf(o.markGear, '<span class="rec-gearicon light big">' + ICON.gear + "</span>") + "</div>" +
      '<div class="rec-tt-profilestats"><span><b>' + esc(o.following) + "</b> Folge ich</span><span><b>" + esc(o.followers) +
      "</b> Follower</span><span><b>" + esc(o.likes) + "</b> Likes</span></div>" +
      (o.editButton ? '<div class="rec-tt-btns">' + markIf(o.markEdit, '<span class="rec-tt-btn">Profil bearbeiten</span>') +
        '<span class="rec-tt-btn">Profil teilen</span></div>' : "") +
      '<div class="rec-explore dark">' + o.tiles.map(function (t) { return pic(t, "rec-explore-cell"); }).join("") + "</div></div>";
    return { cls: "tt", scroll: true, html: html + ttNav(-1) };
  };

  // ── Inhalte je Screen-ID ───────────────────────────────
  // Neutrale Zweitmeldungen auf Sperrbildschirmen: eigene Symbole, keine fremden Marken (E.4.4)
  var CONTENT = {
    // ===================== Set T0 =====================
    "T0-m1-ig": function () { // Endloses Scrollen: Reels, das nächste ragt herein (früher T0-4)
      return B.darkVideo({ picId: "rl-skate", user: "timo.rollt", caption: "Erster Versuch nach dem Regen 🛹",
        likes: "22,4k", comments: "318", nav: "ig", peek: { picId: "rl-skate-next", user: "sam.skatet", caption: "Neues Board, erster Test" }, markPeek: true });
    },
    "T0-m1-tt": function () { // Endloses Scrollen: TikTok
      return B.darkVideo({ picId: "tt-reel-bg", user: "cafe.eckhaus", caption: "Latte Art, Versuch Nr. 27 ☕",
        likes: "4.381", comments: "96", tabs: ["Folge ich", "Für dich"], activeTab: 1,
        peek: { picId: "fb-grill", user: "jonas_b", caption: "Grillabend im Garten 🔥" }, markPeek: true });
    },
    "T0-m4-ig": function () { // Autoplay: Reels laufen von selbst, mit Ton
      return B.autoplay({ picId: "rl-backen", user: "lea.backt", caption: "Der Teig ist IMMER zu klebrig??",
        likes: "12,9k", comments: "207", nav: "ig", loop: 7, at: 2 });
    },
    "T0-m4-tt": function () { // Autoplay: TikTok
      return B.autoplay({ picId: "tt-hund2", user: "struppi.tv", caption: "Erste Autofahrt ans Meer 🐶",
        likes: "48,1k", comments: "1.022", tabs: ["Folge ich", "Für dich"], activeTab: 1, loop: 6, at: 1 });
    },
    "T0-m3-ig": function () { // Empfehlung: fremder Beitrag mit „Vorgeschlagen“
      return B.lightFeed({ posts: [
        { user: "ruhrpott.rezepte", suggested: "Vorgeschlagen", markPost: true, picId: "fb-video", line: "Gefällt 2.318 Mal" },
        { user: "nora.liest", picId: "fb-buch", line: "Gefällt 74 Mal" }
      ] });
    },
    "T0-m3-tt": function () { // Empfehlung: Reiter „Für dich“ (früher T0-9)
      return B.darkVideo({ picId: "tt-sale", user: "deals.daily", caption: "Nur heute: 3 für 2 🛒 #deals",
        likes: "5.604", comments: "120", tabs: ["Folge ich", "Für dich"], activeTab: 1, markTab: 1 });
    },
    "T0-m6-ig": function () {
      return B.lock({ items: [
        { app: "Instagram", icon: "ai-ig", when: "vor 4 Min.", text: "Du hast 6 neue Beiträge von Konten verpasst, denen du folgst", marked: true },
        { app: "Kalender", icon: "ai-cal", when: "vor 1 Std.", text: "Morgen 9:00: Zahnarzt" }
      ] });
    },
    "T0-m6-tt": function () { // (früher T0-5)
      return B.lock({ items: [
        { app: "TikTok", icon: "ai-tt", when: "vor 12 Min.", text: "🔥 Dein Video von gestern geht gerade ab – sieh nach!", marked: true },
        { app: "Nachrichten", icon: "ai-msg", when: "vor 26 Min.", text: "Mama: Bis Sonntag!" }
      ] });
    },
    "T0-m6-sc": function () {
      return B.lock({ items: [
        { app: "Snapchat", icon: "ai-sc", when: "vor 7 Min.", text: "👻 Neue Spotlight-Videos, die dir gefallen könnten", marked: true },
        { app: "Wetter", icon: "ai-wx", when: "vor 2 Std.", text: "Morgen bis 14 °C, trocken" }
      ] });
    },
    // Ablenker T0
    "T0-d-ig-1": function () { // Profilbild im Feed (früher T0-2)
      return B.lightFeed({ posts: [
        { user: "wg.rezepte", picId: "xp8i", line: "Gefällt 214 Mal", markAvatar: true },
        { user: "lea.backt", picId: "xp3d", line: "Gefällt 89 Mal" }
      ] });
    },
    "T0-d-ig-2": function () { // Suchfeld in den Nachrichten
      return B.dmList({ title: "deine.nachrichten", search: "Suchen", markSearch: true, rows: [
        { user: "hanna", text: "Bis gleich in der Mensa?" },
        { user: "can", text: "Hast du die Folien noch?" },
        { user: "kursgruppe.bwl", text: "Elif: Treffen morgen um 10" },
        { user: "paula", text: "Haha, genau so 😂" },
        { user: "chris_89", text: "Gesehen" }
      ] });
    },
    "T0-d-ig-3": function () { // Menü (drei Striche) auf der eigenen Profilseite
      return B.igProfile({ user: "mara.b", name: "Mara", bio: "Essen · Kaffee · Fotos", posts: "48", followers: "312", following: "290",
        tiles: ["ig-kino", "fb-meme", "ig-regal", "fb-theater", "ig-nebel", "tt-tanz-next"], markMenu: true });
    },
    "T0-d-tt-1": function () { // Lupe oben rechts (früher T0-6)
      return B.darkVideo({ picId: "xp7h", user: "stadt.essen", caption: "Essen bei Nacht ✨",
        likes: "9.812", comments: "233", tabs: ["Folge ich", "Für dich"], activeTab: 1, searchIcon: true, markSearch: true });
    },
    "T0-d-tt-2": function () { // Posteingang-Symbol in der unteren Leiste
      return B.darkVideo({ picId: "xp1b", user: "paula", caption: "Neues Rad, alter Weg 🚲",
        likes: "1.204", comments: "41", tabs: ["Folge ich", "Für dich"], activeTab: 1, markNav: 3 });
    },
    "T0-d-tt-3": function () { // „Profil bearbeiten“ auf der eigenen Profilseite
      return B.ttProfile({ user: "noa.zeigt", following: "211", followers: "1.038", likes: "9.420", editButton: true, markEdit: true,
        tiles: ["ig-wandern", "ig-see", "fb-fest", "ig-kaffee", "tt-koch", "fb-garten"] });
    },
    "T0-d-sc-1": function () { // Zahnrad (früher T0-10)
      return B.snap({ title: "Chats", gear: true, markGear: true, rows: [
        { user: "Paula", status: "Hat deinen Chat geöffnet · 1 Std." }, { user: "Can", status: "Neuer Chat · 14 Min." },
        { user: "Leyla", status: "Chat empfangen · 2 Std." }, { user: "Marko", status: "Geöffnet · 5 Std." },
        { user: "Niko", status: "Gesendet · gestern" }, { user: "Deniz", status: "Geöffnet · 2 Tage" }
      ] });
    },
    "T0-d-sc-2": function () { // Kamera-Symbol unten
      return B.snap({ title: "Chats", markNav: 2, rows: [
        { user: "Jule", status: "Neuer Snap · 22 Min." }, { user: "Sam", status: "Gesendet · 3 Std." },
        { user: "Oma Gisela", status: "Hat deinen Snap geöffnet · gestern" }, { user: "Hanna", status: "Chat empfangen · gestern" },
        { user: "Papa", status: "Chat empfangen · 3 Tage" }
      ] });
    },
    "T0-d-sc-3": function () { // Profilbild in einer Chat-Zeile
      return B.snap({ title: "Chats", markAvatar: 0, rows: [
        { user: "Elif", status: "Neuer Chat · 5 Min." }, { user: "Timo", status: "Geöffnet · 1 Std." },
        { user: "Alte WG", status: "Neuer Chat · 4 Std." }, { user: "Ben", status: "Gesendet · gestern" },
        { user: "Lea", status: "Geöffnet · 2 Tage" }
      ] });
    },

    // ===================== Set T1 =====================
    "T1-m1-ig": function () {
      return B.darkVideo({ picId: "ig-wandern", user: "berg.und.tal", caption: "Oben angekommen ❄️",
        likes: "18,2k", comments: "264", nav: "ig", peek: { picId: "ig-see", user: "lena.unterwegs", caption: "Abendrunde am See" }, markPeek: true });
    },
    "T1-m1-tt": function () {
      return B.darkVideo({ picId: "tt-koch", user: "kochtmit", caption: "5-Minuten-Nudeln, die wirklich halten",
        likes: "9.812", comments: "233", tabs: ["Folge ich", "Für dich"], activeTab: 1,
        peek: { picId: "ig-ramen", user: "essen.isst", caption: "Ramen-Test Teil 3 🍜" }, markPeek: true });
    },
    "T1-m4-ig": function () {
      return B.autoplay({ picId: "tt-tanz", user: "finn_ok", caption: "Kickflip endlich gestanden",
        likes: "7.730", comments: "158", nav: "ig", loop: 6, at: 3 });
    },
    "T1-m4-tt": function () {
      return B.autoplay({ picId: "fb-fest", user: "stadtfest.essen", caption: "Feuerwerk zum Abschluss 🎆",
        likes: "31,4k", comments: "612", tabs: ["Folge ich", "Für dich"], activeTab: 1, loop: 8, at: 2 });
    },
    "T1-m3-ig": function () {
      return B.lightFeed({ posts: [
        { user: "cafe.eckhaus", suggested: "Vorgeschlagen", markPost: true, picId: "ig-kaffee", line: "Gefällt 1.046 Mal" },
        { user: "campus.garten", picId: "fb-garten", line: "Gefällt 58 Mal" }
      ] });
    },
    "T1-m3-tt": function () {
      return B.darkVideo({ picId: "x-stadt", user: "niko", caption: "Wenn der Bus wieder nicht kommt ☔",
        likes: "15,0k", comments: "377", tabs: ["Folge ich", "Für dich"], activeTab: 1, markTab: 1 });
    },
    "T1-m6-ig": function () {
      return B.lock({ items: [
        { app: "Instagram", icon: "ai-ig", when: "vor 9 Min.", text: "✨ Beliebt bei dir: Reels, die du verpasst hast", marked: true },
        { app: "Nachrichten", icon: "ai-msg", when: "vor 40 Min.", text: "Papa: Ruf mal an 🙂" }
      ] });
    },
    "T1-m6-tt": function () {
      return B.lock({ items: [
        { app: "TikTok", icon: "ai-tt", when: "vor 3 Min.", text: "🎵 Dieser Sound ist gerade überall – hör rein", marked: true },
        { app: "Wetter", icon: "ai-wx", when: "vor 1 Std.", text: "Heute Abend Gewitter möglich" }
      ] });
    },
    "T1-m6-sc": function () { // (früher T1-4)
      return B.lock({ items: [
        { app: "Snapchat", icon: "ai-sc", when: "vor 3 Min.", text: "👻 Deine Freunde haben etwas gepostet, das du verpasst hast", marked: true },
        { app: "Kalender", icon: "ai-cal", when: "vor 1 Std.", text: "Morgen 10:00: Statistik-Übung" }
      ] });
    },
    // Ablenker T1
    "T1-d-ig-1": function () { // Zurück-Pfeil in der Beitragsansicht (früher T1-9)
      return B.lightFeed({ backBar: "Beitrag", markBack: true,
        posts: [{ user: "oma.gisela", picId: "xp5f", line: "Gefällt 462 Mal", actions: true }] });
    },
    "T1-d-ig-2": function () { // Drei Punkte am Beitrag
      return B.lightFeed({ posts: [
        { user: "mensa.update", picId: "xp8i", line: "Gefällt 241 Mal", markDots: true },
        { user: "tonio_fit", picId: "rl-skate", line: "Gefällt 77 Mal" }
      ] });
    },
    "T1-d-ig-3": function () { // Startseite-Symbol unten
      return B.lightFeed({ nav: true, markNav: 0, posts: [
        { user: "chris", picId: "fb-buch", line: "Gefällt 33 Mal" },
        { user: "aylin", picId: "xp4e", line: "Gefällt 120 Mal" }
      ] });
    },
    "T1-d-tt-1": function () { // Zahnrad auf der Profilseite (früher T2-2)
      return B.ttProfile({ user: "timo.rollt", following: "102", followers: "4.218", likes: "58,1k", markGear: true,
        tiles: ["fb-grill", "xp3d", "fb-video", "xp0a", "rl-backen", "xp7h"] });
    },
    "T1-d-tt-2": function () { // Reiter „Folge ich“
      return B.darkVideo({ picId: "xp2c", user: "nora.liest", caption: "Meine Pflanze lebt noch 🌱",
        likes: "2.077", comments: "64", tabs: ["Folge ich", "Für dich"], activeTab: 1, markTab: 0 });
    },
    "T1-d-tt-3": function () { // Teilen
      return B.darkVideo({ picId: "xp6g", user: "marko", caption: "Neuer Song, erster Versuch 🎸",
        likes: "3.150", comments: "88", tabs: ["Folge ich", "Für dich"], activeTab: 1, markShare: true });
    },
    "T1-d-sc-1": function () { // Suchfeld (früher T2-6)
      return B.snap({ title: "Chats", search: "Suchen", markSearch: true, rows: [
        { user: "Timo", status: "Neuer Snap · 5 Min." }, { user: "Alte WG", status: "Hat deinen Chat geöffnet · 2 Std." },
        { user: "Leyla", status: "Gesendet · 4 Std." }, { user: "Can", status: "Geöffnet · gestern" },
        { user: "Mara", status: "Chat empfangen · 2 Tage" }
      ] });
    },
    "T1-d-sc-2": function () { // Karte-Symbol unten
      return B.snap({ title: "Chats", markNav: 0, rows: [
        { user: "Noa", status: "Neuer Chat · 12 Min." }, { user: "Sam", status: "Geöffnet · 1 Std." },
        { user: "Hanna", status: "Gesendet · 6 Std." }, { user: "Deniz", status: "Chat empfangen · gestern" },
        { user: "Kursgruppe BWL", status: "Neuer Chat · 2 Tage" }
      ] });
    },
    "T1-d-sc-3": function () { // Name in einer Chat-Zeile
      return B.snap({ title: "Chats", markUser: 1, rows: [
        { user: "Ben", status: "Neuer Snap · 2 Min." }, { user: "Paula", status: "Geöffnet · 40 Min." },
        { user: "Jule", status: "Gesendet · 3 Std." }, { user: "Papa", status: "Chat empfangen · gestern" },
        { user: "Elif", status: "Geöffnet · 3 Tage" }
      ] });
    },

    // ===================== Set T2 =====================
    "T2-m1-ig": function () {
      return B.darkVideo({ picId: "fb-theater", user: "theater.ag", caption: "Requisiten für die Premiere 🎭",
        likes: "3.902", comments: "71", nav: "ig", peek: { picId: "fb-floh", user: "flohmarkt.rüttenscheid", caption: "Sonntag wieder geöffnet" }, markPeek: true });
    },
    "T2-m1-tt": function () {
      return B.darkVideo({ picId: "tt-tanz-next", user: "jule.moves", caption: "Gänsehaut beim letzten Song 🎤",
        likes: "31,7k", comments: "540", tabs: ["Folge ich", "Für dich"], activeTab: 1,
        peek: { picId: "ig-kino", user: "unikino.essen", caption: "Heute: Filmabend im Audimax" }, markPeek: true });
    },
    "T2-m4-ig": function () {
      return B.autoplay({ picId: "fb-meme", user: "prokrastinations.memes", caption: "Ich, wenn jemand „kurz“ sagt",
        likes: "64,3k", comments: "1.871", nav: "ig", loop: 6, at: 1 });
    },
    "T2-m4-tt": function () {
      return B.autoplay({ picId: "ig-nebel", user: "lauftreff.essen", caption: "Nebellauf um 7 Uhr 🏃",
        likes: "2.640", comments: "53", tabs: ["Folge ich", "Für dich"], activeTab: 1, loop: 7, at: 4 });
    },
    "T2-m3-ig": function () { // Vorschlags-Raster in der Suche (früher T2-1)
      return B.explore({ search: "Suchen", cells: ["xp0a", "xp1b", "xp2c", "xp3d", "xp4e", "xp5f", "xp6g", "xp7h", "xp8i"], marked: true });
    },
    "T2-m3-tt": function () {
      return B.darkVideo({ picId: "ig-regal", user: "basti.baut", caption: "Regal fertig! Nach nur drei Wochenenden 🔨",
        likes: "6.411", comments: "190", tabs: ["Folge ich", "Für dich"], activeTab: 1, markTab: 1 });
    },
    "T2-m6-ig": function () {
      return B.lock({ items: [
        { app: "Instagram", icon: "ai-ig", when: "vor 5 Min.", text: "📍 Entdecke, was in Essen gerade angesagt ist", marked: true },
        { app: "Wetter", icon: "ai-wx", when: "vor 2 Std.", text: "Morgen früh Regen in Essen" }
      ] });
    },
    "T2-m6-tt": function () {
      return B.lock({ items: [
        { app: "TikTok", icon: "ai-tt", when: "vor 6 Min.", text: "👀 3 Videos, die du verpasst hast, sind gerade im Trend", marked: true },
        { app: "Kalender", icon: "ai-cal", when: "vor 1 Std.", text: "Heute 18:00: Training" }
      ] });
    },
    "T2-m6-sc": function () {
      return B.lock({ items: [
        { app: "Snapchat", icon: "ai-sc", when: "vor 11 Min.", text: "📸 Schau dir an, was heute in deiner Nähe gepostet wurde", marked: true },
        { app: "Nachrichten", icon: "ai-msg", when: "vor 35 Min.", text: "Lea: Kommst du heute noch?" }
      ] });
    },
    // Ablenker T2
    "T2-d-ig-1": function () { // Plus oben links (früher FD-ig-plus, jetzt ohne App-Namen)
      return B.lightFeed({ markPlus: true, posts: [
        { user: "flo.fotografiert", picId: "tt-reel-bg", line: "Gefällt 320 Mal" },
        { user: "deniz", picId: "rl-backen", line: "Gefällt 89 Mal" }
      ] });
    },
    "T2-d-ig-2": function () { // Merken-Symbol
      return B.lightFeed({ posts: [
        { user: "essen.isst", picId: "tt-koch", line: "Gefällt 1.130 Mal", actions: true, markSave: true },
        { user: "nora.liest", picId: "fb-buch", line: "Gefällt 54 Mal" }
      ] });
    },
    "T2-d-ig-3": function () { // „Profil bearbeiten“
      return B.igProfile({ user: "leyla", name: "Leyla", bio: "Duisburg · Musik · Sport", posts: "21", followers: "186", following: "243",
        tiles: ["ig-see", "fb-garten", "tt-hund2", "ig-wandern", "rl-skate-next", "fb-fest"], markEdit: true });
    },
    "T2-d-tt-1": function () { // Profil-Symbol unten
      return B.darkVideo({ picId: "fb-nachbar", user: "nachbarschaft.holsterhausen", caption: "Unser Viertel im Herbst 🍂",
        likes: "812", comments: "37", tabs: ["Folge ich", "Für dich"], activeTab: 1, markNav: 4 });
    },
    "T2-d-tt-2": function () { // Name im Posteingang
      return B.darkInbox({ title: "Posteingang", markUser: 1, rows: [
        { user: "miri.zeichnet", text: "Wie lange hast du dafür gebraucht?", time: "2 Min." },
        { user: "tonio_fit", text: "Bis morgen beim Training!", time: "1 Std." },
        { user: "aylin", text: "Hast du das Video gesehen?", time: "3 Std." },
        { user: "ben", text: "👍", time: "gestern" }
      ] });
    },
    "T2-d-tt-3": function () { // Start-Symbol unten
      return B.darkVideo({ picId: "ig-ramen", user: "ruhrpott.rezepte", caption: "Ramen selbst gemacht 🍜",
        likes: "11,8k", comments: "302", tabs: ["Folge ich", "Für dich"], activeTab: 1, markNav: 0 });
    },
    "T2-d-sc-1": function () { // Überschrift „Chats“
      return B.snap({ title: "Chats", markTitle: true, rows: [
        { user: "Hanna", status: "Neuer Chat · 9 Min." }, { user: "Marko", status: "Geöffnet · 2 Std." },
        { user: "Lea", status: "Gesendet · 5 Std." }, { user: "Timo", status: "Chat empfangen · gestern" },
        { user: "Alte WG", status: "Geöffnet · 3 Tage" }
      ] });
    },
    "T2-d-sc-2": function () { // Chat-Symbol unten
      return B.snap({ title: "Chats", markNav: 1, rows: [
        { user: "Niko", status: "Neuer Snap · 1 Min." }, { user: "Elif", status: "Geöffnet · 30 Min." },
        { user: "Chris", status: "Gesendet · 2 Std." }, { user: "Oma Gisela", status: "Chat empfangen · gestern" },
        { user: "Sam", status: "Geöffnet · 4 Tage" }
      ] });
    },
    "T2-d-sc-3": function () { // Freund hinzufügen
      return B.snap({ title: "Chats", addFriend: true, markAddFriend: true, rows: [
        { user: "Can", status: "Neuer Chat · 6 Min." }, { user: "Noa", status: "Geöffnet · 1 Std." },
        { user: "Deniz", status: "Gesendet · 7 Std." }, { user: "Paula", status: "Chat empfangen · gestern" },
        { user: "Ben", status: "Geöffnet · 2 Tage" }
      ] });
    }
  };

  // ── Geräterahmen + öffentliche render() ────────────────
  function render(entry, opt) {
    var build = CONTENT[entry.id];
    var wrap = document.createElement("div");
    wrap.className = "rec-stage" + (opt && opt.mini ? " mini" : "");
    if (!build) {
      wrap.innerHTML = '<div class="screen-placeholder">[Kein Inhalt für ' + esc(entry.id) + "]</div>";
      return wrap;
    }
    var scr = build();
    // Kopfzeile (Instagram/Snapchat) als eigene Zeile über dem scrollbaren Inhalt,
    // untere Leiste als eigene Zeile darunter: beide bleiben beim Scrollen stehen
    var head = "", foot = "", html = scr.html;
    html = html.replace(/^<div class="(ig-head|snap-head)[^"]*">[\s\S]*?<\/div>/, function (m) { head = m; return ""; });
    html = html.replace(/<div class="nav[^"]*" aria-hidden="true">[\s\S]*?<\/div>$/, function (m) { foot = m; return ""; });
    wrap.innerHTML = '<div class="device-wrap rec" data-size="full"><div class="device ' + scr.cls + '">' +
      '<div class="device-status"><span class="device-tag">' + STATUS_TAG + "</span>" +
      '<span class="device-time">' + STATUS_TIME + '</span><span class="device-icons">' + ICON.status + "</span></div>" +
      head + '<div class="screen-body' + (scr.scroll ? " scroll" : "") + '">' + html + "</div>" + foot + "</div></div>";
    return wrap;
  }

  R.render = render;
  R.CONTENT_IDS = Object.keys(CONTENT);
})();
