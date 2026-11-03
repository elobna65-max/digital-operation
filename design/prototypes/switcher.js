/* Digital Operation — app switcher shown directly above the phone frame in both prototypes.
   Inside index.html it asks the host page to swap apps (each app keeps its own state);
   opened on its own, each tab is a plain link to the other prototype file. */
(() => {
  const APPS = [
    { id: 'employee', href: 'employee-app.html', icon: 'solar:user-hand-up-bold', ar: 'تطبيق الموظف', en: 'Employee App' },
    { id: 'pm', href: 'pm-app.html', icon: 'solar:case-round-bold', ar: 'تطبيق مدير المشروع', en: 'Project Manager App' },
  ];
  const me = document.currentScript.dataset.app;
  const embedded = window.parent !== window;

  document.head.insertAdjacentHTML('beforeend', `<style>
    .device{display:flex;flex-direction:column;align-items:center;gap:32px;flex:none}
    /* 412px = the 390px phone plus its 11px frame ring on each side. */
    .app-switch{display:flex;gap:4px;width:412px;padding:5px;border-radius:var(--r-full);background:rgba(255,255,255,.9);
      backdrop-filter:blur(20px);-webkit-backdrop-filter:blur(20px);border:1px solid rgba(229,229,234,.7);box-shadow:0 8px 30px rgba(0,0,0,.06)}
    .app-switch a{position:relative;flex:1;min-width:0;display:flex;align-items:center;justify-content:center;gap:10px;height:56px;padding:0 16px;
      border-radius:var(--r-full);color:var(--muted);transition:background .2s,color .2s,transform .15s}
    .app-switch a:hover{color:#000}
    .app-switch a:active{transform:scale(.97)}
    .app-switch a[aria-current="page"]{background:var(--surface-alt);color:#000;box-shadow:inset 0 1px 2px rgba(0,0,0,.04)}
    .app-switch a[aria-current="page"]::before{content:"";position:absolute;inset:0;border-radius:inherit;background:rgba(243,127,70,.08)}
    .app-switch iconify-icon,.app-switch .tl{position:relative}
    .app-switch iconify-icon{font-size:22px}
    .app-switch a[aria-current="page"] iconify-icon{color:var(--primary)}
    /* Arabic name over its English name, both starting on the same edge. */
    .app-switch .tl{display:flex;flex-direction:column;align-items:flex-start;gap:2px;min-width:0}
    .app-switch b{font-family:"Cairo",sans-serif;font-size:13px;font-weight:800;line-height:18px;white-space:nowrap}
    .app-switch small{font-family:"Nunito Sans",sans-serif;font-size:11px;font-weight:700;line-height:14px;letter-spacing:.01em;opacity:.7;direction:ltr;unicode-bidi:isolate;white-space:nowrap}
    @media (max-width:460px){
      .device{width:100%;max-width:390px;gap:22px}
      .app-switch{width:100%}
      .app-switch a{padding:0 10px;gap:8px;height:54px}
      .app-switch iconify-icon{font-size:20px}
      .app-switch b{font-size:12px}
      .app-switch small{font-size:10px}
    }
  </style>`);

  // Wrap the phone in a column so the switcher sits centred directly above it.
  const phone = document.getElementById('phone');
  const col = document.createElement('div');
  col.className = 'device';
  phone.before(col);
  col.innerHTML = `<nav class="app-switch" aria-label="التبديل بين التطبيقات">${APPS.map(a =>
    `<a href="${a.href}" data-app="${a.id}"${a.id === me ? ' aria-current="page"' : ''}><iconify-icon icon="${a.icon}" aria-hidden="true"></iconify-icon><span class="tl"><b>${a.ar}</b><small>${a.en}</small></span></a>`).join('')}</nav>`;
  col.append(phone);

  const nav = col.firstElementChild;
  nav.addEventListener('click', e => {
    const a = e.target.closest('a[data-app]');
    if (!a) return;
    if (a.dataset.app === me) return e.preventDefault();
    if (embedded) { e.preventDefault(); parent.postMessage({ type: 'do:switch-app', app: a.dataset.app }, '*'); }
  });
  // After the host swaps apps, keep keyboard focus on the switcher.
  addEventListener('message', e => {
    if (e.source === parent && e.data && e.data.type === 'do:focus-switch') nav.querySelector('[aria-current="page"]').focus();
  });
})();
