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
  document.documentElement.classList.toggle('nav-open', isOpen);
  navToggle.setAttribute('aria-expanded', String(isOpen));
  navToggle.setAttribute('aria-label', isOpen ? 'メニューを閉じる' : 'メニューを開く');
}
navToggle.addEventListener('click', () => setNavOpen(!mainNav.classList.contains('is-open')));
mainNav.querySelectorAll('a').forEach(link => link.addEventListener('click', () => setNavOpen(false)));
document.addEventListener('keydown', e => { if (e.key === 'Escape') setNavOpen(false); });

// =========================================================
// 現在地の表示(ヘッダーの下線・右端のドット)
// =========================================================
// メニューに出すセクション。data-group が付いたもの(経歴・スキル)は、そのグループ(About)の一部として扱う
const allSections = [...document.querySelectorAll('main > section[id]:not([hidden])')];
const sections = allSections.filter(sec => !sec.dataset.group);
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
  const navId = id;
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
let lastHeaderY = 0;
function onScroll() {
  const y = window.scrollY;
  const vh = window.innerHeight;
  const max = document.documentElement.scrollHeight - vh;

  header.classList.toggle('is-scrolled', y > 20);
  // 下へ読み進めている間はヘッダーを隠し、少しでも上へ戻ったら出す(メニューを開いているときは隠さない)
  if (Math.abs(y - lastHeaderY) > 6) {
    const hide = y > lastHeaderY && y > vh * 0.8 && !mainNav.classList.contains('is-open');
    header.classList.toggle('is-hidden', hide);
    lastHeaderY = y;
  }
  progress.style.setProperty('--p', max > 0 ? (y / max).toFixed(4) : 0);

  // 画面の上から 35% の位置にあるセクションを「現在地」にする
  const probe = y + vh * 0.35;
  let current = allSections[0];
  for (const sec of allSections) { if (sec.offsetTop <= probe) current = sec; }
  const curId = current.dataset.group || current.id;
  setCurrent(y + vh >= document.documentElement.scrollHeight - 4 ? sections[sections.length - 1].id : curId);

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
  '.project-card--kids', '.character-card', '.cert-row', '.note-card',
  '.section-lead', '.question'
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
// ピコ(SVG): つつくと「？」が「！」になって、びよんと伸びる
const pikoButton = document.getElementById('pikoButton');
const piko = pikoButton && pikoButton.querySelector('.piko');
let pikoTimer;
function pikoPoke() {
  if (!piko) return;
  piko.classList.remove('is-boing');
  void piko.getBoundingClientRect(); // アニメを最初から再生しなおす
  piko.classList.add('is-boing', 'is-surprised');
  clearTimeout(pikoTimer);
  pikoTimer = setTimeout(() => piko.classList.remove('is-surprised'), 1200);
}
if (piko) {
  pikoButton.addEventListener('click', pikoPoke);
  piko.addEventListener('animationend', e => {
    if (e.animationName === 'piko-boing') piko.classList.remove('is-boing');
  });
}

// ピコと仲間達: つつくと にっこり顔になって ぴょんと跳ねる。となりの子も少し遅れて つられて跳ねる
const pikoTrio = document.getElementById('pikoTrio');
const pikoPals = pikoTrio ? [...pikoTrio.querySelectorAll('.piko-pal')] : [];
function pikoHop(pal, happyMs) {
  pal.classList.remove('is-hop');
  void pal.offsetWidth; // アニメを最初から再生しなおす
  pal.classList.add('is-hop', 'is-happy');
  clearTimeout(pal._t);
  pal._t = setTimeout(() => pal.classList.remove('is-happy'), happyMs);
}
function pikoWave(fromIndex) {
  pikoPals.forEach((other, j) => {
    setTimeout(() => pikoHop(other, j === fromIndex ? 1400 : 900), 160 * Math.abs(fromIndex - j));
  });
}
pikoPals.forEach((pal, i) => {
  pal.addEventListener('click', () => {
    if (reduceMotion) pikoHop(pal, 1400); else pikoWave(i);
  });
  pal.addEventListener('animationend', e => { if (e.animationName === 'piko-hop') pal.classList.remove('is-hop'); });
});

// だんごむし: つつくと丸まって、もう一度で ころんと転がる。少したつと元に戻る
const dangoButton = document.getElementById('dangoButton');
let dangoTimer;
function dangoPoke() {
  if (!dangoButton) return;
  const wasCurled = dangoButton.classList.contains('is-curled');
  dangoButton.classList.add('is-curled');
  if (wasCurled) {
    dangoButton.classList.remove('is-rolling');
    void dangoButton.offsetWidth;
    dangoButton.classList.add('is-rolling');
  }
  clearTimeout(dangoTimer);
  dangoTimer = setTimeout(() => dangoButton.classList.remove('is-curled', 'is-rolling'), 2600);
}
dangoButton?.addEventListener('click', dangoPoke);

// ハチ: さわると(または見えたら)急降下する
const bee = document.querySelector('.bee');
function beeDive() {
  if (!bee) return;
  bee.classList.remove('is-dive');
  void bee.offsetWidth;
  bee.classList.add('is-dive');
}
bee?.addEventListener('animationend', e => { if (e.animationName === 'bee-dive') bee.classList.remove('is-dive'); });
bee?.parentElement.addEventListener('click', beeDive);

// ねむひつじ: スカーフの色を切り替える(2枚の画像をクロスフェード)
const nemuVisual = document.querySelector('.character-visual--nemu');
const nemuButtons = document.querySelectorAll('.nemu-btn');
function nemuSparkle(scarf) {
  if (reduceMotion) return;
  const wrap = document.querySelector('.nemu-wrap');
  const color = scarf === 'blue' ? '#8FB5CA' : '#E39A86';
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
}
nemuButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    nemuButtons.forEach(b => {
      const on = b === btn;
      b.classList.toggle('is-active', on);
      b.setAttribute('aria-pressed', String(on));
    });
    nemuVisual.dataset.scarf = btn.dataset.scarf;
    nemuSparkle(btn.dataset.scarf);
  });
});

// たまご(ピコとくく): 8段階で育つ。見えている間は自動で育ち、つつくと1段階すすむ
const eggStage = document.getElementById('eggStage');
const eggButton = document.getElementById('eggButton');
const eggDots = eggStage ? [...document.querySelectorAll('.egg-dots li')] : [];
const EGG_LAST = eggDots.length - 1;
const EGG_STEP_MS = 1300;   // 1段階すすむ間隔
const EGG_HOLD_MS = 2600;   // おとなになったら、少し見せてから はじめに戻る
let eggStep = 0;
let eggTimer = 0;
let eggVisible = false;
function setEggStep(n) {
  if (!eggStage) return;
  eggStep = n;
  eggStage.dataset.step = String(n);
  eggDots.forEach((li, i) => {
    li.classList.toggle('is-done', i < n);
    li.classList.toggle('is-current', i === n);
  });
  // ひびが入るまでは ぐらぐら、生まれる瞬間は ぱっと光る
  const cls = n >= 1 && n <= 3 ? 'is-wobble' : n === 4 ? 'is-burst' : '';
  eggStage.classList.remove('is-wobble', 'is-burst');
  if (cls && !reduceMotion) { void eggStage.offsetWidth; eggStage.classList.add(cls); }
}
function eggNext() {
  setEggStep(eggStep >= EGG_LAST ? 0 : eggStep + 1);
  if (eggStep === EGG_LAST) eggStage.dispatchEvent(new CustomEvent('egg-grown', { bubbles: true }));
}
function eggSchedule(delay) {
  clearTimeout(eggTimer);
  if (!eggVisible || reduceMotion) return;
  eggTimer = setTimeout(() => { eggNext(); eggSchedule(eggStep === EGG_LAST ? EGG_HOLD_MS : EGG_STEP_MS); }, delay);
}
if (eggStage) {
  setEggStep(0);
  eggStage.addEventListener('animationend', () => eggStage.classList.remove('is-wobble', 'is-burst'));
  eggButton.addEventListener('click', () => {
    eggNext();
    eggSchedule(4000); // 自分で育てている間は、自動を少し待つ
  });
  new IntersectionObserver(entries => {
    eggVisible = entries[0].isIntersecting;
    if (eggVisible) eggSchedule(900); else clearTimeout(eggTimer);
  }, { threshold: 0.5 }).observe(eggButton);
}

// ほかの色のたまご: 育たず、ばらばらのタイミングで ゆらゆら揺れるだけ
{
  const others = [...document.querySelectorAll('.egg-other')];
  if (others.length && !reduceMotion) {
    const wobble = egg => {
      egg.style.setProperty('--amp', `${6 + Math.random() * 10}deg`);
      egg.style.setProperty('--dur', `${0.7 + Math.random() * 0.6}s`);
      egg.classList.remove('is-wobble');
      void egg.offsetWidth;
      egg.classList.add('is-wobble');
      setTimeout(() => wobble(egg), 1500 + Math.random() * 4000);
    };
    others.forEach(egg => {
      egg.addEventListener('animationend', () => egg.classList.remove('is-wobble'));
      setTimeout(() => wobble(egg), Math.random() * 3000);
    });
  }
}

// スマホの横スクロール(Cast・アプリ): 前後ボタン・ドット・枚数で、左右に動かせることを見せる
function setupCarousel(list, label) {
  const cards = [...list.children];
  if (cards.length < 2) return;
  const arrow = d => `<button type="button" class="cast-arrow" aria-label="${d < 0 ? '前' : '次'}の${label}"><svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="${d < 0 ? 'm15 6-6 6 6 6' : 'm9 6 6 6-6 6'}" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg></button>`;
  const pager = document.createElement('div');
  pager.className = 'cast-pager';
  pager.innerHTML = `${arrow(-1)}<div class="cast-dots"></div><span class="cast-count" aria-live="polite"></span>${arrow(1)}`;
  list.after(pager);
  const dotsBox = pager.querySelector('.cast-dots');
  const count = pager.querySelector('.cast-count');
  const [prevBtn, nextBtn] = pager.querySelectorAll('.cast-arrow');
  cards.forEach((c, i) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.setAttribute('aria-label', `${c.querySelector('h3, h4').textContent}へ`);
    b.addEventListener('click', () => go(i));
    dotsBox.appendChild(b);
  });
  const dotBtns = [...dotsBox.children];
  let index = 0;
  // カードの左端(リストの中での位置)。offsetParent に左右されないよう、画面上の位置から求める
  const leftOf = c => c.getBoundingClientRect().left - list.getBoundingClientRect().left + list.scrollLeft;
  const go = i => {
    const c = cards[Math.max(0, Math.min(cards.length - 1, i))];
    list.scrollTo({ left: leftOf(c) - (list.clientWidth - c.offsetWidth) / 2, behavior: reduceMotion ? 'auto' : 'smooth' });
  };
  const update = () => {
    const mid = list.scrollLeft + list.clientWidth / 2;
    let best = 0, bestD = Infinity;
    cards.forEach((c, i) => { const d = Math.abs(leftOf(c) + c.offsetWidth / 2 - mid); if (d < bestD) { bestD = d; best = i; } });
    index = best;
    dotBtns.forEach((b, i) => b.classList.toggle('is-current', i === best));
    count.textContent = `${best + 1} / ${cards.length}`;
    prevBtn.disabled = best === 0;
    nextBtn.disabled = best === cards.length - 1;
    list.classList.toggle('is-end', best === cards.length - 1);
  };
  list.addEventListener('scroll', () => requestAnimationFrame(update), { passive: true });
  prevBtn.addEventListener('click', () => go(index - 1));
  nextBtn.addEventListener('click', () => go(index + 1));
  update();
  // はじめて見えたときだけ、少し左へずれて戻る動きで「横に動くよ」と伝える
  if (!reduceMotion) {
    const nudgeIO = new IntersectionObserver(entries => {
      if (!entries[0].isIntersecting || !window.matchMedia('(max-width: 760px)').matches) return;
      list.classList.add('is-nudge');
      list.addEventListener('animationend', () => list.classList.remove('is-nudge'), { once: true });
      nudgeIO.disconnect();
    }, { threshold: 0.6 });
    nudgeIO.observe(list);
  }
}
[['castList', 'キャラクター'], ['calmList', 'アプリ'], ['kidsList', 'アプリ']].forEach(([id, label]) => {
  const el = document.getElementById(id);
  if (el) setupCarousel(el, label);
});

// Cast: さわらなくても、カードが画面にしっかり入ったら「さわった」ときの動きを見せる
// (自動で動いたときは、実績や効果音には数えない)
{
  const CAST_COOLDOWN = 8000; // 同じカードは8秒あけてから、また動く
  const lastPlayed = new WeakMap();
  const PLAYS = [
    () => { pikoPoke(); setTimeout(() => pikoWave(0), 650); },
    () => { dangoPoke(); setTimeout(dangoPoke, 750); setTimeout(beeDive, 400); },
    () => {
      const card = nemuVisual?.closest('.character-card');
      card?.classList.add('is-waking');
      setTimeout(() => card?.classList.remove('is-waking'), 700);
      nemuSparkle(nemuVisual?.dataset.scarf);
    },
  ];
  const cards = [...document.querySelectorAll('.character-card')];
  if (!reduceMotion && cards.length) {
    const castIO = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (!e.isIntersecting) return;
        const now = performance.now();
        if (now - (lastPlayed.get(e.target) || -1e9) < CAST_COOLDOWN) return;
        lastPlayed.set(e.target, now);
        const idx = cards.indexOf(e.target);
        // 横に並んでいるときは、左から順に少しずつずらす
        setTimeout(() => PLAYS[idx]?.(), 250 + idx * 350);
      });
    }, { threshold: 0.6 });
    cards.forEach(c => castIO.observe(c));
  }
}

// =========================================================
// 空: スクロールに合わせて 夜→夜明け→昼→夕方→夜
// =========================================================
// ページ内の目印ごとの「時間の進み具合(0〜1)」
const SKY_ANCHORS = [
  ['hero', 0], ['about', 0.16], ['skills', 0.30], ['certifications', 0.38],
  ['projects', 0.56], ['kidsZone', 0.70], ['characters', 0.78], ['craft', 0.88],
  ['contact', 1],
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
const skyMoon = document.getElementById('skyMoon');
const skySun = document.getElementById('skySun');
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

// 目印の位置(ページの上からの距離)は、毎回測らずに覚えておく。大きさが変わったら測り直す
let skyAnchorTops = [];
function measureSkyAnchors() {
  const y = window.scrollY;
  skyAnchorTops = SKY_ANCHORS
    .map(([id, ph]) => { const el = document.getElementById(id); return el ? [el.getBoundingClientRect().top + y, ph] : null; })
    .filter(Boolean);
}
measureSkyAnchors();
window.addEventListener('load', measureSkyAnchors);
if (window.ResizeObserver) new ResizeObserver(() => { measureSkyAnchors(); requestTick(); }).observe(document.body);

// スクロール位置から「時間の進み具合(0〜1)」を求める
function skyPhase(y, vh) {
  const probe = y + vh * 0.5;
  const pts = skyAnchorTops;
  if (!pts.length || probe <= pts[0][0]) return 0;
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

// 空の描画。スクロールで決まるのは「目標の時刻」だけで、表示はそこへ なめらかに追いつく。
// (区切りごとに高さが違っても、月や色の動きが急に変わらない)
const SKY_FOLLOW_MS = 180; // 追いつく速さ(小さいほど きびきび)
const easeInOut = u => u * u * (3 - 2 * u);
let skyTarget = 0;
let skyShown = -1;
let skyRaf = 0;
let skyLast = 0;
let lastClock = '';

function placeBody(el, x, y, on) {
  el.classList.toggle('is-off', !on);
  if (on) el.style.transform = `translate3d(${x.toFixed(2)}px, ${y.toFixed(2)}px, 0)`;
}

function renderSky(ph) {
  const vh = window.innerHeight;
  let k = SKY_KEYS.length - 2;
  for (let i = 0; i < SKY_KEYS.length - 1; i++) { if (ph <= SKY_KEYS[i + 1].at) { k = i; break; } }
  const a = SKY_KEYS[k], b = SKY_KEYS[k + 1];
  const t = clamp01((ph - a.at) / (b.at - a.at));
  const bottom = mixHex(a.bottom, b.bottom, t);
  sky.style.setProperty('--sky-top', mixHex(a.top, b.top, t));
  sky.style.setProperty('--sky-bottom', bottom);
  document.body.style.setProperty('--sky-bottom', bottom);
  sky.style.setProperty('--stars', lerp(a.stars, b.stars, t).toFixed(3));
  sky.style.setProperty('--glow', mixHex(a.glow, b.glow, t));
  sky.style.setProperty('--glow-a', lerp(a.glowA, b.glowA, t).toFixed(3));

  // 月と太陽(画面に対する割合)。どちらも画面の外まで出てから消えるので、位置は飛ばない
  const W = window.innerWidth;
  const narrow = W < 600;
  if (ph < SUN_FROM) {            // 月が右下へ沈む
    const u = easeInOut(ph / SUN_FROM);
    placeBody(skyMoon, lerp(narrow ? 0.88 : 0.82, 1.12, u) * W, lerp(narrow ? 0.1 : 0.18, 1.15, u * u) * vh, true);
  } else if (ph >= SUN_TO) {      // 月が左下から昇る
    const u = easeInOut((ph - SUN_TO) / (1 - SUN_TO));
    placeBody(skyMoon, lerp(-0.12, 0.16, u) * W, lerp(1.15, 0.2, u) * vh, true);
  } else {
    placeBody(skyMoon, 0, 0, false);
  }
  if (ph > SUN_FROM && ph < SUN_TO) { // 太陽が左から昇って右へ沈む(弧を描く)
    const u = (ph - SUN_FROM) / (SUN_TO - SUN_FROM);
    placeBody(skySun, lerp(-0.12, 1.12, u) * W, (1.15 - Math.sin(Math.PI * u) * 1.0) * vh, true);
  } else {
    placeBody(skySun, 0, 0, false);
  }

  const isSun = ph > SUN_FROM && ph < SUN_TO;
  const clock = formatHour(lerp(a.hour, b.hour, t));
  if (clock !== lastClock) {
    lastClock = clock;
    skyClockText.textContent = clock;
    skyClockIcon.setAttribute('d', isSun ? SUN_PATH : MOON_PATH);
  }
}

function skyLoop(now) {
  const dt = Math.min(64, now - (skyLast || now));
  skyLast = now;
  const diff = skyTarget - skyShown;
  if (reduceMotion || skyShown < 0 || Math.abs(diff) < 0.0004) {
    skyShown = skyTarget;
  } else {
    skyShown += diff * (1 - Math.exp(-dt / SKY_FOLLOW_MS));
  }
  renderSky(skyShown);
  if (skyShown !== skyTarget) skyRaf = requestAnimationFrame(skyLoop);
  else { skyRaf = 0; skyLast = 0; }
}

scrollHooks.push((y, vh) => {
  skyTarget = skyPhase(y, vh);
  if (!skyRaf) skyRaf = requestAnimationFrame(skyLoop);
});

// =========================================================
// 流れ星: 星が見えている夜の間だけ、ときどき流れる
// (「ピコとくく」の せいちょう画面と同じ描き方: 白→あたたかい色の尾と、先の光る玉)
// =========================================================
const meteorCanvas = document.getElementById('skyMeteor');
const METEOR_MIN_GAP = 6000;   // 次の流れ星までの間隔(ミリ秒)
const METEOR_MAX_GAP = 14000;
const METEOR_NIGHT = 0.45;     // 星の見え方(--stars)がこれ以上のときだけ流す
let meteorActive = false;
if (meteorCanvas && !reduceMotion) {
  const ctx2d = meteorCanvas.getContext('2d');
  const dpr = Math.min(2, window.devicePixelRatio || 1);
  const fit = () => {
    meteorCanvas.width = Math.round(window.innerWidth * dpr);
    meteorCanvas.height = Math.round(window.innerHeight * dpr);
    ctx2d.setTransform(dpr, 0, 0, dpr, 0, 0);
  };
  fit();
  window.addEventListener('resize', fit);

  const launch = () => {
    const W = window.innerWidth, H = window.innerHeight;
    const night = parseFloat(sky.style.getPropertyValue('--stars') || '1');
    if (document.hidden || night < METEOR_NIGHT) return schedule();
    const angle = Math.PI / 5 + Math.random() * Math.PI / 7;
    const m = {
      x0: Math.random() * W * 0.65,
      y0: H * 0.02 + Math.random() * H * 0.28,
      angle,
      speed: (W * 0.55 + Math.random() * W * 0.25) / 1000,
      tail: Math.max(70, W * 0.10 + Math.random() * W * 0.07),
      dur: 650 + Math.random() * 400,
      born: performance.now(),
    };
    meteorActive = true;
    const draw = now => {
      const age = now - m.born;
      ctx2d.clearRect(0, 0, W, H);
      if (age >= m.dur) { meteorActive = false; return schedule(); }
      const alpha = Math.sin((age / m.dur) * Math.PI);
      const dist = m.speed * age;
      const sx = m.x0 + Math.cos(m.angle) * dist;
      const sy = m.y0 + Math.sin(m.angle) * dist;
      const tx = sx - Math.cos(m.angle) * m.tail;
      const ty = sy - Math.sin(m.angle) * m.tail;
      const grad = ctx2d.createLinearGradient(tx, ty, sx, sy);
      grad.addColorStop(0, 'rgba(255,255,255,0)');
      grad.addColorStop(0.6, `rgba(255,245,210,${(alpha * 0.55).toFixed(2)})`);
      grad.addColorStop(1, `rgba(255,255,255,${alpha.toFixed(2)})`);
      ctx2d.beginPath();
      ctx2d.moveTo(tx, ty);
      ctx2d.lineTo(sx, sy);
      ctx2d.strokeStyle = grad;
      ctx2d.lineWidth = 1.8;
      ctx2d.lineCap = 'round';
      ctx2d.stroke();
      ctx2d.beginPath();
      ctx2d.arc(sx, sy, 1.5 + alpha * 1.5, 0, Math.PI * 2);
      ctx2d.fillStyle = `rgba(255,255,255,${alpha.toFixed(2)})`;
      ctx2d.fill();
      requestAnimationFrame(draw);
    };
    requestAnimationFrame(draw);
  };
  const schedule = () => setTimeout(launch, METEOR_MIN_GAP + Math.random() * (METEOR_MAX_GAP - METEOR_MIN_GAP));
  setTimeout(launch, 3000); // 最初は3秒後
}

// =========================================================
// セクションの背景に、大きな白抜きの番号(スクロールで少しだけ ゆっくり動く)
// =========================================================
const sectionNums = [];
document.querySelectorAll('.section-kicker').forEach(k => {
  const num = document.createElement('span');
  num.className = 'section-num';
  num.setAttribute('aria-hidden', 'true');
  num.textContent = k.textContent.trim();
  k.parentElement.prepend(num);
  sectionNums.push(num);
});
if (!reduceMotion) {
  scrollHooks.push((y, vh) => {
    sectionNums.forEach(n => {
      const r = n.parentElement.getBoundingClientRect();
      if (r.bottom < -200 || r.top > vh + 200) return;
      n.style.setProperty('--num-y', `${((r.top - vh * 0.3) * -0.12).toFixed(1)}px`);
    });
  });
}

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

// =========================================================
// How I Build
// =========================================================
// AI駆動開発のサイクル: 画面に入っている間、1つずつ順に光らせる
const cycleSteps = [...document.querySelectorAll('.cycle-step')];
if (cycleSteps.length) {
  let step = -1, cycleTimer = null;
  const advance = () => {
    step = (step + 1) % cycleSteps.length;
    cycleSteps.forEach((el, i) => {
      el.classList.toggle('is-active', i === step);
      el.classList.toggle('is-done', i < step);
    });
  };
  if (reduceMotion) {
    cycleSteps.forEach(el => el.classList.add('is-done'));
  } else {
    new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting && !cycleTimer) { advance(); cycleTimer = setInterval(advance, 1800); }
        if (!e.isIntersecting && cycleTimer) { clearInterval(cycleTimer); cycleTimer = null; }
      });
    }, { threshold: 0.4 }).observe(document.getElementById('cycle'));
  }
  // 段を押すと、その段で止めずに そこから続ける
  cycleSteps.forEach((el, i) => el.addEventListener('click', () => { step = i - 1; advance(); }));
}

// 設計の見どころ: タブ(矢印キーでも切り替え)
const craftTabs = [...document.querySelectorAll('.craft-tabs [role="tab"]')];
const craftIndicator = document.querySelector('.craft-tab-indicator');
function moveCraftIndicator(tab) {
  craftIndicator.style.width = `${tab.offsetWidth}px`;
  craftIndicator.style.height = `${tab.offsetHeight}px`;
  craftIndicator.style.transform = `translate(${tab.offsetLeft}px, ${tab.offsetTop}px)`;
}
function selectCraftTab(tab, focus) {
  craftTabs.forEach(t => {
    const on = t === tab;
    t.setAttribute('aria-selected', String(on));
    t.tabIndex = on ? 0 : -1;
    document.getElementById(t.getAttribute('aria-controls')).hidden = !on;
  });
  moveCraftIndicator(tab);
  if (focus) tab.focus();
  tab.dispatchEvent(new CustomEvent('craft-tab', { bubbles: true }));
}
craftTabs.forEach((tab, i) => {
  tab.addEventListener('click', () => selectCraftTab(tab));
  tab.addEventListener('keydown', e => {
    const d = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
    if (!d) return;
    e.preventDefault();
    selectCraftTab(craftTabs[(i + d + craftTabs.length) % craftTabs.length], true);
  });
});
if (craftTabs.length) {
  moveCraftIndicator(craftTabs[0]);
  window.addEventListener('resize', () => moveCraftIndicator(craftTabs.find(t => t.getAttribute('aria-selected') === 'true')));
  document.fonts?.ready.then(() => moveCraftIndicator(craftTabs.find(t => t.getAttribute('aria-selected') === 'true')));
}

// コードの簡単な色分け(コメント・文字列・数字・キーワード)
document.querySelectorAll('.code-card code').forEach(code => {
  const src = code.textContent;
  const esc = t => t.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const re = /(\/\/[^\n]*)|('[^']*')|\b(export|interface|const|function|return|Promise|string|void|null)\b|\b(\d+(?:\.\d+)?)\b/g;
  let out = '', last = 0, m;
  while ((m = re.exec(src))) {
    out += esc(src.slice(last, m.index));
    const cls = m[1] ? 'tok-c' : m[2] ? 'tok-s' : m[3] ? 'tok-k' : 'tok-n';
    out += `<span class="${cls}">${esc(m[0])}</span>`;
    last = re.lastIndex;
  }
  code.innerHTML = out + esc(src.slice(last));
});

// 開発ログ: 読み進めた分だけ線が伸び、節目が灯る
const logTrack = document.getElementById('logTrack');
if (logTrack) {
  const logItems = [...logTrack.querySelectorAll('.log-item')];
  scrollHooks.push((y, vh) => {
    const r = logTrack.getBoundingClientRect();
    // 線の始まりが画面の下80%に来たら伸び始め、40%で伸びきる
    const t = clamp01((vh * 0.85 - r.top) / (vh * 0.45));
    logTrack.style.setProperty('--lt', t.toFixed(3));
    const lit = Math.round(t * (logItems.length - 1));
    logItems.forEach((li, i) => li.classList.toggle('is-lit', i <= lit && t > 0));
  });
  // タッチ端末では、点を押すと説明を開く
  logItems.forEach(li => li.querySelector('.log-dot').addEventListener('click', () => {
    const open = !li.classList.contains('is-open');
    logItems.forEach(x => x.classList.remove('is-open'));
    li.classList.toggle('is-open', open);
  }));
  // 「v155」の数え上げ
  const lv = document.querySelector('.devlog-level [data-count]');
  if (lv) {
    lv.textContent = reduceMotion ? lv.dataset.count : '1';
    new IntersectionObserver((entries, obs) => {
      if (entries[0].isIntersecting) { countUp(lv); obs.disconnect(); }
    }, { threshold: 0.6 }).observe(lv);
  }
}


// =========================================================
// スマホ: 長い部分の折りたたみ(zutsurun の設定画面と同じ手ざわり)
//  - 行のどこを押しても開閉。右の丸ボタンは1回転して ⌄ と ✕ が入れ替わる
//  - 中身は高さ 0 ⇔ 中身の高さ を 0.36秒でなめらかに変える(下の要素も一緒に動く)
//  - PCでは折りたたまず、いつも全部見せる
// =========================================================
const foldMq = window.matchMedia('(max-width: 760px)');
const FOLD_MS = 360;
const CHEVRON = '<svg class="spin-closed" viewBox="0 0 24 24" width="16" height="16"><path d="m6 9 6 6 6-6" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
const CROSS = '<svg class="spin-open" viewBox="0 0 24 24" width="16" height="16"><path d="M6 6l12 12M18 6 6 18" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/></svg>';

function foldSummary(el) {
  if (el.dataset.foldSummary) return el.dataset.foldSummary;
  if (el.matches('.timeline')) {
    // 年の数字だけを読む(横の小さな期間の文字は含めない)
    const years = [...el.querySelectorAll('.timeline-year')].map(y => y.firstChild.textContent.trim());
    return `${years[0]} 〜 ${years[years.length - 1]}・${years.length}件`;
  }
  if (el.matches('.skills-grid')) {
    return [...el.querySelectorAll('li')].slice(0, 4).map(li => li.textContent.trim()).join(' / ') + ' ほか';
  }
  if (el.matches('.cert-rows')) {
    const years = [...el.querySelectorAll('.cert-year')].map(y => y.textContent.trim());
    return `${years[0]} 〜 ${years[years.length - 1]}・${years.length}件`;
  }
  if (el.matches('.cycle')) return [...el.querySelectorAll('h4')].map(h => h.textContent.trim()).join(' → ');
  if (el.matches('.case-detail')) {
    const r = el.querySelectorAll('.case-flow dd');
    return r.length ? r[r.length - 1].textContent.trim() : '';
  }
  return '';
}

const folds = [];
document.querySelectorAll('[data-fold]').forEach((el, i) => {
  const body = document.createElement('div');
  body.className = 'fold-body';
  body.id = `fold-${i}`;
  el.before(body);
  body.appendChild(el);
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'fold-toggle';
  btn.setAttribute('aria-expanded', 'false');
  btn.setAttribute('aria-controls', body.id);
  const summary = foldSummary(el);
  btn.innerHTML = `<span class="fold-text"><span class="fold-label">${el.dataset.fold}</span>${summary ? `<span class="fold-summary">${summary}</span>` : ''}</span>`
    + `<span class="row-open-btn" aria-hidden="true"><span class="spin-icon">${CHEVRON}${CROSS}</span></span>`;
  body.before(btn);
  const f = { btn, body, open: false, timer: 0 };
  folds.push(f);
  btn.addEventListener('click', () => setFold(f, !f.open));
});

function setFold(f, open, instant) {
  f.open = open;
  f.btn.setAttribute('aria-expanded', String(open));
  f.btn.classList.toggle('is-open', open);
  f.body.classList.toggle('is-open', open);
  f.body.inert = !open;
  clearTimeout(f.timer);
  if (instant || reduceMotion) {
    f.body.style.height = open ? '' : '0px';
    return;
  }
  // 今の高さ → 目標の高さ へ動かし、開き終わったら auto に戻す(中身が変わっても切れない)
  const from = f.body.getBoundingClientRect().height;
  f.body.style.height = `${from}px`;
  void f.body.offsetHeight;
  f.body.style.height = open ? `${f.body.scrollHeight}px` : '0px';
  if (open) {
    f.timer = setTimeout(() => { f.body.style.height = ''; requestTick(); }, FOLD_MS + 20);
    // 開いた中身の「ふわっと出る」演出を、すぐに見せる
    f.body.querySelectorAll('.reveal').forEach(el => el.classList.add('is-visible'));
  } else {
    f.timer = setTimeout(requestTick, FOLD_MS + 20);
  }
}

function applyFoldMode() {
  folds.forEach(f => {
    if (foldMq.matches) {
      setFold(f, false, true);
      f.body.classList.add('is-foldable');
    } else {
      f.body.classList.remove('is-foldable');
      f.body.inert = false;
      f.body.style.height = '';
    }
  });
  requestTick();
}
applyFoldMode();
foldMq.addEventListener?.('change', applyFoldMode);

// =========================================================
// スマホ: 下のナビ(今いるセクションのチップ + 次へボタン)
// =========================================================
const dock = document.getElementById('sectionDock');
const dockChips = document.getElementById('dockChips');
const dockNext = document.getElementById('dockNext');
const dockNextName = document.getElementById('dockNextName');
if (dock) {
  sections.forEach(sec => {
    const a = document.createElement('a');
    a.href = `#${sec.id}`;
    a.className = 'dock-chip';
    a.dataset.target = sec.id;
    a.textContent = sec.dataset.label || sec.id;
    dockChips.appendChild(a);
  });
  const chips = [...dockChips.querySelectorAll('.dock-chip')];
  let dockId = null;
  const updateDock = () => {
    if (currentId === dockId) return;
    dockId = currentId;
    const idx = sections.findIndex(s => s.id === currentId);
    chips.forEach((c, i) => {
      c.classList.toggle('is-current', i === idx);
      c.classList.toggle('is-seen', i < idx);
      if (i === idx) c.setAttribute('aria-current', 'location'); else c.removeAttribute('aria-current');
    });
    const cur = chips[idx];
    if (cur) {
      // 今のチップが真ん中に来るように、横にすべらせる
      dockChips.scrollTo({ left: cur.offsetLeft - (dockChips.clientWidth - cur.offsetWidth) / 2, behavior: reduceMotion ? 'auto' : 'smooth' });
    }
    // 最後のセクションでは「次へ」は役目を終えるので、ふわっと消す
    const next = sections[idx + 1];
    dockNext.classList.toggle('is-gone', !next);
    dockNext.tabIndex = next ? 0 : -1;
    if (next) {
      dockNextName.textContent = next.dataset.label || next.id;
      dockNext.setAttribute('aria-label', `次のセクション ${next.dataset.label} へ`);
    }
  };
  scrollHooks.push(updateDock);
  // 「先頭へ」は、少しスクロールしたら左下に いつも出しておく
  const dockTop = document.getElementById('dockTop');
  // 最初の画面(ヒーロー)では、下のメニューと「次へ」を引っこめて、ヒーローのボタンを見せる
  scrollHooks.push((y, vh) => document.documentElement.classList.toggle('at-hero', y < vh * 0.35));
  scrollHooks.push((y, vh) => dockTop?.classList.toggle('is-shown', y > vh * 0.6));
  // フッターに「先頭へもどる」があるので、見えている間は浮いている方を引っこめる
  const footerEl = document.querySelector('.site-footer');
  if (dockTop && footerEl && 'IntersectionObserver' in window) {
    new IntersectionObserver(([e]) => dockTop.classList.toggle('is-footer', e.isIntersecting)).observe(footerEl);
  }
  dockTop?.addEventListener('click', () => window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' }));
  dockNext.addEventListener('click', () => {
    const idx = sections.findIndex(s => s.id === currentId);
    sections[idx + 1]?.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
  });
}

onScroll();
