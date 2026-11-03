/* Digital Operation — shared Splash and Onboarding screens for both prototypes.
   Design direction B · "Dusk" (chosen from intro-concepts.html): dark charcoal with a warm orange glow,
   full-bleed 3D miniature illustrations generated with Magnific (assets/concepts/dusk-*.jpg).
   Same visual identity in both apps; each app passes its own role wording. */
(() => {
  const ART = {
    projects: 'assets/concepts/dusk-1.jpg',
    updates: 'assets/concepts/dusk-2.jpg',
    tracking: 'assets/concepts/dusk-3.jpg',
  };
  const ICON = (i, c = '') => `<iconify-icon icon="${i}"${c ? ` style="color:${c}"` : ''}></iconify-icon>`;
  const mark = (size, fill = '#fff', ring = '#F37F46', dot = '#17161B') =>
    `<svg width="${size}" height="${size}" viewBox="0 0 38 38" aria-hidden="true"><circle cx="19" cy="19" r="19" fill="${fill}"/><circle cx="19" cy="19" r="8" fill="none" stroke="${ring}" stroke-width="2.4"/><circle cx="26.6" cy="11.4" r="3.6" fill="${dot}"/></svg>`;

  document.head.insertAdjacentHTML('beforeend', `<style>
    :root{--dusk:#17161B}
    /* Light home indicator whenever the status bar is light (dark screens). */
    .statusbar.light ~ .home-ind{background:#fff}

    /* Splash */
    .splash{position:absolute;inset:0;background:var(--dusk);color:#fff;overflow:hidden;cursor:pointer}
    .splash-glow{position:absolute;inset:0;background:radial-gradient(circle at 50% 44%,rgba(243,127,70,.42),rgba(243,127,70,0) 46%);animation:glowIn .9s ease-out both,duskGlow 3.2s ease-in-out .9s infinite alternate}
    .splash-art{position:absolute;inset:0;width:100%;height:100%}
    .splash-art path{fill:none;stroke:rgba(243,127,70,.10);stroke-width:1.2}
    .splash-art path.idx{stroke:rgba(243,127,70,.18);stroke-width:1.8}
    .splash-mid{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:6px;padding-bottom:30px}
    /* Entrance: the logo fades in while scaling up gently (no bounce), then the name, then the details. ~1.4s in total. */
    .splash-mark{border-radius:50%;margin-bottom:24px;box-shadow:0 0 0 10px rgba(243,127,70,.12),0 0 60px 6px rgba(243,127,70,.55);animation:markIn .8s cubic-bezier(.22,1,.36,1) .1s both}
    .splash-mark svg{display:block}
    .splash-name{font-family:"Nunito Sans",sans-serif;font-size:30px;font-weight:900;letter-spacing:-0.02em;line-height:1.1;direction:ltr;animation:nameIn .7s cubic-bezier(.22,1,.36,1) .55s both}
    .splash-sub{font-size:14px;font-weight:700;color:rgba(255,255,255,.7);animation:splashRise .6s cubic-bezier(.22,1,.36,1) .72s both}
    .splash-load{position:absolute;left:50%;bottom:76px;transform:translateX(-50%);display:flex;gap:6px;direction:ltr}
    .splash-load i{width:8px;height:8px;border-radius:50%;background:rgba(255,255,255,.25);animation:duskDot 1.2s ease-in-out infinite}
    .splash-load i:nth-child(2){animation-delay:.2s}.splash-load i:nth-child(3){animation-delay:.4s}
    @keyframes markIn{from{opacity:0;transform:scale(.84)}}
    @keyframes nameIn{from{opacity:0;transform:translateY(8px);letter-spacing:.02em}}
    @keyframes glowIn{from{opacity:0}}
    @keyframes splashRise{from{transform:translateY(10px);opacity:0}}
    @keyframes duskGlow{to{opacity:.7}}
    @keyframes duskDot{30%{background:var(--primary);box-shadow:0 0 12px rgba(243,127,70,.9)}}

    /* Onboarding */
    .ob{position:absolute;inset:0;background:var(--dusk);color:#fff;overflow:hidden;touch-action:pan-y}
    .ob-art{position:absolute;left:0;right:0;top:0;height:560px;background:center 20%/cover no-repeat;animation:obArt .6s cubic-bezier(.2,.8,.2,1) both}
    .ob-art::after{content:"";position:absolute;inset:0;background:linear-gradient(180deg,rgba(23,22,27,.55) 0%,rgba(23,22,27,0) 18%,rgba(23,22,27,0) 58%,var(--dusk) 100%)}
    .ob-top{position:absolute;top:58px;left:var(--gutter);right:var(--gutter);z-index:2;display:flex;justify-content:space-between;align-items:center;height:40px}
    .ob-brand{display:flex;align-items:center;gap:8px;font-family:"Nunito Sans",sans-serif;font-size:14px;font-weight:900;direction:ltr}
    .ob-skip{height:34px;padding:0 14px;border-radius:var(--r-full);background:rgba(255,255,255,.1);border:1px solid rgba(255,255,255,.14);font-size:12px;font-weight:800;color:#fff}
    .ob-body{position:absolute;left:0;right:0;bottom:0;padding:0 var(--gutter) 36px}
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
    .ob-hint{margin:10px 0 0;text-align:center;font-size:12px;font-weight:600;color:rgba(255,255,255,.5)}
    @keyframes obArt{from{transform:scale(1.04);opacity:0}}
    @media (prefers-reduced-motion:reduce){.splash *,.ob-art,.ob-text{animation:none!important}}
  </style>`);

  window.DOIntro = {
    splash: role => `<div class="splash" data-act="splashNext" role="img" aria-label="Digital Operation — ${role}">
      <div class="splash-glow"></div>
      <svg class="splash-art" viewBox="0 0 390 844" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
        <g data-contours='{"cx":195,"cy":372,"n":18,"r0":56,"gap":24,"amp":0.13,"seed":1.1,"dx":0.6,"dy":1.2}'></g></svg>
      <div class="splash-mid"><div class="splash-mark">${mark(100)}</div>
        <div class="splash-name">Digital Operation</div><div class="splash-sub">التشغيل الرقمي</div></div>
      <div class="splash-load" aria-hidden="true"><i></i><i></i><i></i></div>
    </div>`,

    onboarding: ({ steps, i, tag, tagIcon }) => {
      const s = steps[i], last = i === steps.length - 1;
      return `<div class="ob" data-swipe="onboarding">
        <div class="ob-art" role="img" aria-label="${s.alt}" style="background-image:url('${ART[s.art]}')"></div>
        <div class="ob-top"><span class="ob-brand">${mark(26)}Digital Operation</span>
          ${last ? '' : `<button class="ob-skip" type="button" data-act="obSkip">تخطي</button>`}</div>
        <div class="ob-body">
          <div class="ob-text"><h2 class="ob-title">${s.title}</h2><p class="ob-copy">${s.text}</p></div>
          <div class="ob-dots" role="group" aria-label="الخطوة ${i + 1} من ${steps.length}">${steps.map((_, k) =>
            `<button type="button" data-act="obGo" data-i="${k}" aria-label="الخطوة ${k + 1}"${k === i ? ' aria-current="step"' : ''}></button>`).join('')}</div>
          <div class="ob-btns">${i ? `<button class="ob-back" type="button" data-act="obPrev" aria-label="السابق">${ICON('solar:arrow-right-linear')}</button>` : ''}
            <button class="btn-primary" type="button" data-act="obNext">${last ? `<span>ابدأ الآن</span>${ICON('solar:login-2-bold')}` : `<span>التالي</span>${ICON('solar:alt-arrow-left-bold')}`}</button></div>
          ${last ? '<p class="ob-hint">ستنتقل الآن إلى تسجيل الدخول</p>' : ''}
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
