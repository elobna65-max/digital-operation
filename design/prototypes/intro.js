/* Digital Operation — shared Splash and Onboarding screens for both prototypes.
   Design direction B · "Dusk" (chosen from intro-concepts.html): dark charcoal with a warm orange glow,
   full-bleed 3D miniature illustrations generated with Magnific (assets/concepts/dusk-*.jpg).
   Same visual identity in both apps; each app passes its own role wording. */
(() => {
  // Each illustration is framed so its subject rests on the same line (446px down the 390×560 art area),
  // centred, at a comparable visual weight: size = rendered image height, pos = background offset,
  // bg = the image's own backdrop colour, which fills any edge the image leaves uncovered.
  const ART = {
    projects: { src: 'assets/concepts/dusk-1.jpg', size: 560, pos: '-31px 15px', bg: '#18171C' },
    updates:  { src: 'assets/concepts/dusk-2.jpg', size: 543, pos: '-25px 39px', bg: '#1A1B20' },
    tracking: { src: 'assets/concepts/dusk-3.jpg', size: 577, pos: '-36px 4px', bg: '#16171C' },
  };
  const ICON = (i, c = '') => `<iconify-icon icon="${i}"${c ? ` style="color:${c}"` : ''}></iconify-icon>`;
  const mark = (size, fill = '#fff', ring = '#F37F46', dot = '#17161B') =>
    `<svg width="${size}" height="${size}" viewBox="0 0 38 38" aria-hidden="true"><circle cx="19" cy="19" r="19" fill="${fill}"/><circle cx="19" cy="19" r="8" fill="none" stroke="${ring}" stroke-width="2.4"/><circle cx="26.6" cy="11.4" r="3.6" fill="${dot}"/></svg>`;

  document.head.insertAdjacentHTML('beforeend', `<style>
    :root{--dusk:#17161B}
    /* Light home indicator whenever the status bar is light (dark screens). */
    .statusbar.light ~ .home-ind{background:#fff}

    /* Splash — one continuous ~2.9s sequence, each step overlapping the next (all ease-out, no bounce):
       0.0s  dawn: a soft orange light rises from the centre
       0.15s contour lines ripple outward
       0.3s  logo comes into focus (blur → sharp, gentle scale-up), its ring draws, the dot settles
       1.15s a single light sweep crosses the logo; the halo starts to breathe
       1.05s "Digital Operation" resolves (fade + focus + tracking closes), then the Arabic line
       0.3s→2.7s a thin glowing line fills underneath; at ~2.9s the scene dissolves into onboarding */
    .splash{position:absolute;inset:0;background:var(--dusk);color:#fff;overflow:hidden;cursor:pointer}
    .sp-dawn{position:absolute;inset:0;background:radial-gradient(circle at 50% 44%,rgba(243,127,70,.46),rgba(243,127,70,.12) 30%,rgba(243,127,70,0) 52%);
      animation:spDawn 1.3s cubic-bezier(.16,1,.3,1) both,spBreathe 4s ease-in-out 1.3s infinite alternate}
    .splash-art{position:absolute;inset:0;width:100%;height:100%}
    .splash-art path{fill:none;stroke:rgba(243,127,70,.11);stroke-width:1.2;transform-box:view-box;transform-origin:195px 372px;animation:spRipple 1.4s cubic-bezier(.16,1,.3,1) both}
    .splash-art path.idx{stroke:rgba(243,127,70,.2);stroke-width:1.8}
    ${Array.from({ length: 18 }, (_, k) => `.splash-art path:nth-child(${k + 1}){animation-delay:${(0.15 + k * 0.045).toFixed(3)}s}`).join('')}
    .splash-mid{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:6px;padding-bottom:30px}
    .sp-logo{position:relative;width:100px;height:100px;margin-bottom:26px;animation:spLogo 1s cubic-bezier(.16,1,.3,1) .3s both}
    .sp-halo{position:absolute;inset:0;border-radius:50%;box-shadow:0 0 0 10px rgba(243,127,70,.12),0 0 64px 8px rgba(243,127,70,.55);animation:spFade .9s ease-out .9s both,spHalo 4s ease-in-out 1.8s infinite alternate}
    .sp-disc{position:relative;display:block;width:100px;height:100px;border-radius:50%;overflow:hidden}
    .sp-disc svg{display:block}
    .sp-ring{stroke-dasharray:50.3;stroke-dashoffset:50.3;animation:spDraw .8s cubic-bezier(.65,0,.35,1) .55s forwards}
    .sp-dot{transform-box:fill-box;transform-origin:center;animation:spDot .5s cubic-bezier(.16,1,.3,1) 1.05s both}
    .sp-sheen{position:absolute;inset:-20%;background:linear-gradient(115deg,transparent 38%,rgba(255,255,255,.75) 50%,transparent 62%);transform:translateX(-120%);animation:spSheen .9s cubic-bezier(.4,0,.2,1) 1.15s forwards;mix-blend-mode:soft-light}
    .splash-name{font-family:"Nunito Sans",sans-serif;font-size:30px;font-weight:900;letter-spacing:-0.02em;line-height:1.1;direction:ltr;animation:spName 1.1s cubic-bezier(.16,1,.3,1) 1.05s both}
    .splash-sub{font-size:14px;font-weight:700;color:rgba(255,255,255,.7);animation:spRise .8s cubic-bezier(.16,1,.3,1) 1.5s both}
    .sp-line{position:absolute;left:50%;bottom:84px;width:96px;height:2px;margin-left:-48px;border-radius:2px;background:rgba(255,255,255,.1);overflow:hidden;animation:spFade .6s ease .3s both}
    .sp-line i{display:block;height:100%;border-radius:inherit;background:linear-gradient(270deg,rgba(243,127,70,.2),var(--primary));box-shadow:0 0 10px rgba(243,127,70,.9);transform-origin:right;animation:spFill 2.4s cubic-bezier(.65,0,.35,1) .3s both}
    /* Exit into onboarding: the scene grows slightly, softens and dissolves while the light opens up. */
    .splash.out .splash-mid{animation:spOut .5s cubic-bezier(.4,0,.2,1) forwards}
    .splash.out .sp-dawn{animation:spDawnOut .55s ease-in forwards}
    .splash.out .splash-art,.splash.out .sp-line{animation:spFadeOut .4s ease forwards}
    @keyframes spDawn{from{opacity:0;transform:scale(.6)}}
    @keyframes spBreathe{to{opacity:.72}}
    @keyframes spRipple{from{opacity:0;transform:scale(.94)}}
    @keyframes spLogo{from{opacity:0;transform:scale(.9);filter:blur(10px)}}
    @keyframes spFade{from{opacity:0}}
    @keyframes spHalo{to{opacity:.62}}
    @keyframes spDraw{to{stroke-dashoffset:0}}
    @keyframes spDot{from{opacity:0;transform:scale(.2)}}
    @keyframes spSheen{to{transform:translateX(120%)}}
    @keyframes spName{from{opacity:0;letter-spacing:.14em;filter:blur(6px)}}
    @keyframes spRise{from{opacity:0;transform:translateY(8px)}}
    @keyframes spFill{from{transform:scaleX(0)}}
    @keyframes spOut{to{opacity:0;transform:scale(1.05);filter:blur(6px)}}
    @keyframes spDawnOut{to{opacity:0;transform:scale(1.35)}}
    @keyframes spFadeOut{to{opacity:0}}
    @keyframes splashRise{from{transform:translateY(10px);opacity:0}}

    /* Onboarding */
    .ob{position:absolute;inset:0;background:var(--dusk);color:#fff;overflow:hidden;touch-action:pan-y}
    .ob-art{position:absolute;left:0;right:0;top:0;height:560px;background-repeat:no-repeat;animation:obArt .6s cubic-bezier(.2,.8,.2,1) both}
    .ob-art::after{content:"";position:absolute;inset:0;background:linear-gradient(180deg,rgba(23,22,27,.55) 0%,rgba(23,22,27,0) 18%,rgba(23,22,27,0) 58%,var(--dusk) 100%)}
    .ob-top{position:absolute;top:58px;left:var(--gutter);right:var(--gutter);z-index:2;display:flex;justify-content:space-between;align-items:center;height:40px}
    .ob-brand{display:flex;align-items:center;gap:8px;font-family:"Nunito Sans",sans-serif;font-size:14px;font-weight:900;direction:ltr}
    .ob-skip{height:34px;padding:0 14px;border-radius:var(--r-full);background:rgba(255,255,255,.1);border:1px solid rgba(255,255,255,.14);font-size:12px;font-weight:800;color:#fff}
    /* Same rhythm on every step: the title always starts at 536px and the dots, buttons and hint slot
       always sit at the bottom, whatever the title's line count or whether the hint is shown. */
    .ob-body{position:absolute;left:0;right:0;top:536px;bottom:0;display:flex;flex-direction:column;padding:0 var(--gutter) 36px}
    .ob-foot{margin-top:auto}
    .ob-text{animation:splashRise .45s ease .08s both}
    .ob-title{margin:0 0 8px;font-size:26px;font-weight:900;line-height:36px}
    .ob-copy{margin:0;font-size:14px;font-weight:600;line-height:23px;color:rgba(255,255,255,.66)}
    .ob-dots{display:flex;gap:6px;margin:26px 0 18px}
    .ob-dots button{width:8px;height:8px;border-radius:var(--r-full);background:rgba(255,255,255,.2);transition:width .25s,background .25s,box-shadow .25s}
    .ob-dots button[aria-current="step"]{width:28px;background:var(--primary);box-shadow:0 0 12px rgba(243,127,70,.8)}
    .ob-btns{display:flex;gap:10px;align-items:center}
    .ob-back{width:56px;height:56px;flex:none;border-radius:var(--r-full);display:grid;place-items:center;background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.14);color:#fff}
    .ob-back iconify-icon{font-size:22px}
    .ob-btns .btn-primary{flex:1;margin:0;box-shadow:0 14px 34px -10px rgba(243,127,70,.8)}
    .ob-hint{margin:10px 0 0;min-height:23px;line-height:23px;text-align:center;font-size:12px;font-weight:600;color:rgba(255,255,255,.5)}
    @keyframes obArt{from{transform:scale(1.04);opacity:0}}
    @media (prefers-reduced-motion:reduce){.splash *,.ob-art,.ob-text{animation:none!important}}
  </style>`);

  window.DOIntro = {
    // How long the splash holds before dissolving into onboarding (the entrance completes by ~2.7s).
    SPLASH_MS: 2900,
    splash: role => `<div class="splash" data-act="splashNext" role="img" aria-label="Digital Operation — ${role}">
      <div class="sp-dawn"></div>
      <svg class="splash-art" viewBox="0 0 390 844" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
        <g data-contours='{"cx":195,"cy":372,"n":18,"r0":56,"gap":24,"amp":0.13,"seed":1.1,"dx":0.6,"dy":1.2}'></g></svg>
      <div class="splash-mid">
        <div class="sp-logo"><span class="sp-halo"></span><span class="sp-disc">
          <svg width="100" height="100" viewBox="0 0 38 38" aria-hidden="true"><circle cx="19" cy="19" r="19" fill="#fff"/>
            <circle class="sp-ring" cx="19" cy="19" r="8" fill="none" stroke="#F37F46" stroke-width="2.4" transform="rotate(-90 19 19)"/>
            <circle class="sp-dot" cx="26.6" cy="11.4" r="3.6" fill="#17161B"/></svg><span class="sp-sheen"></span></span></div>
        <div class="splash-name">Digital Operation</div><div class="splash-sub">التشغيل الرقمي</div></div>
      <div class="sp-line" aria-hidden="true"><i></i></div>
    </div>`,
    // Play the exit, then hand over (instantly when the user prefers reduced motion). Safe to call twice.
    leave(root, done) {
      const sp = root.querySelector('.splash');
      if (!sp) return done();
      if (sp.classList.contains('out')) return;
      if (matchMedia('(prefers-reduced-motion: reduce)').matches) return done();
      sp.classList.add('out');
      setTimeout(done, 520);
    },

    onboarding: ({ steps, i, tag, tagIcon }) => {
      const s = steps[i], last = i === steps.length - 1, a = ART[s.art];
      return `<div class="ob" data-swipe="onboarding">
        <div class="ob-art" role="img" aria-label="${s.alt}" style="background-image:url('${a.src}');background-size:auto ${a.size}px;background-position:${a.pos};background-color:${a.bg}"></div>
        <div class="ob-top"><span class="ob-brand">${mark(26)}Digital Operation</span>
          ${last ? '' : `<button class="ob-skip" type="button" data-act="obSkip">تخطي</button>`}</div>
        <div class="ob-body">
          <div class="ob-text"><h2 class="ob-title">${s.title}</h2><p class="ob-copy">${s.text}</p></div>
          <div class="ob-foot"><div class="ob-dots" role="group" aria-label="الخطوة ${i + 1} من ${steps.length}">${steps.map((_, k) =>
            `<button type="button" data-act="obGo" data-i="${k}" aria-label="الخطوة ${k + 1}"${k === i ? ' aria-current="step"' : ''}></button>`).join('')}</div>
          <div class="ob-btns">${i ? `<button class="ob-back" type="button" data-act="obPrev" aria-label="السابق">${ICON('solar:arrow-right-linear')}</button>` : ''}
            <button class="btn-primary" type="button" data-act="obNext">${last ? `<span>ابدأ الآن</span>${ICON('solar:login-2-bold')}` : `<span>التالي</span>${ICON('solar:alt-arrow-left-bold')}`}</button></div>
          ${last ? '<p class="ob-hint">ستنتقل الآن إلى تسجيل الدخول</p>' : '<p class="ob-hint" aria-hidden="true"></p>'}</div>
        </div>
      </div>`;
    },

    // Horizontal swipe on the onboarding pages. RTL: dragging toward the right reveals the next page.
    bindSwipe(root, onNext, onPrev) {
      let x0 = null, y0 = 0;
      root.addEventListener('pointerdown', e => { if (e.target.closest('[data-swipe]')) { x0 = e.clientX; y0 = e.clientY; } });
      root.addEventListener('pointerup', e => {
        if (x0 == null) return;
        const dx = e.clientX - x0, dy = e.clientY - y0; x0 = null;
        if (Math.abs(dx) < 50 || Math.abs(dx) < Math.abs(dy)) return;
        dx > 0 ? onNext() : onPrev();
      });
    },
  };
})();
