/* Digital Operation — shared project records and status rules for both prototypes
   (employee-app.html and pm-app.html).

   A project's status is never stored. computeStatus() derives it from the project's dates
   and its suspension records (AGENTS.md: one status function, reused everywhere).
   Simulated admin actions (suspend, resume, change the end date) are kept as a list of
   changes that both apps apply to the same base records, so a change made in one app is
   reflected in the other immediately. */
(() => {
  const TODAY = '2026-11-02';
  const NOW0 = new Date('2026-11-02T11:07:00'), LOADED = Date.now();
  const now = () => new Date(NOW0.getTime() + (Date.now() - LOADED));
  const PHOTO = n => `assets/photos/${n}.jpg`;

  const STATUS = {
    IN_PROGRESS: { label: 'جارٍ التنفيذ', cls: 'pip-success', color: '#34C759' },
    ON_HOLD:     { label: 'معلق مؤقتًا',  cls: 'pip-warning', color: '#FF9500' },
    ENDED:       { label: 'انتهت المدة',  cls: 'pip-neutral', color: '#8E8E93' },
    NOT_STARTED: { label: 'لم يبدأ',      cls: 'pip-blue',    color: '#007AFF' },
  };

  // Team members and project managers use real user ids; each app maps its signed-in user to 'me'.
  // holds = suspension records (admin, mandatory reason; an open hold has no `to`). ext = end-date changes.
  const BASE = [
    { code: 'PRJ-0142', name: 'ترميم قصر المصمك', short: 'قصر المصمك', cls: 'ترميم', icon: 'solar:buildings-2-bold', tint: 'var(--indigo)',
      loc: 'الرياض · حي الديرة', lat: 24.6312, lng: 46.7133, photo: PHOTO('masmak-cover'), shots: ['masmak-plaster', 'masmak-scaffold', 'masmak-ceiling'].map(PHOTO),
      start: '2026-09-15', end: '2027-01-12', team: ['ahmed', 'khalid', 'sara'], pms: ['mohammed'], x: 75, y: 50,
      holds: [], ext: [{ at: '2026-10-22T11:30', from: '2026-12-15', to: '2027-01-12' }],
      desc: 'ترميم شامل للواجهات الطينية والأبراج الدفاعية، يشمل معالجة الشقوق وإعادة تأهيل الأسقف الخشبية وفق معايير الحفاظ على التراث.' },
    { code: 'PRJ-0138', name: 'مسح طبوغرافي لوادي حنيفة', short: 'وادي حنيفة', cls: 'مساحة', icon: 'solar:map-bold', tint: 'var(--blue)',
      loc: 'الرياض · وادي حنيفة', lat: 24.6906, lng: 46.5820, photo: PHOTO('wadi-cover'), shots: ['wadi-station', 'wadi-gnss', 'wadi-drone'].map(PHOTO),
      start: '2026-10-01', end: '2026-12-20', team: ['ahmed', 'sara'], pms: ['mohammed', 'reem'], x: 64, y: 55,
      holds: [{ at: '2026-10-26T09:00', from: '2026-10-26', to: '2026-11-02', resumedAt: '2026-11-02T07:02', reason: 'ارتفاع منسوب المياه في مجرى الوادي بعد الأمطار.' }], ext: [],
      desc: 'رفع طبوغرافي تفصيلي لمجرى الوادي وضفافه لدعم أعمال التأهيل البيئي وتحديد مناسيب التصريف.' },
    { code: 'PRJ-0127', name: 'توثيق موقع الحِجر الأثري', short: 'الحِجر', cls: 'تراثي وأثري', icon: 'solar:history-bold', tint: 'var(--success)',
      loc: 'العُلا · الحِجر', lat: 26.7920, lng: 37.9531, photo: PHOTO('hegra-cover'), shots: ['hegra-inscription', 'hegra-scanner', 'hegra-excavation'].map(PHOTO),
      start: '2026-06-01', end: '2026-12-31', team: ['ahmed', 'faisal'], pms: ['mohammed', 'reem'], x: 30, y: 25,
      holds: [{ at: '2026-10-18T15:10', from: '2026-10-18', reason: 'بانتظار تجديد تصريح العمل الميداني من هيئة التراث.' }], ext: [],
      desc: 'توثيق رقمي شامل للمدافن النبطية والنقوش الصخرية باستخدام المسح التصويري والليزري.' },
    { code: 'PRJ-0119', name: 'إنشاء مبنى إداري', short: 'المبنى الإداري', cls: 'بناء', icon: 'solar:buildings-3-bold', tint: 'var(--warning)',
      loc: 'جدة · حي الشاطئ', lat: 21.5810, lng: 39.1093, photo: PHOTO('jeddah-cover'), shots: ['jeddah-concrete', 'jeddah-rebar', 'jeddah-facade'].map(PHOTO),
      start: '2026-03-01', end: '2026-10-30', team: ['ahmed', 'faisal'], pms: ['mohammed', 'abdullah'], x: 20, y: 47,
      holds: [], ext: [],
      desc: 'إنشاء مبنى إداري من خمسة أدوار يشمل الأعمال الإنشائية والمعمارية والتمديدات الكهروميكانيكية.' },
    { code: 'PRJ-0151', name: 'مسح مواقع الدرعية التاريخية', short: 'الدرعية', cls: 'مساحة', icon: 'solar:map-bold', tint: 'var(--blue)',
      loc: 'الدرعية · حي الطريف', lat: 24.7340, lng: 46.5730, photo: PHOTO('diriyah-cover'), shots: [],
      start: '2026-11-15', end: '2027-03-15', team: ['ahmed', 'sara'], pms: ['mohammed'], x: 60, y: 38,
      holds: [], ext: [],
      desc: 'مسح وتوثيق المواقع التاريخية في حي الطريف تمهيدًا لأعمال التطوير والترميم.' },
  ];

  /* ── Status rules ── */
  const holdOf = p => p.holds.find(h => !h.to) || null;
  const inHold = (p, d) => p.holds.some(h => d >= h.from && (!h.to || d < h.to));
  // ON_HOLD is manual and overrides the dates until resumed; otherwise the dates decide.
  function computeStatus(p, today = TODAY) {
    if (holdOf(p)) return 'ON_HOLD';
    if (today < p.start) return 'NOT_STARTED';
    if (today > p.end) return 'ENDED';
    return 'IN_PROGRESS';
  }

  /* ── Shared state: base records + simulated admin changes ── */
  const KEY = 'do:admin-changes:v1';
  const PROJECTS = BASE.map(() => ({}));
  let me = null, changes = [];
  const listeners = [];
  const alias = id => id === me ? 'me' : id;
  function apply() {
    BASE.forEach((b, i) => {
      const p = PROJECTS[i];
      Object.keys(p).forEach(k => delete p[k]);
      Object.assign(p, JSON.parse(JSON.stringify(b)));
      p.team = p.team.map(alias); p.pms = p.pms.map(alias);
    });
    changes.forEach(c => {
      const p = PROJECTS.find(x => x.code === c.code);
      if (!p) return;
      if (c.kind === 'suspend') p.holds.push({ at: c.at, from: c.day, reason: c.reason, by: 'noura' });
      if (c.kind === 'resume') { const h = holdOf(p); if (h) { h.to = c.day; h.resumedAt = c.at; } }
      if (c.kind === 'end') { p.ext.push({ at: c.at, from: p.end, to: c.date }); p.end = c.date; }
    });
  }
  function read() { try { return JSON.parse(localStorage.getItem(KEY)) || []; } catch { return []; } }
  const channel = 'BroadcastChannel' in window ? new BroadcastChannel('do-projects') : null;
  function commit(next, origin) {
    if (JSON.stringify(next) === JSON.stringify(changes)) return;
    const undone = next.length < changes.length;   // "undo all": apps resync quietly instead of announcing status changes
    changes = next;
    apply();
    try { localStorage.setItem(KEY, JSON.stringify(changes)); } catch { /* private mode: in-memory only */ }
    if (origin !== 'remote') {
      if (channel) channel.postMessage(changes);
      if (window.parent !== window) parent.postMessage({ type: 'do:projects', changes }, '*');   // index.html relays it to the other app
    }
    listeners.forEach(fn => fn(origin, undone));
  }
  if (channel) channel.onmessage = e => commit(e.data, 'remote');
  addEventListener('message', e => { if (e.source === parent && e.data && e.data.type === 'do:projects') commit(e.data.changes, 'remote'); });

  /* ── Admin actions (simulated). The same rules the server must enforce. ── */
  const stamp = () => { const d = now(); return { at: d.getTime(), day: TODAY }; };
  const P = code => PROJECTS.find(p => p.code === code);
  function suspend(code, reason) {
    const p = P(code);
    if (computeStatus(p) !== 'IN_PROGRESS') return 'يمكن تعليق المشاريع الجارية فقط.';
    if (!reason || !reason.trim()) return 'سبب التعليق مطلوب.';
    commit([...changes, { code, kind: 'suspend', reason: reason.trim(), ...stamp() }], 'local');
  }
  function resume(code) {
    if (computeStatus(P(code)) !== 'ON_HOLD') return 'المشروع غير معلق.';
    commit([...changes, { code, kind: 'resume', ...stamp() }], 'local');
  }
  function setEnd(code, date) {
    const p = P(code);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date || '')) return 'اختر تاريخ نهاية صحيحًا.';
    if (date < p.start) return 'يجب أن يكون تاريخ النهاية بعد تاريخ البداية أو مساويًا له.';
    if (date === p.end) return 'هذا هو تاريخ النهاية الحالي.';
    commit([...changes, { code, kind: 'end', date, ...stamp() }], 'local');
  }
  const reset = () => commit([], 'reset');

  window.DO = {
    TODAY, STATUS, PROJECTS, computeStatus, holdOf, inHold,
    get changes() { return changes; },
    // Call once before using PROJECTS: maps the signed-in user's id to 'me' and loads saved changes.
    init({ me: id }) { me = id; changes = read(); apply(); },
    onChange(fn) { listeners.push(fn); },
    suspend, resume, setEnd, reset,
  };
})();
