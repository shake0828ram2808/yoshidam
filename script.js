// =========================================================
// 共通
// =========================================================
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

// URL に ?todo を付けると、仮のままの場所を枠で囲んで表示する
if (/[?&]todo\b/.test(location.search)) {
  document.documentElement.classList.add('show-todo');
  const todos = [...document.querySelectorAll('[data-todo]')].map(el => el.dataset.todo);
  console.info(`仮のままの場所: ${todos.length}件\n- ` + todos.join('\n- '));
}

// =========================================================
// ナビ(モバイルの開閉)
// =========================================================
const navToggle = document.getElementById('navToggle');
const mainNav = document.getElementById('mainNav');

function setNavOpen(isOpen) {
  mainNav.classList.toggle('is-open', isOpen);
  navToggle.setAttribute('aria-expanded', String(isOpen));
  navToggle.setAttribute('aria-label', isOpen ? 'メニューを閉じる' : 'メニューを開く');
}
navToggle.addEventListener('click', () => setNavOpen(!mainNav.classList.contains('is-open')));
mainNav.querySelectorAll('a').forEach(link => link.addEventListener('click', () => setNavOpen(false)));
document.addEventListener('keydown', e => { if (e.key === 'Escape') setNavOpen(false); });

// =========================================================
// 現在地の表示(ヘッダーの下線・右端のドット)
// =========================================================
const sections = [...document.querySelectorAll('main > section[id]')];
const navLinks = [...mainNav.querySelectorAll('a')];
const indicator = mainNav.querySelector('.nav-indicator');
const dotNav = document.getElementById('dotNav');

sections.forEach(sec => {
  const a = document.createElement('a');
  a.href = `#${sec.id}`;
  a.dataset.target = sec.id;
  a.setAttribute('aria-label', sec.dataset.label || sec.id);
  a.innerHTML = `<span class="dot-label">${sec.dataset.label || sec.id}</span>`;
  dotNav.appendChild(a);
});
const dots = [...dotNav.querySelectorAll('a')];

function moveIndicator(link) {
  if (!link) { indicator.classList.remove('is-on'); return; }
  indicator.style.left = `${link.offsetLeft}px`;
  indicator.style.width = `${link.offsetWidth}px`;
  indicator.classList.add('is-on');
}

let currentId = null;
function setCurrent(id) {
  if (id === currentId) return;
  currentId = id;
  // Skills はヘッダーに無いので、ひとつ前の About を現在地として扱う
  const navId = id === 'skills' ? 'about' : id;
  let active = null;
  navLinks.forEach(a => {
    const on = a.getAttribute('href') === `#${navId}`;
    a.classList.toggle('is-current', on);
    if (on) { a.setAttribute('aria-current', 'location'); active = a; } else a.removeAttribute('aria-current');
  });
  moveIndicator(active);
  dots.forEach(d => {
    const on = d.dataset.target === id;
    d.classList.toggle('is-current', on);
    if (on) d.classList.add('is-seen');
  });
}
window.addEventListener('resize', () => moveIndicator(mainNav.querySelector('a.is-current')));

// =========================================================
// スクロールに合わせた処理(1フレームにまとめる)
// =========================================================
const header = document.getElementById('siteHeader');
const progress = document.getElementById('scrollProgress');
const kidsZone = document.querySelector('.kids-zone');
const timeline = document.querySelector('.timeline');
const timelineItems = timeline ? [...timeline.querySelectorAll('.timeline-item')] : [];

// スクロールのたびに呼ぶ処理(下の各ブロックで登録する)
const scrollHooks = [];

let ticking = false;
function onScroll() {
  const y = window.scrollY;
  const vh = window.innerHeight;
  const max = document.documentElement.scrollHeight - vh;

  header.classList.toggle('is-scrolled', y > 20);
  progress.style.setProperty('--p', max > 0 ? (y / max).toFixed(4) : 0);

  // 画面の上から 35% の位置にあるセクションを「現在地」にする
  const probe = y + vh * 0.35;
  let current = sections[0];
  for (const sec of sections) { if (sec.offsetTop <= probe) current = sec; }
  setCurrent(y + vh >= document.documentElement.scrollHeight - 4 ? sections[sections.length - 1].id : current.id);

  dotNav.classList.toggle('is-visible', y > vh * 0.6);
  if (kidsZone) {
    const r = kidsZone.getBoundingClientRect();
    dotNav.classList.toggle('on-light', r.top < vh / 2 && r.bottom > vh / 2);
  }

  // 経歴の縦線を、読み進めた分だけ伸ばす
  if (timeline) {
    const r = timeline.getBoundingClientRect();
    const t = Math.min(1, Math.max(0, (vh * 0.65 - r.top) / r.height));
    timeline.style.setProperty('--tl', t.toFixed(3));
    timelineItems.forEach(item => {
      item.classList.toggle('is-lit', item.getBoundingClientRect().top + 10 < vh * 0.65);
    });
  }
  scrollHooks.forEach(fn => fn(y, vh));
  ticking = false;
}
function requestTick() {
  if (!ticking) { requestAnimationFrame(onScroll); ticking = true; }
}
window.addEventListener('scroll', requestTick, { passive: true });
window.addEventListener('resize', requestTick);

// =========================================================
// スクロールのヒント: 何もしないで3秒たったら出す
// =========================================================
const scrollHint = document.getElementById('scrollHint');
let hintTimer = setTimeout(() => { if (window.scrollY < 40) scrollHint.classList.add('is-shown'); }, 3000);
window.addEventListener('scroll', () => {
  if (window.scrollY > 40) { scrollHint.classList.remove('is-shown'); clearTimeout(hintTimer); }
}, { passive: true });

// =========================================================
// 表示されたらふわっと出す
// =========================================================
const revealGroups = [
  '.timeline-item', '.skill-group', '.case-card', '.project-card--calm',
  '.project-card--kids', '.character-card', '.cert-badge', '.note-card',
  '.section-lead', '.about-grid'
];
const io = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('is-visible');
      io.unobserve(entry.target);
    }
  });
}, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });

revealGroups.forEach(sel => {
  document.querySelectorAll(sel).forEach(el => {
    el.classList.add('reveal');
    // 同じ並びの兄弟の中で、順番に少しずつ遅らせる
    const idx = [...el.parentElement.children].indexOf(el);
    el.style.transitionDelay = `${Math.min(idx, 4) * 80}ms`;
    io.observe(el);
  });
});

// =========================================================
// ヒーローの演出(数字のカウントアップ)
// =========================================================
function countUp(el) {
  const to = Number(el.dataset.count);
  if (reduceMotion || !to) { el.textContent = to; return; }
  const dur = 1400;
  const start = performance.now();
  el.textContent = '0';
  const step = now => {
    const t = Math.min(1, (now - start) / dur);
    const eased = 1 - Math.pow(1 - t, 4);
    el.textContent = Math.round(to * eased);
    if (t < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}
// ヒーローの登場アニメ(0.9秒後)に合わせて数え始める
document.querySelectorAll('.hero [data-count]').forEach(el => {
  el.textContent = reduceMotion ? el.dataset.count : '0';
  setTimeout(() => countUp(el), 1000);
});

// =========================================================
// ポインターの演出(マウス操作の端末だけ)
// =========================================================
if (finePointer && !reduceMotion) {
  // 磁石ボタン: カーソルに少し吸い寄せられる
  document.querySelectorAll('.magnetic').forEach(el => {
    el.addEventListener('pointermove', e => {
      const r = el.getBoundingClientRect();
      const dx = (e.clientX - (r.left + r.width / 2)) * 0.25;
      const dy = (e.clientY - (r.top + r.height / 2)) * 0.35;
      el.style.transform = `translate(${dx}px, ${dy}px)`;
    });
    el.addEventListener('pointerleave', () => {
      el.style.transition = 'transform .5s cubic-bezier(.34,1.56,.64,1)';
      el.style.transform = '';
      setTimeout(() => { el.style.transition = ''; }, 500);
    });
  });

  // ケーススタディのカード: ポインターの位置にほのかな光
  document.querySelectorAll('.case-card').forEach(card => {
    card.addEventListener('pointermove', e => {
      const r = card.getBoundingClientRect();
      card.style.setProperty('--mx', `${e.clientX - r.left}px`);
      card.style.setProperty('--my', `${e.clientY - r.top}px`);
    });
  });
}

// =========================================================
// キャラクター
// =========================================================
// ピコ: つつくと「？」が「！」になって、びよんと伸びる
const pikoButton = document.getElementById('pikoButton');
const piko = pikoButton && pikoButton.querySelector('.piko');
if (piko) {
  let pikoTimer;
  pikoButton.addEventListener('click', () => {
    piko.classList.remove('is-boing');
    void piko.getBoundingClientRect(); // アニメを最初から再生しなおす
    piko.classList.add('is-boing', 'is-surprised');
    clearTimeout(pikoTimer);
    pikoTimer = setTimeout(() => piko.classList.remove('is-surprised'), 1200);
  });
  piko.addEventListener('animationend', e => {
    if (e.animationName === 'piko-boing') piko.classList.remove('is-boing');
  });
}

// だんごむし: つつくと丸まって、ころんと転がる。少したつと元に戻る
const dangoButton = document.getElementById('dangoButton');
if (dangoButton) {
  let dangoTimer;
  dangoButton.addEventListener('click', () => {
    const wasCurled = dangoButton.classList.contains('is-curled');
    dangoButton.classList.add('is-curled');
    if (wasCurled) {
      dangoButton.classList.remove('is-rolling');
      void dangoButton.offsetWidth;
      dangoButton.classList.add('is-rolling');
    }
    clearTimeout(dangoTimer);
    dangoTimer = setTimeout(() => dangoButton.classList.remove('is-curled', 'is-rolling'), 2600);
  });
}

// ねむひつじ: スカーフの色を切り替える(2枚の画像をクロスフェード)
const nemuVisual = document.querySelector('.character-visual--nemu');
const nemuButtons = document.querySelectorAll('.nemu-btn');
nemuButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    nemuButtons.forEach(b => {
      const on = b === btn;
      b.classList.toggle('is-active', on);
      b.setAttribute('aria-pressed', String(on));
    });
    nemuVisual.dataset.scarf = btn.dataset.scarf;
  });
});

// =========================================================
// 空: スクロールに合わせて 夜→夜明け→昼→夕方→夜
// =========================================================
// ページ内の目印ごとの「時間の進み具合(0〜1)」
const SKY_ANCHORS = [
  ['hero', 0], ['about', 0.16], ['skills', 0.28], ['works', 0.42],
  ['projects', 0.56], ['kidsZone', 0.70], ['characters', 0.82],
  ['certifications', 0.90], ['notes', 0.95], ['contact', 1],
];
// 時間の進み具合ごとの空の色。文字が読めるよう、どれも暗めにしてある
const SKY_KEYS = [
  { at: 0.00, top: '#14131A', bottom: '#1C1A17', stars: 1.0, glow: '#C97B63', glowA: 0.00, hour: 2.0 },
  { at: 0.30, top: '#171826', bottom: '#221E24', stars: 0.7, glow: '#C97B63', glowA: 0.10, hour: 4.0 },
  { at: 0.45, top: '#1D2033', bottom: '#2E2326', stars: 0.2, glow: '#E39A6E', glowA: 0.45, hour: 5.5 },
  { at: 0.60, top: '#1F2A38', bottom: '#24252A', stars: 0.0, glow: '#F3D27A', glowA: 0.22, hour: 9.0 },
  { at: 0.72, top: '#223040', bottom: '#23272B', stars: 0.0, glow: '#F3D27A', glowA: 0.15, hour: 12.0 },
  { at: 0.84, top: '#2A2032', bottom: '#2C1E1E', stars: 0.1, glow: '#E07A4F', glowA: 0.50, hour: 17.5 },
  { at: 0.93, top: '#18172A', bottom: '#1E1A1C', stars: 0.5, glow: '#C97B63', glowA: 0.15, hour: 19.5 },
  { at: 1.00, top: '#14131A', bottom: '#1C1A17', stars: 1.0, glow: '#C97B63', glowA: 0.00, hour: 22.0 },
];
// 月と太陽が出ている区間
const SUN_FROM = 0.38;
const SUN_TO = 0.86;

const sky = document.getElementById('sky');
const skyBody = document.getElementById('skyBody');
const skyStars = document.getElementById('skyStars');
const skyClockText = document.getElementById('skyClockText');
const skyClockIcon = document.getElementById('skyClockIcon');
const MOON_PATH = 'M15.5 3.2A9 9 0 1 0 20.8 15 7.2 7.2 0 0 1 15.5 3.2z';
const SUN_PATH = 'M12 7a5 5 0 1 0 0 10 5 5 0 0 0 0-10zM11 1h2v3h-2zM11 20h2v3h-2zM1 11h3v2H1zM20 11h3v2h-3zM4.2 5.6l1.4-1.4 2.1 2.1-1.4 1.4zM16.3 17.7l1.4-1.4 2.1 2.1-1.4 1.4zM4.2 18.4l2.1-2.1 1.4 1.4-2.1 2.1zM16.3 6.3l2.1-2.1 1.4 1.4-2.1 2.1z';

{
  const frag = document.createDocumentFragment();
  for (let i = 0; i < 70; i++) {
    const st = document.createElement('i');
    st.style.left = `${Math.random() * 100}%`;
    st.style.top = `${Math.random() * 75}%`;
    st.style.setProperty('--s', `${Math.random() < 0.15 ? 2.6 : 1.4}px`);
    st.style.setProperty('--t', `${3 + Math.random() * 4}s`);
    st.style.setProperty('--delay', `${-Math.random() * 6}s`);
    st.style.setProperty('--o', (0.3 + Math.random() * 0.5).toFixed(2));
    frag.appendChild(st);
  }
  skyStars.appendChild(frag);
}

const hexToRgb = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16));
const lerp = (a, b, t) => a + (b - a) * t;
const mixHex = (a, b, t) => {
  const A = hexToRgb(a), B = hexToRgb(b);
  return `rgb(${A.map((v, i) => Math.round(lerp(v, B[i], t))).join(',')})`;
};
const clamp01 = v => Math.min(1, Math.max(0, v));

function skyPhase(y, vh) {
  const probe = y + vh * 0.5;
  const pts = SKY_ANCHORS
    .map(([id, ph]) => { const el = document.getElementById(id); return el ? [el.getBoundingClientRect().top + y, ph] : null; })
    .filter(Boolean);
  if (probe <= pts[0][0]) return 0;
  for (let i = 0; i < pts.length - 1; i++) {
    const [y0, p0] = pts[i], [y1, p1] = pts[i + 1];
    if (probe < y1) return lerp(p0, p1, (probe - y0) / (y1 - y0));
  }
  // ページの最後まで来たら 1(夜)にする
  const max = document.documentElement.scrollHeight - vh;
  const last = pts[pts.length - 1];
  return y >= max - 2 ? 1 : lerp(last[1], 1, clamp01((probe - last[0]) / vh));
}

function formatHour(h) {
  const total = Math.round(h * 6) * 10; // 10分刻み
  const hh = Math.floor(total / 60) % 24;
  const mm = String(total % 60).padStart(2, '0');
  return `${hh < 12 ? '午前' : '午後'} ${hh % 12 === 0 && hh >= 12 ? 12 : hh % 12}:${mm}`;
}

let lastClock = '';
scrollHooks.push((y, vh) => {
  const ph = skyPhase(y, vh);
  let k = SKY_KEYS.length - 2;
  for (let i = 0; i < SKY_KEYS.length - 1; i++) { if (ph <= SKY_KEYS[i + 1].at) { k = i; break; } }
  const a = SKY_KEYS[k], b = SKY_KEYS[k + 1];
  const t = clamp01((ph - a.at) / (b.at - a.at));
  const top = mixHex(a.top, b.top, t);
  const bottom = mixHex(a.bottom, b.bottom, t);
  sky.style.setProperty('--sky-top', top);
  sky.style.setProperty('--sky-bottom', bottom);
  document.body.style.setProperty('--sky-bottom', bottom);
  sky.style.setProperty('--stars', lerp(a.stars, b.stars, t).toFixed(3));
  sky.style.setProperty('--glow', mixHex(a.glow, b.glow, t));
  sky.style.setProperty('--glow-a', lerp(a.glowA, b.glowA, t).toFixed(3));

  // 月・太陽の位置(画面に対する割合)
  const W = window.innerWidth;
  let x, yy, isSun = false;
  if (ph < SUN_FROM) {           // 月が右下へ沈む
    const u = ph / SUN_FROM;
    // スマホでは見出しと重ならないよう、右上の端に寄せる
    const narrow = W < 600;
    x = lerp(narrow ? 0.88 : 0.82, 1.08, u); yy = lerp(narrow ? 0.1 : 0.18, 0.95, u * u);
  } else if (ph < SUN_TO) {      // 太陽が左から昇って右へ沈む
    const u = (ph - SUN_FROM) / (SUN_TO - SUN_FROM);
    x = lerp(-0.06, 1.06, u); yy = 1.0 - Math.sin(Math.PI * u) * 0.85;
    isSun = true;
  } else {                       // 月が左下から昇る
    const u = (ph - SUN_TO) / (1 - SUN_TO);
    x = lerp(-0.06, 0.16, u); yy = lerp(0.95, 0.2, Math.sqrt(u));
  }
  skyBody.style.transform = `translate(${(x * W).toFixed(1)}px, ${(yy * vh).toFixed(1)}px)`;
  skyBody.classList.toggle('is-sun', isSun);

  const clock = formatHour(lerp(a.hour, b.hour, t));
  if (clock !== lastClock) {
    lastClock = clock;
    skyClockText.textContent = clock;
    skyClockIcon.setAttribute('d', isSun ? SUN_PATH : MOON_PATH);
  }
});

// =========================================================
// 見出しを1文字ずつ出す
// =========================================================
document.querySelectorAll('.section-title, [data-split]').forEach(el => {
  const text = el.textContent.trim();
  el.setAttribute('aria-label', text);
  el.innerHTML = `<span aria-hidden="true">${[...text].map((c, i) =>
    `<span class="split-ch" style="--i:${i}">${c === ' ' ? '&nbsp;' : c}</span>`).join('')}</span>`;
  el.classList.add('is-split');
  io.observe(el);
});

// =========================================================
// 子ども向けゾーン: ガーランド・ふちを歩くだんごむし・飾りの視差
// =========================================================
const kidsZoneEl = document.getElementById('kidsZone');
if (kidsZoneEl) {
  // ガーランドの旗を、ひもの曲線にそって並べる
  const flagsEl = document.getElementById('buntingFlags');
  const FLAG_COLORS = ['#F4A9A8', '#F3D27A', '#B8D8A8', '#A8D4E0', '#C97B63'];
  const FLAGS = 15;
  for (let i = 0; i < FLAGS; i++) {
    const u = (i + 0.5) / FLAGS;
    // ひもは 二次ベジエ (0,8)→(720,96)→(1440,8)。viewBox 高さ120 を 70px に縮めている
    const yv = (1 - u) * (1 - u) * 8 + 2 * (1 - u) * u * 96 + u * u * 8;
    const slope = 2 * (1 - u) * (96 - 8) + 2 * u * (8 - 96); // dy/du
    const li = document.createElement('li');
    li.style.left = `${u * 100}%`;
    li.style.top = `${(yv / 120) * 70}px`;
    li.style.setProperty('--i', i);
    // 旗は、ひもの傾きにあわせて少し傾ける(画面幅はおよそ1200pxとして計算)
    li.style.setProperty('--r', `${(Math.atan2(slope * 70 / 120, 1200) * 180 / Math.PI).toFixed(1)}deg`);
    li.style.background = FLAG_COLORS[i % FLAG_COLORS.length];
    flagsEl.appendChild(li);
  }

  const zoneIO = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) { kidsZoneEl.classList.add('is-entered'); zoneIO.disconnect(); } });
  }, { threshold: 0.05 });
  zoneIO.observe(kidsZoneEl);

  // だんごむしは、波の線の上を歩く。スクロール量 = 歩いた距離
  const wavePath = document.getElementById('kidsWavePath');
  const waveSvg = wavePath.ownerSVGElement;
  const edgeDango = document.getElementById('edgeDango');
  const VB_W = 1440, VB_H = 90;
  const samples = [];
  {
    const len = wavePath.getTotalLength();
    for (let i = 0; i <= 400; i++) {
      const pt = wavePath.getPointAtLength((len * i) / 400);
      if (pt.y < VB_H - 0.5 && pt.x > 0 && pt.x < VB_W) samples.push(pt); // 上側の曲線だけ
    }
    samples.sort((a, b) => a.x - b.x);
  }
  function waveYAt(xv) {
    let lo = 0, hi = samples.length - 1;
    while (hi - lo > 1) { const m = (lo + hi) >> 1; if (samples[m].x < xv) lo = m; else hi = m; }
    const A = samples[lo], B = samples[hi];
    return lerp(A.y, B.y, clamp01((xv - A.x) / ((B.x - A.x) || 1)));
  }

  let lastY = window.scrollY, walkTimer, facing = 1;
  const decos = [...kidsZoneEl.querySelectorAll('.deco')];
  scrollHooks.push((y, vh) => {
    const r = kidsZoneEl.getBoundingClientRect();
    // ゾーンの上端が画面の下から上まで動く間に、左端から右端まで歩く
    const u = clamp01((vh - r.top) / (vh * 0.9));
    const w = waveSvg.clientWidth, h = waveSvg.clientHeight;
    const xv = lerp(60, VB_W - 60, u);
    const yPx = (waveYAt(xv) / VB_H) * h;
    const ang = Math.atan2(((waveYAt(xv + 8) - waveYAt(xv - 8)) / VB_H) * h, (16 / VB_W) * w) * 180 / Math.PI;
    if (y !== lastY) facing = y > lastY ? 1 : -1;
    edgeDango.style.transform = `translate(${(xv / VB_W) * w}px, ${yPx}px) rotate(${ang.toFixed(1)}deg) scaleX(${facing})`;
    if (!reduceMotion && y !== lastY && r.top < vh && r.bottom > 0) {
      edgeDango.classList.add('is-walking');
      clearTimeout(walkTimer);
      walkTimer = setTimeout(() => edgeDango.classList.remove('is-walking'), 160);
    }
    lastY = y;

    // 飾りは、奥行き(--depth)に合わせて少しずつずれる
    if (!reduceMotion && r.top < vh && r.bottom > 0) {
      const ky = ((vh - r.top) / (vh + r.height)).toFixed(3);
      decos.forEach(d => d.style.setProperty('--ky', ky));
    }
  });
}

// =========================================================
// カードを3Dで傾ける(マウス操作の端末だけ)
// =========================================================
if (finePointer && !reduceMotion) {
  const MAX_TILT = 6; // 度
  document.querySelectorAll('[data-tilt]').forEach(card => {
    card.addEventListener('pointerenter', () => { card.classList.remove('is-tilt-out'); card.classList.add('is-tilting'); });
    card.addEventListener('pointermove', e => {
      const r = card.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width;
      const py = (e.clientY - r.top) / r.height;
      card.style.setProperty('--ry', `${((px - 0.5) * 2 * MAX_TILT).toFixed(2)}deg`);
      card.style.setProperty('--rx', `${((0.5 - py) * 2 * MAX_TILT).toFixed(2)}deg`);
      card.style.setProperty('--gx', `${(px * 100).toFixed(1)}%`);
      card.style.setProperty('--gy', `${(py * 100).toFixed(1)}%`);
    });
    card.addEventListener('pointerleave', () => {
      card.classList.remove('is-tilting');
      card.classList.add('is-tilt-out');
      card.style.setProperty('--rx', '0deg');
      card.style.setProperty('--ry', '0deg');
    });
  });

  // ピコの目が、ポインターのほうを見る
  const pikoLook = document.querySelector('.piko-look');
  if (pikoLook) {
    window.addEventListener('pointermove', e => {
      const r = pikoButton.getBoundingClientRect();
      if (r.bottom < 0 || r.top > window.innerHeight) return;
      const dx = e.clientX - (r.left + r.width / 2);
      const dy = e.clientY - (r.top + r.height / 2);
      const d = Math.hypot(dx, dy) || 1;
      const k = Math.min(1, d / 300) * 3; // 最大3(SVGの単位)
      pikoLook.style.transform = `translate(${(dx / d * k).toFixed(2)}px, ${(dy / d * k).toFixed(2)}px)`;
    }, { passive: true });
  }

  // ヒーローの光の玉が、ポインターに少しついてくる
  const orb = document.querySelector('.hero-orb');
  const hero = document.getElementById('hero');
  if (orb) {
    hero.addEventListener('pointermove', e => {
      const dx = (e.clientX / window.innerWidth - 0.5) * 60;
      const dy = (e.clientY / window.innerHeight - 0.5) * 40;
      orb.style.translate = `${dx.toFixed(1)}px ${dy.toFixed(1)}px`;
    });
  }
}

// ねむひつじ: スカーフを切り替えたら、その色で きらきら
nemuButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    if (reduceMotion) return;
    const wrap = document.querySelector('.nemu-wrap');
    const color = btn.dataset.scarf === 'blue' ? '#8FB5CA' : '#E39A86';
    for (let i = 0; i < 10; i++) {
      const sp = document.createElement('span');
      const ang = (Math.PI * 2 * i) / 10 + Math.random() * 0.4;
      const dist = 50 + Math.random() * 30;
      sp.className = 'sparkle';
      sp.style.setProperty('--c', i % 3 === 0 ? '#F3D27A' : color);
      sp.style.setProperty('--dx', `${Math.cos(ang) * dist}px`);
      sp.style.setProperty('--dy', `${Math.sin(ang) * dist}px`);
      wrap.appendChild(sp);
      sp.addEventListener('animationend', () => sp.remove());
    }
  });
});

onScroll();
