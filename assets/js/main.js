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
    cacheParallax(); cacheHScroll(); cacheWords();
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
      var img = el.querySelector(':scope > img');
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
        if (en.target.hasAttribute('data-count')) countUp(en.target);
        io.unobserve(en.target);
      });
    }, { rootMargin: '0px 0px -12% 0px', threshold: 0.08 });

    document.querySelectorAll('.reveal, .reveal-up, .cover, [data-count]').forEach(function (el, i) {
      el.style.setProperty('--i', i % 6);
      io.observe(el);
    });
  } else {
    document.querySelectorAll('.reveal, .reveal-up, .cover').forEach(function (el) { el.classList.add('is-in'); });
  }

  function countUp(el) {
    var end = parseFloat(el.getAttribute('data-count')) || 0;
    var suffix = el.getAttribute('data-suffix') || '';
    if (reduce) { el.textContent = end.toLocaleString('en-US') + suffix; return; }
    var t0 = performance.now(), dur = 1700;
    (function step(t) {
      var p = clamp((t - t0) / dur, 0, 1);
      var e = 1 - Math.pow(1 - p, 4);
      el.textContent = Math.round(end * e).toLocaleString('en-US') + suffix;
      if (p < 1) requestAnimationFrame(step);
    })(t0);
  }

  /* ── 7. section marker + nav state ────────────────────── */
  var smEl = document.getElementById('sectionmark');
  var smNum = document.getElementById('smNum');
  var smLabel = document.getElementById('smLabel');
  var navLinks = Array.prototype.slice.call(document.querySelectorAll('.nav a'));

  if ('IntersectionObserver' in window) {
    var io2 = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        var sec = en.target;
        if (smNum) smNum.textContent = sec.getAttribute('data-section');
        if (smLabel) smLabel.innerHTML = sec.getAttribute('data-label');
        var id = '#' + sec.id;
        navLinks.forEach(function (a) { a.classList.toggle('is-current', a.getAttribute('href') === id); });
      });
    }, { rootMargin: '-45% 0px -45% 0px' });
    document.querySelectorAll('[data-section]').forEach(function (s) { io2.observe(s); });
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
    'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=800&q=70',
    'https://images.unsplash.com/photo-1610970881699-44a5587cabec?auto=format&fit=crop&w=800&q=70',
    'https://images.unsplash.com/photo-1515377905703-c4788e51af15?auto=format&fit=crop&w=800&q=70',
    'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&w=800&q=70',
    'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=800&q=70',
    'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=800&q=70',
    'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=800&q=70',
    'https://images.unsplash.com/photo-1439066615861-d1af74d74000?auto=format&fit=crop&w=800&q=70'
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

  /* ── 13. loader ───────────────────────────────────────── */
  var loader = document.getElementById('loader');
  var loaderNum = document.getElementById('loaderNum');
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
      if (loaderNum) loaderNum.textContent = String(Math.floor(pct)).padStart(2, '0');
      if (loaderBar) loaderBar.style.width = pct + '%';
      if (pct > 99.2 && !done) {
        done = true; clearInterval(tick);
        if (loaderNum) loaderNum.textContent = '100';
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
    if (smEl) smEl.classList.toggle('is-on', y > vh * 0.85);

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
