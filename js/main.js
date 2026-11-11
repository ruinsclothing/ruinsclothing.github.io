/* RUINS — site logic: entrance, rail, showcase, spin ring, shop, product view, bag. */
(() => {
  const D = window.RUINS;
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const isMobile = () => window.matchMedia('(max-width: 767px)').matches;
  // the brand's motion stays on even with the phone's Reduce Motion setting; ?calm=1 calms it
  const reduce = new URLSearchParams(location.search).get('calm') === '1';
  const hasHover = window.matchMedia('(hover: hover)').matches;
  const B = px => (hasHover ? `blur(${px}px)` : 'blur(0px)');   // blur only on computers; phones stay light

  const byId = Object.fromEntries(D.products.map(p => [p.id, p]));
  const colorOf = (p, key) => p.colors.find(c => c.key === key) || p.colors[0];
  const cutSrc = n => `img/cut/${n}.webp`;
  const onSrc = n => `img/on/${n}.webp`;
  const price = n => `${Number(n).toLocaleString('en-US')} ${D.currency}`;
  const swatchBg = c => c.hex2 ? `repeating-linear-gradient(180deg, ${c.hex} 0 5px, ${c.hex2} 5px 8px)` : c.hex;
  const el = (tag, cls, html) => { const e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; };

  gsap.registerPlugin(ScrollTrigger);
  ScrollTrigger.config({ ignoreMobileResize: true });
  // always start at the top so the entrance plays over the rail
  try { history.scrollRestoration = 'manual'; } catch (e) {}
  window.scrollTo(0, 0);

  /* ---------- toast ---------- */
  const toastEl = $('.toast'); let toastT;
  const toast = msg => { toastEl.textContent = msg; toastEl.classList.add('is-on'); clearTimeout(toastT); toastT = setTimeout(() => toastEl.classList.remove('is-on'), 2800); };

  /* ---------- logo ---------- */
  const params = new URLSearchParams(location.search);
  // Logo: Overlap with reversed N and S (chosen). ?logo=decay shows the old Decay logo.
  if (params.get('logo') !== 'decay') document.body.classList.add('logo-overlap');
  const logoLS = document.body.classList.contains('logo-overlap') ? '-0.09em' : '-0.035em';
  $$('[data-logo]').forEach(node => {
    const map = { I: 'd1', N: 'd2 flip', S: 'd3' };  // only the N is reversed
    node.innerHTML = [...'RUINS'].map(ch => `<span class="l ${map[ch] || ''}">${ch}</span>`).join('');
  });

  /* ---------- smooth scroll ---------- */
  const lenis = new Lenis({ lerp: 0.1, wheelMultiplier: 1 });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add(t => lenis.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);
  lenis.stop();

  const navH = () => $('.nav').offsetHeight;
  const scrollToHash = hash => {
    const t = hash === '#top' ? 0 : $(hash);
    if (t === null) return;
    lenis.scrollTo(t, { offset: t === 0 ? 0 : -navH(), duration: 1.4 });
  };
  document.addEventListener('click', e => {
    const a = e.target.closest('a[href^="#"]');
    if (!a) return;
    const h = a.getAttribute('href');
    if (h === '#') { e.preventDefault(); return; }
    e.preventDefault();
    closeMenu();
    if (a.dataset.filterLink) setFilter(a.dataset.filterLink);
    scrollToHash(h);
  });
  $$('[data-soon]').forEach(a => a.addEventListener('click', () => toast('Coming soon')));

  /* ---------- mobile menu ---------- */
  const burger = $('.nav__burger');
  function closeMenu() { document.body.classList.remove('menu-open'); burger.setAttribute('aria-expanded', 'false'); }
  burger.addEventListener('click', () => {
    const open = !document.body.classList.contains('menu-open');
    document.body.classList.toggle('menu-open', open);
    burger.setAttribute('aria-expanded', String(open));
  });

  /* =========================================================
     1 · THE RAIL — like motion/entrance.MP4:
     pieces hang side-on along a full-width rail, one faces front.
     Hover turns a piece to face you (the old one turns back), the gap opens around it.
     Click the front piece: the rail fades away and it grows big in the middle.
  ========================================================= */
  const hero = $('.hero');
  const rail = $('[data-rail]');
  const railItems = $('[data-rail-items]');
  const railName = $('[data-rail-name]');
  const zoomBox = $('[data-zoom]');
  const hookSVG = '<svg class="ri__hook" viewBox="0 0 30 50" aria-hidden="true"><path d="M15 40 V22 C15 17 22 15 22 9 A7 7 0 0 0 8 9"/><rect class="ri__wood" x="8.5" y="37" width="13" height="11" rx="3.5"/></svg>';
  const NEW_TAGS = [1, 8];     // pieces that carry a white "NEW" hang-tag

  D.rail.forEach(([pid, ck], i) => {
    const p = byId[pid], c = colorOf(p, ck);
    const item = el('div', 'ri');
    item.dataset.pid = pid; item.dataset.ck = ck; item.dataset.i = i;
    item.setAttribute('role', 'button'); item.tabIndex = 0;
    item.setAttribute('aria-label', `${p.name}, ${c.label}`);
    item.innerHTML = `<div class="ri__body">${hookSVG}<span class="ri__tag"></span><div class="ri__turn"><div class="ri__g" data-src="${cutSrc(c.cut)}"></div></div></div>`;
    railItems.appendChild(item);
  });
  const ris = $$('.ri', railItems);
  const bodies = ris.map(r => $('.ri__body', r));
  const imgs = ris.map(r => $('.ri__g', r));   // the garments

  /* ---- real side views ----
     A piece hanging side-on shows its sleeve and the side of the body at real size
     (not a squeezed strip). That is the left part of the photo: sleeve + side panel.
     Hover opens it to the full front. Shading darkens the side going away from you. */
  const natural = {};
  const railReady = Promise.all(imgs.map(g => new Promise(res => {
    const im = new Image();
    im.onload = () => { natural[g.dataset.src] = im.naturalWidth / im.naturalHeight; res(); };
    im.onerror = res;
    im.src = g.dataset.src;
  })));
  /* A piece hanging side-on = its body seen edge-on (narrow, with its real shoulder and hem shape)
     plus the sleeve hanging in front of it. Both come from the product photo, so the silhouette
     has natural edges all round instead of a cut line. Hover turns it to the front. */
  const BODY = 0.3, SLEEVE = 0.27;     // body seen edge-on (share of the width) · sleeve crop
  function buildGarment(g) {
    const ar = natural[g.dataset.src] || 0.85, h = dims.gh, w = h * ar, src = g.dataset.src;
    const m = `-webkit-mask-image:url('${src}');mask-image:url('${src}')`;
    g.innerHTML =
      `<div class="ri__full" style="width:${w}px;left:${-w / 2}px"><img src="${src}" alt="" draggable="false"></div>` +
      `<div class="ri__side">` +
        `<div class="ri__edge" style="width:${w * BODY}px;left:${-w * BODY * 0.38}px"><img src="${src}" alt="" draggable="false"><i class="ri__shade ri__shade--body" style="${m}"></i></div>` +
        `<div class="ri__sleeve" style="width:${w * SLEEVE}px;left:${-w * SLEEVE * 0.78}px"><div style="width:${w}px;height:100%;position:relative"><img src="${src}" alt="" draggable="false"><i class="ri__shade ri__shade--sleeve" style="${m}"></i></div></div>` +
      `</div>`;
    g._w = w;
  }
  // front: the full photo · side: edge-on body + sleeve. The swap is a quick turn (squeeze + blur)
  function pose(k, front, d) {
    const g = imgs[k], full = $('.ri__full', g), side = $('.ri__side', g);
    if (!full) return;
    const e = { duration: d, ease: 'power3.inOut', overwrite: 'auto' };
    gsap.to(full, { autoAlpha: front ? 1 : 0, scaleX: front ? 1 : 0.32, ...e });
    gsap.to(side, { autoAlpha: front ? 0 : 1, scaleX: front ? 2.6 : 1, ...e });
    if (d && hasHover) gsap.fromTo([full, side], { filter: 'blur(0px)' }, { filter: 'blur(2px)', duration: d / 2, yoyo: true, repeat: 1, ease: 'sine.inOut' });
  }
  const faceOf = k => $('.ri__full', imgs[k]) || imgs[k];
  const buildAll = () => { imgs.forEach(buildGarment); imgs.forEach((g, k) => pose(k, k === active, 0)); };
  let active = Math.min(4, ris.length - 1);
  let zoomed = false;

  // sizes: the front piece gets a wide slot, the side-on pieces share the rest of the width
  let dims = {};
  function measure() {
    const W = window.innerWidth, H = window.innerHeight;
    const gh = isMobile() ? Math.min(330, H * 0.42) : Math.min(H * 0.5, W * 0.34, 480);
    const w = gh * 0.82;                                             // a typical garment's width
    const sideVis = w * (SLEEVE * 0.78 + BODY * 0.62);                 // how wide a side-on piece looks
    const gap = isMobile() ? 8 : Math.min(20, Math.max(10, W * 0.01));   // pieces sit close together
    dims = { gh, gap, front: w * 0.94 + gap, side: sideVis * 0.92 + gap };
    rail.style.setProperty('--gh', dims.gh + 'px');
    rail.style.height = (dims.gh + 64) + 'px';
  }

  function setCaption(i) {
    const p = byId[ris[i].dataset.pid];
    if (railName.textContent === p.name) return;
    gsap.to(railName, { autoAlpha: 0, y: -4, duration: 0.15, ease: 'power1.in', onComplete: () => {
      railName.textContent = p.name;
      gsap.to(railName, { autoAlpha: 1, y: 0, duration: 0.3, ease: 'power2.out' });
    } });
  }

  function setTags() {
    ris.forEach((r, i) => {
      const tag = $('.ri__tag', r);
      if (i === active) { tag.textContent = `R—${byId[r.dataset.pid].no}`; tag.className = 'ri__tag is-dark'; }
      else if (NEW_TAGS.includes(i)) { tag.textContent = 'NEW'; tag.className = 'ri__tag is-light'; }
      else { tag.textContent = ''; tag.className = 'ri__tag'; }
    });
  }

  let idle;
  function stopIdle() { if (idle) { idle.kill(); idle = null; } gsap.to('.ri__turn', { rotation: 0, duration: 0.5, overwrite: 'auto' }); }
  function startIdle() {
    stopIdle();
    if (reduce || zoomed) return;
    const t = $('.ri__turn', ris[active]);
    idle = gsap.timeline({ repeat: -1, yoyo: true, defaults: { ease: 'sine.inOut' } })
      .to(t, { rotation: 1.4, duration: 1.8, transformOrigin: '0px 0px' })
      .to(t, { rotation: -1.4, duration: 3.6 })
      .to(t, { rotation: 0, duration: 1.8 });
  }

  function setActive(i, animate = true) {
    if (zoomed) return;
    stopIdle();
    const prev = active;
    active = i;
    const d = animate && !reduce ? 0.55 : 0;
    ris.forEach((r, k) => {
      const front = k === i;
      gsap.to(r, { width: front ? dims.front : dims.side, duration: d, ease: 'power3.inOut', overwrite: 'auto' });
      pose(k, front, d);
      r.classList.toggle('is-front', front);
    });
    // the turning pieces ghost slightly mid-turn, like the reference

    setTags();
    setCaption(i);
    if (isMobile() && animate) centerOn(i);
    gsap.delayedCall(d + 0.05, () => { if (active === i) startIdle(); });
  }

  let panX = 0, progScroll = 0;
  const railTotal = () => dims.front + dims.side * (ris.length - 1);
  function clampPan(x) {
    const W = rail.clientWidth, T = railTotal();
    if (T <= W) return (W - T) / 2;
    return Math.max(W - T - dims.gap, Math.min(dims.gap, x));
  }
  function panTo(x, instant) {
    panX = clampPan(x);
    gsap.to(railItems, { x: panX, duration: instant ? 0 : 0.9, ease: 'power3.out', overwrite: 'auto' });
  }
  if (!isMobile()) {
    // drag the rail sideways
    let drag = null;
    railItems.addEventListener('pointerdown', e => { if (e.pointerType === 'mouse' && !zoomed) drag = { x: e.clientX, start: panX, moved: false }; });
    window.addEventListener('pointermove', e => {
      if (!drag) return;
      const dx = e.clientX - drag.x;
      if (Math.abs(dx) > 4) { drag.moved = true; rail.classList.add('is-dragging'); }
      if (drag.moved) { panX = clampPan(drag.start + dx); gsap.set(railItems, { x: panX }); }
    });
    window.addEventListener('pointerup', () => {
      if (drag && drag.moved) { railItems.addEventListener('click', e => e.stopPropagation(), { capture: true, once: true }); }
      drag = null; rail.classList.remove('is-dragging');
    });
    // trackpad: sideways swipe pans the rail
    rail.addEventListener('wheel', e => {
      if (zoomed || Math.abs(e.deltaX) <= Math.abs(e.deltaY)) return;
      e.preventDefault(); panTo(panX - e.deltaX * 1.2, false);
    }, { passive: false });
  }

  function centerOn(i, instant) {
    if (!isMobile()) {
      let x = 0;
      for (let k = 0; k < i; k++) x += dims.side;
      panTo(rail.clientWidth / 2 - (x + dims.front / 2), instant);
      return;
    }
    // phones: the rail scrolls sideways; bring the front piece to the middle
    progScroll = Date.now();
    if (railItems.scrollWidth <= railItems.clientWidth) return;
    let x = 0;
    for (let k = 0; k < i; k++) x += dims.side;
    const target = x + dims.front / 2 - railItems.clientWidth / 2 + parseFloat(getComputedStyle(railItems).paddingLeft);
    railItems.scrollTo({ left: target, behavior: reduce || instant ? 'auto' : 'smooth' });
  }

  /* zoom: rail fades away, the front piece grows big in the middle */
  function zoomIn() {
    if (zoomed) return;
    zoomed = true;
    stopIdle();
    hero.classList.add('is-zoomed');
    const i = active, p = byId[ris[i].dataset.pid], c = colorOf(p, ris[i].dataset.ck);
    const others = bodies.filter((_, k) => k !== i);
    gsap.to(others, { autoAlpha: 0, filter: B(8), duration: 0.5, ease: 'power2.out', stagger: { each: 0.02, from: i } });
    gsap.to('.rail__bar, .hero__labels, .hero__caption', { autoAlpha: 0, duration: 0.4, ease: 'power2.out' });
    const b = ris[i].getBoundingClientRect(), h = hero.getBoundingClientRect();
    const zb = zoomBox.getBoundingClientRect();
    const room = (zb.top - 18) - b.top;                       // space between the hook and the caption
    const s = Math.max(1, Math.min(2.1, room / (dims.gh + 40)));
    const dx = (h.left + h.width / 2) - (b.left + b.width / 2);
    const dy = (h.top + 14) - b.top;
    gsap.to(bodies[i], { x: dx, y: Math.min(0, dy), scale: s, transformOrigin: '50% 0%', duration: 0.9, ease: 'expo.inOut' });
    $('[data-zoom-count]').textContent = `${String(i + 1).padStart(2, '0')} / ${String(ris.length).padStart(2, '0')}`;
    $('[data-zoom-name]').textContent = p.name;
    $('[data-zoom-meta]').textContent = `${c.label} · ${price(p.price)}`;
    gsap.fromTo(zoomBox, { autoAlpha: 0, y: 14 }, { autoAlpha: 1, y: 0, duration: 0.6, delay: 0.45, ease: 'power3.out' });
  }
  function zoomOut() {
    if (!zoomed) return;
    const i = active;
    gsap.to(zoomBox, { autoAlpha: 0, y: 8, duration: 0.25 });
    gsap.to(bodies[i], { x: 0, y: 0, scale: 1, duration: 0.85, ease: 'expo.inOut', onComplete: () => { zoomed = false; hero.classList.remove('is-zoomed'); startIdle(); } });
    gsap.to(bodies.filter((_, k) => k !== i), { autoAlpha: 1, filter: B(0), duration: 0.6, delay: 0.25, ease: 'power2.out', stagger: { each: 0.025, from: i } });
    gsap.to('.rail__bar, .hero__labels, .hero__caption', { autoAlpha: 1, duration: 0.5, delay: 0.3 });
    // after closing, the caption shows the piece's description (like the reference)
    gsap.delayedCall(0.4, () => { railName.textContent = byId[ris[i].dataset.pid].blurb; });
  }

  ris.forEach((item, i) => {
    item.addEventListener('mouseenter', () => { if (hasHover && i !== active) setActive(i); });
    item.addEventListener('focus', () => { if (i !== active) setActive(i); });
    item.addEventListener('click', () => {
      if (zoomed) return zoomOut();
      if (i !== active) return setActive(i);   // touch: first tap turns it, second tap opens it
      if (isMobile()) return openPV(item.dataset.pid, item.dataset.ck, 'cut', faceOf(i));
      zoomIn();
    });
    item.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); zoomed ? zoomOut() : zoomIn(); } });
  });
  if (!hasHover) {
    // the piece that lands in the middle of the screen turns to face you
    let settle, lastTouch = 0;
    const nearest = () => {
      const mid = railItems.getBoundingClientRect().left + railItems.clientWidth / 2;
      let best = active, bd = 1e9;
      ris.forEach((r, k) => { const b = r.getBoundingClientRect(); const d = Math.abs(b.left + b.width / 2 - mid); if (d < bd) { bd = d; best = k; } });
      return best;
    };
    railItems.addEventListener('scroll', () => {
      clearTimeout(settle);
      if (Date.now() - progScroll < 1100) return;   // the rail re-centring itself, not a swipe
      settle = setTimeout(() => { const k = nearest(); if (k !== active) setActive(k); }, 140);
    }, { passive: true });
    railItems.addEventListener('touchstart', () => { lastTouch = Date.now(); }, { passive: true });
    // plays by itself: the next piece turns every few seconds until you touch the rail
    setInterval(() => {
      if (zoomed || Date.now() - lastTouch < 4000 || document.hidden) return;
      const r = hero.getBoundingClientRect();
      if (r.bottom < 0 || r.top > innerHeight) return;
      setActive((active + 1) % ris.length);
    }, 1900);
  }

  $('[data-zoom-open]').addEventListener('click', e => {
    e.stopPropagation();
    const r = ris[active];
    openPV(r.dataset.pid, r.dataset.ck, 'cut', faceOf(active));
  });
  $('[data-zoom-close]').addEventListener('click', zoomOut);

  measure();
  setActive(active, false);
  railReady.then(() => { buildAll(); centerOn(active, true); });

  /* =========================================================
     2 · SHOWCASE — giant word behind the piece, scrubbed by scroll
  ========================================================= */
  const words = $('[data-show-words]'), stage = $('[data-show-stage]'), info = $('[data-show-info]');
  const S = D.showcase;
  $('[data-show-total]').textContent = String(S.length).padStart(2, '0');
  S.forEach(s => {
    const p = byId[s.id], c = colorOf(p, s.color);
    words.appendChild(el('div', 'sw', s.word));
    const im = el('img', 'ss'); im.src = cutSrc(c.cut); im.alt = `${p.name} in ${c.label}`; im.loading = 'lazy'; stage.appendChild(im);
    const si = el('div', 'si', `<div class="mono">R—${p.no} · ${c.label}</div><div class="si__name">${p.name}</div><div class="mono">${price(p.price)}</div><p class="si__blurb">${p.blurb}</p><button class="btn btn--line" data-open="${p.id}" data-ck="${c.key}">View piece →</button>`);
    info.appendChild(si);
  });
  info.addEventListener('click', e => {
    const b = e.target.closest('[data-open]');
    if (!b) return;
    const i = $$('.si', info).indexOf(b.closest('.si'));
    openPV(b.dataset.open, b.dataset.ck, 'cut', $$('.ss', stage)[i]);
  });

  // each giant word fills ~90% of the screen width, never more
  function fitWords() {
    $$('.sw', words).forEach(w => {
      const base = window.innerWidth * (isMobile() ? 0.27 : 0.25);
      w.style.fontSize = base + 'px';
      const width = w.scrollWidth;
      w.style.fontSize = (base * Math.min(1, (window.innerWidth * 0.9) / width)) + 'px';
    });
  }
  function buildShowcase() {
    fitWords();
    const W = $$('.sw', words), I = $$('.ss', stage), T = $$('.si', info);
    gsap.set(W, { xPercent: -50, yPercent: -50 });
    gsap.set(I, { xPercent: -50, yPercent: -50 });
    gsap.set([W.slice(1), I.slice(1), T.slice(1)], { autoAlpha: 0 });
    const tl = gsap.timeline({ defaults: { ease: 'none' } });
    for (let i = 1; i < S.length; i++) {
      const at = i - 1;
      tl.to(W[i - 1], { x: '-35vw', filter: B(18), autoAlpha: 0, duration: 0.5 }, at + 0.2)
        .fromTo(W[i], { x: '35vw', filter: B(18), autoAlpha: 0 }, { x: 0, filter: B(0), autoAlpha: 1, duration: 0.5 }, at + 0.45)
        .to(I[i - 1], { y: '-12vh', scale: 0.9, filter: B(14), autoAlpha: 0, duration: 0.45 }, at + 0.2)
        .fromTo(I[i], { y: '14vh', scale: 1.08, filter: B(14), autoAlpha: 0 }, { y: 0, scale: 1, filter: B(0), autoAlpha: 1, duration: 0.5 }, at + 0.45)
        .to(T[i - 1], { y: -20, autoAlpha: 0, duration: 0.25 }, at + 0.25)
        .fromTo(T[i], { y: 24, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.3 }, at + 0.6);
    }
    tl.to({}, { duration: 0.2 });
    const idx = $('[data-show-index]');
    ScrollTrigger.create({
      trigger: '.show', pin: '.show__pin', start: 'top top', end: () => `+=${(S.length - 0.4) * window.innerHeight}`,
      scrub: 0.6, animation: tl, anticipatePin: 1,
      onUpdate: self => {
        idx.textContent = String(Math.min(S.length, Math.round(self.progress * (S.length - 1)) + 1)).padStart(2, '0');
        gsap.set('[data-show-bar]', { scaleX: self.progress });
      }
    });
  }

  /* =========================================================
     3 · SPIN — 3D ring of dot-matrix letters around the piece
  ========================================================= */
  const ring = $('[data-ring]'), spinPiece = $('[data-spin-piece]');
  let ringTween;
  function buildRing() {
    ring.innerHTML = '';
    const w = window.innerWidth;
    const fs = isMobile() ? 30 : Math.min(64, Math.max(30, w * 0.046));
    const R = isMobile() ? w * 0.40 : Math.min(w * 0.36, 400);
    const n = Math.floor((2 * Math.PI * R) / (fs * 0.68));
    const rows = [['RUINS//ARCHIVE 01//', -0.62], ['BUILT TO LAST//MADE IN CAIRO//', 0.62]];
    rows.forEach(([txt, off], ri) => {
      const row = el('div', 'spin__row');
      row.style.transform = `translateY(${off * fs}px) rotateY(${ri * 9}deg)`;
      let s = ''; while (s.length < n) s += txt; s = s.slice(0, n);
      [...s].forEach((ch, i) => {
        const sp = el('span'); sp.textContent = ch === ' ' ? ' ' : ch;
        sp.style.transform = `rotateY(${(i * 360) / n}deg) translateZ(${R}px)`;
        row.appendChild(sp);
      });
      ring.appendChild(row);
    });
    if (ringTween) ringTween.kill();
    ringTween = gsap.to(ring, { rotationY: -360, duration: reduce ? 120 : 24, ease: 'none', repeat: -1 });
  }
  // pieces that rotate through the middle of the ring
  const spinList = [['zip-hoodie', 'grey'], ['striped-off-shoulder', 'brown'], ['knit-zip-jacket', 'charcoal'], ['knit-polo', 'ivory'], ['knit-crewneck', 'chocolate'], ['zip-hoodie', 'black']];
  spinList.forEach(([pid, ck], i) => {
    const p = byId[pid], c = colorOf(p, ck);
    const im = el('img'); im.src = cutSrc(c.cut); im.alt = `${p.name} in ${c.label}`; im.loading = 'lazy';
    if (i) gsap.set(im, { autoAlpha: 0 });
    spinPiece.appendChild(im);
  });
  function spinCycle() {
    const imgs = $$('img', spinPiece); let k = 0;
    if (reduce) return;
    setInterval(() => {
      const a = imgs[k], b = imgs[(k + 1) % imgs.length]; k = (k + 1) % imgs.length;
      gsap.to(a, { autoAlpha: 0, filter: B(12), scale: 0.94, duration: 0.6, ease: 'power2.in' });
      gsap.fromTo(b, { autoAlpha: 0, filter: B(12), scale: 1.06 }, { autoAlpha: 1, filter: B(0), scale: 1, duration: 0.8, delay: 0.35, ease: 'power3.out' });
    }, 2600);
  }

  /* =========================================================
     4 · SHOP GRID
  ========================================================= */
  const grid = $('[data-grid]');
  D.products.forEach(p => {
    const withCut = p.colors.find(c => c.cut);
    const main = withCut || p.colors[0];
    const onC = (main.on && main) || p.colors.find(c => c.on);
    const card = el('article', 'card');
    card.dataset.pid = p.id; card.dataset.type = p.type;
    card.innerHTML = `
      <div class="card__media ${withCut ? '' : 'only-on'}">
        <span class="card__no mono">R—${p.no}</span>
        ${withCut ? `<img class="card__cut" src="${cutSrc(main.cut)}" alt="${p.name} in ${main.label}" loading="lazy">` : ''}
        ${onC ? `<img class="card__on" src="${onSrc(onC.on)}" alt="${p.name} worn, ${onC.label}" loading="lazy">` : ''}
        <button class="card__add mono">Quick add +</button>
      </div>
      <div class="card__row"><span class="card__name">${p.name}</span><span class="mono">${price(p.price)}</span></div>
      <div class="card__sub"><span class="mono">${p.colors.length} colour${p.colors.length > 1 ? 's' : ''}</span><span class="dots">${p.colors.map(c => `<i style="background:${swatchBg(c)}" title="${c.label}"></i>`).join('')}</span></div>`;
    card.addEventListener('click', () => {
      const img = $('.card__cut', card) || $('.card__on', card);
      openPV(p.id, main.key, withCut ? 'cut' : 'on', img);
    });
    grid.appendChild(card);
  });
  const note = el('a', 'card card--note', `<div class="card__media"><span class="mono">Next</span><b>Archive 02</b><span class="mono">More pieces soon · follow @ruins.co_</span></div>`);
  note.href = 'https://www.instagram.com/ruins.co_/'; note.target = '_blank'; note.rel = 'noopener'; note.dataset.type = 'all';
  grid.appendChild(note);

  const filterBtns = $$('[data-filter]');
  function setFilter(f) {
    filterBtns.forEach(b => b.classList.toggle('is-on', b.dataset.filter === f));
    const shown = [];
    $$('.card', grid).forEach(c => { const on = f === 'all' || c.dataset.type === f;
      if (c.classList.contains('card--note')) { c.classList.toggle('is-hidden', f !== 'all'); if (f === 'all') shown.push(c); return; } c.classList.toggle('is-hidden', !on); if (on) shown.push(c); });
    gsap.fromTo(shown, { y: 30, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.7, stagger: 0.06, ease: 'power3.out' });
    ScrollTrigger.refresh();
  }
  filterBtns.forEach(b => b.addEventListener('click', () => setFilter(b.dataset.filter)));

  /* =========================================================
     5 · ABOUT — photo cards drift over the giant type
  ========================================================= */
  const aboutCards = $('[data-about-cards]');
  // products (not model photos) drifting over the giant type
  const aboutList = [['knit-zip-jacket', 'brown'], ['zip-hoodie', 'grey'], ['striped-off-shoulder', 'brown'], ['knit-polo', 'ivory'], ['knit-crewneck', 'black']];
  const rots = [-9, 8, -5, 10, -7];
  aboutList.forEach(([pid, ck], i) => {
    const p = byId[pid], c = colorOf(p, ck);
    const card = el('figure', 'ac', `<img src="${cutSrc(c.cut)}" alt="${p.name} in ${c.label}" loading="lazy"><figcaption class="ac__cap">${p.name}</figcaption>`);
    card.style.cursor = 'pointer';
    card.addEventListener('click', () => openPV(pid, ck, 'cut', $('img', card)));
    if (i % 2 === 0) card.insertAdjacentHTML('beforeend', '<svg class="ac__x" viewBox="0 0 100 100" aria-hidden="true"><path d="M14 18 C40 40 62 62 88 86"/><path d="M84 12 C62 40 38 64 12 90"/></svg>');
    gsap.set(card, { rotation: rots[i] });
    aboutCards.appendChild(card);
  });

  function buildScrollFX() {
    // Glass panel (RERISE): lines slide in, the glass comes into focus, 
    const gwT = { trigger: '.gw', start: 'top 70%' };
    gsap.from('.gw__lines div', { xPercent: -6, autoAlpha: 0, duration: 1, stagger: 0.07, ease: 'power3.out', scrollTrigger: gwT });
    if (hasHover) gsap.fromTo('#frostMap', { attr: { scale: 140 } }, { attr: { scale: 26 }, duration: 2, ease: 'power3.out', scrollTrigger: gwT });
    gsap.from('.gw__fig', { yPercent: 6, autoAlpha: 0, duration: 1.4, ease: 'expo.out', scrollTrigger: gwT });
    gsap.from('.gw__win', { scale: 0, autoAlpha: 0, duration: 0.9, delay: 0.9, ease: 'expo.out', scrollTrigger: gwT });
    gsap.from('.gw__label, .gw__num, .gw__vert, .gw__details, .gw__barcode', { autoAlpha: 0, y: 14, duration: 0.8, stagger: 0.06, delay: 0.6, ease: 'power3.out', scrollTrigger: gwT });
    gsap.to('.gw__lines', { yPercent: -8, ease: 'none', scrollTrigger: { trigger: '.gw', start: 'top bottom', end: 'bottom top', scrub: 1 } });

    // Campaign: labels type in from the sides, the film rises
    const cpT = { trigger: '.cp', start: 'top 70%' };
    gsap.from('.cp__film', { yPercent: 6, autoAlpha: 0, duration: 1.3, ease: 'expo.out', scrollTrigger: cpT });
    gsap.from('.cp__t', { autoAlpha: 0, x: (i, el) => (el.className.match(/--[bdfh]/) ? 24 : -24), duration: 0.9, stagger: 0.07, delay: 0.3, ease: 'power3.out', scrollTrigger: cpT });

    // about cards: rotate and drift as they pass
    $$('.ac').forEach((card, i) => {
      gsap.fromTo(card, { rotation: rots[i], y: 80 }, {
        rotation: -rots[i] * 0.6, y: -80, ease: 'none',
        scrollTrigger: { trigger: card, start: 'top bottom', end: 'bottom top', scrub: 0.8 }
      });
    });
    // the hand-drawn line
    const path = $('.about__line path');
    const len = path.getTotalLength();
    gsap.set(path, { strokeDasharray: len, strokeDashoffset: len });
    gsap.to(path, { strokeDashoffset: 0, ease: 'none', scrollTrigger: { trigger: '.about', start: 'top 70%', end: 'bottom bottom', scrub: 1 } });
    // giant type lines slide against each other
    $$('.about__type div').forEach((d, i) => {
      gsap.fromTo(d, { xPercent: i % 2 ? -8 : 8 }, { xPercent: i % 2 ? 8 : -8, ease: 'none', scrollTrigger: { trigger: '.about', start: 'top bottom', end: 'bottom top', scrub: 1 } });
    });
    gsap.from('.about__copy', { y: 80, rotation: 4, autoAlpha: 0, duration: 1.1, ease: 'power3.out', scrollTrigger: { trigger: '.about__copy', start: 'top 85%' } });
    // shop cards reveal
    ScrollTrigger.batch('.card', { start: 'top 90%', once: true, onEnter: b => gsap.from(b, { y: 50, autoAlpha: 0, duration: 0.9, stagger: 0.08, ease: 'power3.out' }) });
    gsap.from('.shop__title', { yPercent: 40, autoAlpha: 0, filter: B(14), duration: 1.1, ease: 'power3.out', scrollTrigger: { trigger: '.shop', start: 'top 80%' } });
    // footer logo rises letter by letter
    gsap.from('.foot__logo .l', { yPercent: 80, autoAlpha: 0, duration: 1, stagger: 0.07, ease: 'power3.out', scrollTrigger: { trigger: '.foot__logo', start: 'top 95%' } });
    // spin speeds up with scroll velocity
    ScrollTrigger.create({ trigger: '.spin', start: 'top bottom', end: 'bottom top', onUpdate: self => {
      if (!ringTween) return;
      const v = Math.min(4, 1 + Math.abs(self.getVelocity()) / 600);
      gsap.to(ringTween, { timeScale: v, duration: 0.3, overwrite: true, onComplete: () => gsap.to(ringTween, { timeScale: 1, duration: 1.2 }) });
    } });
  }

  /* ---------- glass panel: clear window over the frosted model ---------- */
  const gw = $('[data-gw]'), gwFig = $('[data-gw-fig]'), gwWin = $('[data-gw-win]'), gwClear = $('.gw__clear');
  const FACE = { x: 0.49, y: 0.105 };              // where the face is in the photo (square rests here)
  const q = { duration: hasHover ? 0.28 : 0.9, ease: hasHover ? 'power3.out' : 'power2.inOut' };
  const winX = gsap.quickTo(gwWin, 'x', q), winY = gsap.quickTo(gwWin, 'y', q);
  const clrX = gsap.quickTo(gwClear, 'x', q), clrY = gsap.quickTo(gwClear, 'y', q);
  function placeWin(fx, fy, clamp) {
    const fw = gwFig.offsetWidth, fh = gwFig.offsetHeight, ww = gwWin.offsetWidth, wh = gwWin.offsetHeight;
    let x = fx * fw - ww / 2, y = fy * fh - wh / 2;
    if (clamp) { x = Math.max(0, Math.min(fw - ww, x)); y = Math.max(0, Math.min(fh - wh, y)); }
    winX(x); winY(y); clrX(-x); clrY(-y);
  }
  function sizeClear() { gwClear.style.width = gwFig.offsetWidth + 'px'; gwClear.style.height = gwFig.offsetHeight + 'px'; }
  if (gw) {
    sizeClear(); placeWin(FACE.x, FACE.y, true);
    window.addEventListener('resize', () => { sizeClear(); placeWin(FACE.x, FACE.y, true); });
    if (hasHover) {
      // over the model the pointer becomes the square: it looks through the frosted glass
      gw.addEventListener('mousemove', e => {
        const r = gwFig.getBoundingClientRect();
        const inside = e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom;
        gw.classList.toggle('is-peek', inside);
        if (inside) placeWin((e.clientX - r.left) / r.width, (e.clientY - r.top) / r.height, false);
        else placeWin(FACE.x, FACE.y, true);
      });
      gw.addEventListener('mouseleave', () => { gw.classList.remove('is-peek'); placeWin(FACE.x, FACE.y, true); });
    }
    if (!hasHover) {
      let held = false, drift;
      const path = [[0.49, 0.105], [0.7, 0.32], [0.3, 0.5], [0.68, 0.7], [0.32, 0.22], [0.55, 0.45]];
      let step = 0;
      const wander = () => { if (!held) { step = (step + 1) % path.length; placeWin(path[step][0], path[step][1], true); } };
      new IntersectionObserver(es => es.forEach(e => {
        clearInterval(drift);
        if (e.isIntersecting) { wander(); drift = setInterval(wander, 1200); }
      }), { threshold: 0.3 }).observe(gw);
      const follow = t => { const r = gwFig.getBoundingClientRect(); placeWin((t.clientX - r.left) / r.width, (t.clientY - r.top) / r.height, true); };
      gw.addEventListener('touchstart', e => { held = true; follow(e.touches[0]); }, { passive: true });
      gw.addEventListener('touchmove', e => follow(e.touches[0]), { passive: true });
      gw.addEventListener('touchend', () => { setTimeout(() => { held = false; }, 1500); }, { passive: true });
      // slower, softer glide on touch
      gsap.set(gwWin, { transition: 'none' });
    }
    $('[data-gw-open]').addEventListener('click', e => { e.preventDefault(); e.stopPropagation(); openPV('knit-crewneck', 'black', 'on', gwFig); });
  }
  // campaign film: only plays while on screen
  const cpVideo = $('.cp__video');
  if (cpVideo) {
    new IntersectionObserver(es => es.forEach(e => {
      if (e.isIntersecting) { const p = cpVideo.play(); if (p) p.catch(() => {}); } else cpVideo.pause();
    }), { threshold: 0.25 }).observe(cpVideo);
    $('[data-cp-open]').addEventListener('click', e => { e.preventDefault(); e.stopPropagation(); openPV('knit-zip-jacket', 'charcoal', 'on', cpVideo); });
  }
  if (document.documentElement.hasAttribute('data-theme')) document.body.classList.add('show-themes');

  /* =========================================================
     PRODUCT VIEW
  ========================================================= */
  const pv = $('.pv'), pvImg = $('.pv__img', pv), veil = $('.pv__veil', pv);
  const pvState = { pid: null, ck: null, view: 'cut', size: null, open: false };
  const order = D.products.map(p => p.id);

  function pvRender(animateImg) {
    const p = byId[pvState.pid], c = colorOf(p, pvState.ck);
    if (pvState.view === 'cut' && !c.cut) pvState.view = 'on';
    if (pvState.view === 'on' && !c.on) pvState.view = 'cut';
    $('.pv__no', pv).textContent = `R—${p.no} / ${String(D.products.length).padStart(2, '0')} · ${p.type}`;
    $('.pv__name', pv).textContent = p.name;
    $('.pv__price', pv).textContent = price(p.price);
    $('.pv__blurb', pv).textContent = p.blurb;
    $('.pv__details', pv).innerHTML = p.details.map(d => `<li>${d}</li>`).join('');
    $('[data-pv-color]', pv).textContent = c.label;
    const sw = $('[data-pv-swatches]', pv);
    sw.innerHTML = p.colors.map(x => `<button style="background:${swatchBg(x)}" class="${x.key === c.key ? 'is-on' : ''}" data-ck="${x.key}" aria-label="${x.label}" title="${x.label}"></button>`).join('');
    $('[data-pv-sizes]', pv).innerHTML = D.sizes.map(s => `<button class="${s === pvState.size ? 'is-on' : ''}" data-size="${s}">${s}</button>`).join('');
    $$('[data-view]', pv).forEach(b => {
      b.classList.toggle('is-on', b.dataset.view === pvState.view);
      b.disabled = b.dataset.view === 'cut' ? !c.cut : !c.on;
    });
    const add = $('[data-pv-add]', pv);
    add.classList.toggle('is-wait', !pvState.size);
    add.textContent = pvState.size ? `Add to bag — ${price(p.price)}` : 'Select a size';
    if (pvState.open) { try { history.replaceState(null, '', `#piece/${p.id}/${c.key}`); } catch (e) {} }
    const src = pvState.view === 'cut' ? cutSrc(c.cut) : onSrc(c.on);
    if (pvImg.getAttribute('src') !== src) {
      pvImg.src = src;
      pvImg.alt = `${p.name} in ${c.label}`;
      pvImg.classList.toggle('is-photo', pvState.view === 'on');
      if (animateImg) gsap.fromTo(pvImg, { autoAlpha: 0, filter: B(14), scale: 1.04 }, { autoAlpha: 1, filter: B(0), scale: 1, duration: 0.6, ease: 'power3.out' });
    }
  }

  function openPV(pid, ck, view = 'cut', fromImg) {
    if (!byId[pid]) return;
    Object.assign(pvState, { pid, ck: colorOf(byId[pid], ck).key, view, size: null });
    pvImg.removeAttribute('src');
    pvRender(false);
    const wasOpen = pvState.open;
    pvState.open = true;
    pv.classList.add('is-open'); pv.setAttribute('aria-hidden', 'false');
    document.body.classList.add('is-locked'); lenis.stop();
    try { history.replaceState(null, '', `#piece/${pid}/${pvState.ck}`); } catch (e) {}
    if (wasOpen) return;
    gsap.fromTo(veil, { opacity: 0 }, { opacity: 1, duration: 0.6, ease: 'power2.out' });
    gsap.fromTo($$('.pv__info > *, .pv__close, .pv__arrow', pv), { y: 24, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.7, stagger: 0.035, delay: 0.15, ease: 'power3.out' });
    const fly = () => {
      if (fromImg && !reduce) {
        const a = fromImg.getBoundingClientRect(), b = pvImg.getBoundingClientRect();
        if (a.width && b.width) {
          gsap.fromTo(pvImg, { x: (a.left + a.width / 2) - (b.left + b.width / 2), y: (a.top + a.height / 2) - (b.top + b.height / 2), scale: a.width / b.width, autoAlpha: 1, filter: B(0) },
            { x: 0, y: 0, scale: 1, duration: 0.9, ease: 'expo.out' });
          return;
        }
      }
      gsap.fromTo(pvImg, { y: 40, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.8, ease: 'power3.out' });
    };
    gsap.set(pvImg, { autoAlpha: 0 });
    if (pvImg.complete && pvImg.naturalWidth) fly(); else pvImg.addEventListener('load', fly, { once: true });
  }

  function closePV() {
    if (!pvState.open) return;
    pvState.open = false;
    gsap.to($$('.pv__info > *, .pv__close, .pv__arrow', pv), { autoAlpha: 0, y: 10, duration: 0.25 });
    gsap.to(pvImg, { autoAlpha: 0, scale: 0.96, filter: B(10), duration: 0.35 });
    gsap.to(veil, { opacity: 0, duration: 0.45, delay: 0.1, onComplete: () => {
      pv.classList.remove('is-open'); pv.setAttribute('aria-hidden', 'true');
      gsap.set(pvImg, { clearProps: 'filter,scale' });
    } });
    document.body.classList.remove('is-locked'); lenis.start();
    try { history.replaceState(null, '', location.pathname + location.search); } catch (e) {}
  }

  pv.addEventListener('click', e => {
    if (e.target.closest('[data-pv-close]')) return closePV();
    const st = e.target.closest('[data-pv-step]');
    if (st) return stepPV(+st.dataset.pvStep);
    const sw = e.target.closest('[data-ck]');
    if (sw) { pvState.ck = sw.dataset.ck; return pvRender(true); }
    const v = e.target.closest('[data-view]');
    if (v && !v.disabled) { pvState.view = v.dataset.view; return pvRender(true); }
    const s = e.target.closest('[data-size]');
    if (s) { pvState.size = s.dataset.size; return pvRender(false); }
    if (e.target.closest('[data-pv-add]')) {
      if (!pvState.size) {
        gsap.fromTo('[data-pv-sizes]', { x: -8 }, { x: 0, duration: 0.5, ease: 'elastic.out(1, 0.3)' });
        return toast('Pick a size first');
      }
      addToBag(pvState.pid, pvState.ck, pvState.size);
    }
  });
  function stepPV(dir) {
    const i = (order.indexOf(pvState.pid) + dir + order.length) % order.length;
    const p = byId[order[i]];
    const c = p.colors.find(x => x.cut) || p.colors[0];
    Object.assign(pvState, { pid: p.id, ck: c.key, view: c.cut ? 'cut' : 'on', size: null });
    gsap.fromTo(pvImg, { x: dir * 60 }, { x: 0, duration: 0.6, ease: 'power3.out' });
    pvRender(true);
    try { history.replaceState(null, '', `#piece/${p.id}/${c.key}`); } catch (e) {}
  }

  /* =========================================================
     BAG (kept in this browser until Shopify checkout is linked)
  ========================================================= */
  const KEY = 'ruins-bag';
  let bag = [];
  try { bag = JSON.parse(localStorage.getItem(KEY)) || []; } catch (e) { bag = []; }
  bag = bag.filter(b => byId[b.pid]);
  const saveBag = () => { try { localStorage.setItem(KEY, JSON.stringify(bag)); } catch (e) {} };
  const bagEl = $('.bag'), bagItems = $('[data-bag-items]');

  function renderBag() {
    const count = bag.reduce((n, b) => n + b.qty, 0);
    $$('[data-bag-count]').forEach(n => n.textContent = count);
    $('[data-bag-total]').textContent = price(bag.reduce((n, b) => n + byId[b.pid].price * b.qty, 0));
    if (!bag.length) { bagItems.innerHTML = '<div class="bag__empty"><b>Your bag is empty</b><span class="mono">Pick something off the rail</span></div>'; return; }
    bagItems.innerHTML = bag.map((b, i) => {
      const p = byId[b.pid], c = colorOf(p, b.ck);
      const img = c.cut ? `<img src="${cutSrc(c.cut)}" alt="">` : `<img class="is-photo" src="${onSrc(c.on)}" alt="">`;
      return `<div class="bi"><div class="bi__img">${img}</div>
        <div><div class="bi__name">${p.name}</div><div class="bi__meta mono">${c.label} · ${b.size}</div>
        <div class="bi__qty mono"><button data-q="${i}" data-d="-1" aria-label="Less">−</button><span>${b.qty}</span><button data-q="${i}" data-d="1" aria-label="More">+</button></div></div>
        <div style="text-align:right"><div class="mono">${price(p.price * b.qty)}</div><button class="bi__remove mono" data-rm="${i}" style="margin-top:10px">Remove</button></div></div>`;
    }).join('');
  }
  function addToBag(pid, ck, size) {
    const f = bag.find(b => b.pid === pid && b.ck === ck && b.size === size);
    if (f) f.qty++; else bag.push({ pid, ck, size, qty: 1 });
    saveBag(); renderBag();
    const btn = $('.nav__bag'); btn.classList.remove('bump'); void btn.offsetWidth; btn.classList.add('bump');
    openBag();
  }
  function openBag() { bagEl.classList.add('is-open'); bagEl.setAttribute('aria-hidden', 'false'); lenis.stop(); document.body.classList.add('is-locked'); }
  function closeBag() {
    bagEl.classList.remove('is-open'); bagEl.setAttribute('aria-hidden', 'true');
    if (!pvState.open) { lenis.start(); document.body.classList.remove('is-locked'); }
  }
  $$('[data-open-bag]').forEach(b => b.addEventListener('click', openBag));
  $$('[data-close-bag]').forEach(b => b.addEventListener('click', closeBag));
  bagItems.addEventListener('click', e => {
    const q = e.target.closest('[data-q]'), r = e.target.closest('[data-rm]');
    if (q) { const b = bag[+q.dataset.q]; b.qty += +q.dataset.d; if (b.qty < 1) bag.splice(+q.dataset.q, 1); }
    else if (r) bag.splice(+r.dataset.rm, 1);
    else return;
    saveBag(); renderBag();
  });
  $('[data-checkout]').addEventListener('click', () => {
    if (!bag.length) return toast('Your bag is empty');
    // Shopify cart permalink: https://STORE/cart/VARIANT:QTY,VARIANT:QTY
    const lines = bag.map(b => { const v = colorOf(byId[b.pid], b.ck).shopify || {}; return v[b.size] ? `${v[b.size]}:${b.qty}` : null; });
    if (lines.every(Boolean)) { location.href = `https://${D.shopDomain}/cart/${lines.join(',')}`; return; }
    toast('Checkout opens once the shop is linked to Shopify');
  });
  renderBag();

  $('[data-news]').addEventListener('submit', e => { e.preventDefault(); toast('Sign-up opens with the shop launch'); e.target.reset(); });

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') { if (bagEl.classList.contains('is-open')) closeBag(); else if (pvState.open) closePV(); else if (zoomed) zoomOut(); else closeMenu(); }
    if (pvState.open && !bagEl.classList.contains('is-open')) { if (e.key === 'ArrowRight') stepPV(1); if (e.key === 'ArrowLeft') stepPV(-1); }
  });

  /* =========================================================
     ENTRANCE — orange screen, logo sharpens out of the blur,
     counter runs, screen lifts, pieces drop onto the rail
  ========================================================= */
  const loader = $('.loader'), count = $('.loader__count');
  const firstImgs = [];
  const ready = Promise.all([
    document.fonts ? document.fonts.ready : Promise.resolve(), railReady,
    ...firstImgs.map(i => i.decode ? i.decode().catch(() => {}) : Promise.resolve())
  ]);
  const minTime = new Promise(r => setTimeout(r, reduce ? 200 : 1700));
  const maxTime = new Promise(r => setTimeout(r, 3500));

  const lLetters = $$('.loader__logo .l');
  gsap.set('.loader__logo', { filter: B(28), letterSpacing: '0.25em', opacity: 0 });
  gsap.to('.loader__logo', { filter: B(0), letterSpacing: logoLS, opacity: 1, duration: reduce ? 0.1 : 1.5, ease: 'expo.out', delay: 0.1 });
  gsap.from(lLetters, { yPercent: 30, duration: 1.4, stagger: 0.06, ease: 'expo.out' });
  const counter = { v: 0 };
  const countTween = gsap.to(counter, { v: 92, duration: 1.6, ease: 'power2.out', onUpdate: () => { count.textContent = String(Math.round(counter.v)).padStart(3, '0'); } });

  Promise.race([Promise.all([ready, minTime]), maxTime]).then(() => {
    countTween.kill();
    const tl = gsap.timeline({ onComplete: start });
    tl.to(counter, { v: 100, duration: 0.35, ease: 'power1.out', onUpdate: () => { count.textContent = String(Math.round(counter.v)).padStart(3, '0'); } })
      .to('.loader__logo', { filter: B(16), scaleX: 1.15, opacity: 0, duration: 0.6, ease: 'power2.in' }, '+=0.1')
      .to('.loader__top, .loader__bottom', { opacity: 0, duration: 0.3 }, '<')
      .to(loader, { yPercent: -100, duration: reduce ? 0.2 : 1, ease: 'expo.inOut' }, '-=0.25')
      .add(() => document.body.classList.remove('is-loading'), '-=0.6')
      // like the reference: the pieces fade onto the rail one by one, left to right
      .from(bodies, { autoAlpha: 0, x: -14, filter: B(10), duration: reduce ? 0.01 : 0.9, stagger: reduce ? 0 : 0.085, ease: 'power2.out', clearProps: 'filter' }, '-=0.45')
      .from('.hero__labels > *, .hero__caption > *', { y: 14, autoAlpha: 0, duration: 0.7, stagger: 0.06, ease: 'power3.out' }, '-=0.8')
      .from('.nav > *', { y: -16, autoAlpha: 0, duration: 0.7, stagger: 0.06, ease: 'power3.out' }, '<');
  });

  function start() {
    loader.style.display = 'none';
    lenis.start();
    buildShowcase();
    buildRing(); spinCycle();
    buildScrollFX();
    ScrollTrigger.refresh();
    const m = location.hash.match(/^#piece\/([\w-]+)\/([\w-]+)/);
    if (m) openPV(m[1], m[2], 'cut');
    else if (location.hash.length > 1 && $(location.hash)) setTimeout(() => scrollToHash(location.hash), 200);
  }

  let lastW = window.innerWidth;
  window.addEventListener('resize', () => {
    if (Math.abs(window.innerWidth - lastW) < 40) return;
    lastW = window.innerWidth;
    if (ringTween) buildRing();
    if (!zoomed) { measure(); buildAll(); setActive(active, false); centerOn(active, true); }
    fitWords();
  });
})();
