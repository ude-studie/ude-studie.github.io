/*
 * qr.js – kleiner QR-Code-Erzeuger ohne externe Bibliothek (v4, Etappe 9).
 * Byte-Modus, Fehlerkorrektur M, Versionen 1–10 (bis 213 Bytes), beste von 8 Masken.
 * Nach dem Verfahren der QR-Norm (ISO/IEC 18004), Aufbau angelehnt an
 * Project Nayuki „QR Code generator library“ (MIT-Lizenz).
 *
 *   window.QR.matrix(text) → { size, modules: [[true/false …] …], version, mask }
 *   window.QR.svg(text)    → SVG-Text (schwarze Module auf Weiß, mit Ruhezone)
 */
(function () {
  "use strict";

  // Fehlerkorrektur M: Codewörter je Block und Zahl der Blöcke, Index = Version (1–10)
  var ECC_PER_BLOCK = [-1, 10, 16, 26, 18, 24, 16, 18, 22, 22, 26];
  var NUM_BLOCKS = [-1, 1, 1, 1, 2, 2, 4, 4, 4, 5, 5];
  var FORMAT_ECL_M = 0; // Formatbits für M

  function rawModules(ver) {
    var r = (16 * ver + 128) * ver + 64;
    if (ver >= 2) {
      var na = Math.floor(ver / 7) + 2;
      r -= (25 * na - 10) * na - 55;
      if (ver >= 7) r -= 36;
    }
    return r;
  }
  function dataCodewords(ver) {
    return Math.floor(rawModules(ver) / 8) - ECC_PER_BLOCK[ver] * NUM_BLOCKS[ver];
  }

  // UTF-8-Bytes eines Textes
  function utf8(text) {
    var s = unescape(encodeURIComponent(text)), out = [];
    for (var i = 0; i < s.length; i++) out.push(s.charCodeAt(i));
    return out;
  }

  // ── Reed-Solomon über GF(256), Polynom 0x11D ──
  function gfMul(x, y) {
    var z = 0;
    for (var i = 7; i >= 0; i--) {
      z = (z << 1) ^ ((z >>> 7) * 0x11D);
      z ^= ((y >>> i) & 1) * x;
    }
    return z;
  }
  function rsDivisor(degree) {
    var r = [];
    for (var i = 0; i < degree - 1; i++) r.push(0);
    r.push(1);
    var root = 1;
    for (var k = 0; k < degree; k++) {
      for (var j = 0; j < r.length; j++) {
        r[j] = gfMul(r[j], root);
        if (j + 1 < r.length) r[j] ^= r[j + 1];
      }
      root = gfMul(root, 0x02);
    }
    return r;
  }
  function rsRemainder(data, div) {
    var r = div.map(function () { return 0; });
    data.forEach(function (b) {
      var f = b ^ r.shift();
      r.push(0);
      div.forEach(function (c, i) { r[i] ^= gfMul(c, f); });
    });
    return r;
  }

  function encode(text) {
    var bytes = utf8(text);
    var ver, cap;
    for (ver = 1; ver <= 10; ver++) {
      var ccBits = ver <= 9 ? 8 : 16;
      cap = dataCodewords(ver) * 8;
      if (4 + ccBits + bytes.length * 8 <= cap) break;
    }
    if (ver > 10) throw new Error("QR: Text zu lang");

    // Bitstrom: Modus 0100 (Byte), Zeichenzahl, Daten, Abschluss, Füllbytes
    var bits = [];
    function put(val, len) { for (var i = len - 1; i >= 0; i--) bits.push((val >>> i) & 1); }
    put(4, 4);
    put(bytes.length, ver <= 9 ? 8 : 16);
    bytes.forEach(function (b) { put(b, 8); });
    put(0, Math.min(4, cap - bits.length));
    put(0, (8 - bits.length % 8) % 8);
    for (var pad = 0xEC; bits.length < cap; pad ^= 0xEC ^ 0x11) put(pad, 8);
    var data = [];
    for (var i = 0; i < bits.length; i += 8) {
      var v = 0;
      for (var j = 0; j < 8; j++) v = (v << 1) | bits[i + j];
      data.push(v);
    }

    // Fehlerkorrektur je Block, dann verschränken
    var nb = NUM_BLOCKS[ver], eccLen = ECC_PER_BLOCK[ver];
    var raw = Math.floor(rawModules(ver) / 8);
    var nShort = nb - raw % nb, shortLen = Math.floor(raw / nb);
    var div = rsDivisor(eccLen), blocks = [], k = 0;
    for (var b = 0; b < nb; b++) {
      var dat = data.slice(k, k + shortLen - eccLen + (b < nShort ? 0 : 1));
      k += dat.length;
      var ecc = rsRemainder(dat, div);
      if (b < nShort) dat.push(0);
      blocks.push(dat.concat(ecc));
    }
    var all = [];
    for (var x = 0; x < blocks[0].length; x++) {
      for (var y = 0; y < blocks.length; y++) {
        if (x !== shortLen - eccLen || y >= nShort) all.push(blocks[y][x]);
      }
    }
    return { ver: ver, codewords: all };
  }

  function build(text) {
    var enc = encode(text), ver = enc.ver, size = ver * 4 + 17;
    var mod = [], fn = [];
    for (var r = 0; r < size; r++) { mod.push(new Array(size).fill(false)); fn.push(new Array(size).fill(false)); }
    function setF(x, y, dark) { mod[y][x] = dark; fn[y][x] = true; }

    // Taktlinien
    for (var i = 0; i < size; i++) { setF(6, i, i % 2 === 0); setF(i, 6, i % 2 === 0); }
    // Positionsmarken
    [[3, 3], [size - 4, 3], [3, size - 4]].forEach(function (c) {
      for (var dy = -4; dy <= 4; dy++) for (var dx = -4; dx <= 4; dx++) {
        var d = Math.max(Math.abs(dx), Math.abs(dy)), xx = c[0] + dx, yy = c[1] + dy;
        if (xx >= 0 && xx < size && yy >= 0 && yy < size) setF(xx, yy, d !== 2 && d !== 4);
      }
    });
    // Ausrichtungsmarken
    var al = [];
    if (ver > 1) {
      var na = Math.floor(ver / 7) + 2;
      var step = Math.ceil((ver * 4 + 4) / (na * 2 - 2)) * 2;
      al = [6];
      for (var pos = size - 7; al.length < na; pos -= step) al.splice(1, 0, pos);
    }
    al.forEach(function (ay, a) {
      al.forEach(function (ax, b) {
        if ((a === 0 && b === 0) || (a === 0 && b === al.length - 1) || (a === al.length - 1 && b === 0)) return;
        for (var dy = -2; dy <= 2; dy++) for (var dx = -2; dx <= 2; dx++) setF(ax + dx, ay + dy, Math.max(Math.abs(dx), Math.abs(dy)) !== 1);
      });
    });
    // Formatbits als Platzhalter, Versionsinfo (ab Version 7)
    function drawFormat(mask) {
      var data = (FORMAT_ECL_M << 3) | mask, rem = data;
      for (var t = 0; t < 10; t++) rem = (rem << 1) ^ ((rem >>> 9) * 0x537);
      var bitsF = ((data << 10) | rem) ^ 0x5412;
      var bit = function (n) { return ((bitsF >>> n) & 1) !== 0; };
      for (var q = 0; q <= 5; q++) setF(8, q, bit(q));
      setF(8, 7, bit(6)); setF(8, 8, bit(7)); setF(7, 8, bit(8));
      for (q = 9; q < 15; q++) setF(14 - q, 8, bit(q));
      for (q = 0; q < 8; q++) setF(size - 1 - q, 8, bit(q));
      for (q = 8; q < 15; q++) setF(8, size - 15 + q, bit(q));
      setF(8, size - 8, true);
    }
    drawFormat(0);
    if (ver >= 7) {
      var rv = ver;
      for (var t = 0; t < 12; t++) rv = (rv << 1) ^ ((rv >>> 11) * 0x1F25);
      var vb = (ver << 12) | rv;
      for (var s = 0; s < 18; s++) {
        var on = ((vb >>> s) & 1) !== 0, a2 = size - 11 + s % 3, b2 = Math.floor(s / 3);
        setF(a2, b2, on); setF(b2, a2, on);
      }
    }

    // Daten im Zickzack einzeichnen
    var cw = enc.codewords, bi = 0;
    for (var right = size - 1; right >= 1; right -= 2) {
      if (right === 6) right = 5;
      for (var vert = 0; vert < size; vert++) {
        for (var j = 0; j < 2; j++) {
          var xx = right - j, up = ((right + 1) & 2) === 0, yy = up ? size - 1 - vert : vert;
          if (!fn[yy][xx] && bi < cw.length * 8) {
            mod[yy][xx] = ((cw[bi >>> 3] >>> (7 - (bi & 7))) & 1) !== 0;
            bi++;
          }
        }
      }
    }

    function maskFn(m, x, y) {
      switch (m) {
        case 0: return (x + y) % 2 === 0;
        case 1: return y % 2 === 0;
        case 2: return x % 3 === 0;
        case 3: return (x + y) % 3 === 0;
        case 4: return (Math.floor(x / 3) + Math.floor(y / 2)) % 2 === 0;
        case 5: return x * y % 2 + x * y % 3 === 0;
        case 6: return (x * y % 2 + x * y % 3) % 2 === 0;
        default: return ((x + y) % 2 + x * y % 3) % 2 === 0;
      }
    }
    function applyMask(m) {
      for (var y = 0; y < size; y++) for (var x = 0; x < size; x++) {
        if (!fn[y][x] && maskFn(m, x, y)) mod[y][x] = !mod[y][x];
      }
    }
    // Strafpunkte (vereinfachte Regeln 1–4 der Norm) zur Wahl der Maske
    function penalty() {
      var p = 0, x, y, run, dark = 0;
      for (y = 0; y < size; y++) {
        for (var dir = 0; dir < 2; dir++) {
          run = 1;
          for (x = 1; x < size; x++) {
            var cur = dir ? mod[x][y] : mod[y][x], prev = dir ? mod[x - 1][y] : mod[y][x - 1];
            if (cur === prev) { run++; if (run === 5) p += 3; else if (run > 5) p++; }
            else run = 1;
          }
        }
      }
      for (y = 0; y < size - 1; y++) for (x = 0; x < size - 1; x++) {
        var c = mod[y][x];
        if (c === mod[y][x + 1] && c === mod[y + 1][x] && c === mod[y + 1][x + 1]) p += 3;
      }
      var pat = [true, false, true, true, true, false, true];
      function finderLike(get) {
        for (var i = 0; i + 7 <= size; i++) {
          var ok = true;
          for (var q = 0; q < 7 && ok; q++) if (get(i + q) !== pat[q]) ok = false;
          if (!ok) continue;
          var before = true, after = true;
          for (q = 1; q <= 4; q++) {
            if (i - q >= 0 && get(i - q)) before = false;
            if (i + 6 + q < size && get(i + 6 + q)) after = false;
          }
          if (before || after) p += 40;
        }
      }
      for (y = 0; y < size; y++) {
        (function (yy) { finderLike(function (i) { return mod[yy][i]; }); finderLike(function (i) { return mod[i][yy]; }); })(y);
      }
      for (y = 0; y < size; y++) for (x = 0; x < size; x++) if (mod[y][x]) dark++;
      var total = size * size;
      p += Math.max(0, Math.ceil(Math.abs(dark * 20 - total * 10) / total) - 1) * 10;
      return p;
    }
    var best = 0, bestP = Infinity;
    for (var m = 0; m < 8; m++) {
      applyMask(m); drawFormat(m);
      var pv = penalty();
      if (pv < bestP) { bestP = pv; best = m; }
      applyMask(m); // zurücknehmen (XOR)
    }
    applyMask(best); drawFormat(best);
    return { size: size, modules: mod, version: ver, mask: best };
  }

  function svg(text, opt) {
    var q = build(text), border = 4, n = q.size + border * 2, d = "";
    for (var y = 0; y < q.size; y++) for (var x = 0; x < q.size; x++) {
      if (q.modules[y][x]) d += "M" + (x + border) + "," + (y + border) + "h1v1h-1z";
    }
    var label = (opt && opt.label) ? String(opt.label).replace(/[<&"]/g, "") : "QR-Code";
    return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + n + " " + n + '" role="img" aria-label="' + label +
      '" shape-rendering="crispEdges"><rect width="100%" height="100%" fill="#fff"/><path d="' + d + '" fill="#000"/></svg>';
  }

  window.QR = { matrix: build, svg: svg };
})();
