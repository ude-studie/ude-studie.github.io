/*
 * recognition/render.js – baut die Erkennens-Screens der Sets T0/T1/T2.
 *
 * Gleiche Optik wie die Schulung (nutzt deren CSS-Klassen aus styles.css:
 * .device, .feed/.post, .ig-*, .igc-*, .lock/.note, .snap-*, .st-*), aber
 * ANDERE Inhalte, Namen und Zahlen, und als Bildflächen neutrale Farbverläufe
 * statt der Schulungs-Fotos (kein Bild kommt doppelt vor, Auftrag Abschnitt 5).
 * Das rot umrahmte Zielelement bekommt die Klasse .rec-mark (bzw. eine
 * .rec-mark-area als Zone), kein JavaScript-Positionieren nötig.
 *
 * window.RECOGNITION.render(entry, {mini}) → DOM-Knoten.
 */
(function () {
  "use strict";

  var R = window.RECOGNITION;

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
  function avatar(name, extra) {
    var clean = String(name || "").replace(/^@/, "");
    var n = hashCode(clean) % 6;
    return '<span class="avatar avc' + n + (extra ? " " + extra : "") + '" aria-hidden="true">' + esc(clean.charAt(0).toUpperCase()) + "</span>";
  }
  // Neutrale Bildfläche: Farbverlauf je Kennung (nie ein Schulungsfoto)
  var GRADS = [
    "linear-gradient(135deg,#b8c6d8,#8fa3bb)", "linear-gradient(135deg,#d8c6b8,#bba38f)",
    "linear-gradient(135deg,#c2d8b8,#9bbb8f)", "linear-gradient(135deg,#d8b8c9,#bb8fa7)",
    "linear-gradient(135deg,#b8d4d8,#8fb4bb)", "linear-gradient(135deg,#d8d2b8,#bbb28f)",
    "linear-gradient(135deg,#9aa7c4,#6f7fa3)", "linear-gradient(135deg,#c4b39a,#a38d6f)"
  ];
  function pic(id, cls) {
    return '<div class="' + cls + '" style="background:' + GRADS[hashCode(String(id)) % GRADS.length] + '"></div>';
  }
  var ICON = {
    heart: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 21s-7.5-4.6-9.6-9.2C.9 8.4 3 4.5 6.7 4.5c2.1 0 3.6 1.1 5.3 3 1.7-1.9 3.2-3 5.3-3 3.7 0 5.8 3.9 4.3 7.3C19.5 16.4 12 21 12 21z"/></svg>',
    heartLine: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="none" stroke="currentColor" stroke-width="2" d="M12 20s-7-4.3-8.9-8.6C1.8 8.3 3.7 5 6.8 5c1.9 0 3.3 1 5.2 3 1.9-2 3.3-3 5.2-3 3.1 0 5 3.3 3.7 6.4C19 15.7 12 20 12 20z"/></svg>',
    comment: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 4h18v12H8l-5 4z"/></svg>',
    share: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M14 4l8 7-8 7v-4c-6 0-9 2-12 6 1-6 4-11 12-12z"/></svg>',
    send: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round" d="M21 3L3 10l7 3 3 7z"/></svg>',
    repost: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="none" stroke="currentColor" stroke-width="2" d="M7 7h9l-2.5-2.5M17 7v6m0 4H8l2.5 2.5M7 17v-6"/></svg>',
    home: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 11l9-8 9 8v10h-6v-6H9v6H3z"/></svg>',
    search: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M10 3a7 7 0 015.6 11.2l5.1 5.1-1.4 1.4-5.1-5.1A7 7 0 1110 3zm0 2a5 5 0 100 10 5 5 0 000-10z"/></svg>',
    plus: '<svg viewBox="0 0 34 24" aria-hidden="true"><rect x="1" y="1" width="32" height="22" rx="6" fill="none" stroke="currentColor" stroke-width="2"/><path d="M16 6h2v5h5v2h-5v5h-2v-5h-5v-2h5z"/></svg>',
    inbox: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 5h18v14H3zm2 2v.5l7 5 7-5V7zm0 3v7h14v-7l-7 5z"/></svg>',
    profile: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3a4.5 4.5 0 110 9 4.5 4.5 0 010-9zm0 11c5 0 8 2.5 8 6v1H4v-1c0-3.5 3-6 8-6z"/></svg>',
    gear: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 8.5A3.5 3.5 0 1112 15.5 3.5 3.5 0 0112 8.5zm8.6 5.1l-1.8-.3a7 7 0 00-.5-1.2l1.1-1.5-1.4-1.4-1.5 1.1c-.4-.2-.8-.4-1.2-.5l-.3-1.8h-2l-.3 1.8c-.4.1-.8.3-1.2.5L9.4 8.2 8 9.6l1.1 1.5c-.2.4-.4.8-.5 1.2l-1.8.3v2l1.8.3c.1.4.3.8.5 1.2L8 17.6 9.4 19l1.5-1.1c.4.2.8.4 1.2.5l.3 1.8h2l.3-1.8c.4-.1.8-.3 1.2-.5l1.5 1.1 1.4-1.4-1.1-1.5c.2-.4.4-.8.5-1.2l1.8-.3z"/></svg>',
    back: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" d="M15 4l-8 8 8 8"/></svg>',
    menu: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 6h16v2H4zm0 5h16v2H4zm0 5h16v2H4z"/></svg>',
    play: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="4" fill="none" stroke="currentColor" stroke-width="2"/><path d="M10 8l6 4-6 4z"/></svg>',
    status: '<svg viewBox="0 0 58 14" aria-hidden="true"><rect x="0" y="9" width="3" height="5" rx="1"/><rect x="5" y="6" width="3" height="8" rx="1"/><rect x="10" y="3" width="3" height="11" rx="1"/><rect x="15" y="0" width="3" height="14" rx="1"/><path d="M27 4.5a9 9 0 0112 0l-1.4 1.5a7 7 0 00-9.2 0zM29.4 7.2a5.5 5.5 0 017.2 0L35.2 8.7a3.5 3.5 0 00-4.4 0zM33 12.5l-1.7-1.8a2.4 2.4 0 013.4 0z"/><rect x="42" y="2" width="14" height="10" rx="3" fill="none" stroke="currentColor" stroke-width="1.4"/><rect x="44" y="4" width="9" height="6" rx="1.5"/></svg>'
  };
  function mark(html, area) {
    return '<span class="' + (area ? "rec-mark-area" : "rec-mark") + '">' + html + "</span>";
  }
  function igHead(title) {
    return '<div class="ig-head"><span class="ig-plus" aria-hidden="true">' + ICON.plus + "</span>" +
      (title ? '<span class="ig-title">' + esc(title) + "</span>" : "") +
      '<span class="ig-icons">' + ICON.heartLine + ICON.send + "</span></div>";
  }
  function ttNav() {
    return '<div class="nav" aria-hidden="true"><span>' + ICON.home + "Start</span><span>" + ICON.search +
      'Entdecken</span><span class="plus">' + ICON.plus + "</span><span>" + ICON.inbox + "Posteingang</span><span>" + ICON.profile + "Profil</span></div>";
  }
  function igPost(o) {
    return '<div class="ig-post"><div class="ig-post-head">' +
      (o.markAvatar ? mark(avatar(o.user)) : avatar(o.user)) +
      '<span class="user">' + esc(o.user) + "</span>" +
      (o.suggested ? (o.markSuggested ? mark('<span class="sugg">' + esc(o.suggested) + "</span>") : '<span class="sugg">' + esc(o.suggested) + "</span>") : "") +
      (o.back ? "" : "") + "</div>" +
      pic(o.picId, "ig-img" + (o.short ? " short" : "")) +
      '<div class="ig-line">' + (o.markLine ? mark("<span>" + esc(o.line) + "</span>") : esc(o.line)) + "</div></div>";
  }

  // ── Screen-Bauer ───────────────────────────────────────
  var B = {};

  // Heller Feed (Instagram / Facebook / X), mit Optionen
  B.lightFeed = function (o) {
    var html = "";
    if (o.backBar) {
      html += '<div class="ig-head"><span class="rec-backwrap">' +
        (o.markBack ? mark('<span class="rec-back">' + ICON.back + "</span>") : '<span class="rec-back">' + ICON.back + "</span>") +
        '</span><span class="ig-title">' + esc(o.backBar) + '</span><span class="ig-icons">' + ICON.send + "</span></div>";
    } else if (o.searchBar != null) {
      html += '<div class="ig-head">' +
        (o.markSearch ? mark('<span class="rec-search">' + ICON.search + "<i>" + esc(o.searchBar) + "</i></span>") :
          '<span class="rec-search">' + ICON.search + "<i>" + esc(o.searchBar) + "</i></span>") +
        (o.markMenu ? mark('<span class="rec-menuicon">' + ICON.menu + "</span>") : (o.menu ? '<span class="rec-menuicon">' + ICON.menu + "</span>" : "")) +
        "</div>";
    } else {
      html += igHead(o.title);
    }
    html += '<div class="ig-content">';
    if (o.refresh) {
      var sp = '<div class="ig-refresh"><span class="spinner spin" aria-hidden="true"></span><span>' + esc(o.refresh) + "</span></div>";
      html += o.markRefresh ? mark(sp, true) : sp;
    }
    if (o.stories) {
      var strip = '<div class="st-bar">' + o.stories.map(function (st, i) {
        return '<div class="st"><span class="st-ring' + (st.own ? " own" : "") + '"><span class="st-av av' + (i % 5) + '" aria-hidden="true">' +
          esc(st.user.charAt(0).toUpperCase()) + "</span>" + (st.own ? '<span class="st-plus" aria-hidden="true">+</span>' : "") +
          '</span><span class="st-name">' + esc(st.user) + "</span></div>";
      }).join("") + "</div>" + (o.expiry ? '<div class="st-expiry">' + esc(o.expiry) + "</div>" : "");
      html += o.markStories ? mark(strip, true) : strip;
    }
    if (o.tile) {
      var tile = '<div class="rec-tile"><div class="rec-tile-head">' + esc(o.tile.head) + '</div><div class="rec-tile-row">' +
        o.tile.items.map(function (t) { return '<div class="rec-tile-card">' + avatar(t) + "<span>" + esc(t) + '</span><button type="button">Folgen</button></div>'; }).join("") +
        "</div></div>";
      html += o.tile.marked ? mark(tile, true) : tile;
    }
    (o.posts || []).forEach(function (p) { html += igPost(p); });
    if (o.video) {
      var v = '<div class="ig-post"><div class="ig-post-head">' + avatar(o.video.user) + '<span class="user">' + esc(o.video.user) + "</span></div>" +
        '<div class="rec-videowrap">' + pic(o.video.picId, "ig-img") +
        '<span class="rec-play-overlay">' + esc(o.video.overlay) + '</span><span class="rec-videobar"><i></i></span></div>' +
        '<div class="ig-line">' + esc(o.video.line) + "</div></div>";
      html += o.video.marked ? mark(v, true) : v;
    }
    if (o.xPosts) {
      o.xPosts.forEach(function (p) {
        var counters = '<div class="rec-x-actions">' +
          "<span>" + ICON.comment + esc(p.comments) + "</span><span>" + ICON.repost + esc(p.reposts) + "</span><span>" + ICON.heartLine + esc(p.likes) + "</span></div>";
        html += '<div class="rec-x-post">' + (p.markAvatar ? mark(avatar(p.user)) : avatar(p.user)) +
          '<div class="rec-x-body"><div class="user">' + esc(p.user) + ' <span class="rec-x-handle">' + esc(p.handle) + "</span></div>" +
          "<p>" + esc(p.text) + "</p>" + (p.picId ? pic(p.picId, "rec-x-img") : "") +
          (p.markCounters ? mark(counters, true) : counters) + "</div></div>";
      });
    }
    if (o.seam) {
      var seam = '<div class="ig-seam"></div>' + igPost(o.seam);
      html += o.markSeam ? mark(seam, true) : seam;
    }
    if (o.more) html += igPost({ user: o.more.user, picId: o.more.picId, line: "", short: true });
    html += "</div>";
    return { cls: o.cls || "ig", scroll: true, html: html };
  };

  // Dunkler Video-Feed (TikTok / Reels)
  B.darkVideo = function (o) {
    var html = "";
    if (o.tabs) {
      html += '<div class="tt-tabs">' + o.tabs.map(function (t, i) {
        var s = "<span" + (i === o.activeTab ? ' class="on"' : "") + ">" + esc(t) + "</span>";
        return (o.markTab === i) ? mark(s) : s;
      }).join("") + (o.searchIcon ? (o.markSearch ? mark('<span class="rec-tt-search">' + ICON.search + "</span>") : '<span class="rec-tt-search">' + ICON.search + "</span>") : "") + "</div>";
    }
    html += '<div class="feed"><div class="track still"><div class="post">' + pic(o.picId, "post-bg") +
      '<div class="meta"><div class="user">' + esc(o.user) + '</div><div class="cap">' +
      (o.markCaption ? mark("<span>" + esc(o.caption) + "</span>") : esc(o.caption)) + "</div>" +
      (o.time ? '<div class="time">' + esc(o.time) + "</div>" : "") + "</div>" +
      '<div class="side"><span>' + (o.markLikes ? mark(ICON.heart + esc(o.likes)) : ICON.heart + esc(o.likes)) + "</span>" +
      "<span>" + ICON.comment + esc(o.comments) + "</span><span>" + ICON.share + esc(o.shares) + "</span></div>" +
      (o.bar ? '<div class="bar"><span class="run" style="animation-duration:6s"></span></div>' : "") +
      (o.nextHint ? (o.markNext ? mark('<div class="rec-next-hint">' + esc(o.nextHint) + "</div>", true) : '<div class="rec-next-hint">' + esc(o.nextHint) + "</div>") : "") +
      "</div></div>" + (o.markSeamZone ? mark('<div class="rec-seam-zone"></div>', true) : "") + "</div>";
    html += ttNav();
    return { cls: "tt", html: html };
  };

  // Dunkle Liste (TikTok-Posteingang)
  B.darkInbox = function (o) {
    var rows = o.rows.map(function (r) {
      return '<div class="rec-inbox-row">' + avatar(r.user) + '<div class="rec-inbox-text"><div class="user">' + esc(r.user) +
        "</div><div>" + esc(r.text) + "</div></div><span class='rec-inbox-time'>" + esc(r.time) + "</span></div>";
    }).join("");
    var sp = '<div class="rec-inbox-refresh"><span class="spinner spin" aria-hidden="true"></span><span>' + esc(o.refresh) + "</span></div>";
    return { cls: "tt", html: '<div class="rec-inbox"><div class="rec-inbox-head">' + esc(o.title) + "</div>" +
      (o.markRefresh ? mark(sp, true) : sp) + rows + "</div>" + ttNav() };
  };

  // Kommentar-Overlay über dunklem Video (TikTok)
  B.comments = function (o) {
    var html = '<div class="igc-reel" style="background:' + GRADS[hashCode(o.picId) % GRADS.length] + '"></div>' +
      '<div class="igc-sheet"><div class="igc-grip" aria-hidden="true"></div><div class="igc-head">' + esc(o.title) + "</div>" +
      o.comments.map(function (c) {
        var likeSpan = '<div class="igc-like">' + ICON.heartLine + '<span class="n">' + esc(c.likes) + "</span></div>";
        return '<div class="igc-row">' + avatar(c.user) + '<div class="igc-text"><div class="user">' + esc(c.user) +
          "</div><div>" + esc(c.text) + "</div></div>" + (c.marked ? mark(likeSpan) : likeSpan) + "</div>";
      }).join("") + "</div>";
    return { cls: "igc", html: html };
  };

  // Sperrbildschirm mit einer markierten Mitteilung
  B.lock = function (o) {
    var html = '<div class="lock-clock">' + esc(o.time) + '</div><div class="lock-date">' + esc(o.date) + '</div><div class="lock-list">';
    o.items.forEach(function (it) {
      var inner = '<span class="app-icon ' + it.icon + '" aria-hidden="true"></span>' +
        '<span class="note-main"><span class="note-top"><strong>' + esc(it.app) + "</strong><span>" + esc(it.when) + "</span></span>" +
        '<span class="note-text">' + esc(it.text) + "</span></span>";
      var note = '<div class="note">' + inner + "</div>";
      html += it.marked ? mark(note, true) : note;
    });
    return { cls: "lock", scroll: true, html: html + "</div>" };
  };

  // Snapchat-Chatliste (Streaks) bzw. Kopf mit Zahnrad/Suche
  B.snap = function (o) {
    var head = '<div class="snap-head"><span>' + esc(o.title) + "</span>" +
      (o.search != null ? (o.markSearch ? mark('<span class="rec-search dark">' + ICON.search + "<i>" + esc(o.search) + "</i></span>") : '<span class="rec-search dark">' + ICON.search + "<i>" + esc(o.search) + "</i></span>") : "") +
      (o.gear ? (o.markGear ? mark('<span class="rec-gearicon">' + ICON.gear + "</span>") : '<span class="rec-gearicon">' + ICON.gear + "</span>") : "") +
      "</div>";
    var rows = (o.rows || []).map(function (row) {
      var streak = row.streak ? '<span class="streak">' + esc(row.streak) + "</span>" : "";
      return '<div class="snap-row">' + avatar(row.user, "bitmoji") + '<div class="snap-text"><div class="user">' + esc(row.user) +
        '</div><div class="status">' + esc(row.status) + "</div></div>" + (row.marked ? mark(streak) : streak) + "</div>";
    }).join("");
    var stories = "";
    if (o.stories) {
      var strip = '<div class="st-bar dark">' + o.stories.map(function (st, i) {
        return '<div class="st"><span class="st-ring"><span class="st-av av' + (i % 5) + '" aria-hidden="true">' + esc(st.user.charAt(0).toUpperCase()) +
          '</span></span><span class="st-name">' + esc(st.user) + "</span></div>";
      }).join("") + "</div>" + (o.expiry ? '<div class="st-expiry dark">' + esc(o.expiry) + "</div>" : "");
      stories = o.markStories ? mark(strip, true) : strip;
    }
    return { cls: "snap", scroll: true, html: head + stories + rows };
  };

  // Explore-Raster (Instagram)
  B.explore = function (o) {
    var cells = o.cells.map(function (c, i) {
      return pic("xp" + i + c, "rec-explore-cell");
    }).join("");
    var grid = '<div class="rec-explore">' + cells + "</div>";
    var head = '<div class="ig-head"><span class="rec-search">' + ICON.search + "<i>" + esc(o.search) + "</i></span></div>";
    var hint = '<div class="rec-explore-hint">' + esc(o.hint) + "</div>";
    return { cls: "ig", scroll: true, html: head + (o.marked ? mark(hint + grid, true) : hint + grid) };
  };

  // ── Inhalte je Set-Eintrag (NEUE Namen, Zahlen, Inhalte) ────────────────
  var CONTENT = {
    // ===== Set T0 =====
    "T0-1": function () { // m2: Facebook, Ziehen zum Aktualisieren
      return B.lightFeed({ cls: "ig", title: "Startseite", refresh: "Wird aktualisiert …", markRefresh: true,
        posts: [
          { user: "Stadtfest Essen", picId: "fb-fest", line: "128 Reaktionen · 14 Kommentare" },
          { user: "Jonas B.", picId: "fb-grill", line: "56 Reaktionen · 8 Kommentare" }
        ] });
    },
    "T0-2": function () { // Distraktor: IG Profilbild
      return B.lightFeed({ title: null,
        posts: [
          { user: "lena.unterwegs", picId: "ig-see", line: "Gefällt 214 Mal", markAvatar: true },
          { user: "cafe.eckhaus", picId: "ig-kaffee", line: "Gefällt 89 Mal" }
        ] });
    },
    "T0-3": function () { // m5: TikTok-Kommentare, Herzen und Zähler
      return B.comments({ picId: "tt-reel-bg", title: "Kommentare (412)",
        comments: [
          { user: "ayla.m", text: "Genau mein Montag 😂", likes: "1.204", marked: true },
          { user: "finn_ok", text: "Wo ist das?", likes: "87" },
          { user: "nora.liest", text: "Team Kaffee ☕", likes: "33" }
        ] });
    },
    "T0-4": function () { // m1: Instagram Reels, endloses Scrollen
      return B.darkVideo({ picId: "rl-skate", user: "timo.rollt", caption: "Erster Versuch nach dem Regen 🛹",
        likes: "22,4k", comments: "318", shares: "Teilen", markSeamZone: true });
    },
    "T0-5": function () { // m6: Sperrbildschirm, TikTok-Meldung
      return B.lock({ time: "21:47", date: "Mittwoch, 7. Oktober",
        items: [
          { app: "TikTok", icon: "ai-tt", when: "vor 12 Min.", text: "🔥 Dein Video von gestern geht gerade ab – sieh nach!", marked: true },
          { app: "Nachrichten", icon: "ai-fb", when: "vor 26 Min.", text: "Mama: Bis Sonntag!" }
        ] });
    },
    "T0-6": function () { // Distraktor: TikTok-Suchleiste
      return B.darkVideo({ picId: "tt-koch", user: "kochtmit", caption: "5-Minuten-Nudeln, die wirklich halten",
        likes: "9.812", comments: "233", shares: "Teilen",
        tabs: ["Folge ich", "Für dich"], activeTab: 1, searchIcon: true, markSearch: true });
    },
    "T0-7": function () { // m4: TikTok Autoplay
      return B.darkVideo({ picId: "tt-hund2", user: "struppi.tv", caption: "Er wartet jeden Tag am Fenster 🐶",
        likes: "48,1k", comments: "1.022", shares: "Teilen", bar: true, time: "0:04 · läuft",
        nextHint: "Nächstes Video startet gleich …", markNext: true });
    },
    "T0-8": function () { // m8: Snapchat Stories, verfallende Inhalte
      return B.snap({ title: "Stories",
        stories: [{ user: "Mara" }, { user: "Ben" }, { user: "Elif" }, { user: "Noa" }],
        expiry: "Maras Story läuft in 2 Std. ab", markStories: true,
        rows: [] });
    },
    "T0-9": function () { // m3: TikTok, Empfehlungen nach Schwäche
      return B.darkVideo({ picId: "tt-sale", user: "deals.daily", caption: "Vorgeschlagen, weil du ähnliche Videos bis zum Ende gesehen hast",
        markCaption: true, likes: "5.604", comments: "120", shares: "Teilen",
        tabs: ["Folge ich", "Für dich"], activeTab: 1 });
    },
    "T0-10": function () { // Distraktor: Snapchat-Zahnrad
      return B.snap({ title: "Chats", gear: true, markGear: true,
        rows: [
          { user: "Paula", status: "Hat deinen Chat geöffnet · 1 Std." },
          { user: "Can", status: "Neuer Chat · 14 Min.", streak: "🔥 12" }
        ] });
    },
    "T0-11": function () { // m7: Snapchat Streaks
      return B.snap({ title: "Chats",
        rows: [
          { user: "Jule", status: "Snap gesendet · 3 Std.", streak: "🔥 87", marked: true },
          { user: "Sam", status: "Neuer Snap · 22 Min.", streak: "🔥 15" },
          { user: "Oma Gisela", status: "Hat deinen Snap geöffnet · gestern" }
        ] });
    },

    // ===== Set T1 =====
    "T1-1": function () { // m4: Facebook, Video startet im Feed
      return B.lightFeed({ title: "Startseite",
        posts: [{ user: "Hörsaal-Memes", picId: "fb-meme", line: "342 Reaktionen · 51 Kommentare" }],
        video: { user: "Ruhrpott Rezepte", picId: "fb-video", overlay: "▶ Wird abgespielt", line: "1.208 Reaktionen · wird automatisch abgespielt", marked: true } });
    },
    "T1-2": function () { // Distraktor: Facebook-Suchfeld
      return B.lightFeed({ searchBar: "Auf Facebook suchen", markSearch: true,
        posts: [
          { user: "Flohmarkt Rüttenscheid", picId: "fb-floh", line: "67 Reaktionen · 12 Kommentare" },
          { user: "Nachbarschaft Holsterhausen", picId: "fb-nachbar", line: "23 Reaktionen · 4 Kommentare" }
        ] });
    },
    "T1-3": function () { // m1: X-Timeline, endlos
      return B.lightFeed({ cls: "ig", title: "Für dich",
        xPosts: [
          { user: "Lea", handle: "@lea_schreibt", text: "Der Oktober macht wieder, was er will. 🌧️", comments: "41", reposts: "12", likes: "530" },
          { user: "Uni Duisburg-Essen", handle: "@unidue", text: "Die Bibliothek hat ab sofort länger geöffnet: Mo–Fr bis 24 Uhr.", comments: "18", reposts: "77", likes: "902" }
        ],
        seam: { user: "stadt.essen", picId: "x-stadt", line: "" }, markSeam: true });
    },
    "T1-4": function () { // m6: Sperrbildschirm, Snapchat-Meldung
      return B.lock({ time: "18:03", date: "Dienstag, 20. Oktober",
        items: [
          { app: "Snapchat", icon: "ai-sc", when: "vor 3 Min.", text: "👻 Deine Freunde haben etwas gepostet, das du verpasst hast", marked: true },
          { app: "Kalender", icon: "ai-fb", when: "vor 1 Std.", text: "Morgen 10:00: Statistik-Übung" }
        ] });
    },
    "T1-5": function () { // m2: TikTok-Posteingang, Ziehen zum Aktualisieren
      return B.darkInbox({ title: "Posteingang", refresh: "Suche nach neuen Aktivitäten …", markRefresh: true,
        rows: [
          { user: "miri.zeichnet", text: "hat deinen Kommentar geliked", time: "2 Min." },
          { user: "tonio_fit", text: "hat dir gefolgt", time: "1 Std." },
          { user: "System", text: "Dein Video wurde 1.000-mal angesehen", time: "3 Std." }
        ] });
    },
    "T1-6": function () { // Distraktor: X-Profilbild
      return B.lightFeed({ cls: "ig", title: "Für dich",
        xPosts: [
          { user: "Niko", handle: "@niko_codes", text: "Endlich das Projekt abgegeben. Schlafen. Zwei Tage.", comments: "9", reposts: "3", likes: "188", markAvatar: true },
          { user: "Mensa-Update", handle: "@mensaupdate", text: "Heute: Linsencurry oder Schnitzel.", comments: "25", reposts: "11", likes: "240" }
        ] });
    },
    "T1-7": function () { // m8: Facebook Stories
      return B.lightFeed({ title: "Startseite",
        stories: [{ user: "Du", own: true }, { user: "Aylin" }, { user: "Chris" }, { user: "Deniz" }],
        expiry: "Aylins Story läuft in 1 Std. ab", markStories: true,
        posts: [{ user: "Campus Garten", picId: "fb-garten", line: "88 Reaktionen · 9 Kommentare" }] });
    },
    "T1-8": function () { // m5: X, Like- und Repost-Zähler
      return B.lightFeed({ cls: "ig", title: "Für dich",
        xPosts: [
          { user: "Hanna", handle: "@hanna_h", text: "Mein Paper wurde angenommen!! 🎉", comments: "63", reposts: "répostet 98", likes: "1.741", markCounters: true },
          { user: "Bahn-Ansagen", handle: "@bahnansagen", text: "„Wir warten noch auf entgegenkommende Züge.“ – Klassiker.", comments: "12", reposts: "31", likes: "402" }
        ] });
    },
    "T1-9": function () { // Distraktor: IG Zurück-Pfeil
      return B.lightFeed({ backBar: "Beitrag", markBack: true,
        posts: [{ user: "berg.und.tal", picId: "ig-wandern", line: "Gefällt 462 Mal" }] });
    },
    "T1-10": function () { // m3: Facebook, Vorschläge für dich
      return B.lightFeed({ title: "Startseite",
        tile: { head: "Vorschläge für dich", items: ["Lauftreff Essen", "Prokrastinations-Memes", "WG-Rezepte"], marked: true },
        posts: [{ user: "Theater AG", picId: "fb-theater", line: "45 Reaktionen · 6 Kommentare" }] });
    },
    "T1-11": function () { // m7: Snapchat Streaks
      return B.snap({ title: "Chats",
        rows: [
          { user: "Ben", status: "Snap gesendet · 1 Std.", streak: "🔥 203", marked: true },
          { user: "Leyla", status: "Neuer Chat · 8 Min.", streak: "🔥 4" },
          { user: "Papa", status: "Hat deinen Snap geöffnet · gestern" }
        ] });
    },

    // ===== Set T2 =====
    "T2-1": function () { // m3: Instagram Explore
      return B.explore({ search: "Suchen", hint: "Für dich zusammengestellt – aus dem, was du zuletzt angesehen hast",
        cells: ["a", "b", "c", "d", "e", "f", "g", "h", "i"], marked: true });
    },
    "T2-2": function () { // Distraktor: TikTok-Zahnrad
      return B.snapGearOnTT();
    },
    "T2-3": function () { // m6: Sperrbildschirm, Instagram-Meldung
      return B.lock({ time: "22:19", date: "Dienstag, 27. Oktober",
        items: [
          { app: "Instagram", icon: "ai-ig", when: "vor 5 Min.", text: "❤️ deniz.foto und 11 andere haben auf deine Story reagiert", marked: true },
          { app: "Wetter", icon: "ai-x", when: "vor 2 Std.", text: "Morgen früh Regen in Essen" }
        ] });
    },
    "T2-4": function () { // m1: TikTok endlos
      return B.darkVideo({ picId: "tt-tanz", user: "jule.moves", caption: "Noch ein Versuch, dann gebe ich auf (gelogen)",
        likes: "31,7k", comments: "540", shares: "Teilen", markSeamZone: true,
        tabs: ["Folge ich", "Für dich"], activeTab: 1 });
    },
    "T2-5": function () { // m8: Instagram Story-Ring
      return B.lightFeed({ title: null,
        stories: [{ user: "Deine Story", own: true }, { user: "mara.b" }, { user: "chris_89" }, { user: "noa.zeigt" }],
        expiry: "mara.bs Story läuft in 45 Min. ab", markStories: true,
        posts: [{ user: "unikino.essen", picId: "ig-kino", line: "Gefällt 173 Mal" }] });
    },
    "T2-6": function () { // Distraktor: Snapchat-Suchleiste
      return B.snap({ title: "Chats", search: "Suchen", markSearch: true,
        rows: [
          { user: "Timo", status: "Neuer Snap · 5 Min.", streak: "🔥 31" },
          { user: "Alte WG", status: "Hat deinen Chat geöffnet · 2 Std." }
        ] });
    },
    "T2-7": function () { // m5: Instagram Like-Zähler
      return B.lightFeed({ title: null,
        posts: [
          { user: "essen.isst", picId: "ig-ramen", line: "Gefällt 1.287 Mal", markLine: true },
          { user: "basti.baut", picId: "ig-regal", line: "Gefällt 54 Mal" }
        ] });
    },
    "T2-8": function () { // m2: Instagram, Ziehen zum Aktualisieren
      return B.lightFeed({ title: null, refresh: "Neue Beiträge werden geladen …", markRefresh: true,
        posts: [{ user: "flo.fotografiert", picId: "ig-nebel", line: "Gefällt 320 Mal" }] });
    },
    "T2-9": function () { // m7: Snapchat Streaks
      return B.snap({ title: "Chats",
        rows: [
          { user: "Elif", status: "Snap gesendet · 40 Min.", streak: "🔥 356", marked: true },
          { user: "Marko", status: "Neuer Snap · 1 Std.", streak: "🔥 9" },
          { user: "Kursgruppe BWL", status: "Neuer Chat · 10 Min." }
        ] });
    },
    "T2-10": function () { // Distraktor: Facebook-Menü
      return B.lightFeed({ searchBar: "Auf Facebook suchen", menu: true, markMenu: true,
        posts: [{ user: "Bücherschrank Südviertel", picId: "fb-buch", line: "31 Reaktionen · 2 Kommentare" }] });
    },
    "T2-11": function () { // m4: Instagram Reels Autoplay
      return B.darkVideo({ picId: "rl-backen", user: "lea.backt", caption: "Der Teig ist IMMER zu klebrig??",
        likes: "12,9k", comments: "207", shares: "Teilen", bar: true, time: "0:02 · läuft",
        nextHint: "Nächstes Reel startet gleich …", markNext: true });
    }
  };

  // TikTok-Profilseite mit Zahnrad (eigener Bauer, nur für T2-2)
  B.snapGearOnTT = function () {
    var html = '<div class="rec-tt-profile"><div class="rec-tt-profilehead"><span class="rec-backwrap"><span class="rec-back light">' + ICON.back + "</span></span>" +
      '<span class="rec-tt-profilename">timo.rollt</span>' +
      mark('<span class="rec-gearicon light">' + ICON.gear + "</span>") + "</div>" +
      '<div class="rec-tt-profilestats"><span><b>102</b> Folge ich</span><span><b>4.218</b> Follower</span><span><b>58,1k</b> Likes</span></div>' +
      '<div class="rec-explore dark">' + ["a", "b", "c", "d", "e", "f"].map(function (c, i) { return pic("ttp" + i, "rec-explore-cell"); }).join("") + "</div></div>";
    return { cls: "tt", scroll: true, html: html };
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
    wrap.innerHTML = '<div class="device-wrap rec" data-size="full"><div class="device ' + scr.cls + '">' +
      '<div class="device-status"><span class="device-tag">Nachgestellt</span>' +
      '<span class="device-time">09:41</span><span class="device-icons">' + ICON.status + "</span></div>" +
      '<div class="screen-body' + (scr.scroll ? " scroll" : "") + '">' + scr.html + "</div></div></div>";
    return wrap;
  }

  R.render = render;
})();
