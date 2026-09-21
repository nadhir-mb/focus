// Focus Reset: catch the urge, play one short round, go back to work.
// One codebase for three surfaces, set by <body data-surface="popup|newtab|web">.
(() => {
  'use strict';

  const CONFIG = {
    ROUND_SECONDS: 60,        // hard cap, counted from the first flip
    PAIRS: 6,                 // 4x3 board, two pairs per card category
    MISMATCH_MS: 650,
    SITTING_GAP_MIN: 20,      // rounds closer together than this are one sitting
    FRICTION_DELAY_S: 5,      // extra wait per repeat round after the second
    FRICTION_DELAY_MAX_S: 20,
  };

  const SURFACE = document.body.dataset.surface || 'web';
  const CARDS = window.FR_CARDS;
  const CATS = window.FR_CATEGORIES;
  const MIN = 60 * 1000;
  const DAY = 24 * 60 * MIN;
  const GAP = CONFIG.SITTING_GAP_MIN * MIN;

  // Storage: chrome.storage in the extension, localStorage on the web.
  const hasChrome = typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local;
  const Store = {
    async get(key, fallback) {
      try {
        if (hasChrome) {
          const r = await chrome.storage.local.get(key);
          return r[key] ?? fallback;
        }
        const raw = localStorage.getItem(key);
        return raw ? JSON.parse(raw) : fallback;
      } catch { return fallback; }
    },
    async set(key, value) {
      try {
        if (hasChrome) await chrome.storage.local.set({ [key]: value });
        else localStorage.setItem(key, JSON.stringify(value));
      } catch { /* storage unavailable: the game still works, untracked */ }
    },
  };

  const K = { sessions: 'fr_sessions', declines: 'fr_declines', settings: 'fr_settings' };

  // Sound is wired but ships muted.
  const Sound = {
    enabled: false,
    play(_name) { if (!this.enabled) return; },
  };

  // ---- Tracking ------------------------------------------------------------
  let sessions = [];
  let declines = [];            // timestamps of "back to work" chosen at the friction prompt
  let settings = { sound: false, range: 7 };

  async function load() {
    sessions = await Store.get(K.sessions, []);
    const d = await Store.get(K.declines, []);
    declines = Array.isArray(d) ? d : [];
    settings = { ...settings, ...(await Store.get(K.settings, {})) };
    Sound.enabled = !!settings.sound;
  }
  const saveSessions = () => Store.set(K.sessions, sessions.slice(-2000));

  function updateSession(id, patch) {
    const s = sessions.find((x) => x.id === id);
    if (s) Object.assign(s, patch);
    return saveSessions();
  }

  // Rounds in the sitting that is still open (last round ended less than GAP ago).
  function currentSitting() {
    const sorted = [...sessions].sort((a, b) => b.startedAt - a.startedAt);
    const out = [];
    let ref = Date.now();
    for (const s of sorted) {
      if (ref - (s.endedAt || s.startedAt) > GAP) break;
      out.push(s);
      ref = s.startedAt;
    }
    return out;
  }

  const startOfDay = (t) => new Date(t).setHours(0, 0, 0, 0);

  function stats(rangeDays) {
    const now = Date.now();
    const from = startOfDay(now) - (rangeDays - 1) * DAY;
    const inRange = sessions.filter((s) => s.startedAt >= from);
    const returned = inRange.filter((s) => s.outcome === 'returned');
    // A round without an outcome only counts as a miss once its sitting has gone cold.
    const settled = inRange.filter((s) => s.outcome || now - (s.endedAt || s.startedAt) > GAP);

    let sittings = 0;
    let prevEnd = -Infinity;
    for (const s of [...inRange].sort((a, b) => a.startedAt - b.startedAt)) {
      if (s.startedAt - prevEnd > GAP) sittings++;
      prevEnd = s.endedAt || s.startedAt;
    }

    const days = [];
    for (let i = rangeDays - 1; i >= 0; i--) {
      const start = startOfDay(now) - i * DAY;
      const inDay = (t) => t >= start && t < start + DAY;
      days.push({
        start,
        count: returned.filter((s) => inDay(s.returnedAt)).length + declines.filter(inDay).length,
        today: i === 0,
      });
    }

    return {
      returned: returned.length + declines.filter((t) => t >= from).length,
      rate: settled.length ? Math.round((returned.length / settled.length) * 100) : null,
      perSitting: sittings ? (inRange.length / sittings).toFixed(1) : null,
      days,
    };
  }

  const todayCount = () => stats(1).returned;

  // ---- DOM helpers ---------------------------------------------------------
  function h(tag, attrs = {}, ...children) {
    const el = document.createElement(tag);
    for (const [k, v] of Object.entries(attrs)) {
      if (v == null || v === false) continue;
      if (k === 'class') el.className = v;
      else if (k === 'style') el.style.cssText = v;
      else if (k.startsWith('on')) el.addEventListener(k.slice(2), v);
      else if (k === 'html') el.innerHTML = v;
      else el.setAttribute(k, v === true ? '' : v);
    }
    for (const c of children.flat()) {
      if (c == null || c === false) continue;
      el.append(c.nodeType ? c : document.createTextNode(String(c)));
    }
    return el;
  }
  const svgIcon = (card) =>
    `<svg viewBox="0 0 48 32" fill="none" stroke="currentColor" stroke-width="1.1" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${card.svg}</svg>`;
  const arrow = () => h('span', { class: 'btn-arrow', 'aria-hidden': 'true', html:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>' });

  const screenEl = document.getElementById('screen');
  const statsEl = document.getElementById('stats');
  const todayEl = document.getElementById('today');

  // Stats only show on the intro and done screens; mid-round and at the exit they compete with the task.
  function show(node, { hideStats = false } = {}) {
    screenEl.replaceChildren(node);
    statsEl.hidden = hideStats;
    renderStats();
  }

  const shell = (...children) => h('div', { class: 'shell' }, h('div', { class: 'shell-inner' }, ...children));

  function timeAgo(t) {
    const d = Date.now() - t;
    if (d < MIN) return 'now';
    if (d < 60 * MIN) return `${Math.round(d / MIN)}m`;
    if (d < DAY) return `${Math.round(d / (60 * MIN))}h`;
    return `${Math.round(d / DAY)}d`;
  }

  // ---- Intro: what are you doing? -----------------------------------------
  // MECE by what happens to information: take it in, make something,
  // think it through, or exchange it with people.
  const ACTIVITIES = [
    { group: 'Take in', items: [
      { id: 'search', label: 'Search', ask: 'Looking for...' },
      { id: 'read', label: 'Read', ask: 'Reading...' }] },
    { group: 'Make', items: [
      { id: 'write', label: 'Write', ask: 'Writing...' },
      { id: 'build', label: 'Build', ask: 'Building...' },
      { id: 'design', label: 'Design', ask: 'Designing...' }] },
    { group: 'Think', items: [
      { id: 'analyze', label: 'Analyze', ask: 'Analyzing...' },
      { id: 'plan', label: 'Plan', ask: 'Planning...' }] },
    { group: 'Connect', items: [
      { id: 'message', label: 'Message', ask: 'Replying to...' },
      { id: 'meet', label: 'Meet', ask: 'Meeting...' }] },
  ];
  const ACTIVITY = Object.fromEntries(ACTIVITIES.flatMap((g) => g.items.map((a) => [a.id, a])));

  let activity = null;
  let detail = '';
  let task = '';

  const composeTask = () => {
    const a = ACTIVITY[activity];
    if (a && detail) return `${a.label}: ${detail}`;
    return a ? a.label : detail;
  };

  function renderIntro() {
    const sitting = currentSitting();
    if (!activity && !detail && sitting[0]) {
      activity = sitting[0].activity || null;
      detail = sitting[0].detail ?? sitting[0].task ?? '';
    }
    const repeat = sitting.length;

    const input = h('input', {
      class: 'task-input', type: 'text', maxlength: 120, value: detail,
      'aria-label': 'Details (optional)', autocomplete: 'off', spellcheck: 'false',
    });
    const startBtn = h('button', { class: 'btn btn-start', type: 'button' },
      'Start', h('span', { class: 'btn-meta' }, `${CONFIG.ROUND_SECONDS}s`));

    const chips = [];
    const picker = h('div', { class: 'activities', role: 'group', 'aria-label': 'Activity' },
      ACTIVITIES.map((g) => h('div', { class: 'act-group' },
        h('span', { class: 'act-group-label' }, g.group),
        g.items.map((a) => {
          const chip = h('button', { class: 'chip', type: 'button', 'data-id': a.id }, a.label);
          chip.addEventListener('click', () => {
            activity = activity === a.id ? null : a.id;
            sync();
            if (activity) input.focus();
          });
          chips.push(chip);
          return chip;
        }))));

    function sync() {
      detail = input.value.trim();
      task = composeTask();
      for (const c of chips) c.setAttribute('aria-pressed', String(c.dataset.id === activity));
      input.placeholder = activity ? ACTIVITY[activity].ask : 'Or describe it';
      startBtn.disabled = !activity && detail.length < 2;
    }
    input.addEventListener('input', sync);
    input.addEventListener('keydown', (e) => { if (e.key === 'Enter' && !startBtn.disabled) startBtn.click(); });
    sync();

    const actions = h('div', { class: 'intro-actions' }, startBtn);
    startBtn.addEventListener('click', () => {
      if (repeat === 0) return startRound();
      actions.replaceChildren(renderFriction(repeat));
    });

    show(shell(
      h('h1', { class: 'title' }, 'What am I doing right now?'),
      picker,
      input,
      actions,
    ));

    // On a new tab, leave focus in the address bar so normal browsing is untouched.
    if (SURFACE !== 'newtab') (activity ? input : chips[0]).focus({ focusVisible: false });
  }

  // Escalating friction: round 2 asks first, round 3+ also makes you wait.
  function renderFriction(repeat) {
    const wait = Math.min((repeat - 1) * CONFIG.FRICTION_DELAY_S, CONFIG.FRICTION_DELAY_MAX_S);
    const play = h('button', { class: 'btn btn-ghost', type: 'button' });
    let left = wait;
    const tick = () => {
      play.textContent = left > 0 ? `Play anyway (${left})` : 'Play anyway';
      play.disabled = left > 0;
    };
    tick();
    const timer = left > 0 && setInterval(() => { left--; tick(); if (left <= 0) clearInterval(timer); }, 1000);
    play.addEventListener('click', () => { clearInterval(timer); startRound(); });

    const back = h('button', { class: 'btn btn-go', type: 'button' }, 'Back to work', arrow());
    back.addEventListener('click', async (e) => {
      clearInterval(timer);
      declines.push(Date.now());
      await Store.set(K.declines, declines.slice(-2000));
      eject(e.currentTarget);
    });

    const node = h('div', { class: 'friction' },
      h('p', { class: 'friction-text' }, `Round ${repeat + 1} this sitting.`),
      back,
      play);
    queueMicrotask(() => back.focus({ focusVisible: false }));
    return node;
  }

  // ---- Game ----------------------------------------------------------------
  let round = null;

  function shuffle(a) {
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function startRound() {
    // Equal share from each category, remainder from whatever is left.
    const per = Math.floor(CONFIG.PAIRS / Object.keys(CATS).length);
    let picks = Object.keys(CATS).flatMap((c) => shuffle(CARDS.filter((x) => x.cat === c)).slice(0, per));
    picks = picks.concat(shuffle(CARDS.filter((x) => !picks.includes(x))).slice(0, CONFIG.PAIRS - picks.length));
    const deck = shuffle([...picks, ...picks]).map((card) => ({ card, open: false, matched: false }));

    const session = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      task, activity, detail, surface: SURFACE,
      startedAt: Date.now(), endedAt: null, pairsFound: 0, pairsTotal: CONFIG.PAIRS,
      cleared: false, outcome: null, returnedAt: null,
    };
    sessions.push(session);
    saveSessions();

    round = { deck, session, first: null, lock: false, found: 0, over: false, start: null, raf: 0 };

    const grid = h('div', { class: 'grid', 'aria-label': 'Memory cards' });
    for (const d of deck) {
      d.el = h('button', {
        class: 'card', type: 'button', 'data-cat': d.card.cat, 'aria-label': 'Hidden card',
        onclick: () => flip(d),
      },
      h('span', { class: 'card-inner' },
        h('span', { class: 'card-face card-back' }),
        h('span', { class: 'card-face card-front' },
          h('span', { class: 'card-cat' }, CATS[d.card.cat]),
          h('span', { class: 'card-icon', html: svgIcon(d.card) }),
          h('span', { class: 'card-name' }, d.card.name),
          h('span', { class: 'card-formula', html: d.card.formula }))));
      grid.append(d.el);
    }

    round.bar = h('div', { class: 'timer-fill' });
    round.secs = h('span', { class: 'timer-secs' }, `${CONFIG.ROUND_SECONDS}s`);
    round.count = h('span', { class: 'pairs-count' }, `0/${CONFIG.PAIRS}`);

    show(h('div', { class: 'game' },
      h('div', { class: 'game-top' },
        h('span', { class: 'task-chip', title: task }, task),
        round.secs),
      h('div', { class: 'timer' }, round.bar),
      grid,
      h('div', { class: 'legend' },
        Object.entries(CATS).map(([k, label]) => h('span', { class: 'legend-item', 'data-cat': k }, label)),
        round.count)), { hideStats: true });
  }

  function tickTimer() {
    if (!round || round.over) return;
    const left = Math.max(0, CONFIG.ROUND_SECONDS - (performance.now() - round.start) / 1000);
    round.bar.style.transform = `scaleX(${left / CONFIG.ROUND_SECONDS})`;
    round.bar.classList.toggle('urgent', left <= 10);
    round.secs.textContent = `${Math.ceil(left)}s`;
    round.secs.classList.toggle('urgent', left <= 10);
    if (left <= 0) return endRound(false);
    round.raf = requestAnimationFrame(tickTimer);
  }

  function setOpen(d, open) {
    d.open = open;
    d.el.classList.toggle('open', open);
    d.el.setAttribute('aria-label', open || d.matched ? d.card.name : 'Hidden card');
  }

  function flip(d) {
    if (!round || round.over || round.lock || d.open || d.matched) return;
    if (round.start === null) { round.start = performance.now(); tickTimer(); }
    Sound.play('flip');
    setOpen(d, true);

    if (!round.first) { round.first = d; return; }

    const a = round.first;
    round.first = null;
    if (a.card.id === d.card.id) {
      for (const x of [a, d]) { x.matched = true; x.el.classList.add('matched'); x.el.disabled = true; }
      round.found++;
      round.count.textContent = `${round.found}/${CONFIG.PAIRS}`;
      Sound.play('match');
      if (round.found === CONFIG.PAIRS) endRound(true);
    } else {
      round.lock = true;
      for (const x of [a, d]) x.el.classList.add('miss');
      setTimeout(() => {
        for (const x of [a, d]) { x.el.classList.remove('miss'); setOpen(x, false); }
        if (round) round.lock = false;
      }, CONFIG.MISMATCH_MS);
    }
  }

  async function endRound(cleared) {
    if (round.over) return;
    round.over = true;
    cancelAnimationFrame(round.raf);
    const elapsed = Math.min(CONFIG.ROUND_SECONDS, Math.round((performance.now() - round.start) / 1000));
    const { session, found } = round;
    await updateSession(session.id, { endedAt: Date.now(), pairsFound: found, cleared });
    Sound.play(cleared ? 'clear' : 'timeup');
    setTimeout(() => renderEnd(session, cleared, found, elapsed), cleared ? 550 : 250);
  }

  // ---- End: the eject --------------------------------------------------------
  function renderEnd(session, cleared, found, elapsed) {
    const back = h('button', { class: 'btn btn-go btn-xl', type: 'button' }, 'Back to work', arrow());
    back.addEventListener('click', async (e) => {
      await updateSession(session.id, { outcome: 'returned', returnedAt: Date.now() });
      eject(e.currentTarget);
    });

    const again = h('button', { class: 'link-quiet', type: 'button' }, 'One more round');
    again.addEventListener('click', async () => {
      await updateSession(session.id, { outcome: 'replayed' });
      round = null;
      renderIntro();
    });

    show(shell(
      h('p', { class: 'meta' }, cleared ? `${found}/${CONFIG.PAIRS} pairs in ${elapsed}s` : `Time's up · ${found}/${CONFIG.PAIRS} pairs`),
      h('p', { class: 'you-were-label' }, 'You were'),
      h('p', { class: 'you-were-task' }, session.task),
      back,
      h('div', { class: 'again-row' }, again),
    ), { hideStats: true });
    back.focus({ focusVisible: false });
  }

  // Leave: close the popup or new tab, or show the done screen on the web.
  async function eject(fromEl) {
    burst(fromEl);
    round = null;
    Sound.play('return');

    if (SURFACE === 'popup') {
      setTimeout(() => window.close(), 450);
      return renderDone();
    }
    if (SURFACE === 'newtab' && hasChrome && chrome.tabs) {
      try {
        const tabs = await chrome.tabs.query({ currentWindow: true });
        const me = await chrome.tabs.getCurrent();
        // Closing the only tab would close the window, so keep it open instead.
        if (me && tabs.length > 1) {
          setTimeout(() => chrome.tabs.remove(me.id), 450);
          return renderDone();
        }
      } catch { /* fall through */ }
    }
    setTimeout(renderDone, 350);
  }

  function renderDone() {
    const again = h('button', { class: 'link-quiet', type: 'button' }, 'New round');
    again.addEventListener('click', () => { task = detail = ''; activity = null; renderIntro(); });
    show(shell(
      h('div', { class: 'done-mark', html:
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>' }),
      h('p', { class: 'done-task' }, task),
      h('div', { class: 'again-row' }, again),
    ));
  }

  const SPARK_COLORS = ['#18181b', '#52525b', '#a1a1aa', '#d4d4d8'];

  // Small burst on the exit button: the reward belongs to returning, not to playing.
  function burst(el) {
    if (!el || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const r = el.getBoundingClientRect();
    const cx = r.left + r.width / 2;
    const cy = r.top + r.height / 2;
    for (let i = 0; i < 22; i++) {
      const p = h('span', { class: 'spark' });
      const ang = (Math.PI * 2 * i) / 22 + Math.random() * 0.4;
      const dist = 50 + Math.random() * 60;
      p.style.cssText = `left:${cx}px;top:${cy}px;background:${SPARK_COLORS[i % SPARK_COLORS.length]};` +
        `--dx:${Math.cos(ang) * dist}px;--dy:${Math.sin(ang) * dist}px`;
      document.body.append(p);
      setTimeout(() => p.remove(), 700);
    }
  }

  // ---- Stats: returns to work over 7 or 30 days ------------------------------
  const fmtDay = (t, opts) => new Date(t).toLocaleDateString(undefined, opts);

  function renderStats() {
    const today = todayCount();
    todayEl.textContent = `${today} today`;
    todayEl.hidden = !today;

    if (!sessions.length && !declines.length) return statsEl.replaceChildren();

    const range = settings.range === 30 ? 30 : 7;
    const s = stats(range);

    const seg = h('div', { class: 'seg', role: 'tablist', 'aria-label': 'Range' },
      [7, 30].map((n) => h('button', {
        class: 'seg-btn', type: 'button', role: 'tab', 'aria-selected': String(n === range),
        onclick: () => { settings.range = n; Store.set(K.settings, settings); renderStats(); },
      }, n === 7 ? 'Week' : 'Month')));

    const max = Math.max(1, ...s.days.map((d) => d.count));
    const chart = h('div', { class: `chart chart-${range}`, role: 'img',
      'aria-label': `Returns to work per day, last ${range} days` },
      s.days.map((d) => h('div', {
        class: `chart-col${d.today ? ' today' : ''}`,
        title: `${fmtDay(d.start, { weekday: 'short', month: 'short', day: 'numeric' })}: ${d.count}`,
      },
      h('div', { class: 'chart-bar-wrap' },
        h('div', { class: 'chart-bar', style: `height:${d.count ? 10 + (d.count / max) * 90 : 0}%` })),
      range === 7 && h('span', { class: 'chart-label' }, fmtDay(d.start, { weekday: 'narrow' })))));

    const axis = range === 30 && h('div', { class: 'chart-axis' },
      h('span', {}, fmtDay(s.days[0].start, { month: 'short', day: 'numeric' })),
      h('span', {}, 'Today'));

    const recent = [...sessions].reverse().slice(0, 10);
    const history = recent.length > 0 && h('details', { class: 'history' },
      h('summary', {}, 'History'),
      h('ul', {}, recent.map((x) => h('li', {},
        h('span', { class: `dot${x.outcome === 'returned' ? ' ok' : ''}`,
          title: x.outcome === 'returned' ? 'Returned' : 'Did not return' }),
        h('span', { class: 'history-task' }, x.task),
        h('span', { class: 'history-time' }, timeAgo(x.startedAt))))));

    statsEl.replaceChildren(
      h('div', { class: 'stats-head' }, h('span', { class: 'stats-title' }, 'Back to work'), seg),
      h('div', { class: 'tiles' },
        tile('Returns', s.returned),
        tile('Return rate', s.rate == null ? '-' : `${s.rate}%`),
        tile('Rounds per sitting', s.perSitting ?? '-')),
      chart,
      axis || '',
      history || '');
  }
  const tile = (label, value) =>
    h('div', { class: 'tile' }, h('span', { class: 'tile-value' }, String(value)), h('span', { class: 'tile-label' }, label));

  load().then(renderIntro);
})();
