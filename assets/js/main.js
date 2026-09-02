/* ═══════════════════════════════════════════════════════════
   NAMI — scroll engine
   Vanilla, no dependencies. Smooth scroll + parallax + reveals.
   ═══════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  var html = document.documentElement;
  var body = document.body;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fine = window.matchMedia('(hover:hover) and (pointer:fine)').matches;
  var touch = ('ontouchstart' in window) || navigator.maxTouchPoints > 0;

  var vh = window.innerHeight;
  var vw = window.innerWidth;
  var maxScroll = 0;

  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
  function lerp(a, b, t) { return a + (b - a) * t; }
  function docTop(el) { var r = el.getBoundingClientRect(); return r.top + window.scrollY; }

  /* ── 1. image fallbacks ───────────────────────────────── */
  document.querySelectorAll('img').forEach(function (img) {
    img.addEventListener('error', function () {
      var alt = img.getAttribute('data-fallback');
      if (alt && img.src !== alt) { img.removeAttribute('data-fallback'); img.src = alt; return; }
      img.style.visibility = 'hidden';
      var wrap = img.closest('.media, .hero__media, .dark__media');
      if (wrap) wrap.classList.add('is-broken');
    });
  });

  /* ── 2. split text ────────────────────────────────────── */
  document.querySelectorAll('[data-split="chars"]').forEach(function (el) {
    var txt = el.textContent.trim(), out = '';
    for (var i = 0; i < txt.length; i++) {
      var c = txt[i] === ' ' ? '&nbsp;' : txt[i];
      out += '<span class="split-char" style="--i:' + i + '">' + c + '</span>';
    }
    el.innerHTML = out;
  });

  var wordBlocks = [];
  document.querySelectorAll('[data-split="words"]').forEach(function (el) {
    var words = el.textContent.trim().split(/\s+/);
    el.innerHTML = words.map(function (w) { return '<span class="split-word">' + w + '</span>'; }).join(' ');
    wordBlocks.push({ el: el, words: el.querySelectorAll('.split-word'), top: 0 });
  });

  /* nav roll-over duplicates */
  document.querySelectorAll('.nav a span').forEach(function (s) { s.setAttribute('data-dup', s.textContent); });

  /* ── 3. smooth scroll (lenis-lite) ────────────────────── */
  var SM = {
    on: !touch && !reduce,
    target: window.scrollY,
    current: window.scrollY,
    last: window.scrollY,
    ease: 0.088,
    vel: 0,
    locked: false
  };

  function measure() {
    vh = window.innerHeight; vw = window.innerWidth;
    maxScroll = Math.max(0, document.documentElement.scrollHeight - vh);
    cacheParallax(); cacheHScroll(); cacheWords(); cacheRoute(); rFit(); fFit(); wFit();
  }

  window.addEventListener('wheel', function (e) {
    if (SM.locked) { e.preventDefault(); return; }
    if (!SM.on) return;
    e.preventDefault();
    var d = e.deltaY * (e.deltaMode === 1 ? 20 : e.deltaMode === 2 ? vh : 1);
    SM.target = clamp(SM.target + d, 0, maxScroll);
  }, { passive: false });

  window.addEventListener('touchmove', function (e) { if (SM.locked) e.preventDefault(); }, { passive: false });

  window.addEventListener('keydown', function (e) {
    if (!SM.on || SM.locked) return;
    var t = e.target.tagName;
    if (t === 'INPUT' || t === 'TEXTAREA') return;
    var step = null;
    if (e.key === 'ArrowDown') step = 90;
    else if (e.key === 'ArrowUp') step = -90;
    else if (e.key === 'PageDown' || (e.key === ' ' && !e.shiftKey)) step = vh * 0.9;
    else if (e.key === 'PageUp' || (e.key === ' ' && e.shiftKey)) step = -vh * 0.9;
    else if (e.key === 'Home') { SM.target = 0; e.preventDefault(); return; }
    else if (e.key === 'End') { SM.target = maxScroll; e.preventDefault(); return; }
    if (step !== null) { e.preventDefault(); SM.target = clamp(SM.target + step, 0, maxScroll); }
  });

  window.addEventListener('scroll', function () {
    if (!SM.on) return;
    if (Math.abs(window.scrollY - SM.last) > 3) { SM.target = SM.current = window.scrollY; }
  }, { passive: true });

  function scrollToY(y) {
    y = clamp(y, 0, maxScroll);
    if (SM.on) SM.target = y;
    else window.scrollTo({ top: y, behavior: reduce ? 'auto' : 'smooth' });
  }

  document.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var id = a.getAttribute('href');
      if (id === '#' || id.length < 2) return;
      var el = document.querySelector(id);
      if (!el) return;
      e.preventDefault();
      closeMenu();
      scrollToY(docTop(el) - (id === '#top' ? 0 : 10));
    });
  });

  /* ── 4. parallax ──────────────────────────────────────── */
  var pItems = [];
  function cacheParallax() {
    pItems = [];
    document.querySelectorAll('[data-parallax]').forEach(function (el) {
      var img = el.querySelector(':scope > video, :scope > img, :scope > .ph');
      pItems.push({
        node: img || el,
        speed: parseFloat(el.getAttribute('data-parallax')) || 0,
        center: docTop(el) + el.offsetHeight / 2,
        h: el.offsetHeight
      });
    });
  }

  /* ── 5. horizontal scroll sections ────────────────────── */
  var hItems = [];
  function cacheHScroll() {
    hItems = [];
    document.querySelectorAll('[data-hscroll]').forEach(function (sec) {
      var track = sec.querySelector('.hs__track');
      if (!track) return;
      var pad = parseFloat(getComputedStyle(track).paddingLeft) || 0;
      hItems.push({
        sec: sec, track: track,
        top: docTop(sec),
        len: sec.offsetHeight - vh,
        max: Math.max(0, track.scrollWidth - vw + pad),
        x: 0
      });
    });
  }

  function cacheWords() { wordBlocks.forEach(function (w) { w.top = docTop(w.el); }); }

  /* ── 6. reveals ───────────────────────────────────────── */
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        en.target.classList.add('is-in');
        io.unobserve(en.target);
      });
    }, { rootMargin: '0px 0px -12% 0px', threshold: 0.08 });

    document.querySelectorAll('.reveal, .reveal-up, .cover').forEach(function (el, i) {
      el.style.setProperty('--i', i % 6);
      io.observe(el);
    });
  } else {
    document.querySelectorAll('.reveal, .reveal-up, .cover').forEach(function (el) { el.classList.add('is-in'); });
  }

  /* ── 7. nav state ─────────────────────────────────────── */
  var navLinks = Array.prototype.slice.call(document.querySelectorAll('.nav a'));

  if ('IntersectionObserver' in window) {
    var io2 = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        var id = '#' + en.target.id;
        navLinks.forEach(function (a) { a.classList.toggle('is-current', a.getAttribute('href') === id); });
      });
    }, { rootMargin: '-45% 0px -45% 0px' });
    document.querySelectorAll('main section[id]').forEach(function (s) { io2.observe(s); });
  }

  /* ── 8. header ────────────────────────────────────────── */
  var header = document.getElementById('header');
  var lastY = 0;

  /* ── 9. cursor ────────────────────────────────────────── */
  var cur = document.querySelector('.cursor');
  var dot = document.querySelector('.cursor__dot');
  var ring = document.querySelector('.cursor__ring');
  var label = document.querySelector('.cursor__label');
  var mouse = { x: vw / 2, y: vh / 2 };
  var cd = { x: mouse.x, y: mouse.y }, cr = { x: mouse.x, y: mouse.y };

  if (fine && cur) {
    window.addEventListener('mousemove', function (e) { mouse.x = e.clientX; mouse.y = e.clientY; }, { passive: true });
    document.querySelectorAll('[data-cursor], a, button, .trow').forEach(function (el) {
      el.addEventListener('mouseenter', function () {
        var t = el.getAttribute('data-cursor');
        cur.classList.toggle('is-active', !!t);
        cur.classList.toggle('is-hover', !t);
        if (label) label.textContent = t || '';
      });
      el.addEventListener('mouseleave', function () {
        cur.classList.remove('is-active'); cur.classList.remove('is-hover');
        if (label) label.textContent = '';
      });
    });
  }

  /* ── 10. treatment hover preview ──────────────────────── */
  var prev = document.getElementById('tpreview');
  var prevImg = prev ? prev.querySelector('img') : null;
  var pv = { x: vw / 2, y: vh / 2 };
  if (prev && fine) {
    document.querySelectorAll('.trow').forEach(function (row) {
      row.addEventListener('mouseenter', function () {
        var src = row.getAttribute('data-img');
        if (src && prevImg.getAttribute('src') !== src) prevImg.src = src;
        prev.classList.add('is-on');
      });
      row.addEventListener('mouseleave', function () { prev.classList.remove('is-on'); });
    });
  }

  /* ── 11. marquees ─────────────────────────────────────── */
  var marquees = [];
  document.querySelectorAll('[data-marquee]').forEach(function (m) {
    var track = m.querySelector('.marquee__track');
    if (!track) return;
    track.innerHTML += track.innerHTML;
    marquees.push({ track: track, x: 0, w: track.scrollWidth / 2, base: m.classList.contains('marquee--big') ? 0.45 : 0.85 });
  });

  /* ── 12. menu ─────────────────────────────────────────── */
  var menu = document.getElementById('menu');
  var burger = document.getElementById('burger');
  var menuMedia = document.getElementById('menuMedia');
  var MENU_IMGS = [
    'assets/img/photos/sauna-cabin.jpg',
    'assets/img/photos/sauna-lamp.jpg',
    'assets/img/photos/pool-night.jpg',
    'assets/img/photos/rain-face.jpg',
    'assets/img/photos/back-night.jpg',
    'assets/img/photos/bath-window.jpg',
    'assets/img/photos/infrared-slats.jpg',
    'assets/img/photos/wet-glass.jpg'
  ];
  if (menuMedia) {
    MENU_IMGS.forEach(function (src, i) {
      var im = new Image();
      im.alt = ''; im.decoding = 'async'; im.loading = 'lazy';
      im.addEventListener('error', function () { im.style.display = 'none'; });
      im.src = src;
      if (i === 0) im.classList.add('is-on');
      menuMedia.appendChild(im);
    });
    document.querySelectorAll('.menu__nav a').forEach(function (a) {
      a.addEventListener('mouseenter', function () {
        var i = parseInt(a.getAttribute('data-img'), 10) || 0;
        menuMedia.querySelectorAll('img').forEach(function (im, j) { im.classList.toggle('is-on', j === i); });
      });
    });
  }

  function openMenu() {
    if (!menu) return;
    menu.classList.add('is-open'); menu.setAttribute('aria-hidden', 'false');
    burger.classList.add('is-open'); burger.setAttribute('aria-expanded', 'true'); burger.setAttribute('aria-label', 'Close menu');
    body.classList.add('menu-open');
    SM.locked = true;
  }
  function closeMenu() {
    if (!menu || !menu.classList.contains('is-open')) return;
    menu.classList.remove('is-open'); menu.setAttribute('aria-hidden', 'true');
    burger.classList.remove('is-open'); burger.setAttribute('aria-expanded', 'false'); burger.setAttribute('aria-label', 'Open menu');
    body.classList.remove('menu-open');
    SM.locked = false;
  }
  if (burger) burger.addEventListener('click', function () {
    menu.classList.contains('is-open') ? closeMenu() : openMenu();
  });
  window.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeMenu(); });

  /* ── 12b. background video ────────────────────────────────
     Name a file here and it takes over that frame, fading in over
     the photograph once the first frame has decoded. Left empty,
     the photograph simply stays. ----------------------------- */
  var VIDEOS = {
    hero: '',   // e.g. 'assets/video/hero.mp4'
    dark: ''    // e.g. 'assets/video/dark.mp4'
  };

  function mountVideo(host, src) {
    if (!host || reduce) return;
    var v = document.createElement('video');
    v.className = 'bgvideo';
    v.muted = true; v.defaultMuted = true; v.loop = true; v.autoplay = true;
    v.playsInline = true; v.preload = 'auto';
    v.setAttribute('muted', ''); v.setAttribute('playsinline', ''); v.setAttribute('aria-hidden', 'true');
    v.addEventListener('loadeddata', function () {
      host.classList.add('has-video');
      var play = v.play();
      if (play && play.catch) play.catch(function () {});
      cacheParallax();
    });
    v.addEventListener('error', function () { v.remove(); });
    v.src = src;
    host.insertBefore(v, host.firstChild);
  }

  if (VIDEOS.hero) mountVideo(document.querySelector('.hero__media'), VIDEOS.hero);

  var darkHost = VIDEOS.dark ? document.querySelector('.dark__media') : null;
  if (darkHost && 'IntersectionObserver' in window) {
    var ioV = new IntersectionObserver(function (en) {
      if (!en[0].isIntersecting) return;
      ioV.disconnect();
      mountVideo(darkHost, VIDEOS.dark);
    }, { rootMargin: '80% 0px' });
    ioV.observe(darkHost);
  }

  /* ── 12d. the room behind the glass ───────────────────────
     One still per scroll position, across the whole page.
     It never plays by itself — no autoplay, in either direction. */
  var fCanvas = document.getElementById('filmCanvas');
  var F = { count: 120, imgs: [], step: 1, ctx: null, cur: 0, shown: -1, w: 0, h: 0 };

  function fSrc(i) { return 'assets/img/steam/s-' + (i < 10 ? '00' : i < 100 ? '0' : '') + i + '.webp'; }

  function fFit() {
    if (!F.ctx) return;
    var dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    F.w = fCanvas.clientWidth; F.h = fCanvas.clientHeight;
    if (!F.w || !F.h) return;
    fCanvas.width = Math.round(F.w * dpr); fCanvas.height = Math.round(F.h * dpr);
    F.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    F.shown = -1;
    fPaint(Math.round(F.cur));
  }

  function fPaint(i) {
    if (!F.ctx || !F.w) return;
    var img = null, j;
    for (j = i; j >= 0; j--) { if (F.imgs[j] && F.imgs[j].ok) { img = F.imgs[j]; break; } }
    if (!img) { for (j = i; j < F.count; j++) { if (F.imgs[j] && F.imgs[j].ok) { img = F.imgs[j]; break; } } }
    if (!img || j === F.shown) return;
    F.shown = j;
    var s = Math.max(F.w / img.naturalWidth, F.h / img.naturalHeight);
    var dw = img.naturalWidth * s, dh = img.naturalHeight * s;
    F.ctx.drawImage(img, (F.w - dw) / 2, (F.h - dh) / 2, dw, dh);
  }

  function fLoad(only) {
    var list = only !== undefined ? [only] : [];
    if (!list.length) for (var k = 0; k < F.count; k += F.step) list.push(k);
    list.forEach(function (i) {
      if (F.imgs[i]) return;
      var im = new Image();
      im.decoding = 'async';
      im.onload = function () { im.ok = true; if (F.shown < 0 || Math.abs(i - F.cur) <= F.step) fPaint(Math.round(F.cur)); };
      im.src = fSrc(i);
      F.imgs[i] = im;
    });
  }

  if (fCanvas) {
    F.ctx = fCanvas.getContext('2d', { alpha: true });
    F.step = window.innerWidth < 760 ? 2 : 1;
    fFit();
    if (reduce) {
      F.cur = Math.round(F.count / 2);
      fLoad(F.cur);
    } else {
      fLoad(0);
      var startAll = function () { fLoad(); };
      if (window.requestIdleCallback) requestIdleCallback(startAll, { timeout: 2500 });
      else setTimeout(startAll, 1200);
    }
  }

  /* ── 12e. the surface ─────────────────────────────────────
     The room is seen through water now, not through glass, and the
     water answers the pointer.

     One height field, described in the shader and never stored: a slow
     ambient swell that never stops, plus a ring for every place the
     pointer has been, spreading outward and dying. Two passes read it.
     The lower one samples the film canvas and offsets the sample by the
     slope of the surface — refraction, so the room bends. The upper one
     draws only the light the slope throws back, over the whole page on a
     soft-light blend, so the sections are under the same water as the film.

     The film canvas stays in the document as the texture source, hidden.
     No WebGL, or reduced motion asked for, and none of this runs: the
     film shows as it always did. ---------------------------------- */
  var wCanvas = document.getElementById('waterCanvas');
  var wLight = document.getElementById('waterLight');
  var W_MAX = 14;                     /* rings alive at once */
  var W = { on: false, t0: 0, next: 0, lx: 0, ly: 0, dirty: true,
            rip: new Float32Array(W_MAX * 3), passes: [] };
  for (var wI = 0; wI < W_MAX; wI++) W.rip[wI * 3 + 2] = -99;

  var W_VERT = 'attribute vec2 p;varying vec2 v;' +
    'void main(){v=p*0.5+0.5;gl_Position=vec4(p,0.0,1.0);}';

  var W_FRAG = '#extension GL_OES_standard_derivatives : enable\n' +
    'precision highp float;' +
    'varying vec2 v;' +
    'uniform sampler2D tex;' +
    'uniform vec2 res;' +
    'uniform float t;' +
    'uniform float amb;' +           /* how much ambient swell this pass shows */
    'uniform vec3 rip[' + W_MAX + '];' +
    'void main(){' +
      'vec2 px=v*res;' +
      'float h=0.0;' +
      'h+=sin(px.x*0.0072+t*0.5)*19.0*amb;' +
      'h+=sin((px.x*0.5+px.y)*0.0059-t*0.38)*15.0*amb;' +
      'for(int i=0;i<' + W_MAX + ';i++){' +
        'float age=t-rip[i].z;' +
        'if(age<0.0||age>3.4)continue;' +
        'float d=distance(px,rip[i].xy);' +
        'float ring=d-age*300.0;' +
        'float life=exp(-age*1.05);' +
        'float band=exp(-ring*ring/6000.0);' +
        'float far=1.0/(1.0+d*0.0055);' +
        'h+=sin(ring*0.082)*life*band*far*9.0;' +
      '}' +
      'vec2 g=vec2(dFdx(h),dFdy(h));' +
      'float lit=clamp(-g.y*2.1,0.0,1.0);' +
      'float dim=clamp(g.y*1.7,0.0,1.0);' +
      '\n#ifdef LIGHT\n' +
        /* only what the surface throws back — 0.5 is soft-light\'s no-op */
        'vec3 c=vec3(0.5)+vec3(1.0,0.96,0.9)*lit*0.42-vec3(0.5)*dim*0.34;' +
        'gl_FragColor=vec4(c,clamp((lit+dim)*0.85,0.0,1.0));' +
      '\n#else\n' +
        'vec2 uv=v-g*11.0/res;' +
        'vec3 c=texture2D(tex,clamp(uv,0.002,0.998)).rgb;' +
        'c+=vec3(1.0,0.94,0.85)*lit*0.09;' +
        'c*=1.0-dim*0.11;' +
        'gl_FragColor=vec4(c,1.0);' +
      '\n#endif\n' +
    '}';

  function wShader(gl, type, src) {
    var sh = gl.createShader(type);
    gl.shaderSource(sh, src); gl.compileShader(sh);
    if (gl.getShaderParameter(sh, gl.COMPILE_STATUS)) return sh;
    if (window.__waterDebug) console.log('water shader:', gl.getShaderInfoLog(sh));
    return null;
  }

  /* one full-screen pass over the shared height field */
  function wPass(canvas, light, amb) {
    if (!canvas) return null;
    var gl = null;
    try {
      gl = canvas.getContext('webgl', { alpha: light, antialias: false, depth: false })
        || canvas.getContext('experimental-webgl');
    } catch (e) { gl = null; }
    if (!gl || !gl.getExtension('OES_standard_derivatives')) return null;

    var vs = wShader(gl, gl.VERTEX_SHADER, W_VERT);
    var fs = wShader(gl, gl.FRAGMENT_SHADER,
      light ? W_FRAG.replace('precision highp', '#define LIGHT 1\nprecision highp') : W_FRAG);
    if (!vs || !fs) { if (window.console && console.debug) console.debug('water:', gl.getShaderInfoLog(gl.createShader(gl.FRAGMENT_SHADER))); }
    if (!vs || !fs) return null;

    var prog = gl.createProgram();
    gl.attachShader(prog, vs); gl.attachShader(prog, fs); gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return null;
    gl.useProgram(prog);

    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    var a = gl.getAttribLocation(prog, 'p');
    gl.enableVertexAttribArray(a);
    gl.vertexAttribPointer(a, 2, gl.FLOAT, false, 0, 0);

    var tex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE,
      new Uint8Array([0, 0, 0, 255]));
    gl.uniform1i(gl.getUniformLocation(prog, 'tex'), 0);
    gl.uniform1f(gl.getUniformLocation(prog, 'amb'), amb);
    if (light) { gl.enable(gl.BLEND); gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA); }

    return { c: canvas, gl: gl, tex: tex, light: light, w: 0, h: 0,
             uRes: gl.getUniformLocation(prog, 'res'),
             uT: gl.getUniformLocation(prog, 't'),
             uRip: gl.getUniformLocation(prog, 'rip') };
  }

  /* two full-screen passes: a phone gets one device pixel each, not 1.5 */
  function wDpr() {
    return Math.min(window.devicePixelRatio || 1, window.innerWidth < 760 ? 1 : 1.5);
  }

  function wFit() {
    if (!W.on) return;
    var dpr = wDpr();
    W.passes.forEach(function (P) {
      P.w = Math.round(P.c.clientWidth * dpr);
      P.h = Math.round(P.c.clientHeight * dpr);
      if (!P.w || !P.h) return;
      P.c.width = P.w; P.c.height = P.h;
      P.gl.viewport(0, 0, P.w, P.h);
    });
    W.dirty = true;
  }

  /* a ring, where the pointer is. y is flipped: GL counts up the screen */
  function wTouch(x, y) {
    if (!W.on) return;
    var dpr = wDpr(), i = (W.next++) % W_MAX;
    W.rip[i * 3] = x * dpr;
    W.rip[i * 3 + 1] = (window.innerHeight - y) * dpr;
    W.rip[i * 3 + 2] = (performance.now() - W.t0) / 1000;
  }

  function wDraw() {
    if (!W.on) return;
    var t = (performance.now() - W.t0) / 1000;
    W.passes.forEach(function (P) {
      if (!P.w) return;
      var gl = P.gl;
      gl.bindTexture(gl.TEXTURE_2D, P.tex);
      if (!P.light && W.dirty && fCanvas.width && fCanvas.height) {
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, fCanvas);
      }
      gl.uniform2f(P.uRes, P.w, P.h);
      gl.uniform1f(P.uT, t);
      gl.uniform3fv(P.uRip, W.rip);
      if (P.light) gl.clear(gl.COLOR_BUFFER_BIT);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    });
    W.dirty = false;
  }

  if (!reduce && fCanvas) {
    var pRefract = wPass(wCanvas, false, 1);
    if (pRefract) {
      W.passes.push(pRefract);
      var pLight = wPass(wLight, true, 0.42);
      if (pLight) W.passes.push(pLight);
      W.on = true;
      W.t0 = performance.now();
      fCanvas.classList.add('is-source');
      if (wLight && !pLight) wLight.style.display = 'none';
      wFit();

      var wLast = 0;
      window.addEventListener('pointermove', function (e) {
        var now = performance.now();
        if (now - wLast < 70) return;
        if (Math.abs(e.clientX - W.lx) + Math.abs(e.clientY - W.ly) < 20) return;
        wLast = now; W.lx = e.clientX; W.ly = e.clientY;
        wTouch(e.clientX, e.clientY);
      }, { passive: true });
      window.addEventListener('pointerdown', function (e) {
        wTouch(e.clientX, e.clientY);
      }, { passive: true });

      /* the film texture only needs re-reading when a new frame is painted */
      var fPaintPlain = fPaint;
      fPaint = function (i) {
        var was = F.shown; fPaintPlain(i);
        if (F.shown !== was) W.dirty = true;
      };
    } else {
      if (wCanvas) wCanvas.style.display = 'none';
      if (wLight) wLight.style.display = 'none';
    }
  } else {
    if (wCanvas) wCanvas.style.display = 'none';
    if (wLight) wLight.style.display = 'none';
  }

  /* ── 12c. the road up ─────────────────────────────────────
     The clip is chopped into stills and the scroll position picks
     the frame — nothing plays on its own, in either direction. --- */
  var rCanvas = document.getElementById('routeCanvas');
  var rSec = rCanvas ? rCanvas.closest('.route') : null;
  var rKm = document.getElementById('routeKm');
  var rLegs = rSec ? Array.prototype.slice.call(rSec.querySelectorAll('.leg')) : [];
  var R = { count: 64, km: 95, imgs: [], step: 1, ctx: null, cur: 0, shown: -1, top: 0, len: 1, w: 0, h: 0 };

  function rSrc(i) { return 'assets/img/route/r-' + (i < 10 ? '00' : '0') + i + '.webp'; }

  function cacheRoute() { if (rSec) { R.top = docTop(rSec); R.len = Math.max(1, rSec.offsetHeight - vh); } }

  function rFit() {
    if (!R.ctx) return;
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    R.w = rCanvas.clientWidth; R.h = rCanvas.clientHeight;
    if (!R.w || !R.h) return;
    rCanvas.width = Math.round(R.w * dpr); rCanvas.height = Math.round(R.h * dpr);
    R.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    R.shown = -1;
    rPaint(Math.round(R.cur));
  }

  function rPaint(i) {
    if (!R.ctx || !R.w) return;
    var img = null, j;
    for (j = i; j >= 0; j--) { if (R.imgs[j] && R.imgs[j].ok) { img = R.imgs[j]; break; } }
    if (!img) { for (j = i; j < R.count; j++) { if (R.imgs[j] && R.imgs[j].ok) { img = R.imgs[j]; break; } } }
    if (!img || j === R.shown) return;
    R.shown = j;
    var s = Math.max(R.w / img.naturalWidth, R.h / img.naturalHeight);
    var dw = img.naturalWidth * s, dh = img.naturalHeight * s;
    R.ctx.drawImage(img, (R.w - dw) / 2, (R.h - dh) / 2, dw, dh);
  }

  function rLoad(only) {
    var list = only !== undefined ? [only] : [];
    if (!list.length) for (var k = 0; k < R.count; k += R.step) list.push(k);
    list.forEach(function (i) {
      if (R.imgs[i]) return;
      var im = new Image();
      im.decoding = 'async';
      im.onload = function () { im.ok = true; if (R.shown < 0 || Math.abs(i - R.cur) <= R.step) rPaint(Math.round(R.cur)); };
      im.src = rSrc(i);
      R.imgs[i] = im;
    });
  }

  if (rCanvas && rSec) {
    R.ctx = rCanvas.getContext('2d', { alpha: false });
    R.step = window.innerWidth < 760 ? 2 : 1;
    if (reduce) {
      R.cur = R.count - 1;
      rLoad(R.count - 1);
      rLegs.forEach(function (l) { l.classList.add('is-on'); });
      if (rKm) rKm.textContent = R.km;
    } else if ('IntersectionObserver' in window) {
      var ioR = new IntersectionObserver(function (en) {
        if (!en[0].isIntersecting) return;
        ioR.disconnect(); rLoad();
      }, { rootMargin: '150% 0px' });
      ioR.observe(rSec);
    } else {
      rLoad();
    }
  }

  /* ── 13. loader ───────────────────────────────────────── */
  var loader = document.getElementById('loader');
  var loaderBar = document.getElementById('loaderBar');
  var progressBar = document.getElementById('progressBar');
  var heroTitle = document.querySelector('.hero__title');

  function lightHero() {
    if (heroTitle) heroTitle.classList.add('is-lit');
    body.classList.add('is-ready');
  }

  if (loader && !reduce) {
    var pct = 0, done = false, loaded = false;
    window.addEventListener('load', function () { loaded = true; });
    var tick = setInterval(function () {
      var ceiling = loaded ? 100 : 88;
      pct = Math.min(ceiling, pct + (ceiling - pct) * 0.2 + Math.random() * 3.2);
      if (loaderBar) loaderBar.style.width = pct + '%';
      if (pct > 99.2 && !done) {
        done = true; clearInterval(tick);
        setTimeout(function () {
          loader.classList.add('is-done');
          measure();
          setTimeout(lightHero, 260);
          setTimeout(function () { loader.remove(); }, 1400);
        }, 380);
      }
    }, 60);
    setTimeout(function () { loaded = true; }, 2400);
  } else {
    if (loader) loader.remove();
    lightHero();
  }

  /* ── 14. raf loop ─────────────────────────────────────── */
  var y = window.scrollY;

  function frame() {
    if (SM.on) {
      SM.target = clamp(SM.target, 0, maxScroll);
      SM.vel = SM.target - SM.current;
      SM.current = Math.abs(SM.vel) < 0.08 ? SM.target : lerp(SM.current, SM.target, SM.ease);
      SM.last = SM.current;
      window.scrollTo(0, SM.current);
      y = SM.current;
    } else {
      var ny = window.scrollY;
      SM.vel = ny - y;
      y = ny;
    }

    /* progress */
    if (progressBar) progressBar.style.width = (maxScroll ? (y / maxScroll) * 100 : 0) + '%';

    /* header */
    if (header) {
      header.classList.toggle('is-solid', y > 40);
      if (y > lastY + 4 && y > vh * 0.6 && !menuIsOpen()) header.classList.add('is-hidden');
      else if (y < lastY - 4) header.classList.remove('is-hidden');
      lastY = y;
    }

    /* parallax */
    for (var i = 0; i < pItems.length; i++) {
      var p = pItems[i];
      var d = (y + vh / 2) - p.center;
      if (Math.abs(d) > vh * 1.6 + p.h) continue;
      p.node.style.transform = 'translate3d(0,' + (d * p.speed).toFixed(2) + 'px,0)';
    }

    /* horizontal sections */
    for (var h = 0; h < hItems.length; h++) {
      var it = hItems[h];
      if (y + vh < it.top || y > it.top + it.len + vh) continue;
      var pr = clamp((y - it.top) / (it.len || 1), 0, 1);
      it.x = lerp(it.x, -pr * it.max, 0.14);
      it.track.style.transform = 'translate3d(' + it.x.toFixed(2) + 'px,0,0)';
    }

    /* word-by-word lighting */
    for (var w = 0; w < wordBlocks.length; w++) {
      var b = wordBlocks[w];
      var pw = clamp(((y + vh * 0.86) - b.top) / (vh * 0.52), 0, 1);
      var n = b.words.length, lit = pw * (n + 6);
      for (var k = 0; k < n; k++) {
        var o = clamp(lit - k, 0, 1);
        b.words[k].style.opacity = (0.14 + 0.86 * o).toFixed(3);
      }
    }

    /* the room behind the glass — one frame per scroll position,
       and a slow drift across the page so the footage reads as footage */
    if (fCanvas && !reduce && maxScroll > 0) {
      var fp = y / maxScroll;
      F.cur = lerp(F.cur, fp * (F.count - 1), 0.12);
      fPaint(Math.round(F.cur / F.step) * F.step);
      var fTr = 'scale(' + (1.14 - fp * 0.12).toFixed(4) +
        ') translate3d(' + (fp * 1.6 - 0.8).toFixed(2) + '%,' + (1.4 - fp * 2.8).toFixed(2) + '%,0)';
      (W.on ? wCanvas : fCanvas).style.transform = fTr;
    }
    wDraw();

    /* the road up */
    if (rSec && !reduce && y + vh > R.top && y < R.top + R.len + vh) {
      /* the map melts in on approach and back out past the end: it is still
         soft and half-there as it pins, and only settles a little after */
      var fadeIn = clamp((y - (R.top - vh * 0.9)) / (vh * 1.25), 0, 1);
      var fadeOut = clamp(((R.top + R.len + vh * 0.9) - y) / (vh * 1.25), 0, 1);
      var fade = Math.min(fadeIn, fadeOut);
      rCanvas.style.opacity = fade.toFixed(3);
      rCanvas.style.setProperty('--soft', ((1 - fade) * (1 - fade) * 22).toFixed(1) + 'px');

      var rp = clamp((y - R.top) / R.len, 0, 1);
      R.cur = lerp(R.cur, rp * (R.count - 1), 0.2);
      rPaint(Math.round(R.cur / R.step) * R.step);
      if (rKm) rKm.textContent = Math.round(rp * R.km);
      for (var lg = 0; lg < rLegs.length; lg++) {
        rLegs[lg].classList.toggle('is-on', rp >= parseFloat(rLegs[lg].getAttribute('data-at')));
      }
    }

    /* marquees */
    for (var m = 0; m < marquees.length; m++) {
      var mq = marquees[m];
      mq.x -= mq.base + SM.vel * 0.28;
      if (mq.x <= -mq.w) mq.x += mq.w;
      if (mq.x > 0) mq.x -= mq.w;
      mq.track.style.transform = 'translate3d(' + mq.x.toFixed(2) + 'px,0,0)';
    }

    /* cursor + preview */
    if (fine && cur) {
      cd.x = lerp(cd.x, mouse.x, 0.32); cd.y = lerp(cd.y, mouse.y, 0.32);
      cr.x = lerp(cr.x, mouse.x, 0.15); cr.y = lerp(cr.y, mouse.y, 0.15);
      dot.style.transform = 'translate3d(' + cd.x + 'px,' + cd.y + 'px,0)';
      ring.style.transform = 'translate3d(' + cr.x + 'px,' + cr.y + 'px,0)';
    }
    if (prev && fine) {
      pv.x = lerp(pv.x, mouse.x, 0.1); pv.y = lerp(pv.y, mouse.y, 0.1);
      prev.style.left = pv.x + 'px'; prev.style.top = pv.y + 'px';
    }

    requestAnimationFrame(frame);
  }

  function menuIsOpen() { return menu && menu.classList.contains('is-open'); }

  /* ── 15. boot ─────────────────────────────────────────── */
  measure();
  requestAnimationFrame(frame);

  var rt;
  window.addEventListener('resize', function () {
    clearTimeout(rt);
    rt = setTimeout(function () {
      measure();
      SM.target = clamp(SM.target, 0, maxScroll);
    }, 160);
  });
  window.addEventListener('load', function () { setTimeout(measure, 220); });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { setTimeout(measure, 60); });
})();
